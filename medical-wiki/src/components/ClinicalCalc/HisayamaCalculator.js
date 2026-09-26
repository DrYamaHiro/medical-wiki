import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';
import {
  CONDITION_ITEMS,
  IGT_OPTIONS,
  IGT_DEFINITION,
  TG_HDL_TARGET_TEXT,
  computeLipids,
  evaluate,
  attain,
  targetLine,
  considerLine,
  formatRisk,
  buildText,
  buildSummary,
  wholeAge,
  showLdl180,
  NOTE_LDL180,
} from './hisayamaData';

/**
 * 久山町スコア計算ツール
 *
 * 日本動脈硬化学会「動脈硬化性疾患予防ガイドライン2022年版」図3-1 の手順で判定する。
 *   0. FH（成人ヘテロ接合体）/ 家族性III型高脂血症 → チャート対象外（FH は第4章の管理目標）
 *   1. 冠動脈疾患・アテローム血栓性脳梗塞の既往 → 二次予防
 *   2. 糖尿病・CKD・PAD → 一次予防 高リスク
 *   3. それ以外（40〜79 歳）→ 久山町スコア（図3-2）で 10 年発症リスクを求め低/中/高リスク
 * 判定ロジックとデータは hisayamaData.js（node からテスト可能）。
 */

const num = (v) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : undefined;
};

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

function NumInput({ label, unit, suffix = 'mg/dL', value, onChange, placeholder, min, max }) {
  return (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>
        {label}<span className={styles.inputUnit}>{unit}</span>
      </label>
      <div className={styles.inputRow}>
        <input type="number" step="1" min={min} max={max}
          className={styles.inputField} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        <span className={styles.unitText}>{suffix}</span>
      </div>
    </div>
  );
}

export default function HisayamaCalculator() {
  const [cond, setCond] = useState({});
  const [sex, setSex] = useState(null);
  const [age, setAge] = useState('');
  const [smoking, setSmoking] = useState(null);
  const [sbp, setSbp] = useState('');
  const [igt, setIgt] = useState(null);
  const [fasting, setFasting] = useState(null);
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');
  const [tg, setTg] = useState('');

  const toggleCond = (id) => setCond((prev) => ({ ...prev, [id]: !prev[id] }));

  const raw = { fasting, tc: num(tc), hdl: num(hdl), tg: num(tg), ldlDirect: num(ldl) };
  const lip = useMemo(
    () => computeLipids(raw),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fasting, tc, hdl, tg, ldl],
  );

  const effCond = { ...cond, micro: !!(cond.dm && cond.micro) };
  const inp = {
    cond: effCond,
    age: num(age),
    sex,
    sbp: num(sbp),
    igt,
    smoking,
    ldl: lip.ldl,
    hdl: num(hdl),
  };
  const result = evaluate(inp);

  const anyRouting = ['fh', 'fh3', 'cad', 'acs', 'athero', 'dm', 'ckd', 'pad'].some((k) => cond[k]);
  const secondaryOrFh = cond.fh || cond.fh3 || cond.cad || cond.acs || cond.athero;
  const showScoreInputs = !anyRouting;
  const showSmoking = showScoreInputs || (cond.dm && !secondaryOrFh);
  const ageWhole = wholeAge(num(age));
  const ageOutOfRange = ageWhole !== null && (ageWhole < 40 || ageWhole >= 80);

  const outputText = buildText(result, lip, inp, raw);
  const summary = buildSummary(result, lip);

  const reset = () => {
    setCond({});
    setSex(null);
    setAge('');
    setSmoking(null);
    setSbp('');
    setIgt(null);
    setFasting(null);
    setTc('');
    setHdl('');
    setLdl('');
    setTg('');
  };

  const attainColor = (a) => (a === '達成' ? '#2E7D32' : '#C62828');

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>久山町スコア</h3>
          <p className={styles.calcSub}>動脈硬化性疾患予防ガイドライン2022年版 リスク区分と脂質管理目標</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 図3-1 の判定に使う既往・合併症 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            既往・合併症
            <span className={styles.inputUnit}>該当するものをすべてチェック（上から順に判定）</span>
          </label>
          <div className={styles.checkList}>
            {CONDITION_ITEMS.filter((it) => !it.onlyWith || cond[it.onlyWith]).map((item) => (
              <label
                key={item.id}
                className={`${styles.checkItem} ${cond[item.id] ? styles.checkItemActive : ''}`}
                style={item.onlyWith ? { marginLeft: '1.5rem' } : undefined}
              >
                <input
                  type="checkbox"
                  checked={!!cond[item.id]}
                  onChange={() => toggleCond(item.id)}
                  className={styles.checkbox}
                />
                <span className={styles.checkLabel}>
                  {item.label}
                  {item.hint && (
                    <><br /><span style={{ fontSize: '0.78rem', opacity: 0.8 }}>{item.hint}</span></>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        <NumInput label="年齢" suffix="歳"
          unit={showScoreInputs ? '満年齢。スコアは40〜79歳のみ' : '満年齢（任意。80歳以上・40歳未満で注記）'}
          value={age} onChange={setAge} placeholder="65" min="20" max="110" />

        {showScoreInputs && !ageOutOfRange && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>性別</label>
            <Toggle options={[{ value: 'male', label: '男性' }, { value: 'female', label: '女性' }]} value={sex} onChange={setSex} />
          </div>
        )}

        {showSmoking && !(showScoreInputs && ageOutOfRange) && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              喫煙<span className={styles.inputUnit}>現在喫煙のみ「あり」（過去喫煙は「なし」）</span>
            </label>
            <Toggle options={[{ value: true, label: 'あり' }, { value: false, label: 'なし' }]} value={smoking} onChange={setSmoking} />
          </div>
        )}

        {showScoreInputs && !ageOutOfRange && (
          <>
            <NumInput label="収縮期血圧" suffix="mmHg" unit="mmHg（降圧薬内服中はリスクを過小評価しうる）" value={sbp} onChange={setSbp} placeholder="130" min="60" max="260" />
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                糖代謝異常（糖尿病は含まない）<span className={styles.inputUnit}>{IGT_DEFINITION}</span>
              </label>
              <Toggle options={IGT_OPTIONS} value={igt} onChange={setIgt} />
            </div>
          </>
        )}

        {/* 脂質 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            採血条件<span className={styles.inputUnit}>Friedewald式は空腹時のみ</span>
          </label>
          <Toggle options={[{ value: 'fasting', label: '空腹時' }, { value: 'casual', label: '随時' }]} value={fasting} onChange={setFasting} />
        </div>
        <NumInput label="総コレステロール" unit="mg/dL（Friedewald式・non-HDL-Cに使用）" value={tc} onChange={setTc} placeholder="220" min="50" max="500" />
        <NumInput label="HDLコレステロール" unit="mg/dL" value={hdl} onChange={setHdl} placeholder="55" min="10" max="200" />
        <NumInput label="中性脂肪（TG）" unit="mg/dL（Friedewald式は TG <400 のみ）" value={tg} onChange={setTg} placeholder="150" min="10" max="2000" />
        <NumInput label="LDLコレステロール（直接法）" unit="mg/dL（入力時はこちらを優先。空欄なら Friedewald式）" value={ldl} onChange={setLdl} placeholder="140" min="10" max="400" />

        {lip.friedewaldBlocked && lip.ldl === null && (num(tc) || num(tg)) && (
          <div className={styles.note} style={{ color: '#C62828' }}>{lip.friedewaldBlocked}</div>
        )}

        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>LDL-C{lip.ldlSource === 'friedewald' ? '（Friedewald式）' : lip.ldlSource === 'direct' ? '（直接法）' : ''}</span>
            <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>{lip.ldl !== null ? `${lip.ldl} mg/dL` : '---'}</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>non-HDL-C（TC − HDL-C）</span>
            <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>{lip.nonHdl !== null ? `${lip.nonHdl} mg/dL` : '---'}</span>
          </div>

          {result.route === 'score' && (
            <>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>スコア合計（{result.band.label}）</span>
                <span className={styles.resultValue}>{result.score.total} 点</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>10年発症リスク</span>
                <span className={styles.resultValue}>{formatRisk(result.risk)} %</span>
              </div>
            </>
          )}

          {result.route === 'incomplete' && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>未入力</span>
              <span className={styles.resultValue} style={{ fontSize: '0.95rem' }}>{result.missing.join('・')}</span>
            </div>
          )}

          {result.route !== 'incomplete' && (
            <div className={styles.resultJudge} style={{ background: result.color }}>
              {result.text}
              <br />
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{result.sub}</span>
              {result.ldl && (
                <>
                  <br />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>管理目標 {targetLine(result)} mg/dL</span>
                </>
              )}
              {result.consider && (
                <>
                  <br />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{considerLine(result)}</span>
                </>
              )}
              {result.showTgHdl && (
                <>
                  <br />
                  <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{TG_HDL_TARGET_TEXT}</span>
                </>
              )}
            </div>
          )}

          {result.notes && result.notes.length > 0 && (
            <div className={styles.note} style={{ color: '#E65100' }}>
              {result.notes.map((n) => <div key={n}>※ {n}</div>)}
            </div>
          )}

          {result.ldl && lip.ldl !== null && (
            <div className={styles.resultRow} style={{ marginTop: '0.5rem' }}>
              <span className={styles.resultLabel}>現在のLDL-C</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(attain(lip.ldl, result.ldl)) }}>
                {lip.ldl} mg/dL — &lt;{result.ldl} {attain(lip.ldl, result.ldl)}
                {result.consider && (
                  <span style={{ color: attainColor(attain(lip.ldl, result.consider.ldl)) }}>
                    {' '}/ &lt;{result.consider.ldl} {attain(lip.ldl, result.consider.ldl)}
                  </span>
                )}
              </span>
            </div>
          )}
          {result.nonHdl && lip.nonHdl !== null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>現在のnon-HDL-C</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem', color: attainColor(attain(lip.nonHdl, result.nonHdl)) }}>
                {lip.nonHdl} mg/dL — &lt;{result.nonHdl} {attain(lip.nonHdl, result.nonHdl)}
                {result.consider && (
                  <span style={{ color: attainColor(attain(lip.nonHdl, result.consider.nonHdl)) }}>
                    {' '}/ &lt;{result.consider.nonHdl} {attain(lip.nonHdl, result.consider.nonHdl)}
                  </span>
                )}
              </span>
            </div>
          )}
          {showLdl180(result, lip) && (
            <div className={styles.note} style={{ color: '#C62828' }}>
              {NOTE_LDL180}。
            </div>
          )}
        </div>
      </div>

      <PsychCopyBox text={outputText} summary={summary} dateLabel="採血日" />

      <div className={styles.note}>
        <p>
          <strong>判定手順（図3-1）:</strong>
          {' '}(0) FH（成人ヘテロ接合体）・家族性III型高脂血症はこのチャートを用いない（FH: 一次予防 LDL&lt;100、冠動脈疾患/アテローム血栓性脳梗塞ありで LDL&lt;70 / non-HDL&lt;100。家族性III型は第5章参照）。
          {' '}(1) 冠動脈疾患またはアテローム血栓性脳梗塞の既往 → 二次予防 LDL&lt;100 / non-HDL&lt;130。急性冠症候群・FH・糖尿病・冠動脈疾患とアテローム血栓性脳梗塞の合併では LDL&lt;70 / non-HDL&lt;100 を考慮。
          {' '}(2) 糖尿病（耐糖能異常は含まない）・CKD・PAD → 一次予防 高リスク LDL&lt;120 / non-HDL&lt;150。糖尿病で PAD・細小血管症（網膜症・腎症・神経障害）合併時または喫煙ありでは LDL&lt;100 / non-HDL&lt;130 を考慮。
          {' '}(3) それ以外は久山町スコア（性別・収縮期血圧・糖代謝異常・LDL-C・HDL-C・喫煙の6項目、0〜19点。年齢は点数化せず年代別の表を引く）で冠動脈疾患＋アテローム血栓性脳梗塞の10年発症リスクを求め、2%未満 低リスク（LDL&lt;160 / non-HDL&lt;190）、2%以上10%未満 中リスク（LDL&lt;140 / non-HDL&lt;170）、10%以上 高リスク（LDL&lt;120 / non-HDL&lt;150）。
          {' '}スコアは満40〜79歳のみ。80歳以上の一次予防はスコアを管理目標に結びつけず個別に判断、40歳未満は絶対リスクを算出できないため主治医の判断。
          {' '}管理目標値は基本的に80歳未満の成人に適用（80歳以上は個別に判断）。40歳未満の脂質管理の是非は主治医の判断。
        </p>
        <p>
          <strong>注意:</strong> 目標値は到達努力目標。一次予防で LDL-C ≥180 mg/dL が持続する場合は薬物療法を考慮し FH の可能性を念頭に置く。降圧薬内服中はリスクを過小評価しうる。
          LDL-C は直接法、または空腹時採血かつ TG&lt;400 mg/dL のときのみ Friedewald 式（TC − HDL-C − TG/5）。
        </p>
        <p>
          <strong>参考:</strong> 日本動脈硬化学会 動脈硬化性疾患予防ガイドライン 2022年版（図3-1、図3-2、表3-2、表3-3、第4章）;
          久山町研究（Hisayama Study）.
        </p>
      </div>
    </div>
  );
}
