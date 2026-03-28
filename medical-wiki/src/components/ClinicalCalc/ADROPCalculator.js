import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const ITEMS = [
  { key: 'A', label: 'A (Age): 男性70歳以上 / 女性75歳以上', score: 1 },
  { key: 'D', label: 'D (Dehydration): BUN 21mg/dL以上 or 脱水あり', score: 1 },
  { key: 'R', label: 'R (Respiration): SpO\u2082 90%以下', score: 1 },
  { key: 'O', label: 'O (Orientation): 意識障害あり', score: 1 },
  { key: 'P', label: 'P (Pressure): 収縮期血圧 90mmHg以下', score: 1 },
];

function getJudgment(score) {
  if (score === 0) return { text: '軽症 \u2014 外来治療', color: '#2E7D32' };
  if (score === 1) return { text: '中等症 \u2014 外来 or 入院', color: '#F9A825' };
  if (score === 2) return { text: '中等症 \u2014 入院', color: '#E65100' };
  if (score === 3) return { text: '重症 \u2014 入院治療', color: '#C62828' };
  return { text: '超重症 \u2014 ICU入院', color: '#C62828' };
}

export default function ADROPCalculator() {
  const [checks, setChecks] = useState({
    A: false, D: false, R: false, O: false, P: false,
  });

  const toggle = useCallback((key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    setChecks({ A: false, D: false, R: false, O: false, P: false });
  }, []);

  const score = ITEMS.reduce((sum, item) => sum + (checks[item.key] ? item.score : 0), 0);
  const judgment = getJudgment(score);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>A-DROP スコア</p>
          <p className={styles.calcSub}>市中肺炎 重症度分類</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.checkList}>
          {ITEMS.map((item) => (
            <label
              key={item.key}
              className={`${styles.checkItem} ${checks[item.key] ? styles.checkItemActive : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checks[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className={styles.checkLabel}>{item.label}</span>
              <span className={styles.checkScore}>+{item.score}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>合計スコア</span>
          <span className={styles.resultValue}>{score} 点</span>
        </div>
        <div className={styles.resultJudge} style={{ background: judgment.color }}>
          {judgment.text}
        </div>
      </div>

      <div className={styles.note}>
        <strong>注:</strong> 日本呼吸器学会 成人肺炎診療ガイドライン2024。市中肺炎（CAP）の重症度分類に使用。<br />
        A-DROPは日本独自のスコアリングで、CURB-65の日本版に相当します。
      </div>
    </div>
  );
}
