/**
 * Treatment Booster — 2型糖尿病 治療修正データ
 * JDS糖尿病診療ガイドライン2024 + JGS/JDS高齢者糖尿病診療ガイドライン2023 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // ビグアナイド
  { id: 'bg_met', label: 'メトホルミン（メトグルコ）', class: 'ビグアナイド',
    doses: [
      { value: '500', label: '250mg×2（開始）', isDefault: true },
      { value: '1000', label: '500mg×2（維持）' },
      { value: '1500', label: '500mg×3（標準維持）' },
      { value: '2250', label: '750mg×3（最大）', isMax: true },
    ] },

  // TZD
  { id: 'tzd_pio', label: 'ピオグリタゾン（アクトス）', class: 'TZD',
    doses: [
      { value: '15', label: '15mg', isDefault: true },
      { value: '30', label: '30mg', isMax: true },
    ] },

  // SGLT2i
  { id: 'sglt2_empa', label: 'エンパグリフロジン（ジャディアンス）', class: 'SGLT2i',
    doses: [
      { value: '10', label: '10mg', isDefault: true },
      { value: '25', label: '25mg', isMax: true },
    ] },
  { id: 'sglt2_dapa', label: 'ダパグリフロジン（フォシーガ）', class: 'SGLT2i',
    doses: [
      { value: '5', label: '5mg' },
      { value: '10', label: '10mg', isDefault: true, isMax: true },
    ] },
  { id: 'sglt2_cana', label: 'カナグリフロジン（カナグル）', class: 'SGLT2i',
    doses: [
      { value: '100', label: '100mg', isDefault: true, isMax: true },
    ] },

  // GLP-1RA
  { id: 'glp1_sema_inj', label: 'セマグルチド注（オゼンピック）', class: 'GLP-1RA',
    doses: [
      { value: '0.25', label: '0.25mg週1（導入）' },
      { value: '0.5', label: '0.5mg週1（標準）', isDefault: true },
      { value: '1.0', label: '1.0mg週1（増量）' },
      { value: '2.0', label: '2.0mg週1（最大）', isMax: true },
    ] },
  { id: 'glp1_sema_oral', label: 'セマグルチド経口（リベルサス）', class: 'GLP-1RA',
    doses: [
      { value: '3', label: '3mg（導入）' },
      { value: '7', label: '7mg（標準）', isDefault: true },
      { value: '14', label: '14mg（最大）', isMax: true },
    ] },
  { id: 'glp1_dula', label: 'デュラグルチド（トルリシティ）', class: 'GLP-1RA',
    doses: [
      { value: '0.75', label: '0.75mg週1', isDefault: true, isMax: true },
    ] },

  // DPP-4i
  { id: 'dpp4_sita', label: 'シタグリプチン（ジャヌビア）', class: 'DPP-4i',
    doses: [
      { value: '50', label: '50mg', isDefault: true },
      { value: '100', label: '100mg', isMax: true },
    ] },
  { id: 'dpp4_lina', label: 'リナグリプチン（トラゼンタ）', class: 'DPP-4i',
    doses: [
      { value: '5', label: '5mg', isDefault: true, isMax: true },
    ] },
  { id: 'dpp4_tene', label: 'テネリグリプチン（テネリア）', class: 'DPP-4i',
    doses: [
      { value: '20', label: '20mg', isDefault: true },
      { value: '40', label: '40mg', isMax: true },
    ] },

  // SU
  { id: 'su_gli', label: 'グリメピリド（アマリール）', class: 'SU',
    doses: [
      { value: '0.5', label: '0.5mg', isDefault: true },
      { value: '1', label: '1mg' },
      { value: '3', label: '3mg', isMax: true },
    ] },

  // グリニド
  { id: 'glin_miti', label: 'ミチグリニド（グルファスト）', class: 'グリニド',
    doses: [{ value: '10', label: '10mg毎食直前', isDefault: true, isMax: true }] },
  { id: 'glin_repa', label: 'レパグリニド（シュアポスト）', class: 'グリニド',
    doses: [
      { value: '0.25', label: '0.25mg毎食直前', isDefault: true },
      { value: '0.5', label: '0.5mg毎食直前', isMax: true },
    ] },

  // α-GI
  { id: 'agi_vog', label: 'ボグリボース（ベイスン）', class: 'α-GI',
    doses: [
      { value: '0.2', label: '0.2mg毎食直前', isDefault: true },
      { value: '0.3', label: '0.3mg毎食直前', isMax: true },
    ] },

  // インスリン (basal)
  { id: 'ins_glarU300', label: 'グラルギンU300（ランタスXR）', class: 'インスリン(basal)',
    doses: [
      { value: '10', label: '10U 就寝前', isDefault: true },
      { value: '14', label: '14U' },
      { value: '20', label: '20U以上', isMax: true },
    ] },
  { id: 'ins_deg', label: 'デグルデク（トレシーバ）', class: 'インスリン(basal)',
    doses: [
      { value: '10', label: '10U', isDefault: true },
      { value: '14', label: '14U' },
      { value: '20', label: '20U以上', isMax: true },
    ] },

  // インスリン (rapid/prandial)
  { id: 'ins_asp', label: 'アスパルト（ノボラピッド）', class: 'インスリン(rapid)',
    doses: [
      { value: '4', label: '4U食直前', isDefault: true },
      { value: '6', label: '6U食直前' },
      { value: '8', label: '8U以上', isMax: true },
    ] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_hypo_mild', label: '軽度低血糖（自覚可能）', cat: '副作用' },
  { id: 'se_hypo_frequent', label: '頻回低血糖（週数回以上）', cat: '副作用' },
  { id: 'se_hypo_unaware', label: '無自覚性低血糖', cat: '副作用', severity: 'critical' },
  { id: 'se_gi_met', label: 'メトホルミンによる消化器症状', cat: '副作用' },
  { id: 'se_nausea_glp1', label: 'GLP-1RAによる悪心・嘔吐', cat: '副作用' },
  { id: 'se_edema', label: '浮腫（TZD由来）', cat: '副作用' },
  { id: 'se_weight_gain', label: '体重増加（SU/インスリン由来）', cat: '副作用' },
  { id: 'se_weight_loss_excess', label: '体重減少過剰・サルコペニア', cat: '副作用' },
  { id: 'se_genital_infection', label: '性器感染症（SGLT2i）', cat: '副作用' },
  { id: 'se_uti', label: '尿路感染症（SGLT2i）', cat: '副作用' },
  { id: 'se_dehydration', label: '脱水・起立性低血圧', cat: '副作用' },
  { id: 'se_dka', label: 'DKA / euglycemic DKA', cat: '副作用', severity: 'critical' },
  { id: 'se_pemphigoid', label: '類天疱瘡（DPP-4i関連）', cat: '副作用', severity: 'critical' },
  { id: 'se_pancreatitis', label: '急性膵炎', cat: '副作用', severity: 'critical' },
  { id: 'se_lactic_acidosis', label: '乳酸アシドーシス', cat: '副作用', severity: 'critical' },

  // 併存疾患
  { id: 'cm_hf', label: '心不全 (HFrEF/HFpEF)', cat: '併存疾患' },
  { id: 'cm_hfref', label: 'HFrEF (LVEF<40%)', cat: '併存疾患' },
  { id: 'cm_ascvd', label: 'ASCVD (冠動脈疾患/脳梗塞既往)', cat: '併存疾患' },
  { id: 'cm_post_mi', label: '心筋梗塞後', cat: '併存疾患' },
  { id: 'cm_stroke', label: '脳卒中既往', cat: '併存疾患' },
  { id: 'cm_ckd', label: 'CKD (eGFR 30-59)', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5 (eGFR<30)', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_proteinuria', label: '蛋白尿（UACR≥30 or 0.15g/gCr以上）', cat: '併存疾患' },
  { id: 'cm_t1dm', label: '1型糖尿病', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_pancreatogenous_dm', label: '膵性糖尿病 (3c型)', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_pancreatitis_hx', label: '膵炎既往', cat: '併存疾患' },
  { id: 'cm_mtc_family_hx', label: 'MTC既往・MEN2家族歴', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_gastroparesis', label: '胃不全麻痺・重度胃腸障害', cat: '併存疾患' },
  { id: 'cm_liver_severe', label: '肝機能障害 Child-Pugh B以上', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_bladder_ca', label: '膀胱癌既往・治療中', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_steroid_use', label: 'ステロイド常用中', cat: '併存疾患' },
  { id: 'cm_pad_severe', label: '重症PAD・下肢潰瘍既往', cat: '併存疾患' },
  { id: 'cm_dementia', label: '認知症（服薬管理困難）', cat: '併存疾患' },
  { id: 'cm_osteoporosis', label: '骨粗鬆症', cat: '併存疾患' },
  { id: 'cm_postprandial_dominant', label: '食後高血糖優位', cat: '併存疾患' },
  { id: 'cm_nash', label: 'NASH / NAFLD', cat: '併存疾患' },
  { id: 'cm_liver_compensated', label: '肝硬変 代償期（Child-Pugh A）', cat: '併存疾患' },
  { id: 'cm_post_gastrectomy', label: '胃切除後（吸収不良/低栄養/dumping）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_underweight', label: '低栄養（BMI<18.5 / Alb<3.5）', cat: '併存疾患' },
  { id: 'cm_gdm', label: '妊娠糖尿病（GDM）', cat: '併存疾患', severity: 'critical' },

  // 制約（高齢者カテゴリーはJGS/JDS2023準拠、3択排他選択）
  { id: 'co_elderly_cat1', label: '高齢者Cat I（ADL自立・認知正常）', cat: '制約', radioGroup: 'dm_elderly_category' },
  { id: 'co_elderly_cat2', label: '高齢者Cat II（軽度認知障害/IADL低下）', cat: '制約', radioGroup: 'dm_elderly_category' },
  { id: 'co_elderly_cat3', label: '高齢者Cat III（中等度認知症・ADL低下）', cat: '制約', severity: 'critical', radioGroup: 'dm_elderly_category' },
  { id: 'co_frail', label: 'フレイル（転倒リスク高）', cat: '制約' },
  { id: 'co_hypo_drug_used', label: '低血糖リスク薬使用中（SU/グリニド/インスリン）', cat: '制約' },
  { id: 'co_hypo_risk', label: '低血糖リスク環境（独居/不規則食事/認知低下）', cat: '制約' },
  { id: 'co_obese', label: '肥満（BMI≥25）', cat: '制約' },
  { id: 'co_obese_severe', label: '高度肥満（BMI≥30）', cat: '制約' },
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_pregnancy_planning', label: '挙児希望（計画妊娠）', cat: '制約', severity: 'critical' },
  { id: 'co_reproductive_age', label: '妊娠可能年齢・避妊未確定', cat: '制約' },
  { id: 'co_sickday', label: 'シックデイ（発熱/嘔吐/下痢/食思不振）', cat: '制約', severity: 'critical' },
  { id: 'co_contrast_use', label: '造影剤使用予定/投与後48h以内', cat: '制約' },
  { id: 'co_surgery', label: '手術予定（3日以内）', cat: '制約' },
  { id: 'co_heavy_drinker', label: '多量飲酒・アルコール依存', cat: '制約' },
  { id: 'co_injection_refuse', label: '注射拒否', cat: '制約' },
  { id: 'co_irregular_meals', label: '食事時間不規則', cat: '制約' },
  { id: 'co_nsaid', label: 'NSAID常用（整形疾患等）', cat: '制約' },
  { id: 'co_cost', label: 'コスト負担（後発品希望）', cat: '制約' },
  { id: 'co_polyp', label: 'ポリファーマシー（5剤以上）', cat: '制約' },
  { id: 'co_stable_6mo', label: '6ヶ月以上HbA1c安定', cat: '制約' },

  // 失敗歴
  { id: 'fh_met_gi', label: 'メトホルミン→消化器症状で中止歴', cat: '失敗歴' },
  { id: 'fh_su_hypo', label: 'SU→低血糖で中止歴', cat: '失敗歴' },
  { id: 'fh_glp1_nausea', label: 'GLP-1RA→悪心強く中止歴', cat: '失敗歴' },
  { id: 'fh_sglt2_uti', label: 'SGLT2i→反復感染で中止歴', cat: '失敗歴' },

  // Red Flag
  { id: 'rf_severe_hypo', label: '重症低血糖既往（意識障害/要介助/入院）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_t1dm_suspect', label: '1型疑い（抗GAD陽性/C-peptide低/ケトーシス）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_ketosis', label: 'ケトーシス/ケトン尿陽性', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_symptomatic_hyper', label: '症候性高血糖（口渇・多尿・急激な体重減少）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC (JDS2024 + JGS2023)                      */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '血糖コントロール（HbA1c必須、FPG/食後2h任意）',
  inputs: [
    { id: 'hba1c', label: 'HbA1c', unit: '%', placeholder: '例:7.2' },
    { id: 'fpg', label: '空腹時血糖', unit: 'mg/dL', placeholder: '任意' },
    { id: 'ppg', label: '食後2h血糖', unit: 'mg/dL', placeholder: '任意' },
  ],
  note: 'JDS2024: 合併症予防<7.0%、血糖正常化<6.0%、治療強化困難<8.0%。高齢者カテゴリー別(JGS/JDS2023): Cat I <7.0-7.5%、Cat II <8.0%、Cat III <8.5%（下限は低血糖薬使用時）。目標+0.5%以内は様子見可（測定誤差±0.3%考慮）',
  deriveStatus: (v, modifiers = []) => {
    const a1c = v.hba1c;
    if (a1c === undefined) return null;

    const cat3 = modifiers.includes('co_elderly_cat3') || modifiers.includes('co_frail');
    const cat2 = modifiers.includes('co_elderly_cat2');
    const cat1 = modifiers.includes('co_elderly_cat1');
    const pregnancy = modifiers.includes('co_pregnancy');
    const hypoDrugUsed = modifiers.includes('co_hypo_drug_used');
    const severeHypoRecent =
      modifiers.includes('rf_severe_hypo') ||
      modifiers.includes('se_hypo_unaware') ||
      modifiers.includes('se_hypo_frequent');

    let upper = 7.0, lower = null;
    if (pregnancy) { upper = 6.5; lower = null; }
    else if (cat3) { upper = 8.5; lower = 7.5; }
    else if (cat2) { upper = 8.0; lower = hypoDrugUsed ? 7.0 : null; }
    else if (cat1) {
      if (hypoDrugUsed) { upper = 7.5; lower = 6.5; }
      else { upper = 7.0; lower = null; }
    }

    // Overcontrolled (hypoglycemic) priority
    if (severeHypoRecent && hypoDrugUsed) return 'overcontrolled';
    if (lower !== null && a1c < lower && hypoDrugUsed) return 'overcontrolled';

    if (a1c <= upper) return 'controlled';
    if (a1c <= upper + 0.5) return 'near_target';
    return 'uncontrolled';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS (DM)                                  */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_severe_hypo',
  'se_hypo_frequent',
  'se_hypo_unaware',
  'se_pemphigoid',
  'se_dka',
  'se_pancreatitis',
  'se_lactic_acidosis',
  'cm_t1dm',
  'rf_t1dm_suspect',
  'rf_ketosis',
  'rf_symptomatic_hyper',
  'co_pregnancy',
];

/* -------------------------------------------------------- */
/*  DISEASE-SPECIFIC HELPERS                                */
/* -------------------------------------------------------- */
export function formatAppliedTarget(modifiers) {
  if (modifiers.includes('co_pregnancy')) return 'HbA1c <6.5%（妊娠中・専門医管理）';
  if (modifiers.includes('co_elderly_cat3') || modifiers.includes('co_frail'))
    return 'HbA1c <8.5%（Cat III、下限7.5%）';
  if (modifiers.includes('co_elderly_cat2'))
    return modifiers.includes('co_hypo_drug_used')
      ? 'HbA1c <8.0%（Cat II、下限7.0%、低血糖薬あり）'
      : 'HbA1c <8.0%（Cat II）';
  if (modifiers.includes('co_elderly_cat1'))
    return modifiers.includes('co_hypo_drug_used')
      ? 'HbA1c <7.5%（Cat I、下限6.5%、低血糖薬あり）'
      : 'HbA1c <7.0%（Cat I）';
  return 'HbA1c <7.0%（一般成人・合併症予防）';
}

export function suggestAgeNudge(values, modifiers) {
  const hasAge = ['co_elderly_cat1', 'co_elderly_cat2', 'co_elderly_cat3', 'co_frail'].some((m) =>
    modifiers.includes(m)
  );
  if (hasAge) return false;
  const a1c = values.hba1c;
  return a1c !== undefined && a1c >= 7.0 && a1c < 8.5;
}

export function autoFlagLabel(f) {
  return (
    {
      rf_symptomatic_hyper: '症候性高血糖（HbA1c≥10%）',
      co_hypo_drug_used: '低血糖リスク薬内服中',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const a1c = metricValues.hba1c;
  if (a1c !== undefined && a1c >= 10) flags.push('rf_symptomatic_hyper');
  // 低血糖リスク薬使用の自動検出
  if (currentDrugs && currentDrugs.length > 0 && allDrugs) {
    const classes = new Set();
    currentDrugs.forEach((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const drug = allDrugs.find((d) => d.id === id);
      if (drug) classes.add(drug.class);
    });
    if (classes.has('SU') || classes.has('グリニド') || classes.has('インスリン(basal)') || classes.has('インスリン(rapid)')) {
      flags.push('co_hypo_drug_used');
    }
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const a1c = metricValues.hba1c;
  if (a1c !== undefined && a1c >= 9 && a1c < 10) {
    alerts.push({
      type: 'insulin_consider',
      label: 'HbA1c≥9% — インスリン/GLP-1RA検討ゾーン',
      detail: 'HbA1c≥9%では経口薬のみでの目標達成は困難。Basalインスリン導入 or GLP-1RA漸増 or 糖尿病専門医紹介を検討',
    });
  }
  if (a1c !== undefined && a1c >= 10) {
    alerts.push({
      type: 'severe_hyper',
      label: 'HbA1c≥10% — 症候性高血糖疑い、即時介入',
      detail: '症候（口渇・多尿・体重減少）を確認。ケトン尿・血糖測定・1型疑いならC-peptide・抗GAD。Basalインスリン導入を専門医相談',
    });
  }
  if ((modifiers || []).includes('co_pregnancy_planning')) {
    alerts.push({
      type: 'pregnancy_plan',
      label: '挙児希望（妊娠前計画）',
      detail: 'HbA1c <7.0% まで改善＋経口薬washout＋インスリン化して計画妊娠。SGLT2i/GLP-1RA/SU即中止、メトホルミンは個別判断',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs, metricValues */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasSU = currentClasses.has('SU');
  const hasGlinide = currentClasses.has('グリニド');
  const hasInsulin = currentClasses.has('インスリン(basal)') || currentClasses.has('インスリン(rapid)');
  const hasMet = currentClasses.has('ビグアナイド');
  const hasSGLT2 = currentClasses.has('SGLT2i');
  const hasGLP1 = currentClasses.has('GLP-1RA');
  const hasARB_or_ACEi = currentClasses.has('ARB') || currentClasses.has('ACE阻害薬');
  const hasHypoDrug = hasSU || hasGlinide || hasInsulin;

  // シックデイ + SGLT2i
  if (mods.includes('co_sickday') && hasSGLT2) {
    alerts.push({
      type: 'sickday_sglt2i',
      label: '⚠ シックデイ + SGLT2i: 即日休薬',
      detail: '正常血糖DKAリスク。発熱・嘔吐・下痢・食事摂取不能で即休薬。回復後24h経過で再開',
      severity: 'critical',
    });
  }
  // シックデイ/造影剤 + メトホルミン
  if ((mods.includes('co_sickday') || mods.includes('co_contrast_use')) && hasMet) {
    alerts.push({
      type: 'sickday_met',
      label: '⚠ メトホルミン休薬',
      detail: 'シックデイ/造影剤で乳酸アシドーシスリスク。造影前48h休薬、投与後eGFR確認し48h後再開',
      severity: 'critical',
    });
  }
  // 手術 + SGLT2i
  if (mods.includes('co_surgery') && hasSGLT2) {
    alerts.push({
      type: 'surgery_sglt2i',
      label: '⚠ 手術 + SGLT2i: 3日前休薬',
      detail: '術前3日休薬、術後経口摂取安定まで再開せず',
      severity: 'critical',
    });
  }
  // 妊娠 + 経口薬（インスリン以外）
  if (mods.includes('co_pregnancy') && currentDrugs.length > 0 && !hasInsulin) {
    alerts.push({
      type: 'pregnancy_oral',
      label: '⚠ 妊娠 + 経口血糖降下薬',
      detail: '妊娠中は全経口薬原則中止、インスリンへ切替。産婦人科+糖尿病専門医へ即紹介',
      severity: 'critical',
    });
  }
  // 重症低血糖 + SU/インスリン
  if ((mods.includes('rf_severe_hypo') || mods.includes('se_hypo_unaware')) && hasHypoDrug) {
    alerts.push({
      type: 'severe_hypo_drug',
      label: '⚠ 重症低血糖 + 低血糖リスク薬',
      detail: 'SU/グリニド/インスリンを即時減量または中止。DPP-4i/GLP-1RA/SGLT2iへの切替検討。グルカゴン処方、HbA1c目標を緩和',
      severity: 'critical',
    });
  }
  // SU + 高齢
  if (hasSU && (mods.includes('co_elderly_cat2') || mods.includes('co_elderly_cat3') || mods.includes('co_frail'))) {
    alerts.push({
      type: 'su_elderly',
      label: 'SU + 高齢/フレイル',
      detail: 'JDS2024ではSU第一選択から除外。高齢者では低血糖リスク高く、DPP-4i/GLP-1RAへの切替を推奨',
    });
  }
  // SGLT2i/ARB/ACEi + NSAID + CKD → Triple Whammy類似
  if (hasARB_or_ACEi && hasSGLT2 && mods.includes('co_nsaid')) {
    alerts.push({
      type: 'triple_whammy_dm',
      label: '⚠ ARB/ACEi + SGLT2i + NSAID: AKIリスク',
      detail: 'DM+HT患者の3者併用はAKI高リスク。NSAID中止orアセトアミノフェンへ変更優先、中止不可なら72h以内Cr/eGFR再検',
      severity: 'critical',
    });
  }
  // GLP-1RA + 膵炎既往（警告）
  if (hasGLP1 && mods.includes('cm_pancreatitis_hx')) {
    alerts.push({
      type: 'glp1_pancreatitis',
      label: 'GLP-1RA + 膵炎既往',
      detail: '膵炎再燃リスク。中止または他剤へ切替検討。腹痛時は即中止してアミラーゼ・リパーゼ測定',
    });
  }
  // HF + TZD（警告）
  if (currentClasses.has('TZD') && mods.includes('cm_hf')) {
    alerts.push({
      type: 'tzd_hf',
      label: '⚠ TZD + HF: 体液貯留リスク',
      detail: 'TZDは禁忌相当。SGLT2iへ切替を検討',
      severity: 'critical',
    });
  }
  // 挙児希望 + 経口薬
  if (mods.includes('co_pregnancy_planning') && currentDrugs.length > 0 && !hasInsulin) {
    alerts.push({
      type: 'preg_plan_oral',
      label: '挙児希望 + 経口薬',
      detail: 'SGLT2i/GLP-1RA/SUは事前中止。HbA1c <7.0%まで改善 + インスリン化してから計画妊娠',
    });
  }
  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return ['cm_hf', 'cm_hfref', 'cm_ascvd', 'cm_post_mi', 'cm_ckd_g45', 'cm_proteinuria', 'rf_symptomatic_hyper'].some(
    (m) => modifiers.includes(m)
  );
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
  const hasCKD = ['cm_ckd', 'cm_ckd_g45'].some((m) => modifiers.includes(m));
  const hypoDrug = modifiers.includes('co_hypo_drug_used');

  let note = 'HbA1cには測定誤差±0.3%・個体内変動あり。単回で判断せず、3ヶ月ごとのトレンドで評価';
  let reassess = '3ヶ月後にHbA1c再評価。食事・運動・禁煙継続';

  if (hasCKD) {
    note = 'CKD併存: eGFR・K・尿蛋白の推移に注意。薬剤の用量調整を定期的に見直す';
    reassess = '3ヶ月後にHbA1c + K・Cre・eGFR・UACR。SGLT2i内服中はeGFR初期低下（-3〜5）想定内';
  } else if (hypoDrug) {
    note = '低血糖リスク薬使用中: HbA1cが下限を下回らないか注意。SMBGで日中変動も確認';
    reassess = '3ヶ月後にHbA1c + SMBG・無自覚性低血糖/軽度低血糖の問診';
  }

  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（目標内）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '現行の食事・運動療法を継続',
    reason:
      'HbA1cが目標範囲内（目標+0.5%以内の測定誤差許容範囲含む）。不要な薬剤変更はアドヒアランス低下・副作用のリスク',
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
      ? `現行処方を継続: ${drugLabels}。食事記録・運動・体重管理を強化`
      : '食事療法（カロリー・糖質）+ 運動150分/週 + 減量を1-3ヶ月',
    reason:
      'HbA1cが目標をわずかに超過（+0.5%以内）。測定誤差範囲内の可能性、単回で強化せず生活指導強化+再評価が妥当',
    reassess: '1-3ヶ月後にHbA1c再評価。生活指導遵守を確認。改善なければSTEP UP',
    note: 'JDS2025は早期ステップアップを強調するが、測定誤差・服薬遵守・食事量変化・ストレス・季節も考慮。患者と方針合意の上で判断',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    bg_met: ['se_gi_met', 'cm_ckd', 'co_elderly_cat3', 'co_frail'],
    tzd_pio: ['se_edema', 'cm_hf', 'co_osteoporosis', 'co_elderly_cat2', 'co_elderly_cat3'],
    sglt2_empa: ['se_genital_infection', 'se_uti', 'se_dehydration', 'co_frail'],
    sglt2_dapa: ['se_genital_infection', 'se_uti', 'se_dehydration', 'co_frail'],
    sglt2_cana: ['se_genital_infection', 'se_uti', 'cm_pad_severe', 'co_frail'],
    glp1_sema_inj: ['se_nausea_glp1', 'cm_gastroparesis'],
    glp1_sema_oral: ['se_nausea_glp1', 'cm_gastroparesis'],
    glp1_dula: ['se_nausea_glp1', 'cm_gastroparesis'],
    dpp4_sita: ['se_pemphigoid', 'cm_pancreatitis_hx'],
    dpp4_lina: ['se_pemphigoid', 'cm_pancreatitis_hx'],
    dpp4_tene: ['se_pemphigoid', 'cm_pancreatitis_hx'],
    su_gli: ['se_hypo_mild', 'se_hypo_frequent', 'co_elderly_cat2', 'co_elderly_cat3', 'co_frail', 'cm_ckd'],
    ins_glarU300: ['se_hypo_frequent', 'se_hypo_unaware', 'co_elderly_cat3'],
    ins_deg: ['se_hypo_frequent', 'se_hypo_unaware', 'co_elderly_cat3'],
    ins_asp: ['se_hypo_frequent', 'se_hypo_unaware', 'co_elderly_cat3'],
  };
  const forbiddenMap = {
    bg_met: ['co_sickday', 'co_contrast_use', 'co_pregnancy', 'cm_ckd_g45', 'cm_liver_severe', 'co_heavy_drinker'],
    tzd_pio: ['co_pregnancy', 'cm_hf', 'cm_liver_severe', 'cm_bladder_ca'],
    sglt2_empa: ['co_sickday', 'co_pregnancy', 'cm_t1dm', 'se_dka'],
    sglt2_dapa: ['co_sickday', 'co_pregnancy', 'se_dka'],
    sglt2_cana: ['co_sickday', 'co_pregnancy', 'cm_t1dm', 'se_dka'],
    glp1_sema_inj: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx'],
    glp1_sema_oral: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx'],
    glp1_dula: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx'],
    dpp4_sita: ['co_pregnancy', 'se_pemphigoid'],
    dpp4_lina: ['co_pregnancy', 'se_pemphigoid'],
    dpp4_tene: ['co_pregnancy', 'se_pemphigoid'],
    su_gli: ['co_pregnancy', 'cm_ckd_g45', 'rf_severe_hypo'],
    agi_vog: ['co_pregnancy', 'cm_liver_severe'],
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
    example: `${drug.label} ${nextDose.label}（現用量 ${currentDose.label} から漸増）`,
    reason:
      '現用量で目標未達。同一薬剤の増量は新薬追加よりアドヒアランス・コストの面で優先される第一手',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '2-4週後に副作用・低血糖、3ヶ月後HbA1c',
    _isDoseUp: true,
    _drugClass: drug.class,
  }));
}

/* -------------------------------------------------------- */
/*  RECOMMENDATIONS                                         */
/* -------------------------------------------------------- */
export const RECOMMENDATIONS = [
  // --- NAIVE: lifestyle first ---
  {
    id: 'naive_lifestyle_first',
    action: 'WATCH',
    drug: '食事・運動療法を1-3ヶ月（STEP 1 前）',
    example: '1日1600-1800kcal・糖質50-60%・中等度運動150分/週・減量5-10% + 禁煙 + 家庭血糖測定',
    reason: 'JDS2024: 低・中等リスクHbA1c<8.5%は食事運動療法1ヶ月先行。改善不十分なら薬物療法',
    fromStates: ['naive'],
    forbidden: [
      'co_pregnancy', 'rf_symptomatic_hyper', 'rf_ketosis', 'rf_t1dm_suspect',
      'cm_hf', 'cm_ascvd', 'cm_post_mi', 'cm_stroke', 'cm_ckd_g45',
    ],
    reassess: '1ヶ月後にHbA1c・体重。改善なければSTEP 1薬物療法開始',
    note: 'JDS2024/2025: 診断から1ヶ月以内の再評価、改善なければ遅延させず薬物療法',
  },

  // --- STEP 1 ---
  {
    id: 'start_metformin',
    action: 'STEP_UP',
    drug: 'メトホルミン開始',
    example: 'メトグルコ錠250mg 1回1錠 1日2回 朝夕食直後（2週後500mg×2へ漸増、必要なら500mg×3）',
    reason: 'UKPDS・長年の実績。体重増加なし・低血糖なし・CV benefit。肥満DMで第一選択',
    fromStates: ['naive'],
    drugClass: 'ビグアナイド',
    preferredWhen: ['co_obese', 'cm_nash'],
    avoidWhen: ['co_elderly_cat3', 'co_frail'],
    forbidden: ['cm_ckd_g45', 'cm_liver_severe', 'co_heavy_drinker', 'co_sickday', 'co_pregnancy', 'co_contrast_use'],
    reassess: '4週後GI症状・3ヶ月後HbA1c・eGFR・VitB12',
    note: 'eGFR 30-45で減量（最大1000mg/日）、<30で禁忌',
  },
  {
    id: 'start_sglt2i_hf',
    action: 'STEP_UP',
    drug: 'SGLT2i開始（HF/CKD併存で第一選択）',
    example: 'ジャディアンス錠10mg 1回1錠 1日1回 朝食後',
    reason: 'JDS2024 + EMPEROR/DAPA-HF/EMPA-KIDNEY: HF入院・腎複合エンドポイント低下。HbA1c非依存',
    fromStates: ['naive'],
    drugClass: 'SGLT2i',
    preferredWhen: ['cm_hf', 'cm_hfref', 'cm_ckd', 'cm_proteinuria', 'co_obese', 'cm_ascvd'],
    avoidWhen: ['co_elderly_cat3', 'cm_pad_severe', 'se_genital_infection'],
    forbidden: ['cm_ckd_g45', 'cm_t1dm', 'co_sickday', 'co_pregnancy', 'se_dka'],
    reassess: '2-4週後eGFR（初期低下3-5は想定内）、3ヶ月後HbA1c・体重',
    note: 'シックデイ休薬指導必須（euglycemic DKA）。性器感染・脱水予防説明',
  },
  {
    id: 'start_glp1_ascvd_obese',
    action: 'STEP_UP',
    drug: 'GLP-1RA開始（肥満/ASCVDで強力な選択肢）',
    example: 'オゼンピック皮下注 0.25mg 週1回（4週後0.5mg、必要なら1.0mg漸増）',
    reason: 'SUSTAIN-6/LEADER/REWIND: MACE低下。STEP試験: 5-15%減量。肥満+ASCVDで最強',
    fromStates: ['naive'],
    drugClass: 'GLP-1RA',
    preferredWhen: ['co_obese', 'co_obese_severe', 'cm_ascvd', 'cm_post_mi', 'cm_stroke'],
    avoidWhen: ['co_elderly_cat3', 'se_nausea_glp1'],
    forbidden: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx', 'cm_gastroparesis'],
    reassess: '4週毎に漸増可否・悪心・体重、3ヶ月後HbA1c',
    note: '漸増必須（低用量は治療量ではない）。注射拒否時はリベルサス経口7mg/日（起床時空腹30分厳守）',
  },
  {
    id: 'start_dpp4i_elderly',
    action: 'STEP_UP',
    drug: 'DPP-4i開始（高齢・低血糖回避）',
    example: 'ジャヌビア錠50mg 1回1錠 1日1回 朝食後',
    reason: '高齢者・フレイルで最安全。低血糖ほぼなし、1日1回',
    fromStates: ['naive'],
    drugClass: 'DPP-4i',
    preferredWhen: ['co_elderly_cat1', 'co_elderly_cat2', 'co_elderly_cat3', 'co_frail', 'co_hypo_risk'],
    avoidWhen: ['cm_pancreatitis_hx'],
    forbidden: ['co_pregnancy', 'se_pemphigoid'],
    reassess: '3ヶ月後HbA1c。類天疱瘡問診',
    note: 'eGFR<45でシタ減量（25-50mg）、eGFR非依存のリナグリプチンが腎機能低下例推奨',
  },
  {
    id: 'start_dpp4i_ckd',
    action: 'STEP_UP',
    drug: 'リナグリプチン開始（CKD G4-5）',
    example: 'トラゼンタ錠5mg 1回1錠 1日1回',
    reason: '胆汁排泄で腎機能非依存、G4-5の第一選択DPP-4i',
    fromStates: ['naive'],
    drugClass: 'DPP-4i',
    preferredWhen: ['cm_ckd', 'cm_ckd_g45'],
    forbidden: ['co_pregnancy', 'se_pemphigoid'],
    reassess: '3ヶ月後HbA1c + K・Cre',
  },
  {
    id: 'start_agi_postprandial',
    action: 'STEP_UP',
    drug: 'α-GI開始（食後高血糖・低血糖回避）',
    example: 'ベイスン錠0.2mg 1回1錠 毎食直前',
    reason: '食後高血糖優位・軽度HbA1c上昇・高齢者で選択肢',
    fromStates: ['naive'],
    drugClass: 'α-GI',
    preferredWhen: ['cm_postprandial_dominant', 'co_elderly_cat1', 'co_cost'],
    avoidWhen: ['cm_liver_severe'],
    forbidden: ['co_pregnancy'],
    reassess: '4週後肝機能、3ヶ月後HbA1c',
    note: '放屁・腹部膨満は初期症状、漸増で軽減',
  },
  {
    id: 'start_insulin_severe',
    action: 'STEP_UP',
    drug: 'Basalインスリン導入（重症高血糖・1型疑い）',
    example: 'トレシーバ注 10U 就寝前（0.1-0.2U/kg）、週1-2回2-4U漸増、空腹時100-130目標',
    reason: 'HbA1c≥10%・症候性・1型疑い・ケトーシス。経口では不十分',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    drugClass: 'インスリン(basal)',
    urgentWhen: ['rf_symptomatic_hyper', 'rf_t1dm_suspect', 'rf_ketosis'],
    preferredWhen: ['rf_symptomatic_hyper'],
    specialistGate: true,
    note: 'GPで経験浅い場合は糖尿病専門医紹介推奨。1型疑いは必ず専門医',
    reassess: '週次SMBG、4週後HbA1c',
  },
  {
    id: 'bridge_until_specialist_referral',
    action: 'STEP_UP',
    drug: '【専門医紹介待ちブリッジ】 メトホルミン最大量 + 1週以内再診',
    example: 'メトホルミン 500mg×2 → 1週で 500mg×3 → 1500-2250mg/日。HbA1c・体重・尿ケトン週次。\n紹介日まで1週以上の場合は SGLT2i 追加（CKD/HFあれば）。\nケトン陽性 or 嘔吐 or 食事不能 → 即救急',
    reason: '症候性高血糖（HbA1c≥10%）でインスリン即開始がGP的に難しい場合のブリッジ。メトホルミン単剤では血糖低下不十分なので、紹介待機期間が長いほどリスク',
    fromStates: ['naive'],
    drugClass: 'ビグアナイド',
    preferredWhen: ['rf_symptomatic_hyper'],
    avoidWhen: ['cm_t1dm', 'cm_ckd_g45', 'co_heavy_drinker', 'co_sickday'],
    note: '【判断ガイド】\n① 紹介当日〜3日以内 → メトホルミン+生活指導のみ可\n② 4-7日先 → メトホルミン最大量+SGLT2i併用検討（CKD/HF/肥満なら）\n③ 7日以上 or 症状重 → 当院でインスリン開始（basal 0.1-0.2U/kg）\n④ 全例: 患者にケトン症状（吐気・腹痛・呼気アセトン臭）の警告 + 救急受診基準を明示',
    reassess: '7日以内に再診 or 紹介到達確認',
  },

  // --- STEP 2 (mono → dual) ---
  {
    id: 'add_sglt2i_on_mono',
    action: 'ADD',
    drug: 'SGLT2i追加（心腎保護付与）',
    example: '現行薬継続 + ジャディアンス錠10mg',
    reason: 'Met/DPP-4i等の単剤未達でHF/CKD/ASCVD/肥満併存ならSGLT2i最優先',
    fromStates: ['mono'],
    drugClass: 'SGLT2i',
    preferredWhen: ['cm_hf', 'cm_ckd', 'cm_ascvd', 'co_obese'],
    avoidWhen: ['co_elderly_cat3', 'cm_pad_severe'],
    forbidden: ['cm_ckd_g45', 'cm_t1dm', 'co_sickday', 'co_pregnancy', 'se_dka'],
    reassess: '2-4週後eGFR、3ヶ月後HbA1c・体重',
  },
  {
    id: 'add_glp1_on_mono',
    action: 'ADD',
    drug: 'GLP-1RA追加（肥満・ASCVD）',
    example: '現行薬継続 + オゼンピック皮下注0.25mg 週1回（漸増）',
    reason: '肥満DMでMACE低下+減量。Met+GLP-1RAは推奨レジメン',
    fromStates: ['mono'],
    drugClass: 'GLP-1RA',
    preferredWhen: ['co_obese', 'co_obese_severe', 'cm_ascvd'],
    avoidWhen: ['se_nausea_glp1'],
    forbidden: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx', 'cm_gastroparesis'],
    reassess: '4週毎に漸増、3ヶ月後HbA1c・体重',
  },
  {
    id: 'add_dpp4i_on_mono',
    action: 'ADD',
    drug: 'DPP-4i追加（安全・高齢）',
    example: '現行薬継続 + ジャヌビア錠50mg 1日1回 朝食後',
    reason: 'Met+DPP-4iは相補的・低血糖なく高齢者で王道',
    fromStates: ['mono'],
    drugClass: 'DPP-4i',
    preferredWhen: ['co_elderly_cat1', 'co_elderly_cat2', 'co_hypo_risk'],
    avoidWhen: ['cm_pancreatitis_hx'],
    forbidden: ['co_pregnancy', 'se_pemphigoid'],
  },
  {
    id: 'add_dpp4i_linagliptin_ckd_mono',
    action: 'ADD',
    drug: 'DPP-4i追加（CKD・腎排泄少なく用量調整不要）',
    example: '現行薬継続 + トラゼンタ錠5mg 1日1回',
    reason: 'CKD G3-G5でリナグリプチンは胆汁排泄・用量調整不要。SGLT2iが禁忌/不耐の場合の安全選択',
    fromStates: ['mono'],
    drugClass: 'DPP-4i',
    preferredWhen: ['cm_ckd', 'cm_ckd_g45'],
    avoidWhen: ['cm_pancreatitis_hx'],
    forbidden: ['co_pregnancy', 'se_pemphigoid'],
    note: 'シタグリプチン等は eGFR で減量必要。リナグリプチン明示推奨',
  },
  {
    id: 'add_met_on_other_mono',
    action: 'ADD',
    drug: 'メトホルミン追加',
    example: '現行薬継続 + メトグルコ錠500mg 1日2回',
    reason: 'DPP-4i/SGLT2i/SU単剤未達でMet追加は標準。相加効果+体重増加相殺',
    fromStates: ['mono'],
    drugClass: 'ビグアナイド',
    avoidWhen: ['co_elderly_cat3', 'co_frail'],
    forbidden: ['cm_ckd_g45', 'cm_liver_severe', 'co_heavy_drinker', 'co_sickday', 'co_pregnancy', 'co_contrast_use'],
  },
  {
    id: 'add_agi_postprandial_residual',
    action: 'ADD',
    drug: 'α-GI追加（食後高血糖残存）',
    example: '現行薬継続 + ベイスン0.2mg 毎食直前',
    reason: '食後血糖>200の残存、HbA1cとFPGのミスマッチで有用',
    fromStates: ['mono'],
    drugClass: 'α-GI',
    requiresAny: ['cm_postprandial_dominant'],
    preferredWhen: ['cm_postprandial_dominant', 'co_irregular_meals'],
    forbidden: ['co_pregnancy', 'cm_liver_severe'],
  },

  // --- STEP 3 ---
  {
    id: 'dual_add_sglt2i',
    action: 'ADD',
    drug: 'SGLT2i追加（3剤目・心腎保護）',
    fromStates: ['dual'],
    drugClass: 'SGLT2i',
    preferredWhen: ['cm_hf', 'cm_ckd', 'co_obese'],
    forbidden: ['cm_ckd_g45', 'cm_t1dm', 'co_sickday', 'co_pregnancy', 'se_dka'],
    example: '現行2剤継続 + ジャディアンス10mg',
    reason: 'Met+DPP-4i/GLP-1RAにSGLT2i追加は標準3剤。心腎保護付与',
  },
  {
    id: 'dual_add_glp1',
    action: 'ADD',
    drug: 'GLP-1RA追加（3剤目・減量/CV）',
    fromStates: ['dual'],
    drugClass: 'GLP-1RA',
    preferredWhen: ['co_obese_severe', 'cm_ascvd'],
    forbidden: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx', 'cm_gastroparesis'],
    example: '現行2剤継続 + オゼンピック週1漸増',
    reason: '肥満・ASCVDで強力介入',
  },
  {
    id: 'dual_add_basal_insulin_bridge',
    action: 'ADD',
    drug: 'Basalインスリン橋渡し（重症高血糖）',
    fromStates: ['dual'],
    drugClass: 'インスリン(basal)',
    urgentWhen: ['rf_symptomatic_hyper'],
    preferredWhen: ['rf_symptomatic_hyper'],
    specialistGate: true,
    example: 'トレシーバ10U 就寝前開始。空腹時100-130目標、週1-2回2-4U漸増',
    reason: '経口2剤でHbA1c≥10%/症候性は経口強化待たず、専門医連携下でbasal導入',
  },

  // --- STEP 4 / injectable intensify ---
  {
    id: 'triple_to_basal_bolus',
    action: 'STEP_UP',
    drug: 'Basal-bolus化（専門医紹介）',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['rf_symptomatic_hyper'],
    specialistGate: true,
    example: 'Basal継続 + ノボラピッド 4U 主食最大の食事前（basal-plus）→ 毎食前（basal-bolus）',
    reason: '経口triple+basalで未達の場合、食後対応のprandial追加。GPでは専門医連携下',
  },

  // --- SWITCH ---
  {
    id: 'switch_su_to_dpp4i_hypo',
    action: 'SWITCH',
    drug: 'SU → DPP-4iへ変更（低血糖回避）',
    example: 'アマリール中止 → ジャヌビア錠50mg 1日1回',
    reason: 'SUによる低血糖、特に高齢者/CKD/不規則食事。DPP-4iで低血糖激減',
    fromStates: ['mono', 'dual', 'triple'],
    targetClass: 'DPP-4i',
    triggerSideEffects: ['se_hypo_mild', 'se_hypo_frequent', 'se_hypo_unaware'],
    preferredWhen: ['co_elderly_cat2', 'co_elderly_cat3', 'co_frail', 'rf_severe_hypo', 'fh_su_hypo'],
    forbidden: ['co_pregnancy', 'se_pemphigoid'],
  },
  {
    id: 'switch_su_to_glp1',
    action: 'SWITCH',
    drug: 'SU → GLP-1RAへ変更（肥満+低血糖）',
    example: 'アマリール漸減（1-2週）→ オゼンピック0.25mg週1漸増',
    reason: 'SU使用中の肥満+低血糖リスク例。体重減少+低血糖解消',
    fromStates: ['mono', 'dual'],
    targetClass: 'GLP-1RA',
    triggerSideEffects: ['se_hypo_mild', 'se_hypo_frequent'],
    preferredWhen: ['co_obese', 'cm_ascvd'],
    forbidden: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx', 'cm_gastroparesis'],
  },
  {
    id: 'switch_met_off_gi',
    action: 'SWITCH',
    drug: 'メトホルミン中止 → 他剤（GI不耐）',
    example: 'メトグルコ中止 → DPP-4i or SGLT2i 開始',
    reason: 'メトホルミンGI症状で継続困難',
    fromStates: ['mono', 'dual'],
    triggerSideEffects: ['se_gi_met', 'fh_met_gi'],
    preferredWhen: ['fh_met_gi', 'se_gi_met'],
  },
  {
    id: 'switch_sglt2i_off_infection',
    action: 'SWITCH',
    drug: 'SGLT2i → DPP-4i/GLP-1RA（反復感染）',
    example: 'ジャディアンス中止 → ジャヌビア or オゼンピック',
    reason: '性器感染・尿路感染の反復で継続困難',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_genital_infection', 'se_uti', 'fh_sglt2_uti'],
  },
  {
    id: 'switch_tzd_off_hf',
    action: 'SWITCH',
    drug: 'TZD中止 → SGLT2iへ（HF発症/悪化）',
    example: 'アクトス中止 → ジャディアンス錠10mg',
    reason: 'TZDはHF悪化リスク。HF発症/悪化でSGLT2iへ切替（心保護付与）',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_edema'],
    preferredWhen: ['cm_hf'],
    targetClass: 'SGLT2i',
    forbidden: ['cm_ckd_g45', 'cm_t1dm', 'co_sickday', 'se_dka'],
  },
  {
    id: 'switch_glp1_to_oral_sema',
    action: 'SWITCH',
    drug: 'GLP-1RA注射 → リベルサス経口',
    example: 'オゼンピック中止 → リベルサス3mg×4週 → 7mg',
    reason: '注射拒否・手技困難例',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_injection_refuse'],
    forbidden: ['co_pregnancy', 'cm_mtc_family_hx', 'cm_pancreatitis_hx', 'cm_gastroparesis'],
  },
  {
    id: 'switch_to_insulin_pregnancy',
    action: 'SWITCH',
    drug: '全経口薬 → インスリン（妊娠・妊娠希望）',
    example: '全経口薬中止 → トレシーバ就寝前 + ノボラピッド毎食前',
    reason: '経口薬は胎盤移行・催奇形性。インスリン（胎盤非通過）で安全',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['co_pregnancy'],
    preferredWhen: ['co_pregnancy', 'co_pregnancy_planning'],
    specialistGate: true,
    note: '挙児希望段階でHbA1c<7.0%まで改善+インスリン化してから妊娠許可',
  },
  {
    id: 'gdm_diet_first_then_insulin',
    action: 'STEP_UP',
    drug: '妊娠糖尿病（GDM）: 食事療法＋必要時インスリン',
    example: '分割食（5-6回/日）+ 栄養士指導、目標 食前<95 食後1h<140 食後2h<120 mg/dL。未達ならインスリン',
    reason: 'GDMの第一は食事療法。経口薬（メトホルミン/SU）は日本では妊娠中適応なし。インスリンが標準',
    fromStates: ['naive'],
    drugClass: 'インスリン（必要時）',
    preferredWhen: ['cm_gdm'],
    urgentWhen: ['cm_gdm'],
    specialistGate: true,
    note: '産科+栄養士+糖尿病内科の3者連携。分娩後はGDMほぼ寛解だが、産後12週でOGTT再評価（将来T2DM 7倍）',
  },
  {
    id: 'gard_t1dm_redirect',
    action: 'REFER',
    drug: '⚠ T1DMはこのBoosterの対象外 → 強化インスリン療法 + 専門医継続',
    reason: 'T1DMは内因性インスリン枯渇でCペプチド低値、抗GAD/IA-2/ZnT8抗体陽性。経口薬は適応外（SGLT2i一部除く）',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['cm_t1dm'],
    preferredWhen: ['cm_t1dm'],
    specialistGate: true,
    note: 'CGM/SAP/ポンプ療法は専門医管理。クリニックでは併診サポートのみ',
  },
  {
    id: 'post_gastrectomy_caution',
    action: 'INVESTIGATE',
    drug: '胃切除後DM: 薬剤選択に追加配慮（dumping/低栄養/B12）',
    example: '低BMI/Alb確認、B12・鉄・葉酸スクリーニング、HbA1c目標を緩和',
    reason: 'GLP-1RA: 消化器症状で耐容性低下。SGLT2i: サルコペニア悪化リスク。SU: 低血糖・dumping様症状で危険。DPP-4iまたはインスリンが選択肢',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['cm_post_gastrectomy'],
    note: '食後高血糖優位ならα-GI（ベイスン）も選択肢。HbA1c目標は症例個別化',
  },

  // --- TAPER ---
  {
    id: 'taper_su_elderly',
    action: 'TAPER',
    drug: 'SU減量/中止（高齢・低血糖あり）',
    example: 'アマリール0.5mgへ減量 → DPP-4i/GLP-1RAへ移行',
    reason: '高齢・フレイル・頻回低血糖ではSUは漸減',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_hypo_mild', 'se_hypo_frequent', 'se_hypo_unaware'],
    preferredWhen: ['co_elderly_cat2', 'co_elderly_cat3', 'co_frail', 'rf_severe_hypo'],
  },
  {
    id: 'taper_overcontrolled_hypo',
    action: 'TAPER',
    drug: '低血糖薬の減量（過降下・頻回低血糖）',
    reason: 'HbA1c下限未満 or 頻回低血糖。ADL/認知機能悪化リスク',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['rf_severe_hypo', 'se_hypo_unaware', 'se_hypo_frequent'],
    note: 'SU/グリニド/インスリン を10-20%減量。basal維持、bolus優先減量',
    reassess: '2-4週後にSMBG・HbA1c',
  },
  {
    id: 'taper_insulin_after_weight_loss',
    action: 'TAPER',
    drug: 'インスリン減量（減量・生活改善後）',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    requiresAny: ['co_stable_6mo'],
    preferredWhen: ['co_stable_6mo', 'co_obese'],
    reason: '5-10%以上の減量で内因性インスリン改善、インスリン減量可能',
  },
  {
    id: 'taper_polypharmacy_stable',
    action: 'TAPER',
    drug: 'ポリファーマシー見直し（長期安定）',
    fromStates: ['triple', 'quad_plus'],
    requiresAny: ['co_stable_6mo'],
    preferredWhen: ['co_polyp', 'co_elderly_cat2', 'co_elderly_cat3'],
    reason: '6ヶ月以上コントロール安定。ポリファーマシー回避',
  },

  // --- Sick day hold / REFER ---
  {
    id: 'sickday_hold_sglt2i',
    action: 'STOP',
    drug: 'SGLT2i休薬（シックデイ/手術）',
    reason: '脱水・euglycemic DKAリスク。食事・水分摂取回復後24h後に再開',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['co_sickday', 'co_surgery'],
    preferredWhen: ['co_sickday', 'co_surgery'],
  },
  {
    id: 'sickday_hold_metformin',
    action: 'STOP',
    drug: 'メトホルミン休薬（造影剤/シックデイ）',
    reason: '乳酸アシドーシス予防。造影剤前後48h休薬+eGFR再評価',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['co_contrast_use', 'co_sickday'],
    preferredWhen: ['co_contrast_use', 'co_sickday'],
  },
  {
    id: 'refer_pregnancy_dm',
    action: 'REFER',
    drug: '産婦人科 + 糖尿病専門医（周産期センター）',
    reason: '妊娠中DM: 経口薬全中止、インスリン管理。母児合併症予防',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['co_pregnancy'],
    preferredWhen: ['co_pregnancy', 'co_pregnancy_planning'],
    note: 'GDM診断: 75gOGTT ≥1点陽性（空腹92/1h180/2h153）。既存DM挙児希望はHbA1c<7.0%+インスリン化',
  },
  {
    id: 'refer_t1dm',
    action: 'REFER',
    drug: '糖尿病専門医（1型疑い）',
    reason: '1型DMはインスリン必須。経口単独では危険',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['cm_t1dm', 'rf_t1dm_suspect', 'rf_ketosis'],
    preferredWhen: ['cm_t1dm', 'rf_t1dm_suspect'],
    note: '抗GAD抗体・C-peptide（空腹<0.6 ng/mL）・尿/血中ケトンを評価',
  },
  {
    id: 'refer_ckd_advanced',
    action: 'REFER',
    drug: '腎臓内科へ紹介（CKD G4-G5）',
    reason: 'eGFR<30では薬剤選択が狭小。リナグリプチン・basalインスリン・専門医共同管理',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_ckd_g45'],
    note: 'ループ利尿薬・K吸着薬（ロケルマ・カリメート）併用、SGLT2iはeGFR20-30でも心腎保護適応あり',
  },
  {
    id: 'refer_pancreatogenous',
    action: 'REFER',
    drug: '消化器内科 + 糖尿病専門医',
    reason: '膵性DM（3c型）は膵外分泌不全合併、酵素補充+インスリン',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_pancreatogenous_dm'],
    urgentWhen: ['cm_pancreatogenous_dm'],
  },
  {
    id: 'refer_resistant',
    action: 'REFER',
    drug: '糖尿病専門医（治療抵抗性/basal-bolus化）',
    reason: '経口3剤+basalでも未達、basal-bolus化、CSII/CGM検討',
    fromStates: ['triple', 'quad_plus'],
    note: '膵β細胞評価（C-peptide）、SU効果判定、GLP-1RA切替検討',
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: '全経口血糖降下薬',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】妊娠中はインスリンのみ。全経口薬即中止し産婦人科・糖尿病専門医へ',
  },
  {
    drug: 'SGLT2阻害薬 / GLP-1RA',
    modifiers: ['co_pregnancy', 'co_pregnancy_planning'],
    reason: '【禁忌】催奇形性リスク報告。挙児希望時点で中止しwashout後にインスリン化',
  },
  {
    drug: 'ビグアナイド（メトホルミン）',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】eGFR<30（乳酸アシドーシスリスク）',
  },
  {
    drug: 'ビグアナイド（メトホルミン）',
    modifiers: ['co_heavy_drinker'],
    reason: '【禁忌】乳酸アシドーシス高リスク',
  },
  {
    drug: 'ビグアナイド（メトホルミン）',
    modifiers: ['cm_liver_severe'],
    reason: '【禁忌】Child-Pugh B以上',
  },
  {
    drug: 'ビグアナイド（メトホルミン）',
    modifiers: ['co_sickday', 'co_contrast_use'],
    reason: '【シックデイ/造影剤】一時休薬必須',
  },
  {
    drug: 'SGLT2i',
    modifiers: ['co_sickday'],
    reason: '【シックデイ】正常血糖DKAリスク。即日休薬',
  },
  {
    drug: 'SGLT2i',
    modifiers: ['cm_t1dm'],
    reason: '【相対禁忌】1型DMへはGP開始禁。糖尿病専門医管理下のみ',
  },
  {
    drug: 'TZD（ピオグリタゾン）',
    modifiers: ['cm_hf'],
    reason: '【禁忌】体液貯留でHF増悪',
  },
  {
    drug: 'TZD（ピオグリタゾン）',
    modifiers: ['cm_bladder_ca'],
    reason: '【禁忌】膀胱癌既往・治療中',
  },
  {
    drug: 'SU',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】eGFR<30で低血糖遷延（グリベンクラミド絶対禁忌、グリメピリドも回避）',
  },
  {
    drug: 'SU / グリニド',
    modifiers: ['rf_severe_hypo'],
    reason: '【禁忌級】重症低血糖既往。即中止しDPP-4i/GLP-1RAへ',
  },
  {
    drug: 'GLP-1RA / DPP-4i',
    modifiers: ['cm_pancreatitis_hx', 'cm_pancreatogenous_dm'],
    reason: '【相対禁忌】膵炎再燃リスク。3c型では回避',
  },
  {
    drug: 'GLP-1RA',
    modifiers: ['cm_mtc_family_hx'],
    reason: '【禁忌】MTC既往・MEN2家族歴',
  },
  {
    drug: 'DPP-4i',
    modifiers: ['se_pemphigoid'],
    reason: '【禁忌】類天疱瘡発症例は即中止し皮膚科紹介',
  },
  {
    drug: 'ARB/ACE阻害薬 + SGLT2i + NSAID',
    modifiers: ['co_nsaid', 'cm_ckd'],
    reason: '【AKIリスク】3者併用でAKI発症しうる。NSAID中止優先',
  },
];
