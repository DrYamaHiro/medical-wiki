import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const OPTIONS = [
  { value: 0, label: '0:ない' },
  { value: 1, label: '1:まれに' },
  { value: 2, label: '2:時々' },
  { value: 3, label: '3:しばしば' },
  { value: 4, label: '4:いつも' },
];

const QUESTIONS = [
  '胸やけがしますか',
  'おなかがはることがありますか',
  '食事をした後に胃が重苦しい（もたれる）ことがありますか',
  '思わず手のひらで胸をこすることがありますか',
  '食べた後、気持ちが悪くなることがありますか',
  '食後に胸やけがおこりますか',
  'のどの違和感（ヒリヒリなど）がありますか',
  '食事の途中で満腹になってしまいますか',
  'ものを飲み込むと、つかえることがありますか',
  '酸っぱい液体がのどまで上がってくることがありますか',
  'ゲップがよくでますか',
  '前かがみをすると胸やけがしますか',
];

// 酸逆流スコア: Q1,4,6,7,9,10,12 (index 0,3,5,6,8,9,11)
const REFLUX_INDICES = [0, 3, 5, 6, 8, 9, 11];
// 運動不全スコア: Q2,3,5,8,11 (index 1,2,4,7,10)
const DYSMOTILITY_INDICES = [1, 2, 4, 7, 10];

function getJudgment(score) {
  if (score <= 7) return { text: '正常範囲', color: '#2E7D32' };
  return { text: 'GERD疑い', color: '#C62828' };
}

export default function FSSGCalculator() {
  const [answers, setAnswers] = useState(Array(12).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(12).fill(null));
  }, []);

  const totalScore = useMemo(() => {
    if (answers.some((a) => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers]);

  const refluxScore = useMemo(() => {
    if (REFLUX_INDICES.some((i) => answers[i] === null)) return null;
    return REFLUX_INDICES.reduce((sum, i) => sum + answers[i], 0);
  }, [answers]);

  const dysmotilityScore = useMemo(() => {
    if (DYSMOTILITY_INDICES.some((i) => answers[i] === null)) return null;
    return DYSMOTILITY_INDICES.reduce((sum, i) => sum + answers[i], 0);
  }, [answers]);

  const judge = totalScore !== null ? getJudgment(totalScore) : null;

  const dominance = (refluxScore !== null && dysmotilityScore !== null)
    ? (refluxScore > dysmotilityScore ? '酸逆流優位' : refluxScore < dysmotilityScore ? '運動不全優位' : '同等')
    : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>FSSG</p>
          <p className={styles.calcSub}>Frequency Scale for the Symptoms of GERD</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>Q{i + 1}. {q}</label>
            <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.toggleBtn} ${answers[i] === opt.value ? styles.toggleBtnActive : ''}`}
                  onClick={() => setAnswer(i, opt.value)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
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
            <span className={styles.resultValue}>{totalScore} / 48 点</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>酸逆流スコア</span>
            <span className={styles.resultValue}>{refluxScore} / 28 点</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>運動不全スコア</span>
            <span className={styles.resultValue}>{dysmotilityScore} / 20 点</span>
          </div>
          {dominance && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>優位パターン</span>
              <span className={styles.resultValue} style={{ fontSize: '1rem' }}>{dominance}</span>
            </div>
          )}
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-7点: 正常範囲 / 8点以上: GERD疑い<br />
        <strong>サブスコア:</strong> 酸逆流スコア（Q1,4,6,7,9,10,12）/ 運動不全スコア（Q2,3,5,8,11）<br />
        <strong>参考:</strong> Kusano M, et al. J Gastroenterol 2004; 39(9):888-891.
      </div>
    </div>
  );
}
