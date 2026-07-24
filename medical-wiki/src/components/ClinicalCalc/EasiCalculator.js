import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

const REGIONS = [
  { key: 'head', label: '頭頸部', multiplier: 0.1, bodyPercent: 10 },
  { key: 'upper', label: '上肢', multiplier: 0.2, bodyPercent: 20 },
  { key: 'trunk', label: '体幹', multiplier: 0.3, bodyPercent: 30 },
  { key: 'lower', label: '下肢', multiplier: 0.4, bodyPercent: 40 },
];

const SIGNS = [
  { key: 'erythema', label: '紅斑' },
  { key: 'edema', label: '浮腫/丘疹' },
  { key: 'excoriation', label: '掻破痕' },
  { key: 'lichenification', label: '苔癬化' },
];

const AREA_LABELS = ['0%', '1-9%', '10-29%', '30-49%', '50-69%', '70-89%', '90-100%'];
// 各面積スコアの中央値 (%) - BSA 概算に使用
const AREA_MEDIANS = [0, 5, 19.5, 39.5, 59.5, 79.5, 95];

function initScores() {
  const s = {};
  REGIONS.forEach(r => { s[r.key] = { area: 0, erythema: 0, edema: 0, excoriation: 0, lichenification: 0 }; });
  return s;
}

function getSeverity(score) {
  if (score === 0) return { label: 'クリア', color: '#4caf50' };
  if (score < 6) return { label: '軽症', color: '#8bc34a' };
  if (score < 23) return { label: '中等症', color: '#ff9800' };
  if (score <= 50) return { label: '重症', color: '#f44336' };
  return { label: '最重症', color: '#b71c1c' };
}

function ScorePicker({ value, max, onChange, labels }) {
  return (
    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
      {Array.from({ length: max + 1 }, (_, i) => (
        <button key={i} onClick={() => onChange(i)} title={labels ? labels[i] : undefined}
          style={{
            width: '30px', height: '28px', fontSize: '0.8rem', fontWeight: 700,
            border: i === value ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            background: i === value ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
            color: i === value ? '#fff' : 'var(--ifm-font-color-base)',
            cursor: 'pointer', padding: 0,
          }}>
          {i}
        </button>
      ))}
    </div>
  );
}

export default function EasiCalculator() {
  const [scores, setScores] = useState(initScores);
  const [expanded, setExpanded] = useState('head');

  const total = useMemo(() => {
    return REGIONS.reduce((t, r) => {
      const s = scores[r.key];
      return t + s.area * (s.erythema + s.edema + s.excoriation + s.lichenification) * r.multiplier;
    }, 0);
  }, [scores]);

  // BSA 概算 (%): 各部位の面積スコア中央値 × その部位の全身面積比
  const bsa = useMemo(() => {
    return REGIONS.reduce((total, r) => {
      const areaScore = scores[r.key].area;
      const areaMedian = AREA_MEDIANS[areaScore] || 0;
      return total + (r.bodyPercent * areaMedian / 100);
    }, 0);
  }, [scores]);

  const severity = getSeverity(total);

  const updateScore = useCallback((rk, sk, v) => {
    setScores(prev => ({ ...prev, [rk]: { ...prev[rk], [sk]: v } }));
  }, []);

  const reset = useCallback(() => {
    setScores(initScores());
    setExpanded('head');
  }, []);

  const outputText = useMemo(() => {
    if (total === 0 && bsa === 0) return '';
    const lines = [];
    lines.push('【EASI（Eczema Area and Severity Index） __DATE__】');
    lines.push('');
    lines.push(`EASI スコア: ${total.toFixed(1)} / 72 → ${severity.label}`);
    lines.push(`BSA 概算: ${bsa.toFixed(1)}% (面積スコア中央値法)`);
    lines.push('');
    REGIONS.forEach((r) => {
      const s = scores[r.key];
      const rs = s.area * (s.erythema + s.edema + s.excoriation + s.lichenification) * r.multiplier;
      lines.push(`■ ${r.label} (×${r.multiplier}、全身${r.bodyPercent}%)`);
      lines.push(`  面積: ${s.area} (${AREA_LABELS[s.area]})、紅斑: ${s.erythema}、浮腫/丘疹: ${s.edema}、掻破痕: ${s.excoriation}、苔癬化: ${s.lichenification}`);
      lines.push(`  部位別スコア: ${rs.toFixed(1)}`);
    });
    lines.push('');
    lines.push('■ 判定');
    lines.push(`${severity.label} (EASI ${total.toFixed(1)} 点)`);
    if (total >= 16) {
      lines.push('※ EASI ≥16: 生物学的製剤 (デュピルマブ等)・JAK 阻害薬の適応基準の一つ (最適使用推進ガイドライン)。');
    }
    lines.push('');
    lines.push('※ BSA 概算は EASI 面積スコアの中央値 (1-9%→5, 10-29%→19.5, 30-49%→39.5, 50-69%→59.5, 70-89%→79.5, 90-100%→95) × 各部位の全身面積比 (頭頸部10/上肢20/体幹30/下肢40)。');
    return lines.join('\n');
  }, [scores, total, bsa, severity]);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>EASI（Eczema Area and Severity Index）</p>
          <p className={styles.calcSub}>湿疹の面積と重症度指数（0〜72点）+ BSA 概算</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {REGIONS.map(region => {
          const isExp = expanded === region.key;
          const r = scores[region.key];
          const rs = r.area * (r.erythema + r.edema + r.excoriation + r.lichenification) * region.multiplier;

          return (
            <div key={region.key} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '6px', marginBottom: '6px', overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isExp ? null : region.key)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', cursor: 'pointer', background: isExp ? 'var(--ifm-color-emphasis-100)' : 'transparent' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {isExp ? '▼' : '▶'} {region.label}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ifm-color-emphasis-500)', marginLeft: '6px' }}>(×{region.multiplier}、全身{region.bodyPercent}%)</span>
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>{rs.toFixed(1)}</span>
              </div>
              {isExp && (
                <div style={{ padding: '0.5rem 0.8rem 0.6rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px', color: 'var(--ifm-color-emphasis-600)' }}>
                      面積 (0-6){r.area > 0 && <span style={{ fontWeight: 400, marginLeft: '6px' }}>= {AREA_LABELS[r.area]}</span>}
                    </div>
                    <ScorePicker value={r.area} max={6} onChange={v => updateScore(region.key, 'area', v)} labels={AREA_LABELS} />
                  </div>
                  {SIGNS.map(sign => (
                    <div key={sign.key} style={{ marginBottom: '0.4rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px', color: 'var(--ifm-color-emphasis-600)' }}>{sign.label} (0-3)</div>
                      <ScorePicker value={r[sign.key]} max={3} onChange={v => updateScore(region.key, sign.key, v)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>EASI スコア</span>
          <span className={styles.resultValue}>{total.toFixed(1)} / 72</span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>BSA 概算</span>
          <span className={styles.resultValue}>{bsa.toFixed(1)} %</span>
        </div>
        <div className={styles.resultJudge} style={{ background: severity.color }}>
          {severity.label}
        </div>
      </div>

      <PsychCopyBox text={outputText} />

      <div className={styles.note}>
        <strong>EASI について:</strong><br />
        ・4部位（頭頸部・上肢・体幹・下肢）の面積と4つの所見（紅斑・浮腫/丘疹・掻破痕・苔癬化）から算出<br />
        ・{'軽症 <6 / 中等症 6-22 / 重症 23-50 / 最重症 >50'}<br />
        ・最適使用推進ガイドライン: EASI≧16が生物学的製剤の適応基準の一つ<br />
        ・EASI-50（50%改善）、EASI-75（75%改善）が治療効果の指標として使用される<br />
        <br />
        <strong>BSA 概算について:</strong><br />
        ・各部位の EASI 面積スコアの中央値 (1-9%→5、10-29%→19.5、30-49%→39.5、50-69%→59.5、70-89%→79.5、90-100%→95) と各部位の全身面積比 (頭頸部10%・上肢20%・体幹30%・下肢40%) の積の合計。<br />
        ・生物学的製剤・JAK 阻害薬の適応判断 (BSA ≥10% 等) の目安として参考にできますが、実際の判定では手掌法 (患者手掌+指=1%) 等での再確認を推奨。
      </div>
    </div>
  );
}
