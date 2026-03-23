import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const ITEMS = [
  { key: 'C', label: 'C: うっ血性心不全', score: 1 },
  { key: 'H', label: 'H: 高血圧', score: 1 },
  { key: 'A2', label: 'A\u2082: 年齢 75歳以上', score: 2 },
  { key: 'D', label: 'D: 糖尿病', score: 1 },
  { key: 'S2', label: 'S\u2082: 脳卒中 / TIA既往', score: 2 },
  { key: 'V', label: 'V: 血管疾患（心筋梗塞・PAD・大動脈プラーク）', score: 1 },
  { key: 'A', label: 'A: 年齢 65-74歳', score: 1 },
  { key: 'Sc', label: 'Sc: 女性', score: 1 },
];

function getJudgment(score, checks) {
  const isFemale = checks.Sc;
  if (score === 0) {
    return { text: '低リスク \u2014 抗凝固療法なし', color: '#2E7D32' };
  }
  if (score === 1 && isFemale) {
    return { text: '低リスク \u2014 抗凝固療法なし（女性のみ1点）', color: '#2E7D32' };
  }
  if (score === 1) {
    return { text: '中リスク \u2014 抗凝固療法を考慮', color: '#F9A825' };
  }
  return { text: '高リスク \u2014 抗凝固療法推奨（DOAC推奨）', color: '#C62828' };
}

export default function CHADSCalculator() {
  const [checks, setChecks] = useState({
    C: false, H: false, A2: false, D: false,
    S2: false, V: false, A: false, Sc: false,
  });

  const toggle = useCallback((key) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // A2 と A は排他
      if (key === 'A2' && next.A2) next.A = false;
      if (key === 'A' && next.A) next.A2 = false;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setChecks({ C: false, H: false, A2: false, D: false, S2: false, V: false, A: false, Sc: false });
  }, []);

  const score = ITEMS.reduce((sum, item) => sum + (checks[item.key] ? item.score : 0), 0);
  const judgment = getJudgment(score, checks);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>CHA&#x2082;DS&#x2082;-VASc スコア</p>
          <p className={styles.calcSub}>心房細動 脳卒中リスク評価</p>
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
        <strong>注:</strong> 非弁膜症性心房細動における脳卒中リスク評価。日本循環器学会 不整脈治療ガイドライン2024準拠。<br />
        <strong>DOAC:</strong> ダビガトラン、リバーロキサバン、アピキサバン、エドキサバン。<br />
        A&#x2082;（75歳以上）と A（65-74歳）は排他的 &mdash; 片方をチェックするともう一方は自動オフになります。
      </div>
    </div>
  );
}
