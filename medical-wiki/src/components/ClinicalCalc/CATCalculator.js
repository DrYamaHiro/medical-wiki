import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  { left: '全く咳が出ない', right: 'いつも咳が出る' },
  { left: '全く痰がからまない', right: '痰でいっぱいだと感じる' },
  { left: '胸が締めつけられる感じは全くない', right: 'とても締めつけられる' },
  { left: '坂道や階段を上るときに息切れを感じない', right: 'とても息切れがする' },
  { left: '家庭での活動に制限はない', right: 'とても制限がある' },
  { left: '肺の状態にもかかわらず安心して外出できる', right: '肺の状態で外出に不安がある' },
  { left: 'ぐっすり眠れる', right: '肺の状態で眠れない' },
  { left: 'とても元気だ', right: '全く元気がない' },
];

const SCORE_OPTIONS = [0, 1, 2, 3, 4, 5];

function getJudgment(score) {
  if (score <= 9) return { text: '影響小', color: '#2E7D32' };
  if (score <= 20) return { text: '中等度', color: '#F9A825' };
  if (score <= 30) return { text: '高度', color: '#E65100' };
  return { text: '非常に高度', color: '#C62828' };
}

export default function CATCalculator() {
  const [answers, setAnswers] = useState(Array(8).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(8).fill(null));
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
          <p className={styles.calcTitle}>CAT</p>
          <p className={styles.calcSub}>COPD Assessment Test</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>
              Q{i + 1}. {q.left} ←→ {q.right}
            </label>
            <div className={styles.toggleGroup}>
              {SCORE_OPTIONS.map((val) => (
                <button
                  key={val}
                  className={`${styles.toggleBtn} ${answers[i] === val ? styles.toggleBtnActive : ''}`}
                  onClick={() => setAnswer(i, val)}
                  style={{ minWidth: '2.2rem', padding: '0.4rem 0.5rem', fontSize: '0.9rem' }}
                >
                  {val}
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
            <span className={styles.resultValue}>{score} / 40 点</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-9: 影響小 / 10-20: 中等度 / 21-30: 高度 / 31-40: 非常に高度<br />
        <strong>参考:</strong> Jones PW, et al. Eur Respir J 2009; 34(3):648-654.<br />
        CATスコア10以上はCOPDの症状が日常生活に影響を及ぼしていることを示します。
      </div>
    </div>
  );
}
