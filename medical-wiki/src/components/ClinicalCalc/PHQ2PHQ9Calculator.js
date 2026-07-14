import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

const OPTIONS = [
  { value: 0, label: '0:全くない (0日)' },
  { value: 1, label: '1:数日 (1-7日程度)' },
  { value: 2, label: '2:半分以上 (8-11日程度)' },
  { value: 3, label: '3:ほぼ毎日 (12-14日)' },
];

const PHQ2_QUESTIONS = [
  '物事に対してほとんど興味がない、または楽しめない',
  '気分が落ち込む、憂うつになる、または絶望的な気持ちになる',
];

const PHQ9_EXTRA_QUESTIONS = [
  '寝つきが悪い、途中で目が覚める、または眠りすぎる',
  '疲れた感じがする、または気力がない',
  'あまり食欲がない、または食べ過ぎる',
  '自分はダメな人間だ、人生の敗北者だ、自分自身あるいは家族に申し訳ないと感じる',
  '新聞を読む、テレビを見るなどに集中することが難しい',
  '他人が気づくぐらいに動きや話し方が遅くなる、あるいは反対にそわそわして落ち着かない',
  '死んだ方がましだ、あるいは自分を何らかの方法で傷つけようと思ったことがある',
];

function getPHQ2Judgment(score) {
  if (score <= 2) return { text: '陰性（うつ病の可能性低い）', color: '#2E7D32' };
  return { text: '陽性（PHQ-9へ進んでください）', color: '#E65100' };
}

function getPHQ9Judgment(score) {
  if (score <= 4) return { text: '症状なし〜最小限', color: '#2E7D32' };
  if (score <= 9) return { text: '軽度', color: '#558B2F' };
  if (score <= 14) return { text: '中等度', color: '#F9A825' };
  if (score <= 19) return { text: '中等度〜重度', color: '#E65100' };
  return { text: '重度', color: '#C62828' };
}

export default function PHQ2PHQ9Calculator() {
  const [answers, setAnswers] = useState(Array(9).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(9).fill(null));
  }, []);

  const phq2Score = useMemo(() => {
    const a0 = answers[0];
    const a1 = answers[1];
    if (a0 === null || a1 === null) return null;
    return a0 + a1;
  }, [answers]);

  const showPHQ9 = phq2Score !== null && phq2Score >= 3;

  const phq9Score = useMemo(() => {
    if (!showPHQ9) return null;
    if (answers.some((a) => a === null)) return null;
    return answers.reduce((sum, a) => sum + a, 0);
  }, [answers, showPHQ9]);

  const phq2Judge = phq2Score !== null ? getPHQ2Judgment(phq2Score) : null;
  const phq9Judge = phq9Score !== null ? getPHQ9Judgment(phq9Score) : null;

  const suicideRisk = showPHQ9 && answers[8] !== null && answers[8] >= 1;

  const outputText = useMemo(() => {
    if (phq2Score === null) return '';
    const allQ = [...PHQ2_QUESTIONS, ...PHQ9_EXTRA_QUESTIONS];
    const lines = [];
    lines.push('【PHQ-9（うつ病スクリーニング・重症度） __DATE__】');
    lines.push('（過去2週間、以下の問題にどのくらい頻繁に悩まされていますか）');
    lines.push('');
    lines.push(`PHQ-2 スコア: ${phq2Score}/6 点 → ${phq2Score >= 3 ? '陽性' : '陰性'}`);
    if (phq9Score !== null) {
      lines.push(`PHQ-9 合計: ${phq9Score}/27 点 → ${phq9Judge.text}`);
    }
    lines.push('');
    allQ.forEach((q, i) => {
      const v = answers[i];
      if (v === null) return;
      const opt = OPTIONS.find((o) => o.value === v);
      lines.push(`Q${i + 1}. ${q}`);
      lines.push(`  → ${opt.label}`);
    });
    if (phq9Score !== null) {
      lines.push('');
      lines.push('■ 判定');
      lines.push(phq9Judge.text);
      if (suicideRisk) {
        lines.push('※ Q9 (希死念慮) が1点以上 — 自殺リスクの詳細評価を要する。');
      }
    }
    lines.push('');
    lines.push('※ PHQ-9 は自記式スクリーニング。確定診断は面接評価による。');
    return lines.join('\n');
  }, [phq2Score, phq9Score, phq9Judge, answers, suicideRisk]);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>PHQ-2 / PHQ-9</p>
          <p className={styles.calcSub}>うつ病スクリーニング・重症度評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ marginBottom: '0.7rem', padding: '0.5rem 0.7rem', background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.85rem', color: '#0d47a1' }}>
          <strong>評価期間:</strong> 過去 2 週間（14 日間）の症状について評価してください。
        </div>

        {/* PHQ-2 */}
        <div style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          PHQ-2（スクリーニング）
        </div>
        {PHQ2_QUESTIONS.map((q, i) => (
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

        {/* PHQ-2 結果 */}
        {phq2Judge && (
          <div className={styles.result}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>PHQ-2 スコア</span>
              <span className={styles.resultValue}>{phq2Score} / 6 点</span>
            </div>
            <div className={styles.resultJudge} style={{ background: phq2Judge.color }}>
              {phq2Judge.text}
            </div>
          </div>
        )}

        {/* PHQ-9 展開 */}
        {showPHQ9 && (
          <>
            <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              PHQ-9（残り7問）
            </div>
            {PHQ9_EXTRA_QUESTIONS.map((q, i) => {
              const idx = i + 2;
              return (
                <div className={styles.inputGroup} key={idx}>
                  <label className={styles.inputLabel}>Q{idx + 1}. {q}</label>
                  <div className={styles.toggleGroup}>
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`${styles.toggleBtn} ${answers[idx] === opt.value ? styles.toggleBtnActive : ''}`}
                        onClick={() => setAnswer(idx, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* PHQ-9 結果 */}
            {phq9Judge && (
              <div className={styles.result}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>PHQ-9 スコア</span>
                  <span className={styles.resultValue}>{phq9Score} / 27 点</span>
                </div>
                <div className={styles.resultJudge} style={{ background: phq9Judge.color }}>
                  {phq9Judge.text}
                </div>
              </div>
            )}

            {/* 希死念慮警告 */}
            {suicideRisk && (
              <div style={{
                margin: '0.5rem 0',
                padding: '0.7rem 1rem',
                background: '#FFEBEE',
                border: '2px solid #C62828',
                borderRadius: '8px',
                color: '#C62828',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}>
                自殺リスクの評価が必要です
              </div>
            )}
          </>
        )}
      </div>

      <PsychCopyBox text={outputText} />

      <div className={styles.note}>
        <strong>PHQ-2:</strong> 2問でスクリーニング。3点以上でPHQ-9へ進みます。<br />
        <strong>PHQ-9:</strong> 9問でうつ病の重症度を評価。0-4:最小限 / 5-9:軽度 / 10-14:中等度 / 15-19:中等度〜重度 / 20-27:重度。<br />
        <strong>注:</strong> Q9（希死念慮）が1点以上の場合、自殺リスクの詳細な評価が必要です。
      </div>
    </div>
  );
}
