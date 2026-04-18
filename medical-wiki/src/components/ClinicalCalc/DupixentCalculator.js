import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

/**
 * デュピクセント（デュピルマブ）統合ツール
 *
 * 1. 投与量計算（適応症・年齢・体重）
 * 2. 皮膚炎評価ツール（IGA・EASI・BSA）
 *
 * 添付文書 2024年改訂版準拠
 */

// ========== 定数 ==========

const INDICATIONS = [
  { key: 'ad', label: 'アトピー性皮膚炎' },
  { key: 'asthma', label: '気管支喘息' },
  { key: 'crsnp', label: '鼻茸を伴う慢性副鼻腔炎' },
  { key: 'pn', label: '結節性痒疹' },
];

const AGE_GROUPS = [
  { key: 'adult', label: '成人（15歳以上）' },
  { key: 'child_12_14', label: '12〜14歳' },
  { key: 'child_6_11', label: '6〜11歳' },
  { key: 'child_6m_5', label: '生後6ヶ月〜5歳' },
];

const IGA_SCALE = [
  { score: 0, label: 'クリア（0）', desc: '炎症性病変なし' },
  { score: 1, label: 'ほぼクリア（1）', desc: 'かすかな淡い紅斑のみ' },
  { score: 2, label: '軽症（2）', desc: '淡い紅斑、わずかな丘疹' },
  { score: 3, label: '中等症（3）', desc: '明らかな紅斑・丘疹・浸潤' },
  { score: 4, label: '重症（4）', desc: '著明な紅斑、広範な丘疹・浸潤・苔癬化' },
];

const EASI_REGIONS = [
  { key: 'head', label: '頭頸部', multiplier: 0.1 },
  { key: 'upper', label: '上肢', multiplier: 0.2 },
  { key: 'trunk', label: '体幹', multiplier: 0.3 },
  { key: 'lower', label: '下肢', multiplier: 0.4 },
];

const EASI_SIGNS = [
  { key: 'erythema', label: '紅斑' },
  { key: 'edema', label: '浮腫/丘疹' },
  { key: 'excoriation', label: '掻破痕' },
  { key: 'lichenification', label: '苔癬化' },
];

const AREA_LABELS = ['0%', '1-9%', '10-29%', '30-49%', '50-69%', '70-89%', '90-100%'];

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

// ========== 投与量計算 ==========

function calcDose(indication, ageGroup, weight) {
  // === アトピー性皮膚炎 ===
  if (indication === 'ad') {
    // 成人: 体重によらず一律（添付文書準拠）
    if (ageGroup === 'adult') {
      return {
        loading: 600, loadingNote: '（300mg×2本を2箇所に注射）',
        maintenance: 300, interval: 2, pen: '300mgペン',
        notes: '初回のみ600mg、以降300mg 2週間隔（体重によらず一律）',
      };
    }
    const w = parseFloat(weight);
    if (ageGroup === 'child_12_14') {
      if (w && w >= 60) {
        return {
          loading: 600, loadingNote: '（300mg×2本を2箇所に注射）',
          maintenance: 300, interval: 2, pen: '300mgペン',
          notes: '初回のみ600mg、以降300mg 2週間隔',
        };
      }
      if (w && w >= 30) {
        return {
          loading: 400, loadingNote: '（200mg×2本を2箇所に注射）',
          maintenance: 200, interval: 2, pen: '200mgペン',
          notes: '初回のみ400mg、以降200mg 2週間隔',
        };
      }
      // 30kg未満の12-14歳は小児扱い → fall through
    }
    if (ageGroup === 'child_6_11' || (ageGroup === 'child_12_14' && parseFloat(weight) < 30)) {
      const w2 = parseFloat(weight);
      if (w2 && w2 >= 60) {
        return { loading: 600, loadingNote: '（300mg×2本）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '60kg以上: 成人と同量' };
      }
      if (w2 && w2 >= 30) {
        return { loading: 400, loadingNote: '（200mg×2本）', maintenance: 200, interval: 2, pen: '200mgペン', notes: '30-60kg: 初回400mg、以降200mg 2週間隔' };
      }
      if (w2 && w2 >= 15) {
        return { loading: 600, loadingNote: '（300mg×2本）', maintenance: 300, interval: 4, pen: '300mgペン', notes: '15-30kg: 初回600mg、以降300mg 4週間隔' };
      }
      if (w2 && w2 >= 5) {
        return { loading: 200, loadingNote: '（200mg×1本）', maintenance: 200, interval: 4, pen: '200mgペン', notes: '5-15kg: 初回200mg、以降200mg 4週間隔' };
      }
      return { error: '5kg未満は投与対象外' };
    }
    if (ageGroup === 'child_6m_5') {
      const w3 = parseFloat(weight);
      if (w3 && w3 >= 15) {
        return { loading: 300, loadingNote: '（300mg×1本）', maintenance: 300, interval: 4, pen: '300mgペン', notes: '15kg以上: 初回300mg、以降300mg 4週間隔' };
      }
      if (w3 && w3 >= 5) {
        return { loading: 200, loadingNote: '（200mg×1本）', maintenance: 200, interval: 4, pen: '200mgペン', notes: '5-15kg: 初回200mg、以降200mg 4週間隔' };
      }
      return { error: '5kg未満は投与対象外' };
    }
  }

  // === 気管支喘息 ===
  if (indication === 'asthma') {
    if (ageGroup === 'adult' || ageGroup === 'child_12_14') {
      return {
        loading: 400, loadingNote: '（200mg×2本を2箇所に注射）',
        maintenance: 200, interval: 2, pen: '200mgペン',
        notes: '初回のみ400mg、以降200mg 2週間隔。経口ステロイド依存例や重症AD合併例では初回600mg→300mg q2wも考慮。',
      };
    }
    if (ageGroup === 'child_6_11') {
      const w = parseFloat(weight);
      if (w && w >= 30) {
        return { loading: null, loadingNote: '', maintenance: 200, interval: 2, pen: '200mgペン', notes: '30kg以上: 200mg 2週間隔（負荷投与なし）。100mg q2wも可。' };
      }
      if (w && w >= 15) {
        return { loading: null, loadingNote: '', maintenance: 100, interval: 2, pen: '200mgペン（半量使用）', notes: '15-30kg: 100mg 2週間隔（負荷投与なし）。200mgペンの半量を使用。' };
      }
      return { error: '15kg未満の小児喘息への適応なし' };
    }
    if (ageGroup === 'child_6m_5') {
      return { error: '6歳未満の喘息には適応なし（6歳以上が対象）' };
    }
  }

  // === 鼻茸を伴う慢性副鼻腔炎 ===
  if (indication === 'crsnp') {
    if (ageGroup === 'adult') {
      return { loading: null, loadingNote: '', maintenance: 300, interval: 2, pen: '300mgペン', notes: '300mg 2週間隔（負荷投与なし）。既存の鼻噴霧用ステロイドは継続。' };
    }
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  // === 結節性痒疹 ===
  if (indication === 'pn') {
    if (ageGroup === 'adult') {
      return { loading: 600, loadingNote: '（300mg×2本を2箇所に注射）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '初回のみ600mg、以降300mg 2週間隔' };
    }
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  return null;
}

// ========== EASI計算 ==========

function initEasiScores() {
  const scores = {};
  EASI_REGIONS.forEach(r => {
    scores[r.key] = { area: 0, erythema: 0, edema: 0, excoriation: 0, lichenification: 0 };
  });
  return scores;
}

function calcEasiTotal(scores) {
  return EASI_REGIONS.reduce((total, region) => {
    const r = scores[region.key];
    const signSum = r.erythema + r.edema + r.excoriation + r.lichenification;
    return total + r.area * signSum * region.multiplier;
  }, 0);
}

function getEasiSeverity(score) {
  if (score === 0) return { label: 'クリア', color: '#4caf50' };
  if (score < 6) return { label: '軽症', color: '#8bc34a' };
  if (score < 23) return { label: '中等症', color: '#ff9800' };
  if (score <= 50) return { label: '重症', color: '#f44336' };
  return { label: '最重症', color: '#b71c1c' };
}

// ========== BSA 身体図 ==========

function BodyDiagram({ selected, onToggle }) {
  const partFill = (key) => selected[key] ? '#1976d2' : '#e8e8e8';
  const partStroke = (key) => selected[key] ? '#0d47a1' : '#9e9e9e';
  const echoFill = (key) => selected[key] ? '#90caf9' : '#f5f5f5';
  const echoStroke = (key) => selected[key] ? '#64b5f6' : '#bdbdbd';
  const commonStyle = { cursor: 'pointer', transition: 'fill 0.15s' };

  return (
    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* 前面 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--ifm-color-emphasis-600)' }}>前面</div>
        <svg viewBox="0 0 160 340" width="120" aria-label="体前面">
          {/* 頭 */}
          <circle cx="80" cy="28" r="22" fill={partFill('head')} stroke={partStroke('head')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('head')} />
          <text x="80" y="32" textAnchor="middle" fontSize="8" fill={selected.head ? '#fff' : '#666'} pointerEvents="none">頭頸</text>
          {/* 首（装飾） */}
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
          {/* 胸 */}
          <rect x="46" y="58" width="68" height="50" rx="4" fill={partFill('chest')} stroke={partStroke('chest')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('chest')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={selected.chest ? '#fff' : '#666'} pointerEvents="none">胸部</text>
          {/* 腹 */}
          <rect x="48" y="110" width="64" height="50" rx="4" fill={partFill('abdomen')} stroke={partStroke('abdomen')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('abdomen')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={selected.abdomen ? '#fff' : '#666'} pointerEvents="none">腹部</text>
          {/* 右腕 */}
          <rect x="14" y="62" width="28" height="92" rx="12" fill={partFill('r_arm')} stroke={partStroke('r_arm')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('r_arm')} />
          <text x="28" y="112" textAnchor="middle" fontSize="7" fill={selected.r_arm ? '#fff' : '#666'} pointerEvents="none">右腕</text>
          {/* 左腕 */}
          <rect x="118" y="62" width="28" height="92" rx="12" fill={partFill('l_arm')} stroke={partStroke('l_arm')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('l_arm')} />
          <text x="132" y="112" textAnchor="middle" fontSize="7" fill={selected.l_arm ? '#fff' : '#666'} pointerEvents="none">左腕</text>
          {/* 右大腿 */}
          <rect x="48" y="166" width="30" height="68" rx="6" fill={partFill('r_thigh')} stroke={partStroke('r_thigh')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('r_thigh')} />
          <text x="63" y="204" textAnchor="middle" fontSize="6" fill={selected.r_thigh ? '#fff' : '#666'} pointerEvents="none">右大腿</text>
          {/* 左大腿 */}
          <rect x="82" y="166" width="30" height="68" rx="6" fill={partFill('l_thigh')} stroke={partStroke('l_thigh')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('l_thigh')} />
          <text x="97" y="204" textAnchor="middle" fontSize="6" fill={selected.l_thigh ? '#fff' : '#666'} pointerEvents="none">左大腿</text>
          {/* 右下腿 */}
          <rect x="50" y="240" width="26" height="68" rx="6" fill={partFill('r_calf')} stroke={partStroke('r_calf')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('r_calf')} />
          <text x="63" y="278" textAnchor="middle" fontSize="6" fill={selected.r_calf ? '#fff' : '#666'} pointerEvents="none">右下腿</text>
          {/* 左下腿 */}
          <rect x="84" y="240" width="26" height="68" rx="6" fill={partFill('l_calf')} stroke={partStroke('l_calf')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('l_calf')} />
          <text x="97" y="278" textAnchor="middle" fontSize="6" fill={selected.l_calf ? '#fff' : '#666'} pointerEvents="none">左下腿</text>
        </svg>
      </div>
      {/* 背面 */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--ifm-color-emphasis-600)' }}>背面</div>
        <svg viewBox="0 0 160 340" width="120" aria-label="体背面">
          {/* 頭（エコー） */}
          <circle cx="80" cy="28" r="22" fill={echoFill('head')} stroke={echoStroke('head')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('head')} />
          {/* 首（装飾） */}
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#eee" stroke="#ccc" strokeWidth="0.5" />
          {/* 背部（上） */}
          <rect x="46" y="58" width="68" height="50" rx="4" fill={partFill('upper_back')} stroke={partStroke('upper_back')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('upper_back')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={selected.upper_back ? '#fff' : '#666'} pointerEvents="none">背部上</text>
          {/* 腰・臀部 */}
          <rect x="48" y="110" width="64" height="50" rx="4" fill={partFill('lower_back')} stroke={partStroke('lower_back')} strokeWidth="1.5" style={commonStyle} onClick={() => onToggle('lower_back')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={selected.lower_back ? '#fff' : '#666'} pointerEvents="none">腰臀部</text>
          {/* 腕（エコー） */}
          <rect x="14" y="62" width="28" height="92" rx="12" fill={echoFill('r_arm')} stroke={echoStroke('r_arm')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('r_arm')} />
          <rect x="118" y="62" width="28" height="92" rx="12" fill={echoFill('l_arm')} stroke={echoStroke('l_arm')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('l_arm')} />
          {/* 脚（エコー） */}
          <rect x="48" y="166" width="30" height="68" rx="6" fill={echoFill('r_thigh')} stroke={echoStroke('r_thigh')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('r_thigh')} />
          <rect x="82" y="166" width="30" height="68" rx="6" fill={echoFill('l_thigh')} stroke={echoStroke('l_thigh')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('l_thigh')} />
          <rect x="50" y="240" width="26" height="68" rx="6" fill={echoFill('r_calf')} stroke={echoStroke('r_calf')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('r_calf')} />
          <rect x="84" y="240" width="26" height="68" rx="6" fill={echoFill('l_calf')} stroke={echoStroke('l_calf')} strokeWidth="1" style={commonStyle} onClick={() => onToggle('l_calf')} />
        </svg>
      </div>
    </div>
  );
}

// ========== スコアピッカー ==========

function ScorePicker({ value, max, onChange, labels }) {
  return (
    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
      {Array.from({ length: max + 1 }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          title={labels ? labels[i] : undefined}
          style={{
            width: '28px', height: '26px', fontSize: '0.75rem', fontWeight: 700,
            border: i === value ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            background: i === value ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
            color: i === value ? '#fff' : 'var(--ifm-font-color-base)',
            cursor: 'pointer', padding: 0,
          }}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

// ========== メインコンポーネント ==========

export default function DupixentCalculator() {
  // --- 投与量 ---
  const [indication, setIndication] = useState('ad');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [weight, setWeight] = useState('');

  // --- 評価ツール ---
  const [assessTab, setAssessTab] = useState(null); // null | 'iga' | 'easi' | 'bsa'
  const [igaScore, setIgaScore] = useState(null);
  const [easiScores, setEasiScores] = useState(initEasiScores);
  const [expandedEasiRegion, setExpandedEasiRegion] = useState('head');
  const [bsaSelected, setBsaSelected] = useState(() => {
    const init = {};
    BSA_PARTS.forEach(p => { init[p.key] = false; });
    return init;
  });

  // --- 投与量ロジック ---
  const needsWeight = useMemo(() => {
    if (indication === 'crsnp' || indication === 'pn') return false;
    if (indication === 'ad') {
      if (ageGroup === 'adult') return false; // 成人は一律用量
      return true;
    }
    if (indication === 'asthma') return ageGroup === 'child_6_11';
    return false;
  }, [indication, ageGroup]);

  const availableAgeGroups = useMemo(() => {
    if (indication === 'crsnp' || indication === 'pn') return AGE_GROUPS.filter(a => a.key === 'adult');
    if (indication === 'asthma') return AGE_GROUPS.filter(a => a.key !== 'child_6m_5');
    return AGE_GROUPS;
  }, [indication]);

  const result = useMemo(() => {
    if (needsWeight && (!weight || parseFloat(weight) <= 0)) return null;
    return calcDose(indication, ageGroup, weight);
  }, [indication, ageGroup, weight, needsWeight]);

  // --- EASI ---
  const easiTotal = useMemo(() => calcEasiTotal(easiScores), [easiScores]);
  const easiSeverity = getEasiSeverity(easiTotal);

  // --- BSA ---
  const bsaTotal = useMemo(() => {
    return BSA_PARTS.reduce((sum, p) => sum + (bsaSelected[p.key] ? p.bsa : 0), 0);
  }, [bsaSelected]);

  // --- ハンドラ ---
  const resetDosing = useCallback(() => {
    setWeight('');
  }, []);

  const handleIndicationChange = useCallback((key) => {
    setIndication(key);
    setWeight('');
    if (key === 'crsnp' || key === 'pn') setAgeGroup('adult');
  }, []);

  const updateEasiScore = useCallback((regionKey, signKey, value) => {
    setEasiScores(prev => ({
      ...prev,
      [regionKey]: { ...prev[regionKey], [signKey]: value },
    }));
  }, []);

  const toggleBsaPart = useCallback((key) => {
    setBsaSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAssess = useCallback(() => {
    setIgaScore(null);
    setEasiScores(initEasiScores());
    setBsaSelected(() => {
      const init = {};
      BSA_PARTS.forEach(p => { init[p.key] = false; });
      return init;
    });
  }, []);

  // ========== レンダリング ==========
  return (
    <div className={styles.calc} style={{ maxWidth: '560px' }}>
      {/* ===== ヘッダー ===== */}
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>デュピクセント（デュピルマブ）</p>
          <p className={styles.calcSub}>投与量計算 + 皮膚炎評価ツール</p>
        </div>
        <button className={styles.resetBtn} onClick={resetDosing}>リセット</button>
      </div>

      {/* ===== 投与量セクション ===== */}
      <div className={styles.calcBody}>
        {/* 適応症 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>適応症</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {INDICATIONS.map((ind) => (
              <button
                key={ind.key}
                className={`${styles.toggleBtn} ${indication === ind.key ? styles.toggleBtnActive : ''}`}
                onClick={() => handleIndicationChange(ind.key)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* 年齢 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>年齢区分</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {availableAgeGroups.map((ag) => (
              <button
                key={ag.key}
                className={`${styles.toggleBtn} ${ageGroup === ag.key ? styles.toggleBtnActive : ''}`}
                onClick={() => { setAgeGroup(ag.key); setWeight(''); }}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 体重入力（小児のみ — 成人は一律用量のため不要） */}
        {needsWeight && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              体重 <span className={styles.inputUnit}>(kg)</span>
            </label>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.inputField}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例: 25"
                min="3"
                max="200"
                step="0.1"
              />
              <span className={styles.unitText}>kg</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== 投与量結果 ===== */}
      {result && !result.error && (
        <div className={styles.result}>
          {result.loading && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>初回（負荷投与）</span>
              <span className={styles.resultValue}>{result.loading}mg</span>
            </div>
          )}
          {result.loading && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>{result.loadingNote}</span>
            </div>
          )}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>維持投与</span>
            <span className={styles.resultValue}>{result.maintenance}mg</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>投与間隔</span>
            <span className={styles.resultValue}>{result.interval}週間隔</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>使用製剤</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{result.pen}</span>
          </div>
          <div className={styles.resultJudge} style={{ background: '#1565c0' }}>
            {result.notes}
          </div>
        </div>
      )}

      {result && result.error && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#c62828' }}>
            {result.error}
          </div>
        </div>
      )}

      {!result && needsWeight && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#757575' }}>
            体重を入力してください
          </div>
        </div>
      )}

      {/* ===== 注意事項 ===== */}
      <div className={styles.note}>
        <strong>注意事項:</strong><br />
        ・自己注射指導を実施し、十分な教育訓練を行ってから在宅自己注射に移行<br />
        ・注射部位: 腹部・大腿部・上腕外側（毎回異なる部位に注射）<br />
        ・冷蔵保存（2-8℃）。使用前に室温に45分以上戻す<br />
        ・結膜炎（特にAD）の発現に注意（約10-20%）<br />
        ・投与開始後も外用療法（ステロイド外用・保湿等）は継続<br />
        ・喘息: 経口ステロイドの急な中止は禁忌（漸減すること）
      </div>

      {/* ===== 皮膚炎評価ツール ===== */}
      <div style={{
        borderTop: '2px solid var(--ifm-color-emphasis-300)',
        margin: '0',
        padding: '0.8rem 1.2rem 0.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ifm-font-color-base)' }}>
            皮膚炎評価ツール
          </span>
          <button className={styles.resetBtn} onClick={resetAssess}
            style={{ border: '1px solid var(--ifm-color-emphasis-400)', color: 'var(--ifm-color-emphasis-600)' }}>
            評価リセット
          </button>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.8rem' }}>
          {[
            { key: 'iga', label: 'IGA' },
            { key: 'easi', label: 'EASI' },
            { key: 'bsa', label: 'BSA' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setAssessTab(assessTab === tab.key ? null : tab.key)}
              style={{
                flex: 1, padding: '0.4rem 0.3rem', fontSize: '0.8rem', fontWeight: 700,
                border: assessTab === tab.key ? '2px solid var(--ifm-color-primary)' : '2px solid var(--ifm-color-emphasis-300)',
                borderRadius: '6px',
                background: assessTab === tab.key ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                color: assessTab === tab.key ? '#fff' : 'var(--ifm-font-color-base)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
              {tab.key === 'iga' && igaScore !== null && (
                <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({igaScore})</span>
              )}
              {tab.key === 'easi' && easiTotal > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({easiTotal.toFixed(1)})</span>
              )}
              {tab.key === 'bsa' && bsaTotal > 0 && (
                <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({bsaTotal}%)</span>
              )}
            </button>
          ))}
        </div>

        {/* === IGA パネル === */}
        {assessTab === 'iga' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Investigator Global Assessment — 治験責任医師による全般評価
            </div>
            {IGA_SCALE.map(item => (
              <div
                key={item.score}
                onClick={() => setIgaScore(item.score)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 0.7rem', marginBottom: '3px',
                  border: igaScore === item.score
                    ? '2px solid var(--ifm-color-primary)'
                    : '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '6px', cursor: 'pointer',
                  background: igaScore === item.score ? 'var(--ifm-color-primary-lightest)' : 'transparent',
                }}
              >
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700,
                  background: igaScore === item.score ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
                  color: igaScore === item.score ? '#fff' : 'var(--ifm-font-color-base)',
                }}>
                  {item.score}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ifm-color-emphasis-500)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
            {igaScore !== null && (
              <div style={{
                marginTop: '0.5rem', padding: '0.5rem 0.7rem', borderRadius: '6px',
                background: igaScore >= 3 ? '#fff3e0' : '#e8f5e9',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                IGA = {igaScore}
                {igaScore >= 3 && ' → 生物学的製剤の適応を検討'}
                {igaScore <= 1 && ' → 治療目標達成（IGA 0-1）'}
              </div>
            )}
          </div>
        )}

        {/* === EASI パネル === */}
        {assessTab === 'easi' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Eczema Area and Severity Index（0〜72点）
            </div>

            {EASI_REGIONS.map(region => {
              const isExpanded = expandedEasiRegion === region.key;
              const r = easiScores[region.key];
              const signSum = r.erythema + r.edema + r.excoriation + r.lichenification;
              const regionScore = r.area * signSum * region.multiplier;

              return (
                <div key={region.key} style={{
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '6px', marginBottom: '4px', overflow: 'hidden',
                }}>
                  {/* リージョンヘッダ */}
                  <div
                    onClick={() => setExpandedEasiRegion(isExpanded ? null : region.key)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.4rem 0.7rem', cursor: 'pointer',
                      background: isExpanded ? 'var(--ifm-color-emphasis-100)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {isExpanded ? '▼' : '▶'} {region.label}
                      <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--ifm-color-emphasis-500)', marginLeft: '4px' }}>
                        (×{region.multiplier})
                      </span>
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
                      {regionScore.toFixed(1)}
                    </span>
                  </div>

                  {/* スコア入力 */}
                  {isExpanded && (
                    <div style={{ padding: '0.4rem 0.7rem 0.5rem' }}>
                      {/* 面積 */}
                      <div style={{ marginBottom: '0.4rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px', color: 'var(--ifm-color-emphasis-600)' }}>
                          面積 (0-6)
                          {r.area > 0 && (
                            <span style={{ fontWeight: 400, marginLeft: '6px' }}>= {AREA_LABELS[r.area]}</span>
                          )}
                        </div>
                        <ScorePicker value={r.area} max={6} onChange={(v) => updateEasiScore(region.key, 'area', v)} labels={AREA_LABELS} />
                      </div>
                      {/* 所見 */}
                      {EASI_SIGNS.map(sign => (
                        <div key={sign.key} style={{ marginBottom: '0.3rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px', color: 'var(--ifm-color-emphasis-600)' }}>
                            {sign.label} (0-3)
                          </div>
                          <ScorePicker value={r[sign.key]} max={3} onChange={(v) => updateEasiScore(region.key, sign.key, v)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* EASI合計 */}
            <div style={{
              marginTop: '0.5rem', padding: '0.6rem 0.7rem', borderRadius: '6px',
              background: easiSeverity.color, color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                EASI = {easiTotal.toFixed(1)} / 72
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                {easiSeverity.label}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.3rem' }}>
              {'軽症 <6 / 中等症 6-22 / 重症 23-50 / 最重症 >50'}
            </div>
          </div>
        )}

        {/* === BSA パネル === */}
        {assessTab === 'bsa' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              体表面積（Rule of Nines） — 患部をクリックして選択
            </div>

            <BodyDiagram selected={bsaSelected} onToggle={toggleBsaPart} />

            {/* 会陰部ボタン */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                onClick={() => toggleBsaPart('perineum')}
                style={{
                  padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 600,
                  border: bsaSelected.perineum ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '4px', cursor: 'pointer',
                  background: bsaSelected.perineum ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                  color: bsaSelected.perineum ? '#fff' : 'var(--ifm-font-color-base)',
                }}
              >
                会陰部 (1%)
              </button>
            </div>

            {/* 選択パーツ一覧 */}
            <div style={{ marginTop: '0.6rem' }}>
              {BSA_PARTS.filter(p => bsaSelected[p.key]).length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.4rem',
                }}>
                  {BSA_PARTS.filter(p => bsaSelected[p.key]).map(p => (
                    <span key={p.key} style={{
                      fontSize: '0.72rem', padding: '2px 6px',
                      background: '#e3f2fd', borderRadius: '3px', color: '#1565c0',
                    }}>
                      {p.label} {p.bsa}%
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* BSA合計 */}
            <div style={{
              padding: '0.6rem 0.7rem', borderRadius: '6px',
              background: bsaTotal >= 10 ? '#f44336' : bsaTotal > 0 ? '#ff9800' : '#757575',
              color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                BSA = {bsaTotal}%
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {bsaTotal === 0 && '部位を選択'}
                {bsaTotal > 0 && bsaTotal < 10 && '軽症（BSA 10%未満）'}
                {bsaTotal >= 10 && '中等症以上（BSA≧10%）'}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.3rem' }}>
              BSA≧10% → 中等症〜重症ADとして生物学的製剤の適応検討
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
