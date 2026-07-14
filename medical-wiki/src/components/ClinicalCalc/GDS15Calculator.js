import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

/**
 * GDS-15（老年期うつ病評価尺度 短縮版）
 * scoreIfYes: true = 「はい」が1点、false = 「いいえ」が1点（逆転項目）
 */
const QUESTIONS = [
  { id: 1,  text: '毎日の生活に満足していますか', scoreIfYes: false },
  { id: 2,  text: '毎日の活動力や周囲に対する興味が低下したと思いますか', scoreIfYes: true },
  { id: 3,  text: '生活が空虚だと思いますか', scoreIfYes: true },
  { id: 4,  text: '毎日が退屈だと思うことが多いですか', scoreIfYes: true },
  { id: 5,  text: '大抵は機嫌よく過ごすことが多いですか', scoreIfYes: false },
  { id: 6,  text: '将来の漠然とした不安に駆られることが多いですか', scoreIfYes: true },
  { id: 7,  text: '多くの場合は自分が幸福だと思いますか', scoreIfYes: false },
  { id: 8,  text: '自分が無力だなあと思うことが多いですか', scoreIfYes: true },
  { id: 9,  text: '外出したり何か新しいことをするより家にいたいと思いますか', scoreIfYes: true },
  { id: 10, text: '何よりもまず、もの忘れが気になりますか', scoreIfYes: true },
  { id: 11, text: 'いま生きていることが素晴らしいと思いますか', scoreIfYes: false },
  { id: 12, text: '生きていても仕方がないと思う気持ちになることがありますか', scoreIfYes: true },
  { id: 13, text: '自分が活力に満ちていると思いますか', scoreIfYes: false },
  { id: 14, text: '希望がないと思うことがありますか', scoreIfYes: true },
  { id: 15, text: '周りの人があなたより幸せそうに見えますか', scoreIfYes: true },
];

function getJudgment(score) {
  if (score <= 4) return { text: '正常', color: '#2E7D32' };
  if (score <= 9) return { text: '軽度うつ傾向', color: '#F9A825' };
  return { text: 'うつ状態', color: '#C62828' };
}

export default function GDS15Calculator() {
  // null = 未回答, true = はい, false = いいえ
  const [answers, setAnswers] = useState({});

  const select = useCallback((qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const score = QUESTIONS.reduce((sum, q) => {
    const ans = answers[q.id];
    if (ans === undefined) return sum;
    // scoreIfYes=true: 「はい」で1点。scoreIfYes=false: 「いいえ」で1点
    if (q.scoreIfYes && ans === true) return sum + 1;
    if (!q.scoreIfYes && ans === false) return sum + 1;
    return sum;
  }, 0);

  const judgment = allAnswered ? getJudgment(score) : null;

  const outputText = useMemo(() => {
    if (!allAnswered) return '';
    const lines = [];
    lines.push('【GDS-15（老年期うつ病評価尺度） __DATE__】');
    lines.push('（過去 1 週間の気分について評価）');
    lines.push('');
    lines.push(`合計: ${score}/15 点 → ${judgment.text}`);
    lines.push('');
    QUESTIONS.forEach((q) => {
      const ans = answers[q.id];
      const ansText = ans ? 'はい' : 'いいえ';
      const scored = (q.scoreIfYes && ans === true) || (!q.scoreIfYes && ans === false);
      lines.push(`Q${q.id}. ${q.text}${q.scoreIfYes ? '' : '（逆転項目）'}`);
      lines.push(`  → ${ansText} (${scored ? '1' : '0'}点)`);
    });
    lines.push('');
    lines.push('■ 判定');
    lines.push(judgment.text);
    if (score >= 5) {
      lines.push('※ 5点以上: うつ状態を疑い、精査を検討。');
    }
    lines.push('');
    lines.push('※ GDS-15 は自記式スクリーニング。認知機能低下例では信頼性が低下することがある。');
    return lines.join('\n');
  }, [allAnswered, score, judgment, answers]);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>GDS-15（老年期うつ病評価尺度）</p>
          <p className={styles.calcSub}>Geriatric Depression Scale - Short Form</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ marginBottom: '0.7rem', padding: '0.5rem 0.7rem', background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.85rem', color: '#0d47a1' }}>
          <strong>評価期間:</strong> 過去 1 週間の気分・生活について評価してください（原著 Sheikh &amp; Yesavage 1986 の指示）。
        </div>

        {QUESTIONS.map((q) => (
          <div key={q.id} className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Q{q.id}. {q.text}
              {!q.scoreIfYes && (
                <span className={styles.inputUnit}>（逆転項目）</span>
              )}
            </label>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${answers[q.id] === true ? styles.toggleBtnActive : ''}`}
                onClick={() => select(q.id, true)}
              >
                はい
              </button>
              <button
                className={`${styles.toggleBtn} ${answers[q.id] === false ? styles.toggleBtnActive : ''}`}
                onClick={() => select(q.id, false)}
              >
                いいえ
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>回答数</span>
          <span className={styles.resultValue}>{answeredCount} / 15</span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>合計スコア</span>
          <span className={styles.resultValue}>{allAnswered ? `${score} 点` : '---'}</span>
        </div>
        {judgment && (
          <div className={styles.resultJudge} style={{ background: judgment.color }}>
            {judgment.text}
          </div>
        )}
      </div>

      <PsychCopyBox text={outputText} />

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-4点: 正常 / 5-9点: 軽度うつ傾向 / 10-15点: うつ状態<br />
        <strong>参考:</strong> Sheikh JI, Yesavage JA. Clin Gerontol 1986; 5(1-2):165-173.<br />
        高齢者のうつ病スクリーニングに広く使用されます。逆転項目（「いいえ」で加点）に注意してください。
      </div>
    </div>
  );
}
