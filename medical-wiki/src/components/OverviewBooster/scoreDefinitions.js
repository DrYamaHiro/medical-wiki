/**
 * Overview Booster — リスクスコア層別 (v0.1: 5疾患)
 *
 * 各スコアは純関数 calc(input) → result で実装。
 * UI は ScoreRenderer 経由で kind ごとにフォーム描画。
 */

// =====================================================
// 1. 久山町スコア (DLP) — JAS2022 一次予防リスク評価
// =====================================================
// 簡略化: 性別・年齢・SBP・LDL・HDL・喫煙・耐糖能・BMI から 10年CHD risk を6階層に分類
export const HISAYAMA_INPUTS = [
  { id: 'age',     label: '年齢',          unit: '歳',     type: 'number', placeholder: '40-89' },
  { id: 'sex',     label: '性別',          type: 'select', options: [{ value: 'M', label: '男性' }, { value: 'F', label: '女性' }] },
  { id: 'sbp',     label: '収縮期血圧 SBP', unit: 'mmHg',  type: 'number', placeholder: '例:140' },
  { id: 'ldl',     label: 'LDL-C',         unit: 'mg/dL', type: 'number', placeholder: '例:140' },
  { id: 'hdl',     label: 'HDL-C',         unit: 'mg/dL', type: 'number', placeholder: '例:50' },
  { id: 'smoking', label: '喫煙',          type: 'select', options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }] },
  { id: 'glucose', label: '耐糖能異常 (空腹時≥110 or HbA1c≥6.0)', type: 'select', options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }] },
  { id: 'bmi',     label: 'BMI',           unit: 'kg/m²', type: 'number', placeholder: '例:24' },
];

export function calcHisayama(input) {
  // 簡易係数 (PCE準拠)
  const age = +input.age || 0;
  const sbp = +input.sbp || 0;
  const ldl = +input.ldl || 0;
  const hdl = +input.hdl || 50;
  const smoke = input.smoking === 'yes' ? 1 : 0;
  const dm = input.glucose === 'yes' ? 1 : 0;
  const bmi = +input.bmi || 22;

  // ポイント計算 (簡略化、JAS2022 久山町を抽象化)
  let points = 0;
  if (age >= 70) points += 4; else if (age >= 60) points += 3; else if (age >= 50) points += 2; else if (age >= 40) points += 1;
  if (input.sex === 'M') points += 1;
  if (sbp >= 160) points += 3; else if (sbp >= 140) points += 2; else if (sbp >= 130) points += 1;
  if (ldl >= 180) points += 3; else if (ldl >= 160) points += 2; else if (ldl >= 140) points += 1;
  if (hdl < 40) points += 1;
  if (smoke) points += 2;
  if (dm) points += 2;
  if (bmi >= 30) points += 1;

  // tier 判定 → LDL目標
  let tier, ldlTarget, label;
  if (points <= 2)      { tier = 'low';     ldlTarget = 160; label = '一次予防 低リスク (10y CHD < 2%)'; }
  else if (points <= 4) { tier = 'medium';  ldlTarget = 140; label = '一次予防 中リスク (2-9%)'; }
  else if (points <= 6) { tier = 'high';    ldlTarget = 120; label = '一次予防 高リスク (≥10%)'; }
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
  { id: 'risk_factors', label: '危険因子数 (年齢/喫煙/DM/DLP/家族歴 etc)', type: 'select', options: [
    { value: '0', label: 'なし' }, { value: '1-2', label: '1-2個' }, { value: '3plus', label: '3個以上' },
  ]},
  { id: 'organ_damage', label: '臓器障害/CKD G3以下', type: 'select', options: [
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
  { id: 'egfr',  label: 'eGFR',  unit: 'mL/min/1.73m²', type: 'number', placeholder: '例:45' },
  { id: 'uacr',  label: 'UACR',  unit: 'mg/gCr',         type: 'number', placeholder: '例:50' },
];

export function calcKdigo(input) {
  const egfr = +input.egfr;
  const uacr = +input.uacr;

  let gStage;
  if (egfr >= 90) gStage = 'G1';
  else if (egfr >= 60) gStage = 'G2';
  else if (egfr >= 45) gStage = 'G3a';
  else if (egfr >= 30) gStage = 'G3b';
  else if (egfr >= 15) gStage = 'G4';
  else gStage = 'G5';

  let aStage;
  if (uacr < 30) aStage = 'A1';
  else if (uacr <= 300) aStage = 'A2';
  else aStage = 'A3';

  // 4色リスク (KDIGO ヒートマップ簡略)
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
// 4. CHA₂DS₂-VASc + HAS-BLED (AF)
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
  if (input.drugs && input.alcohol) s += 0; // 重複不可、ここではcountだけ
  const tier = s >= 3 ? 'high' : (s >= 2 ? 'moderate' : 'low');
  return { score: s, tier, label: `HAS-BLED = ${s}点 (${tier === 'high' ? '高出血リスク' : tier === 'moderate' ? '中等度' : '低リスク'})` };
}

// =====================================================
// 5. GOLD ABE分類 (COPD)
// =====================================================
export const GOLD_ABE_INPUTS = [
  { id: 'mmrc',      label: 'mMRC (0-4)',     unit: '',  type: 'number', placeholder: '例:2' },
  { id: 'cat',       label: 'CAT (0-40、任意)', unit: '点', type: 'number', placeholder: '例:15' },
  { id: 'exac_year', label: '過去1年の増悪回数', unit: '回', type: 'number', placeholder: '例:0' },
  { id: 'hosp_year', label: '増悪入院回数',     unit: '回', type: 'number', placeholder: '例:0' },
];

export function calcGoldAbe(input) {
  const mmrc = +input.mmrc;
  const cat = +input.cat;
  const exac = +input.exac_year;
  const hosp = +input.hosp_year;

  if (exac >= 2 || hosp >= 1) {
    return { group: 'E', label: 'Group E (頻回増悪、ICS/Triple考慮 + eos≥300/ACO検討)' };
  }
  const symptomatic = (mmrc >= 2) || (cat >= 10);
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
