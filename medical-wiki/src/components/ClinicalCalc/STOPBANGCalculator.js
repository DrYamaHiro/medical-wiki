import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const ITEMS = [
  { key: 'S', label: 'S (Snoring): 大きないびきをかきますか？' },
  { key: 'T', label: 'T (Tired): 日中に疲労感や眠気を感じますか？' },
  { key: 'O', label: 'O (Observed): 睡眠中に呼吸が止まっていると指摘されたことがありますか？' },
  { key: 'P', label: 'P (Pressure): 高血圧の治療中、または高血圧と言われたことがありますか？' },
  { key: 'B', label: 'B (BMI): BMI 35以上ですか？' },
  { key: 'A', label: 'A (Age): 50歳以上ですか？' },
  { key: 'N', label: 'N (Neck): 首回り 40cm以上ですか？' },
  { key: 'G', label: 'G (Gender): 男性ですか？' },
];

function getJudgment(score) {
  if (score <= 2) return { text: '低リスク', color: '#2E7D32' };
  if (score <= 4) return { text: '中リスク', color: '#F9A825' };
  return { text: '高リスク — 睡眠時無呼吸の可能性が高い', color: '#C62828' };
}

export default function STOPBANGCalculator() {
  const [checks, setChecks] = useState({
    S: false, T: false, O: false, P: false,
    B: false, A: false, N: false, G: false,
  });

  const toggle = useCallback((key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    setChecks({ S: false, T: false, O: false, P: false, B: false, A: false, N: false, G: false });
  }, []);

  const score = ITEMS.reduce((sum, item) => sum + (checks[item.key] ? 1 : 0), 0);
  const judgment = getJudgment(score);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>STOP-BANG スコア</p>
          <p className={styles.calcSub}>閉塞性睡眠時無呼吸リスク評価</p>
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
              <span className={styles.checkScore}>+1</span>
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
        <strong>判定基準:</strong> 0-2点: 低リスク / 3-4点: 中リスク / 5-8点: 高リスク<br />
        <strong>参考:</strong> Chung F, et al. Anesthesiology 2008; 108(5):812-821.<br />
        STOP-BANGスコア3点以上でOSASのスクリーニング検査（簡易PSG等）を考慮します。
      </div>
    </div>
  );
}
