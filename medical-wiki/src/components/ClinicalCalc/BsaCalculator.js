import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

const BSA_PARTS = [
  { key: 'head', label: '頭頸部', bsa: 9 },
  { key: 'r_arm', label: '右上肢', bsa: 9 },
  { key: 'l_arm', label: '左上肢', bsa: 9 },
  { key: 'chest', label: '胸部', bsa: 9 },
  { key: 'abdomen', label: '腹部', bsa: 9 },
  { key: 'upper_back', label: '背部（上）', bsa: 9 },
  { key: 'lower_back', label: '腰・臀部', bsa: 9 },
  { key: 'r_thigh', label: '右大腿', bsa: 9 },
  { key: 'r_calf', label: '右下腿', bsa: 9 },
  { key: 'l_thigh', label: '左大腿', bsa: 9 },
  { key: 'l_calf', label: '左下腿', bsa: 9 },
  { key: 'perineum', label: '会陰部', bsa: 1 },
];

function BodyDiagram({ selected, onToggle }) {
  const pf = (k) => selected[k] ? '#1976d2' : '#e8e8e8';
  const ps = (k) => selected[k] ? '#0d47a1' : '#9e9e9e';
  const ef = (k) => selected[k] ? '#90caf9' : '#f5f5f5';
  const es = (k) => selected[k] ? '#64b5f6' : '#bdbdbd';
  const cs = { cursor: 'pointer', transition: 'fill 0.15s' };
  const tf = (k) => selected[k] ? '#fff' : '#666';

  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ifm-color-emphasis-600)' }}>前面</div>
        <svg viewBox="0 0 160 340" width="130" aria-label="体前面">
          <circle cx="80" cy="28" r="22" fill={pf('head')} stroke={ps('head')} strokeWidth="1.5" style={cs} onClick={() => onToggle('head')} />
          <text x="80" y="32" textAnchor="middle" fontSize="8" fill={tf('head')} pointerEvents="none">頭頸 9%</text>
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
          <rect x="46" y="58" width="68" height="50" rx="4" fill={pf('chest')} stroke={ps('chest')} strokeWidth="1.5" style={cs} onClick={() => onToggle('chest')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={tf('chest')} pointerEvents="none">胸 9%</text>
          <rect x="48" y="110" width="64" height="50" rx="4" fill={pf('abdomen')} stroke={ps('abdomen')} strokeWidth="1.5" style={cs} onClick={() => onToggle('abdomen')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={tf('abdomen')} pointerEvents="none">腹 9%</text>
          <rect x="14" y="62" width="28" height="92" rx="12" fill={pf('r_arm')} stroke={ps('r_arm')} strokeWidth="1.5" style={cs} onClick={() => onToggle('r_arm')} />
          <text x="28" y="112" textAnchor="middle" fontSize="7" fill={tf('r_arm')} pointerEvents="none">右腕</text>
          <rect x="118" y="62" width="28" height="92" rx="12" fill={pf('l_arm')} stroke={ps('l_arm')} strokeWidth="1.5" style={cs} onClick={() => onToggle('l_arm')} />
          <text x="132" y="112" textAnchor="middle" fontSize="7" fill={tf('l_arm')} pointerEvents="none">左腕</text>
          <rect x="48" y="166" width="30" height="68" rx="6" fill={pf('r_thigh')} stroke={ps('r_thigh')} strokeWidth="1.5" style={cs} onClick={() => onToggle('r_thigh')} />
          <text x="63" y="204" textAnchor="middle" fontSize="6" fill={tf('r_thigh')} pointerEvents="none">右大腿</text>
          <rect x="82" y="166" width="30" height="68" rx="6" fill={pf('l_thigh')} stroke={ps('l_thigh')} strokeWidth="1.5" style={cs} onClick={() => onToggle('l_thigh')} />
          <text x="97" y="204" textAnchor="middle" fontSize="6" fill={tf('l_thigh')} pointerEvents="none">左大腿</text>
          <rect x="50" y="240" width="26" height="68" rx="6" fill={pf('r_calf')} stroke={ps('r_calf')} strokeWidth="1.5" style={cs} onClick={() => onToggle('r_calf')} />
          <text x="63" y="278" textAnchor="middle" fontSize="6" fill={tf('r_calf')} pointerEvents="none">右下腿</text>
          <rect x="84" y="240" width="26" height="68" rx="6" fill={pf('l_calf')} stroke={ps('l_calf')} strokeWidth="1.5" style={cs} onClick={() => onToggle('l_calf')} />
          <text x="97" y="278" textAnchor="middle" fontSize="6" fill={tf('l_calf')} pointerEvents="none">左下腿</text>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ifm-color-emphasis-600)' }}>背面</div>
        <svg viewBox="0 0 160 340" width="130" aria-label="体背面">
          <circle cx="80" cy="28" r="22" fill={ef('head')} stroke={es('head')} strokeWidth="1" style={cs} onClick={() => onToggle('head')} />
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#eee" stroke="#ccc" strokeWidth="0.5" />
          <rect x="46" y="58" width="68" height="50" rx="4" fill={pf('upper_back')} stroke={ps('upper_back')} strokeWidth="1.5" style={cs} onClick={() => onToggle('upper_back')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={tf('upper_back')} pointerEvents="none">背部上 9%</text>
          <rect x="48" y="110" width="64" height="50" rx="4" fill={pf('lower_back')} stroke={ps('lower_back')} strokeWidth="1.5" style={cs} onClick={() => onToggle('lower_back')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={tf('lower_back')} pointerEvents="none">腰臀 9%</text>
          <rect x="14" y="62" width="28" height="92" rx="12" fill={ef('r_arm')} stroke={es('r_arm')} strokeWidth="1" style={cs} onClick={() => onToggle('r_arm')} />
          <rect x="118" y="62" width="28" height="92" rx="12" fill={ef('l_arm')} stroke={es('l_arm')} strokeWidth="1" style={cs} onClick={() => onToggle('l_arm')} />
          <rect x="48" y="166" width="30" height="68" rx="6" fill={ef('r_thigh')} stroke={es('r_thigh')} strokeWidth="1" style={cs} onClick={() => onToggle('r_thigh')} />
          <rect x="82" y="166" width="30" height="68" rx="6" fill={ef('l_thigh')} stroke={es('l_thigh')} strokeWidth="1" style={cs} onClick={() => onToggle('l_thigh')} />
          <rect x="50" y="240" width="26" height="68" rx="6" fill={ef('r_calf')} stroke={es('r_calf')} strokeWidth="1" style={cs} onClick={() => onToggle('r_calf')} />
          <rect x="84" y="240" width="26" height="68" rx="6" fill={ef('l_calf')} stroke={es('l_calf')} strokeWidth="1" style={cs} onClick={() => onToggle('l_calf')} />
        </svg>
      </div>
    </div>
  );
}

export default function BsaCalculator() {
  const [selected, setSelected] = useState(() => {
    const init = {};
    BSA_PARTS.forEach(p => { init[p.key] = false; });
    return init;
  });

  const toggle = useCallback((k) => {
    setSelected(prev => ({ ...prev, [k]: !prev[k] }));
  }, []);

  const total = useMemo(() => BSA_PARTS.reduce((s, p) => s + (selected[p.key] ? p.bsa : 0), 0), [selected]);

  const reset = useCallback(() => {
    setSelected(() => {
      const init = {};
      BSA_PARTS.forEach(p => { init[p.key] = false; });
      return init;
    });
  }, []);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>BSA（体表面積）計算ツール</p>
          <p className={styles.calcSub}>Rule of Nines — 患部をクリックして選択</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <BodyDiagram selected={selected} onToggle={toggle} />
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button onClick={() => toggle('perineum')}
            style={{
              padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 600,
              border: selected.perineum ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px', cursor: 'pointer',
              background: selected.perineum ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
              color: selected.perineum ? '#fff' : 'var(--ifm-font-color-base)',
            }}>
            会陰部 (1%)
          </button>
        </div>

        {BSA_PARTS.filter(p => selected[p.key]).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '0.8rem 0 0.4rem' }}>
            {BSA_PARTS.filter(p => selected[p.key]).map(p => (
              <span key={p.key} style={{ fontSize: '0.78rem', padding: '3px 8px', background: '#e3f2fd', borderRadius: '4px', color: '#1565c0', fontWeight: 600 }}>
                {p.label} {p.bsa}%
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>BSA（体表面積）</span>
          <span className={styles.resultValue}>{total}%</span>
        </div>
        <div className={styles.resultJudge} style={{
          background: total === 0 ? '#757575' : total < 10 ? '#ff9800' : '#f44336',
        }}>
          {total === 0 && '患部をクリックしてください'}
          {total > 0 && total < 10 && '軽症（BSA 10%未満）'}
          {total >= 10 && '中等症以上（BSA≧10%）'}
        </div>
      </div>

      <div className={styles.note}>
        <strong>BSA について:</strong><br />
        ・成人の体表面積をRule of Nines（9の法則）で概算<br />
        ・各部位 9%ずつ（頭頸部・各上肢・胸部・腹部・背部上・腰臀部・各大腿・各下腿）+ 会陰部 1% = 合計100%<br />
        ・アトピー性皮膚炎: BSA≧10% は中等症〜重症の基準（最適使用推進ガイドライン）<br />
        ・手掌法: 患者の片手掌面積 ≒ BSA 1% として概算することも可能<br />
        ・小児では体表面積の比率が異なる（頭部が大きく下肢が小さい）ため注意
      </div>
    </div>
  );
}
