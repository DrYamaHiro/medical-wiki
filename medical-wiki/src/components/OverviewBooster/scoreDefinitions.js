/**
 * 慢性疾患管理ブースター — リスクスコア層別 (v0.3)
 *
 * 設計原則 (5並列エージェント設計に基づく):
 * 1. 患者属性 (年齢/性別/喫煙/併存) は patientHeader から自動継承
 * 2. 検査値 (SBP/LDL/HDL/HbA1c/eGFR/UACR/BMI) は commonLabs から自動継承
 * 3. 病歴/生活因子 (脳卒中/MI/PAD/出血/飲酒/NSAID) は commonHistory から自動継承
 * 4. 各 calc 関数は ctx = { patientHeader, commonLabs, commonHistory, localInput } を受ける純関数
 * 5. requires メタで「このスコアが参照する因子」を declarative 化、未入力検出可能
 * 6. JSH2025 bp_grade は commonLabs.sbp_range から派生 (deriveBpGrade)
 */

// ============================================================
// 共通カットオフ ranges (UIで共有)
// ============================================================
export const SBP_RANGES = [
  { value: '<120', label: '<120 (至適)' },
  { value: '120-129', label: '120-129 (正常)' },
  { value: '130-139', label: '130-139 (正常高値)' },
  { value: '140-159', label: '140-159 (I度HT)' },
  { value: '160-179', label: '160-179 (II度HT)' },
  { value: '180+', label: '≥180 (III度HT)' },
];
export const DBP_RANGES = [
  { value: '<80', label: '<80' },
  { value: '80-89', label: '80-89' },
  { value: '90-99', label: '90-99' },
  { value: '100-109', label: '100-109' },
  { value: '110+', label: '≥110' },
];
export const LDL_RANGES = [
  { value: '<70', label: '<70' }, { value: '70-99', label: '70-99' }, { value: '100-119', label: '100-119' },
  { value: '120-139', label: '120-139' }, { value: '140-159', label: '140-159' }, { value: '160-179', label: '160-179' }, { value: '180+', label: '≥180' },
];
export const HDL_RANGES = [
  { value: '<40', label: '<40 (低HDL)' }, { value: '40-59', label: '40-59' }, { value: '60+', label: '≥60' },
];
export const TG_RANGES = [
  { value: '<150', label: '<150' }, { value: '150-199', label: '150-199' }, { value: '200-499', label: '200-499' },
  { value: '500-999', label: '500-999 (膵炎リスク)' }, { value: '1000+', label: '≥1000 (即日精査)' },
];
export const HBA1C_RANGES = [
  { value: '<5.6', label: '<5.6 (正常)' }, { value: '5.6-5.9', label: '5.6-5.9 (前糖尿病)' },
  { value: '6.0-6.4', label: '6.0-6.4 (境界)' }, { value: '6.5-6.9', label: '6.5-6.9 (DM軽度)' },
  { value: '7.0-7.9', label: '7.0-7.9 (DM中等)' }, { value: '8.0-9.9', label: '8.0-9.9 (DM不良)' }, { value: '10+', label: '≥10 (DM重症)' },
];
export const BMI_RANGES = [
  { value: '<18.5', label: '<18.5' }, { value: '18.5-22', label: '18.5-22' }, { value: '23-24', label: '23-24' },
  { value: '25-29', label: '25-29' }, { value: '30-34', label: '30-34' }, { value: '35+', label: '≥35' },
];
export const EGFR_RANGES = [
  { value: '90+', label: '≥90 (G1)' }, { value: '60-89', label: '60-89 (G2)' }, { value: '45-59', label: '45-59 (G3a)' },
  { value: '30-44', label: '30-44 (G3b)' }, { value: '15-29', label: '15-29 (G4)' }, { value: '<15', label: '<15 (G5)' },
];
export const UACR_RANGES = [
  { value: '<30', label: '<30 (A1)' }, { value: '30-300', label: '30-300 (A2)' }, { value: '300+', label: '≥300 (A3)' },
];
export const K_RANGES = [
  { value: '<3.5', label: '<3.5 (低K)' }, { value: '3.5-5.0', label: '3.5-5.0 (正常)' },
  { value: '5.1-5.4', label: '5.1-5.4 (軽度高K)' }, { value: '5.5+', label: '≥5.5 (高K)' },
];

const MMRC_OPTIONS = [
  { value: '0', label: '0 (激しい運動でのみ息切れ)' }, { value: '1', label: '1 (急ぎ歩きや坂で息切れ)' },
  { value: '2', label: '2 (同年代より歩くのが遅い)' }, { value: '3', label: '3 (100m歩いて息切れ)' }, { value: '4', label: '4 (服を着替えるだけで息切れ)' },
];
const CAT_RANGES = [
  { value: '<10', label: '<10' }, { value: '10-20', label: '10-20' }, { value: '21-30', label: '21-30' }, { value: '31+', label: '≥31' },
];
const EXAC_RANGES = [
  { value: '0', label: '0回' }, { value: '1', label: '1回' }, { value: '2+', label: '2回以上' },
];

// ============================================================
// commonLabs / commonHistory のフィールド定義
// ============================================================
export const COMMON_LAB_FIELDS = [
  { id: 'sbp_range',   label: '収縮期血圧 SBP', options: SBP_RANGES,   usedBy: ['HT JSH2025', 'DLP久山町'] },
  { id: 'dbp_range',   label: '拡張期血圧 DBP', options: DBP_RANGES,   usedBy: ['HT JSH2025'] },
  { id: 'ldl_range',   label: 'LDL-C',          options: LDL_RANGES,   usedBy: ['DLP久山町', 'DLP治療目標'] },
  { id: 'hdl_range',   label: 'HDL-C',          options: HDL_RANGES,   usedBy: ['DLP久山町'] },
  { id: 'tg_range',    label: 'TG',             options: TG_RANGES,    usedBy: ['DLP治療判断'] },
  { id: 'hba1c_range', label: 'HbA1c',          options: HBA1C_RANGES, usedBy: ['DM治療目標', 'DLP久山町(耐糖能)'] },
  { id: 'egfr_range',  label: 'eGFR',           options: EGFR_RANGES,  usedBy: ['CKD KDIGO', 'AF HAS-BLED', '痛風用量調整'] },
  { id: 'uacr_range',  label: 'UACR',           options: UACR_RANGES,  usedBy: ['CKD KDIGO'] },
  { id: 'bmi_range',   label: 'BMI',            options: BMI_RANGES,   usedBy: ['DLP久山町'] },
  { id: 'k_range',     label: '血清K',          options: K_RANGES,     usedBy: ['ARB/MRA/SGLT2安全性'] },
];

export const COMMON_HISTORY_FIELDS = [
  { id: 'stroke',       label: '脳卒中/TIA既往' },
  { id: 'mi_pci',       label: 'MI/PCI/CABG既往' },
  { id: 'pad',          label: 'PAD' },
  { id: 'bleed_hx',     label: '出血既往/出血傾向' },
  { id: 'liver_dysfx',  label: '肝機能異常' },
  { id: 'organ_damage', label: '臓器障害 (LVH/網膜症/eGFR<60)' },
  { id: 'nsaid_use',    label: 'NSAID常用' },
  { id: 'antiplatelet', label: '抗血小板薬使用' },
  { id: 'alcohol_heavy',label: 'アルコール過飲 (>30g/日)' },
];

// ============================================================
// 派生関数: SBP+DBP range → JSH2025 bp_grade
// ============================================================
function deriveBpGrade(sbpRange, dbpRange) {
  const sbpScore = { '<120': 0, '120-129': 1, '130-139': 2, '140-159': 3, '160-179': 4, '180+': 5 }[sbpRange] ?? -1;
  const dbpScore = { '<80': 0, '80-89': 1, '90-99': 3, '100-109': 4, '110+': 5 }[dbpRange] ?? -1;
  const score = Math.max(sbpScore, dbpScore);
  if (score === -1) return '';
  if (score >= 5) return 'grade3';
  if (score >= 4) return 'grade2';
  if (score >= 3) return 'grade1';
  if (score === 2) return 'normal_high';
  return 'normal';
}

// ============================================================
// スコア計算関数 (新シグネチャ: ctx = { patientHeader, commonLabs, commonHistory, localInput })
// ============================================================

// 1. 久山町 (DLP)
export function calcHisayama(ctx) {
  const ph = ctx.patientHeader || {};
  const cl = ctx.commonLabs || {};
  const li = ctx.localInput || {};
  const ageMap = { '<40': 0, '40-49': 1, '50-59': 2, '60-64': 3, '65-69': 3, '70-74': 4, '75-79': 4, '80-89': 4, '90+': 4 };
  const sbpMap = { '<120': 0, '120-129': 0, '130-139': 1, '140-159': 2, '160-179': 3, '180+': 3 };
  const ldlMap = { '<70': 0, '70-99': 0, '100-119': 0, '120-139': 1, '140-159': 2, '160-179': 2, '180+': 3 };
  const hdlMap = { '<40': 1, '40-59': 0, '60+': 0 };
  const bmiMap = { '<18.5': 0, '18.5-22': 0, '23-24': 0, '25-29': 0, '30-34': 1, '35+': 1 };

  let points = 0;
  points += ageMap[ph.age] ?? 0;
  if (ph.sex === 'M') points += 1;
  points += sbpMap[cl.sbp_range] ?? 0;
  points += ldlMap[cl.ldl_range] ?? 0;
  points += hdlMap[cl.hdl_range] ?? 0;
  if (ph.smoking === 'current') points += 2;
  // 耐糖能異常: cm_dm 既知 or HbA1c≥6.0 or 局所入力 yes
  const dmKnown = ph.cm_dm || (cl.hba1c_range && ['6.0-6.4','6.5-6.9','7.0-7.9','8.0-9.9','10+'].includes(cl.hba1c_range)) || li.glucose === 'yes';
  if (dmKnown) points += 2;
  points += bmiMap[cl.bmi_range] ?? 0;

  let tier, ldlTarget, label;
  if (points <= 2)      { tier = 'low';       ldlTarget = 160; label = '一次予防 低リスク (10y CHD < 2%)'; }
  else if (points <= 4) { tier = 'medium';    ldlTarget = 140; label = '一次予防 中リスク (2-9%)'; }
  else if (points <= 6) { tier = 'high';      ldlTarget = 120; label = '一次予防 高リスク (≥10%)'; }
  else                  { tier = 'very_high'; ldlTarget = 100; label = '一次予防 非常に高リスク'; }

  if (ph.cm_ascvd) {
    tier = 'very_high'; ldlTarget = 70; label = '二次予防 (ASCVD既往あり) → LDL <70';
  }
  if (ph.cm_fh) {
    tier = 'very_high'; ldlTarget = ph.cm_ascvd ? 55 : 100; label = ph.cm_ascvd ? 'FH+ASCVD → LDL <55' : 'FH 一次予防 → LDL <100';
  }
  return { tier, ldlTarget, label, points };
}

// 2. JSH2025 リスク層別 (HT) — bp_grade は commonLabs から派生
export function calcJsh2025(ctx) {
  const ph = ctx.patientHeader || {};
  const cl = ctx.commonLabs || {};
  const ch = ctx.commonHistory || {};
  const grade = deriveBpGrade(cl.sbp_range, cl.dbp_range);
  const od = !!ch.organ_damage;

  // 危険因子数: DM/DLP/喫煙/年齢/性別から自動算出
  let rfCount = 0;
  if (ph.cm_dm) rfCount++;
  if (ph.cm_dlp) rfCount++;
  if (ph.smoking === 'current') rfCount++;
  if (['65-69','70-74','75-79','80-89','90+'].includes(ph.age) && ph.sex === 'M') rfCount++;
  if (['75-79','80-89','90+'].includes(ph.age) && ph.sex === 'F') rfCount++;

  const cv = !!ph.cm_ascvd || !!ph.cm_ckd_g45 || !!ch.stroke || !!ch.mi_pci;

  let tier, label;
  if (cv) { tier = 'very_high'; label = '高リスク (CV/脳卒中/MI/CKD既往あり)'; }
  else if (od) { tier = 'high'; label = '高リスク (臓器障害)'; }
  else if (grade === 'grade3') { tier = 'high'; label = '高リスク (III度HT)'; }
  else if (grade === 'grade2' && rfCount >= 3) { tier = 'high'; label = '高リスク'; }
  else if (grade === 'grade2' || rfCount >= 3) { tier = 'medium'; label = '中リスク'; }
  else if (grade === 'grade1' && rfCount === 0) { tier = 'low'; label = '低リスク'; }
  else if (!grade) { tier = 'unknown'; label = 'BP未入力'; }
  else { tier = 'medium'; label = '中リスク'; }

  return { tier, label, rfCount, derivedGrade: grade };
}

// 3. KDIGO Heat Map (CKD)
export function calcKdigo(ctx) {
  const cl = ctx.commonLabs || {};
  const egfrMap = { '90+': 'G1', '60-89': 'G2', '45-59': 'G3a', '30-44': 'G3b', '15-29': 'G4', '<15': 'G5' };
  const uacrMap = { '<30': 'A1', '30-300': 'A2', '300+': 'A3' };
  const gStage = egfrMap[cl.egfr_range] || '';
  const aStage = uacrMap[cl.uacr_range] || '';
  if (!gStage || !aStage) return { gStage, aStage, risk: 'unknown', label: 'eGFR/UACR 未入力' };
  const heatMap = {
    G1:  { A1: 'green', A2: 'yellow', A3: 'orange' },
    G2:  { A1: 'green', A2: 'yellow', A3: 'orange' },
    G3a: { A1: 'yellow', A2: 'orange', A3: 'red' },
    G3b: { A1: 'orange', A2: 'red', A3: 'red' },
    G4:  { A1: 'red', A2: 'red', A3: 'red' },
    G5:  { A1: 'red', A2: 'red', A3: 'red' },
  };
  const risk = heatMap[gStage]?.[aStage] || 'green';
  return { gStage, aStage, risk, label: `CKD ${gStage}${aStage} (リスク: ${risk})` };
}

// 4. CHA₂DS₂-VASc + HAS-BLED (AF)
export function calcChadsVasc(ctx) {
  const ph = ctx.patientHeader || {};
  const ch = ctx.commonHistory || {};
  let s = 0;
  if (ph.cm_chf) s += 1;
  if (ph.cm_ht) s += 1;
  if (['75-79','80-89','90+'].includes(ph.age)) s += 2;
  if (ph.cm_dm) s += 1;
  if (ch.stroke) s += 2;
  if (ch.mi_pci || ch.pad || ph.cm_ascvd) s += 1;
  if (['65-69','70-74'].includes(ph.age)) s += 1;
  if (ph.sex === 'F') s += 1;

  const isFemale = ph.sex === 'F';
  let anticoag;
  if (isFemale) anticoag = s >= 3 ? 'recommend' : (s === 2 ? 'consider' : 'no');
  else          anticoag = s >= 2 ? 'recommend' : (s === 1 ? 'consider' : 'no');
  return { score: s, anticoag, label: `CHA₂DS₂-VASc = ${s}点 → 抗凝固${anticoag === 'recommend' ? '推奨' : anticoag === 'consider' ? '考慮' : '不要'}` };
}

export function calcHasBled(ctx) {
  const ph = ctx.patientHeader || {};
  const cl = ctx.commonLabs || {};
  const ch = ctx.commonHistory || {};
  const li = ctx.localInput || {};
  let s = 0;
  // HT uncontrolled: SBP≥160
  if (cl.sbp_range === '160-179' || cl.sbp_range === '180+') s += 1;
  // 腎: eGFR<30 (G4-G5) or cm_ckd_g45
  if (cl.egfr_range === '15-29' || cl.egfr_range === '<15' || ph.cm_ckd_g45) s += 1;
  if (ch.liver_dysfx) s += 1;
  if (ch.stroke) s += 1;
  if (ch.bleed_hx) s += 1;
  if (li.inr_labile) s += 1;
  if (['65-69','70-74','75-79','80-89','90+'].includes(ph.age)) s += 1;
  if (ch.nsaid_use || ch.antiplatelet) s += 1;
  if (ch.alcohol_heavy) s += 1;
  const tier = s >= 3 ? 'high' : (s >= 2 ? 'moderate' : 'low');
  return { score: s, tier, label: `HAS-BLED = ${s}点 (${tier === 'high' ? '高出血リスク' : tier === 'moderate' ? '中等度' : '低リスク'})` };
}

// HF EF分類 — LVEF入力で HFrEF/HFmrEF/HFpEF を判別
export const HF_EF_OPTIONS = [
  { value: 'reduced',    label: 'EF ≤40% (HFrEF — 駆出率低下)' },
  { value: 'mid_range',  label: 'EF 41-49% (HFmrEF — 中間範囲)' },
  { value: 'preserved',  label: 'EF ≥50% (HFpEF — 駆出率保持)' },
  { value: 'unknown',    label: 'EF 未測定 (echo 予定)' },
];
export const NYHA_OPTIONS = [
  { value: '1', label: 'NYHA I (無症状)' },
  { value: '2', label: 'NYHA II (中等度の運動で症状)' },
  { value: '3', label: 'NYHA III (軽度の運動で症状)' },
  { value: '4', label: 'NYHA IV (安静時症状)' },
];

export function calcHfEf(ctx) {
  const li = ctx.localInput || {};
  const ef = li.ef_class;
  const nyha = li.nyha;
  let label = '心不全 (EF未指定)';
  if (ef === 'reduced')   label = 'HFrEF (EF≤40%) — 4本柱が標準';
  else if (ef === 'mid_range') label = 'HFmrEF (EF 41-49%) — SGLT2i + 個別判断';
  else if (ef === 'preserved') label = 'HFpEF (EF≥50%) — SGLT2i 第一選択 (EMPEROR-Preserved/DELIVER)';
  else if (ef === 'unknown')   label = 'EF測定推奨 (心エコー優先)';
  const nyhaLabel = nyha ? ` / NYHA ${['','I','II','III','IV'][parseInt(nyha,10)] || ''}` : '';
  return { ef, nyha, label: label + nyhaLabel };
}

// 5. GOLD ABE (COPD)
export function calcGoldAbe(ctx) {
  const li = ctx.localInput || {};
  const mmrc = parseInt(li.mmrc, 10);
  const exacHi = li.exac_year === '2+' || li.hosp_year === '1+';
  if (exacHi) return { group: 'E', label: 'Group E (頻回増悪、ICS/Triple考慮 + eos≥300/ACO検討)' };
  const symptomatic = (mmrc >= 2) || (li.cat === '10-20' || li.cat === '21-30' || li.cat === '31+');
  if (symptomatic) return { group: 'B', label: 'Group B (症状あり・増悪少、LAMA/LABA合剤推奨)' };
  return { group: 'A', label: 'Group A (軽症、LAMA単剤)' };
}

// ============================================================
// スコア定義レジストリ — requires メタで dependency declarative
// ============================================================
export const SCORE_DEFINITIONS = {
  hisayama: {
    name: '久山町スコア',
    discipline: 'DLP / 一次予防 リスク評価',
    requires: {
      patientHeader: ['age', 'sex', 'smoking', 'cm_dm', 'cm_ascvd', 'cm_fh'],
      commonLabs:    ['sbp_range', 'ldl_range', 'hdl_range', 'bmi_range', 'hba1c_range'],
      commonHistory: [],
    },
    localInputs: [
      { id: 'glucose', label: '耐糖能異常 (HbA1cが未入力時のみ)', type: 'select',
        options: [{ value: 'no', label: 'なし' }, { value: 'yes', label: 'あり' }],
        showWhen: (state) => !state.commonLabs?.hba1c_range,  // HbA1c未入力時のみ表示
      },
    ],
    calc: calcHisayama,
  },
  jsh2025_risk: {
    name: 'JSH2025 リスク層別',
    discipline: 'HT / 治療開始閾値',
    requires: {
      patientHeader: ['age', 'sex', 'smoking', 'cm_dm', 'cm_dlp', 'cm_ascvd', 'cm_ckd_g45'],
      commonLabs:    ['sbp_range', 'dbp_range'],
      commonHistory: ['organ_damage', 'stroke', 'mi_pci'],
    },
    localInputs: [],
    calc: calcJsh2025,
  },
  kdigo_heatmap: {
    name: 'KDIGO Heat Map',
    discipline: 'CKD / Gステージ × 蛋白尿',
    requires: {
      patientHeader: [],
      commonLabs:    ['egfr_range', 'uacr_range'],
      commonHistory: [],
    },
    localInputs: [],
    calc: calcKdigo,
  },
  cha2ds2vasc_hasbled: {
    name: 'CHA₂DS₂-VASc + HAS-BLED',
    discipline: 'AF / 抗凝固判断 + 出血リスク',
    requires: {
      patientHeader: ['age', 'sex', 'cm_chf', 'cm_ht', 'cm_dm', 'cm_ascvd', 'cm_ckd_g45'],
      commonLabs:    ['sbp_range', 'egfr_range'],
      commonHistory: ['stroke', 'mi_pci', 'pad', 'bleed_hx', 'liver_dysfx', 'nsaid_use', 'antiplatelet', 'alcohol_heavy'],
    },
    localInputs: [
      { id: 'inr_labile', label: 'PT-INR不安定 (warfarin使用時)', type: 'checkbox' },
    ],
    calc: (ctx) => ({ chadsvasc: calcChadsVasc(ctx), hasbled: calcHasBled(ctx) }),
  },
  hf_ef: {
    name: 'EF/NYHA分類',
    discipline: '心不全 / 駆出率と症状重症度',
    requires: { patientHeader: [], commonLabs: [], commonHistory: [] },
    localInputs: [
      { id: 'ef_class', label: 'LVEF (心エコー結果)', type: 'select', options: HF_EF_OPTIONS },
      { id: 'nyha',     label: 'NYHA分類 (症状重症度)', type: 'select', options: NYHA_OPTIONS },
    ],
    calc: calcHfEf,
  },
  gold_abe: {
    name: 'GOLD ABE分類',
    discipline: 'COPD / グループ分類',
    requires: {
      patientHeader: [],
      commonLabs:    [],
      commonHistory: [],
    },
    localInputs: [
      { id: 'mmrc',      label: 'mMRC',      type: 'select', options: MMRC_OPTIONS },
      { id: 'cat',       label: 'CAT',       type: 'select', options: CAT_RANGES },
      { id: 'exac_year', label: '過去1年の増悪回数', type: 'select', options: EXAC_RANGES },
      { id: 'hosp_year', label: '増悪入院回数', type: 'select', options: [{ value: '0', label: '0回' }, { value: '1+', label: '1回以上' }] },
    ],
    calc: calcGoldAbe,
  },
};

// ============================================================
// 不足因子検出
// ============================================================
export function detectMissingFactors(scoreKey, state) {
  const def = SCORE_DEFINITIONS[scoreKey];
  if (!def) return null;
  const ph = state.patientHeader || {};
  const cl = state.commonLabs || {};
  const ch = state.commonHistory || {};
  const missing = { patientHeader: [], commonLabs: [], commonHistory: [] };
  for (const k of def.requires.patientHeader || []) {
    const v = ph[k];
    // boolean flag は false でも明示OK扱い、空文字/undefined のみ missing
    if (v === undefined || v === null || v === '') missing.patientHeader.push(k);
  }
  for (const k of def.requires.commonLabs || []) {
    if (!cl[k]) missing.commonLabs.push(k);
  }
  for (const k of def.requires.commonHistory || []) {
    if (ch[k] === undefined) missing.commonHistory.push(k);
  }
  return missing;
}
