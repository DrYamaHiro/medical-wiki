import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  {
    text: 'あなたはアルコール含有飲料をどのくらいの頻度で飲みますか?',
    options: [
      { value: 0, label: '0:飲まない' },
      { value: 1, label: '1:月1回以下' },
      { value: 2, label: '2:月2-4回' },
      { value: 3, label: '3:週2-3回' },
      { value: 4, label: '4:週4回以上' },
    ],
  },
  {
    text: '飲酒するときには通常どのくらいの量を飲みますか?（1-2杯=ビール中瓶1本程度）',
    options: [
      { value: 0, label: '0:1-2杯' },
      { value: 1, label: '1:3-4杯' },
      { value: 2, label: '2:5-6杯' },
      { value: 3, label: '3:7-9杯' },
      { value: 4, label: '4:10杯以上' },
    ],
  },
  {
    text: '1度に6杯以上飲酒することがどのくらいの頻度でありますか?',
    options: [
      { value: 0, label: '0:ない' },
      { value: 1, label: '1:月1回未満' },
      { value: 2, label: '2:月1回' },
      { value: 3, label: '3:週1回' },
      { value: 4, label: '4:毎日/ほぼ毎日' },
    ],
  },
];

function getJudgment(score, sex) {
  const lowMax = sex === 'male' ? 3 : 2;
  const midMax = 7;
  if (score <= lowMax) return { text: '低リスク', color: '#2E7D32' };
  if (score <= midMax) return { text: '危険飲酒', color: '#F9A825' };
  return { text: '高リスク飲酒。完全版AUDITでの詳細評価を推奨', color: '#C62828' };
}

export default function AUDITCCalculator() {
  const [sex, setSex] = useState(null);
  const [answers, setAnswers] = useState(Array(3).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSex(null);
    setAnswers(Array(3).fill(null));
  }, []);

  const score = useMemo(() => {
    if (answers.some(a => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers]);

  const judge = score !== null && sex !== null ? getJudgment(score, sex) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>AUDIT-C</p>
          <p className={styles.calcSub}>アルコール使用障害スクリーニング（簡易版3問）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 性別選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>性別（判定基準が異なります）</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex(sex === 'male' ? null : 'male')}
            >
              男性
            </button>
            <button
              className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex(sex === 'female' ? null : 'female')}
            >
              女性
            </button>
          </div>
        </div>

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

      {score !== null && sex === null && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.5rem 1rem',
          background: '#FFF3E0',
          border: '1px solid #F9A825',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#E65100',
        }}>
          性別を選択すると判定が表示されます
        </div>
      )}

      {judge && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>合計スコア</span>
            <span className={styles.resultValue}>{score} / 12 点</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong><br />
        男性: 0-3 低リスク / 4-7 危険飲酒 / 8-12 高リスク飲酒<br />
        女性: 0-2 低リスク / 3-7 危険飲酒 / 8-12 高リスク飲酒<br />
        <strong>注:</strong> AUDIT-Cは完全版AUDIT(10問)の最初の3問で構成される簡易スクリーニングです。
        陽性の場合は完全版AUDITでの評価を推奨します。
      </div>
    </div>
  );
}
