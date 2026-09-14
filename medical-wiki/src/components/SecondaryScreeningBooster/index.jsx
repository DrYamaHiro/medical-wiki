import React, { useState } from 'react';
import styles from './styles.module.css';
import {
  ACTION, SYMPTOMS, TREATMENTS, DEPTS, CARDIAC_ITEMS, CAROTID_ITEMS, CLASS_LABEL, OPINION_TEMPLATES,
  evaluate, buildChartText, buildLabelText, buildScriptText, buildNurseText, buildReferralText, buildOpinionText,
} from './screeningData.js';

const INITIAL_BG = {
  gender: '', age: '', kakaritsuke: '', kakaritsukeName: '', treatments: [], treatmentNote: '',
  symptoms: [], secondaryHistory: '', work: '', sangyoi: false, remote: false,
};
const INITIAL_LABS = {
  source: 'primary', sbp: '', dbp: '', ldl: '', hdl: '', tg: '', nonhdl: '', fpg: '', a1c: '', ualb: '', bmi: '', waist: '', ketone: false,
};
const INITIAL_DEST = { name: '', dept: '', undecided: false };

function Chip({ active, abnormal, warn, indiv, onClick, children, title }) {
  const cls = [styles.choiceChip];
  if (abnormal) cls.push(styles.choiceChipAbnormal);
  else if (warn) cls.push(styles.choiceChipWarn);
  else if (indiv) cls.push(styles.choiceChipIndiv);
  if (active) {
    if (abnormal) cls.push(styles.choiceChipAbnormalActive);
    else if (warn) cls.push(styles.choiceChipWarnActive);
    else if (indiv) cls.push(styles.choiceChipIndivActive);
    else cls.push(styles.choiceChipActive);
  }
  return (
    <button type="button" className={cls.join(' ')} onClick={onClick} title={title || ''} aria-pressed={!!active}>{children}</button>
  );
}

function ClsBadge({ cls }) {
  if (!cls) return null;
  const key = `cls${cls}`;
  return <span className={`${styles.clsBadge} ${styles[key] || styles.clsInfo}`}>{cls} {CLASS_LABEL[cls]}</span>;
}

function BpBadge({ bp }) {
  if (!bp) return null;
  const g = bp.grade;
  const key = g >= 4 ? 'clsD' : g === 3 ? 'clsC' : g === 2 ? 'clsB' : 'clsA';
  return <span className={`${styles.clsBadge} ${styles[key]}`}>{bp.label}</span>;
}

// 数値とカテゴリの整合: 数値を消せばカテゴリも消す。カテゴリを手で変えれば食い違う数値は消す
function ExamItemRow({ item, st, hasKakaritsuke, onChange }) {
  const s = st || {};
  const selectedIdxs = item.multi ? (s.multi || []) : (s.v === null || s.v === undefined ? [] : [s.v]);
  const selectedOpts = selectedIdxs.map((i) => item.options[i]).filter(Boolean);
  const needKnown = selectedOpts.some((o) => o.action >= ACTION.INDIVIDUAL);
  const notes = selectedOpts.filter((o) => o.note).map((o) => o.note);
  const canClassify = !!(item.numeric && item.numeric.classify);
  let numAbnormal = false;
  let mismatch = false;
  if (canClassify && s.num !== '' && s.num !== undefined) {
    const n = parseFloat(s.num);
    if (Number.isFinite(n)) {
      const c = item.numeric.classify(n);
      numAbnormal = c > 0;
      mismatch = s.v !== null && s.v !== undefined && s.v !== c;
    }
  }
  return (
    <div className={styles.itemRow}>
      <div className={styles.itemLabel}>
        <span>{item.label}</span>
        {(item.hint || (item.numeric && item.numeric.hint)) && (
          <span className={styles.itemHint}>{[item.hint, item.numeric && item.numeric.hint].filter(Boolean).join('。')}</span>
        )}
      </div>
      <div className={styles.itemValueWrap}>
        <div className={styles.itemValue}>
          {item.numeric && (
            <>
              <input
                type="number"
                step="any"
                aria-label={`${item.label} 数値`}
                className={`${styles.numInput} ${numAbnormal ? styles.numInputAbnormal : ''}`}
                value={s.num || ''}
                placeholder={item.numeric.placeholder}
                onChange={(e) => {
                  const val = e.target.value;
                  const patch = { num: val };
                  if (canClassify) {
                    const n = parseFloat(val);
                    patch.v = Number.isFinite(n) ? item.numeric.classify(n) : null;
                  }
                  onChange(patch);
                }}
              />
              <span className={styles.unit}>{item.numeric.unit}</span>
            </>
          )}
          {item.options.map((opt, idx) => {
            const active = selectedIdxs.includes(idx);
            return (
              <Chip
                key={opt.v}
                active={active}
                abnormal={opt.action >= ACTION.CLINIC}
                warn={!!opt.warn}
                indiv={opt.action === ACTION.INDIVIDUAL}
                title={opt.note || ''}
                onClick={() => {
                  if (item.multi) {
                    const cur = s.multi || [];
                    onChange({ multi: active ? cur.filter((i) => i !== idx) : [...cur, idx] });
                    return;
                  }
                  const patch = { v: active ? null : idx };
                  if (canClassify && s.num) {
                    const n = parseFloat(s.num);
                    if (!Number.isFinite(n) || item.numeric.classify(n) !== patch.v) patch.num = '';
                  }
                  onChange(patch);
                }}
              >
                {opt.v}
              </Chip>
            );
          })}
        </div>
        {mismatch && <p className={styles.noteText}>数値と選択カテゴリが一致しません。数値を入れ直すか、カテゴリを選び直してください</p>}
        {item.sub && selectedOpts.some((o) => o.action > 0) && (
          <div className={styles.itemValue}>
            <span className={styles.itemHint}>{item.sub.label}:</span>
            {item.sub.options.map((o) => {
              const cur = s.sub || [];
              const active = cur.includes(o);
              return (
                <Chip key={o} active={active} onClick={() => onChange({ sub: active ? cur.filter((x) => x !== o) : [...cur, o] })}>{o}</Chip>
              );
            })}
          </div>
        )}
        {needKnown && (
          <div className={styles.knownRow}>
            {hasKakaritsuke ? (
              <>
                <span>この所見は:</span>
                <button
                  type="button"
                  className={`${styles.knownChip} ${s.known !== 'known' ? styles.knownChipUnknownActive : ''}`}
                  onClick={() => onChange({ known: 'unknown' })}
                  aria-pressed={s.known !== 'known'}
                >未知（初めての指摘）</button>
                <button
                  type="button"
                  className={`${styles.knownChip} ${s.known === 'known' ? styles.knownChipKnownActive : ''}`}
                  onClick={() => onChange({ known: 'known' })}
                  aria-pressed={s.known === 'known'}
                >既知（かかりつけで通院中）</button>
              </>
            ) : (
              <span>かかりつけ医なし → 「未知」として判定（チャートの未知列を適用）</span>
            )}
          </div>
        )}
        {notes.map((n) => (
          <p key={n} className={styles.noteText}>備考: {n}</p>
        ))}
      </div>
    </div>
  );
}

function OutBlock({ id, title, text, copied, onCopy, extra }) {
  return (
    <div className={styles.outBlock}>
      <div className={styles.outBlockHead}>
        <span>{title}</span>
        <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {extra}
          <button
            type="button"
            className={`${styles.copyBtn} ${copied === id ? styles.copied : ''}`}
            onClick={() => onCopy(id, text)}
            disabled={!text}
          >
            {copied === id ? 'コピーしました' : 'コピー'}
          </button>
        </span>
      </div>
      <pre className={styles.outPre}>{text || '（該当なし）'}</pre>
    </div>
  );
}

// かかりつけ有無を変えたら、各所見の既知/未知は再確認させる
function stripKnown(exam) {
  const next = {};
  Object.entries(exam).forEach(([id, st]) => {
    const copy = { ...st };
    delete copy.known;
    next[id] = copy;
  });
  return next;
}

export default function SecondaryScreeningBooster() {
  const [bg, setBg] = useState(INITIAL_BG);
  const [labs, setLabs] = useState(INITIAL_LABS);
  const [cardiac, setCardiac] = useState({});
  const [carotid, setCarotid] = useState({});
  const [cFree, setCFree] = useState('');
  const [kFree, setKFree] = useState('');
  const [override, setOverride] = useState('auto');
  const [timing, setTiming] = useState('auto');
  const [dest, setDest] = useState(INITIAL_DEST);
  const [includeEcho, setIncludeEcho] = useState(true);
  const [copied, setCopied] = useState('');

  const state = { bg, labs, cardiac, carotid, cFree, kFree, override, timing, dest };
  const ev = evaluate(state);
  const hasKakaritsuke = ev.hasKakaritsuke;

  const chartText = buildChartText(ev, state, { includeEcho });
  const labelText = buildLabelText(ev);
  const scriptText = buildScriptText(ev, state);
  const nurseText = buildNurseText(ev);
  const referralText = buildReferralText(ev, state);
  const opinionText = buildOpinionText(ev);

  const patchBg = (p) => setBg((prev) => ({ ...prev, ...p }));
  const patchLabs = (p) => setLabs((prev) => ({ ...prev, ...p }));
  const toggleIn = (arr, id) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const patchExam = (setter) => (id, patch) => setter((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  const patchCardiac = patchExam(setCardiac);
  const patchCarotid = patchExam(setCarotid);

  const setKakaritsuke = (val) => {
    if (val !== bg.kakaritsuke) {
      setCardiac((prev) => stripKnown(prev));
      setCarotid((prev) => stripKnown(prev));
    }
    patchBg({ kakaritsuke: val });
  };

  const setAllNormal = (items, setter) => {
    const next = {};
    items.forEach((it) => { next[it.id] = it.multi ? { multi: [] } : { v: 0 }; });
    setter(next);
  };

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      alert('クリップボードへのコピーに失敗しました。テキストを手動で選択してコピーしてください。');
    }
  };

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setBg(INITIAL_BG); setLabs(INITIAL_LABS); setCardiac({}); setCarotid({});
    setCFree(''); setKFree(''); setOverride('auto'); setTiming('auto'); setDest(INITIAL_DEST);
  };

  const d = ev.decision;
  const levelPanel = { hospital: styles.dHospital, clinic: styles.dClinic, individual: styles.dIndividual, pending: styles.dPending, none: styles.dNone }[d.level];
  const levelTag = { hospital: styles.tHospital, clinic: styles.tClinic, individual: styles.tIndividual, pending: styles.tPending, none: styles.tNone }[d.level];
  const showTiming = ev.unknownHospital.length > 0 || ev.labs.bpGrade >= 5 || ev.urgentSymptoms.length > 0 || override === 'same_day';
  const isFemale = bg.gender === 'female';
  const genderSet = ev.genderSet;

  const labField = (key, label, unit, badge, extraProps = {}) => (
    <div className={styles.labField}>
      <label htmlFor={`ssb-${key}`}>{label}</label>
      <input
        id={`ssb-${key}`}
        type="number"
        step="any"
        className={styles.numInput}
        value={labs[key]}
        onChange={(e) => patchLabs({ [key]: e.target.value })}
        {...extraProps}
      />
      <span className={styles.unit}>{unit}</span>
      {badge}
    </div>
  );

  const eligCell = (label, v) => (
    <span className={v === true ? styles.eligHit : v === false ? styles.eligMiss : styles.eligNa}>
      {label}: {v === true ? '該当' : v === false ? '非該当' : '未入力'}
    </span>
  );

  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>二次健診 Booster</p>
          <p className={styles.subtitle}>労災二次健康診断: 技師伝達のエコー所見と一次健診値から、紹介状の要否・ラベル・患者説明・保健師申し送りを自動生成</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.resetBtn} onClick={reset} type="button">クリア</button>
        </div>
      </div>

      {/* 0. 受診者背景 */}
      <div className={`${styles.section} ${styles.sectionBg}`}>
        <h4 className={styles.sectionTitle}><span className={styles.phaseBadge}>0</span>受診者背景（導入の問診で確認）</h4>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}><span>性別・年齢</span><span className={styles.itemHint}>性別は腹囲基準、年齢は心房細動の備考（75歳）に反映</span></div>
          <div className={styles.itemValue}>
            <Chip active={bg.gender === 'male'} onClick={() => patchBg({ gender: bg.gender === 'male' ? '' : 'male' })}>男性</Chip>
            <Chip active={bg.gender === 'female'} onClick={() => patchBg({ gender: bg.gender === 'female' ? '' : 'female' })}>女性</Chip>
            <input type="number" aria-label="年齢" className={styles.numInput} placeholder="年齢" value={bg.age} onChange={(e) => patchBg({ age: e.target.value })} />
            <span className={styles.unit}>歳</span>
          </div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}><span>かかりつけ医</span><span className={styles.itemHint}>「通院中や治療中の病気・内服薬はありますか？」</span></div>
          <div className={styles.itemValueWrap}>
            <div className={styles.itemValue}>
              <Chip active={bg.kakaritsuke === 'none'} onClick={() => setKakaritsuke('none')}>なし</Chip>
              <Chip active={bg.kakaritsuke === 'yes'} onClick={() => setKakaritsuke('yes')}>あり</Chip>
              {bg.kakaritsuke === 'yes' && (
                <input type="text" aria-label="かかりつけ医療機関名" className={styles.textInput} placeholder="かかりつけ医療機関名（例: ○○クリニック）" value={bg.kakaritsukeName} onChange={(e) => patchBg({ kakaritsukeName: e.target.value })} />
              )}
            </div>
            {bg.kakaritsuke === '' && <p className={styles.noteText}>未選択の間は「かかりつけ医なし」として判定します</p>}
            {bg.kakaritsuke === 'yes' && <p className={styles.noteText}>かかりつけの有無を変更すると、各所見の「未知/既知」は再確認のためリセットされます</p>}
          </div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}><span>治療中の疾患</span><span className={styles.itemHint}>HT・DM・HDL（高血圧・糖尿病・脂質異常症）はカルテ4項目に、その他は別行に出力</span></div>
          <div className={styles.itemValueWrap}>
            <div className={styles.itemValue}>
              {TREATMENTS.map((t) => (
                <Chip key={t.id} active={bg.treatments.includes(t.id)} onClick={() => patchBg({ treatments: toggleIn(bg.treatments, t.id) })}>{t.label}</Chip>
              ))}
            </div>
            {bg.treatments.length > 0 && (
              <input type="text" aria-label="治療内容" className={styles.textInput} placeholder="治療内容（例: 高血圧治療: アムロジピン5mg）" value={bg.treatmentNote} onChange={(e) => patchBg({ treatmentNote: e.target.value })} />
            )}
          </div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}><span>自覚症状</span><span className={styles.itemHint}>赤の項目は緊急性の警告と当日紹介の提案に影響</span></div>
          <div className={styles.itemValue}>
            <Chip active={bg.symptoms.length === 0} onClick={() => patchBg({ symptoms: [] })}>なし</Chip>
            {SYMPTOMS.map((s) => (
              <Chip key={s.id} active={bg.symptoms.includes(s.id)} abnormal={!!s.urgent} warn={!s.urgent} onClick={() => patchBg({ symptoms: toggleIn(bg.symptoms, s.id) })}>{s.label}</Chip>
            ))}
          </div>
        </div>
        <div className={styles.itemRow}>
          <div className={styles.itemLabel}><span>その他</span></div>
          <div className={styles.itemValue}>
            <span className={styles.itemHint}>二次検査歴:</span>
            <Chip active={bg.secondaryHistory === 'first'} onClick={() => patchBg({ secondaryHistory: bg.secondaryHistory === 'first' ? '' : 'first' })}>初回</Chip>
            <Chip active={bg.secondaryHistory === 'repeat'} onClick={() => patchBg({ secondaryHistory: bg.secondaryHistory === 'repeat' ? '' : 'repeat' })}>受診歴あり</Chip>
            <span className={styles.itemHint} style={{ marginLeft: '0.6rem' }}>就業状況:</span>
            <Chip active={bg.work === 'working'} onClick={() => patchBg({ work: bg.work === 'working' ? '' : 'working' })}>就業中</Chip>
            <Chip active={bg.work === 'leave'} warn onClick={() => patchBg({ work: bg.work === 'leave' ? '' : 'leave' })}>休職中</Chip>
            <label className={styles.checkLabel} style={{ marginLeft: '0.6rem' }}>
              <input type="checkbox" checked={bg.sangyoi} onChange={(e) => patchBg({ sangyoi: e.target.checked })} />産業医判定で対象
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={bg.remote} onChange={(e) => patchBg({ remote: e.target.checked })} />遠隔（オンライン）診察
            </label>
          </div>
        </div>
      </div>

      {/* 1. 一次健診結果 */}
      <div className={`${styles.section} ${styles.sectionLab}`}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.phaseBadge}>1</span>一次健診結果（保健指導表で確認）
          <span className={styles.sectionTitleNote}>判定は人間ドック協会基準（A〜D）、血圧は JSH2025 分類</span>
        </h4>
        <div className={styles.itemValue} style={{ marginBottom: '0.6rem' }}>
          <span className={styles.itemHint}>入力する値:</span>
          <Chip active={labs.source === 'primary'} onClick={() => patchLabs({ source: 'primary' })}>一次健診値（診察当日）</Chip>
          <Chip active={labs.source === 'secondary'} onClick={() => patchLabs({ source: 'secondary' })}>二次健診の採血値（後日・結果表作成時）</Chip>
        </div>
        <div className={styles.labGrid}>
          {labField('sbp', '収縮期血圧', 'mmHg', <BpBadge bp={ev.labs.bp} />, { placeholder: '130' })}
          {labField('dbp', '拡張期血圧', 'mmHg', null, { placeholder: '85' })}
          {labField('ldl', 'LDL-C', 'mg/dL', <ClsBadge cls={(ev.labs.labClasses.find((c) => c.key === 'LDL-C') || {}).cls} />, { placeholder: '140' })}
          {labField('hdl', 'HDL-C', 'mg/dL', <ClsBadge cls={(ev.labs.labClasses.find((c) => c.key === 'HDL-C') || {}).cls} />, { placeholder: '40' })}
          {labField('tg', 'TG', 'mg/dL', <ClsBadge cls={(ev.labs.labClasses.find((c) => c.key === 'TG') || {}).cls} />, { placeholder: '150' })}
          {labField('nonhdl', 'non-HDL-C', 'mg/dL', <ClsBadge cls={(ev.labs.labClasses.find((c) => c.key === 'non-HDL-C') || {}).cls} />, { placeholder: '任意' })}
          {labField('fpg', '空腹時血糖', 'mg/dL', <ClsBadge cls={ev.labs.glu} />, { placeholder: '100' })}
          {labField('a1c', 'HbA1c', '%', null, { placeholder: '5.6' })}
          {labField('ualb', 'アルブミン尿', 'mg/gCr', <ClsBadge cls={(ev.labs.labClasses.find((c) => c.key === 'アルブミン尿') || {}).cls} />, { placeholder: '任意' })}
          {labField('bmi', 'BMI', '', ev.labs.bmiCls ? <span className={`${styles.clsBadge} ${ev.labs.bmi >= 25 ? styles.clsC : styles.clsA}`}>{ev.labs.bmiCls}</span> : null, { placeholder: '25' })}
          {labField('waist', '腹囲', 'cm', null, { placeholder: genderSet ? (isFemale ? '90' : '85') : '性別を先に選択' })}
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={labs.ketone} onChange={(e) => patchLabs({ ketone: e.target.checked })} />尿ケトン体 中等度以上
          </label>
        </div>
        <div className={styles.eligRow}>
          <strong>労災二次健診の対象基準（一次健診 4項目すべて異常）:</strong>
          {eligCell('血圧 130/85以上', ev.elig.bp)}
          {eligCell('脂質 LDL140以上/HDL40未満/TG150以上', ev.elig.lipid)}
          {eligCell('血糖 FPG100以上/HbA1c5.6以上', ev.elig.glu)}
          {eligCell(`肥満 BMI25以上/腹囲${genderSet ? (isFemale ? '90' : '85') + 'cm' : '(男85・女90)cm'}以上`, ev.elig.obesity)}
          <strong>{ev.eligCount}/4 該当{ev.eligUnknown ? `（${ev.eligUnknown}項目は未入力）` : ''}{bg.sangyoi ? '、産業医判定あり' : ''}</strong>
        </div>
        {ev.labs.bloodReasons.length > 0 && (
          <p className={styles.infoNote}>治療・フォローの目安: {ev.labs.bloodReasons.join(' ／ ')}（エコー正常でも、採血結果で治療・フォローが必要なら紹介状を作成）</p>
        )}
      </div>

      {/* 2. 心エコー */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.phaseBadge}>2</span>心エコー（技師伝達をチャート項目で入力）
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button type="button" className={styles.toolbarBtn} onClick={() => setAllNormal(CARDIAC_ITEMS, setCardiac)}>全て正常</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => setCardiac({})}>クリア</button>
          </span>
        </h4>
        {CARDIAC_ITEMS.map((item) => (
          <ExamItemRow key={item.id} item={item} st={cardiac[item.id]} hasKakaritsuke={hasKakaritsuke} onChange={(p) => patchCardiac(item.id, p)} />
        ))}
        <textarea className={styles.freeArea} rows={2} aria-label="心エコー 自由記載" placeholder="心エコー 自由記載（技師コメント・追加所見など）" value={cFree} onChange={(e) => setCFree(e.target.value)} />
      </div>

      {/* 3. 頸部エコー */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.phaseBadge}>3</span>頸部エコー（技師伝達をチャート項目で入力）
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
            <button type="button" className={styles.toolbarBtn} onClick={() => setAllNormal(CAROTID_ITEMS, setCarotid)}>全て正常</button>
            <button type="button" className={styles.toolbarBtn} onClick={() => setCarotid({})}>クリア</button>
          </span>
        </h4>
        {CAROTID_ITEMS.map((item) => (
          <ExamItemRow key={item.id} item={item} st={carotid[item.id]} hasKakaritsuke={hasKakaritsuke} onChange={(p) => patchCarotid(item.id, p)} />
        ))}
        <textarea className={styles.freeArea} rows={2} aria-label="頸部エコー 自由記載" placeholder="頸部エコー 自由記載（技師コメント・追加所見など）" value={kFree} onChange={(e) => setKFree(e.target.value)} />
      </div>

      {/* 4. 判定 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}><span className={styles.phaseBadge}>4</span>判定: 紹介状の要否と紹介先</h4>
        {ev.alert && (
          <div className={styles.alertBar} role="alert">警告: {ev.alert}</div>
        )}
        <div className={`${styles.decisionPanel} ${levelPanel}`}>
          <div className={styles.decisionHead}>
            <span className={`${styles.decisionTag} ${levelTag}`}>{d.short}</span>
            <p className={styles.decisionTitle}>{d.label}</p>
          </div>
          {d.targetDetail && <p className={styles.noteText}>紹介先の種別: {d.targetDetail}{ev.depts.length ? ` ／ 推奨診療科: ${ev.depts.join('・')}` : ''}</p>}
          <ul className={styles.reasonList}>
            {d.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          {ev.knownList.length > 0 && (
            <p className={styles.noteText}>既知（通院中）として通院継続扱い: {ev.knownList.map((f) => `${f.label} ${f.value}`).join('、')}</p>
          )}
        </div>

        {showTiming && (
          <div className={styles.subRow}>
            <span className={styles.subLabel}>発行タイミング</span>
            <Chip active={timing === 'auto'} onClick={() => setTiming('auto')}>自動（症状で判断）</Chip>
            <Chip active={timing === 'same_day'} abnormal onClick={() => setTiming('same_day')}>当日</Chip>
            <Chip active={timing === 'later'} onClick={() => setTiming('later')}>後日</Chip>
          </div>
        )}
        <div className={styles.subRow}>
          <span className={styles.subLabel}>最終判断（医師）</span>
          <Chip active={override === 'auto'} onClick={() => setOverride('auto')}>自動判定に従う</Chip>
          <Chip active={override === 'same_day'} abnormal onClick={() => setOverride('same_day')}>当日紹介状</Chip>
          <Chip active={override === 'later'} warn onClick={() => setOverride('later')}>後日紹介状</Chip>
          <Chip active={override === 'pending'} onClick={() => setOverride('pending')}>採血結果次第</Chip>
          <Chip active={override === 'none'} onClick={() => setOverride('none')}>紹介状なし</Chip>
        </div>
        {(d.referral || d.type === 'pending_blood') && (
          <div className={styles.subRow}>
            <span className={styles.subLabel}>紹介先</span>
            <input type="text" aria-label="紹介先医療機関名" className={styles.textInput} placeholder={hasKakaritsuke && d.target === 'クリニック' ? 'かかりつけ医療機関名（受診者と相談）' : '医療機関名（受診者と相談。土曜AM診療・通いやすさを確認）'} value={dest.name} onChange={(e) => setDest({ ...dest, name: e.target.value, undecided: false })} />
            <select aria-label="紹介先診療科" className={styles.selectInput} value={dest.dept} onChange={(e) => setDest({ ...dest, dept: e.target.value })}>
              <option value="">診療科（推奨: {ev.depts[0] || '内科'}）</option>
              {DEPTS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            {d.referral && (
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={dest.undecided} onChange={(e) => setDest({ ...dest, undecided: e.target.checked })} />宛先未定（受付に検索依頼）
              </label>
            )}
          </div>
        )}
        <p className={styles.infoNote}>
          紹介状の発行基準: (1) 早期の病院受診が必要で当日発行 (2) 治療やフォローが必要だがかかりつけ医がいない (3) かかりつけ医がいても、異常を指摘されたことのない（未知の）中等症以上。
          かかりつけ医への報告目的の紹介状は省略（特別に報告・連絡が必要な場合を除く）。紹介先は医師と受診者の間で決定する。最終判断は医師が行う。
        </p>
      </div>

      {/* 5. 出力 */}
      <div className={styles.outputSection}>
        <h4 className={styles.outputTitle}><span className={styles.phaseBadge}>5</span>出力（コピーしてカルテ・書類へ）</h4>
        <div className={styles.outGrid}>
          <OutBlock
            id="chart"
            title="カルテ記載（主訴・所見欄の4項目 + 要点）"
            text={chartText}
            copied={copied}
            onCopy={copy}
            extra={(
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={includeEcho} onChange={(e) => setIncludeEcho(e.target.checked)} />エコー要点を含める
              </label>
            )}
          />
          <OutBlock id="labels" title="ラベル・事務対応（000 / 01）" text={labelText} copied={copied} onCopy={copy} />
          <OutBlock id="nurse" title="保健師への申し送り（運動制限・説明依頼）" text={nurseText} copied={copied} onCopy={copy} />
          <OutBlock id="script" title="患者説明トークスクリプト（導入・結果説明・締め）" text={scriptText} copied={copied} onCopy={copy} />
          {(d.referral || d.type === 'pending_blood') && (
            <OutBlock id="referral" title="診療情報提供書 下書き（雛形へ転記）" text={referralText} copied={copied} onCopy={copy} />
          )}
          <OutBlock
            id="opinion"
            title="後日: 結果表「医師の所見」テンプレート候補"
            text={opinionText}
            copied={copied}
            onCopy={copy}
            extra={<span className={styles.itemHint}>候補: {OPINION_TEMPLATES.map((o) => o.id).join('/')} のうち {ev.opinion}</span>}
          />
        </div>
        <p className={styles.infoNote}>
          本ツールは検診チームのマニュアル（チャート・トークスクリプト・ラベル運用）を入力補助に落とし込んだものです。チャート外の所見の閾値は本ツール独自の目安です。判定は提案であり、診断・紹介・就業判定の最終決定は担当医師が行います。受診者の氏名・ID は入力しないでください。
        </p>
      </div>
    </div>
  );
}
