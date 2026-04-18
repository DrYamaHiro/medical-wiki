import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

function getJudgment(score) {
  if (score === 0) return { text: '痒みなし', color: '#2E7D32' };
  if (score <= 3) return { text: '軽度の痒み', color: '#8bc34a' };
  if (score <= 6) return { text: '中等度の痒み', color: '#F9A825' };
  return { text: '重度の痒み', color: '#c62828' };
}

export default function WiNrsCalculator() {
  const [score, setScore] = useState(null);
  const reset = useCallback(() => setScore(null), []);

  const judgment = score !== null ? getJudgment(score) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>WI-NRS（Worst Itch NRS）</p>
          <p className={styles.calcSub}>最悪の痒みの数値評価スケール（0〜10）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
          過去24時間で最もひどかった痒みの強さを0〜10で評価してください。
        </div>

        <div className={styles.inputGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-500)', marginBottom: '0.5rem' }}>
            <span>0 = 痒みなし</span>
            <span>10 = 想像しうる最悪の痒み</span>
          </div>

          {/* スライダー風のボタン列 */}
          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <button key={i} onClick={() => setScore(score === i ? null : i)}
                style={{
                  width: '36px', height: '40px', fontSize: '1rem', fontWeight: 700,
                  border: score === i ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px', cursor: 'pointer',
                  background: score === i
                    ? (i === 0 ? '#4caf50' : i <= 3 ? '#8bc34a' : i <= 6 ? '#ff9800' : '#f44336')
                    : 'var(--ifm-background-color)',
                  color: score === i ? '#fff' : 'var(--ifm-font-color-base)',
                }}>
                {i}
              </button>
            ))}
          </div>

          {/* 視覚的な重症度バー */}
          <div style={{ display: 'flex', marginTop: '0.5rem', borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
            <div style={{ flex: 1, background: '#4caf50' }} title="痒みなし (0)" />
            <div style={{ flex: 3, background: '#8bc34a' }} title="軽度 (1-3)" />
            <div style={{ flex: 3, background: '#ff9800' }} title="中等度 (4-6)" />
            <div style={{ flex: 4, background: '#f44336' }} title="重度 (7-10)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '2px' }}>
            <span>なし</span><span>軽度</span><span>中等度</span><span>重度</span>
          </div>
        </div>
      </div>

      {score !== null && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>WI-NRS スコア</span>
            <span className={styles.resultValue}>{score} / 10</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judgment.color }}>
            {judgment.text}
            {score >= 7 && ' — 治療介入の強化を検討'}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>WI-NRS について:</strong><br />
        ・過去24時間の「最もひどかった痒み」を0-10で患者が自己評価<br />
        ・0: 痒みなし / 1-3: 軽度 / 4-6: 中等度 / 7-10: 重度<br />
        ・結節性痒疹・アトピー性皮膚炎の痒みの評価に使用<br />
        ・臨床試験では WI-NRS 4点以上の改善が有意な変化とされる<br />
        ・NRS（痒み）とは別に、VAS（Visual Analogue Scale）も併用されることがある
      </div>
    </div>
  );
}
