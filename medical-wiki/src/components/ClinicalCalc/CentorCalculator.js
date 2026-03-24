import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const CHECK_ITEMS = [
  { key: 'exudate', label: '扁桃の白苔・滲出物', score: 1 },
  { key: 'lymph', label: '前頸部リンパ節の圧痛・腫脹', score: 1 },
  { key: 'fever', label: '発熱 38℃以上', score: 1 },
  { key: 'noCough', label: '咳嗽がない', score: 1 },
];

const AGE_OPTIONS = [
  { key: 'child', label: '3-14歳', score: 1 },
  { key: 'adult', label: '15-44歳', score: 0 },
  { key: 'senior', label: '45歳以上', score: -1 },
];

function getJudgment(score) {
  if (score <= 1) return { text: 'GAS確率 1-10% — 検査・抗菌薬不要', color: '#2E7D32' };
  if (score <= 3) return { text: 'GAS確率 10-35% — 迅速検査実施', color: '#F9A825' };
  return { text: 'GAS確率 50-65% — 迅速検査＋経験的治療考慮', color: '#C62828' };
}

export default function CentorCalculator() {
  const [checks, setChecks] = useState({
    exudate: false, lymph: false, fever: false, noCough: false,
  });
  const [ageKey, setAgeKey] = useState(null);

  const toggleCheck = useCallback((key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const selectAge = useCallback((key) => {
    setAgeKey((prev) => (prev === key ? null : key));
  }, []);

  const reset = useCallback(() => {
    setChecks({ exudate: false, lymph: false, fever: false, noCough: false });
    setAgeKey(null);
  }, []);

  const checkScore = CHECK_ITEMS.reduce((sum, item) => sum + (checks[item.key] ? item.score : 0), 0);
  const ageScore = ageKey !== null ? AGE_OPTIONS.find((o) => o.key === ageKey).score : 0;
  const totalScore = checkScore + ageScore;
  const hasAge = ageKey !== null;
  const judgment = getJudgment(totalScore);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>Centor / McIsaac Score</p>
          <p className={styles.calcSub}>溶連菌性咽頭炎リスク評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.checkList}>
          {CHECK_ITEMS.map((item) => (
            <label
              key={item.key}
              className={`${styles.checkItem} ${checks[item.key] ? styles.checkItemActive : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checks[item.key]}
                onChange={() => toggleCheck(item.key)}
              />
              <span className={styles.checkLabel}>{item.label}</span>
              <span className={styles.checkScore}>+{item.score}</span>
            </label>
          ))}
        </div>

        <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
          <label className={styles.inputLabel}>年齢区分（McIsaac修正）</label>
          <div className={styles.toggleGroup}>
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${styles.toggleBtn} ${ageKey === opt.key ? styles.toggleBtnActive : ''}`}
                onClick={() => selectAge(opt.key)}
              >
                {opt.label}（{opt.score >= 0 ? '+' : ''}{opt.score}）
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>合計スコア</span>
          <span className={styles.resultValue}>{totalScore} 点</span>
        </div>
        {!hasAge && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel} style={{ fontSize: '0.78rem', color: '#E65100' }}>
              年齢区分を選択してください（Centor原法では年齢補正なし）
            </span>
          </div>
        )}
        <div className={styles.resultJudge} style={{ background: judgment.color }}>
          {judgment.text}
        </div>
      </div>

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-1点: GAS確率1-10%（検査・抗菌薬不要）/ 2-3点: GAS確率10-35%（迅速検査実施）/ 4-5点: GAS確率50-65%（迅速検査＋経験的治療考慮）<br />
        <strong>参考:</strong> Centor RM, et al. Med Decis Making 1981; McIsaac WJ, et al. CMAJ 1998.<br />
        原法（Centor）は4項目のみ。McIsaac修正では年齢による補正を加えます。
      </div>
    </div>
  );
}
