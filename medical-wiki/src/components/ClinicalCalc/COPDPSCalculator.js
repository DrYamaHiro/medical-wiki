import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

// COPD-PS (COPD Population Screener)
// Martinez FJ et al. COPD 2008;5(2):85-95.
// 5 項目、合計 0-10 点。≥5 で COPD 疑い → スパイロメトリーを推奨。

const QUESTIONS = [
  {
    no: 1,
    text: '過去 4 週間、息切れを感じることがどのくらいありましたか?',
    options: [
      { value: 0, label: 'まったくなかった' },
      { value: 0, label: 'ほとんどなかった' },
      { value: 1, label: '時々あった' },
      { value: 1, label: 'よくあった' },
      { value: 2, label: 'いつもあった' },
    ],
  },
  {
    no: 2,
    text: '痰や粘液 (「ねばっとしたもの」) が絡んだ咳が出ますか?',
    options: [
      { value: 0, label: 'まったく出ない' },
      { value: 0, label: 'カゼをひいた時のみ' },
      { value: 1, label: '月に数日' },
      { value: 1, label: '週の大半の日' },
      { value: 2, label: '毎日' },
    ],
  },
  {
    no: 3,
    text: '過去 12 か月、息切れのために以前ほど活動しなくなったと感じますか?',
    options: [
      { value: 0, label: '強く同意しない' },
      { value: 0, label: '同意しない' },
      { value: 0, label: 'どちらでもない' },
      { value: 1, label: '同意する' },
      { value: 2, label: '強く同意する' },
    ],
  },
  {
    no: 4,
    text: 'これまでの人生で、たばこを 100 本以上吸ったことがありますか?',
    options: [
      { value: 0, label: 'いいえ' },
      { value: 0, label: 'わからない' },
      { value: 2, label: 'はい' },
    ],
  },
  {
    no: 5,
    text: 'ご年齢は?',
    options: [
      { value: 0, label: '35-49 歳' },
      { value: 1, label: '50-59 歳' },
      { value: 2, label: '60-69 歳' },
      { value: 2, label: '70 歳以上' },
    ],
  },
];

function getJudgment(score) {
  if (score >= 5) return { text: 'COPD の可能性あり (スパイロメトリーを推奨)', color: '#C62828' };
  return { text: 'COPD の可能性は低い (定期的な再評価を)', color: '#2E7D32' };
}

export default function COPDPSCalculator() {
  // 各 question で何番目の選択肢を選んだか (index)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));

  const setAnswer = useCallback((qi, oi) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = next[qi] === oi ? null : oi;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(null));
  }, []);

  const score = useMemo(() => {
    if (answers.some((a) => a === null)) return null;
    return answers.reduce((s, oi, qi) => s + QUESTIONS[qi].options[oi].value, 0);
  }, [answers]);

  const judge = score !== null ? getJudgment(score) : null;

  const outputText = useMemo(() => {
    if (score === null) return '';
    const lines = [];
    lines.push('【COPD-PS (COPD Population Screener) __DATE__】');
    lines.push('');
    lines.push(`合計: ${score}/10 点 → ${score >= 5 ? '陽性' : '陰性'}`);
    lines.push('');
    QUESTIONS.forEach((q, qi) => {
      const oi = answers[qi];
      const opt = q.options[oi];
      lines.push(`Q${q.no}. ${q.text}`);
      lines.push(`  → ${opt.label} (${opt.value}点)`);
    });
    lines.push('');
    lines.push('■ 判定');
    if (score >= 5) {
      lines.push('COPD の可能性あり。スパイロメトリーによる気流制限の評価を推奨。');
      lines.push('喫煙者・職業性曝露者では特に積極的に精査。');
      lines.push('鑑別: 心不全・気管支喘息・気管支拡張症・間質性肺疾患等。');
    } else {
      lines.push('現時点で COPD の可能性は低い。リスク因子があれば定期的な再評価を。');
    }
    lines.push('');
    lines.push('※ COPD-PS はスクリーニングツールであり、確定診断ではない。');
    return lines.join('\n');
  }, [score, answers]);

  const summary = score !== null ? `COPD-PS ${score}/10点（${score >= 5 ? '陽性' : '陰性'}）→ ${judge.text}` : '';

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>COPD-PS</p>
          <p className={styles.calcSub}>COPD Population Screener（Martinez 2008）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.7rem' }}>
          各問に最も当てはまる選択肢を 1 つ選んでください。
        </div>

        {QUESTIONS.map((q, qi) => (
          <div className={styles.inputGroup} key={qi}>
            <label className={styles.inputLabel}>Q{q.no}. {q.text}</label>
            <div className={styles.toggleGroup}>
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  className={`${styles.toggleBtn} ${answers[qi] === oi ? styles.toggleBtnActive : ''}`}
                  onClick={() => setAnswer(qi, oi)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 判定 */}
        {judge && (
          <div className={styles.result}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>合計</span>
              <span className={styles.resultValue}>{score} / 10 点</span>
            </div>
            <div className={styles.resultJudge} style={{ background: judge.color }}>
              {judge.text}
            </div>
          </div>
        )}
      </div>

      {/* コピペ用 出力 */}
      <PsychCopyBox text={outputText} summary={summary} dateLabel="検査日" />

      <div className={styles.note}>
        <strong>COPD-PS:</strong> 5 項目、合計 0-10 点の COPD スクリーニングツール (Martinez FJ et al. COPD 2008)。<br />
        <strong>判定:</strong> ≥5 点で COPD の可能性あり。スパイロメトリーによる気流制限の評価 (1秒率 &lt; 70%) を推奨。<br />
        <strong>注:</strong> 本ツールはスクリーニング目的のみ。確定診断にはスパイロメトリーが必須。鑑別 (心不全・気管支喘息・気管支拡張症・間質性肺疾患等) も考慮してください。
      </div>
    </div>
  );
}
