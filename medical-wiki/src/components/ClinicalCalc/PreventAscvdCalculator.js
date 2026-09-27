import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';
import {
  evaluate, validNum, attain, reductionAchieved, recText, goalCite, buildText, buildSummary, RECS,
  lpaHigh, enhTgAuto, PREVENT_NA,
} from './preventAscvdData';

/**
 * 2026 ACC/AHA 脂質異常症管理ツール（PREVENT-ASCVD）
 *
 * 実装仕様書 tool_spec.md（scratchpad/gl2026）§1〜§12 に基づく UI。
 * 判定ロジック・文言・係数は preventAscvdData.js（node からテスト可能）。
 * HisayamaCalculator.js と同じ構成: styles.module.css の既存クラスのみ使用、PsychCopyBox でコピー。
 */

function numField(id, raw) {
  return validNum(id, raw);
}

function Toggle({ options, value, onChange }) {
  return (
    <div className={styles.toggleGroup}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={`${styles.toggleBtn} ${value === o.value ? styles.toggleBtnActive : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

function WrapToggle({ options, value, onChange }) {
  return (
    <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={`${styles.toggleBtn} ${value === o.value ? styles.toggleBtnActive : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

function NumInput({ id, label, unit, suffix = 'mg/dL', raw, onChange, placeholder }) {
  const { value, outOfRange, range } = numField(id, raw);
  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>
        {label}<span className={styles.inputUnit}>{unit}</span>
      </label>
      <div className={styles.inputRow}>
        <input type="number" step="any"
          className={styles.inputField} value={raw}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <span className={styles.unitText}>{suffix}</span>
      </div>
      {outOfRange && range && (
        <div style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '0.2rem' }}>
          受付範囲外です（{range[0]}〜{range[1]} {suffix}）
        </div>
      )}
    </div>
  );
}

function CheckList({ items, values, onToggle }) {
  return (
    <div className={styles.checkList}>
      {items.map((it) => (
        <label key={it.id} className={`${styles.checkItem} ${values[it.id] ? styles.checkItemActive : ''}`}>
          <input type="checkbox" className={styles.checkbox} checked={!!values[it.id]} onChange={() => onToggle(it.id)} />
          <span className={styles.checkLabel}>
            {it.label}
            {it.hint && (<><br /><span style={{ fontSize: '0.78rem', opacity: 0.8 }}>{it.hint}</span></>)}
          </span>
        </label>
      ))}
    </div>
  );
}

const ASCVD_ITEMS = [
  { id: 'acs', label: '急性冠症候群（ACS）の既往' },
  { id: 'mi', label: '心筋梗塞の既往' },
  { id: 'angina', label: '安定狭心症・不安定狭心症' },
  { id: 'revasc', label: '冠動脈またはその他の動脈の血行再建術の既往（PCI・CABG 等）' },
  { id: 'stroke', label: '脳卒中の既往', hint: 'GL の定義は「stroke」。超高リスク判定の主要イベントは虚血性脳卒中のみ' },
  { id: 'tia', label: '一過性脳虚血発作（TIA）の既往' },
  { id: 'pad', label: '末梢動脈疾患（PAD）', hint: '下肢PAD、大動脈瘤を含むアテローム性PAD' },
];

const VHR_MAJOR_ITEMS = [
  { id: 'ev_acs12', label: '過去12か月以内の ACS' },
  { id: 'ev_mi', label: '心筋梗塞の既往（上記 ACS 以外）' },
  { id: 'ev_isch', label: '虚血性脳卒中の既往' },
  { id: 'ev_pad', label: '症候性 PAD' },
];

const DMENH_ITEMS = [
  { id: 'dur', label: '罹病期間が長い（2型 ≥10年、1型 ≥20年）' },
  { id: 'alb', label: 'アルブミン尿 ≥30 μg/mg クレアチニン' },
  { id: 'ret', label: '網膜症' },
  { id: 'neu', label: '神経障害' },
  { id: 'abi', label: 'ABI <0.9' },
];

const ENH_MANUAL_ITEMS = [
  { id: 'enh_fhx', label: '親または同胞の早発ASCVD（発症 男性 <55歳、女性 <65歳）' },
  { id: 'enh_anc', label: '高リスクの祖先（例: 南アジア、フィリピン）' },
  { id: 'enh_prs', label: '高い多遺伝子リスク（測定した場合）' },
  { id: 'enh_infl', label: '慢性炎症性疾患（例: 全身性エリテマトーデス、関節リウマチ、進行した乾癬、炎症性関節炎）' },
  { id: 'enh_crp', label: 'hsCRP ≥2 mg/L を複数回（測定した場合）' },
  { id: 'enh_ckm', label: 'CKM 症候群' },
];

const CKD_OPTIONS = [
  { value: 'none', label: 'なし・G1〜G2' },
  { value: 'G3a', label: 'G3a' },
  { value: 'G3b', label: 'G3b' },
  { value: 'G4', label: 'G4' },
  { value: 'G5', label: 'G5（透析なし）' },
  { value: 'dialysis', label: '維持透析' },
];

const INCID_CAC_OPTIONS = [
  { value: 'none', label: '未評価・なし' },
  { value: 'mild', label: '軽度' },
  { value: 'modsev', label: '中等度〜高度' },
];

export default function PreventAscvdCalculator() {
  const [ascvd, setAscvd] = useState({});
  const [vhrMajor, setVhrMajor] = useState({});
  const [hrCabgpci, setHrCabgpci] = useState(false);
  const [hrHf, setHrHf] = useState(false);
  const [hrHtn, setHrHtn] = useState(false);
  const [maxStatinEze, setMaxStatinEze] = useState(false);

  const [hefh, setHefh] = useState(false);
  const [hofh, setHofh] = useState(false);
  const [dm, setDm] = useState(null);
  const [dmEnhManual, setDmEnhManual] = useState({});
  const [ckd, setCkd] = useState(null);
  const [hiv, setHiv] = useState(false);
  const [hfref, setHfref] = useState(false);
  const [preg, setPreg] = useState(false);

  const [age, setAge] = useState('');
  const [sex, setSex] = useState(null);
  const [sbp, setSbp] = useState('');
  const [bptx, setBptx] = useState(null);
  const [smoking, setSmoking] = useState(null);
  const [statin, setStatin] = useState(null);

  const [fasting, setFasting] = useState(null);
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');
  const [tg, setTg] = useState('');
  const [ldlLab, setLdlLab] = useState('');
  const [ldlBaseline, setLdlBaseline] = useState('');
  const [apob, setApob] = useState('');
  const [lpa, setLpa] = useState('');
  const [lpaUnit, setLpaUnit] = useState(null);

  const [egfrLab, setEgfrLab] = useState('');
  const [cr, setCr] = useState('');

  const [cac, setCac] = useState('');
  const [cac75, setCac75] = useState(false);
  const [incidCac, setIncidCac] = useState('none');

  const [enhManual, setEnhManual] = useState({});
  const [enhRepro, setEnhRepro] = useState(false);
  // fix_round1 C4: 自動判定項目（Lp(a)高値・TG持続高値・LDL-C 160〜189等）の手動チェック
  const [enhLpaManual, setEnhLpaManual] = useState(false);
  const [enhTgManual, setEnhTgManual] = useState(false);
  const [enhLdlManual, setEnhLdlManual] = useState(false);

  const toggle = (setter) => (id) => setter((prev) => ({ ...prev, [id]: !prev[id] }));

  const hasAscvdDef = ASCVD_ITEMS.some((it) => ascvd[it.id]);
  const hasVhrMajorChecked = VHR_MAJOR_ITEMS.some((it) => vhrMajor[it.id]);
  const showVhrSection = hasAscvdDef || hasVhrMajorChecked;
  const showDmEnh = dm === true;
  const showPreg = sex === 'female';
  const showRepro = sex === 'female';

  const ageNum = numField('age', age).value;
  const sbpNum = numField('sbp', sbp).value;
  const tcNum = numField('tc', tc).value;
  const hdlNum = numField('hdl', hdl).value;
  const tgNum = numField('tg', tg).value;
  const ldlLabNum = numField('ldlLab', ldlLab).value;
  const ldlBaselineNum = numField('ldlBaseline', ldlBaseline).value;
  const apobNum = numField('apob', apob).value;
  const lpaNum = numField('lpa', lpa).value;
  const egfrLabNum = numField('egfrLab', egfrLab).value;
  const crNum = numField('cr', cr).value;
  const cacNum = numField('cac', cac).value;

  const input = useMemo(() => ({
    ...ascvd,
    ev_acs12: !!vhrMajor.ev_acs12, ev_mi: !!vhrMajor.ev_mi, ev_isch: !!vhrMajor.ev_isch, ev_pad: !!vhrMajor.ev_pad,
    hr_cabgpci: hrCabgpci, hr_hf: hrHf, hr_htn: hrHtn, maxStatinEze,
    hefh, hofh, dm, dmEnh: dmEnhManual, ckd, hiv, hfref, preg: showPreg && preg,
    age: ageNum, sex, sbp: sbpNum, bptx, smoking, statin,
    fasting, tc: tcNum, hdl: hdlNum, tg: tgNum, ldlLab: ldlLabNum,
    ldlBaseline: statin === true ? ldlBaselineNum : null,
    apob: apobNum, lpa: lpaNum, lpaUnit,
    egfrLab: egfrLabNum, cr: crNum,
    cac: cacNum, cac75, incidCac,
    enh_fhx: !!enhManual.enh_fhx, enh_anc: !!enhManual.enh_anc, enh_prs: !!enhManual.enh_prs,
    enh_infl: !!enhManual.enh_infl, enh_crp: !!enhManual.enh_crp, enh_ckm: !!enhManual.enh_ckm,
    enh_repro: showRepro && enhRepro,
    enh_lpa_manual: enhLpaManual, enh_tg_manual: enhTgManual, enh_ldl_manual: enhLdlManual,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    ascvd, vhrMajor, hrCabgpci, hrHf, hrHtn, maxStatinEze, hefh, hofh, dm, dmEnhManual, ckd, hiv, hfref, preg, showPreg,
    enhLpaManual, enhTgManual, enhLdlManual,
    ageNum, sex, sbpNum, bptx, smoking, statin, fasting, tcNum, hdlNum, tgNum, ldlLabNum, ldlBaselineNum,
    apobNum, lpaNum, lpaUnit, egfrLabNum, crNum, cacNum, cac75, incidCac, enhManual, enhRepro, showRepro,
  ]);

  const result = useMemo(() => evaluate(input), [input]);

  // fix_round2 R-UI2: 増強因子の自動判定は result ではなく入力値から直接計算する
  // （result.enhancers は primary/ldl_lt70 系の経路以外では null になるため）
  const autoLpa = lpaHigh(lpaNum, lpaUnit);
  const autoTg = enhTgAuto(fasting, tgNum);
  const autoLdl = (result.ldlRoute !== null && result.ldlRoute >= 160 && result.ldlRoute <= 189)
    || (result.nonHdl !== null && result.nonHdl >= 190 && result.nonHdl <= 219)
    || (apobNum !== null && apobNum >= 120);

  const rawForText = {
    ...input,
  };
  const outputText = useMemo(() => buildText(result, rawForText), [result, input]);
  const summary = useMemo(() => buildSummary(result), [result]);

  const reset = () => {
    setAscvd({}); setVhrMajor({}); setHrCabgpci(false); setHrHf(false); setHrHtn(false); setMaxStatinEze(false);
    setHefh(false); setHofh(false); setDm(null); setDmEnhManual({}); setCkd(null); setHiv(false); setHfref(false); setPreg(false);
    setAge(''); setSex(null); setSbp(''); setBptx(null); setSmoking(null); setStatin(null);
    setFasting(null); setTc(''); setHdl(''); setTg(''); setLdlLab(''); setLdlBaseline(''); setApob(''); setLpa(''); setLpaUnit(null);
    setEgfrLab(''); setCr('');
    setCac(''); setCac75(false); setIncidCac('none');
    setEnhManual({}); setEnhRepro(false);
    // fix_round2 R-UI2: リセットで手動チェック（自動判定の上書き）も初期化する
    setEnhLpaManual(false); setEnhTgManual(false); setEnhLdlManual(false);
  };

  const attainColor = (a) => (a === '達成' ? '#2E7D32' : '#C62828');

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>PREVENT-ASCVD（2026 ACC/AHA）</h3>
          <p className={styles.calcSub}>2026 ACC/AHA 脂質異常症ガイドライン リスク区分・経路判定と管理目標</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* A. 臨床的ASCVD */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            臨床的ASCVD（既往）
            <span className={styles.inputUnit}>該当するものをすべてチェック</span>
          </label>
          <CheckList items={ASCVD_ITEMS} values={ascvd} onToggle={toggle(setAscvd)} />
        </div>

        {/* A-2. 超高リスク判定（図10） */}
        {showVhrSection && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              超高リスク判定（図10）
              <span className={styles.inputUnit}>主要ASCVDイベント2つ以上、または主要イベント1つ＋高リスク状態2つ以上で超高リスク</span>
            </label>
            <div className={styles.checkLabel} style={{ marginBottom: '0.3rem', fontWeight: 600 }}>主要ASCVDイベント</div>
            <CheckList items={VHR_MAJOR_ITEMS} values={vhrMajor} onToggle={toggle(setVhrMajor)} />
            <div className={styles.checkLabel} style={{ margin: '0.6rem 0 0.3rem', fontWeight: 600 }}>高リスク状態</div>
            <div className={styles.checkList}>
              <div className={`${styles.checkItem}`} style={{ opacity: 0.8 }}>
                <span className={styles.checkLabel}>
                  年齢 ≥65歳（自動）: {ageNum !== null ? (ageNum >= 65 ? '該当' : '非該当') : '年齢未入力'}
                </span>
              </div>
              <label className={`${styles.checkItem} ${hrCabgpci ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={hrCabgpci} onChange={() => setHrCabgpci((v) => !v)} />
                <span className={styles.checkLabel}>冠動脈バイパス術（CABG）または経皮的冠動脈インターベンション（PCI）の既往</span>
              </label>
              <div className={`${styles.checkItem}`} style={{ opacity: 0.8 }}>
                <span className={styles.checkLabel}>現在喫煙（自動、下の喫煙トグルから）: {smoking === null ? '未入力' : (smoking ? '該当' : '非該当')}</span>
              </div>
              <div className={`${styles.checkItem}`} style={{ opacity: 0.8 }}>
                <span className={styles.checkLabel}>糖尿病（自動、下の糖尿病トグルから）: {dm === null ? '未入力' : (dm ? '該当' : '非該当')}</span>
              </div>
              <label className={`${styles.checkItem} ${hrHf ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={hrHf} onChange={() => setHrHf((v) => !v)} />
                <span className={styles.checkLabel}>うっ血性心不全の既往</span>
              </label>
              <label className={`${styles.checkItem} ${hrHtn ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={hrHtn} onChange={() => setHrHtn((v) => !v)} />
                <span className={styles.checkLabel}>
                  高血圧
                  <br /><span style={{ fontSize: '0.78rem', opacity: 0.8 }}>診断の有無で判定。降圧薬内服の入力とは別</span>
                </span>
              </label>
              <label className={`${styles.checkItem} ${maxStatinEze ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={maxStatinEze} onChange={() => setMaxStatinEze((v) => !v)} />
                <span className={styles.checkLabel}>
                  最大耐容量スタチン＋エゼチミブを内服中
                  <br /><span style={{ fontSize: '0.78rem', opacity: 0.8 }}>チェック済みで現在の LDL-C ≥100 mg/dL なら「最大耐容量スタチン＋エゼチミブ下で LDL-C ≥100」に自動該当</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* B. 背景・特殊集団 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>背景・特殊集団</label>
          <div className={styles.checkList}>
            <label className={`${styles.checkItem} ${hefh ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={hefh} onChange={() => setHefh((v) => !v)} />
              <span className={styles.checkLabel}>ヘテロ接合体家族性高コレステロール血症（HeFH）: 臨床的または遺伝学的に確定</span>
            </label>
            <label className={`${styles.checkItem} ${hofh ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={hofh} onChange={() => setHofh((v) => !v)} />
              <span className={styles.checkLabel}>ホモ接合体家族性高コレステロール血症（HoFH）</span>
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            糖尿病<span className={styles.inputUnit}>1型・2型を含む（PREVENT の定義: 糖尿病の既往）</span>
          </label>
          <Toggle options={[{ value: true, label: 'あり' }, { value: false, label: 'なし' }]} value={dm} onChange={setDm} />
        </div>

        {showDmEnh && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              糖尿病特異的リスク増強因子（Table 17）
              <span className={styles.inputUnit}>該当するものをすべてチェック</span>
            </label>
            <CheckList items={DMENH_ITEMS} values={dmEnhManual} onToggle={toggle(setDmEnhManual)} />
            {/* fix_round1 C4: 自動判定（下の eGFR 入力から）に加え手動でもチェックできる。
                自動該当時のみ末尾に「（検査値から該当・持続性は要確認）」を付ける */}
            <label
              className={`${styles.checkItem} ${((result.egfrUsed !== null && result.egfrUsed < 60) || dmEnhManual.egfr) ? styles.checkItemActive : ''}`}
              style={{ marginTop: '0.3rem' }}
            >
              <input type="checkbox" className={styles.checkbox} checked={!!((result.egfrUsed !== null && result.egfrUsed < 60) || dmEnhManual.egfr)}
                onChange={() => setDmEnhManual((prev) => ({ ...prev, egfr: !prev.egfr }))} />
              <span className={styles.checkLabel}>
                eGFR &lt;60 mL/min/1.73m²{(result.egfrUsed !== null && result.egfrUsed < 60) ? '（検査値から該当・持続性は要確認）' : ''}
              </span>
            </label>
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            CKD ステージ<span className={styles.inputUnit}>GFR 区分（KDIGO）。3か月以上持続で診断</span>
          </label>
          <WrapToggle options={CKD_OPTIONS} value={ckd} onChange={setCkd} />
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.checkList}>
            <label className={`${styles.checkItem} ${hiv ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={hiv} onChange={() => setHiv((v) => !v)} />
              <span className={styles.checkLabel}>HIV 感染症（安定した抗レトロウイルス療法中）</span>
            </label>
            <label className={`${styles.checkItem} ${hfref ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={hfref} onChange={() => setHfref((v) => !v)} />
              <span className={styles.checkLabel}>HFrEF（左室駆出率 &lt;40%）</span>
            </label>
            {showPreg && (
              <label className={`${styles.checkItem} ${preg ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={preg} onChange={() => setPreg((v) => !v)} />
                <span className={styles.checkLabel}>妊娠中・妊娠希望・授乳中</span>
              </label>
            )}
          </div>
        </div>

        {/* C. 基本情報 */}
        <NumInput id="age" label="年齢" suffix="歳" unit="満年齢" raw={age} onChange={setAge} placeholder="55" />
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>性別</label>
          <Toggle options={[{ value: 'male', label: '男性' }, { value: 'female', label: '女性' }]} value={sex} onChange={setSex} />
        </div>
        <NumInput id="sbp" label="収縮期血圧" suffix="mmHg" unit="mmHg" raw={sbp} onChange={setSbp} placeholder="130" />
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            降圧薬内服<span className={styles.inputUnit}>現在の降圧薬内服（PREVENT 入力）</span>
          </label>
          <Toggle options={[{ value: true, label: 'あり' }, { value: false, label: 'なし' }]} value={bptx} onChange={setBptx} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            現在喫煙<span className={styles.inputUnit}>過去30日以内の喫煙（PREVENT の定義）。過去喫煙は「なし」</span>
          </label>
          <Toggle options={[{ value: true, label: 'あり' }, { value: false, label: 'なし' }]} value={smoking} onChange={setSmoking} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            スタチン内服<span className={styles.inputUnit}>現在のスタチン内服（PREVENT 入力）</span>
          </label>
          <Toggle options={[{ value: true, label: 'あり' }, { value: false, label: 'なし' }]} value={statin} onChange={setStatin} />
        </div>

        {/* D. 脂質 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            採血条件<span className={styles.inputUnit}>TG の判定と注記に使用</span>
          </label>
          <Toggle options={[{ value: 'fasting', label: '空腹時' }, { value: 'casual', label: '随時' }]} value={fasting} onChange={setFasting} />
        </div>
        <NumInput id="tc" label="総コレステロール" unit="mg/dL" raw={tc} onChange={setTc} placeholder="200" />
        <NumInput id="hdl" label="HDLコレステロール" unit="mg/dL" raw={hdl} onChange={setHdl} placeholder="50" />
        <NumInput id="tg" label="中性脂肪（TG）" unit="mg/dL" raw={tg} onChange={setTg} placeholder="120" />
        <NumInput id="ldlLab" label="LDLコレステロール（検査報告値）" unit="mg/dL（空欄なら Sampson/NIH 式で推算）" raw={ldlLab} onChange={setLdlLab} placeholder="130" />
        {statin === true && (
          <NumInput id="ldlBaseline" label="治療前 LDL-C（スタチン開始前、分かれば）" unit="mg/dL" raw={ldlBaseline} onChange={setLdlBaseline} placeholder="" />
        )}
        <NumInput id="apob" label="apoB（任意）" unit="mg/dL" raw={apob} onChange={setApob} placeholder="" />
        <NumInput id="lpa" label="Lp(a)（任意）" unit="" raw={lpa} onChange={setLpa} suffix="" placeholder="" />
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Lp(a) 単位</label>
          <Toggle options={[{ value: 'mg/dL', label: 'mg/dL' }, { value: 'nmol/L', label: 'nmol/L' }]} value={lpaUnit} onChange={setLpaUnit} />
          {lpaNum !== null && !lpaUnit && (
            <div style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '0.2rem' }}>単位を選択してください</div>
          )}
        </div>

        {/* E. 腎機能 */}
        <NumInput id="egfrLab" label="eGFR（検査報告値）" unit="mL/min/1.73m²（日本の検査報告値は通常 日本腎臓学会の推算式）" raw={egfrLab} onChange={setEgfrLab} placeholder="80" />
        <NumInput id="cr" label="血清クレアチニン（任意）" unit="mg/dL（入力すると CKD-EPI 2021 式で eGFR を計算し PREVENT に使用）" raw={cr} onChange={setCr} placeholder="0.8" />

        {/* F. 冠動脈石灰化 */}
        <NumInput id="cac" label="CAC スコア（Agatston）" unit="AU（0 も有効値）" raw={cac} onChange={setCac} placeholder="" />
        {cacNum !== null && (
          <div className={styles.inputGroup}>
            <div className={styles.checkList}>
              <label className={`${styles.checkItem} ${cac75 ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={cac75} onChange={() => setCac75((v) => !v)} />
                <span className={styles.checkLabel}>CAC が年齢・性・人種別 75パーセンタイル以上</span>
              </label>
            </div>
          </div>
        )}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>非心臓CTでの偶発的冠動脈石灰化</label>
          <WrapToggle options={INCID_CAC_OPTIONS} value={incidCac} onChange={setIncidCac} />
        </div>

        {/* G. リスク増強因子 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            リスク増強因子（Table 13）
            <span className={styles.inputUnit}>PREVENT-ASCVD に含まれない因子。境界リスク（3〜&lt;5%）での個別化に用いる（2a/B-NR）</span>
          </label>
          <CheckList items={ENH_MANUAL_ITEMS} values={enhManual} onToggle={toggle(setEnhManual)} />
          {/* fix_round1 C4 / fix_round2 R-UI2: 自動判定項目も手動でチェック可能にする。状態は result
              ではなく入力 state（+ 自動判定関数を直接呼んだ値）から描画し、全経路で状態が見えるようにする。
              自動該当時のみ末尾に注記を付ける */}
          <div className={styles.checkList} style={{ marginTop: '0.3rem' }}>
            <label className={`${styles.checkItem} ${(enhLpaManual || autoLpa) ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={enhLpaManual || autoLpa}
                onChange={() => setEnhLpaManual((v) => !v)} />
              <span className={styles.checkLabel}>
                Lp(a) ≥125 nmol/L または ≥50 mg/dL{autoLpa ? '（検査値から該当・持続性は要確認）' : ''}
              </span>
            </label>
            <label className={`${styles.checkItem} ${(enhTgManual || autoTg) ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={enhTgManual || autoTg}
                onChange={() => setEnhTgManual((v) => !v)} />
              <span className={styles.checkLabel}>
                TG 持続高値 ≥175 mg/dL（随時）／≥150 mg/dL（空腹時）{autoTg ? '（検査値から該当・持続性は要確認）' : ''}
              </span>
            </label>
            <label className={`${styles.checkItem} ${(enhLdlManual || autoLdl) ? styles.checkItemActive : ''}`}>
              <input type="checkbox" className={styles.checkbox} checked={enhLdlManual || autoLdl}
                onChange={() => setEnhLdlManual((v) => !v)} />
              <span className={styles.checkLabel}>
                LDL-C 持続 160〜189 mg/dL、non-HDL-C 190〜219 mg/dL、または apoB ≥120 mg/dL{autoLdl ? '（検査値から該当・持続性は要確認）' : ''}
              </span>
            </label>
          </div>
          {showRepro && (
            <div className={styles.checkList} style={{ marginTop: '0.3rem' }}>
              <label className={`${styles.checkItem} ${enhRepro ? styles.checkItemActive : ''}`}>
                <input type="checkbox" className={styles.checkbox} checked={enhRepro} onChange={() => setEnhRepro((v) => !v)} />
                {/* fix_round1 B5 / fix_round2 R-UI1: Table 14 の不足分（SGA、反復流産、早発初経<10歳、PCOS・月経不順）を追加 */}
                <span className={styles.checkLabel}>生殖関連リスクマーカー（早期閉経（&lt;45歳）・早発閉経（&lt;40歳）、早発初経〈10歳未満〉、多嚢胞性卵巣症候群（PCOS）・月経不順、妊娠高血圧腎症、妊娠糖尿病、妊娠高血圧、早産、SGA児（出生体重が在胎週数の10パーセンタイル未満）、反復流産）</span>
              </label>
            </div>
          )}
          <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.3rem' }}>
            上記3項目は検査値から自動判定もされます（該当時はリスク増強因子の行に表示）。
          </div>
        </div>

        {/* 結果 */}
        <div className={styles.result}>
          {result.ldlCurrent !== null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>LDL-C（{result.ldlSource === 'lab' ? '検査報告値' : 'Sampson/NIH式'}）</span>
              <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>{result.ldlCurrent} mg/dL</span>
            </div>
          )}
          {result.ldlCurrent === null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>LDL-C</span>
              <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>---</span>
            </div>
          )}
          {result.tgOver800 && (
            <div className={styles.note} style={{ color: '#C62828' }}>
              TG &gt;800 mg/dL のため Sampson/NIH 式は使えません。LDL-C 検査値を入力してください。
            </div>
          )}
          {result.ldlSource === 'lab' && result.ldlSampson !== null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>LDL-C（Sampson/NIH式）</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem' }}>{result.ldlSampson} mg/dL</span>
            </div>
          )}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>non-HDL-C（TC − HDL-C）</span>
            <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>{result.nonHdl !== null ? `${result.nonHdl} mg/dL` : '---'}</span>
          </div>
          {result.egfrUsed !== null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>eGFR（PREVENT用）</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem' }}>
                {/* fix_round1 C3: CKD-EPI と検査報告値の両方が入力されたら両方表示（§3.3） */}
                {result.egfrSource === 'ckdepi' && result.egfrLabValue !== null
                  ? `${result.egfrUsed}（CKD-EPI 2021）／検査報告値 ${result.egfrLabValue}`
                  : `${result.egfrUsed}（${result.egfrSource === 'ckdepi' ? 'CKD-EPI 2021' : '検査報告値'}）`}
              </span>
            </div>
          )}
          {result.reductionPct !== null && result.goal && result.goal.reduction && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>LDL-C 低下率（治療前比）</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(reductionAchieved(result.reductionPct, result.goal.reduction) ? '達成' : '未達') }}>
                {result.reductionPct}% — 目標 {result.goal.reduction} {reductionAchieved(result.reductionPct, result.goal.reduction) ? '達成' : '未達'}
              </span>
            </div>
          )}
          {result.reductionPct !== null && (!result.goal || !result.goal.reduction) && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>LDL-C 低下率（治療前比）</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem' }}>{result.reductionPct}%</span>
            </div>
          )}

          {result.route === 'incomplete' && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>未入力</span>
              <span className={styles.resultValue} style={{ fontSize: '0.95rem' }}>{result.missing.join('・')}</span>
            </div>
          )}

          {result.route !== 'incomplete' && (
            <>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>PREVENT-ASCVD</span>
                <span className={styles.resultValue} style={{ fontSize: '1rem' }}>
                  {result.prevent.ok
                    ? `10年 ${result.prevent.ascvd10.toFixed(1)}%${result.prevent.ascvd30 !== null ? ` / 30年 ${result.prevent.ascvd30.toFixed(1)}%` : ''}`
                    : (result.prevent.reason ? '適用外' : '未計算')}
                  {/* fix_round1 C3: 参考値マーク（§4.6） */}
                  {result.prevent.ok && result.prevent.outOfLdlRange && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>（参考値: GL の区分適用範囲 LDL-C 70〜189 外）</span>
                  )}
                  {result.prevent.ok && result.prevent.ldlUnknown && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 400 }}>（LDL-C 未確定: 適用範囲 70〜189 の確認が必要）</span>
                  )}
                </span>
              </div>
              {!result.prevent.ok && result.prevent.reason && (
                <div className={styles.note} style={{ color: 'var(--ifm-color-emphasis-600)' }}>{PREVENT_NA_TEXT(result.prevent.reason)}</div>
              )}
              {!result.prevent.ok && result.prevent.missing && (
                <div className={styles.note} style={{ color: 'var(--ifm-color-emphasis-600)' }}>未入力: {result.prevent.missing.join('・')}</div>
              )}
              {result.prevent.clampNotes && result.prevent.clampNotes.length > 0 && (
                <div className={styles.note} style={{ color: '#E65100' }}>
                  {result.prevent.clampNotes.map((n) => <div key={n}>{n}</div>)}
                </div>
              )}

              <div className={styles.resultJudge} style={{ background: result.color }}>
                {result.title}
                <br />
                <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{result.sub}</span>
                {/* fix_round1 C3 / fix_round2 R-A10: 高齢者 CAC 強調（経路を問わない） */}
                {result.elderCacEmphasis && (
                  <><br /><span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    CAC {cacNum !== null ? cacNum : ''}: LLT を避ける再分類の対象（0 または 1〜10）
                  </span></>
                )}
                {/* fix_round1 C3 / fix_round2 R-A4: severe 経路の二段目標（HeFH・石灰化なしのとき）。
                    内部 ID（F_100・F_70）は画面に出さず COR/LOE のみ表示 */}
                {result.route === 'severe' && !result.hefhCalcified && (
                  <><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                    追加のASCVD危険因子なし: LDL-C &lt;100・non-HDL-C &lt;130［1/B-NR］
                  </span><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                    追加のASCVD危険因子あり: LDL-C &lt;70・non-HDL-C &lt;100［1/B-R］
                  </span></>
                )}
                {result.goal ? (
                  <>
                    <br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      管理目標 LDL-C &lt;{result.goal.ldl}・non-HDL-C &lt;{result.goal.nonHdl} mg/dL
                      {result.goal.reduction ? `（低下率 ${result.goal.reduction}）` : ''}
                      {goalCite(result.goal)}
                    </span>
                    {/* fix_round1 C3: low 区分の該当理由（LDL-C 160〜189 / 30年リスク≥10%） */}
                    {result.goal.subReason && (<><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>（{result.goal.subReason}）</span></>)}
                    {result.goal.qualifier && (<><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>{result.goal.qualifier}</span></>)}
                    {result.goal.apoB && (<><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>任意: apoB &lt;{result.goal.apoB}</span></>)}
                    {result.optionalGoal && (
                      <><br /><span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                        任意目標 LDL-C &lt;{result.optionalGoal.ldl}・non-HDL-C &lt;{result.optionalGoal.nonHdl}{goalCite(result.optionalGoal)}
                      </span></>
                    )}
                  </>
                ) : (
                  <><br /><span style={{ fontSize: '0.8rem', opacity: 0.9 }}>管理目標: GL に数値目標の記載なし</span></>
                )}
              </div>

              {result.vhr && (
                <div className={styles.note}>
                  <div>主要ASCVDイベント: {result.vhr.majorItems.length ? result.vhr.majorItems.join('、') : 'なし'}</div>
                  <div>高リスク状態: {result.vhr.hrItems.length ? result.vhr.hrItems.join('、') : 'なし'}</div>
                </div>
              )}

              {result.recs.length > 0 && (
                <div className={styles.note}>
                  <strong>推奨（COR / LOE）</strong>
                  {result.recs.map((rc, i) => (
                    <div key={rc.id + i} title={RECS[rc.id] ? RECS[rc.id].ref : undefined}>・{recText(rc.id, rc.conditional)}</div>
                  ))}
                </div>
              )}

              {result.addOnSteps && (
                <div className={styles.note}>
                  <strong>目標未達時の追加（図11／図12）</strong>
                  {result.addOnSteps.map((s) => <div key={s}>{s}</div>)}
                </div>
              )}

              {result.alsoApplies.length > 0 && (
                <div className={styles.note}>
                  <strong>他に該当する推奨</strong>
                  {result.alsoApplies.map((a) => <div key={a.id} title={RECS[a.id] ? RECS[a.id].ref : undefined}>・{recText(a.id, a.conditional)}</div>)}
                </div>
              )}

              {result.enhancers && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>リスク増強因子</span>
                  <span className={styles.resultValue} style={{ fontSize: '0.9rem' }}>
                    {result.enhancers.count > 0 ? `${result.enhancers.count}項目（${result.enhancers.items.join('、')}）` : '該当なし（増強因子が無いことは低リスクを意味しない: p40）'}
                  </span>
                </div>
              )}

              {result.goal && result.ldlCurrent !== null && (
                <div className={styles.resultRow} style={{ marginTop: '0.5rem' }}>
                  <span className={styles.resultLabel}>現在のLDL-C</span>
                  <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(attain(result.ldlCurrent, result.goal.ldl)) }}>
                    {result.ldlCurrent} mg/dL — &lt;{result.goal.ldl} {attain(result.ldlCurrent, result.goal.ldl)}
                    {result.optionalGoal && (
                      <span style={{ color: attainColor(attain(result.ldlCurrent, result.optionalGoal.ldl)) }}>
                        {' '}/ &lt;{result.optionalGoal.ldl} {attain(result.ldlCurrent, result.optionalGoal.ldl)}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {result.goal && result.nonHdl !== null && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>現在のnon-HDL-C</span>
                  <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(attain(result.nonHdl, result.goal.nonHdl)) }}>
                    {result.nonHdl} mg/dL — &lt;{result.goal.nonHdl} {attain(result.nonHdl, result.goal.nonHdl)}
                    {result.optionalGoal && (
                      <span style={{ color: attainColor(attain(result.nonHdl, result.optionalGoal.nonHdl)) }}>
                        {' '}/ &lt;{result.optionalGoal.nonHdl} {attain(result.nonHdl, result.optionalGoal.nonHdl)}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {result.goal && result.goal.apoB && apobNum !== null && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>現在のapoB</span>
                  <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(attain(apobNum, result.goal.apoB)) }}>
                    {apobNum} mg/dL — &lt;{result.goal.apoB} {attain(apobNum, result.goal.apoB)}
                  </span>
                </div>
              )}

              {result.notes && result.notes.length > 0 && (
                <div className={styles.note} style={{ color: '#E65100' }}>
                  {result.notes.map((n, i) => <div key={i}>※ {n}</div>)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <PsychCopyBox text={outputText} summary={summary} dateLabel="採血日" />

      <div className={styles.note}>
        <p>
          <strong>参考:</strong> 2026 ACC/AHA/多学会 Guideline on the Management of Dyslipidemia（J Am Coll Cardiol 2026; Circulation 2026）; Khan SS, et al. PREVENT equations. Circulation 2024;149:430-449; Sampson M, et al. JAMA Cardiol 2020;5:540-548; CKD-EPI 2021.
        </p>
      </div>
    </div>
  );
}

// fix_round3 item6: 文言をここで二重管理せず、データ側の PREVENT_NA_* を単一のソースにする
function PREVENT_NA_TEXT(reasonKey) {
  return PREVENT_NA[reasonKey] || '';
}
