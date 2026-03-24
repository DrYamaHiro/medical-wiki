import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const CATEGORIES = [
  {
    key: 'H',
    title: 'H — History（病歴）',
    options: [
      { value: 0, label: 'わずかに疑わしい' },
      { value: 1, label: 'やや疑わしい' },
      { value: 2, label: '非常に疑わしい' },
    ],
  },
  {
    key: 'E',
    title: 'E — ECG（心電図）',
    options: [
      { value: 0, label: '正常' },
      { value: 1, label: '非特異的再分極異常' },
      { value: 2, label: '有意なST偏位' },
    ],
  },
  {
    key: 'A',
    title: 'A — Age（年齢）',
    options: [
      { value: 0, label: '45歳未満' },
      { value: 1, label: '45-64歳' },
      { value: 2, label: '65歳以上' },
    ],
  },
  {
    key: 'R',
    title: 'R — Risk Factors（リスク因子）',
    description: '高血圧、糖尿病、喫煙、脂質異常症、肥満、冠動脈疾患家族歴',
    options: [
      { value: 0, label: 'なし' },
      { value: 1, label: '1-2個' },
      { value: 2, label: '3個以上 or 動脈硬化疾患既往' },
    ],
  },
  {
    key: 'T',
    title: 'T — Troponin（トロポニン）',
    options: [
      { value: 0, label: '正常範囲' },
      { value: 1, label: '正常上限の1-3倍' },
      { value: 2, label: '正常上限の3倍超' },
    ],
  },
];

function getJudgment(score) {
  if (score <= 3) {
    return { text: '低リスク（MACE 0.9-1.7%）— 外来フォロー可', color: '#2E7D32' };
  }
  if (score <= 6) {
    return { text: '中リスク（MACE 12-16%）— 入院精査推奨', color: '#F9A825' };
  }
  return { text: '高リスク（MACE 50-65%）— 緊急介入', color: '#C62828' };
}

export default function HEARTCalculator() {
  const [values, setValues] = useState({ H: 0, E: 0, A: 0, R: 0, T: 0 });

  const select = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues({ H: 0, E: 0, A: 0, R: 0, T: 0 });
  }, []);

  const score = Object.values(values).reduce((sum, v) => sum + v, 0);
  const judgment = getJudgment(score);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>HEART Score</p>
          <p className={styles.calcSub}>急性冠症候群（ACS）リスク評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              {cat.title}
              {cat.description && (
                <span className={styles.inputUnit}>（{cat.description}）</span>
              )}
            </label>
            <div className={styles.toggleGroup}>
              {cat.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.toggleBtn} ${values[cat.key] === opt.value ? styles.toggleBtnActive : ''}`}
                  onClick={() => select(cat.key, opt.value)}
                >
                  {opt.value}: {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
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
        <strong>判定基準:</strong> 0-3点: 低リスク（MACE 0.9-1.7%） / 4-6点: 中リスク（12-16%） / 7-10点: 高リスク（50-65%）<br />
        <strong>MACE:</strong> 主要心血管イベント（急性心筋梗塞、PCI/CABG、全死亡）<br />
        <strong>参考:</strong> Six AJ, et al. Neth Heart J 2008; 16(6):191-196.
      </div>
    </div>
  );
}
