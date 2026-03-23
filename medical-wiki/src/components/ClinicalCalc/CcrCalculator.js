import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * Ccr（クレアチニンクリアランス）計算ツール
 *
 * 計算式（Cockcroft-Gault式）:
 *   Ccr (mL/min) = (140 - 年齢) × 体重(kg) / (72 × 血清Cr(mg/dL))
 *   女性は × 0.85
 *
 * 判定:
 *   90以上:  正常
 *   60-89:   軽度低下
 *   30-59:   中等度低下
 *   15-29:   高度低下
 *   15未満:  末期腎不全
 */

const CCR_STAGES = [
  { label: '正常', min: 90, max: Infinity, color: '#2E7D32' },
  { label: '軽度低下', min: 60, max: 89, color: '#558B2F' },
  { label: '中等度低下', min: 30, max: 59, color: '#E65100' },
  { label: '高度低下', min: 15, max: 29, color: '#C62828' },
  { label: '末期腎不全', min: 0, max: 14, color: '#B71C1C' },
];

function getCcrStage(ccr) {
  for (const s of CCR_STAGES) {
    if (ccr >= s.min) return s;
  }
  return CCR_STAGES[CCR_STAGES.length - 1];
}

export default function CcrCalculator() {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [cr, setCr] = useState('');

  const ccr = useMemo(() => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    const c = parseFloat(cr);
    if (!a || !w || !c || a <= 0 || w <= 0 || c <= 0) return null;
    let val = ((140 - a) * w) / (72 * c);
    if (sex === 'female') val *= 0.85;
    return val;
  }, [sex, age, weight, cr]);

  const stage = useMemo(() => {
    if (ccr === null) return null;
    return getCcrStage(ccr);
  }, [ccr]);

  const reset = () => { setSex('male'); setAge(''); setWeight(''); setCr(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>Ccr（クレアチニンクリアランス）</h3>
          <p className={styles.calcSub}>Cockcroft-Gault式</p>
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

        {/* 体重 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            体重
            <span className={styles.inputUnit}>kg</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={styles.inputField}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
            />
            <span className={styles.unitText}>kg</span>
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
          <span className={styles.resultLabel}>Ccr</span>
          <span className={styles.resultValue}>
            {ccr !== null ? ccr.toFixed(1) : '---'}
            {ccr !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>
                mL/min
              </span>
            )}
          </span>
        </div>
        {stage && (
          <div className={styles.resultJudge} style={{ background: stage.color }}>
            {stage.label}
          </div>
        )}
      </div>

      {/* 注意喚起 */}
      {ccr !== null && ccr < 30 && (
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
          Ccr 30未満: 多くの薬剤で投与量調整または禁忌となります
        </div>
      )}

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>Ccr (mL/min)</th>
              <th>腎機能</th>
            </tr>
          </thead>
          <tbody>
            {CCR_STAGES.map((s) => (
              <tr key={s.label} className={stage && stage.label === s.label ? styles.active : ''}>
                <td style={{ color: s.color, fontWeight: 700 }}>
                  {s.min === 0 ? `${s.max} 未満` : s.max === Infinity ? `${s.min} 以上` : `${s.min}〜${s.max}`}
                </td>
                <td>{s.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> Ccr = (140 - 年齢) × 体重(kg) / (72 × Cr)（女性は × 0.85）
        </p>
        <p>
          <strong>注意:</strong> 薬剤投与量調整に広く使用。eGFRとは異なる値となるため目的に応じて使い分けてください。
          筋肉量が極端な場合は不正確になる可能性があります。
        </p>
        <p>Cockcroft DW, Gault MH. Nephron. 1976</p>
      </div>
    </div>
  );
}
