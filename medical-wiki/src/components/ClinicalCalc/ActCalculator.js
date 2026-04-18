import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

const QUESTIONS = [
  {
    q: '仕事や日常生活への支障',
    detail: '過去4週間に、喘息のせいで仕事や家事ができなかったことは？',
    opts: ['いつも', 'ほとんどいつも', 'ときどき', 'たまに', '全くない'],
  },
  {
    q: '息切れの頻度',
    detail: '過去4週間に、どのくらい息切れがありましたか？',
    opts: ['1日2回以上', '1日1回', '週3-6回', '週1-2回', '全くない'],
  },
  {
    q: '喘息症状による覚醒',
    detail: '過去4週間に、喘息の症状で夜中に目が覚めたり、朝早く目が覚めたりしたことは？',
    opts: ['週4回以上', '週2-3回', '週1回', '月1-2回', '全くない'],
  },
  {
    q: '発作止め吸入薬の使用',
    detail: '過去4週間に、発作止めの吸入薬（SABA等）をどのくらい使いましたか？',
    opts: ['1日3回以上', '1日1-2回', '週2-3回', '週1回以下', '使わなかった'],
  },
  {
    q: '喘息コントロールの自己評価',
    detail: '過去4週間について、自分の喘息のコントロール状態をどう評価しますか？',
    opts: ['全くコントロールされていない', 'あまり', 'まあまあ', 'よくコントロール', '完全にコントロール'],
  },
];

function getJudgment(score) {
  if (score <= 19) return { text: 'コントロール不十分', color: '#c62828', advice: '治療のステップアップを検討' };
  if (score <= 24) return { text: '良好なコントロール', color: '#F9A825', advice: '現在の治療を継続' };
  return { text: '完全コントロール', color: '#2E7D32', advice: '治療目標達成' };
}

export default function ActCalculator() {
  const [answers, setAnswers] = useState(Array(5).fill(null));

  const setAnswer = useCallback((qi, score) => {
    setAnswers(prev => {
      const next = [...prev];
      next[qi] = next[qi] === score ? null : score;
      return next;
    });
  }, []);

  const reset = useCallback(() => setAnswers(Array(5).fill(null)), []);

  const total = useMemo(() => {
    if (answers.some(a => a === null)) return null;
    return answers.reduce((s, a) => s + a, 0);
  }, [answers]);

  const judgment = total !== null ? getJudgment(total) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>ACT（Asthma Control Test）</p>
          <p className={styles.calcSub}>喘息コントロールテスト（5〜25点）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.8rem' }}>
          過去4週間の喘息コントロール状態を評価します。各質問で最も当てはまるものを選択してください。
        </div>

        {QUESTIONS.map((item, qi) => (
          <div key={qi} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>
              Q{qi + 1}. {item.q}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-500)', marginBottom: '6px' }}>
              {item.detail}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {item.opts.map((opt, oi) => {
                const score = oi + 1;
                const isSelected = answers[qi] === score;
                return (
                  <div key={oi} onClick={() => setAnswer(qi, score)}
                    className={`${styles.checkItem} ${isSelected ? styles.checkItemActive : ''}`}
                    style={{ padding: '0.35rem 0.6rem' }}>
                    <span className={styles.checkScore}>{score}</span>
                    <span className={styles.checkLabel} style={{ fontSize: '0.82rem' }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {total !== null && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>ACT スコア</span>
            <span className={styles.resultValue}>{total} / 25</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judgment.color }}>
            {judgment.text} — {judgment.advice}
          </div>
        </div>
      )}

      {total === null && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#757575' }}>
            全5問に回答してください（{answers.filter(a => a !== null).length}/5 回答済み）
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>ACT について:</strong><br />
        ・5問×各1-5点 = 合計5〜25点<br />
        ・25点: 完全コントロール<br />
        ・20-24点: 良好なコントロール<br />
        ・≦19点: コントロール不十分 → 治療のステップアップを検討<br />
        ・定期的な評価により治療効果をモニタリング<br />
        ・ACTスコアの3点以上の変化は臨床的に意味のある改善/悪化
      </div>
    </div>
  );
}
