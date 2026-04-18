import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

/**
 * デュピクセント（デュピルマブ）統合ツール
 *
 * 1. 投与量計算（5適応 × 年齢 × 体重）
 * 2. 最適使用推進ガイドライン処方要件チェック
 * 3. 適応別評価ツール（AD: IGA/EASI/BSA、喘息: ACT、CRSwNP: NPS、COPD: mMRC、PN: WI-NRS）
 *
 * 添付文書 2024年改訂版準拠
 */

// ========== 定数 ==========

const INDICATIONS = [
  { key: 'ad', label: 'アトピー性皮膚炎' },
  { key: 'asthma', label: '気管支喘息' },
  { key: 'crsnp', label: '鼻茸を伴う慢性副鼻腔炎' },
  { key: 'copd', label: 'COPD' },
  { key: 'pn', label: '結節性痒疹' },
];

const AGE_GROUPS = [
  { key: 'adult', label: '成人（15歳以上）' },
  { key: 'child_12_14', label: '12〜14歳' },
  { key: 'child_6_11', label: '6〜11歳' },
  { key: 'child_6m_5', label: '生後6ヶ月〜5歳' },
];

// --- AD評価 ---
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

// --- 喘息: ACT ---
const ACT_QUESTIONS = [
  { q: '仕事や日常生活への支障', opts: ['いつも', 'ほとんど', 'ときどき', 'たまに', '全くない'] },
  { q: '息切れの頻度', opts: ['1日2回以上', '1日1回', '週3-6回', '週1-2回', '全くない'] },
  { q: '喘息症状による覚醒', opts: ['週4回以上', '週2-3回', '週1回', '月1-2回', '全くない'] },
  { q: '発作止め吸入薬の使用', opts: ['1日3回以上', '1日1-2回', '週2-3回', '週1回以下', '使わなかった'] },
  { q: '喘息コントロールの自己評価', opts: ['全くされていない', 'あまり', 'まあまあ', 'よくされている', '完全にコントロール'] },
];

// --- CRSwNP: NPS ---
const NPS_LABELS = [
  '0: ポリープなし',
  '1: 中鼻道に限局',
  '2: 中鼻道を越えるが下鼻甲介下縁以内',
  '3: 下鼻甲介下縁を越える',
  '4: 鼻腔をほぼ完全に閉塞',
];

// --- COPD: mMRC ---
const MMRC_LABELS = [
  '0: 激しい運動時のみ息切れ',
  '1: 平地を急ぎ足か緩い坂で息切れ',
  '2: 同年齢より平地歩行が遅い/息継ぎが必要',
  '3: 平地約100mで息継ぎが必要',
  '4: 息切れで外出困難/着替えで息切れ',
];

// --- 最適使用推進ガイドライン要件 ---
const GUIDELINE_REQ = {
  ad: [
    'ステロイド外用薬やタクロリムス外用薬等の抗炎症外用薬を一定期間適切に使用しても効果不十分',
    'IGA スコア 3以上（中等症以上）',
    'EASI 16以上、または BSA 10%以上',
  ],
  asthma: [
    '高用量 ICS + LABA等の既存治療を適切に行っても喘息症状をコントロールできない',
    '血中好酸球数 150/μL以上（発作時は300/μL以上も考慮）',
    '通年性の吸入抗原に対する特異的IgE陽性またはFeNO 25ppb以上が参考所見',
  ],
  crsnp: [
    '手術療法および既存の内科的治療（鼻噴霧用ステロイド等）を適切に行っても効果不十分',
    '両側鼻茸スコア（NPS）5以上',
    '鼻閉重症度スコア 2以上（中等症〜重症の鼻閉）',
  ],
  copd: [
    'LAMA + LABA + ICS 等の最大限の吸入療法を適切に行っても増悪を繰り返す',
    '血中好酸球数 150/μL以上',
    '前年に中等度以上の増悪を2回以上、または重度の増悪（入院）を1回以上',
  ],
  pn: [
    '抗ヒスタミン薬、ステロイド外用薬等の既存治療を適切に行っても効果不十分',
    '結節性痒疹の確定診断（20個以上の痒疹結節が6週間以上持続）',
  ],
};

// 適応別の評価タブ定義
const ASSESS_TABS = {
  ad: [{ key: 'iga', label: 'IGA' }, { key: 'easi', label: 'EASI' }, { key: 'bsa', label: 'BSA' }],
  asthma: [{ key: 'act', label: 'ACT' }],
  crsnp: [{ key: 'nps', label: 'NPS' }],
  copd: [{ key: 'mmrc', label: 'mMRC' }],
  pn: [{ key: 'nrs', label: 'WI-NRS' }],
};

// ========== 投与量計算 ==========

function calcDose(indication, ageGroup, weight) {
  if (indication === 'ad') {
    if (ageGroup === 'adult') {
      return { loading: 600, loadingNote: '（300mg×2本を2箇所に注射）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '初回のみ600mg、以降300mg 2週間隔（体重によらず一律）' };
    }
    const w = parseFloat(weight);
    if (ageGroup === 'child_12_14') {
      if (w && w >= 60) return { loading: 600, loadingNote: '（300mg×2本）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '初回のみ600mg、以降300mg 2週間隔' };
      if (w && w >= 30) return { loading: 400, loadingNote: '（200mg×2本）', maintenance: 200, interval: 2, pen: '200mgペン', notes: '初回のみ400mg、以降200mg 2週間隔' };
    }
    if (ageGroup === 'child_6_11' || (ageGroup === 'child_12_14' && parseFloat(weight) < 30)) {
      const w2 = parseFloat(weight);
      if (w2 && w2 >= 60) return { loading: 600, loadingNote: '（300mg×2本）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '60kg以上: 成人と同量' };
      if (w2 && w2 >= 30) return { loading: 400, loadingNote: '（200mg×2本）', maintenance: 200, interval: 2, pen: '200mgペン', notes: '30-60kg: 初回400mg、以降200mg 2週間隔' };
      if (w2 && w2 >= 15) return { loading: 600, loadingNote: '（300mg×2本）', maintenance: 300, interval: 4, pen: '300mgペン', notes: '15-30kg: 初回600mg、以降300mg 4週間隔' };
      if (w2 && w2 >= 5) return { loading: 200, loadingNote: '（200mg×1本）', maintenance: 200, interval: 4, pen: '200mgペン', notes: '5-15kg: 初回200mg、以降200mg 4週間隔' };
      return { error: '5kg未満は投与対象外' };
    }
    if (ageGroup === 'child_6m_5') {
      const w3 = parseFloat(weight);
      if (w3 && w3 >= 15) return { loading: 300, loadingNote: '（300mg×1本）', maintenance: 300, interval: 4, pen: '300mgペン', notes: '15kg以上: 初回300mg、以降300mg 4週間隔' };
      if (w3 && w3 >= 5) return { loading: 200, loadingNote: '（200mg×1本）', maintenance: 200, interval: 4, pen: '200mgペン', notes: '5-15kg: 初回200mg、以降200mg 4週間隔' };
      return { error: '5kg未満は投与対象外' };
    }
  }

  if (indication === 'asthma') {
    if (ageGroup === 'adult' || ageGroup === 'child_12_14') {
      return { loading: 400, loadingNote: '（200mg×2本を2箇所に注射）', maintenance: 200, interval: 2, pen: '200mgペン', notes: '初回のみ400mg、以降200mg 2週間隔。経口ステロイド依存例や重症AD合併例では初回600mg→300mg q2wも考慮。' };
    }
    if (ageGroup === 'child_6_11') {
      const w = parseFloat(weight);
      if (w && w >= 30) return { loading: null, loadingNote: '', maintenance: 200, interval: 2, pen: '200mgペン', notes: '30kg以上: 200mg 2週間隔（負荷投与なし）。100mg q2wも可。' };
      if (w && w >= 15) return { loading: null, loadingNote: '', maintenance: 100, interval: 2, pen: '200mgペン（半量使用）', notes: '15-30kg: 100mg 2週間隔（負荷投与なし）。200mgペンの半量を使用。' };
      return { error: '15kg未満の小児喘息への適応なし' };
    }
    if (ageGroup === 'child_6m_5') return { error: '6歳未満の喘息には適応なし（6歳以上が対象）' };
  }

  if (indication === 'crsnp') {
    if (ageGroup === 'adult') return { loading: null, loadingNote: '', maintenance: 300, interval: 2, pen: '300mgペン', notes: '300mg 2週間隔（負荷投与なし）。既存の鼻噴霧用ステロイドは継続。' };
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  if (indication === 'copd') {
    if (ageGroup === 'adult') return { loading: null, loadingNote: '', maintenance: 300, interval: 2, pen: '300mgペン', notes: '300mg 2週間隔（負荷投与なし）。既存の吸入療法（LAMA/LABA/ICS）は継続。' };
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  if (indication === 'pn') {
    if (ageGroup === 'adult') return { loading: 600, loadingNote: '（300mg×2本を2箇所に注射）', maintenance: 300, interval: 2, pen: '300mgペン', notes: '初回のみ600mg、以降300mg 2週間隔' };
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  return null;
}

// ========== EASI/BSA ヘルパー ==========

function initEasiScores() {
  const s = {};
  EASI_REGIONS.forEach(r => { s[r.key] = { area: 0, erythema: 0, edema: 0, excoriation: 0, lichenification: 0 }; });
  return s;
}

function calcEasiTotal(scores) {
  return EASI_REGIONS.reduce((t, r) => {
    const s = scores[r.key];
    return t + s.area * (s.erythema + s.edema + s.excoriation + s.lichenification) * r.multiplier;
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
  const pf = (k) => selected[k] ? '#1976d2' : '#e8e8e8';
  const ps = (k) => selected[k] ? '#0d47a1' : '#9e9e9e';
  const ef = (k) => selected[k] ? '#90caf9' : '#f5f5f5';
  const es = (k) => selected[k] ? '#64b5f6' : '#bdbdbd';
  const cs = { cursor: 'pointer', transition: 'fill 0.15s' };
  const tf = (k) => selected[k] ? '#fff' : '#666';

  return (
    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--ifm-color-emphasis-600)' }}>前面</div>
        <svg viewBox="0 0 160 340" width="120" aria-label="体前面">
          <circle cx="80" cy="28" r="22" fill={pf('head')} stroke={ps('head')} strokeWidth="1.5" style={cs} onClick={() => onToggle('head')} />
          <text x="80" y="32" textAnchor="middle" fontSize="8" fill={tf('head')} pointerEvents="none">頭頸</text>
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
          <rect x="46" y="58" width="68" height="50" rx="4" fill={pf('chest')} stroke={ps('chest')} strokeWidth="1.5" style={cs} onClick={() => onToggle('chest')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={tf('chest')} pointerEvents="none">胸部</text>
          <rect x="48" y="110" width="64" height="50" rx="4" fill={pf('abdomen')} stroke={ps('abdomen')} strokeWidth="1.5" style={cs} onClick={() => onToggle('abdomen')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={tf('abdomen')} pointerEvents="none">腹部</text>
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
        <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--ifm-color-emphasis-600)' }}>背面</div>
        <svg viewBox="0 0 160 340" width="120" aria-label="体背面">
          <circle cx="80" cy="28" r="22" fill={ef('head')} stroke={es('head')} strokeWidth="1" style={cs} onClick={() => onToggle('head')} />
          <rect x="73" y="48" width="14" height="10" rx="3" fill="#eee" stroke="#ccc" strokeWidth="0.5" />
          <rect x="46" y="58" width="68" height="50" rx="4" fill={pf('upper_back')} stroke={ps('upper_back')} strokeWidth="1.5" style={cs} onClick={() => onToggle('upper_back')} />
          <text x="80" y="87" textAnchor="middle" fontSize="8" fill={tf('upper_back')} pointerEvents="none">背部上</text>
          <rect x="48" y="110" width="64" height="50" rx="4" fill={pf('lower_back')} stroke={ps('lower_back')} strokeWidth="1.5" style={cs} onClick={() => onToggle('lower_back')} />
          <text x="80" y="139" textAnchor="middle" fontSize="8" fill={tf('lower_back')} pointerEvents="none">腰臀部</text>
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

// ========== 汎用UI部品 ==========

function ScorePicker({ value, max, onChange, labels, min }) {
  const start = min || 0;
  return (
    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
      {Array.from({ length: max - start + 1 }, (_, i) => i + start).map(i => (
        <button key={i} onClick={() => onChange(i)} title={labels ? labels[i - start] : undefined}
          style={{
            width: '28px', height: '26px', fontSize: '0.75rem', fontWeight: 700,
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

function RadioList({ items, value, onChange }) {
  return items.map((item, idx) => (
    <div key={idx} onClick={() => onChange(item.value !== undefined ? item.value : idx)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 0.7rem', marginBottom: '3px',
        border: value === (item.value !== undefined ? item.value : idx)
          ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: '6px', cursor: 'pointer',
        background: value === (item.value !== undefined ? item.value : idx) ? 'var(--ifm-color-primary-lightest)' : 'transparent',
      }}>
      <span style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 700,
        background: value === (item.value !== undefined ? item.value : idx) ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
        color: value === (item.value !== undefined ? item.value : idx) ? '#fff' : 'var(--ifm-font-color-base)',
      }}>
        {item.value !== undefined ? item.value : idx}
      </span>
      <span style={{ fontSize: '0.8rem', flex: 1 }}>{item.label}</span>
    </div>
  ));
}

// ========== メインコンポーネント ==========

export default function DupixentCalculator() {
  // --- 投与量 ---
  const [indication, setIndication] = useState('ad');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [weight, setWeight] = useState('');
  const [showGuideline, setShowGuideline] = useState(false);

  // --- AD評価 ---
  const [assessTab, setAssessTab] = useState(null);
  const [igaScore, setIgaScore] = useState(null);
  const [easiScores, setEasiScores] = useState(initEasiScores);
  const [expandedEasiRegion, setExpandedEasiRegion] = useState('head');
  const [bsaSelected, setBsaSelected] = useState(() => {
    const init = {}; BSA_PARTS.forEach(p => { init[p.key] = false; }); return init;
  });

  // --- 喘息: ACT ---
  const [actAnswers, setActAnswers] = useState(Array(5).fill(null));

  // --- CRSwNP: NPS ---
  const [npsLeft, setNpsLeft] = useState(null);
  const [npsRight, setNpsRight] = useState(null);

  // --- COPD: mMRC ---
  const [mmrcScore, setMmrcScore] = useState(null);

  // --- PN: WI-NRS ---
  const [nrsScore, setNrsScore] = useState(null);

  // --- 投与量ロジック ---
  const needsWeight = useMemo(() => {
    if (['crsnp', 'pn', 'copd'].includes(indication)) return false;
    if (indication === 'ad') return ageGroup !== 'adult';
    if (indication === 'asthma') return ageGroup === 'child_6_11';
    return false;
  }, [indication, ageGroup]);

  const availableAgeGroups = useMemo(() => {
    if (['crsnp', 'pn', 'copd'].includes(indication)) return AGE_GROUPS.filter(a => a.key === 'adult');
    if (indication === 'asthma') return AGE_GROUPS.filter(a => a.key !== 'child_6m_5');
    return AGE_GROUPS;
  }, [indication]);

  const result = useMemo(() => {
    if (needsWeight && (!weight || parseFloat(weight) <= 0)) return null;
    return calcDose(indication, ageGroup, weight);
  }, [indication, ageGroup, weight, needsWeight]);

  // --- 計算値 ---
  const easiTotal = useMemo(() => calcEasiTotal(easiScores), [easiScores]);
  const easiSeverity = getEasiSeverity(easiTotal);
  const bsaTotal = useMemo(() => BSA_PARTS.reduce((s, p) => s + (bsaSelected[p.key] ? p.bsa : 0), 0), [bsaSelected]);
  const actScore = useMemo(() => actAnswers.some(a => a === null) ? null : actAnswers.reduce((s, a) => s + a, 0), [actAnswers]);
  const npsTotal = (npsLeft !== null && npsRight !== null) ? npsLeft + npsRight : null;

  // --- ハンドラ ---
  const handleIndicationChange = useCallback((key) => {
    setIndication(key);
    setWeight('');
    setAssessTab(null);
    setShowGuideline(false);
    if (['crsnp', 'pn', 'copd'].includes(key)) setAgeGroup('adult');
  }, []);

  const updateEasiScore = useCallback((rk, sk, v) => {
    setEasiScores(prev => ({ ...prev, [rk]: { ...prev[rk], [sk]: v } }));
  }, []);

  const toggleBsaPart = useCallback((k) => {
    setBsaSelected(prev => ({ ...prev, [k]: !prev[k] }));
  }, []);

  const resetAssess = useCallback(() => {
    setIgaScore(null); setEasiScores(initEasiScores());
    setBsaSelected(() => { const i = {}; BSA_PARTS.forEach(p => { i[p.key] = false; }); return i; });
    setActAnswers(Array(5).fill(null));
    setNpsLeft(null); setNpsRight(null);
    setMmrcScore(null); setNrsScore(null);
  }, []);

  const currentTabs = ASSESS_TABS[indication] || [];

  // ========== レンダリング ==========
  return (
    <div className={styles.calc} style={{ maxWidth: '560px' }}>
      {/* ヘッダー */}
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>デュピクセント（デュピルマブ）</p>
          <p className={styles.calcSub}>投与量計算 + 評価ツール（5適応対応）</p>
        </div>
        <button className={styles.resetBtn} onClick={() => setWeight('')}>リセット</button>
      </div>

      {/* 投与量セクション */}
      <div className={styles.calcBody}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>適応症</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {INDICATIONS.map(ind => (
              <button key={ind.key}
                className={`${styles.toggleBtn} ${indication === ind.key ? styles.toggleBtnActive : ''}`}
                onClick={() => handleIndicationChange(ind.key)}
                style={{ fontSize: '0.73rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}>
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>年齢区分</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {availableAgeGroups.map(ag => (
              <button key={ag.key}
                className={`${styles.toggleBtn} ${ageGroup === ag.key ? styles.toggleBtnActive : ''}`}
                onClick={() => { setAgeGroup(ag.key); setWeight(''); }}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}>
                {ag.label}
              </button>
            ))}
          </div>
        </div>

        {needsWeight && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>体重 <span className={styles.inputUnit}>(kg)</span></label>
            <div className={styles.inputRow}>
              <input type="number" className={styles.inputField} value={weight}
                onChange={e => setWeight(e.target.value)} placeholder="例: 25" min="3" max="200" step="0.1" />
              <span className={styles.unitText}>kg</span>
            </div>
          </div>
        )}
      </div>

      {/* 投与量結果 */}
      {result && !result.error && (
        <div className={styles.result}>
          {result.loading && (
            <>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>初回（負荷投与）</span>
                <span className={styles.resultValue}>{result.loading}mg</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>{result.loadingNote}</span>
              </div>
            </>
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
          <div className={styles.resultJudge} style={{ background: '#1565c0' }}>{result.notes}</div>
        </div>
      )}
      {result && result.error && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#c62828' }}>{result.error}</div>
        </div>
      )}
      {!result && needsWeight && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#757575' }}>体重を入力してください</div>
        </div>
      )}

      {/* 最適使用推進ガイドライン */}
      <div className={styles.note} style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setShowGuideline(v => !v)}>
        <strong>{showGuideline ? '▼' : '▶'} 最適使用推進ガイドライン — 主な処方要件</strong>
        {showGuideline && (
          <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
            {(GUIDELINE_REQ[indication] || []).map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ===== 評価ツール ===== */}
      <div style={{ borderTop: '2px solid var(--ifm-color-emphasis-300)', padding: '0.8rem 1.2rem 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>評価ツール</span>
          <button className={styles.resetBtn} onClick={resetAssess}
            style={{ border: '1px solid var(--ifm-color-emphasis-400)', color: 'var(--ifm-color-emphasis-600)' }}>
            評価リセット
          </button>
        </div>

        {/* タブ */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.8rem' }}>
          {currentTabs.map(tab => (
            <button key={tab.key} onClick={() => setAssessTab(assessTab === tab.key ? null : tab.key)}
              style={{
                flex: 1, padding: '0.4rem 0.3rem', fontSize: '0.8rem', fontWeight: 700,
                border: assessTab === tab.key ? '2px solid var(--ifm-color-primary)' : '2px solid var(--ifm-color-emphasis-300)',
                borderRadius: '6px',
                background: assessTab === tab.key ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                color: assessTab === tab.key ? '#fff' : 'var(--ifm-font-color-base)',
                cursor: 'pointer',
              }}>
              {tab.label}
              {tab.key === 'iga' && igaScore !== null && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({igaScore})</span>}
              {tab.key === 'easi' && easiTotal > 0 && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({easiTotal.toFixed(1)})</span>}
              {tab.key === 'bsa' && bsaTotal > 0 && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({bsaTotal}%)</span>}
              {tab.key === 'act' && actScore !== null && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({actScore})</span>}
              {tab.key === 'nps' && npsTotal !== null && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({npsTotal})</span>}
              {tab.key === 'mmrc' && mmrcScore !== null && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({mmrcScore})</span>}
              {tab.key === 'nrs' && nrsScore !== null && <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.85 }}>({nrsScore})</span>}
            </button>
          ))}
        </div>

        {/* === IGA === */}
        {assessTab === 'iga' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Investigator Global Assessment（0〜4）
            </div>
            <RadioList items={IGA_SCALE.map(s => ({ value: s.score, label: `${s.label} — ${s.desc}` }))} value={igaScore} onChange={setIgaScore} />
            {igaScore !== null && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.7rem', borderRadius: '6px', background: igaScore >= 3 ? '#fff3e0' : '#e8f5e9', fontSize: '0.8rem', fontWeight: 600 }}>
                IGA = {igaScore}{igaScore >= 3 && ' → ガイドライン基準（IGA≧3）を満たす'}{igaScore <= 1 && ' → 治療目標達成（IGA 0-1）'}
              </div>
            )}
          </div>
        )}

        {/* === EASI === */}
        {assessTab === 'easi' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Eczema Area and Severity Index（0〜72点）
            </div>
            {EASI_REGIONS.map(region => {
              const isExp = expandedEasiRegion === region.key;
              const r = easiScores[region.key];
              const rs = r.area * (r.erythema + r.edema + r.excoriation + r.lichenification) * region.multiplier;
              return (
                <div key={region.key} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '6px', marginBottom: '4px', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedEasiRegion(isExp ? null : region.key)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.7rem', cursor: 'pointer', background: isExp ? 'var(--ifm-color-emphasis-100)' : 'transparent' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {isExp ? '▼' : '▶'} {region.label} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--ifm-color-emphasis-500)' }}>(×{region.multiplier})</span>
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>{rs.toFixed(1)}</span>
                  </div>
                  {isExp && (
                    <div style={{ padding: '0.4rem 0.7rem 0.5rem' }}>
                      <div style={{ marginBottom: '0.4rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px', color: 'var(--ifm-color-emphasis-600)' }}>
                          面積 (0-6){r.area > 0 && <span style={{ fontWeight: 400, marginLeft: '6px' }}>= {AREA_LABELS[r.area]}</span>}
                        </div>
                        <ScorePicker value={r.area} max={6} onChange={v => updateEasiScore(region.key, 'area', v)} labels={AREA_LABELS} />
                      </div>
                      {EASI_SIGNS.map(sign => (
                        <div key={sign.key} style={{ marginBottom: '0.3rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '2px', color: 'var(--ifm-color-emphasis-600)' }}>{sign.label} (0-3)</div>
                          <ScorePicker value={r[sign.key]} max={3} onChange={v => updateEasiScore(region.key, sign.key, v)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.7rem', borderRadius: '6px', background: easiSeverity.color, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>EASI = {easiTotal.toFixed(1)} / 72</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{easiSeverity.label}</span>
            </div>
            {easiTotal >= 16 && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', fontWeight: 600, marginTop: '0.3rem' }}>
                EASI≧16 → ガイドライン基準を満たす
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.2rem' }}>
              {'軽症 <6 / 中等症 6-22 / 重症 23-50 / 最重症 >50'}
            </div>
          </div>
        )}

        {/* === BSA === */}
        {assessTab === 'bsa' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              体表面積（Rule of Nines）— 患部をクリックして選択
            </div>
            <BodyDiagram selected={bsaSelected} onToggle={toggleBsaPart} />
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button onClick={() => toggleBsaPart('perineum')}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, border: bsaSelected.perineum ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)', borderRadius: '4px', cursor: 'pointer', background: bsaSelected.perineum ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)', color: bsaSelected.perineum ? '#fff' : 'var(--ifm-font-color-base)' }}>
                会陰部 (1%)
              </button>
            </div>
            {BSA_PARTS.filter(p => bsaSelected[p.key]).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '0.6rem 0 0.4rem' }}>
                {BSA_PARTS.filter(p => bsaSelected[p.key]).map(p => (
                  <span key={p.key} style={{ fontSize: '0.72rem', padding: '2px 6px', background: '#e3f2fd', borderRadius: '3px', color: '#1565c0' }}>{p.label} {p.bsa}%</span>
                ))}
              </div>
            )}
            <div style={{ padding: '0.6rem 0.7rem', borderRadius: '6px', background: bsaTotal >= 10 ? '#f44336' : bsaTotal > 0 ? '#ff9800' : '#757575', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>BSA = {bsaTotal}%</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {bsaTotal === 0 && '部位を選択'}
                {bsaTotal > 0 && bsaTotal < 10 && '軽症（BSA 10%未満）'}
                {bsaTotal >= 10 && '中等症以上（BSA≧10%）'}
              </span>
            </div>
            {bsaTotal >= 10 && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', fontWeight: 600, marginTop: '0.3rem' }}>
                BSA≧10% → ガイドライン基準を満たす
              </div>
            )}
          </div>
        )}

        {/* === ACT（喘息） === */}
        {assessTab === 'act' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Asthma Control Test — 過去4週間の喘息コントロール（5〜25点）
            </div>
            {ACT_QUESTIONS.map((item, qi) => (
              <div key={qi} style={{ marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>
                  Q{qi + 1}. {item.q}
                </div>
                <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                  {item.opts.map((opt, oi) => {
                    const score = oi + 1;
                    const isSelected = actAnswers[qi] === score;
                    return (
                      <button key={oi} onClick={() => { const next = [...actAnswers]; next[qi] = isSelected ? null : score; setActAnswers(next); }}
                        style={{
                          padding: '0.25rem 0.4rem', fontSize: '0.68rem', fontWeight: isSelected ? 700 : 400,
                          border: isSelected ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
                          borderRadius: '4px', cursor: 'pointer',
                          background: isSelected ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
                          color: isSelected ? '#fff' : 'var(--ifm-font-color-base)',
                        }}>
                        {score}:{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {actScore !== null && (
              <div style={{
                padding: '0.6rem 0.7rem', borderRadius: '6px', color: '#fff',
                background: actScore <= 19 ? '#f44336' : actScore <= 24 ? '#ff9800' : '#4caf50',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>ACT = {actScore} / 25</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {actScore <= 19 && 'コントロール不十分'}
                  {actScore >= 20 && actScore <= 24 && '良好'}
                  {actScore === 25 && '完全コントロール'}
                </span>
              </div>
            )}
            {actScore !== null && actScore <= 19 && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', fontWeight: 600, marginTop: '0.3rem' }}>
                ACT≦19 → 治療のステップアップを検討
              </div>
            )}
          </div>
        )}

        {/* === NPS（CRSwNP） === */}
        {assessTab === 'nps' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Nasal Polyp Score — 両側鼻茸スコア（0〜8点）
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>右側（0-4）</div>
              <RadioList items={NPS_LABELS.map((l, i) => ({ value: i, label: l }))} value={npsRight} onChange={setNpsRight} />
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '3px' }}>左側（0-4）</div>
              <RadioList items={NPS_LABELS.map((l, i) => ({ value: i, label: l }))} value={npsLeft} onChange={setNpsLeft} />
            </div>
            {npsTotal !== null && (
              <div style={{
                padding: '0.6rem 0.7rem', borderRadius: '6px', color: '#fff',
                background: npsTotal >= 5 ? '#f44336' : npsTotal > 0 ? '#ff9800' : '#757575',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>NPS = {npsTotal} / 8</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {npsTotal >= 5 ? 'ガイドライン基準（NPS≧5）を満たす' : 'NPS 5未満'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* === mMRC（COPD） === */}
        {assessTab === 'mmrc' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              mMRC 息切れスケール（0〜4）
            </div>
            <RadioList items={MMRC_LABELS.map((l, i) => ({ value: i, label: l }))} value={mmrcScore} onChange={setMmrcScore} />
            {mmrcScore !== null && (
              <div style={{
                marginTop: '0.5rem', padding: '0.5rem 0.7rem', borderRadius: '6px',
                background: mmrcScore >= 2 ? '#fff3e0' : '#e8f5e9',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                mMRC = {mmrcScore}{mmrcScore >= 2 && ' → 症状が強い（GOLD B/E群を考慮）'}
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.4rem' }}>
              より詳細な評価は <a href="../respiratory/cat">CAT（COPD Assessment Test）</a> も参照
            </div>
          </div>
        )}

        {/* === WI-NRS（結節性痒疹） === */}
        {assessTab === 'nrs' && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
              Worst Itch NRS — 過去24時間の最も強い痒み（0〜10）
            </div>
            <div style={{ marginBottom: '0.3rem' }}>
              <ScorePicker value={nrsScore} max={10} onChange={setNrsScore} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginBottom: '0.5rem' }}>
              <span>0 = 痒みなし</span><span>10 = 想像しうる最悪の痒み</span>
            </div>
            {nrsScore !== null && (
              <div style={{
                padding: '0.6rem 0.7rem', borderRadius: '6px', color: '#fff',
                background: nrsScore >= 7 ? '#c62828' : nrsScore >= 4 ? '#f44336' : nrsScore >= 1 ? '#ff9800' : '#4caf50',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>WI-NRS = {nrsScore}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {nrsScore === 0 && '痒みなし'}
                  {nrsScore >= 1 && nrsScore <= 3 && '軽度'}
                  {nrsScore >= 4 && nrsScore <= 6 && '中等度'}
                  {nrsScore >= 7 && '重度'}
                </span>
              </div>
            )}
            {nrsScore !== null && nrsScore >= 7 && (
              <div style={{ fontSize: '0.75rem', color: '#e65100', fontWeight: 600, marginTop: '0.3rem' }}>
                WI-NRS≧7 → 重度の痒み。治療介入の強化を検討
              </div>
            )}
          </div>
        )}
      </div>

      {/* 注意事項 */}
      <div className={styles.note}>
        <strong>共通注意事項:</strong><br />
        ・自己注射指導を実施し、十分な教育訓練を行ってから在宅自己注射に移行<br />
        ・注射部位: 腹部・大腿部・上腕外側（毎回異なる部位に注射）<br />
        ・冷蔵保存（2-8℃）。使用前に室温に45分以上戻す<br />
        ・結膜炎（特にAD）の発現に注意（約10-20%）<br />
        ・投与開始後も既存の基礎治療（外用療法・吸入療法等）は継続<br />
        ・喘息/COPD: 経口ステロイドの急な中止は禁忌（漸減すること）
      </div>
    </div>
  );
}
