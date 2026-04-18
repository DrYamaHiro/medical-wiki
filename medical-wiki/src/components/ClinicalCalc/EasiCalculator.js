import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

const REGIONS = [
  { key: 'head', label: '頭頸部', multiplier: 0.1 },
  { key: 'upper', label: '上肢', multiplier: 0.2 },
  { key: 'trunk', label: '体幹', multiplier: 0.3 },
  { key: 'lower', label: '下肢', multiplier: 0.4 },
];

const SIGNS = [
  { key: 'erythema', label: '紅斑' },
  { key: 'edema', label: '浮腫/丘疹' },
  { key: 'excoriation', label: '掻破痕' },
  { key: 'lichenification', label: '苔癬化' },
];

const AREA_LABELS = ['0%', '1-9%', '10-29%', '30-49%', '50-69%', '70-89%', '90-100%'];

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

  const severity = getSeverity(total);

  const updateScore = useCallback((rk, sk, v) => {
    setScores(prev => ({ ...prev, [rk]: { ...prev[rk], [sk]: v } }));
  }, []);

  const reset = useCallback(() => {
    setScores(initScores());
    setExpanded('head');
  }, []);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>EASI（Eczema Area and Severity Index）</p>
          <p className={styles.calcSub}>湿疹の面積と重症度指数（0〜72点）</p>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ifm-color-emphasis-500)', marginLeft: '6px' }}>(×{region.multiplier})</span>
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
        <div className={styles.resultJudge} style={{ background: severity.color }}>
          {severity.label}
        </div>
      </div>

      <div className={styles.note}>
        <strong>EASI について:</strong><br />
        ・4部位（頭頸部・上肢・体幹・下肢）の面積と4つの所見（紅斑・浮腫/丘疹・掻破痕・苔癬化）から算出<br />
        ・{'軽症 <6 / 中等症 6-22 / 重症 23-50 / 最重症 >50'}<br />
        ・最適使用推進ガイドライン: EASI≧16が生物学的製剤の適応基準の一つ<br />
        ・EASI-50（50%改善）、EASI-75（75%改善）が治療効果の指標として使用される
      </div>
    </div>
  );
}
