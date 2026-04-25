/**
 * 慢性疾患管理ブースター — リスクスコア層別 (v0.1: 5疾患)
 *
 * 患者ヘッダーで一度入力した情報は再入力させない。
 * - 年齢: patientHeader.age (range)
 * - 性別: patientHeader.sex
 * - 喫煙: patientHeader.smoking ('current' | 'past' | 'never')
 * - SBP range: STEP 0.5 で疾患HT 1回入力 (DLP久山町からも参照)
 * - 主要併存: patientHeader.flags (cm_dm/cm_ht/cm_fh/cm_ascvd/cm_ckd)
 */

// 共通カットオフ ranges (UIで再利用)
const SBP_RANGES = [
  { value: '<120',     label: '<120 (至適)' },
  { value: '120-129',  label: '120-129 (正常)' },
  { value: '130-139',  label: '130-139 (正常高値)' },
  { value: '140-159',  label: '140-159 (I度HT)' },
  { value: '160-179',  label: '160-179 (II度HT)' },
  { value: '180+',     label: '≥180 (III度HT)' },
];

const LDL_RANGES = [
  { value: '<70',     label: '<70' },
  { value: '70-99',   label: '70-99' },
  { value: '100-119', label: '100-119' },
  { value: '120-139', label: '120-139' },
  { value: '140-159', label: '140-159' },
  { value: '160-179', label: '160-179' },
  { value: '180+',    label: '≥180' },
];
const HDL_RANGES = [
  { value: '<40',  label: '<40 (低HDL)' },
  { value: '40-59',label: '40-59' },
  { value: '60+',  label: '≥60' },
];
const BMI_RANGES = [
  { value: '<18.5',   label: '<18.5' },
  { value: '18.5-22', label: '18.5-22' },
  { value: '23-24',   label: '23-24' },
  { value: '25-29',   label: '25-29' },
  { value: '30-34',   label: '30-34' },
  { value: '35+',     label: '≥35' },
];
const EGFR_RANGES = [
  { value: '90+',   label: '≥90 (G1)' },
  { value: '60-89', label: '60-89 (G2)' },
  { value: '45-59', label: '45-59 (G3a)' },
  { value: '30-44', label: '30-44 (G3b)' },
  { value: '15-29', label: '15-29 (G4)' },
  { value: '<15',   label: '<15 (G5)' },
];
const UACR_RANGES = [
  { value: '<30',   label: '<30 (A1)' },
  { value: '30-300',label: '30-300 (A2)' },
  { value: '300+',  label: '≥300 (A3)' },
];
const MMRC_OPTIONS = [
  { value: '0', label: '0 (激しい運動でのみ息切れ)' },
  { value: '1', label: '1 (急ぎ歩きや坂で息切れ)' },
  { value: '2', label: '2 (同年代より歩くのが遅い)' },
  { value: '3', label: '3 (100m歩いて息切れ)' },
  { value: '4', label: '4 (服を着替えるだけで息切れ)' },
];
const CAT_RANGES = [
  { value: '<10',   label: '<10' },
  { value: '10-20', label: '10-20' },
  { value: '21-30', label: '21-30' },
  { value: '31+',   label: '≥31' },
];
const EXAC_RANGES = [
  { value: '0',  label: '0回' },
  { value: '1',  label: '1回' },
  { value: '2+', label: '2回以上' },
];

// =====================================================
// 1. 久山町スコア (DLP) — 患者ヘッダーから age/sex/smoking 自動継承
// =====================================================
// 入力フォームは SBP/LDL/HDL/BMI/耐糖能 のみ (5項目)
export const HISAYAMA_INPUTS = [
  { id: 'sbp',     label: '収縮期血圧',  type: 'select', options: SBP_RANGES },
  { id: 'ldl',     label: 'LDL-C',       type: 'select', options: LDL_RANGES },
  { id: 'hdl',     label: 'HDL-C',       type: 'select', options: HDL_RANGES },
  { id: 'glucose', label: '耐糖能異常 (FPG≥110 or HbA1c≥6.0)', type: 'select', options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }] },
  { id: 'bmi',     label: 'BMI',         type: 'select', options: BMI_RANGES },
];

// patientHeader を第2引数で受け取り、age/sex/smoking を継承
export function calcHisayama(input, ph = {}) {
  const ageMap = { '<40': 0, '40-49': 1, '50-59': 2, '60-64': 3, '65-69': 3, '70-74': 4, '75-79': 4, '80-89': 4, '90+': 4 };
  const sbpMap = { '<120': 0, '120-129': 0, '130-139': 1, '140-159': 2, '160-179': 3, '180+': 3 };
  const ldlMap = { '<70': 0, '70-99': 0, '100-119': 0, '120-139': 1, '140-159': 2, '160-179': 2, '180+': 3 };
  const hdlMap = { '<40': 1, '40-59': 0, '60+': 0 };
  const bmiMap = { '<18.5': 0, '18.5-22': 0, '23-24': 0, '25-29': 0, '30-34': 1, '35+': 1 };

  let points = 0;
  points += ageMap[ph.age] ?? 0;
  if (ph.sex === 'M') points += 1;
  points += sbpMap[input.sbp] ?? 0;
  points += ldlMap[input.ldl] ?? 0;
  points += hdlMap[input.hdl] ?? 0;
  if (ph.smoking === 'current') points += 2;
  if (input.glucose === 'yes') points += 2;
  points += bmiMap[input.bmi] ?? 0;

  let tier, ldlTarget, label;
  if (points <= 2)      { tier = 'low';       ldlTarget = 160; label = '一次予防 低リスク (10y CHD < 2%)'; }
  else if (points <= 4) { tier = 'medium';    ldlTarget = 140; label = '一次予防 中リスク (2-9%)'; }
  else if (points <= 6) { tier = 'high';      ldlTarget = 120; label = '一次予防 高リスク (≥10%)'; }
  else                  { tier = 'very_high'; ldlTarget = 100; label = '一次予防 非常に高リスク'; }

  if (ph.cm_ascvd) {
    tier = 'very_high'; ldlTarget = 70; label = '二次予防 (ASCVD既往) → LDL <70';
  }
  return { tier, ldlTarget, label, points };
}

// =====================================================
// 2. JSH2025 リスク層別 (HT) — 危険因子は patientHeader 自動算出
// =====================================================
export const JSH2025_INPUTS = [
  { id: 'bp_grade', label: '血圧グレード', type: 'select', options: [
    { value: 'normal_high', label: '正常高値 (130-139/80-89)' },
    { value: 'grade1',      label: 'I度 (140-159/90-99)' },
    { value: 'grade2',      label: 'II度 (160-179/100-109)' },
    { value: 'grade3',      label: 'III度 (≥180/≥110)' },
  ]},
  { id: 'organ_damage', label: '臓器障害 / CKD G3a/G3b', type: 'select', options: [
    { value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' },
  ]},
];

export function calcJsh2025(input, ph = {}) {
  const grade = input.bp_grade;
  const od = input.organ_damage === 'yes';
  // 危険因子数を patient header から自動算出
  let rfCount = 0;
  if (ph.cm_dm) rfCount++;
  if (ph.cm_dlp) rfCount++;
  if (ph.smoking === 'current') rfCount++;
  if (['65-69','70-74','75-79','80-89','90+'].includes(ph.age) && ph.sex === 'M') rfCount++;
  if (['75-79','80-89','90+'].includes(ph.age) && ph.sex === 'F') rfCount++;
  // CV既往
  const cv = !!ph.cm_ascvd || !!ph.cm_ckd_g45;

  let tier, label;
  if (cv) { tier = 'very_high'; label = '高リスク (CV既往あり)'; }
  else if (od) { tier = 'high'; label = '高リスク (臓器障害/CKD)'; }
  else if (grade === 'grade3') { tier = 'high'; label = '高リスク (III度HT)'; }
  else if (grade === 'grade2' && rfCount >= 3) { tier = 'high'; label = '高リスク'; }
  else if (grade === 'grade2' || rfCount >= 3) { tier = 'medium'; label = '中リスク'; }
  else if (grade === 'grade1' && rfCount === 0) { tier = 'low'; label = '低リスク'; }
  else { tier = 'medium'; label = '中リスク'; }

  return { tier, label, rfCount };
}

// =====================================================
// 3. KDIGO Heat Map (CKD)
// =====================================================
export const KDIGO_INPUTS = [
  { id: 'egfr', label: 'eGFR', type: 'select', options: EGFR_RANGES },
  { id: 'uacr', label: 'UACR (尿アルブミン/Cr比)', type: 'select', options: UACR_RANGES },
];

export function calcKdigo(input) {
  const egfrMap = { '90+': 'G1', '60-89': 'G2', '45-59': 'G3a', '30-44': 'G3b', '15-29': 'G4', '<15': 'G5' };
  const uacrMap = { '<30': 'A1', '30-300': 'A2', '300+': 'A3' };
  const gStage = egfrMap[input.egfr] || '';
  const aStage = uacrMap[input.uacr] || '';
  const heatMap = {
    G1:  { A1: 'green', A2: 'yellow', A3: 'orange' },
    G2:  { A1: 'green', A2: 'yellow', A3: 'orange' },
    G3a: { A1: 'yellow', A2: 'orange', A3: 'red' },
    G3b: { A1: 'orange', A2: 'red',    A3: 'red' },
    G4:  { A1: 'red',    A2: 'red',    A3: 'red' },
    G5:  { A1: 'red',    A2: 'red',    A3: 'red' },
  };
  const risk = heatMap[gStage]?.[aStage] || 'green';
  return { gStage, aStage, risk, label: `CKD ${gStage}${aStage} (リスク: ${risk})` };
}

// =====================================================
// 4. CHA₂DS₂-VASc + HAS-BLED (AF) — 患者ヘッダーから一部継承
// =====================================================
// patientHeader.age が ≥75 なら age_75 自動 true、65-74 なら age_65_74 自動 true
// patientHeader.sex === 'F' で sex_f 自動 true
// patientHeader.cm_ht/cm_dm/cm_ascvd/cm_chf 自動継承
export const CHADS_VASC_INPUTS = [
  { id: 'stroke',    label: '脳卒中/TIA既往 (2点)', type: 'checkbox' },
  { id: 'vasc',      label: '血管病 (MI/PAD/大動脈プラーク)', type: 'checkbox' },
];
export const HAS_BLED_INPUTS = [
  { id: 'ht_uncontrol', label: 'コントロール不良HT (SBP>160)', type: 'checkbox' },
  { id: 'renal',        label: '腎機能異常 (Cr>2.26 or 透析)', type: 'checkbox' },
  { id: 'liver',        label: '肝機能異常', type: 'checkbox' },
  { id: 'bleed_hx',     label: '出血既往/出血傾向', type: 'checkbox' },
  { id: 'inr_labile',   label: 'PT-INR不安定 (warfarin)', type: 'checkbox' },
  { id: 'drugs',        label: '抗血小板薬/NSAID併用', type: 'checkbox' },
  { id: 'alcohol',      label: 'アルコール過飲', type: 'checkbox' },
];

export function calcChadsVasc(input, ph = {}) {
  let s = 0;
  if (ph.cm_chf) s += 1;
  if (ph.cm_ht) s += 1;
  if (['75-79','80-89','90+'].includes(ph.age)) s += 2;
  if (ph.cm_dm) s += 1;
  if (input.stroke) s += 2;
  if (input.vasc || ph.cm_ascvd) s += 1;
  if (['65-69','70-74'].includes(ph.age)) s += 1;
  if (ph.sex === 'F') s += 1;

  const isFemale = ph.sex === 'F';
  const realScore = isFemale ? s : s; // total score
  let anticoag;
  if (isFemale) anticoag = realScore >= 3 ? 'recommend' : (realScore === 2 ? 'consider' : 'no');
  else          anticoag = realScore >= 2 ? 'recommend' : (realScore === 1 ? 'consider' : 'no');

  return { score: realScore, anticoag, label: `CHA₂DS₂-VASc = ${realScore}点 → 抗凝固${anticoag === 'recommend' ? '推奨' : anticoag === 'consider' ? '考慮' : '不要'}` };
}

export function calcHasBled(input, ph = {}) {
  let s = 0;
  for (const k of ['ht_uncontrol', 'renal', 'liver', 'bleed_hx', 'inr_labile', 'drugs', 'alcohol']) {
    if (input[k]) s += 1;
  }
  // 脳卒中既往は CHADS-VASc 入力から継承
  if (input.stroke) s += 1;
  // 年齢
  if (['65-69','70-74','75-79','80-89','90+'].includes(ph.age)) s += 1;
  const tier = s >= 3 ? 'high' : (s >= 2 ? 'moderate' : 'low');
  return { score: s, tier, label: `HAS-BLED = ${s}点 (${tier === 'high' ? '高出血リスク' : tier === 'moderate' ? '中等度' : '低リスク'})` };
}

// =====================================================
// 5. GOLD ABE分類 (COPD)
// =====================================================
export const GOLD_ABE_INPUTS = [
  { id: 'mmrc',      label: 'mMRC',       type: 'select', options: MMRC_OPTIONS },
  { id: 'cat',       label: 'CAT',        type: 'select', options: CAT_RANGES },
  { id: 'exac_year', label: '過去1年の増悪回数',   type: 'select', options: EXAC_RANGES },
  { id: 'hosp_year', label: '増悪入院回数 (1回でも =E相当)', type: 'select', options: [
    { value: '0', label: '0回' }, { value: '1+', label: '1回以上' },
  ]},
];

export function calcGoldAbe(input) {
  const mmrc = parseInt(input.mmrc, 10);
  const exacHi = input.exac_year === '2+' || input.hosp_year === '1+';
  if (exacHi) return { group: 'E', label: 'Group E (頻回増悪、ICS/Triple考慮 + eos≥300/ACO検討)' };
  const symptomatic = (mmrc >= 2) || (input.cat === '10-20' || input.cat === '21-30' || input.cat === '31+');
  if (symptomatic) return { group: 'B', label: 'Group B (症状あり・増悪少、LAMA/LABA合剤推奨)' };
  return { group: 'A', label: 'Group A (軽症、LAMA単剤)' };
}

// =====================================================
// スコア定義レジストリ
// =====================================================
export const SCORE_DEFINITIONS = {
  hisayama: {
    name: '久山町スコア',
    discipline: 'DLP / 一次予防 リスク評価',
    inputs: HISAYAMA_INPUTS,
    calc: calcHisayama,
    usePatientHeader: true,
  },
  jsh2025_risk: {
    name: 'JSH2025 リスク層別',
    discipline: 'HT / 治療開始閾値',
    inputs: JSH2025_INPUTS,
    calc: calcJsh2025,
    usePatientHeader: true,
  },
  kdigo_heatmap: {
    name: 'KDIGO Heat Map',
    discipline: 'CKD / Gステージ × 蛋白尿',
    inputs: KDIGO_INPUTS,
    calc: calcKdigo,
    usePatientHeader: false,
  },
  cha2ds2vasc_hasbled: {
    name: 'CHA₂DS₂-VASc + HAS-BLED',
    discipline: 'AF / 抗凝固判断 + 出血リスク',
    inputs: [...CHADS_VASC_INPUTS, ...HAS_BLED_INPUTS.map(i => ({ ...i, group: 'hasbled' }))],
    calc: (input, ph) => ({
      chadsvasc: calcChadsVasc(input, ph),
      hasbled:   calcHasBled(input, ph),
    }),
    usePatientHeader: true,
  },
  gold_abe: {
    name: 'GOLD ABE分類',
    discipline: 'COPD / グループ分類',
    inputs: GOLD_ABE_INPUTS,
    calc: calcGoldAbe,
    usePatientHeader: false,
  },
};
