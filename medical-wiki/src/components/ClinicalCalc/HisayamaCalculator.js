import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * 久山町スコア計算ツール
 *
 * 動脈硬化性疾患予防ガイドライン2022準拠
 * - 二次予防該当（既往あり）→ スコア不要、直接高リスク判定
 * - 一次予防 → 久山町スコアでリスク層別化
 */

const HISTORY_ITEMS = [
  { id: 'cad', label: '冠動脈疾患（心筋梗塞/狭心症/PCI/CABG後）' },
  { id: 'stroke', label: '脳血管疾患（脳梗塞/TIA）' },
  { id: 'pad', label: '末梢動脈疾患（PAD/ASO）' },
  { id: 'fh', label: '家族性高コレステロール血症（FH）' },
  { id: 'ckd', label: '慢性腎臓病（CKD）' },
];

export default function HisayamaCalculator() {
  const [history, setHistory] = useState({});
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [smoking, setSmoking] = useState(null);
  const [sbp, setSbp] = useState('');
  const [diabetes, setDiabetes] = useState(null);
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');

  const toggleHistory = (id) => {
    setHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasHistory = HISTORY_ITEMS.some((item) => history[item.id]);
  const hasFHorACS = history['fh'] || history['cad'];

  const tcHdlRatio = useMemo(() => {
    const t = parseFloat(tc);
    const h = parseFloat(hdl);
    if (!t || !h || t <= 0 || h <= 0) return null;
    return t / h;
  }, [tc, hdl]);

  const score = useMemo(() => {
    if (hasHistory) return null; // 二次予防はスコア不要
    const a = parseInt(age, 10);
    if (!a || a < 40 || a > 79) return null;
    if (smoking === null || diabetes === null) return null;
    const s = parseFloat(sbp);
    if (!s || s <= 0) return null;
    if (tcHdlRatio === null) return null;

    let pts = 0;
    if (a >= 70) pts += 8;
    else if (a >= 60) pts += 7;
    else if (a >= 50) pts += 5;

    if (smoking) pts += (sex === 'male' ? 4 : 3);

    if (s >= 160) pts += 3;
    else if (s >= 140) pts += 2;
    else if (s >= 120) pts += 1;

    if (diabetes) pts += (sex === 'male' ? 3 : 4);

    if (tcHdlRatio >= 6) pts += 3;
    else if (tcHdlRatio >= 5) pts += 2;
    else if (tcHdlRatio >= 4) pts += 1;

    return pts;
  }, [hasHistory, sex, age, smoking, sbp, diabetes, tcHdlRatio]);

  const judge = useMemo(() => {
    if (hasHistory) {
      if (hasFHorACS) {
        return {
          text: '二次予防（超高リスク）',
          sub: 'FHまたはACS既往',
          color: '#B71C1C',
          mgmt: 'LDL目標 70 mg/dL未満',
        };
      }
      return {
        text: '二次予防（高リスク）',
        sub: '動脈硬化性疾患の既往あり',
        color: '#C62828',
        mgmt: 'LDL目標 100 mg/dL未満',
      };
    }
    if (score === null) return null;
    if (score <= 5) return { text: '低リスク', sub: '10年リスク 2%未満', color: '#2E7D32', mgmt: 'LDL目標 160 mg/dL未満' };
    if (score <= 10) return { text: '中リスク', sub: '10年リスク 2〜9%', color: '#E65100', mgmt: 'LDL目標 140 mg/dL未満' };
    return { text: '高リスク', sub: '10年リスク 10%以上', color: '#C62828', mgmt: 'LDL目標 120 mg/dL未満' };
  }, [hasHistory, hasFHorACS, score]);

  const reset = () => {
    setHistory({});
    setSex('male');
    setAge('');
    setSmoking(null);
    setSbp('');
    setDiabetes(null);
    setTc('');
    setHdl('');
    setLdl('');
  };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>久山町スコア</h3>
          <p className={styles.calcSub}>動脈硬化性疾患リスク評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 既往歴チェック（最優先） */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            既往歴チェック
            <span className={styles.inputUnit}>該当あれば二次予防</span>
          </label>
          <div className={styles.checkList}>
            {HISTORY_ITEMS.map((item) => (
              <label
                key={item.id}
                className={`${styles.checkItem} ${history[item.id] ? styles.checkItemActive : ''}`}
              >
                <input
                  type="checkbox"
                  checked={!!history[item.id]}
                  onChange={() => toggleHistory(item.id)}
                  className={styles.checkbox}
                />
                <span className={styles.checkLabel}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 二次予防の場合はスコア入力不要だがLDL入力は必要 */}
        {hasHistory && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                LDLコレステロール<span className={styles.inputUnit}>mg/dL（実測値）</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="10" max="400"
                  className={styles.inputField} value={ldl}
                  onChange={(e) => setLdl(e.target.value)} placeholder="140" />
                <span className={styles.unitText}>mg/dL</span>
              </div>
            </div>
            {judge && (
              <div className={styles.result}>
                <div className={styles.resultJudge} style={{ background: judge.color }}>
                  {judge.text}
                  <br />
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
                  <br />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{judge.mgmt}</span>
                </div>
                {ldl && (
                  <div className={styles.resultRow} style={{ marginTop: '0.5rem' }}>
                    <span className={styles.resultLabel}>現在のLDL-C</span>
                    <span className={styles.resultValue} style={{
                      color: parseFloat(ldl) >= parseFloat(judge.mgmt.match(/\d+/)?.[0]) ? '#C62828' : '#2E7D32'
                    }}>
                      {ldl} mg/dL — {parseFloat(ldl) >= parseFloat(judge.mgmt.match(/\d+/)?.[0]) ? '目標未達' : '目標達成'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 一次予防の場合のみスコア入力を表示 */}
        {!hasHistory && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>性別</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setSex('male')}
                >男性</button>
                <button
                  className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleBtnActive : ''}`}
                  onClick={() => setSex('female')}
                >女性</button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                年齢<span className={styles.inputUnit}>40〜79歳</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="40" max="79"
                  className={styles.inputField} value={age}
                  onChange={(e) => setAge(e.target.value)} placeholder="65" />
                <span className={styles.unitText}>歳</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>喫煙</label>
              <div className={styles.toggleGroup}>
                <button className={`${styles.toggleBtn} ${smoking === true ? styles.toggleBtnActive : ''}`}
                  onClick={() => setSmoking(true)}>あり</button>
                <button className={`${styles.toggleBtn} ${smoking === false ? styles.toggleBtnActive : ''}`}
                  onClick={() => setSmoking(false)}>なし</button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                収縮期血圧<span className={styles.inputUnit}>mmHg</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="60" max="260"
                  className={styles.inputField} value={sbp}
                  onChange={(e) => setSbp(e.target.value)} placeholder="130" />
                <span className={styles.unitText}>mmHg</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>糖尿病</label>
              <div className={styles.toggleGroup}>
                <button className={`${styles.toggleBtn} ${diabetes === true ? styles.toggleBtnActive : ''}`}
                  onClick={() => setDiabetes(true)}>あり</button>
                <button className={`${styles.toggleBtn} ${diabetes === false ? styles.toggleBtnActive : ''}`}
                  onClick={() => setDiabetes(false)}>なし</button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                総コレステロール<span className={styles.inputUnit}>mg/dL</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="50" max="500"
                  className={styles.inputField} value={tc}
                  onChange={(e) => setTc(e.target.value)} placeholder="220" />
                <span className={styles.unitText}>mg/dL</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                HDLコレステロール<span className={styles.inputUnit}>mg/dL</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="10" max="200"
                  className={styles.inputField} value={hdl}
                  onChange={(e) => setHdl(e.target.value)} placeholder="55" />
                <span className={styles.unitText}>mg/dL</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                LDLコレステロール<span className={styles.inputUnit}>mg/dL（実測値）</span>
              </label>
              <div className={styles.inputRow}>
                <input type="number" step="1" min="10" max="400"
                  className={styles.inputField} value={ldl}
                  onChange={(e) => setLdl(e.target.value)} placeholder="140" />
                <span className={styles.unitText}>mg/dL</span>
              </div>
            </div>

            {/* 一次予防の結果 */}
            <div className={styles.result}>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>スコア合計</span>
                <span className={styles.resultValue}>{score !== null ? `${score} 点` : '---'}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>TC/HDL比</span>
                <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>
                  {tcHdlRatio !== null ? tcHdlRatio.toFixed(2) : '---'}
                </span>
              </div>
              {judge && (
                <>
                  <div className={styles.resultJudge} style={{ background: judge.color }}>
                    {judge.text}
                    <br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
                    <br />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{judge.mgmt}</span>
                  </div>
                  {ldl && (
                    <div className={styles.resultRow} style={{ marginTop: '0.5rem' }}>
                      <span className={styles.resultLabel}>現在のLDL-C</span>
                      <span className={styles.resultValue} style={{
                        color: parseFloat(ldl) >= parseFloat(judge.mgmt.match(/\d+/)?.[0]) ? '#C62828' : '#2E7D32'
                      }}>
                        {ldl} mg/dL — {parseFloat(ldl) >= parseFloat(judge.mgmt.match(/\d+/)?.[0]) ? '目標未達' : '目標達成'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.note}>
        <p>
          <strong>判定ロジック:</strong> 冠動脈疾患・脳血管疾患・PAD・FH・CKDの既往がある場合は
          スコア計算を行わず、自動的に二次予防（高リスク）に分類されます。
          FHまたはACS既往ではLDL 70 mg/dL未満が目標です。
        </p>
        <p>
          <strong>参考:</strong> 日本動脈硬化学会 動脈硬化性疾患予防ガイドライン 2022年版;
          久山町研究（Hisayama Study）.
        </p>
      </div>
    </div>
  );
}
