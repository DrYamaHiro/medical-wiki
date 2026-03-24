import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const OPTIONS = [
  { value: 0, label: '0:全くない' },
  { value: 1, label: '1:数日' },
  { value: 2, label: '2:半分以上' },
  { value: 3, label: '3:ほぼ毎日' },
];

const QUESTIONS = [
  '緊張、不安、神経過敏に感じる',
  '心配を止められない、またはコントロールできない',
  'いろいろなことを心配しすぎる',
  'くつろげない',
  'じっとしていられないほど落ち着かない',
  'いらいらしやすい、怒りっぽくなる',
  '何か恐ろしいことが起こるのではないかと怖くなる',
];

function getJudgment(score) {
  if (score <= 4) return { text: '最小限', color: '#2E7D32' };
  if (score <= 9) return { text: '軽度', color: '#558B2F' };
  if (score <= 14) return { text: '中等度', color: '#F9A825' };
  return { text: '重度', color: '#C62828' };
}

export default function GAD7Calculator() {
  const [answers, setAnswers] = useState(Array(7).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(7).fill(null));
  }, []);

  const score = useMemo(() => {
    if (answers.some((a) => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers]);

  const judge = score !== null ? getJudgment(score) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>GAD-7</p>
          <p className={styles.calcSub}>全般性不安障害 重症度評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>Q{i + 1}. {q}</label>
            <div className={styles.toggleGroup}>
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.toggleBtn} ${answers[i] === opt.value ? styles.toggleBtnActive : ''}`}
                  onClick={() => setAnswer(i, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {judge && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>合計スコア</span>
            <span className={styles.resultValue}>{score} / 21 点</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-4:最小限 / 5-9:軽度 / 10-14:中等度 / 15-21:重度。<br />
        <strong>注:</strong> 過去2週間の症状について評価します。10点以上で不安障害の精査を考慮してください。
      </div>
    </div>
  );
}
