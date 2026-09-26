import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

/**
 * デュピクセント（デュピルマブ）統合ツール
 *
 * 1. 投与量計算（7適応 × 年齢 × 体重）
 * 2. 最適使用推進ガイドライン処方要件（AD・喘息・COPD・CRSwNP のみ。PN・CSU・BP は対象外）
 * 3. 適応別評価ツール（AD: IGA/EASI/BSA、喘息: ACT、CRSwNP: NPS、COPD: mMRC、PN: WI-NRS）
 *
 * 添付文書 2026年3月改訂（第14版）準拠
 * 最適使用推進ガイドライン: AD・喘息・COPD 令和7年12月改訂 / CRSwNP 令和8年2月改訂
 * 成人＝15歳以上として扱う（院内運用）
 */

// ========== 定数 ==========

const INDICATIONS = [
  { key: 'ad', label: 'アトピー性皮膚炎' },
  { key: 'asthma', label: '気管支喘息' },
  { key: 'crsnp', label: '鼻茸を伴う慢性副鼻腔炎' },
  { key: 'copd', label: 'COPD' },
  { key: 'pn', label: '結節性痒疹' },
  { key: 'csu', label: '特発性の慢性蕁麻疹' },
  { key: 'bp', label: '水疱性類天疱瘡（中等症から重症）' },
];

// 成人のみ用法・用量が設定されている適応
const ADULT_ONLY = ['crsnp', 'copd', 'pn', 'bp'];

const AGE_GROUPS = [
  { key: 'adult', label: '成人（15歳以上）', short: '成人' },
  { key: 'child_12_14', label: '12〜14歳', short: '12〜14歳' },
  { key: 'child_6_11', label: '6〜11歳', short: '6〜11歳' },
  { key: 'child_6m_5', label: '生後6カ月〜5歳', short: '生後6カ月〜5歳' },
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
// 最適使用推進ガイドライン（鼻茸を伴う慢性副鼻腔炎）5. 投与対象となる患者 の鼻茸スコア定義
const NPS_LABELS = [
  '0: ポリープなし',
  '1: 小さなポリープを中鼻道に認めるが、中鼻甲介下縁の下には達していない',
  '2: 中鼻甲介下縁の下に達しているポリープを認める',
  '3: 大きなポリープが下鼻甲介下縁に達している、又はポリープを中鼻甲介の内側に認める',
  '4: 下鼻腔の完全な閉塞を引き起こしている大きなポリープを認める',
];

// --- COPD: mMRC ---
const MMRC_LABELS = [
  '0: 激しい運動時のみ息切れ',
  '1: 平地を急ぎ足か緩い坂で息切れ',
  '2: 同年齢より平地歩行が遅い/息継ぎが必要',
  '3: 平地約100mで息継ぎが必要',
  '4: 息切れで外出困難/着替えで息切れ',
];

// --- 最適使用推進ガイドライン要件（5. 投与対象となる患者） ---
// 対象: AD・喘息・COPD・CRSwNP（添付文書 4. 注2）。結節性痒疹・特発性の慢性蕁麻疹・水疱性類天疱瘡は対象外
const GUIDELINE_REQ = {
  ad: [
    'アトピー性皮膚炎の確定診断（生後6カ月以上。小児は体重5kg以上）',
    '抗炎症外用薬による適切な治療を直近6カ月以上実施（ステロイド外用薬は成人ストロングクラス以上、小児ミディアムクラス以上）しても十分な効果が得られない、又は外用薬への過敏症・副作用で継続困難',
    '疾患活動性 — 以下のすべてに該当: IGA スコア 3以上 ／ EASI 16以上（又は顔面の広範囲に強い炎症を伴う皮疹: 目安として頭頸部 EASI 2.4以上、7歳以下は4.8以上） ／ 病変の体表面積（BSA）10%以上',
  ],
  asthma: [
    '吸入ステロイド薬とその他の長期管理薬のアドヒアランスや吸入手技が良好であることを確認した上で判断',
    '気管支喘息の確定診断',
    '成人: 中用量又は高用量の ICS とその他の長期管理薬（LABA・LAMA・LTRA・テオフィリン徐放製剤）を併用してもコントロール不良、かつ全身性ステロイド薬の投与等が必要な喘息増悪を年1回以上。ただし、中用量の ICS との併用は、医師により ICS を高用量に増量することが副作用等により困難であると判断された場合に限る',
    '小児: 中用量又は高用量の ICS とその他の長期管理薬（LABA・LTRA・テオフィリン徐放製剤）を併用してもコントロール不良、かつ全身性ステロイド薬の投与等が必要な喘息増悪を年1回以上。ただし、中用量の ICS を投与しており LABA を併用していない患児は、医師により LABA を併用することが副作用等により困難であると判断された場合に限る',
    '2型炎症バイオマーカー（血中好酸球数・FeNO・血清総IgE 等）: 適応判断のための基準値はない。1つ以上を測定し、その値と臨床成績を考慮して判断（参考: 6〜11歳の検証的試験の主要解析集団は血中好酸球数 150/μL以上又は FeNO 20ppb以上）',
  ],
  crsnp: [
    '慢性副鼻腔炎の確定診断',
    '鼻茸を伴う慢性副鼻腔炎の手術歴あり（全身状態等で手術不能の場合: 過去2年以内の全身性ステロイド薬で効果不十分、又は全身性ステロイド薬が禁忌、又は忍容性なし）',
    '既存治療下でも以下のすべて: 鼻茸スコア 各鼻腔2以上かつ両側合計5以上 ／ 鼻閉重症度スコア 2（中等症）以上が8週間以上持続 ／ 嗅覚障害、鼻汁（前鼻漏／後鼻漏）等が8週間以上持続',
  ],
  copd: [
    'COPD の確定診断',
    '気管支拡張薬投与後の FEV1 が予測値の30%超70%以下',
    'LAMA・LABA・ICS（ICS 禁忌の場合は LAMA・LABA）を3カ月以上併用',
    '中等度の増悪を年2回以上（うち1回は全身性ステロイド薬が必要）又は重度の増悪を年1回以上。うち少なくとも1回は上記併用中に発現',
    '血中好酸球数 300/μL以上',
    '禁煙・呼吸リハビリテーション等の非薬物療法の管理計画が作成され、適切に実施されている',
  ],
};

const GUIDELINE_URL = {
  ad: 'https://www.pmda.go.jp/files/000278275.pdf',
  asthma: 'https://www.pmda.go.jp/files/000278276.pdf',
  copd: 'https://www.pmda.go.jp/files/000278277.pdf',
  crsnp: 'https://www.pmda.go.jp/files/000279177.pdf',
};

// 最適使用推進ガイドライン対象外の適応: 添付文書「5. 効能又は効果に関連する注意」「7. 用法及び用量に関連する注意」の要点
const NON_GUIDELINE_NOTE = {
  pn: [
    '5.4: ステロイド外用剤等による治療を施行しても、痒疹結節を主体とする病変が多発し、複数の部位に及ぶ患者に用いる',
    '5.5: 最新の診療ガイドライン等を参考に、臨床症状及び全身検索に基づいて他の皮膚疾患との鑑別を行う',
  ],
  csu: [
    '5.6: 食物、物理的刺激等の蕁麻疹の症状を誘発する原因が特定されず、ヒスタミンH1受容体拮抗薬の増量等の適切な治療を行っても、日常生活に支障をきたすほどの痒みを伴う膨疹が繰り返して継続的に認められる場合に本剤を追加して投与する',
    '7.3: 24週以降も継続する場合は必要性を慎重に判断し、24週間使用しても効果が認められない場合は漫然と投与を続けない',
  ],
  bp: [
    '5.7: 最新の国内診療ガイドラインを参考に、全身性ステロイド薬の投与が必要な中等症から重症の水疱性類天疱瘡患者に対して本剤を投与する',
    '5.8: 本剤の適用に先立ち、患者の症状や状態に応じて、全身性ステロイド薬単独による治療の実施も考慮する。全身性ステロイド薬単独による治療を行わず本剤との併用で治療を開始する場合は、最新の国内診療ガイドライン等を参照の上で、本剤の投与の必要性を慎重に判断する',
    '7.4: 全身性ステロイド薬と併用で投与を開始し、病勢のコントロールが得られた後は全身性ステロイド薬の漸減を考慮する',
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

const PEN_300 = '300mgペン又はシリンジ';
const PEN_200 = '200mgペン又はシリンジ';
const NOTE_300_ONLY = '300mg製剤のみ（200mg製剤は本適応の効能なし）';
const NOTE_AD_16W = '16週までに治療反応が得られない場合は投与中止を考慮（7.1）。最適使用推進ガイドライン：16週後までに治療反応が得られない場合は投与を中止すること';

// 初回600mg → 300mg 2週間隔
function dose600(band, notes) {
  return { loading: 600, loadingNote: '（300mg製剤×2本。200mg製剤は用いない）', maintenance: 300, interval: 2, pen: PEN_300, band, notes };
}
// 初回400mg → 200mg 2週間隔
function dose400(band, notes) {
  return { loading: 400, loadingNote: '（200mg製剤×2本）', maintenance: 200, interval: 2, pen: PEN_200, band, notes };
}
// 負荷投与なし
function doseNoLoad(mg, interval, band, notes) {
  return { loading: null, loadingNote: '', maintenance: mg, interval, pen: mg === 300 ? PEN_300 : PEN_200, band, notes };
}

export function calcDose(indication, ageGroup, weight) {
  const w = parseFloat(weight);

  if (indication === 'ad') {
    if (ageGroup === 'adult') return dose600('', `初回600mg、以降300mg 2週間隔。${NOTE_AD_16W}`);
    // 小児（生後6カ月以上）は年齢によらず体重のみで区分
    if (w >= 60) return dose600('60kg以上', `60kg以上: 初回600mg、以降300mg 2週間隔。${NOTE_AD_16W}`);
    if (w >= 30) return dose400('30-60kg', `30kg以上60kg未満: 初回400mg、以降200mg 2週間隔。${NOTE_AD_16W}`);
    if (w >= 15) return doseNoLoad(300, 4, '15-30kg', `15kg以上30kg未満: 負荷投与なし、300mg 4週間隔。${NOTE_AD_16W}`);
    if (w >= 5) return doseNoLoad(200, 4, '5-15kg', `5kg以上15kg未満: 負荷投与なし、200mg 4週間隔。${NOTE_AD_16W}`);
    return { error: '体重5kg未満: 用法・用量の設定なし（生後6カ月未満も設定なし）' };
  }

  if (indication === 'csu') {
    const csuNote = '24週以降の継続は必要性を慎重に判断し、24週で効果がなければ漫然と継続しない（7.3）';
    if (ageGroup === 'adult') return dose600('', `初回600mg、以降300mg 2週間隔。${csuNote}`);
    if (ageGroup === 'child_12_14') {
      if (w >= 60) return dose600('60kg以上', `12歳以上・60kg以上: 初回600mg、以降300mg 2週間隔。${csuNote}`);
      if (w >= 30) return dose400('30-60kg', `12歳以上・30kg以上60kg未満: 初回400mg、以降200mg 2週間隔。${csuNote}`);
      return { error: '12歳以上でも体重30kg未満: 用法・用量の設定なし' };
    }
    return { error: '12歳未満: 用法・用量の設定なし' };
  }

  if (indication === 'asthma') {
    if (ageGroup === 'adult' || ageGroup === 'child_12_14') {
      return dose600('', '成人及び12歳以上: 初回600mg、以降300mg 2週間隔');
    }
    if (ageGroup === 'child_6_11') {
      if (w >= 30) return doseNoLoad(200, 2, '30kg以上', '6〜11歳・30kg以上: 負荷投与なし、200mg 2週間隔');
      if (w >= 15) return doseNoLoad(300, 4, '15-30kg', '6〜11歳・15kg以上30kg未満: 負荷投与なし、300mg 4週間隔');
      return { error: '6〜11歳で体重15kg未満: 用法・用量の設定なし' };
    }
    return { error: '6歳未満: 用法・用量の設定なし' };
  }

  const adultOnlyError = { error: '成人のみ（小児の用法・用量の設定なし）' };

  if (indication === 'pn') {
    if (ageGroup === 'adult') return dose600('', `初回600mg、以降300mg 2週間隔。${NOTE_300_ONLY}`);
    return adultOnlyError;
  }

  if (indication === 'bp') {
    if (ageGroup === 'adult') return dose600('', `初回600mg、以降300mg 2週間隔。全身性ステロイド薬と併用で開始し、病勢コントロール後はステロイドの漸減を考慮（7.4）。${NOTE_300_ONLY}`);
    return adultOnlyError;
  }

  if (indication === 'copd') {
    if (ageGroup === 'adult') return doseNoLoad(300, 2, '', `負荷投与なし、300mg 2週間隔。${NOTE_300_ONLY}`);
    return adultOnlyError;
  }

  if (indication === 'crsnp') {
    if (ageGroup === 'adult') return doseNoLoad(300, 2, '', `負荷投与なし、300mg 2週間隔。症状安定後は300mg 4週間隔も可。${NOTE_300_ONLY}`);
    return adultOnlyError;
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
    if (ADULT_ONLY.includes(indication)) return false;
    if (indication === 'ad') return ageGroup !== 'adult';
    if (indication === 'csu') return ageGroup === 'child_12_14';
    if (indication === 'asthma') return ageGroup === 'child_6_11';
    return false;
  }, [indication, ageGroup]);

  const availableAgeGroups = useMemo(() => {
    if (ADULT_ONLY.includes(indication)) return AGE_GROUPS.filter(a => a.key === 'adult');
    return AGE_GROUPS;
  }, [indication]);

  const result = useMemo(() => {
    if (needsWeight && (!weight || parseFloat(weight) <= 0)) return null;
    return calcDose(indication, ageGroup, weight);
  }, [indication, ageGroup, weight, needsWeight]);

  // --- カルテ貼付用テキスト（投与量結果のみ。未入力・対象外のときは空） ---
  const indicationLabel = INDICATIONS.find(i => i.key === indication)?.label || '';
  const ageGroupLabel = AGE_GROUPS.find(a => a.key === ageGroup)?.label || '';
  const ageGroupShort = AGE_GROUPS.find(a => a.key === ageGroup)?.short || '';
  const outputText = useMemo(() => {
    if (!result || result.error) return '';
    const lines = [];
    lines.push('【デュピクセント（デュピルマブ）投与量 __DATE__】');
    lines.push('');
    lines.push(`適応症: ${indicationLabel}`);
    lines.push(`年齢区分: ${ageGroupLabel}`);
    if (needsWeight) lines.push(`体重: ${weight} kg`);
    lines.push('');
    lines.push(`初回（負荷投与）: ${result.loading ? `${result.loading}mg${result.loadingNote}` : 'なし'}`);
    lines.push(`維持投与: ${result.maintenance}mg`);
    lines.push(`投与間隔: ${result.interval}週間隔`);
    lines.push(`使用製剤: ${result.pen}`);
    lines.push(`備考: ${result.notes}`);
    return lines.join('\n');
  }, [result, indicationLabel, ageGroupLabel, needsWeight, weight]);
  const summary = outputText
    ? `デュピクセント ${result.loading ? `初回${result.loading}mg、以降` : ''}${result.maintenance}mg ${result.interval}週間隔（${indicationLabel}・${ageGroupShort}${result.band ? ` ${result.band}` : ''}）`
    : '';

  // --- 計算値 ---
  const easiTotal = useMemo(() => calcEasiTotal(easiScores), [easiScores]);
  const easiSeverity = getEasiSeverity(easiTotal);
  const bsaTotal = useMemo(() => BSA_PARTS.reduce((s, p) => s + (bsaSelected[p.key] ? p.bsa : 0), 0), [bsaSelected]);
  const actScore = useMemo(() => actAnswers.some(a => a === null) ? null : actAnswers.reduce((s, a) => s + a, 0), [actAnswers]);
  const npsTotal = (npsLeft !== null && npsRight !== null) ? npsLeft + npsRight : null;
  const npsMeetsGl = npsTotal !== null && npsLeft >= 2 && npsRight >= 2 && npsTotal >= 5;

  // --- ハンドラ ---
  const handleIndicationChange = useCallback((key) => {
    setIndication(key);
    setWeight('');
    setAssessTab(null);
    setShowGuideline(false);
    if (ADULT_ONLY.includes(key)) setAgeGroup('adult');
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
          <p className={styles.calcSub}>投与量計算 + 評価ツール（7適応対応・添付文書 2026年3月改訂 第14版）</p>
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

      <PsychCopyBox text={outputText} summary={summary} dateLabel="処方日" />

      {/* 最適使用推進ガイドライン */}
      {GUIDELINE_REQ[indication] ? (
        <div className={styles.note}>
          <div style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowGuideline(v => !v)}>
            <strong>{showGuideline ? '▼' : '▶'} 最適使用推進ガイドライン — 投与対象となる患者（要点）</strong>
          </div>
          {showGuideline && (
            <>
              <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                {GUIDELINE_REQ[indication].map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
              <div style={{ marginTop: '0.3rem' }}>
                詳細は<a href={GUIDELINE_URL[indication]} target="_blank" rel="noopener noreferrer">最適使用推進ガイドライン（PMDA）</a>参照
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.note}>
          <strong>最適使用推進ガイドライン対象外の適応</strong>
          {(NON_GUIDELINE_NOTE[indication] || []).map((line, i) => (
            <React.Fragment key={i}><br />添付文書 {line}</React.Fragment>
          ))}
        </div>
      )}

      {/* ===== 評価ツール ===== */}
      {currentTabs.length > 0 && (
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
                IGA = {igaScore}{igaScore >= 3 && ' → ガイドライン要件の1項目（IGA≧3）を満たす（EASI・BSA の基準もすべて必要）'}{igaScore <= 1 && ' → 治療目標達成（IGA 0-1）'}
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
                EASI≧16 → ガイドライン要件の1項目を満たす（IGA・BSA の基準もすべて必要）
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
                BSA≧10% → ガイドライン要件の1項目を満たす（IGA・EASI の基準もすべて必要）
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
                background: npsMeetsGl ? '#f44336' : npsTotal > 0 ? '#ff9800' : '#757575',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>NPS = {npsTotal} / 8</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {npsMeetsGl ? 'ガイドライン基準（各側2以上かつ合計5以上）を満たす' : 'ガイドライン基準（各側2以上かつ合計5以上）未達'}
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
      )}

      {/* 注意事項 */}
      <div className={styles.note}>
        <strong>共通注意事項（添付文書 2026年3月改訂 第14版）:</strong><br />
        ・投与開始にあたっては、医療施設において、必ず医師によるか、医師の直接の監督のもとで投与を行う（8.7）<br />
        ・自己注射指導を実施し、十分な教育訓練を行ってから在宅自己注射に移行<br />
        ・600mg投与時は300mg製剤2本を用い、200mg製剤は用いない（7.2）<br />
        ・1回で全量を使用する製剤であり、再使用しない（分割使用不可）（14.2.5）<br />
        ・皮膚及び皮下組織の薄い患者にはシリンジ製剤を用いる（14.2.3）<br />
        ・200mg製剤の効能はアトピー性皮膚炎・特発性の慢性蕁麻疹・気管支喘息のみ<br />
        ・注射部位: 腹部（へその周り5cmを外す）・大腿部・上腕部。同一箇所への繰り返し注射は避ける（14.2.1）<br />
        ・冷蔵保存（2〜8℃、凍結を避ける）。投与前に室温に戻しておくことが望ましい（300mg製剤45分以上／200mg製剤30分以上）（14.1.1）<br />
        ・結膜炎・アレルギー性結膜炎・角膜炎等の眼障害に注意（11.2）<br />
        ・投与開始後も既存の基礎治療（外用療法・吸入療法等）は継続（水疱性類天疱瘡の全身性ステロイドは7.4に従い漸減を考慮）<br />
        ・長期ステロイド療法中の患者では、本剤投与開始後にステロイド薬を急に中止しない。減量は医師の管理下で徐々に行う（8.3 重要な基本的注意、全適応共通）
      </div>
    </div>
  );
}
