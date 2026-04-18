import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const NPS_GRADES = [
  { score: 0, label: 'ポリープなし' },
  { score: 1, label: '中鼻道に限局する小ポリープ' },
  { score: 2, label: '中鼻道を越えるが、下鼻甲介下縁を超えない' },
  { score: 3, label: '下鼻甲介下縁を越える大きなポリープ' },
  { score: 4, label: '鼻腔をほぼ完全に閉塞するポリープ' },
];

export default function NpsCalculator() {
  const [right, setRight] = useState(null);
  const [left, setLeft] = useState(null);
  const reset = useCallback(() => { setRight(null); setLeft(null); }, []);

  const total = (right !== null && left !== null) ? right + left : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>NPS（Nasal Polyp Score）</p>
          <p className={styles.calcSub}>両側鼻茸スコア（0〜8点）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.8rem' }}>
          内視鏡所見に基づき、各側のポリープの大きさを評価します。
        </div>

        {['right', 'left'].map(side => {
          const value = side === 'right' ? right : left;
          const setter = side === 'right' ? setRight : setLeft;
          return (
            <div key={side} className={styles.inputGroup}>
              <label className={styles.inputLabel}>{side === 'right' ? '右側' : '左側'}（0-4）</label>
              {NPS_GRADES.map(grade => (
                <div key={grade.score} onClick={() => setter(value === grade.score ? null : grade.score)}
                  className={`${styles.checkItem} ${value === grade.score ? styles.checkItemActive : ''}`}
                  style={{ marginBottom: '3px' }}>
                  <span className={styles.checkScore}>{grade.score}</span>
                  <span className={styles.checkLabel}>{grade.label}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {total !== null && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>NPS 合計</span>
            <span className={styles.resultValue}>{total} / 8</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>内訳</span>
            <span style={{ fontSize: '0.85rem' }}>右 {right} + 左 {left}</span>
          </div>
          <div className={styles.resultJudge} style={{
            background: total >= 5 ? '#c62828' : total >= 3 ? '#F9A825' : total >= 1 ? '#ff9800' : '#2E7D32',
          }}>
            {total === 0 && 'ポリープなし'}
            {total >= 1 && total < 3 && '軽度'}
            {total >= 3 && total < 5 && '中等度'}
            {total >= 5 && `高度（NPS≧5）— 生物学的製剤の適応基準を満たす`}
          </div>
        </div>
      )}

      {total === null && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#757575' }}>
            両側のスコアを選択してください
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>NPS について:</strong><br />
        ・内視鏡下で各側の鼻茸を0-4の5段階で評価（合計0-8）<br />
        ・最適使用推進ガイドライン: NPS≧5が生物学的製剤（デュピクセント等）の適応基準<br />
        ・手術療法や既存の内科的治療で効果不十分な場合に評価<br />
        ・鼻閉重症度スコア（0-3）と併せて評価することが推奨される
      </div>
    </div>
  );
}
