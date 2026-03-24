import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const IPSS_OPTIONS = [
  { value: 0, label: '0:全くない' },
  { value: 1, label: '1:5回に1回未満' },
  { value: 2, label: '2:2回に1回未満' },
  { value: 3, label: '3:約2回に1回' },
  { value: 4, label: '4:2回に1回以上' },
  { value: 5, label: '5:ほぼ毎回' },
];

const Q7_OPTIONS = [
  { value: 0, label: '0:なし' },
  { value: 1, label: '1:1回' },
  { value: 2, label: '2:2回' },
  { value: 3, label: '3:3回' },
  { value: 4, label: '4:4回' },
  { value: 5, label: '5:5回以上' },
];

const QOL_OPTIONS = [
  { value: 0, label: '0:とても満足' },
  { value: 1, label: '1:満足' },
  { value: 2, label: '2:ほぼ満足' },
  { value: 3, label: '3:どちらともいえない' },
  { value: 4, label: '4:やや不満' },
  { value: 5, label: '5:不満' },
  { value: 6, label: '6:とても不満' },
];

const QUESTIONS = [
  '排尿後に尿がまだ残っている感じがありましたか',
  '排尿後2時間以内にもう一度しなくてはならないことがありましたか',
  '排尿中に尿が途切れることがありましたか',
  '排尿を我慢するのが難しいことがありましたか',
  '尿の勢いが弱いことがありましたか',
  '排尿開始時にいきまなければならないことがありましたか',
  '就寝後排尿のために起きなければならなかった回数は?',
];

function getJudgment(score) {
  if (score <= 7) return { text: '軽症', color: '#2E7D32' };
  if (score <= 19) return { text: '中等症', color: '#F9A825' };
  return { text: '重症', color: '#C62828' };
}

export default function IPSSCalculator() {
  const [answers, setAnswers] = useState(Array(7).fill(null));
  const [qol, setQol] = useState(null);

  const setAnswer = useCallback((index, value) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(7).fill(null));
    setQol(null);
  }, []);

  const score = useMemo(() => {
    if (answers.some(a => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers]);

  const judge = score !== null ? getJudgment(score) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>IPSS</p>
          <p className={styles.calcSub}>国際前立腺症状スコア</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
          この1ヶ月間について回答してください
        </div>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>Q{i + 1}. {q}</label>
            <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
              {(i === 6 ? Q7_OPTIONS : IPSS_OPTIONS).map(opt => (
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

        {/* QOL */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>QOL. 現在の排尿状態がこのまま続くとしたら、どう思いますか?</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {QOL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`${styles.toggleBtn} ${qol === opt.value ? styles.toggleBtnActive : ''}`}
                onClick={() => setQol(qol === opt.value ? null : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {judge && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>IPSS 合計</span>
            <span className={styles.resultValue}>{score} / 35 点</span>
          </div>
          {qol !== null && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>QOL スコア</span>
              <span className={styles.resultValue}>{qol} / 6</span>
            </div>
          )}
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準（IPSS合計）:</strong> 0-7: 軽症 / 8-19: 中等症 / 20-35: 重症<br />
        <strong>QOL:</strong> 0（とても満足）〜 6（とても不満）で生活の質への影響を別途評価します。
      </div>
    </div>
  );
}
