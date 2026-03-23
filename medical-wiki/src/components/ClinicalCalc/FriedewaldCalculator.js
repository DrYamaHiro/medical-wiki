import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * Friedewald式（LDL-C推算）計算ツール
 *
 * 計算式: LDL-C = TC - HDL-C - TG/5
 *   TG >= 400 mg/dL では使用不可（精度低下）
 *
 * 同時算出: non-HDL-C = TC - HDL-C
 *   non-HDL-C管理目標 = LDL-C目標 + 30 mg/dL
 *
 * 判定（日本動脈硬化学会 2022）:
 *   LDL < 120    正常域
 *   120 <= LDL < 140  境界域
 *   LDL >= 140   高LDL-C血症
 *
 * 参考: 日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022
 */
export default function FriedewaldCalculator() {
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');
  const [tg, setTg] = useState('');

  const tgOver400 = useMemo(() => {
    const tgVal = parseFloat(tg);
    return tgVal >= 400;
  }, [tg]);

  const ldl = useMemo(() => {
    const tcVal = parseFloat(tc);
    const hdlVal = parseFloat(hdl);
    const tgVal = parseFloat(tg);
    if (!tcVal || !hdlVal || !tgVal || tcVal <= 0 || hdlVal <= 0 || tgVal < 0) return null;
    if (tgVal >= 400) return null;
    return tcVal - hdlVal - tgVal / 5;
  }, [tc, hdl, tg]);

  const nonHdl = useMemo(() => {
    const tcVal = parseFloat(tc);
    const hdlVal = parseFloat(hdl);
    if (!tcVal || !hdlVal || tcVal <= 0 || hdlVal <= 0) return null;
    return tcVal - hdlVal;
  }, [tc, hdl]);

  const judge = useMemo(() => {
    if (ldl === null) return null;
    if (ldl < 120) return { text: '正常域', sub: 'LDL-C 120 mg/dL 未満', color: '#2E7D32' };
    if (ldl < 140) return { text: '境界域', sub: 'LDL-C 120〜139 mg/dL', color: '#F9A825' };
    return { text: '高LDL-C血症', sub: 'LDL-C 140 mg/dL 以上', color: '#C62828' };
  }, [ldl]);

  const reset = () => { setTc(''); setHdl(''); setTg(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>Friedewald式（LDL-C推算）</h3>
          <p className={styles.calcSub}>日本動脈硬化学会 2022</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 総コレステロール */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            総コレステロール（TC）
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={tc}
              onChange={(e) => setTc(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>

        {/* HDL-C */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            HDL-C
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>

        {/* 中性脂肪 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            中性脂肪（TG）
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>
      </div>

      {/* TG 400以上の警告 */}
      {tgOver400 && (
        <div style={{
          margin: '0 1.2rem 0.8rem',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          background: '#FFEBEE',
          border: '1px solid #C62828',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#B71C1C',
        }}>
          TG 400 mg/dL 以上のためFriedewald式は使用不可。直接法での測定を推奨します。
        </div>
      )}

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>LDL-C（推算）</span>
          <span className={styles.resultValue}>
            {ldl !== null ? ldl.toFixed(0) : '---'}
            {ldl !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>
                mg/dL
              </span>
            )}
          </span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>non-HDL-C</span>
          <span className={styles.resultValue}>
            {nonHdl !== null ? nonHdl.toFixed(0) : '---'}
            {nonHdl !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>
                mg/dL
              </span>
            )}
          </span>
        </div>
        {judge && (
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
          </div>
        )}
      </div>

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>LDL-C</th>
              <th>判定</th>
            </tr>
          </thead>
          <tbody>
            <tr className={ldl !== null && ldl < 120 ? styles.active : ''}>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>120 未満</td>
              <td>正常域</td>
            </tr>
            <tr className={ldl !== null && ldl >= 120 && ldl < 140 ? styles.active : ''}>
              <td style={{ color: '#F9A825', fontWeight: 700 }}>120 〜 139</td>
              <td>境界域</td>
            </tr>
            <tr className={ldl !== null && ldl >= 140 ? styles.active : ''}>
              <td style={{ color: '#C62828', fontWeight: 700 }}>140 以上</td>
              <td>高LDL-C血症</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> LDL-C = TC - HDL-C - TG/5
        </p>
        <p>
          <strong>non-HDL-C:</strong> 管理目標はLDL-C目標 + 30 mg/dL。
        </p>
        <p>
          <strong>注意:</strong> TG 400 mg/dL以上ではFriedewald式は使用不可（精度低下）。
          食後採血ではTGが上昇しLDL-Cが過小評価されます。
        </p>
        <p>
          日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022
        </p>
      </div>
    </div>
  );
}
