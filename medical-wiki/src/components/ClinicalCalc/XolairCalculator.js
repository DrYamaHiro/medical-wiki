import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * ゾレア（オマリズマブ）投与量計算ツール
 *
 * 適応症:
 *   1. 気管支喘息（アレルギー性）
 *   2. 季節性アレルギー性鼻炎（重症スギ花粉症）
 *   3. 慢性蕁麻疹（特発性）
 *
 * 気管支喘息・アレルギー性鼻炎:
 *   投与量は体重(kg)と血清総IgE(IU/mL)から換算表で決定
 *   添付文書の換算表に基づく
 *
 * 慢性蕁麻疹:
 *   固定用量 300mg 4週間ごと（体重・IgE不問）
 */

const INDICATIONS = [
  { key: 'asthma', label: '気管支喘息' },
  { key: 'rhinitis', label: '季節性アレルギー性鼻炎' },
  { key: 'urticaria', label: '慢性蕁麻疹' },
];

// 体重区分（kg）
const WEIGHT_RANGES = [
  { min: 20, max: 25, label: '20-25' },
  { min: 25.1, max: 30, label: '>25-30' },
  { min: 30.1, max: 40, label: '>30-40' },
  { min: 40.1, max: 50, label: '>40-50' },
  { min: 50.1, max: 60, label: '>50-60' },
  { min: 60.1, max: 70, label: '>60-70' },
  { min: 70.1, max: 80, label: '>70-80' },
  { min: 80.1, max: 90, label: '>80-90' },
  { min: 90.1, max: 125, label: '>90-125' },
  { min: 125.1, max: 150, label: '>125-150' },
];

// IgE区分（IU/mL）
const IGE_RANGES = [
  { min: 30, max: 100, label: '30-100' },
  { min: 101, max: 200, label: '>100-200' },
  { min: 201, max: 300, label: '>200-300' },
  { min: 301, max: 400, label: '>300-400' },
  { min: 401, max: 500, label: '>400-500' },
  { min: 501, max: 600, label: '>500-600' },
  { min: 601, max: 700, label: '>600-700' },
  { min: 701, max: 800, label: '>700-800' },
  { min: 801, max: 900, label: '>800-900' },
  { min: 901, max: 1000, label: '>900-1000' },
  { min: 1001, max: 1100, label: '>1000-1100' },
  { min: 1101, max: 1200, label: '>1100-1200' },
  { min: 1201, max: 1300, label: '>1200-1300' },
  { min: 1301, max: 1500, label: '>1300-1500' },
];

// 投与量換算表（添付文書準拠）
// [投与量mg, 投与間隔週] — null = 投与不可
// 行: IgE区分（14行）、列: 体重区分（10列）
const DOSE_TABLE = [
  // IgE 30-100
  [
    [75, 4], [75, 4], [75, 4], [150, 4], [150, 4],
    [150, 4], [150, 4], [150, 4], [300, 4], [300, 4],
  ],
  // IgE >100-200
  [
    [150, 4], [150, 4], [150, 4], [300, 4], [300, 4],
    [300, 4], [300, 4], [300, 4], [225, 2], [300, 2],
  ],
  // IgE >200-300
  [
    [150, 4], [150, 4], [300, 4], [300, 4], [300, 4],
    [225, 2], [225, 2], [225, 2], [300, 2], [375, 2],
  ],
  // IgE >300-400
  [
    [150, 4], [300, 4], [300, 4], [300, 4], [225, 2],
    [225, 2], [300, 2], [300, 2], [375, 2], [450, 2],
  ],
  // IgE >400-500
  [
    [300, 4], [300, 4], [300, 4], [225, 2], [225, 2],
    [300, 2], [300, 2], [375, 2], [450, 2], [525, 2],
  ],
  // IgE >500-600
  [
    [300, 4], [300, 4], [225, 2], [225, 2], [300, 2],
    [300, 2], [375, 2], [450, 2], [525, 2], [600, 2],
  ],
  // IgE >600-700
  [
    [300, 4], [225, 2], [225, 2], [300, 2], [300, 2],
    [375, 2], [450, 2], [450, 2], [600, 2], null,
  ],
  // IgE >700-800
  [
    [225, 2], [225, 2], [225, 2], [300, 2], [375, 2],
    [375, 2], [450, 2], [525, 2], null, null,
  ],
  // IgE >800-900
  [
    [225, 2], [225, 2], [300, 2], [300, 2], [375, 2],
    [450, 2], [525, 2], [600, 2], null, null,
  ],
  // IgE >900-1000
  [
    [225, 2], [225, 2], [300, 2], [375, 2], [375, 2],
    [450, 2], [525, 2], [600, 2], null, null,
  ],
  // IgE >1000-1100
  [
    [225, 2], [300, 2], [300, 2], [375, 2], [450, 2],
    [525, 2], [600, 2], null, null, null,
  ],
  // IgE >1100-1200
  [
    [300, 2], [300, 2], [300, 2], [375, 2], [450, 2],
    [525, 2], [600, 2], null, null, null,
  ],
  // IgE >1200-1300
  [
    [300, 2], [300, 2], [375, 2], [450, 2], [525, 2],
    [600, 2], null, null, null, null,
  ],
  // IgE >1300-1500
  [
    [300, 2], [300, 2], [375, 2], [450, 2], [525, 2],
    [600, 2], null, null, null, null,
  ],
];

function findWeightIndex(weight) {
  for (let i = 0; i < WEIGHT_RANGES.length; i++) {
    if (weight >= WEIGHT_RANGES[i].min && weight <= WEIGHT_RANGES[i].max) return i;
  }
  return -1;
}

function findIgEIndex(ige) {
  for (let i = 0; i < IGE_RANGES.length; i++) {
    if (ige >= IGE_RANGES[i].min && ige <= IGE_RANGES[i].max) return i;
  }
  return -1;
}

function calcVials(doseMg) {
  // 150mgシリンジと75mgシリンジの組み合わせ
  const v150 = Math.floor(doseMg / 150);
  const remainder = doseMg - v150 * 150;
  const v75 = remainder > 0 ? Math.ceil(remainder / 75) : 0;
  return { v150, v75 };
}

export default function XolairCalculator() {
  const [indication, setIndication] = useState('rhinitis');
  const [weight, setWeight] = useState('');
  const [ige, setIge] = useState('');

  const needsTable = indication === 'asthma' || indication === 'rhinitis';

  const result = useMemo(() => {
    if (indication === 'urticaria') {
      return {
        dose: 300,
        interval: 4,
        vials: calcVials(300),
        outOfRange: false,
        noData: false,
      };
    }

    const w = parseFloat(weight);
    const g = parseFloat(ige);
    if (!w || !g || w <= 0 || g <= 0) return null;

    if (w < 20 || w > 150) return { outOfRange: true, reason: 'weight' };
    if (g < 30 || g > 1500) return { outOfRange: true, reason: 'ige' };

    const wi = findWeightIndex(w);
    const gi = findIgEIndex(g);
    if (wi === -1 || gi === -1) return { outOfRange: true, reason: 'range' };

    const entry = DOSE_TABLE[gi][wi];
    if (!entry) return { noData: true };

    const [dose, interval] = entry;
    return {
      dose,
      interval,
      vials: calcVials(dose),
      outOfRange: false,
      noData: false,
    };
  }, [indication, weight, ige]);

  const reset = () => {
    setWeight('');
    setIge('');
  };

  const indicationLabel = INDICATIONS.find((i) => i.key === indication)?.label;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>ゾレア（オマリズマブ）投与量</h3>
          <p className={styles.calcSub}>添付文書 投与量換算表</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 適応症選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>適応症</label>
          <div className={styles.toggleGroup}>
            {INDICATIONS.map((ind) => (
              <button
                key={ind.key}
                className={`${styles.toggleBtn} ${indication === ind.key ? styles.toggleBtnActive : ''}`}
                onClick={() => { setIndication(ind.key); reset(); }}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* 慢性蕁麻疹の場合は固定用量表示 */}
        {indication === 'urticaria' && (
          <div style={{
            padding: '0.8rem',
            borderRadius: '8px',
            background: 'var(--ifm-color-primary-lightest)',
            border: '1px solid var(--ifm-color-primary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}>
            <strong>固定用量:</strong> 300mg 4週間ごと 皮下注射<br />
            体重・IgE値による用量調整は不要です。
          </div>
        )}

        {/* 喘息・鼻炎の場合は体重・IgE入力 */}
        {needsTable && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                体重
                <span className={styles.inputUnit}>kg（20-150kg）</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="150"
                  className={styles.inputField}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.0"
                />
                <span className={styles.unitText}>kg</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                血清総IgE
                <span className={styles.inputUnit}>IU/mL（30-1500）</span>
              </label>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  step="1"
                  min="30"
                  max="1500"
                  className={styles.inputField}
                  value={ige}
                  onChange={(e) => setIge(e.target.value)}
                  placeholder="0"
                />
                <span className={styles.unitText}>IU/mL</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 結果 */}
      {result && !result.outOfRange && !result.noData && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>投与量</span>
            <span className={styles.resultValue}>{result.dose} mg</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>投与間隔</span>
            <span className={styles.resultValue}>{result.interval}週間ごと</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>使用本数</span>
            <span className={styles.resultValue} style={{ fontSize: '0.95rem' }}>
              {result.vials.v150 > 0 && `150mgシリンジ ×${result.vials.v150}`}
              {result.vials.v150 > 0 && result.vials.v75 > 0 && '、'}
              {result.vials.v75 > 0 && `75mgシリンジ ×${result.vials.v75}`}
            </span>
          </div>
          <div className={styles.resultJudge} style={{ background: '#1565C0' }}>
            {indicationLabel}
          </div>
        </div>
      )}

      {/* 範囲外 */}
      {result && result.outOfRange && (
        <div style={{
          margin: '0 1.2rem 1rem',
          padding: '0.7rem 1rem',
          borderRadius: '8px',
          background: '#FFF3E0',
          border: '1px solid #E65100',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#BF360C',
        }}>
          {result.reason === 'weight' && '体重が適応範囲外です（20-150kg）'}
          {result.reason === 'ige' && '総IgEが適応範囲外です（30-1500 IU/mL）'}
          {result.reason === 'range' && '入力値が換算表の範囲外です'}
        </div>
      )}

      {/* 該当なし（換算表で投与不可） */}
      {result && result.noData && (
        <div style={{
          margin: '0 1.2rem 1rem',
          padding: '0.7rem 1rem',
          borderRadius: '8px',
          background: '#FFEBEE',
          border: '1px solid #C62828',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#B71C1C',
        }}>
          この体重・IgEの組み合わせでは投与できません（1回あたりの最大投与量600mgを超えるため）
        </div>
      )}

      {/* 注意・参考 */}
      <div className={styles.note}>
        {indication === 'urticaria' ? (
          <>
            <p><strong>適応:</strong> 既存治療で効果不十分な慢性蕁麻疹（特発性）。12歳以上。</p>
            <p><strong>投与前検査:</strong> 慢性蕁麻疹では総IgE測定は投与量決定に不要だが、蕁麻疹の鑑別のため確認が望ましい。</p>
            <p><strong>効果判定:</strong> 12週間投与しても効果が認められない場合は投与中止を検討。</p>
          </>
        ) : (
          <>
            <p><strong>適応範囲:</strong> 体重 20-150kg、血清総IgE 30-1500 IU/mL。範囲外は投与不可。</p>
            <p><strong>注意:</strong> 総IgEは投与開始前の値を使用。投与中のIgE値で用量変更しない。</p>
            {indication === 'rhinitis' && (
              <p><strong>投与期間:</strong> スギ花粉飛散期間中のみ（概ね2-4月）。</p>
            )}
          </>
        )}
        <p><strong>安全管理:</strong> 初回投与後30分は院内観察必須（アナフィラキシー対応）。</p>
        <p>ゾレア皮下注 添付文書（ノバルティスファーマ）</p>
      </div>
    </div>
  );
}
