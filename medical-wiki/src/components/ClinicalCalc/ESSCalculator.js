import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

// N/A (該当なし) を含む選択肢
// 原典の指示: 「もし最近その状況に居なくとも、もしその状況にあったならばどうであったかを想像して回答してください」
// ただし想像が困難な場合 (運転しない、公共の場に出ない等) は「該当なし」を選択可能とし、
// スコア計算から除外して残り項目の平均から 24 点満点へ補正する。
const OPTIONS = [
  { value: 0, label: '0:居眠りしない' },
  { value: 1, label: '1:時に' },
  { value: 2, label: '2:しばしば' },
  { value: 3, label: '3:ほぼ必ず' },
  { value: 'na', label: 'N/A:該当なし' },
];

// 各質問に代替質問を用意 (「その状況が普段ない」場合の想像しやすい代替表現)
const QUESTIONS = [
  {
    text: '座って読書しているとき',
    alt: '本や新聞、スマホ画面をじっくり読んでいるとき',
  },
  {
    text: 'テレビを見ているとき',
    alt: 'テレビ・動画・映画を集中して視聴しているとき',
  },
  {
    text: '公の場所で座って何もしていないとき（劇場や会議など）',
    alt: '劇場・映画館・会議・講義・研修などで長時間座っているとき',
  },
  {
    text: '1時間続けて車に乗せてもらっているとき',
    alt: '1時間程度、電車・バス・自動車の後部座席など、自分が運転せずに乗り物に乗っているとき',
  },
  {
    text: '午後、横になって休憩しているとき',
    alt: '午後、可能であれば横になって休息できる状況にあると想像したとき',
  },
  {
    text: '座って人と話しているとき',
    alt: '座って会話や打合せをしているとき',
  },
  {
    text: '昼食後、静かに座っているとき',
    alt: '昼食後（アルコールを飲んでいない）、静かに座って過ごしているとき',
  },
  {
    text: '車の中で、交通渋滞で2-3分止まっているとき',
    alt: '運転席・助手席等で、渋滞や信号待ちで数分停止しているとき（普段運転しない場合は、乗り物で停車している状況を想像）',
  },
];

function getJudgment(score) {
  if (score <= 10) return { text: '正常', color: '#2E7D32' };
  if (score <= 14) return { text: '軽度眠気', color: '#F9A825' };
  if (score <= 17) return { text: '中等度眠気', color: '#E65100' };
  return { text: '重度眠気', color: '#C62828' };
}

export default function ESSCalculator() {
  const [answers, setAnswers] = useState(Array(8).fill(null));
  const [showAlt, setShowAlt] = useState(false);

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

  // 数値回答のみ集計 (na と null は除外)
  const answeredNumeric = useMemo(() => answers.filter((a) => typeof a === 'number'), [answers]);
  const naCount = useMemo(() => answers.filter((a) => a === 'na').length, [answers]);
  const unansweredCount = useMemo(() => answers.filter((a) => a === null).length, [answers]);

  const rawScore = useMemo(() => {
    if (unansweredCount > 0) return null;
    if (answeredNumeric.length === 0) return null;
    return answeredNumeric.reduce((s, v) => s + v, 0);
  }, [answeredNumeric, unansweredCount]);

  // 補正スコア: (合計 / 有効項目数) * 8 で 24 点満点へ換算
  const adjustedScore = useMemo(() => {
    if (rawScore === null) return null;
    if (answeredNumeric.length === 8) return rawScore;
    if (answeredNumeric.length === 0) return null;
    return Math.round((rawScore / answeredNumeric.length) * 8 * 10) / 10;
  }, [rawScore, answeredNumeric]);

  const judgeScore = adjustedScore;
  const judge = judgeScore !== null ? getJudgment(judgeScore) : null;
  const osasAlert = judgeScore !== null && judgeScore >= 11;

  const outputText = useMemo(() => {
    if (rawScore === null) return '';
    const lines = [];
    lines.push('【ESS（エプワース眠気尺度） __DATE__】');
    lines.push('（最近の日常生活で、以下の状況で居眠りをしてしまう可能性）');
    lines.push('');
    if (naCount === 0) {
      lines.push(`合計: ${rawScore}/24 点 → ${judge.text}`);
    } else {
      lines.push(`合計: ${rawScore}/${answeredNumeric.length * 3} 点 (回答 ${answeredNumeric.length}/8 項目、N/A ${naCount} 項目)`);
      lines.push(`24点満点換算: ${adjustedScore} 点 → ${judge.text}`);
    }
    lines.push('');
    QUESTIONS.forEach((q, i) => {
      const v = answers[i];
      const opt = OPTIONS.find((o) => o.value === v);
      lines.push(`Q${i + 1}. ${q.text}`);
      lines.push(`  → ${opt.label}`);
    });
    lines.push('');
    lines.push('■ 判定');
    lines.push(judge.text);
    if (osasAlert) {
      lines.push('※ 11点以上: 病的な日中過眠を示唆。閉塞性睡眠時無呼吸症候群 (OSAS) 等の精査を検討。');
    }
    if (naCount > 0) {
      lines.push(`※ ${naCount} 項目が N/A (該当シチュエーションなし) のため、24点満点補正スコアを併記。参考値として扱う。`);
    }
    lines.push('');
    lines.push('※ ESS は自記式スクリーニング。眠気の総合評価には現症・睡眠日誌・PSG 等を併用。');
    return lines.join('\n');
  }, [rawScore, adjustedScore, naCount, answeredNumeric, judge, osasAlert, answers]);

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
        <div style={{ marginBottom: '0.7rem', padding: '0.5rem 0.7rem', background: '#e3f2fd', border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.85rem', color: '#0d47a1' }}>
          <strong>評価期間:</strong> 最近の日常生活全般（過去数週間〜1ヶ月程度）。<br />
          <strong>回答のコツ:</strong> 該当シチュエーションを最近経験していなくても、<u>「もしその状況にあったならばどうか」を想像</u>して回答するのが原則です（原著 Johns 1991 の指示）。想像が難しい場合は「N/A: 該当なし」を選択でき、その項目はスコアから除外し 24 点満点補正値を提示します。
        </div>

        <div style={{ marginBottom: '0.7rem', textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setShowAlt((v) => !v)}
            style={{
              padding: '0.3rem 0.7rem',
              fontSize: '0.78rem',
              background: showAlt ? '#1565c0' : '#fff',
              color: showAlt ? '#fff' : '#1565c0',
              border: '1.5px solid #90caf9',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            {showAlt ? '代替質問を隠す' : '代替質問（想像しにくい人向け）を表示'}
          </button>
        </div>

        <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
          以下の状況で居眠りをしてしまう可能性はどのくらいですか？
        </div>
        {QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>
              Q{i + 1}. {q.text}
              {showAlt && (
                <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.78rem', color: '#37474f', fontWeight: 400, background: '#f1f8e9', padding: '0.3rem 0.5rem', borderLeft: '3px solid #7cb342', borderRadius: '3px' }}>
                  想像しにくい場合: {q.alt}
                </span>
              )}
            </label>
            <div className={styles.toggleGroup}>
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.toggleBtn} ${answers[i] === opt.value ? styles.toggleBtnActive : ''}`}
                  onClick={() => setAnswer(i, opt.value)}
                  style={opt.value === 'na' ? { background: answers[i] === 'na' ? '#616161' : '#fff', color: answers[i] === 'na' ? '#fff' : '#616161', borderColor: '#9e9e9e' } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rawScore !== null && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>合計スコア</span>
            <span className={styles.resultValue}>{rawScore} / {answeredNumeric.length * 3} 点 (回答 {answeredNumeric.length}/8)</span>
          </div>
          {naCount > 0 && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>24点満点換算</span>
              <span className={styles.resultValue}>{adjustedScore} 点</span>
            </div>
          )}
          {judge && (
            <div className={styles.resultJudge} style={{ background: judge.color }}>
              {judge.text}
            </div>
          )}
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

      <PsychCopyBox text={outputText} />

      <div className={styles.note}>
        <strong>判定基準:</strong> 0-10:正常 / 11-14:軽度眠気 / 15-17:中等度眠気 / 18-24:重度眠気。<br />
        <strong>N/A補正について:</strong> 該当なしを選んだ項目は分母から除外し、残り項目の平均 × 8 で 24 点満点相当に換算。N/A が多いほど信頼性は低下します（3項目以上 N/A の場合は参考値として扱い、他ツールとの併用推奨）。<br />
        <strong>代替スクリーニング:</strong> 眠気の項目にピンとこない場合、OSAS 疑いなら <a href="../respiratory/stopbang">STOP-BANG</a>、体感的な眠気の即時評価には Karolinska Sleepiness Scale (KSS) 等の併用が有用です。<br />
        <strong>注:</strong> ESS 11点以上は病的な日中過眠を示唆し、OSAS をはじめとする睡眠障害の精査が推奨されます。
      </div>
    </div>
  );
}
