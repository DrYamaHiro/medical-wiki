/**
 * Treatment Booster — 脂質異常症 治療修正データ
 * JAS動脈硬化性疾患予防ガイドライン2022 (JAS2022) 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // スタチン — Low intensity (LDL低下 ~20-30%)
  { id: 'stat_prava', label: 'プラバスタチン（メバロチン）', class: 'スタチン',
    intensity: 'low',
    doses: [
      { value: '5', label: '5mg 1日1回' },
      { value: '10', label: '10mg 1日1回', isDefault: true, isMax: true },
    ] },
  { id: 'stat_simva', label: 'シンバスタチン（リポバス）', class: 'スタチン',
    intensity: 'low',
    doses: [
      { value: '5', label: '5mg', isDefault: true },
      { value: '10', label: '10mg' },
      { value: '20', label: '20mg', isMax: true },
    ] },
  { id: 'stat_fluva', label: 'フルバスタチン（ローコール）', class: 'スタチン',
    intensity: 'low',
    doses: [
      { value: '10', label: '10mg' },
      { value: '20', label: '20mg', isDefault: true },
      { value: '30', label: '30mg', isMax: true },
    ] },

  // スタチン — Moderate intensity (LDL低下 ~30-40%)
  { id: 'stat_atorva', label: 'アトルバスタチン（リピトール）', class: 'スタチン',
    intensity: 'moderate',
    doses: [
      { value: '5', label: '5mg', isDefault: true },
      { value: '10', label: '10mg' },
      { value: '20', label: '20mg（high intensity相当）' },
      { value: '40', label: '40mg（最大）', isMax: true },
    ] },
  { id: 'stat_pitava', label: 'ピタバスタチン（リバロ）', class: 'スタチン',
    intensity: 'moderate',
    doses: [
      { value: '1', label: '1mg' },
      { value: '2', label: '2mg', isDefault: true },
      { value: '4', label: '4mg', isMax: true },
    ] },

  // スタチン — High intensity (LDL低下 ~40-55%)
  { id: 'stat_rosuva', label: 'ロスバスタチン（クレストール）', class: 'スタチン',
    intensity: 'high',
    doses: [
      { value: '2.5', label: '2.5mg', isDefault: true },
      { value: '5', label: '5mg' },
      { value: '10', label: '10mg' },
      { value: '20', label: '20mg', isMax: true },
    ] },

  // エゼチミブ
  { id: 'ezt', label: 'エゼチミブ（ゼチーア）', class: 'エゼチミブ',
    doses: [{ value: '10', label: '10mg 1日1回', isDefault: true, isMax: true }] },

  // PCSK9i
  { id: 'pcsk9_evo', label: 'エボロクマブ（レパーサ）', class: 'PCSK9i',
    doses: [
      { value: '140_biw', label: '140mg 2週1回 SC' },
      { value: '420_qm', label: '420mg 月1回 SC', isDefault: true, isMax: true },
    ] },
  { id: 'pcsk9_ali', label: 'アリロクマブ（プラルエント）', class: 'PCSK9i',
    doses: [
      { value: '75_biw', label: '75mg 2週1回 SC', isDefault: true },
      { value: '150_biw', label: '150mg 2週1回 SC', isMax: true },
    ] },

  // フィブラート
  { id: 'fib_pema', label: 'ペマフィブラート（パルモディア）', class: 'フィブラート',
    doses: [
      { value: '0.2', label: '0.1mg×2/日', isDefault: true },
      { value: '0.4', label: '0.2mg×2/日', isMax: true },
    ] },
  { id: 'fib_feno', label: 'フェノフィブラート（リピディル）', class: 'フィブラート',
    doses: [
      { value: '80', label: '80mg/日', isDefault: true },
      { value: '160', label: '160mg/日', isMax: true },
    ] },
  { id: 'fib_beza', label: 'ベザフィブラート（ベザトールSR）', class: 'フィブラート',
    doses: [
      { value: '200', label: '200mg/日' },
      { value: '400', label: '400mg/日', isDefault: true, isMax: true },
    ] },

  // オメガ-3
  { id: 'o3_epa', label: 'イコサペント酸エチル（エパデール）', class: 'オメガ-3',
    doses: [
      { value: '1800', label: '900mg×2/日（JELIS用量）', isDefault: true },
      { value: '2700', label: '900mg×3/日' },
      { value: '4000', label: '2000mg×2/日（強化）', isMax: true },
    ] },
  { id: 'o3_mix', label: 'オメガ-3脂肪酸エチル（ロトリガ）', class: 'オメガ-3',
    doses: [
      { value: '2000', label: '2g×1/日', isDefault: true },
      { value: '4000', label: '2g×2/日', isMax: true },
    ] },

  // 胆汁酸吸着（妊娠時選択肢、最小実装）
  { id: 'bile_col', label: 'コレスチミド（コレバイン）', class: '胆汁酸吸着',
    doses: [
      { value: '3000', label: '1500mg×2/日', isDefault: true, isMax: true },
    ] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_myalgia', label: '筋痛・筋力低下（CK正常 or <3×ULN）', cat: '副作用' },
  { id: 'se_ck_moderate', label: 'CK上昇（3-10×ULN、myositis相当）', cat: '副作用' },
  { id: 'se_rhabdomyolysis', label: '横紋筋融解症（CK≥10×ULN + AKI/ミオグロビン尿）', cat: '副作用', severity: 'critical' },
  { id: 'se_alt_ast_moderate', label: 'AST/ALT 1-3×ULN', cat: '副作用' },
  { id: 'se_alt_ast_severe', label: 'AST/ALT ≥3×ULN', cat: '副作用' },
  { id: 'se_liver_jaundice', label: '黄疸・肝不全徴候', cat: '副作用', severity: 'critical' },
  { id: 'se_new_onset_dm', label: '新規DM発症（スタチン投与後）', cat: '副作用' },
  { id: 'se_gallstone', label: '胆石症（フィブラート関連）', cat: '副作用' },
  { id: 'se_cognitive', label: '認知機能低下の訴え', cat: '副作用' },
  { id: 'se_injection_reaction', label: '注射部位反応（PCSK9i）', cat: '副作用' },
  { id: 'se_sams_suspected', label: 'SAMS疑い（再チャレンジで症状再現）', cat: '副作用' },

  // 併存疾患 — FH
  { id: 'cm_fh', label: '家族性高コレステロール血症（ヘテロ, HeFH）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_fh_homo', label: '家族性高コレステロール血症（ホモ, HoFH）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_fh_suspect', label: 'FH疑い（LDL≥180 / 若年家族歴 / 黄色腫）', cat: '併存疾患' },
  { id: 'cm_xanthoma', label: '腱黄色腫 / 眼瞼黄色腫', cat: '併存疾患' },
  { id: 'cm_early_cv_family_hx', label: '若年冠動脈疾患家族歴（一親等 M<55 / F<65）', cat: '併存疾患' },
  { id: 'cm_ldl_very_high', label: 'LDL-C ≥180 mg/dL 未治療', cat: '併存疾患' },

  // 併存疾患 — ASCVD / リスク層別
  { id: 'cm_ascvd', label: 'ASCVD既往（総称）', cat: '併存疾患' },
  { id: 'cm_cad', label: '冠動脈疾患既往（MI/狭心症/PCI/CABG）', cat: '併存疾患' },
  { id: 'cm_acs_12mo', label: 'ACS発症12ヶ月以内', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_stroke', label: '脳梗塞既往', cat: '併存疾患' },
  { id: 'cm_non_card_stroke', label: '非心原性脳梗塞既往', cat: '併存疾患' },
  { id: 'cm_pad', label: '末梢動脈疾患（PAD）', cat: '併存疾患' },
  { id: 'cm_multi_ascvd_lesion', label: 'ASCVD多発病変', cat: '併存疾患' },
  { id: 'cm_primary_moderate_risk', label: '一次予防・中リスク（久山町スコア相当）', cat: '併存疾患' },
  { id: 'cm_multi_risk', label: '複数ASCVDリスク因子あり', cat: '併存疾患' },

  // 併存疾患 — 代謝・腎
  { id: 'cm_dm', label: '糖尿病', cat: '併存疾患' },
  { id: 'cm_ckd', label: 'CKD (eGFR 30-59 or 蛋白尿)', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5 (eGFR<30)', cat: '併存疾患', severity: 'critical' },

  // 併存疾患 — TG dominant
  { id: 'cm_severe_hypertg', label: 'TG≥500 mg/dL（膵炎リスク）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_tg_residual', label: 'TG 200-500（スタチン下で残存）', cat: '併存疾患' },
  { id: 'cm_tg_mild', label: 'TG 150-300（軽度高値）', cat: '併存疾患' },
  { id: 'cm_mixed_dyslipidemia', label: 'LDL+TG 両高値（混合型）', cat: '併存疾患' },
  { id: 'cm_gallstone', label: '胆石症', cat: '併存疾患' },

  // 併存疾患 — 治療反応性
  { id: 'cm_statin_intolerance', label: 'スタチン不耐（増量困難）', cat: '併存疾患' },
  { id: 'cm_ldl_unmet', label: 'スタチン標準用量でLDL未達', cat: '併存疾患' },
  { id: 'cm_ldl_very_unmet', label: 'スタチン+エゼチミブでもLDL>100', cat: '併存疾患' },
  { id: 'cm_high_intensity_statin_used', label: 'ハイ強度スタチン使用中', cat: '併存疾患' },

  // 併存疾患 — 続発性原因
  { id: 'cm_hypothyroid_untreated', label: '甲状腺機能低下症（未治療/不十分）', cat: '併存疾患' },
  { id: 'cm_nephrotic', label: 'ネフローゼ症候群', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_cholestasis', label: '胆汁うっ滞（PBC・閉塞性黄疸）', cat: '併存疾患' },
  { id: 'cm_cushing', label: 'クッシング症候群', cat: '併存疾患' },
  { id: 'cm_steroid_use_chronic', label: 'ステロイド長期使用中', cat: '併存疾患' },
  { id: 'cm_alcohol_excess', label: '過度のアルコール摂取（>30g/日）', cat: '併存疾患' },
  { id: 'cm_oc_hrt_use', label: '経口避妊薬 / ホルモン補充療法', cat: '併存疾患' },

  // 併存疾患 — 肝・相互作用
  { id: 'cm_hepatitis_active', label: '活動性肝炎（AST/ALT >3×ULN）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_liver_severe', label: '肝機能障害 Child-Pugh B以上', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_child_pugh_c', label: '肝機能障害 Child-Pugh C', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_cyp3a4_inhibitor_use', label: 'CYP3A4阻害薬併用中（クラリス/イトラコナゾール/グレープフルーツ/シクロスポリン等）', cat: '併存疾患', severity: 'critical' },

  // 制約
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_pregnancy_planning', label: '挙児希望（計画妊娠）', cat: '制約', severity: 'critical' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_pediatric', label: '小児（18歳未満）', cat: '制約' },
  { id: 'co_elderly_fragile', label: '高齢者フレイル（一次予防継続要検討）', cat: '制約' },
  { id: 'co_smoking', label: '現喫煙', cat: '制約' },
  { id: 'co_smoking_past', label: '過去喫煙（1年以内中止）', cat: '制約' },
  { id: 'co_hypertension', label: '高血圧併存', cat: '制約' },
  { id: 'co_low_hdl', label: '低HDL-C (<40 mg/dL)', cat: '制約' },
  { id: 'co_fhx_ascvd', label: '早発性ASCVDの家族歴', cat: '制約' },
  { id: 'co_diet_related_obesity', label: '食事・肥満由来（生活指導未介入）', cat: '制約' },
  { id: 'co_high_cost_barrier', label: '高コスト負担困難（PCSK9i使用困難）', cat: '制約' },
  { id: 'co_warfarin_use', label: 'ワルファリン服用中（INR変動注意）', cat: '制約' },
  { id: 'co_polyp', label: 'ポリファーマシー（5剤以上）', cat: '制約' },
  { id: 'co_frail', label: 'フレイル', cat: '制約' },
  { id: 'co_stable_6mo', label: '6ヶ月以上LDL安定', cat: '制約' },

  // 失敗歴
  { id: 'fh_statin_myalgia', label: 'スタチン→筋症状で中止歴', cat: '失敗歴' },
  { id: 'fh_statin_liver', label: 'スタチン→肝機能障害で中止歴', cat: '失敗歴' },

  // Red Flag
  { id: 'rf_pancreatitis_risk', label: '膵炎既往 / TG>1000 mg/dL', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  Risk stratification (JAS2022)                           */
/* -------------------------------------------------------- */
const ASCVD_IDS = ['cm_ascvd', 'cm_cad', 'cm_acs_12mo', 'cm_stroke', 'cm_non_card_stroke', 'cm_pad'];
const VERY_HIGH_COMORBIDS = ['cm_dm', 'cm_ckd_g45', 'cm_acs_12mo', 'cm_non_card_stroke', 'cm_fh'];
const HIGH_PRIMARY_IDS = ['cm_dm', 'cm_ckd', 'cm_ckd_g45', 'cm_pad', 'cm_multi_ascvd_lesion'];

// Phase 0 explicit risk category → LDL target mapping (override)
const PHASE0_TARGET_MAP = {
  risk_fh_secondary: 70,
  risk_very_high: 70,
  risk_secondary: 100,
  risk_fh_primary: 100,
  risk_primary_high: 120,
  risk_primary_moderate: 140,
  risk_primary_low: 160,
};
const PHASE0_CATEGORY_LABELS = {
  risk_fh_secondary: 'FH + ASCVD既往',
  risk_very_high: '二次予防・超高リスク',
  risk_secondary: '二次予防',
  risk_fh_primary: 'FH（一次予防）',
  risk_primary_high: '一次予防・高リスク',
  risk_primary_moderate: '一次予防・中リスク',
  risk_primary_low: '一次予防・低リスク',
};

function hasAscvdHistory(modifiers) {
  return ASCVD_IDS.some((m) => modifiers.includes(m));
}

function getPhase0Category(modifiers) {
  return Object.keys(PHASE0_TARGET_MAP).find((id) => modifiers.includes(id));
}

export function deriveLDLTarget(modifiers = []) {
  // Phase 0 override: explicit user selection takes precedence
  const phase0Cat = getPhase0Category(modifiers);
  if (phase0Cat) return PHASE0_TARGET_MAP[phase0Cat];

  // Fallback: infer from individual comorbidity modifiers (legacy path)
  const has = (id) => modifiers.includes(id);
  const ascvd = hasAscvdHistory(modifiers);
  if (has('cm_fh') || has('cm_fh_homo')) return ascvd ? 70 : 100;
  if (ascvd) {
    const veryHigh = VERY_HIGH_COMORBIDS.some(has) || has('cm_fh_suspect');
    return veryHigh ? 70 : 100;
  }
  if (HIGH_PRIMARY_IDS.some(has)) return 120;
  const riskCount = ['cm_multi_risk', 'cm_primary_moderate_risk', 'co_smoking', 'co_hypertension', 'co_low_hdl', 'co_fhx_ascvd']
    .filter(has).length;
  if (has('cm_primary_moderate_risk') || riskCount >= 2) return 140;
  return 160;
}

function deriveRiskCategory(modifiers = []) {
  // Phase 0 explicit selection wins
  const phase0Cat = getPhase0Category(modifiers);
  if (phase0Cat) return PHASE0_CATEGORY_LABELS[phase0Cat];

  const target = deriveLDLTarget(modifiers);
  const ascvd = hasAscvdHistory(modifiers);
  if (modifiers.includes('cm_fh') || modifiers.includes('cm_fh_homo')) {
    return ascvd ? 'FH + ASCVD既往' : 'FH（一次予防）';
  }
  if (target === 70) return '二次予防・超高リスク';
  if (target === 100) return '二次予防';
  if (target === 120) return '一次予防・高リスク';
  if (target === 140) return '一次予防・中リスク';
  return '一次予防・低リスク';
}

function explainTargetDriver(modifiers) {
  // When Phase 0 explicit selection is made, no extra driver label needed (category name already shown)
  if (getPhase0Category(modifiers)) return '';

  const labels = {
    cm_fh: 'FH',
    cm_fh_homo: 'HoFH',
    cm_fh_suspect: 'FH疑い',
    cm_acs_12mo: 'ACS<12M',
    cm_dm: 'DM',
    cm_ckd_g45: 'CKD G4-5',
    cm_ckd: 'CKD',
    cm_cad: 'CAD既往',
    cm_non_card_stroke: '非心原性脳梗塞',
    cm_stroke: '脳梗塞既往',
    cm_pad: 'PAD',
  };
  const drivers = Object.keys(labels).filter((id) => modifiers.includes(id));
  return drivers.slice(0, 2).map((id) => labels[id]).join(' + ');
}

/* -------------------------------------------------------- */
/*  PHASE0 — Optional risk stratification phase             */
/* -------------------------------------------------------- */
export const PHASE0 = {
  label: 'Phase 0: リスク層別化',
  hint: '（最初にリスクカテゴリーを選択 → LDL-C 目標が自動決定）',
  link: {
    text: '久山町リスクスコア / JAS2022 計算ツール（公式）',
    url: 'https://www.j-athero.org/jp/general/hisayama/',
  },
  groupLabel: 'リスク層別（1つ選択、未選択なら詳細併存症から自動推定）',
  categories: [
    { id: 'risk_primary_low', label: '一次予防・低リスク（LDL <160）' },
    { id: 'risk_primary_moderate', label: '一次予防・中リスク（LDL <140）' },
    { id: 'risk_primary_high', label: '一次予防・高リスク DM/CKD/PAD（LDL <120）' },
    { id: 'risk_secondary', label: '二次予防 ASCVD既往（LDL <100）' },
    { id: 'risk_very_high', label: '超高リスク 二次予防+DM/FH/ACS<12M/非心原性脳梗塞（LDL <70）' },
    { id: 'risk_fh_primary', label: 'FH 一次予防 HeFH/HoFH（LDL <100）' },
    { id: 'risk_fh_secondary', label: 'FH + ASCVD既往（LDL <70）' },
  ],
};

/* -------------------------------------------------------- */
/*  CONTROL_METRIC (JAS2022)                                */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '脂質コントロール（LDL-C必須、HDL/TG/non-HDL任意）',
  inputs: [
    { id: 'ldl', label: 'LDL-C', unit: 'mg/dL', placeholder: '例:140' },
    { id: 'hdl', label: 'HDL-C', unit: 'mg/dL', placeholder: '任意' },
    { id: 'tg', label: 'TG（空腹時）', unit: 'mg/dL', placeholder: '任意' },
    { id: 'non_hdl', label: 'non-HDL-C', unit: 'mg/dL', placeholder: '任意（TG≥400時）' },
  ],
  note: 'JAS2022準拠。LDL目標はモディファイア（合併症・家族歴・ASCVD既往等）で自動決定。TG≥500は膵炎予防最優先。TG≥400ではLDL不正確のためnon-HDL-C（目標+30）で代用。目標+5以内は測定誤差許容範囲',
  deriveStatus: (v, modifiers = []) => {
    const ldl = v.ldl;
    const tg = v.tg;
    const nonHdl = v.non_hdl;

    // TG≥500 膵炎リスク最優先
    if (tg !== undefined && tg >= 500) return 'uncontrolled';

    const target = deriveLDLTarget(modifiers);

    // Overcontrolled: ハイ強度スタチン + LDL<40 (新規DM・筋症状懸念)
    if (ldl !== undefined && ldl < 40 && modifiers.includes('cm_high_intensity_statin_used')) {
      return 'overcontrolled';
    }

    // TG≥400 → non-HDL-Cで代用
    if (tg !== undefined && tg >= 400 && nonHdl !== undefined) {
      const nhdlTarget = target + 30;
      const diff = nonHdl - nhdlTarget;
      if (diff <= 5) return 'controlled';
      if (diff < 20) return 'near_target';
      return 'uncontrolled';
    }

    if (ldl === undefined) return null;
    const diff = ldl - target;
    if (diff <= 5) return 'controlled';
    if (diff < 20) return 'near_target';
    return 'uncontrolled';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS (DLP)                                 */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'se_rhabdomyolysis',
  'se_liver_jaundice',
  'se_alt_ast_severe',
  'se_ck_moderate',
  'se_new_onset_dm',
  'se_sams_suspected',
  'cm_nephrotic',
  'cm_hepatitis_active',
  'cm_child_pugh_c',
  'co_pregnancy',
  'rf_pancreatitis_risk',
];

/* -------------------------------------------------------- */
/*  DISEASE-SPECIFIC HELPERS                                */
/* -------------------------------------------------------- */
export function formatAppliedTarget(modifiers = []) {
  const target = deriveLDLTarget(modifiers);
  const category = deriveRiskCategory(modifiers);
  const driver = explainTargetDriver(modifiers);
  return driver
    ? `LDL-C <${target} mg/dL（${category}: ${driver}）`
    : `LDL-C <${target} mg/dL（${category}）`;
}

export function suggestAgeNudge(values /*, modifiers */) {
  // DLPではBP目標のような年齢依存が少ないため常にfalse
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      rf_pancreatitis_risk: 'TG≥500 膵炎リスク',
      cm_severe_hypertg: 'TG≥500',
      cm_high_intensity_statin_used: 'ハイ強度スタチン使用中',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const tg = metricValues.tg;
  if (tg !== undefined && tg >= 500) flags.push('cm_severe_hypertg');
  if (tg !== undefined && tg >= 1000) flags.push('rf_pancreatitis_risk');
  // ハイ強度スタチン使用の自動検出
  if (currentDrugs && currentDrugs.length > 0 && allDrugs) {
    const highIntense = currentDrugs.some((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const drug = allDrugs.find((d) => d.id === id);
      if (!drug || drug.intensity !== 'high') return false;
      if (drug.intensity === 'high') return true;
      return false;
    });
    // アトルバスタチン20-40mg も high intensity 相当
    const atorvaHigh = currentDrugs.some((entry) => {
      if (typeof entry === 'string') return false;
      if (entry.id !== 'stat_atorva') return false;
      return entry.dose === '20' || entry.dose === '40';
    });
    if (highIntense || atorvaHigh) flags.push('cm_high_intensity_statin_used');
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const ldl = metricValues.ldl;
  const tg = metricValues.tg;
  const mods = modifiers || [];

  if (ldl !== undefined && ldl >= 180 && !mods.includes('cm_fh') && !mods.includes('cm_fh_suspect')) {
    alerts.push({
      type: 'fh_suspect_ldl',
      label: 'LDL≥180 未治療 → FHを疑う',
      detail: 'JAS-FH診断基準: ①未治療LDL≥180 ②若年CV家族歴（一親等 M<55/F<65）③腱/眼瞼黄色腫 のうち2項目以上でFH。該当モディファイアを確認',
    });
  }
  if (tg !== undefined && tg >= 500) {
    alerts.push({
      type: 'severe_hypertg',
      label: '⚠ TG≥500: 膵炎予防を最優先',
      detail: 'LDL管理より先にフィブラート（ペマ第一選択）を開始。TG>1000では入院・絶食・輸液も検討',
    });
  }
  if (mods.includes('co_pregnancy_planning')) {
    alerts.push({
      type: 'preg_planning_lipid',
      label: '挙児希望（妊娠前計画）',
      detail: 'スタチン/フィブラートは受胎1-3ヶ月前に中止。妊娠中は生理的TG上昇あり、介入は膵炎予防目的のω-3に限定',
    });
  }
  return alerts;
}

// Phase 0 カテゴリーと詳細モディファイアの不整合検出
function detectPhase0Inconsistency(modifiers) {
  const phase0Cat = getPhase0Category(modifiers);
  if (!phase0Cat) return null;

  const requiresFH = modifiers.includes('cm_fh') || modifiers.includes('cm_fh_homo');
  const hasAscvd = hasAscvdHistory(modifiers);
  const hasVeryHigh = VERY_HIGH_COMORBIDS.some((id) => modifiers.includes(id));
  const hasHighPrimary = HIGH_PRIMARY_IDS.some((id) => modifiers.includes(id));

  // FH 併存だが Phase 0 が FH でも二次予防系でもない
  const fhPhase0s = ['risk_fh_primary', 'risk_fh_secondary'];
  if (requiresFH && !fhPhase0s.includes(phase0Cat) && phase0Cat !== 'risk_very_high') {
    const suggestedCat = hasAscvd ? 'risk_fh_secondary' : 'risk_fh_primary';
    return {
      type: 'phase0_fh_inconsistency',
      label: '⚠ Phase 0 とFHモディファイアが不整合',
      detail: `FH（cm_fh/cm_fh_homo）が選択されていますが Phase 0 は「${PHASE0_CATEGORY_LABELS[phase0Cat]}」です。FHは少なくとも LDL <100（ASCVD併存なら <70）。Phase 0 を「${PHASE0_CATEGORY_LABELS[suggestedCat]}」へ修正を検討`,
      severity: 'critical',
    };
  }

  // ASCVD 既往だが Phase 0 が一次予防
  const primaryPhase0s = ['risk_primary_low', 'risk_primary_moderate', 'risk_primary_high', 'risk_fh_primary'];
  if (hasAscvd && primaryPhase0s.includes(phase0Cat)) {
    const ascvdDrivers = ASCVD_IDS.filter((id) => modifiers.includes(id))
      .map((id) => ({ cm_ascvd: 'ASCVD', cm_cad: 'CAD', cm_acs_12mo: 'ACS<12M', cm_stroke: '脳梗塞', cm_non_card_stroke: '非心原性脳梗塞', cm_pad: 'PAD' }[id]))
      .filter(Boolean)
      .join('/');
    const suggestedCat = hasVeryHigh || requiresFH ? (requiresFH ? 'risk_fh_secondary' : 'risk_very_high') : 'risk_secondary';
    return {
      type: 'phase0_ascvd_inconsistency',
      label: `⚠ Phase 0 が一次予防だが ${ascvdDrivers} 既往あり`,
      detail: `ASCVD既往は二次予防（LDL <100）、DM/FH/ACS/非心原性脳梗塞併存なら超高リスク（<70）。Phase 0 を「${PHASE0_CATEGORY_LABELS[suggestedCat]}」へ修正を検討`,
      severity: 'critical',
    };
  }

  // 二次予防選択だが超高リスク条件（DM/FH/ACS/非心原性脳梗塞）併存
  if (phase0Cat === 'risk_secondary' && (hasVeryHigh || requiresFH)) {
    const suggestedCat = requiresFH ? 'risk_fh_secondary' : 'risk_very_high';
    return {
      type: 'phase0_very_high_upgrade',
      label: '⚠ Phase 0 を超高リスクへアップグレード検討',
      detail: `二次予防選択ですが DM/FH/ACS/非心原性脳梗塞 併存で超高リスク相当（LDL <70）。「${PHASE0_CATEGORY_LABELS[suggestedCat]}」へ修正推奨`,
      severity: 'critical',
    };
  }

  // DM/CKD/PAD 併存だが Phase 0 が低-中リスク
  if (hasHighPrimary && (phase0Cat === 'risk_primary_low' || phase0Cat === 'risk_primary_moderate')) {
    const drivers = HIGH_PRIMARY_IDS.filter((id) => modifiers.includes(id))
      .map((id) => ({ cm_dm: 'DM', cm_ckd: 'CKD', cm_ckd_g45: 'CKD G4-5', cm_pad: 'PAD', cm_multi_ascvd_lesion: '多発病変' }[id]))
      .filter(Boolean)
      .join('/');
    return {
      type: 'phase0_high_primary_inconsistency',
      label: `⚠ ${drivers} 併存だがリスク層別が低-中リスク`,
      detail: 'DM/CKD/PAD/多発病変があれば一次予防・高リスク（LDL <120）以上。Phase 0 を「一次予防・高リスク」へ修正を検討',
    };
  }

  return null;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs, metricValues */ }) {
  const alerts = [];
  const mods = modifiers || [];

  // Phase 0 不整合を最優先で表示
  const phase0Issue = detectPhase0Inconsistency(mods);
  if (phase0Issue) alerts.push(phase0Issue);

  const hasStatin = currentClasses.has('スタチン');
  const hasFibrate = currentClasses.has('フィブラート');

  // CYP3A4阻害薬 + アトルバ/シンバ
  const hasAtorvaOrSimva = currentDrugs.some((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    return id === 'stat_atorva' || id === 'stat_simva';
  });
  if (hasAtorvaOrSimva && mods.includes('cm_cyp3a4_inhibitor_use')) {
    alerts.push({
      type: 'statin_cyp3a4',
      label: '⚠ スタチン + CYP3A4阻害薬: 横紋筋融解症リスク',
      detail: 'アトル/シンバは CYP3A4 代謝。クラリス・イトラコナゾール・グレープフルーツ・シクロスポリン併用で血中濃度3-10倍。プラバ・ピタバ・ロスバへ切替',
      severity: 'critical',
    });
  }

  // スタチン + フィブラート (ペマ以外)
  const hasNonPemaFibrate = currentDrugs.some((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    return id === 'fib_feno' || id === 'fib_beza';
  });
  if (hasStatin && hasNonPemaFibrate) {
    alerts.push({
      type: 'statin_fibrate_non_pema',
      label: 'スタチン + フィブラート（ペマ以外）併用',
      detail: '横紋筋融解症・筋症状リスク増。ペマフィブラート（SPPARMα）への変更が安全。CK・eGFR定期モニタ',
    });
  }

  // ACS<12ヶ月 + スタチン使用なし / 低強度
  if (mods.includes('cm_acs_12mo') && !mods.includes('cm_high_intensity_statin_used')) {
    alerts.push({
      type: 'acs_need_high_statin',
      label: '⚠ ACS発症12ヶ月以内: 高強度スタチン推奨',
      detail: 'LDL <70 目標（可能なら <55）。ロスバスタチン 5-10mg or アトルバスタチン 20mg 以上へ',
      severity: 'critical',
    });
  }

  // 妊娠 + スタチン/フィブラート
  if (mods.includes('co_pregnancy') && (hasStatin || hasFibrate)) {
    alerts.push({
      type: 'preg_statin',
      label: '⚠ 妊娠 + スタチン/フィブラート: 即中止',
      detail: 'スタチンは Pregnancy Category X。フィブラートも禁忌。即中止し、必要時はコレスチミド単独で経過観察',
      severity: 'critical',
    });
  }

  // 挙児希望 + スタチン
  if (mods.includes('co_pregnancy_planning') && hasStatin) {
    alerts.push({
      type: 'preg_plan_statin',
      label: '挙児希望 + スタチン',
      detail: '受胎1-3ヶ月前にスタチン中止。TG重症時はω-3のみ継続可（データ限定的）',
    });
  }

  // FH カスケードスクリーニング
  if (mods.includes('cm_fh') || mods.includes('cm_fh_homo') || mods.includes('cm_fh_suspect')) {
    alerts.push({
      type: 'fh_cascade',
      label: 'FH家族スクリーニング推奨',
      detail: '一親等（親・兄弟姉妹・子）全員の空腹時脂質検査を推奨。小児は10歳前後で初回測定。HoFHでは就学前スクリーニング',
    });
  }

  // HoFH 専門医必須
  if (mods.includes('cm_fh_homo')) {
    alerts.push({
      type: 'fh_homo_specialist',
      label: '⚠ HoFH: 脂質専門医必須・自院単独管理不可',
      detail: 'HoFHは薬物療法単独では目標到達困難。LDLアフェレーシス・ロミタピド（専門医限定）・肝移植検討',
      severity: 'critical',
    });
  }

  // 続発性スクリーニング
  const secondaryMods = ['cm_hypothyroid_untreated', 'cm_nephrotic', 'cm_cushing', 'cm_cholestasis'];
  if (secondaryMods.some((m) => mods.includes(m))) {
    alerts.push({
      type: 'secondary_workup',
      label: '続発性脂質異常症スクリーニング推奨',
      detail: 'TSH・FT4 + 尿蛋白(UACR) + 肝機能(ALP・γGT) + 朝コルチゾール + 腎機能。異常あれば該当科紹介、原疾患治療で脂質正常化の可能性',
    });
  }

  // 新規DM発症 + スタチン継続
  if (mods.includes('se_new_onset_dm') && hasStatin) {
    alerts.push({
      type: 'new_dm_on_statin',
      label: '新規DM発症: スタチン継続 + HbA1c管理',
      detail: 'スタチンのCV benefit > 新規DMリスク。HbA1cで管理しつつスタチン継続。高強度→中強度への減量は二次選択（LDL目標と天秤）',
    });
  }

  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  // ASCVD・FH・ACS・DM+CKD 併存時は early intervention 優先、WATCH 抑制
  return [
    'cm_ascvd', 'cm_cad', 'cm_acs_12mo', 'cm_stroke', 'cm_non_card_stroke',
    'cm_fh', 'cm_fh_homo', 'cm_fh_suspect',
    'cm_pad', 'rf_pancreatitis_risk', 'cm_severe_hypertg',
  ].some((m) => modifiers.includes(m));
}

export function getCurrentClasses(currentDrugs, allDrugs) {
  const classes = new Set();
  currentDrugs.forEach((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
  });
  return classes;
}

function drugRegimenLabel(currentDrugs, allDrugs) {
  return currentDrugs
    .map((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const d = allDrugs.find((x) => x.id === id);
      if (!d) return id;
      if (typeof entry === 'object' && d.doses) {
        const doseLabel = d.doses.find((x) => x.value === entry.dose)?.label || '';
        return doseLabel ? `${d.label} ${doseLabel}` : d.label;
      }
      return d.label;
    })
    .join(' + ');
}

export function synthesizeMaintainRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  const hasFH = ['cm_fh', 'cm_fh_homo', 'cm_fh_suspect'].some((m) => modifiers.includes(m));
  const hasAscvd = hasAscvdHistory(modifiers);
  const hasHighStatin = modifiers.includes('cm_high_intensity_statin_used');

  let note =
    '脂質は季節・食事・運動で変動する。3-6ヶ月ごとに測定し、トレンドで評価。生活習慣（食事・運動・禁煙）の継続も重要';
  let reassess = '3-6ヶ月毎にLDL・AST/ALT・（ハイ強度時）CK・HbA1c';

  if (hasFH) {
    note = 'FHでは家族スクリーニング（一親等全員）を継続フォロー。LDL達成50%以上が治療応答指標';
    reassess = '3ヶ月毎にLDL、1年毎に家族歴更新・スクリーニング';
  } else if (hasAscvd) {
    note = 'ASCVD二次予防は厳格目標維持。生活習慣+アドヒアランス確認を毎回';
    reassess = '3ヶ月毎にLDL・AST/ALT、CK症状問診';
  } else if (hasHighStatin) {
    note = 'ハイ強度スタチン使用中。新規DM・筋症状・肝機能を定期モニタ';
    reassess = '12週後CK・AST/ALT、1年後HbA1c（新規DMスクリーニング）';
  }

  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（目標内）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '現行の食事・運動療法を継続',
    reason:
      'LDL-Cが目標範囲内（目標+5 mg/dL以内の測定誤差許容範囲含む）。不要な薬剤変更はアドヒアランス低下・副作用リスク',
    reassess,
    note,
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '経過観察 + 生活指導強化',
    example: drugLabels
      ? `現行処方を継続: ${drugLabels}。食事（飽和脂肪酸<7%E、コレステロール<200mg/日）+ 運動150分/週 + 体重管理`
      : '食事療法（DASH/地中海食）+ 運動150分/週 + 禁煙 + 減量5-10%',
    reason:
      'LDL-Cが目標をわずかに超過（+5〜+20 mg/dL）。測定誤差・食事の影響の可能性。単回値で強化せず生活指導強化+3ヶ月後再評価が妥当',
    reassess: '3ヶ月後にLDL再評価。生活指導遵守を確認。改善なければSTEP UP',
    note: 'LDLは測定間変動あり。空腹採血の条件・直前の食事・体調も考慮。服薬遵守の問診も重要',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    stat_prava: ['se_myalgia', 'se_alt_ast_moderate', 'se_ck_moderate'],
    stat_simva: ['se_myalgia', 'se_ck_moderate', 'cm_cyp3a4_inhibitor_use'],
    stat_fluva: ['se_myalgia', 'se_ck_moderate'],
    stat_atorva: ['se_myalgia', 'se_ck_moderate', 'se_new_onset_dm', 'cm_cyp3a4_inhibitor_use', 'cm_ckd_g45'],
    stat_pitava: ['se_myalgia', 'se_ck_moderate'],
    stat_rosuva: ['se_myalgia', 'se_ck_moderate', 'se_new_onset_dm', 'cm_ckd_g45'],
    fib_pema: ['se_gallstone'],
    fib_feno: ['cm_ckd', 'cm_ckd_g45', 'se_gallstone'],
    fib_beza: ['cm_ckd', 'cm_ckd_g45', 'se_gallstone'],
    ezt: ['se_myalgia'],
  };
  const forbiddenMap = {
    stat_prava: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis'],
    stat_simva: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis', 'cm_cyp3a4_inhibitor_use'],
    stat_fluva: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis'],
    stat_atorva: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis', 'cm_cyp3a4_inhibitor_use'],
    stat_pitava: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis'],
    stat_rosuva: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active', 'se_rhabdomyolysis'],
    fib_pema: ['co_pregnancy', 'cm_gallstone', 'cm_child_pugh_c'],
    fib_feno: ['co_pregnancy', 'cm_ckd_g45', 'cm_gallstone', 'cm_child_pugh_c'],
    fib_beza: ['co_pregnancy', 'cm_ckd_g45', 'cm_gallstone', 'cm_child_pugh_c'],
    ezt: ['co_pregnancy', 'co_lactation'],
  };

  const headroom = [];
  currentDrugs.forEach((entry) => {
    if (typeof entry === 'string') return;
    const drug = allDrugs.find((d) => d.id === entry.id);
    if (!drug?.doses) return;
    const idx = drug.doses.findIndex((x) => x.value === entry.dose);
    if (idx < 0 || idx >= drug.doses.length - 1) return;
    headroom.push({ drug, currentDose: drug.doses[idx], nextDose: drug.doses[idx + 1] });
  });

  return headroom.map(({ drug, currentDose, nextDose }) => ({
    id: `_dose_up_${drug.id}`,
    action: 'DOSE_UP',
    drug: `${drug.label}を${nextDose.label}へ増量`,
    example: `${drug.label} ${nextDose.label}（現用量 ${currentDose.label} から増量）`,
    reason:
      '現用量で目標未達。同一薬剤の増量は新薬追加よりアドヒアランス・コストの面で優先される第一手',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '6-12週後にLDL・AST/ALT・（ハイ強度時）CK・症状問診',
    _isDoseUp: true,
    _drugClass: drug.class,
  }));
}

/* -------------------------------------------------------- */
/*  RECOMMENDATIONS                                         */
/* -------------------------------------------------------- */
export const RECOMMENDATIONS = [
  // === NAIVE ===
  {
    id: 'naive_lifestyle_first',
    action: 'WATCH',
    drug: '生活習慣改善を1-3ヶ月（薬物療法前）',
    example: 'DASH食 or 地中海食、飽和脂肪酸<7%E、コレステロール<200mg/日、運動150分/週、減量5-10%、禁煙',
    reason: 'JAS2022: 低・中リスク一次予防は生活習慣改善を1-3ヶ月先行。薬物療法前に効果確認',
    fromStates: ['naive'],
    forbidden: [
      'co_pregnancy', 'cm_fh', 'cm_fh_homo', 'cm_fh_suspect', 'cm_acs_12mo',
      'cm_ascvd', 'cm_cad', 'cm_stroke', 'cm_pad', 'cm_dm', 'cm_ckd_g45',
      'cm_severe_hypertg', 'rf_pancreatitis_risk', 'cm_ldl_very_high',
      // Phase 0: 高リスク・二次予防・FH は生活習慣のみ不可
      'risk_primary_high', 'risk_secondary', 'risk_very_high', 'risk_fh_primary', 'risk_fh_secondary',
    ],
    reassess: '3ヶ月後にLDL再評価。改善なければSTEP 1薬物療法',
    note: '高リスク併存・FH・ASCVD既往・TG≥500・LDL≥180 では生活習慣先行せず即薬物療法',
  },

  // === STEP 1 ===
  {
    id: 'start_statin_low_primary',
    action: 'STEP_UP',
    drug: 'プラバスタチン開始（低強度・一次予防低〜中リスク）',
    example: 'メバロチン錠10mg 1回1錠 1日1回',
    reason: '一次予防 低〜中リスクでは低強度スタチン。CYP非依存で相互作用少、CKD・高齢で有利',
    fromStates: ['naive'],
    drugClass: 'スタチン',
    preferredWhen: ['cm_primary_moderate_risk', 'risk_primary_low', 'risk_primary_moderate'],
    avoidWhen: ['cm_fh', 'cm_fh_suspect', 'cm_ascvd', 'risk_primary_high', 'risk_secondary', 'risk_very_high', 'risk_fh_primary', 'risk_fh_secondary'],
    forbidden: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active'],
    reassess: '4-8週後 AST/ALT + CK (必要時)、12週後 LDL',
  },
  {
    id: 'start_statin_moderate_primary_high_risk',
    action: 'STEP_UP',
    drug: 'ピタバスタチン2mg or アトルバスタチン10mg（中強度・一次予防高リスク）',
    example: 'リバロ錠2mg 1日1回、または リピトール錠10mg 1日1回',
    reason: '一次予防高リスク（DM・CKD・PAD併存）では中強度スタチン',
    fromStates: ['naive'],
    drugClass: 'スタチン',
    preferredWhen: ['cm_dm', 'cm_ckd', 'cm_pad', 'cm_multi_ascvd_lesion', 'risk_primary_high'],
    forbidden: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active'],
    reassess: '12週後 LDL・AST/ALT',
    note: 'ピタバはDM発症リスク低めの報告。アトルバはCYP3A4阻害薬併用で注意',
  },
  {
    id: 'start_statin_high_secondary',
    action: 'STEP_UP',
    drug: 'ロスバスタチン開始（高強度・二次予防/超高リスク）',
    example: 'クレストール錠2.5mg 1日1回（日本人は低用量開始→5-10mgへ漸増）',
    reason: 'ASCVD既往・ACS<12ヶ月は高強度スタチンでLDL<70目標',
    fromStates: ['naive'],
    drugClass: 'スタチン',
    preferredWhen: ['cm_ascvd', 'cm_cad', 'cm_acs_12mo', 'cm_non_card_stroke', 'risk_secondary', 'risk_very_high'],
    urgentWhen: ['cm_acs_12mo'],
    forbidden: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active'],
    reassess: '6-8週後に LDL・AST/ALT・CK、以後12週毎',
    note: '日本人はアジア人薬物動態考慮で低用量開始。反応見て5-10mgへ漸増',
  },
  {
    id: 'start_statin_high_fh',
    action: 'STEP_UP',
    drug: 'FH: 高強度スタチン即時開始（+ エゼチミブ併用検討）',
    example: 'ロスバスタチン5-10mg or アトルバスタチン10-20mg 1日1回（LDL 50%低下が応答指標）',
    reason: 'JAS-FH GL: 診断時点で高強度スタチン。エゼチミブ併用を前提に開始可',
    fromStates: ['naive'],
    drugClass: 'スタチン',
    urgentWhen: ['cm_fh', 'cm_fh_suspect', 'cm_fh_homo', 'risk_fh_primary', 'risk_fh_secondary'],
    preferredWhen: ['cm_fh', 'cm_fh_suspect', 'cm_xanthoma', 'cm_early_cv_family_hx', 'cm_ldl_very_high', 'risk_fh_primary', 'risk_fh_secondary'],
    forbidden: ['co_pregnancy', 'co_lactation', 'cm_liver_severe', 'cm_hepatitis_active'],
    reassess: '6-8週後 LDL（50%低下確認）、AST/ALT・CK',
    note: 'FHは初期から併用療法を想定。LDL目標未達なら3ヶ月以内にエゼチミブ追加',
  },
  {
    id: 'start_fibrate_severe_hypertg',
    action: 'STEP_UP',
    drug: 'ペマフィブラート開始（TG≥500・膵炎予防）',
    example: 'パルモディア錠0.1mg 1回1錠 1日2回（朝夕食後）',
    reason: 'TG≥500は膵炎リスク。LDL管理より膵炎予防が優先、フィブラート第一選択',
    fromStates: ['naive', 'mono'],
    drugClass: 'フィブラート',
    urgentWhen: ['cm_severe_hypertg', 'rf_pancreatitis_risk'],
    preferredWhen: ['cm_severe_hypertg', 'rf_pancreatitis_risk'],
    forbidden: ['co_pregnancy', 'cm_gallstone', 'cm_child_pugh_c'],
    reassess: '4週後 TG・AST/ALT・CK・eGFR、初回は胆嚢エコー',
    note: 'ペマフィブラートは肝選択的排泄でeGFR低下でも比較的安全。フェノ/ベザはeGFR<30禁忌',
  },
  {
    id: 'start_epa_mild_tg',
    action: 'STEP_UP',
    drug: 'イコサペント酸エチル（EPA）開始（軽度TG・CV risk）',
    example: 'エパデール S 900mg×2/日 食直後',
    reason: 'JELIS: EPA 1800mg/日で非致死性冠イベント19%低下。軽度TG・スタチン忌避・高齢者に安全',
    fromStates: ['naive'],
    drugClass: 'オメガ-3',
    preferredWhen: ['cm_tg_mild', 'cm_mixed_dyslipidemia', 'cm_ascvd'],
    avoidWhen: ['co_warfarin_use'],
    forbidden: ['co_pregnancy'],
    note: 'LDL低下は弱い。スタチンに上乗せも可。出血傾向例は注意',
  },

  // === STEP 2 (mono → dual) ===
  {
    id: 'mono_add_ezetimibe',
    action: 'ADD',
    drug: 'エゼチミブ追加（スタチン単剤でLDL未達）',
    example: '現行スタチン継続 + ゼチーア錠10mg 1日1回',
    reason: 'スタチン+エゼチミブ併用でLDL追加18-25%低下。相互作用少、保険適応あり',
    fromStates: ['mono'],
    drugClass: 'エゼチミブ',
    preferredWhen: ['cm_ldl_unmet', 'cm_statin_intolerance', 'cm_fh', 'cm_ascvd', 'risk_secondary', 'risk_very_high', 'risk_fh_primary', 'risk_fh_secondary'],
    forbidden: ['co_pregnancy', 'co_lactation'],
    reassess: '6週後 LDL・AST/ALT',
  },
  {
    id: 'mono_add_fibrate_tg',
    action: 'ADD',
    drug: 'ペマフィブラート追加（TG残存・スタチン単剤）',
    example: '現行スタチン継続 + パルモディア 0.1mg×2/日',
    reason: 'スタチン下でTG残存（200-500）、特に混合型。ペマは筋症状・腎機能影響少',
    fromStates: ['mono'],
    drugClass: 'フィブラート',
    preferredWhen: ['cm_tg_residual', 'cm_mixed_dyslipidemia'],
    forbidden: ['co_pregnancy', 'cm_gallstone', 'cm_child_pugh_c'],
    note: 'フェノ/ベザ+高用量スタチン併用は横紋筋融解症リスク。ペマへ。CK・肝機能モニタ',
    reassess: '4週後 CK・AST/ALT、8週後 TG',
  },
  {
    id: 'mono_add_epa_secondary',
    action: 'ADD',
    drug: 'EPA追加（二次予防・CV event抑制）',
    example: '現行スタチン継続 + エパデール S 900mg×2/日',
    reason: 'JELIS: EPA追加で冠イベント19%低下。二次予防+TG残存で有用',
    fromStates: ['mono'],
    drugClass: 'オメガ-3',
    preferredWhen: ['cm_ascvd', 'cm_cad', 'cm_tg_residual', 'risk_secondary', 'risk_very_high', 'risk_fh_secondary'],
    avoidWhen: ['co_warfarin_use'],
    forbidden: ['co_pregnancy'],
  },
  {
    id: 'switch_statin_cyp3a4_interaction',
    action: 'SWITCH',
    drug: 'アトルバ/シンバ → プラバ・ピタバ・ロスバへ変更（CYP3A4相互作用）',
    example: 'アトルバスタチン中止 → プラバスタチン10mg or ピタバスタチン2mg',
    reason: 'CYP3A4阻害薬併用で血中濃度上昇 → 横紋筋融解症リスク。CYP非依存スタチンへ',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_cyp3a4_inhibitor_use'],
    forbidden: ['co_pregnancy'],
    note: 'プラバスタチン（水溶性・CYP非依存）・ピタバ（OATP基質、CYP関与少）・ロスバがCYP非依存',
  },
  {
    id: 'switch_fibrate_to_pema_ckd',
    action: 'SWITCH',
    drug: 'フェノ/ベザ → ペマフィブラートへ変更（CKD進行）',
    example: 'リピディル中止 → パルモディア 0.1mg×2/日',
    reason: 'eGFR<30でフェノ/ベザ禁忌。ペマは肝選択的でCKDに安全',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_ckd', 'cm_ckd_g45'],
    targetClass: 'フィブラート',
    forbidden: ['co_pregnancy', 'cm_gallstone'],
  },

  // === STEP 3 (dual → triple) ===
  {
    id: 'dual_add_pcsk9_fh_or_resistant',
    action: 'ADD',
    drug: 'PCSK9阻害薬追加（FH or ASCVD+LDL高度未達）',
    example: 'レパーサ 420mg 月1回SC、または プラルエント 75mg 2週1回SC',
    reason: 'スタチン+エゼチミブでもLDL未達のFH or ASCVD二次予防。追加40-60%低下',
    fromStates: ['dual'],
    drugClass: 'PCSK9i',
    preferredWhen: ['cm_fh', 'cm_fh_homo', 'cm_ldl_very_unmet', 'risk_fh_primary', 'risk_fh_secondary'],
    forbidden: ['co_pregnancy', 'co_high_cost_barrier'],
    specialistGate: true,
    note: '保険適応: FH または スタチン+エゼチミブで未達の心血管高リスク。月3-6万円（3割負担で約1-2万円）',
    reassess: '3ヶ月後LDL、毎回注射部位確認',
  },
  {
    id: 'dual_add_fibrate_tg_residual',
    action: 'ADD',
    drug: 'ペマフィブラート追加（dual状態でTG残存）',
    fromStates: ['dual'],
    drugClass: 'フィブラート',
    preferredWhen: ['cm_tg_residual'],
    forbidden: ['co_pregnancy', 'cm_gallstone', 'cm_child_pugh_c'],
  },

  // === SWITCH (side effect driven) ===
  {
    id: 'switch_statin_myalgia_to_weaker',
    action: 'SWITCH',
    drug: 'SAMS → 低強度スタチン or 間欠投与',
    example: 'ロスバスタチン 5mg週1回→隔日→連日、または プラバスタチン10mgへ切替',
    reason: '再チャレンジ戦略でSAMS（statin-associated muscle symptoms）を克服',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_myalgia', 'se_sams_suspected', 'fh_statin_myalgia'],
    targetClass: 'スタチン',
    note: 'プラバ・フルバは筋毒性最低。目標未達ならエゼチミブ追加',
    reassess: '6週後 LDL・症状・CK',
  },
  {
    id: 'switch_statin_to_ezetimibe_intolerance',
    action: 'SWITCH',
    drug: 'スタチン完全不耐 → エゼチミブ単剤（± PCSK9i）',
    example: '全スタチン中止 → エゼチミブ10mg。目標未達ならPCSK9i併用',
    reason: '2種以上のスタチン再チャレンジ失敗 = SAMS確定。非スタチン戦略へ',
    fromStates: ['mono'],
    triggerSideEffects: ['se_sams_suspected', 'fh_statin_myalgia'],
    preferredWhen: ['cm_statin_intolerance'],
    targetClass: 'エゼチミブ',
    note: 'LDL低下効果はスタチンより弱い。高リスク群で目標未達ならPCSK9i追加',
  },
  {
    id: 'switch_statin_to_pitava_new_dm',
    action: 'SWITCH',
    drug: 'ロスバ/アトルバ → ピタバスタチン（新規DM懸念）',
    example: 'クレストール中止 → リバロ 2mg',
    reason: '新規DM発症報告あるスタチンから、DM発症リスク低めのピタバへ',
    fromStates: ['mono', 'dual'],
    triggerSideEffects: ['se_new_onset_dm'],
    targetClass: 'スタチン',
    note: 'スタチンのCV benefit > 新規DMリスク。症状・ASCVD高リスクで継続優先の判断もあり',
  },

  // === TAPER / STOP ===
  {
    id: 'taper_statin_frail_elderly_primary',
    action: 'TAPER',
    drug: 'フレイル高齢者×一次予防 → 減量・中止検討',
    reason: '余命限定・ポリファーマシーの一次予防では中止が妥当な場合あり',
    fromStates: ['mono', 'dual'],
    requiresAny: ['co_stable_6mo'],
    preferredWhen: ['co_elderly_fragile', 'co_polyp', 'co_frail'],
    avoidWhen: ['cm_ascvd', 'cm_cad', 'cm_acs_12mo', 'cm_stroke', 'cm_non_card_stroke'],
    note: '二次予防では原則継続。ALLHAT-LLT・PREVENTABLE参照',
  },
  {
    id: 'stop_statin_rhabdo',
    action: 'STOP',
    drug: 'スタチン即時中止（横紋筋融解症）',
    reason: '横紋筋融解症は緊急対応',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['se_rhabdomyolysis'],
    note: '即中止、輸液、CK・電解質・腎機能・ミオグロビン尿確認、必要なら入院。誘発薬（CYP3A4阻害薬・フィブラート）中止',
    reassess: '退院後3ヶ月は再開せず、非スタチン戦略（エゼチミブ→PCSK9i）へ',
  },
  {
    id: 'stop_statin_liver_severe',
    action: 'STOP',
    drug: 'スタチン中止（重度肝機能障害）',
    reason: 'AST/ALT ≥3×ULN or 黄疸。他原因除外（ウイルス性肝炎・脂肪肝・胆道）',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['se_liver_jaundice'],
    preferredWhen: ['se_alt_ast_severe', 'se_liver_jaundice'],
    reassess: '中止2-4週後 AST/ALT再検。正常化後、低強度スタチン or エゼチミブで再開検討',
  },
  {
    id: 'stop_statin_pregnancy',
    action: 'STOP',
    drug: '全スタチン即中止（妊娠 / 挙児希望）',
    example: '全スタチン中止。必要時はコレスチミド単剤で経過観察',
    reason: 'スタチンは Pregnancy Category X。フィブラートも禁忌',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['co_pregnancy'],
    preferredWhen: ['co_pregnancy', 'co_pregnancy_planning'],
    note: '挙児希望は受胎1-3ヶ月前に中止。TG重症時はω-3検討（データ限定）',
  },

  // === WATCH / REFER ===
  {
    id: 'screen_hypothyroid',
    action: 'WATCH',
    drug: 'TSH・FT4 測定 → 甲状腺機能低下症除外',
    example: 'TSH・FT4測定 → 甲状腺ホルモン補充 → 3ヶ月後LDL再評価',
    reason: 'TSH≥10 はLDLを moderate primary 相当に押し上げる。正常化のみでLDL改善例あり',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['cm_hypothyroid_untreated'],
    reassess: '3ヶ月後にLDL再評価',
  },
  {
    id: 'refer_fh_specialist',
    action: 'REFER',
    drug: '脂質専門医紹介（FH / HoFH）',
    reason: 'カスケードスクリーニング指導・遺伝学的検査・LDLアフェレーシス/ロミタピド適応判断',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['cm_fh_homo', 'cm_fh_suspect', 'risk_fh_primary', 'risk_fh_secondary'],
    preferredWhen: ['cm_fh', 'cm_fh_homo', 'risk_fh_primary', 'risk_fh_secondary'],
    note: 'HoFHは全例必須。HeFHは治療抵抗性・若年CV発症例で',
  },
  {
    id: 'refer_pediatric_fh',
    action: 'REFER',
    drug: '小児 FH → 小児科 / 小児脂質外来',
    reason: '小児HeFHは10歳前後から薬物療法検討。HoFHは就学前開始',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['co_pediatric', 'cm_fh', 'cm_fh_homo'],
  },
  {
    id: 'refer_nephrotic',
    action: 'REFER',
    drug: '腎臓内科紹介（ネフローゼ症候群）',
    reason: '原疾患治療優先。寛解で脂質も改善',
    fromStates: ['naive', 'mono'],
    urgentWhen: ['cm_nephrotic'],
    preferredWhen: ['cm_nephrotic'],
  },
  {
    id: 'refer_hepatic_severe',
    action: 'REFER',
    drug: '脂質専門医 / 消化器内科紹介（重度肝障害）',
    reason: 'Child-Pugh C・活動性肝炎ではスタチン回避。エゼチミブ+コレスチミド検討',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    preferredWhen: ['cm_child_pugh_c', 'cm_hepatitis_active'],
    urgentWhen: ['cm_hepatitis_active'],
  },
  {
    id: 'refer_pcsk9_specialist',
    action: 'REFER',
    drug: 'PCSK9阻害薬導入目的で専門医紹介',
    reason: '皮下注・保険審査・高薬価。専門医で適応判定と導入管理',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['cm_fh', 'cm_fh_homo', 'cm_ldl_very_unmet'],
    note: '維持期は自己注射で逆紹介可',
  },
  {
    id: 'monitor_new_onset_dm',
    action: 'WATCH',
    drug: '新規DM → スタチン継続 + HbA1c管理',
    reason: 'スタチンCV benefit > 新規DMリスク（特にASCVD高リスク）。HbA1c管理で対応',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_new_onset_dm'],
    note: 'ピタバスタチンへの切替も検討（新規DMリスク低めの報告）',
    reassess: '3ヶ月毎 HbA1c',
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: '全スタチン',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】Pregnancy Category X。即中止。コレスチミドで経過観察',
  },
  {
    drug: '全スタチン',
    modifiers: ['co_lactation'],
    reason: '【禁忌】授乳中禁忌（母乳移行）',
  },
  {
    drug: '全スタチン',
    modifiers: ['cm_liver_severe', 'cm_hepatitis_active'],
    reason: '【禁忌】活動性肝疾患・Child-Pugh B以上',
  },
  {
    drug: 'スタチン（アトルバスタチン・シンバスタチン）',
    modifiers: ['cm_cyp3a4_inhibitor_use'],
    reason: '【禁忌級】CYP3A4阻害薬併用で横紋筋融解症リスク。プラバ・ピタバ・ロスバへ切替',
  },
  {
    drug: 'スタチン',
    modifiers: ['se_rhabdomyolysis'],
    reason: '【禁忌】横紋筋融解症既往。以後再開は非スタチン戦略（エゼチミブ・PCSK9i）優先',
  },
  {
    drug: 'フィブラート',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】妊娠中',
  },
  {
    drug: 'フィブラート',
    modifiers: ['cm_gallstone'],
    reason: '【相対禁忌】胆石形成助長',
  },
  {
    drug: 'フェノフィブラート / ベザフィブラート',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】eGFR<30。ペマフィブラートへ変更',
  },
  {
    drug: 'フィブラート（高用量）+ スタチン（高用量）',
    modifiers: ['cm_ckd', 'co_elderly_fragile'],
    reason: '【注意】横紋筋融解症リスク。ペマフィブラートが安全、CK・eGFR定期モニタ',
  },
  {
    drug: 'エゼチミブ',
    modifiers: ['co_pregnancy', 'co_lactation'],
    reason: '【禁忌】妊娠・授乳中',
  },
  {
    drug: 'PCSK9阻害薬',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】妊娠中（安全性未確立）',
  },
  {
    drug: 'ロミタピド（HoFH専用）',
    modifiers: [],
    reason: '【専門医限定】プライマリケアでの新規処方禁止。HoFH確定例のみ脂質専門医管理下',
  },
  {
    drug: 'スタチン + フェノ/ベザフィブラート（高用量）',
    modifiers: ['co_warfarin_use'],
    reason: '【警告】INR変動・横紋筋融解症リスク。頻回モニタ',
  },
  {
    drug: 'イコサペント酸エチル（EPA）',
    modifiers: ['co_warfarin_use'],
    reason: '【注意】出血傾向増強。INR・出血症状モニタ',
  },
];
