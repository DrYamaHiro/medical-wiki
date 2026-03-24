import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const OPTIONS = [
  { value: 0, label: '0:居眠りしない' },
  { value: 1, label: '1:時に' },
  { value: 2, label: '2:しばしば' },
  { value: 3, label: '3:ほぼ必ず' },
];

const QUESTIONS = [
  '座って読書しているとき',
  'テレビを見ているとき',
  '公の場所で座って何もしていないとき（劇場や会議など）',
  '1時間続けて車に乗せてもらっているとき',
  '午後、横になって休憩しているとき',
  '座って人と話しているとき',
  '昼食後、静かに座っているとき',
  '車の中で、交通渋滞で2-3分止まっているとき',
];

function getJudgment(score) {
  if (score <= 10) return { text: '正常', color: '#2E7D32' };
  if (score <= 14) return { text: '軽度眠気', color: '#F9A825' };
  if (score <= 17) return { text: '中等度眠気', color: '#E65100' };
  return { text: '重度眠気', color: '#C62828' };
}

export default function ESSCalculator() {
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
  const osasAlert = score !== null && score >= 11;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>ESS（エプワース眠気尺度）</p>
          <p className={styles.calcSub}>日中の眠気の評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
          以下の状況で居眠りをしてしまう可能性はどのくらいですか？
        </div>
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
            <span className={styles.resultValue}>{score} / 24 点</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      {osasAlert && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.7rem 1rem',
          background: '#FFF3E0',
          border: '2px solid #E65100',
          borderRadius: '8px',
          color: '#E65100',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          11点以上：閉塞性睡眠時無呼吸症候群（OSAS）の可能性を評価してください
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-10:正常 / 11-14:軽度眠気 / 15-17:中等度眠気 / 18-24:重度眠気。<br />
        <strong>注:</strong> ESS 11点以上は病的な日中過眠を示唆し、OSASをはじめとする睡眠障害の精査が推奨されます。
      </div>
    </div>
  );
}
