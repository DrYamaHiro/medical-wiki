import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * eGFR（推算糸球体濾過量）計算ツール
 *
 * 計算式（日本腎臓学会 2012年）:
 *   eGFR (mL/min/1.73m²) = 194 × Cr^(-1.094) × 年齢^(-0.287)
 *   女性は × 0.739
 *
 * CKDステージ判定:
 *   G1:  eGFR >= 90   正常または高値
 *   G2:  eGFR 60-89   正常または軽度低下
 *   G3a: eGFR 45-59   軽度〜中等度低下
 *   G3b: eGFR 30-44   中等度〜高度低下
 *   G4:  eGFR 15-29   高度低下
 *   G5:  eGFR < 15    末期腎不全
 */

const CKD_STAGES = [
  { stage: 'G1', min: 90, max: Infinity, label: '正常または高値', color: '#2E7D32' },
  { stage: 'G2', min: 60, max: 89, label: '正常または軽度低下', color: '#558B2F' },
  { stage: 'G3a', min: 45, max: 59, label: '軽度〜中等度低下', color: '#F9A825' },
  { stage: 'G3b', min: 30, max: 44, label: '中等度〜高度低下', color: '#E65100' },
  { stage: 'G4', min: 15, max: 29, label: '高度低下', color: '#C62828' },
  { stage: 'G5', min: 0, max: 14, label: '末期腎不全', color: '#B71C1C' },
];

function getCKDStage(egfr) {
  for (const s of CKD_STAGES) {
    if (egfr >= s.min) return s;
  }
  return CKD_STAGES[CKD_STAGES.length - 1];
}

export default function EGFRCalculator() {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [cr, setCr] = useState('');

  const egfr = useMemo(() => {
    const a = parseFloat(age);
    const c = parseFloat(cr);
    if (!a || !c || a <= 0 || c <= 0) return null;
    let val = 194 * Math.pow(c, -1.094) * Math.pow(a, -0.287);
    if (sex === 'female') val *= 0.739;
    return val;
  }, [sex, age, cr]);

  const stage = useMemo(() => {
    if (egfr === null) return null;
    return getCKDStage(egfr);
  }, [egfr]);

  const reset = () => { setSex('male'); setAge(''); setCr(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>eGFR（推算糸球体濾過量）</h3>
          <p className={styles.calcSub}>日本腎臓学会 2012年式</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 性別 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>性別</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('male')}
            >
              男性
            </button>
            <button
              className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('female')}
            >
              女性
            </button>
          </div>
        </div>

        {/* 年齢 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>年齢</label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="18"
              className={styles.inputField}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>歳</span>
          </div>
        </div>

        {/* 血清クレアチニン */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            血清クレアチニン
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.01"
              min="0"
              className={styles.inputField}
              value={cr}
              onChange={(e) => setCr(e.target.value)}
              placeholder="0.00"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>eGFR</span>
          <span className={styles.resultValue}>
            {egfr !== null ? egfr.toFixed(1) : '---'}
            {egfr !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>
                mL/min/1.73m²
              </span>
            )}
          </span>
        </div>
        {stage && (
          <div className={styles.resultJudge} style={{ background: stage.color }}>
            CKDステージ {stage.stage}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{stage.label}</span>
          </div>
        )}
      </div>

      {/* 腎臓専門医への紹介基準 */}
      {egfr !== null && egfr < 45 && (
        <div style={{
          margin: '0 1.2rem 0.8rem',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          background: '#FFF3E0',
          border: '1px solid #E65100',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#BF360C',
        }}>
          eGFR 45未満: 腎臓専門医への紹介を検討してください
        </div>
      )}

      {/* CKDステージ一覧テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>ステージ</th>
              <th>eGFR</th>
              <th>腎機能</th>
            </tr>
          </thead>
          <tbody>
            {CKD_STAGES.map((s) => (
              <tr key={s.stage} className={stage && stage.stage === s.stage ? styles.active : ''}>
                <td style={{ color: s.color, fontWeight: 700 }}>{s.stage}</td>
                <td>{s.min === 0 ? `${s.max} 未満` : s.max === Infinity ? `${s.min} 以上` : `${s.min}〜${s.max}`}</td>
                <td>{s.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> eGFR = 194 × Cr<sup>-1.094</sup> × 年齢<sup>-0.287</sup>（女性は × 0.739）
        </p>
        <p>
          <strong>注意:</strong> 18歳以上、安定した腎機能の場合に使用。
          筋肉量が極端に少ない/多い場合は不正確になる可能性があります。
        </p>
        <p>日本腎臓学会 CKD診療ガイド 2012</p>
      </div>
    </div>
  );
}
