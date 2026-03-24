import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  { id: 1,  text: '自分が吸うつもりよりも、ずっと多くタバコを吸ってしまうことがありましたか' },
  { id: 2,  text: '禁煙や本数を減らそうと試みて、できなかったことがありましたか' },
  { id: 3,  text: '禁煙したり本数を減らそうとしたときに、タバコがほしくてほしくてたまらなくなることがありましたか' },
  { id: 4,  text: '禁煙したり本数を減らしたときに、イライラ・神経質・落ちつかない・集中しにくいなどがありましたか' },
  { id: 5,  text: '禁煙したり本数を減らそうとしたときに、上記の症状を消すためにまたタバコを吸い始めることがありましたか' },
  { id: 6,  text: '重い病気にかかったときに、タバコはよくないとわかっているのに吸うことがありましたか' },
  { id: 7,  text: 'タバコのために自分に健康問題が起きているとわかっていても、吸うことがありましたか' },
  { id: 8,  text: 'タバコのために自分に精神的問題が起きているとわかっていても、吸うことがありましたか' },
  { id: 9,  text: '自分はタバコに依存していると感じることがありましたか' },
  { id: 10, text: 'タバコが吸えないような仕事やつきあいを避けることが何度かありましたか' },
];

function getJudgment(score) {
  if (score <= 4) return { text: 'ニコチン依存なし', color: '#2E7D32' };
  return { text: 'ニコチン依存あり', color: '#C62828' };
}

export default function TDSCalculator() {
  const [checks, setChecks] = useState({});

  const toggle = useCallback((id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const reset = useCallback(() => {
    setChecks({});
  }, []);

  const score = QUESTIONS.reduce((sum, q) => sum + (checks[q.id] ? 1 : 0), 0);
  const judgment = getJudgment(score);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>TDS（ニコチン依存度スクリーニング）</p>
          <p className={styles.calcSub}>Tobacco Dependence Screener</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.checkList}>
          {QUESTIONS.map((q) => (
            <label
              key={q.id}
              className={`${styles.checkItem} ${checks[q.id] ? styles.checkItemActive : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={!!checks[q.id]}
                onChange={() => toggle(q.id)}
              />
              <span className={styles.checkLabel}>Q{q.id}. {q.text}</span>
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

      {score >= 5 && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.7rem 1rem',
          background: '#1565C0',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          禁煙治療の保険適用要件の1つを満たします
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-4点: ニコチン依存なし / 5-10点: ニコチン依存あり<br />
        <strong>参考:</strong> Kawakami N, et al. Addict Behav 1999; 24(2):155-166.<br />
        禁煙治療の保険適用には、TDS 5点以上に加え、ブリンクマン指数（1日本数 x 年数）200以上、
        直ちに禁煙する意思、禁煙治療の説明と同意が必要です。
      </div>
    </div>
  );
}
