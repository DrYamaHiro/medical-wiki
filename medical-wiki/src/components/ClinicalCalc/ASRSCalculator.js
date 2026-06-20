import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

// ASRS-v1.1 (Adult ADHD Self-Report Scale, WHO)
// Part A: 6問のスクリーニング (シンボル該当数で判定)
// Part B: 12問の詳細症状評価
// 各問: 0:全くない / 1:めったにない / 2:時々 / 3:頻繁 / 4:非常に頻繁

const OPTIONS = [
  { value: 0, label: '0:全くない' },
  { value: 1, label: '1:めったにない' },
  { value: 2, label: '2:時々' },
  { value: 3, label: '3:頻繁' },
  { value: 4, label: '4:非常に頻繁' },
];

// Part A の各問における「該当」となる閾値
// Q1-3, Q4: 時々 (2) 以上で該当
// Q5-6: 頻繁 (3) 以上で該当
const PART_A_QUESTIONS = [
  { text: '物事を行う際に詰めの部分でうまくいかず、難しく感じることが、どのくらいの頻度でありますか', threshold: 2 },
  { text: '計画性を要する作業を行う際に、作業を順序立てて行うことが困難なことが、どのくらいの頻度でありますか', threshold: 2 },
  { text: '約束や、しなければならない用事を忘れがちなことが、どのくらいの頻度でありますか', threshold: 2 },
  { text: 'じっくりと考える必要のある課題に取り掛かるのを避けたり、遅らせたりすることが、どのくらいの頻度でありますか', threshold: 2 },
  { text: '長時間座っていなければならない時に、手足をそわそわ動かしたり、もじもじすることが、どのくらいの頻度でありますか', threshold: 3 },
  { text: '自分が活動しすぎていて、何かに駆り立てられるかのように行動せずにいられないことが、どのくらいの頻度でありますか', threshold: 3 },
];

const PART_B_QUESTIONS = [
  '直接話しかけられているのに、注意を集中して聞くことが難しいと感じることが、どのくらいの頻度でありますか',
  '家や職場で物を置き忘れたり、見つけられないことが、どのくらいの頻度でありますか',
  '騒音や周囲の活動に気が散ることが、どのくらいの頻度でありますか',
  '会議など長時間座っていなければならない状況で、席を離れることが、どのくらいの頻度でありますか',
  '落ち着かない感じや、そわそわした感じがすることが、どのくらいの頻度でありますか',
  '一人でくつろいだ時間を過ごすことが難しいと感じることが、どのくらいの頻度でありますか',
  '社交的な場面で、自分が喋りすぎてしまうことが、どのくらいの頻度でありますか',
  '会話中に、相手が話し終わる前にその文を終わらせてしまうことが、どのくらいの頻度でありますか',
  '順番待ちしなければならない時に、順番を待つのが難しいと感じることが、どのくらいの頻度でありますか',
  '他の人が忙しくしている時に邪魔をしてしまうことが、どのくらいの頻度でありますか',
  '退屈な、または難しい計画を完了させるのが難しいと感じることが、どのくらいの頻度でありますか',
  '何かを正確に思い出すために、最後の段階で集中することが難しいことが、どのくらいの頻度でありますか',
];

export default function ASRSCalculator() {
  // Part A 6問 + Part B 12問 = 18問
  const [answers, setAnswers] = useState(Array(18).fill(null));

  const setAnswer = useCallback((index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = next[index] === value ? null : value;
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers(Array(18).fill(null));
  }, []);

  // Part A 完了判定 + 該当数 + 合計点
  const partA = useMemo(() => {
    const a = answers.slice(0, 6);
    if (a.some((v) => v === null)) return { complete: false };
    const hits = a.reduce((acc, v, i) => acc + (v >= PART_A_QUESTIONS[i].threshold ? 1 : 0), 0);
    const sum = a.reduce((s, v) => s + v, 0);
    const positive = hits >= 4;
    return { complete: true, hits, sum, positive };
  }, [answers]);

  const showPartB = partA.complete && partA.positive;

  // Part B 完了判定 + 合計点 (Part A + B の総合スコア)
  const partB = useMemo(() => {
    const b = answers.slice(6);
    if (b.some((v) => v === null)) return { complete: false };
    const sumB = b.reduce((s, v) => s + v, 0);
    const total = (partA.sum || 0) + sumB;
    return { complete: true, sumB, total };
  }, [answers, partA.sum]);

  const partAJudge = useMemo(() => {
    if (!partA.complete) return null;
    if (partA.positive) {
      return { text: `陽性（Part A 該当 ${partA.hits}/6 ≥ 4）— Part B へ進んでください`, color: '#E65100' };
    }
    return { text: `陰性（Part A 該当 ${partA.hits}/6 < 4）— ADHD の可能性は低い`, color: '#2E7D32' };
  }, [partA]);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>ASRS-v1.1</p>
          <p className={styles.calcSub}>成人 ADHD 自己記入式症状チェックリスト（WHO）</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* Part A */}
        <div style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          Part A（スクリーニング 6問）
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.7rem' }}>
          過去6か月間に経験した状態に最も当てはまる頻度を選択してください。
        </div>

        {PART_A_QUESTIONS.map((q, i) => (
          <div className={styles.inputGroup} key={i}>
            <label className={styles.inputLabel}>Q{i + 1}. {q.text}</label>
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

        {/* Part A 判定 */}
        {partAJudge && (
          <div className={styles.result}>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Part A 該当数</span>
              <span className={styles.resultValue}>{partA.hits} / 6</span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Part A 合計点</span>
              <span className={styles.resultValue}>{partA.sum} / 24 点</span>
            </div>
            <div className={styles.resultJudge} style={{ background: partAJudge.color }}>
              {partAJudge.text}
            </div>
          </div>
        )}

        {/* Part B */}
        {showPartB && (
          <>
            <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              Part B（詳細症状評価 12問）
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.7rem' }}>
              診断的な評価には用いない。臨床面接の補助情報として使用してください。
            </div>

            {PART_B_QUESTIONS.map((q, i) => {
              const idx = i + 6;
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

            {/* 総合スコア */}
            {partB.complete && (
              <div className={styles.result}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Part B 合計点</span>
                  <span className={styles.resultValue}>{partB.sumB} / 48 点</span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>総合点 (A + B)</span>
                  <span className={styles.resultValue}>{partB.total} / 72 点</span>
                </div>
                <div className={styles.resultJudge} style={{ background: '#1565c0' }}>
                  Part A 陽性 + Part B 補助情報。診断は臨床面接で確定
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.note}>
        <strong>ASRS-v1.1:</strong> WHO 開発、成人 ADHD のスクリーニングツール。<br />
        <strong>Part A 判定:</strong> 6問中 4問以上が「該当」（Q1-4 は時々以上、Q5-6 は頻繁以上）で陽性。陽性なら専門医での評価を検討。<br />
        <strong>Part B:</strong> 補助情報として詳細な症状パターンを確認する 12問。<br />
        <strong>注:</strong> 本ツールはスクリーニング目的のみ。診断は DSM-5/ICD-11 に基づく臨床面接で確定。鑑別 (不安症・うつ・睡眠障害・甲状腺機能異常など) も考慮してください。
      </div>
    </div>
  );
}
