import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * BMI（体格指数）計算ツール
 *
 * 計算式:
 *   BMI = 体重(kg) / 身長(m)^2
 *
 * 判定（日本肥満学会基準）:
 *   18.5未満:    低体重
 *   18.5-24.9:   普通体重
 *   25.0-29.9:   肥満1度
 *   30.0-34.9:   肥満2度
 *   35.0-39.9:   肥満3度
 *   40.0以上:    肥満4度
 */

const BMI_CATEGORIES = [
  { label: '低体重', min: 0, max: 18.49, color: '#0277BD' },
  { label: '普通体重', min: 18.5, max: 24.9, color: '#2E7D32' },
  { label: '肥満1度', min: 25.0, max: 29.9, color: '#F9A825' },
  { label: '肥満2度', min: 30.0, max: 34.9, color: '#E65100' },
  { label: '肥満3度', min: 35.0, max: 39.9, color: '#C62828' },
  { label: '肥満4度', min: 40.0, max: Infinity, color: '#B71C1C' },
];

function getBMICategory(bmi) {
  for (const cat of BMI_CATEGORIES) {
    if (bmi <= cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const hm = h / 100;
    return w / (hm * hm);
  }, [height, weight]);

  const category = useMemo(() => {
    if (bmi === null) return null;
    return getBMICategory(bmi);
  }, [bmi]);

  const idealWeight = useMemo(() => {
    const h = parseFloat(height);
    if (!h || h <= 0) return null;
    const hm = h / 100;
    return 22 * hm * hm;
  }, [height]);

  const weightDiff = useMemo(() => {
    const w = parseFloat(weight);
    if (idealWeight === null || !w || w <= 0) return null;
    return w - idealWeight;
  }, [weight, idealWeight]);

  const reset = () => { setHeight(''); setWeight(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>BMI（体格指数）</h3>
          <p className={styles.calcSub}>日本肥満学会基準</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 身長 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            身長
            <span className={styles.inputUnit}>cm</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={styles.inputField}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0.0"
            />
            <span className={styles.unitText}>cm</span>
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
      </div>

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>BMI</span>
          <span className={styles.resultValue}>
            {bmi !== null ? bmi.toFixed(1) : '---'}
            {bmi !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>
                kg/m²
              </span>
            )}
          </span>
        </div>
        {category && (
          <div className={styles.resultJudge} style={{ background: category.color }}>
            {category.label}
          </div>
        )}
      </div>

      {/* 標準体重・差 */}
      {idealWeight !== null && (
        <div style={{
          margin: '0 1.2rem 0.8rem',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          background: '#F5F5F5',
          fontSize: '0.85rem',
          color: '#333',
        }}>
          <div style={{ marginBottom: '0.3rem' }}>
            <strong>標準体重（BMI 22）:</strong> {idealWeight.toFixed(1)} kg
          </div>
          {weightDiff !== null && (
            <div>
              <strong>理想体重との差:</strong>{' '}
              <span style={{
                color: weightDiff > 0 ? '#C62828' : weightDiff < 0 ? '#0277BD' : '#2E7D32',
                fontWeight: 600,
              }}>
                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
              </span>
            </div>
          )}
        </div>
      )}

      {/* BMI 25以上の注意 */}
      {bmi !== null && bmi >= 25 && (
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
          BMI 25以上かつ健康障害を合併 → 肥満症と診断
        </div>
      )}

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>BMI</th>
              <th>判定</th>
            </tr>
          </thead>
          <tbody>
            {BMI_CATEGORIES.map((cat) => (
              <tr key={cat.label} className={category && category.label === cat.label ? styles.active : ''}>
                <td style={{ color: cat.color, fontWeight: 700 }}>
                  {cat.max === Infinity
                    ? `${cat.min} 以上`
                    : cat.min === 0
                      ? '18.5未満'
                      : `${cat.min}〜${cat.max}`}
                </td>
                <td>{cat.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> BMI = 体重(kg) / 身長(m)<sup>2</sup>
        </p>
        <p>
          <strong>注意:</strong> BMI 25以上かつ健康障害ありの場合は「肥満症」と診断されます。
        </p>
        <p>日本肥満学会 肥満症診療ガイドライン2022</p>
      </div>
    </div>
  );
}
