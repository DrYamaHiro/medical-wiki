import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const IGA_SCALE = [
  { score: 0, label: 'クリア（0）', desc: '炎症性病変なし、色素沈着のみ' },
  { score: 1, label: 'ほぼクリア（1）', desc: 'かすかな淡い紅斑のみ' },
  { score: 2, label: '軽症（2）', desc: '淡い紅斑、わずかな丘疹/浸潤' },
  { score: 3, label: '中等症（3）', desc: '明らかな紅斑・丘疹・浸潤' },
  { score: 4, label: '重症（4）', desc: '著明な紅斑、広範な丘疹・浸潤・苔癬化' },
];

export default function IgaCalculator() {
  const [score, setScore] = useState(null);
  const reset = useCallback(() => setScore(null), []);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>IGA（Investigator Global Assessment）</p>
          <p className={styles.calcSub}>医師による全般的重症度評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>皮膚所見を評価してスコアを選択</label>
        </div>
        {IGA_SCALE.map(item => (
          <div key={item.score} onClick={() => setScore(item.score)}
            className={`${styles.checkItem} ${score === item.score ? styles.checkItemActive : ''}`}
            style={{ marginBottom: '4px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700,
              background: score === item.score ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
              color: score === item.score ? '#fff' : 'var(--ifm-font-color-base)',
            }}>
              {item.score}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-500)' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {score !== null && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>IGA スコア</span>
            <span className={styles.resultValue}>{score}</span>
          </div>
          <div className={styles.resultJudge} style={{
            background: score === 0 ? '#4caf50' : score === 1 ? '#8bc34a' : score === 2 ? '#ff9800' : score === 3 ? '#f44336' : '#c62828',
          }}>
            {score === 0 && 'クリア — 治療目標達成'}
            {score === 1 && 'ほぼクリア — 治療目標達成（IGA 0-1）'}
            {score === 2 && '軽症'}
            {score === 3 && '中等症 — 生物学的製剤の適応を検討（IGA≧3）'}
            {score === 4 && '重症 — 生物学的製剤の適応を検討（IGA≧3）'}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>IGA について:</strong><br />
        ・アトピー性皮膚炎の全般的重症度を5段階（0-4）で評価<br />
        ・治療目標: IGA 0（クリア）または1（ほぼクリア）の達成<br />
        ・最適使用推進ガイドライン: IGA≧3が生物学的製剤の適応基準の一つ<br />
        ・EASI・BSAと組み合わせて総合的に重症度を判断
      </div>
    </div>
  );
}
