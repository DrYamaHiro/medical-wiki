import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  {
    id: 1,
    text: '笑うことができたし、物事のおかしい面もわかった',
    options: [
      { score: 0, label: 'いつもと同様にできた' },
      { score: 1, label: 'あまりできなかった' },
      { score: 2, label: '明らかにできなかった' },
      { score: 3, label: '全くできなかった' },
    ],
  },
  {
    id: 2,
    text: '物事を楽しみにして待った',
    options: [
      { score: 0, label: 'いつもと同様' },
      { score: 1, label: 'あまりできなかった' },
      { score: 2, label: '明らかにできなかった' },
      { score: 3, label: 'ほとんどできなかった' },
    ],
  },
  {
    id: 3,
    text: '物事がうまくいかない時、自分を不必要に責めた',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'あまりそうではなかった' },
      { score: 2, label: 'はい、時々' },
      { score: 3, label: 'はい、たいてい' },
    ],
  },
  {
    id: 4,
    text: 'はっきりとした理由もないのに不安になったり心配した',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'ほとんどなかった' },
      { score: 2, label: 'はい、時々' },
      { score: 3, label: 'はい、しょっちゅう' },
    ],
  },
  {
    id: 5,
    text: 'はっきりとした理由もないのに恐怖に襲われた',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'ほとんどなかった' },
      { score: 2, label: 'はい、時々' },
      { score: 3, label: 'はい、しょっちゅう' },
    ],
  },
  {
    id: 6,
    text: 'することがたくさんあって大変だった',
    options: [
      { score: 0, label: 'いつもうまく対処した' },
      { score: 1, label: 'あまりうまく対処できなかった' },
      { score: 2, label: 'ほとんど対処できなかった' },
      { score: 3, label: '全く対処できなかった' },
    ],
  },
  {
    id: 7,
    text: '不幸せなので眠りにくかった',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'あまりなかった' },
      { score: 2, label: 'はい、時々' },
      { score: 3, label: 'はい、ほとんどいつも' },
    ],
  },
  {
    id: 8,
    text: '悲しくなったり惨めになった',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'あまりなかった' },
      { score: 2, label: 'はい、かなり' },
      { score: 3, label: 'はい、たいてい' },
    ],
  },
  {
    id: 9,
    text: '不幸せなので泣いていた',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'ほとんどなかった' },
      { score: 2, label: 'はい、かなり' },
      { score: 3, label: 'はい、ほとんどいつも' },
    ],
  },
  {
    id: 10,
    text: '自分自身を傷つけるという考えが浮かんできた',
    options: [
      { score: 0, label: 'いいえ' },
      { score: 1, label: 'ほとんどなかった' },
      { score: 2, label: 'はい、時々' },
      { score: 3, label: 'はい、かなり' },
    ],
  },
];

function getJudgment(score) {
  if (score <= 8) return { text: '正常範囲', color: '#2E7D32' };
  if (score <= 12) return { text: '産後うつの可能性', color: '#F9A825' };
  return { text: '産後うつの可能性高い', color: '#C62828' };
}

export default function EPDSCalculator() {
  const [answers, setAnswers] = useState({});

  const select = useCallback((qId, score) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }));
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
  }, []);

  const answeredCount = Object.keys(answers).length;
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const allAnswered = answeredCount === QUESTIONS.length;
  const judgment = allAnswered ? getJudgment(totalScore) : null;
  const q10Score = answers[10] ?? 0;
  const selfHarmRisk = q10Score >= 1;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>EPDS（エジンバラ産後うつ質問票）</p>
          <p className={styles.calcSub}>Edinburgh Postnatal Depression Scale</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {QUESTIONS.map((q) => (
          <div key={q.id} className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Q{q.id}. {q.text}
            </label>
            <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
              {q.options.map((opt) => (
                <button
                  key={opt.score}
                  className={`${styles.toggleBtn} ${answers[q.id] === opt.score ? styles.toggleBtnActive : ''}`}
                  onClick={() => select(q.id, opt.score)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                >
                  {opt.score}: {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>回答数</span>
          <span className={styles.resultValue}>{answeredCount} / 10</span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>合計スコア</span>
          <span className={styles.resultValue}>{allAnswered ? `${totalScore} 点` : '---'}</span>
        </div>
        {judgment && (
          <div className={styles.resultJudge} style={{ background: judgment.color }}>
            {judgment.text}
          </div>
        )}
      </div>

      {allAnswered && selfHarmRisk && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.7rem 1rem',
          background: '#C62828',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          ⚠ 自傷リスク警告: 質問10で1点以上 — 自殺・自傷の危険性について直接確認してください
        </div>
      )}

      {allAnswered && totalScore >= 9 && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.7rem 1rem',
          background: '#E65100',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          9点以上: 精神科・心療内科への専門医紹介を推奨します
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-8点: 正常範囲 / 9-12点: 産後うつの可能性 / 13-30点: 産後うつの可能性高い<br />
        <strong>参考:</strong> Cox JL, et al. Br J Psychiatry 1987; 150:782-786.<br />
        産後だけでなく、妊娠中のスクリーニングにも使用されます。カットオフ値は9点が一般的です。
      </div>
    </div>
  );
}
