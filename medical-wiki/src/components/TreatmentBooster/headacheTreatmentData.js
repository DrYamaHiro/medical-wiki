/**
 * Treatment Booster — 頭痛 治療修正データ
 * 頭痛の診療ガイドライン2021 + ICHD-3 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // 急性期 NSAID / アセトアミノフェン
  { id: 'ac_loxo', label: 'ロキソプロフェン（ロキソニン）', class: '急性期NSAID',
    doses: [{ value: '60_prn', label: '60-120mg 頓用（1日3回まで）', isDefault: true, isMax: true }] },
  { id: 'ac_nap', label: 'ナプロキセン（ナイキサン）', class: '急性期NSAID',
    doses: [{ value: '300_prn', label: '300-600mg 頓用', isDefault: true, isMax: true }] },
  { id: 'ac_ibu', label: 'イブプロフェン（ブルフェン）', class: '急性期NSAID',
    doses: [{ value: '200_prn', label: '200-400mg 頓用', isDefault: true, isMax: true }] },
  { id: 'ac_cele', label: 'セレコキシブ（セレコックス、COX-2選択）', class: '急性期NSAID',
    doses: [{ value: '100_bid', label: '100-200mg×2/日', isDefault: true, isMax: true }] },
  { id: 'ac_apap', label: 'アセトアミノフェン（カロナール）', class: '急性期アセトアミノフェン',
    doses: [{ value: '500_prn', label: '500-1000mg 頓用（1日最大4000mg）', isDefault: true, isMax: true }] },

  // トリプタン (5種、日本)
  { id: 'trp_suma', label: 'スマトリプタン（イミグラン）', class: 'トリプタン',
    doses: [
      { value: '50_po', label: '50mg 経口 頓用', isDefault: true },
      { value: '20_nasal', label: '20mg 点鼻（嘔気優位）' },
      { value: '3_sc', label: '3mg 皮下注（群発頭痛）' },
    ] },
  { id: 'trp_zol', label: 'ゾルミトリプタン（ゾーミッグ）', class: 'トリプタン',
    doses: [{ value: '2.5_po', label: '2.5mg 経口 or RM錠（口腔内速溶）', isDefault: true, isMax: true }] },
  { id: 'trp_ele', label: 'エレトリプタン（レルパックス）', class: 'トリプタン',
    doses: [
      { value: '20_po', label: '20mg 経口 頓用', isDefault: true },
      { value: '40_po', label: '40mg（日本で最強）', isMax: true },
    ] },
  { id: 'trp_riza', label: 'リザトリプタン（マクサルト）', class: 'トリプタン',
    doses: [
      { value: '5_po', label: '5mg（プロプラノロール併用時）' },
      { value: '10_po', label: '10mg OD錠（口腔内速溶）', isDefault: true, isMax: true },
    ] },
  { id: 'trp_nar', label: 'ナラトリプタン（アマージ）', class: 'トリプタン',
    doses: [{ value: '2.5_po', label: '2.5mg 経口（半減期長、月経片頭痛）', isDefault: true, isMax: true }] },

  // ラスミジタン (CV既往でも可)
  { id: 'ditan_las', label: 'ラスミジタン（レイボー）5-HT1F作動', class: 'ジタン',
    doses: [
      { value: '50_po', label: '50mg 経口 頓用' },
      { value: '100_po', label: '100mg 経口 頓用', isDefault: true },
      { value: '200_po', label: '200mg 経口 頓用', isMax: true },
    ] },

  // 制吐薬
  { id: 'ae_metoclo', label: 'メトクロプラミド（プリンペラン）', class: '制吐薬',
    doses: [{ value: '10_prn', label: '10mg 頓用', isDefault: true, isMax: true }] },
  { id: 'ae_dompe', label: 'ドンペリドン（ナウゼリン）', class: '制吐薬',
    doses: [{ value: '10_prn', label: '10mg 頓用', isDefault: true, isMax: true }] },

  // 予防薬 (従来型)
  { id: 'pv_prop', label: 'プロプラノロール（インデラル）', class: '予防β遮断薬',
    doses: [
      { value: '20_tid', label: '20mg×3/日 開始', isDefault: true },
      { value: '40_tid', label: '40mg×3/日' },
      { value: '120_qd_lp', label: '徐放 120mg×1/日', isMax: true },
    ] },
  { id: 'pv_lom', label: 'ロメリジン（ミグシス）', class: '予防Ca拮抗薬',
    doses: [{ value: '5_bid', label: '5mg×2/日', isDefault: true, isMax: true }] },
  { id: 'pv_ami', label: 'アミトリプチリン（トリプタノール）', class: '予防TCA',
    doses: [
      { value: '10_qhs', label: '10mg 就寝前（開始）', isDefault: true },
      { value: '25_qhs', label: '25mg 就寝前' },
      { value: '75_qhs', label: '75mg 就寝前', isMax: true },
    ] },
  { id: 'pv_val', label: 'バルプロ酸（デパケン/セレニカ）', class: '予防抗てんかん薬',
    doses: [
      { value: '200_qd', label: '200mg/日 開始', isDefault: true },
      { value: '400_qd', label: '400mg/日' },
      { value: '600_qd', label: '600mg/日', isMax: true },
    ] },
  { id: 'pv_top', label: 'トピラマート（トピナ、片頭痛予防は適応外使用）', class: '予防抗てんかん薬',
    doses: [
      { value: '25_qd', label: '25mg/日 開始（夜）', isDefault: true },
      { value: '50_qd', label: '50mg/日（25mg×2）' },
      { value: '100_qd', label: '100mg/日（50mg×2、効果と忍容性の最適点）', isMax: true },
    ] },

  // CGRP抗体 (皮下注、専門医)
  { id: 'cgrp_ere', label: 'エレヌマブ（アイモビーグ）anti-CGRP受容体', class: 'CGRP抗体',
    doses: [{ value: '70_qm_sc', label: '70mg SC 月1回', isDefault: true, isMax: true }] },
  { id: 'cgrp_gal', label: 'ガルカネズマブ（エムガルティ）anti-CGRPリガンド', class: 'CGRP抗体',
    doses: [
      { value: '240_init', label: '初回 240mg SC' },
      { value: '120_qm_sc', label: '以後 120mg SC 月1回（片頭痛予防）', isDefault: true },
      { value: '300_qm_sc_cluster', label: '300mg SC 月1回（慢性群発頭痛）', isMax: true },
    ] },
  { id: 'cgrp_fre', label: 'フレマネズマブ（アジョビ）anti-CGRPリガンド', class: 'CGRP抗体',
    doses: [
      { value: '225_qm_sc', label: '225mg SC 月1回', isDefault: true },
      { value: '675_q3m_sc', label: '675mg SC 3ヶ月1回', isMax: true },
    ] },

  // ボツリヌス (慢性片頭痛)
  { id: 'botox_onabo', label: 'オナボツリヌスA（ボトックス）', class: 'ボツリヌス',
    doses: [{ value: '155u_q12w', label: '155U 頭頸部31箇所 12週毎', isDefault: true, isMax: true }] },

  // 群発頭痛 急性期・予防
  { id: 'cl_ox', label: '酸素療法（非再呼吸マスク）', class: '群発急性期',
    doses: [{ value: '7_15min', label: '7-12L/min × 15分', isDefault: true, isMax: true }] },
  { id: 'cl_vera', label: 'ベラパミル（群発予防）', class: '群発予防',
    doses: [
      { value: '80_tid', label: '80mg×3/日 開始', isDefault: true },
      { value: '240_total', label: '240mg/日（ECG確認）' },
      { value: '480_total', label: '480mg/日' },
      { value: '960_total', label: '960mg/日（最大、循環器コンサル）', isMax: true },
    ] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // Red Flag (SNOOP)
  { id: 'rf_sudden_onset_thunderclap', label: '⚠ 突発性雷鳴頭痛（1分以内ピーク）→ SAH疑い', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_first_severe_50plus', label: '50歳以降初発の重度頭痛 → GCA/脳腫瘍疑い', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_neurological_signs', label: '巣症状・意識障害・痙攣・項部硬直', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_fever_neck_stiffness', label: '発熱+項部硬直 → 髄膜炎疑い', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_pattern_change', label: '既存頭痛のパターン変化（性状・頻度・強度）', cat: 'Red Flag' },
  { id: 'rf_valsalva_induced', label: '咳・力み・姿勢で誘発 → 頭蓋内圧亢進', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_pregnancy_new_headache', label: '妊娠中/産褥の新規頭痛 → 子癇・CVST・RCVS', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_hiv_immunosuppressed', label: '免疫抑制下の新規頭痛', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_post_trauma', label: '外傷後の頭痛（3ヶ月以内）', cat: 'Red Flag' },

  // 頭痛型
  { id: 'cm_migraine_with_aura', label: '片頭痛 前兆あり', cat: '頭痛型' },
  { id: 'cm_migraine_without_aura', label: '片頭痛 前兆なし', cat: '頭痛型' },
  { id: 'cm_migraine_menstrual', label: '月経関連片頭痛', cat: '頭痛型' },
  { id: 'cm_migraine_chronic', label: '慢性片頭痛（≥15日/月×3ヶ月）', cat: '頭痛型', severity: 'critical' },
  { id: 'cm_tension_type', label: '緊張型頭痛', cat: '頭痛型' },
  { id: 'cm_cluster', label: '群発頭痛（cluster period中）', cat: '頭痛型' },
  { id: 'cm_cluster_chronic', label: '慢性群発頭痛', cat: '頭痛型', severity: 'critical' },
  { id: 'cm_mixed_headache', label: '混合型', cat: '頭痛型' },

  // 薬物乱用頭痛
  { id: 'cm_moh', label: '薬物乱用頭痛（MOH）', cat: 'Phenotype', severity: 'critical' },
  { id: 'cm_moh_triptan_overuse', label: 'トリプタン月≥10日', cat: 'Phenotype' },
  { id: 'cm_moh_analgesic_overuse', label: '単純鎮痛薬 月≥15日', cat: 'Phenotype' },

  // 予防適応
  { id: 'cm_migraine_freq_4plus', label: '片頭痛 月≥4日（予防適応）', cat: 'Phenotype' },
  { id: 'cm_prior_prevention_failure', label: '予防薬1剤以上 無効/不耐', cat: 'Phenotype' },
  { id: 'cm_prior_prevention_2_failure', label: '予防薬2剤以上 無効/不耐/禁忌（CGRP保険要件）', cat: 'Phenotype' },

  // 併存症
  { id: 'cm_depression', label: 'うつ併存', cat: '併存疾患' },
  { id: 'cm_anxiety', label: '不安障害併存', cat: '併存疾患' },
  { id: 'cm_insomnia', label: '不眠併存', cat: '併存疾患' },
  { id: 'cm_obesity', label: '肥満', cat: '併存疾患' },
  { id: 'cm_osas', label: 'OSAS併存', cat: '併存疾患' },
  { id: 'cm_epilepsy', label: 'てんかん併存', cat: '併存疾患' },
  { id: 'cm_ht', label: '高血圧併存', cat: '併存疾患' },
  { id: 'cm_ihd_or_stroke', label: '虚血性心疾患 or 脳梗塞既往', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_htn_uncontrolled', label: 'コントロール不良高血圧', cat: '併存疾患' },
  { id: 'cm_asthma', label: '喘息併存（β遮断薬禁忌）', cat: '併存疾患' },
  { id: 'cm_copd', label: 'COPD併存（非選択β禁忌）', cat: '併存疾患' },
  { id: 'cm_narrow_angle_glaucoma', label: '狭隅角緑内障（TCA禁忌）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_bph_urinary_retention', label: 'BPH・尿閉', cat: '併存疾患' },
  { id: 'cm_qt_prolongation', label: 'QT延長', cat: '併存疾患' },
  { id: 'cm_peptic_ulcer_hx', label: '消化性潰瘍既往', cat: '併存疾患' },
  { id: 'cm_ckd', label: 'CKD', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5（NSAID禁忌）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_liver_severe', label: '重症肝障害', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_pancreatitis_hx', label: '膵炎既往', cat: '併存疾患' },
  { id: 'cm_bradycardia_av_block', label: '徐脈・AVブロック', cat: '併存疾患', severity: 'critical' },

  // 制約
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_pregnancy_planning', label: '妊娠希望', cat: '制約' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_elderly_65', label: '高齢者（≥65歳）', cat: '制約' },
  { id: 'co_pediatric_12_17', label: '小児 12-17歳', cat: '制約' },
  { id: 'co_pediatric_6_11', label: '小児 6-11歳', cat: '制約' },
  { id: 'co_pediatric_lt6', label: '小児 6歳未満', cat: '制約', severity: 'critical' },
  { id: 'co_contraception_hormonal', label: '経口避妊薬/HRT使用中', cat: '制約' },
  { id: 'co_ergot_within_24h', label: 'エルゴタミン 24時間以内使用', cat: '制約', severity: 'critical' },
  { id: 'co_ssri_snri_use', label: 'SSRI/SNRI併用', cat: '制約' },
  { id: 'co_propranolol_concurrent', label: 'プロプラノロール併用（リザトリプタン減量）', cat: '制約' },
  { id: 'co_anticoag_major', label: '抗凝固薬併用（ワルファリン/DOAC）', cat: '制約' },
  { id: 'co_driving_occupation', label: '運転業務（ラスミジタン8h制限）', cat: '制約' },
  { id: 'co_cyp3a4_inhibitor', label: 'CYP3A4阻害薬（エレトリプタン注意）', cat: '制約' },
  { id: 'co_opioid_use', label: 'オピオイド使用中', cat: '制約', severity: 'critical' },
  { id: 'co_kidney_stone_hx', label: '腎結石既往（トピラマート慎重）', cat: '制約' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC                                          */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '頭痛評価（頻度 + MIDAS + 急性期薬使用日数）',
  inputs: [
    { id: 'headache_days_per_month', label: '頭痛日数/月', unit: '日', placeholder: '例:6' },
    { id: 'midas', label: 'MIDAS（過去3ヶ月の支障度）', unit: '点', placeholder: '例:15' },
    { id: 'hit6', label: 'HIT-6', unit: '点', placeholder: '任意' },
    { id: 'abortive_days_per_month', label: '急性期薬使用日数/月', unit: '日', placeholder: '例:3' },
  ],
  note: '目標: 頭痛≤2日/月 + MIDAS≤5 + 急性期薬≤4日/月。急性期薬（トリプタン/合剤）月≥10日 or 単純鎮痛月≥15日でMOH。Red Flag陽性で精査優先',
  deriveStatus: (v, modifiers = []) => {
    const has = (m) => modifiers.includes(m);
    const d = v.headache_days_per_month;
    const m = v.midas;
    const h = v.hit6;
    const ab = v.abortive_days_per_month;

    // Red Flag は即uncontrolled（精査優先）
    const hasRedFlag = ['rf_sudden_onset_thunderclap', 'rf_first_severe_50plus', 'rf_neurological_signs',
      'rf_fever_neck_stiffness', 'rf_pattern_change', 'rf_valsalva_induced',
      'rf_pregnancy_new_headache', 'rf_hiv_immunosuppressed', 'rf_post_trauma'].some(has);
    if (hasRedFlag) return 'uncontrolled';

    // MOH は uncontrolled
    if (has('cm_moh')) return 'uncontrolled';
    if (ab !== undefined && ab >= 10) return 'uncontrolled';

    // 慢性片頭痛 は uncontrolled
    if (has('cm_migraine_chronic')) return 'uncontrolled';

    // Overcontrolled: 予防薬副作用
    if (has('se_prevention_side_effects')) return 'overcontrolled';

    if (d === undefined && m === undefined && h === undefined) return null;

    // Uncontrolled
    if ((d !== undefined && d >= 6) || (m !== undefined && m >= 11) || (h !== undefined && h >= 56)) return 'uncontrolled';

    // Near target
    if ((d !== undefined && d >= 3 && d <= 5) || (m !== undefined && m >= 6 && m <= 10) ||
        (h !== undefined && h >= 50 && h <= 55)) return 'near_target';

    // Controlled
    if ((d === undefined || d <= 2) && (m === undefined || m <= 5) &&
        (h === undefined || h < 50) && (ab === undefined || ab <= 4)) return 'controlled';

    return 'near_target';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_sudden_onset_thunderclap', 'rf_first_severe_50plus', 'rf_neurological_signs',
  'rf_fever_neck_stiffness', 'rf_valsalva_induced', 'rf_pregnancy_new_headache',
  'rf_hiv_immunosuppressed', 'rf_post_trauma',
  'cm_moh', 'cm_migraine_chronic',
];

/* -------------------------------------------------------- */
/*  HELPERS                                                 */
/* -------------------------------------------------------- */
export function formatAppliedTarget() {
  return '頭痛 ≤2日/月 + MIDAS ≤5 + 急性期薬 ≤4日/月';
}

export function suggestAgeNudge() {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      cm_moh: 'MOH自動検出',
      cm_migraine_chronic: '慢性片頭痛（月≥15日）自動検出',
      cm_migraine_freq_4plus: '予防適応（月≥4日）自動検出',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const d = metricValues.headache_days_per_month;
  const ab = metricValues.abortive_days_per_month;
  if (d !== undefined && d >= 15) flags.push('cm_migraine_chronic');
  if (d !== undefined && d >= 4) flags.push('cm_migraine_freq_4plus');

  // MOH 分類: 薬剤クラスごとの閾値が異なる
  //   トリプタン・エルゴット・合剤（アセトアミノフェン+NSAID+カフェイン等）: 月≥10日
  //   単純鎮痛薬（NSAID・アセトアミノフェン単剤）: 月≥15日
  const cls = (currentDrugs || []).map((id) => {
    const drug = (allDrugs || []).find((x) => x.id === id);
    return drug ? drug.class : null;
  }).filter(Boolean);
  const onTriptanOrCombo = cls.some((c) => c === 'トリプタン' || c === 'ジタン' || c === 'エルゴタミン' || c === '合剤' || c === 'オピオイド');
  const onSimpleAnalgesic = cls.some((c) => c === '急性期NSAID' || c === '急性期アセトアミノフェン');

  if (ab !== undefined && ab >= 10 && onTriptanOrCombo) {
    flags.push('cm_moh_triptan_overuse');
    flags.push('cm_moh');
  }
  if (ab !== undefined && ab >= 15 && onSimpleAnalgesic) {
    flags.push('cm_moh_analgesic_overuse');
    flags.push('cm_moh');
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  const redFlags = ['rf_sudden_onset_thunderclap', 'rf_first_severe_50plus', 'rf_neurological_signs',
    'rf_fever_neck_stiffness', 'rf_valsalva_induced', 'rf_pregnancy_new_headache'];
  if (redFlags.some((rf) => mods.includes(rf))) {
    alerts.push({
      type: 'red_flag_urgent',
      label: '⚠ Red Flag: 二次性頭痛精査優先',
      detail: '薬物治療より先に画像（CT/MRI）・髄液・採血（ESR/CRP）検討。Booster推奨は保留',
    });
  }
  if (mods.includes('cm_moh')) {
    alerts.push({
      type: 'moh_urgent',
      label: '⚠ 薬物乱用頭痛: 離脱治療優先',
      detail: '原因薬中止（漸減or突然）+ 予防薬同時開始。頭痛日記で教育',
    });
  }
  if (mods.includes('rf_first_severe_50plus')) {
    alerts.push({
      type: 'gca_screen',
      label: '50歳以降初発: GCA スクリーニング',
      detail: 'ESR/CRP + 側頭動脈エコー + 視覚症状問診',
    });
  }
  if (mods.includes('cm_migraine_with_aura') && mods.includes('co_contraception_hormonal')) {
    alerts.push({
      type: 'aura_ocp',
      label: '⚠ 前兆あり片頭痛 + 経口避妊薬: 脳卒中リスク',
      detail: 'エストロゲン避妊薬は原則禁忌。プロゲスチン単剤 or 非ホルモン避妊へ',
      severity: 'critical',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasTriptan = currentClasses.has('トリプタン');
  const hasErgot = currentClasses.has('エルゴタミン');
  const hasBBlock = currentClasses.has('予防β遮断薬');
  const hasTCA = currentClasses.has('予防TCA');
  const hasVal = currentClasses.has('予防抗てんかん薬');

  if (hasTriptan && mods.includes('cm_ihd_or_stroke')) {
    alerts.push({
      type: 'triptan_cv',
      label: '⚠ トリプタン + CV既往: 禁忌',
      detail: 'ラスミジタン（血管収縮なし）へ切替',
      severity: 'critical',
    });
  }
  if (hasTriptan && mods.includes('co_ergot_within_24h')) {
    alerts.push({
      type: 'triptan_ergot_24h',
      label: '⚠ トリプタン + エルゴタミン 24h以内: 禁忌',
      detail: '血管収縮相加作用。24h以上あけて',
      severity: 'critical',
    });
  }
  if (hasTriptan && mods.includes('co_ssri_snri_use')) {
    alerts.push({
      type: 'triptan_ssri',
      label: 'トリプタン + SSRI/SNRI: セロトニン症候群リスク',
      detail: '理論的リスク。頻回使用で注意、症状出現なら中止',
    });
  }
  if (hasBBlock && mods.includes('cm_asthma')) {
    alerts.push({
      type: 'bb_asthma',
      label: '⚠ β遮断薬 + 喘息: 禁忌',
      detail: 'ロメリジン or バルプロ酸へ切替',
      severity: 'critical',
    });
  }
  if (hasTCA && (mods.includes('cm_narrow_angle_glaucoma') || mods.includes('cm_bph_urinary_retention'))) {
    alerts.push({
      type: 'tca_anticholinergic',
      label: '⚠ TCA + 緑内障/BPH: 抗コリン作用で悪化',
      detail: 'ロメリジン or プロプラノロール（喘息なければ）へ',
      severity: 'critical',
    });
  }
  if (hasVal && (mods.includes('co_pregnancy') || mods.includes('co_pregnancy_planning'))) {
    alerts.push({
      type: 'val_pregnancy',
      label: '⚠ バルプロ酸 + 妊娠: 催奇形性',
      detail: '神経管閉鎖障害・認知発達障害。即中止、プロプラノロール or 非薬物へ',
      severity: 'critical',
    });
  }
  if (mods.includes('cm_moh_triptan_overuse') || mods.includes('cm_moh_analgesic_overuse')) {
    alerts.push({
      type: 'moh_education',
      label: 'MOH予防教育: 急性期薬使用日数ルール',
      detail: 'トリプタン/合剤 月<10日、単純鎮痛 月<15日。頭痛日記推奨',
    });
  }
  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'rf_sudden_onset_thunderclap', 'rf_first_severe_50plus', 'rf_neurological_signs',
    'rf_fever_neck_stiffness', 'rf_pregnancy_new_headache', 'rf_hiv_immunosuppressed',
    'cm_migraine_chronic', 'cm_moh', 'cm_cluster_chronic',
  ].some((m) => modifiers.includes(m));
}

export function getCurrentClasses(currentDrugs, allDrugs) {
  const classes = new Set();
  currentDrugs.forEach((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const d = allDrugs.find((x) => x.id === id);
    if (d) classes.add(d.class);
  });
  return classes;
}

function drugRegimenLabel(currentDrugs, allDrugs) {
  return currentDrugs.map((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const d = allDrugs.find((x) => x.id === id);
    if (!d) return id;
    if (typeof entry === 'object' && d.doses) {
      const dose = d.doses.find((x) => x.value === entry.dose)?.label || '';
      return dose ? `${d.label} ${dose}` : d.label;
    }
    return d.label;
  }).join(' + ');
}

export function synthesizeMaintainRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（良好なコントロール）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '生活指導・トリガー回避を継続',
    reason: '頭痛≤2日/月、MIDAS≤5、急性期薬≤4日/月',
    reassess: '3ヶ月毎に頭痛日記・MIDAS。予防薬は 6-12ヶ月安定で漸減検討',
    note: 'トリガー同定（食事・睡眠・ストレス・月経・気圧）と生活習慣維持',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '生活指導 + トリガー記録 + 4週後再評価',
    example: '頭痛日記、睡眠規則化、ストレス管理、食事トリガー回避（カフェイン・チョコ・赤ワイン等）',
    reason: '軽度の頭痛増加。生活要因の修正で改善可能な段階',
    reassess: '4週後に頭痛日数・MIDAS 再評価',
    note: '急性期薬使用も日記で追跡（MOH予防）',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    pv_prop: ['cm_asthma', 'cm_copd', 'cm_bradycardia_av_block'],
    pv_ami: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention', 'cm_qt_prolongation', 'co_elderly_65'],
    pv_val: ['co_pregnancy', 'co_pregnancy_planning', 'cm_liver_severe'],
    cl_vera: ['cm_bradycardia_av_block', 'cm_qt_prolongation'],
  };
  const forbiddenMap = {
    pv_prop: ['cm_asthma', 'cm_copd', 'cm_bradycardia_av_block'],
    pv_val: ['co_pregnancy'],
    pv_ami: ['cm_narrow_angle_glaucoma'],
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
    example: `${drug.label} ${nextDose.label}（${currentDose.label} から漸増）`,
    reason: '現用量で頻度/強度コントロール不十分',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '2-4週後 副作用、3ヶ月後 頭痛日数で効果判定',
    _isDoseUp: true,
    _drugClass: drug.class,
  }));
}

/* -------------------------------------------------------- */
/*  RECOMMENDATIONS                                         */
/* -------------------------------------------------------- */
export const RECOMMENDATIONS = [
  // === Red Flag 優先 ===
  {
    id: 'refer_secondary_redflag_workup',
    action: 'REFER',
    drug: '⚠ Red Flag: 二次性頭痛 精査優先',
    reason: '雷鳴頭痛・50歳以降初発・巣症状・発熱項部硬直・Valsalva・妊娠新規・免疫抑制下 → 画像/髄液/GCA検査',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    urgentWhen: ['rf_sudden_onset_thunderclap', 'rf_neurological_signs', 'rf_fever_neck_stiffness',
      'rf_valsalva_induced', 'rf_pregnancy_new_headache', 'rf_first_severe_50plus'],
    note: '薬物治療より先に器質性除外',
  },

  // === NAIVE ===
  {
    id: 'naive_trigger_avoidance',
    action: 'WATCH',
    drug: '生活指導・トリガー回避',
    example: '睡眠規則化、カフェイン制限、ストレス管理、食事トリガー回避、月経誘発記録',
    reason: '軽症・低頻度は薬物前に生活指導',
    fromStates: ['naive'],
    forbidden: ['rf_sudden_onset_thunderclap', 'rf_neurological_signs', 'cm_migraine_chronic'],
  },
  {
    id: 'start_nsaid_apap_mild_moderate',
    action: 'STEP_UP',
    drug: 'NSAID or アセトアミノフェン（軽中等度）',
    example: 'ロキソニン 60mg、ナイキサン 300mg、カロナール 1000mg 頓用',
    reason: '軽中等度は NSAID/アセトアミノフェン第一選択',
    fromStates: ['naive'],
    drugClass: '急性期NSAID',
    forbidden: ['cm_ckd_g45', 'cm_peptic_ulcer_hx'],
    note: '月<15日ルール（MOH予防）',
  },
  {
    id: 'start_triptan_moderate_severe',
    action: 'STEP_UP',
    drug: 'トリプタン（中重度片頭痛、CV既往なし）',
    example: 'エレトリプタン 20mg、スマトリプタン 50mg、リザトリプタン 10mg OD',
    reason: '中重度片頭痛の第一選択',
    fromStates: ['naive'],
    drugClass: 'トリプタン',
    preferredWhen: ['cm_migraine_with_aura', 'cm_migraine_without_aura'],
    forbidden: ['cm_ihd_or_stroke', 'cm_htn_uncontrolled', 'co_ergot_within_24h', 'co_pregnancy'],
    note: '月<10日ルール（MOH予防）',
  },
  {
    id: 'start_lasmiditan_cv_risk',
    action: 'STEP_UP',
    drug: 'ラスミジタン（CV既往でも使用可）',
    example: 'レイボー 100mg 頓用（服用後8時間運転禁止）',
    reason: '血管収縮なし、トリプタン禁忌例の選択肢',
    fromStates: ['naive'],
    drugClass: 'ジタン',
    preferredWhen: ['cm_ihd_or_stroke', 'cm_htn_uncontrolled'],
    avoidWhen: ['co_driving_occupation'],
    note: '服用後8時間運転禁止を必ず説明',
  },
  {
    id: 'start_naratriptan_menstrual',
    action: 'STEP_UP',
    drug: 'ナラトリプタン（月経関連片頭痛、長時間作用）',
    example: 'アマージ 2.5mg×2/日 × 月経前後5-7日',
    reason: '半減期長く、月経関連の予防的短期使用に適',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['cm_migraine_menstrual'],
    forbidden: ['cm_ihd_or_stroke', 'co_pregnancy'],
  },

  // === 急性期 補助 ===
  {
    id: 'add_antiemetic_nausea',
    action: 'ADD',
    drug: '制吐薬追加（嘔気・嘔吐伴う）',
    example: 'プリンペラン 10mg or ナウゼリン 10mg 頓用',
    reason: '制吐 + 胃排出促進で経口薬吸収改善',
    fromStates: ['mono', 'dual'],
  },
  {
    id: 'combo_nsaid_triptan_severe',
    action: 'ADD',
    drug: 'NSAID + トリプタン 併用（重症）',
    example: 'ナイキサン 500mg + スマトリプタン 50mg',
    reason: '重症例で奏効率・再発抑制向上',
    fromStates: ['mono'],
    avoidWhen: ['cm_ckd_g45', 'cm_peptic_ulcer_hx'],
  },
  {
    id: 'switch_triptan_inadequate',
    action: 'SWITCH',
    drug: 'トリプタン切替（同剤2発作無効で別剤へ）',
    example: 'スマトリプタン→エレトリプタン、ゾルミトリプタン→リザトリプタンなど',
    reason: '個人差大。1剤無効でも別剤が効く',
    fromStates: ['mono'],
    targetClass: 'トリプタン',
  },

  // === 予防薬開始（片頭痛 月≥4日） ===
  {
    id: 'start_propranolol_prophy',
    action: 'STEP_UP',
    drug: 'プロプラノロール予防（第一選択、喘息なし）',
    example: 'インデラル 20mg×3/日 開始、2-4週で増量',
    reason: '片頭痛予防の古典的第一選択',
    fromStates: ['mono'],
    drugClass: '予防β遮断薬',
    preferredWhen: ['cm_migraine_freq_4plus', 'cm_ht'],
    forbidden: ['cm_asthma', 'cm_copd', 'cm_bradycardia_av_block'],
  },
  {
    id: 'start_lomerizine_asthma_copd',
    action: 'STEP_UP',
    drug: 'ロメリジン予防（喘息/COPD併存）',
    example: 'ミグシス 5mg×2/日',
    reason: '日本で片頭痛予防適応、β遮断薬禁忌例の選択',
    fromStates: ['mono'],
    drugClass: '予防Ca拮抗薬',
    preferredWhen: ['cm_asthma', 'cm_copd', 'cm_migraine_freq_4plus'],
  },
  {
    id: 'start_amitriptyline_depression_insomnia',
    action: 'STEP_UP',
    drug: 'アミトリプチリン（うつ・不眠併存）',
    example: 'トリプタノール 10mg 就寝前から',
    reason: '片頭痛/緊張型 予防+うつ+不眠の一石二鳥',
    fromStates: ['mono'],
    drugClass: '予防TCA',
    preferredWhen: ['cm_depression', 'cm_insomnia', 'cm_tension_type'],
    forbidden: ['cm_narrow_angle_glaucoma', 'cm_qt_prolongation'],
    avoidWhen: ['cm_bph_urinary_retention', 'co_elderly_65'],
  },
  {
    id: 'start_valproate_epilepsy',
    action: 'STEP_UP',
    drug: 'バルプロ酸（てんかん/躁うつ併存）',
    example: 'デパケン 200mg/日',
    reason: '片頭痛+てんかん/躁うつで一石二鳥',
    fromStates: ['mono'],
    drugClass: '予防抗てんかん薬',
    preferredWhen: ['cm_epilepsy'],
    forbidden: ['co_pregnancy', 'co_pregnancy_planning', 'cm_liver_severe'],
  },
  {
    id: 'start_topiramate_alt_first_line',
    action: 'STEP_UP',
    drug: 'トピラマート（β遮断薬不可・肥満/てんかん併存）',
    example: 'トピナ 25mg夜 開始 → 2週毎漸増 → 50-100mg/日',
    reason: '国際GL（AAN/AHS）で片頭痛予防エビデンスA。喘息/COPD/徐脈でβ遮断薬不可な症例の代替。日本では適応外使用',
    fromStates: ['mono'],
    drugClass: '予防抗てんかん薬',
    preferredWhen: ['cm_asthma', 'cm_copd', 'cm_bradycardia_av_block', 'cm_obesity', 'cm_epilepsy', 'cm_migraine_freq_4plus'],
    forbidden: ['co_pregnancy', 'co_pregnancy_planning'],
    avoidWhen: ['co_kidney_stone_hx', 'cm_glaucoma'],
    note: '副作用: 体重減・感覚異常・認知緩慢・腎結石・代謝性アシドーシス。日本適応外なので説明文書化',
  },

  // === CGRP抗体（難治、専門医） ===
  {
    id: 'refer_cgrp_ab_refractory',
    action: 'REFER',
    drug: 'CGRP抗体検討 → 頭痛専門医紹介',
    example: 'エレヌマブ 70mg、ガルカネズマブ 120mg、フレマネズマブ 225mg 月1回SC',
    reason: '従来予防薬 2剤以上無効/禁忌の片頭痛。保険適応',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['cm_prior_prevention_2_failure', 'cm_migraine_chronic', 'cm_migraine_freq_4plus'],
    forbidden: ['co_pregnancy'],
    specialistGate: true,
    note: '効果判定は3ヶ月（12週）で MIDAS/HIT-6/頭痛日数を比較。50%以上減少で継続。保険適応条件: 従来予防薬 2剤以上無効/禁忌、月片頭痛日数≥4',
  },
  {
    id: 'refer_botox_chronic_migraine',
    action: 'REFER',
    drug: 'ボトックス検討（慢性片頭痛）',
    example: 'オナボA 155U 頭頸部31箇所 12週毎',
    reason: '慢性片頭痛（月≥15日×3ヶ月）で保険適応（日本2024〜）',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['cm_migraine_chronic'],
    specialistGate: true,
  },

  // === 緊張型 ===
  {
    id: 'start_amitriptyline_tth',
    action: 'STEP_UP',
    drug: 'アミトリプチリン（慢性緊張型）',
    example: 'トリプタノール 10mg 就寝前から漸増（10→25→75mg）',
    reason: '慢性TTH第一選択',
    fromStates: ['mono'],
    drugClass: '予防TCA',
    preferredWhen: ['cm_tension_type'],
    forbidden: ['cm_narrow_angle_glaucoma'],
  },

  // === 群発頭痛 ===
  {
    id: 'cluster_acute_oxygen_sumatriptan_sc',
    action: 'ADD',
    drug: '群発急性期: 酸素 + スマトリプタンSC',
    example: '酸素 7-12L/min マスク×15分 + スマトリプタン皮下注 3mg',
    reason: '経口は発作が短すぎて間に合わない',
    fromStates: ['naive', 'mono'],
    urgentWhen: ['cm_cluster'],
    preferredWhen: ['cm_cluster'],
  },
  {
    id: 'cluster_prevention_verapamil',
    action: 'STEP_UP',
    drug: '群発予防: ベラパミル（cluster期のみ）',
    example: 'ベラパミル 80mg×3/日 開始 → ECG確認しつつ240→480→960mg',
    reason: '群発予防第一選択。QT/PR 要モニタ',
    fromStates: ['naive', 'mono'],
    drugClass: '群発予防',
    preferredWhen: ['cm_cluster'],
    forbidden: ['cm_bradycardia_av_block'],
    note: 'ECG baseline + 増量毎、PR>0.22s or QT延長で中止',
  },
  {
    id: 'cluster_prevention_galcanezumab',
    action: 'REFER',
    drug: 'ガルカネズマブ（慢性群発頭痛、保険適応）',
    example: '300mg SC 月1回（片頭痛用120mgと異なる）',
    reason: 'ベラパミル不十分 or 慢性群発',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['cm_cluster_chronic'],
    specialistGate: true,
  },

  // === MOH ===
  {
    id: 'moh_withdraw_offending',
    action: 'STOP',
    drug: '⚠ MOH: 原因薬中止（離脱）',
    example: 'トリプタン/合剤/オピオイド/エルゴ → 突然中止。NSAID/アセトアミノフェン → 2週間で漸減 (毎週半減)',
    reason: '薬物乱用頭痛は原因薬中止で寛解。「制限」では効果不十分、完全中止 or 別系統への切替が GL推奨',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['cm_moh'],
    preferredWhen: ['cm_moh_triptan_overuse', 'cm_moh_analgesic_overuse'],
    note: '【MOH 離脱プロトコル詳細】\n① 薬剤完全中止（突然 or 漸減）2-4週\n② 離脱期は制吐（メトクロプラミド）・輸液・短期PSL 30mg×5日 or 短期NSAID（別クラス使用していなければ）\n③ 同時に予防薬導入 (プロプラノロール/アミトリプチリン/CGRP抗体)\n④ 4週後評価：頭痛日数50%減なら継続、増悪なら入院・専門医\n⑤ 制限（週2-3回）のみは離脱効果不十分。GL第一は「中止」',
  },
  {
    id: 'moh_start_prevention',
    action: 'ADD',
    drug: 'MOH後: 予防薬同時開始',
    example: 'プロプラノロール or アミトリプチリン or CGRP抗体（難治時）',
    reason: 'MOH離脱のみでは再発多い',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_moh'],
    note: '効果判定は3ヶ月。MIDAS/HIT-6 + 急性期薬日数で評価',
  },

  // === Special populations ===
  {
    id: 'pregnancy_acetaminophen_first',
    action: 'STEP_UP',
    drug: '妊娠中: アセトアミノフェン第一',
    example: 'カロナール 500-1000mg 頓用。NSAIDは20週未満のみ短期、28週以降禁',
    reason: '妊娠中の頭痛は器質性除外→アセトアミノフェン',
    fromStates: ['naive', 'mono'],
    urgentWhen: ['co_pregnancy'],
    preferredWhen: ['co_pregnancy'],
    forbidden: ['rf_pregnancy_new_headache'],
    note: '予防: マグネシウム、プロプラノロール慎重、CBT。バルプロ酸・トピラマート・トリプタン禁忌',
  },
  {
    id: 'pediatric_ibu_apap_first',
    action: 'STEP_UP',
    drug: '小児: イブプロフェン/アセトアミノフェン',
    example: 'イブプロ 7.5-10mg/kg、アセトアミノフェン 15mg/kg',
    reason: '小児片頭痛の第一選択',
    fromStates: ['naive'],
    preferredWhen: ['co_pediatric_6_11', 'co_pediatric_12_17'],
    forbidden: ['co_pediatric_lt6'],
    note: 'トリプタンは12歳以上（日本）: リザトリプタン、ゾルミトリプタン',
  },
  {
    id: 'elderly_new_headache_workup',
    action: 'REFER',
    drug: '⚠ 高齢者 新規頭痛: 二次性精査',
    reason: '50歳以降初発はGCA・脳腫瘍・血腫を疑う',
    fromStates: ['naive'],
    urgentWhen: ['rf_first_severe_50plus'],
    preferredWhen: ['co_elderly_65'],
    note: 'ESR/CRP + 側頭動脈エコー + MRI',
  },

  // === TAPER ===
  {
    id: 'taper_prevention_12mo_stable',
    action: 'TAPER',
    drug: '予防薬漸減（12ヶ月以上安定）',
    reason: '長期安定で減量・中止検討。再発は頭痛日記で監視',
    fromStates: ['mono', 'dual'],
    note: '急な中止より漸減、再発時は再開',
  },
  {
    id: 'evaluate_prevention_3_6mo',
    action: 'WATCH',
    drug: '予防薬効果判定（3-6ヶ月試行）',
    reason: '頭痛日数50%減で有効。無効なら別剤へ',
    fromStates: ['mono', 'dual'],
    note: '開始用量→至適用量まで3ヶ月、効果判定は6ヶ月目',
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'トリプタン',
    modifiers: ['cm_ihd_or_stroke'],
    reason: '【禁忌】虚血性心疾患・脳梗塞既往。ラスミジタンへ',
  },
  {
    drug: 'トリプタン',
    modifiers: ['co_ergot_within_24h'],
    reason: '【禁忌】エルゴタミンとの24時間以内併用は血管収縮相加',
  },
  {
    drug: 'トリプタン',
    modifiers: ['co_pregnancy'],
    reason: '【相対禁忌】妊娠中は緊急時のみスマトリプタン',
  },
  {
    drug: 'NSAID',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】eGFR<30でAKI・高K血症',
  },
  {
    drug: 'NSAID',
    modifiers: ['cm_peptic_ulcer_hx'],
    reason: '【要注意】PPI併用 or セレコキシブ（COX-2）',
  },
  {
    drug: 'プロプラノロール',
    modifiers: ['cm_asthma', 'cm_copd', 'cm_bradycardia_av_block'],
    reason: '【禁忌】β2遮断で喘息/COPD悪化（気管支攣縮）、徐脈',
  },
  {
    drug: 'バルプロ酸',
    modifiers: ['co_pregnancy', 'co_pregnancy_planning'],
    reason: '【禁忌】催奇形性（神経管閉鎖障害・認知発達障害）',
  },
  {
    drug: 'アミトリプチリン',
    modifiers: ['cm_narrow_angle_glaucoma', 'cm_qt_prolongation'],
    reason: '【禁忌】抗コリン作用で緑内障発作、QT延長',
  },
  {
    drug: 'CGRP抗体',
    modifiers: ['co_pregnancy'],
    reason: '【慎重】安全性データ不足、長半減期でwashout困難',
  },
  {
    drug: '急性期薬（トリプタン/合剤）',
    modifiers: ['cm_moh_triptan_overuse'],
    reason: '【MOH】月≥10日使用で薬物乱用頭痛。予防薬導入+離脱',
  },
  {
    drug: 'ベラパミル',
    modifiers: ['cm_bradycardia_av_block'],
    reason: '【禁忌】QT延長・AVブロックで悪化。ECG要モニタ',
  },
  {
    drug: 'オピオイド（頭痛治療目的）',
    modifiers: ['co_opioid_use', 'cm_migraine_chronic', 'cm_migraine_freq_4plus'],
    reason: '【非推奨】片頭痛にオピオイドはMOH/依存リスク高、効果も乏しい。トリプタン+予防薬+CGRP抗体の優先',
  },
  {
    drug: 'トピラマート',
    modifiers: ['co_pregnancy', 'co_pregnancy_planning'],
    reason: '【禁忌】催奇形性（口唇口蓋裂リスク増）。妊娠希望時は中止',
  },
];
