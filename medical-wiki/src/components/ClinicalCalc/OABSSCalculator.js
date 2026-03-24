import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  {
    text: '朝起きてから寝るまでに、何回くらい尿をしましたか',
    options: [
      { value: 0, label: '0:7回以下' },
      { value: 1, label: '1:8-14回' },
      { value: 2, label: '2:15回以上' },
    ],
  },
  {
    text: '夜寝てから朝起きるまでに、何回くらい尿をするために起きましたか',
    options: [
      { value: 0, label: '0:0回' },
      { value: 1, label: '1:1回' },
      { value: 2, label: '2:2回' },
      { value: 3, label: '3:3回以上' },
    ],
  },
  {
    text: '急に尿がしたくなり、我慢が難しいことがありましたか',
    options: [
      { value: 0, label: '0:なし' },
      { value: 1, label: '1:週1回未満' },
      { value: 2, label: '2:週1回以上' },
      { value: 3, label: '3:1日1回' },
      { value: 4, label: '4:1日2-4回' },
      { value: 5, label: '5:1日5回以上' },
    ],
  },
  {
    text: '急に尿がしたくなり、我慢できずに尿をもらすことがありましたか',
    options: [
      { value: 0, label: '0:なし' },
      { value: 1, label: '1:週1回未満' },
      { value: 2, label: '2:週1回以上' },
      { value: 3, label: '3:1日1回' },
      { value: 4, label: '4:1日2-4回' },
      { value: 5, label: '5:1日5回以上' },
    ],
  },
];

function getJudgment(score) {
  if (score <= 5) return { text: '軽症', color: '#2E7D32' };
  if (score <= 11) return { text: '中等症', color: '#F9A825' };
  return { text: '重症', color: '#C62828' };
}

export default function OABSSCalculator() {
  const [answers, setAnswers] = useState(Array(4).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(4).fill(null));
  }, []);

  const score = useMemo(() => {
    if (answers.some(a => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers]);

  const oabDiagnosis = useMemo(() => {
    if (score === null) return null;
    return answers[2] >= 2 && score >= 3;
  }, [answers, score]);

  const judge = score !== null ? getJudgment(score) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>OABSS</p>
          <p className={styles.calcSub}>過活動膀胱症状スコア</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>Q{i + 1}. {q.text}</label>
            <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
              {q.options.map(opt => (
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
            <span className={styles.resultValue}>{score} / 15 点</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>OAB 診断基準</span>
            <span className={styles.resultValue} style={{ color: oabDiagnosis ? '#C62828' : '#2E7D32', fontSize: '1rem' }}>
              {oabDiagnosis ? '該当（Q3≧2 かつ 合計≧3）' : '非該当'}
            </span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-5: 軽症 / 6-11: 中等症 / 12-15: 重症<br />
        <strong>OAB診断基準:</strong> 質問3（尿意切迫感）が2点以上 かつ 合計3点以上で過活動膀胱と診断します。
      </div>
    </div>
  );
}
