/**
 * Overview Booster — リスクスコア層別 (v0.1: 5疾患)
 *
 * 全入力を select (range chip) に統一。1単位刻みで層別が変わるスコアは存在しないため、
 * GL カットオフ値ベースの range 選択で完全カバーできる。
 */

// 共通カットオフ ranges
const AGE_RANGES = [
  { value: '<40',    label: '<40歳' },
  { value: '40-49',  label: '40-49歳' },
  { value: '50-59',  label: '50-59歳' },
  { value: '60-64',  label: '60-64歳' },
  { value: '65-69',  label: '65-69歳' },
  { value: '70-74',  label: '70-74歳' },
  { value: '75-79',  label: '75-79歳' },
  { value: '80-89',  label: '80-89歳' },
  { value: '90+',    label: '≥90歳' },
];

const SBP_RANGES = [
  { value: '<120',     label: '<120 (至適)' },
  { value: '120-129',  label: '120-129 (正常)' },
  { value: '130-139',  label: '130-139 (正常高値)' },
  { value: '140-159',  label: '140-159 (I度HT)' },
  { value: '160-179',  label: '160-179 (II度HT)' },
  { value: '180+',     label: '≥180 (III度HT)' },
];

const LDL_RANGES = [
  { value: '<70',     label: '<70 (二次予防超高リスク達成)' },
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
  { value: '<18.5',   label: '<18.5 (低体重)' },
  { value: '18.5-22', label: '18.5-22' },
  { value: '23-24',   label: '23-24' },
  { value: '25-29',   label: '25-29 (肥満1度)' },
  { value: '30-34',   label: '30-34 (肥満2度)' },
  { value: '35+',     label: '≥35 (肥満3-4度)' },
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
  { value: '<30',   label: '<30 (A1 正常)' },
  { value: '30-300',label: '30-300 (A2 微量〜中等度)' },
  { value: '300+',  label: '≥300 (A3 高度)' },
];

const MMRC_OPTIONS = [
  { value: '0', label: '0 (激しい運動でのみ息切れ)' },
  { value: '1', label: '1 (急ぎ歩きや坂で息切れ)' },
  { value: '2', label: '2 (同年代より歩くのが遅い)' },
  { value: '3', label: '3 (100m歩いて息切れ)' },
  { value: '4', label: '4 (服を着替えるだけで息切れ)' },
];

const CAT_RANGES = [
  { value: '<10',   label: '<10 (軽症)' },
  { value: '10-20', label: '10-20 (中等症)' },
  { value: '21-30', label: '21-30 (重症)' },
  { value: '31+',   label: '≥31 (極重症)' },
];

const EXAC_RANGES = [
  { value: '0',   label: '0回' },
  { value: '1',   label: '1回' },
  { value: '2+',  label: '2回以上' },
];

// =====================================================
// 1. 久山町スコア (DLP) — JAS2022 一次予防
// =====================================================
export const HISAYAMA_INPUTS = [
  { id: 'age',     label: '年齢',           type: 'select', options: AGE_RANGES },
  { id: 'sex',     label: '性別',           type: 'select', options: [{ value: 'M', label: '男性' }, { value: 'F', label: '女性' }] },
  { id: 'sbp',     label: '収縮期血圧',     type: 'select', options: SBP_RANGES },
  { id: 'ldl',     label: 'LDL-C',          type: 'select', options: LDL_RANGES },
  { id: 'hdl',     label: 'HDL-C',          type: 'select', options: HDL_RANGES },
  { id: 'smoking', label: '喫煙',           type: 'select', options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }] },
  { id: 'glucose', label: '耐糖能異常 (FPG≥110 or HbA1c≥6.0)', type: 'select', options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }] },
  { id: 'bmi',     label: 'BMI',            type: 'select', options: BMI_RANGES },
];

export function calcHisayama(input) {
  const ageMap = { '<40': 0, '40-49': 1, '50-59': 2, '60-64': 3, '65-69': 3, '70-74': 4, '75-79': 4, '80-89': 4, '90+': 4 };
  const sbpMap = { '<120': 0, '120-129': 0, '130-139': 1, '140-159': 2, '160-179': 3, '180+': 3 };
  const ldlMap = { '<70': 0, '70-99': 0, '100-119': 0, '120-139': 1, '140-159': 2, '160-179': 2, '180+': 3 };
  const hdlMap = { '<40': 1, '40-59': 0, '60+': 0 };
  const bmiMap = { '<18.5': 0, '18.5-22': 0, '23-24': 0, '25-29': 0, '30-34': 1, '35+': 1 };

  let points = 0;
  points += ageMap[input.age] ?? 0;
  if (input.sex === 'M') points += 1;
  points += sbpMap[input.sbp] ?? 0;
  points += ldlMap[input.ldl] ?? 0;
  points += hdlMap[input.hdl] ?? 0;
  if (input.smoking === 'yes') points += 2;
  if (input.glucose === 'yes') points += 2;
  points += bmiMap[input.bmi] ?? 0;

  let tier, ldlTarget, label;
  if (points <= 2)      { tier = 'low';       ldlTarget = 160; label = '一次予防 低リスク (10y CHD < 2%)'; }
  else if (points <= 4) { tier = 'medium';    ldlTarget = 140; label = '一次予防 中リスク (2-9%)'; }
  else if (points <= 6) { tier = 'high';      ldlTarget = 120; label = '一次予防 高リスク (≥10%)'; }
  else                  { tier = 'very_high'; ldlTarget = 100; label = '一次予防 非常に高リスク'; }

  return { tier, ldlTarget, label, points };
}

// =====================================================
// 2. JSH2025 リスク層別 (HT)
// =====================================================
export const JSH2025_INPUTS = [
  { id: 'bp_grade', label: '血圧グレード', type: 'select', options: [
    { value: 'normal_high', label: '正常高値 (130-139/80-89)' },
    { value: 'grade1',      label: 'I度 (140-159/90-99)' },
    { value: 'grade2',      label: 'II度 (160-179/100-109)' },
    { value: 'grade3',      label: 'III度 (≥180/≥110)' },
  ]},
  { id: 'risk_factors', label: '危険因子数 (年齢/喫煙/DM/DLP/家族歴)', type: 'select', options: [
    { value: '0', label: 'なし' }, { value: '1-2', label: '1-2個' }, { value: '3plus', label: '3個以上' },
  ]},
  { id: 'organ_damage', label: '臓器障害 / CKD G3以下', type: 'select', options: [
    { value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' },
  ]},
  { id: 'comorbid_cv', label: 'CV既往 (MI/脳卒中/CKD G4-5/DM長期)', type: 'select', options: [
    { value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' },
  ]},
];

export function calcJsh2025(input) {
  const grade = input.bp_grade;
  const rf = input.risk_factors;
  const od = input.organ_damage === 'yes';
  const cv = input.comorbid_cv === 'yes';

  let tier, label;
  if (cv) { tier = 'very_high'; label = '高リスク (CV既往あり)'; }
  else if (od) { tier = 'high'; label = '高リスク (臓器障害/CKD)'; }
  else if (grade === 'grade3') { tier = 'high'; label = '高リスク (III度HT)'; }
  else if (grade === 'grade2' && rf === '3plus') { tier = 'high'; label = '高リスク'; }
  else if (grade === 'grade2' || rf === '3plus') { tier = 'medium'; label = '中リスク'; }
  else if (grade === 'grade1' && rf === '0') { tier = 'low'; label = '低リスク'; }
  else { tier = 'medium'; label = '中リスク'; }

  return { tier, label };
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
// 4. CHA₂DS₂-VASc + HAS-BLED (AF) — checkbox は range化不要 (有/無の2値)
// =====================================================
export const CHADS_VASC_INPUTS = [
  { id: 'chf',       label: '心不全', type: 'checkbox' },
  { id: 'ht',        label: '高血圧', type: 'checkbox' },
  { id: 'age_75',    label: '年齢≥75歳 (2点)', type: 'checkbox' },
  { id: 'dm',        label: '糖尿病', type: 'checkbox' },
  { id: 'stroke',    label: '脳卒中/TIA既往 (2点)', type: 'checkbox' },
  { id: 'vasc',      label: '血管病 (MI/PAD/大動脈プラーク)', type: 'checkbox' },
  { id: 'age_65_74', label: '年齢65-74歳', type: 'checkbox' },
  { id: 'sex_f',     label: '女性', type: 'checkbox' },
];
export const HAS_BLED_INPUTS = [
  { id: 'ht_uncontrol', label: 'コントロール不良HT (SBP>160)', type: 'checkbox' },
  { id: 'renal',        label: '腎機能異常 (Cr>2.26 or 透析)', type: 'checkbox' },
  { id: 'liver',        label: '肝機能異常', type: 'checkbox' },
  { id: 'stroke_hx',    label: '脳卒中既往', type: 'checkbox' },
  { id: 'bleed_hx',     label: '出血既往/出血傾向', type: 'checkbox' },
  { id: 'inr_labile',   label: 'PT-INR不安定 (warfarin)', type: 'checkbox' },
  { id: 'age_65',       label: '年齢>65歳', type: 'checkbox' },
  { id: 'drugs',        label: '抗血小板薬/NSAID併用', type: 'checkbox' },
  { id: 'alcohol',      label: 'アルコール過飲', type: 'checkbox' },
];

export function calcChadsVasc(input) {
  let s = 0;
  if (input.chf) s += 1;
  if (input.ht) s += 1;
  if (input.age_75) s += 2;
  if (input.dm) s += 1;
  if (input.stroke) s += 2;
  if (input.vasc) s += 1;
  if (input.age_65_74) s += 1;
  if (input.sex_f) s += 1;

  const malePoint = !input.sex_f ? s : s - 1;
  const femalePoint = input.sex_f ? s : s + 1;
  const anticoag = input.sex_f
    ? (femalePoint >= 3 ? 'recommend' : (femalePoint === 2 ? 'consider' : 'no'))
    : (malePoint >= 2 ? 'recommend' : (malePoint === 1 ? 'consider' : 'no'));

  return { score: s, anticoag, label: `CHA₂DS₂-VASc = ${s}点 → 抗凝固${anticoag === 'recommend' ? '推奨' : anticoag === 'consider' ? '考慮' : '不要'}` };
}

export function calcHasBled(input) {
  let s = 0;
  for (const k of ['ht_uncontrol', 'renal', 'liver', 'stroke_hx', 'bleed_hx', 'inr_labile', 'age_65', 'drugs', 'alcohol']) {
    if (input[k]) s += 1;
  }
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
  },
  jsh2025_risk: {
    name: 'JSH2025 リスク層別',
    discipline: 'HT / 治療開始閾値',
    inputs: JSH2025_INPUTS,
    calc: calcJsh2025,
  },
  kdigo_heatmap: {
    name: 'KDIGO Heat Map',
    discipline: 'CKD / Gステージ × 蛋白尿',
    inputs: KDIGO_INPUTS,
    calc: calcKdigo,
  },
  cha2ds2vasc_hasbled: {
    name: 'CHA₂DS₂-VASc + HAS-BLED',
    discipline: 'AF / 抗凝固判断 + 出血リスク',
    inputs: [...CHADS_VASC_INPUTS, ...HAS_BLED_INPUTS.map(i => ({ ...i, group: 'hasbled' }))],
    calc: (input) => ({
      chadsvasc: calcChadsVasc(input),
      hasbled:   calcHasBled(input),
    }),
  },
  gold_abe: {
    name: 'GOLD ABE分類',
    discipline: 'COPD / グループ分類',
    inputs: GOLD_ABE_INPUTS,
    calc: calcGoldAbe,
  },
};
