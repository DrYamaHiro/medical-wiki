/**
 * Treatment Booster — COPD 治療修正データ
 * JRS COPD診断と治療のためのガイドライン 第6版 2022 + GOLD 2024 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // LAMA 単剤
  { id: 'lama_tio_resp', label: 'チオトロピウム（スピリーバ レスピマット 2.5μg）', class: 'LAMA',
    device: 'SMI',
    doses: [{ value: '2_qd', label: '2吸入 1日1回（低吸気流量可、高齢者向）', isDefault: true, isMax: true }] },
  { id: 'lama_tio_hh', label: 'チオトロピウム（スピリーバ ハンディヘラー 18μg）', class: 'LAMA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回（吸気力50L/min要）', isDefault: true, isMax: true }] },
  { id: 'lama_gly', label: 'グリコピロニウム（シーブリ ブリーズヘラー 50μg）', class: 'LAMA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },
  { id: 'lama_ume', label: 'ウメクリジニウム（エンクラッセ エリプタ 62.5μg）', class: 'LAMA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },
  { id: 'lama_acl', label: 'アクリジニウム（エクリラ ジェヌエア 400μg）', class: 'LAMA',
    device: 'DPI',
    doses: [{ value: '1_bid', label: '1吸入 1日2回', isDefault: true, isMax: true }] },

  // LABA 単剤
  { id: 'laba_ind', label: 'インダカテロール（オンブレス ブリーズヘラー 150μg）', class: 'LABA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },

  // LAMA/LABA 合剤（第一選択）
  { id: 'combo_ult', label: 'ウルティブロ ブリーズヘラー（グリコ50/インダ110）', class: 'LAMA/LABA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },
  { id: 'combo_anoro', label: 'アノーロ エリプタ（ウメク62.5/ビラン25）', class: 'LAMA/LABA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },
  { id: 'combo_spiolto', label: 'スピオルト レスピマット（チオ/オロダ）', class: 'LAMA/LABA',
    device: 'SMI',
    doses: [{ value: '2_qd', label: '2吸入 1日1回（低吸気流量可）', isDefault: true, isMax: true }] },
  { id: 'combo_bevespi', label: 'ビベスピ エアロスフィア（グリコ/ホルモ）', class: 'LAMA/LABA',
    device: 'pMDI',
    doses: [{ value: '2_bid', label: '2吸入 1日2回（スペーサー併用可）', isDefault: true, isMax: true }] },

  // ICS/LABA 合剤（COPD適応あり）
  { id: 'ics_laba_adoair250', label: 'アドエア ディスカス 250', class: 'ICS/LABA',
    device: 'DPI',
    doses: [
      { value: '1_bid_250', label: '1吸入 1日2回（COPD 250）', isDefault: true },
      { value: '1_bid_500', label: 'アドエア500 1吸入 1日2回（高用量）', isMax: true },
    ] },
  { id: 'ics_laba_relvar', label: 'レルベア エリプタ 100', class: 'ICS/LABA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },

  // ICS/LABA/LAMA Triple
  { id: 'triple_trelegy', label: 'テリルジー エリプタ 100（FF/UMEC/VI）', class: 'ICS/LABA/LAMA',
    device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入 1日1回', isDefault: true, isMax: true }] },
  { id: 'triple_breztri', label: 'ビレーズトリ エアロスフィア（BUD/GLY/FOR）', class: 'ICS/LABA/LAMA',
    device: 'pMDI',
    doses: [{ value: '2_bid', label: '2吸入 1日2回', isDefault: true, isMax: true }] },

  // 急性期
  { id: 'acute_saba_sama_neb', label: 'サルブタモール + イプラトロピウム ネブライザー', class: 'SABA/SAMA(急性期)',
    doses: [{ value: 'neb_q20_3', label: '0.5mL + 2mL ネブ 20分毎×3回', isDefault: true, isMax: true }] },
  { id: 'acute_psl_burst', label: 'プレドニゾロン（プレドニン）burst', class: 'OCS(急性期)',
    doses: [{ value: '30_5d', label: '30mg/日×5日（漸減不要、GOLD 2024）', isDefault: true, isMax: true }] },
  { id: 'acute_ampc_cva', label: 'アモキシシリン/クラブラン酸（抗生剤）', class: '抗生剤(急性期)',
    doses: [{ value: '250_tid_5d', label: '250/125mg×3/日×5-7日（喀痰膿性時）', isDefault: true, isMax: true }] },
  { id: 'acute_doxy', label: 'ドキシサイクリン（抗生剤代替）', class: '抗生剤(急性期)',
    doses: [{ value: '100_bid_5d', label: '100mg×2/日×5日', isDefault: true, isMax: true }] },
  { id: 'acute_lvfx', label: 'レボフロキサシン（重症・耐性菌）', class: '抗生剤(急性期)',
    doses: [{ value: '500_qd_5_7d', label: '500mg×1/日×5-7日', isDefault: true, isMax: true }] },

  // 禁煙補助
  { id: 'smoke_vare', label: 'バレニクリン（チャンピックス）', class: '禁煙補助',
    doses: [{ value: 'titration', label: '0.5mg→漸増→1mg×2/日 × 12週', isDefault: true, isMax: true }] },
  { id: 'smoke_patch', label: 'ニコチンパッチ', class: '禁煙補助',
    doses: [{ value: 'titration', label: '漸減プロトコル × 10週', isDefault: true, isMax: true }] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_ics_pneumonia', label: 'ICS関連肺炎既往', cat: '副作用', severity: 'critical' },
  { id: 'se_oral_candidiasis', label: '口腔カンジダ（ICS）', cat: '副作用' },
  { id: 'se_lama_glaucoma', label: 'LAMA による緑内障発作', cat: '副作用', severity: 'critical' },
  { id: 'se_lama_urinary_retention', label: 'LAMA による尿閉', cat: '副作用' },
  { id: 'se_laba_tachycardia', label: 'β刺激 頻脈・動悸', cat: '副作用' },

  // Phenotype
  { id: 'cm_aco', label: 'ACO（asthma-COPD overlap、喘息既往+可変性）', cat: 'Phenotype' },
  { id: 'cm_asthma_hx', label: '喘息既往', cat: 'Phenotype' },
  { id: 'cm_allergic', label: 'アレルギー性（IgE高値/アトピー）', cat: 'Phenotype' },
  { id: 'cm_emphysema_dominant', label: '気腫優位型（痩せ型・肺過膨張・DLCO低下）', cat: 'Phenotype' },
  { id: 'cm_chronic_bronchitis', label: '慢性気管支炎型（慢性痰・感染反復）', cat: 'Phenotype' },
  { id: 'cm_alpha1at_deficient', label: 'α1-AT欠損症（若年発症・家族歴）', cat: 'Phenotype', severity: 'critical' },

  // 好酸球
  { id: 'cm_eosinophilic_100', label: '末梢血好酸球 <100/μL（ICS非推奨）', cat: '好酸球' },
  { id: 'cm_eosinophilic_300', label: '末梢血好酸球 ≥300/μL（ICS追加推奨）', cat: '好酸球' },

  // 増悪・重症度
  { id: 'cm_frequent_exacerbator', label: '頻回増悪（≥2回/年）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_hospitalized_past_year', label: '増悪で入院歴あり（過去1年）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_pneumonia_hx', label: '肺炎既往（ICS関連含む）', cat: '併存疾患' },
  { id: 'cm_cor_pulmonale', label: '肺性心・右心不全', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_co2_retainer', label: 'CO2貯留型（PaCO2>50）', cat: '併存疾患', severity: 'critical' },

  // LAMA 禁忌関連
  { id: 'cm_narrow_angle_glaucoma', label: '狭隅角緑内障', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_bph_urinary_retention', label: 'BPH・排尿障害', cat: '併存疾患' },

  // 感染症
  { id: 'cm_active_tb', label: '活動性肺結核', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_pseudomonas_risk', label: '緑膿菌リスク（入院歴・広域抗生剤既往・気管支拡張症）', cat: '併存疾患' },

  // 併存症
  { id: 'cm_ht', label: '高血圧', cat: '併存疾患' },
  { id: 'cm_hf', label: '心不全', cat: '併存疾患' },
  { id: 'cm_cad', label: '冠動脈疾患', cat: '併存疾患' },
  { id: 'cm_af', label: '心房細動', cat: '併存疾患' },
  { id: 'cm_dm', label: '糖尿病', cat: '併存疾患' },
  { id: 'cm_osteoporosis', label: '骨粗鬆症（ICS/OCS長期で悪化）', cat: '併存疾患' },
  { id: 'cm_malnutrition', label: '栄養不良（BMI<21）', cat: '併存疾患' },
  { id: 'cm_cachexia', label: '悪液質（気腫型）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_depression', label: 'うつ・不安', cat: '併存疾患' },
  { id: 'cm_osas', label: 'OSAS（overlap syndrome）', cat: '併存疾患' },
  { id: 'cm_sputum_purulent', label: '喀痰膿性（増悪時抗生剤適応）', cat: '併存疾患' },

  // 制約
  { id: 'co_current_smoker', label: '現喫煙', cat: '制約', severity: 'critical' },
  { id: 'co_smoker_past', label: '過去喫煙（1年以内）', cat: '制約' },
  { id: 'co_on_hot', label: 'HOT（在宅酸素療法）使用中', cat: '制約' },
  { id: 'co_vaccines_current', label: 'ワクチン最新（インフル/肺炎球菌/COVID/RSV等）', cat: '制約' },
  { id: 'co_pulm_rehab_candidate', label: '肺リハ候補（mMRC≥2）', cat: '制約' },
  { id: 'co_dpi_insufficient_effort', label: 'DPI吸気力不足（<50L/min）', cat: '制約' },
  { id: 'co_pmdi_coordination', label: 'pMDI協調困難', cat: '制約' },
  { id: 'co_elderly_75', label: '高齢者（≥75歳）', cat: '制約' },
  { id: 'co_poor_adherence_bid', label: 'BIDアドヒアランス不良（QD希望）', cat: '制約' },
  { id: 'co_nonselective_bb_use', label: '非選択性β遮断薬併用中', cat: '制約', severity: 'critical' },
  { id: 'co_spirometry_not_done', label: 'スパイロメトリー未施行', cat: '制約' },

  // 失敗歴
  { id: 'fh_ics_pneumonia', label: 'ICSで肺炎発症歴', cat: '失敗歴' },

  // Red Flag
  { id: 'rf_ae_copd_mild', label: '増悪 軽度（SABA対応可）', cat: 'Red Flag' },
  { id: 'rf_ae_copd_moderate', label: '増悪 中等度（OCS+抗生剤必要）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_ae_copd_severe', label: '増悪 重度（入院適応）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_respiratory_failure', label: '呼吸不全（SpO2<90 or PaO2<60）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC                                          */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: 'COPD評価（mMRC + CAT + FEV1 + 増悪歴）',
  inputs: [
    { id: 'mmrc', label: 'mMRC（0-4）', unit: '', placeholder: '例:2' },
    { id: 'cat', label: 'CAT（0-40）', unit: '点', placeholder: '例:15' },
    { id: 'fev1_pct', label: 'FEV1 %pred', unit: '%', placeholder: '例:55' },
    { id: 'exacerbations_past_year', label: '過去1年の増悪回数', unit: '回', placeholder: '例:1' },
    { id: 'hospitalizations_past_year', label: '増悪による入院回数', unit: '回', placeholder: '例:0' },
    { id: 'eos', label: '末梢血好酸球', unit: '/μL', placeholder: '任意:200' },
  ],
  note: 'GOLD 2024 ABE分類: A=軽症(CAT<10+mMRC 0-1+増悪なし)、B=症状あり+増悪なし、E=増悪≥2 or 入院≥1。症候性全例に肺リハ推奨',
  deriveStatus: (v, modifiers = []) => {
    const has = (m) => modifiers.includes(m);
    const mmrc = v.mmrc;
    const cat = v.cat;
    const fev1 = v.fev1_pct;
    const exac = v.exacerbations_past_year;
    const hosp = v.hospitalizations_past_year;

    if (mmrc === undefined && cat === undefined && exac === undefined) return null;

    // Overcontrolled: ICS副作用顕在化で症状軽微
    if ((has('se_ics_pneumonia') || has('se_oral_candidiasis') || has('fh_ics_pneumonia')) &&
        ((cat !== undefined && cat < 10) && (mmrc === undefined || mmrc <= 1))) {
      return 'overcontrolled';
    }

    // Uncontrolled: Group E 相当 or 呼吸不全
    if (has('rf_respiratory_failure') || has('rf_ae_copd_moderate') || has('rf_ae_copd_severe')) return 'uncontrolled';
    if ((exac !== undefined && exac >= 2) || (hosp !== undefined && hosp >= 1)) return 'uncontrolled';
    if ((mmrc !== undefined && mmrc >= 3) || (cat !== undefined && cat > 20) || (fev1 !== undefined && fev1 < 30)) return 'uncontrolled';

    // Near target: Group B or GOLD 3
    if ((cat !== undefined && cat >= 10) || (mmrc !== undefined && mmrc === 2) ||
        (fev1 !== undefined && fev1 >= 30 && fev1 < 50)) return 'near_target';

    // Controlled: Group A
    if ((cat === undefined || cat < 10) && (mmrc === undefined || mmrc <= 1) &&
        (exac === undefined || exac === 0) && (fev1 === undefined || fev1 >= 50)) return 'controlled';

    return 'near_target';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_ae_copd_mild', 'rf_ae_copd_moderate', 'rf_ae_copd_severe',
  'rf_respiratory_failure',
  'cm_frequent_exacerbator',
  'cm_hospitalized_past_year',
  'se_ics_pneumonia',
  'co_current_smoker',
];

/* -------------------------------------------------------- */
/*  HELPERS                                                 */
/* -------------------------------------------------------- */
export function formatAppliedTarget() {
  return 'CAT<10 + mMRC 0-1 + 増悪なし（GOLD Group A 維持）';
}

export function suggestAgeNudge() {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      cm_frequent_exacerbator: '頻回増悪（≥2回/年）自動検出',
      cm_hospitalized_past_year: '増悪入院歴 自動検出',
      cm_eosinophilic_300: 'eos ≥300 自動検出（ICS検討）',
      cm_eosinophilic_100: 'eos <100 自動検出（ICS非推奨）',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const exac = metricValues.exacerbations_past_year;
  const hosp = metricValues.hospitalizations_past_year;
  const eos = metricValues.eos;
  if (exac !== undefined && exac >= 2) flags.push('cm_frequent_exacerbator');
  if (hosp !== undefined && hosp >= 1) flags.push('cm_hospitalized_past_year');
  if (eos !== undefined && eos >= 300) flags.push('cm_eosinophilic_300');
  else if (eos !== undefined && eos < 100) flags.push('cm_eosinophilic_100');
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  if (mods.includes('co_current_smoker')) {
    alerts.push({
      type: 'smoking_urgent',
      label: '⚠ 現喫煙: 禁煙が最大の予後改善因子',
      detail: 'バレニクリン・ニコチンパッチ・CBT。禁煙外来紹介も。全治療の前提',
    });
  }
  if (mods.includes('co_spirometry_not_done')) {
    alerts.push({
      type: 'spirometry_needed',
      label: 'スパイロメトリー未施行',
      detail: 'COPD診断・重症度分類には気管支拡張薬後 FEV1/FVC<0.70 確認必須',
    });
  }
  if (mods.includes('cm_alpha1at_deficient')) {
    alerts.push({
      type: 'alpha1at_referral',
      label: 'α1-AT欠損症: 専門医紹介必須',
      detail: '若年発症・家族歴 → 血中α1-AT濃度測定、α1-AT補充療法検討',
    });
  }
  if (!mods.includes('co_vaccines_current')) {
    alerts.push({
      type: 'vaccines_reminder',
      label: 'ワクチン接種状況確認',
      detail: 'インフル年1回 + 肺炎球菌（PPSV23+PCV13）+ RSV + 帯状疱疹 + COVID-19',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasLAMA = currentClasses.has('LAMA') || currentClasses.has('LAMA/LABA') || currentClasses.has('ICS/LABA/LAMA');
  const hasICS = currentClasses.has('ICS/LABA') || currentClasses.has('ICS/LABA/LAMA');
  const hasSABA = currentClasses.has('SABA/SAMA(急性期)');

  if (hasLAMA && mods.includes('cm_narrow_angle_glaucoma')) {
    alerts.push({
      type: 'lama_glaucoma',
      label: '⚠ LAMA + 狭隅角緑内障: 禁忌',
      detail: 'LAMA中止、LABA単剤（インダカテロール）へ切替',
      severity: 'critical',
    });
  }
  if (hasLAMA && mods.includes('cm_bph_urinary_retention')) {
    alerts.push({
      type: 'lama_bph',
      label: 'LAMA + 重症BPH: 慎重投与',
      detail: '尿閉リスク。泌尿器科コンサル、症状出現で中止',
    });
  }
  if (hasICS && (mods.includes('cm_pneumonia_hx') || mods.includes('cm_eosinophilic_100'))) {
    alerts.push({
      type: 'ics_withdrawal_consider',
      label: 'ICS中止（withdrawal）を検討',
      detail: '肺炎既往 or eos<100 + 増悪なし → ICS離脱で肺炎リスク低減',
    });
  }
  if (hasICS && mods.includes('cm_active_tb')) {
    alerts.push({
      type: 'ics_tb',
      label: '⚠ ICS + 活動性結核: 禁忌',
      detail: 'ICS中止、抗結核治療優先',
      severity: 'critical',
    });
  }
  if (mods.includes('co_nonselective_bb_use')) {
    alerts.push({
      type: 'nonselective_bb',
      label: '⚠ 非選択性β遮断薬併用: 気管支攣縮リスク',
      detail: 'β1選択性（ビソプロロール・カルベジロール）へ切替を循環器と相談',
      severity: 'critical',
    });
  }
  if (mods.includes('cm_co2_retainer') && mods.includes('co_on_hot')) {
    alerts.push({
      type: 'co2_retainer_o2',
      label: '⚠ CO2貯留型 + 酸素療法: SpO2 88-92%目標',
      detail: '高流量O2はCO2ナルコーシス。ベンチュリマスクで濃度コントロール',
      severity: 'critical',
    });
  }
  if (mods.includes('cm_aco') && !hasICS) {
    alerts.push({
      type: 'aco_ics_needed',
      label: 'ACO + ICSなし',
      detail: '喘息成分があるためICS必須。Triple or ICS/LABA へ',
    });
  }
  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'rf_ae_copd_moderate', 'rf_ae_copd_severe',
    'rf_respiratory_failure',
    'cm_frequent_exacerbator',
    'cm_hospitalized_past_year',
    'cm_cor_pulmonale',
    'cm_co2_retainer',
    'cm_alpha1at_deficient',
  ].some((m) => modifiers.includes(m));
}

export function getCurrentClasses(currentDrugs, allDrugs) {
  const classes = new Set();
  currentDrugs.forEach((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
    // 合剤展開
    if (drug?.class === 'LAMA/LABA') {
      classes.add('LAMA'); classes.add('LABA');
    }
    if (drug?.class === 'ICS/LABA') {
      classes.add('ICS'); classes.add('LABA');
    }
    if (drug?.class === 'ICS/LABA/LAMA') {
      classes.add('ICS'); classes.add('LABA'); classes.add('LAMA');
    }
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
  const smokerNote = modifiers.includes('co_smoker_past') ? '禁煙継続' : '禁煙維持';
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（COPD Group A、症状安定）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : 'LAMA単剤で継続',
    reason: 'CAT<10 + mMRC 0-1 + 増悪なし。ワクチン最新、禁煙維持',
    reassess: `6-12ヶ月毎に mMRC・CAT・増悪歴・スパイロ、年1回ワクチン確認。${smokerNote}`,
    note: 'COPDは慢性進行性。経過観察+ワクチン+肺リハ+禁煙の継続が予後を決める',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '非薬物最適化 + 4週後再評価',
    example: '禁煙確認・吸入手技確認・ワクチン更新・肺リハ導入',
    reason: '軽度症状悪化。薬物強化の前に非薬物要素を確認（禁煙・手技・アドヒアランス）',
    reassess: '4週後 CAT・mMRC 再評価。改善なければ step up',
    note: '見かけ上 uncontrolled の 30-50% は手技・アドヒアランス・喫煙継続が原因',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    lama_tio_resp: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention'],
    lama_tio_hh: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention', 'co_dpi_insufficient_effort'],
    combo_ult: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention', 'co_dpi_insufficient_effort'],
    combo_anoro: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention', 'co_dpi_insufficient_effort'],
    combo_spiolto: ['cm_narrow_angle_glaucoma', 'cm_bph_urinary_retention'],
    triple_trelegy: ['cm_narrow_angle_glaucoma', 'cm_pneumonia_hx', 'cm_eosinophilic_100'],
    triple_breztri: ['cm_narrow_angle_glaucoma', 'cm_pneumonia_hx', 'cm_eosinophilic_100'],
    ics_laba_adoair250: ['cm_pneumonia_hx', 'cm_eosinophilic_100'],
    ics_laba_relvar: ['cm_pneumonia_hx', 'cm_eosinophilic_100'],
  };
  const forbiddenMap = {
    lama_tio_resp: ['se_lama_glaucoma'], lama_tio_hh: ['se_lama_glaucoma'],
    combo_ult: ['se_lama_glaucoma'], combo_anoro: ['se_lama_glaucoma'],
    combo_spiolto: ['se_lama_glaucoma'], combo_bevespi: ['se_lama_glaucoma'],
    triple_trelegy: ['se_lama_glaucoma', 'cm_active_tb'], triple_breztri: ['se_lama_glaucoma', 'cm_active_tb'],
    ics_laba_adoair250: ['cm_active_tb'], ics_laba_relvar: ['cm_active_tb'],
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
    example: `${drug.label} ${nextDose.label}（${currentDose.label} から）`,
    reason: '現用量で症状・増悪残存。同一薬剤の増量は新薬追加より優先',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '4-8週後 CAT・mMRC・副作用確認',
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
    id: 'naive_smoking_cessation_first',
    action: 'WATCH',
    drug: '⚠ 禁煙が最優先（全治療の前提）',
    example: 'バレニクリン 0.5mg→1mg×2/日×12週、ニコチンパッチ、CBT、禁煙外来',
    reason: 'COPD進行抑制の最大因子。薬物治療より優先',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    urgentWhen: ['co_current_smoker'],
    preferredWhen: ['co_current_smoker'],
  },
  {
    id: 'refer_spirometry_confirmation',
    action: 'WATCH',
    drug: 'スパイロメトリー施行（診断確定）',
    reason: 'COPD診断には気管支拡張薬後 FEV1/FVC<0.70 が必須',
    fromStates: ['naive'],
    preferredWhen: ['co_spirometry_not_done'],
  },
  {
    id: 'start_lama_group_a',
    action: 'STEP_UP',
    drug: 'LAMA単剤 開始（Group A、軽症）',
    example: 'スピリーバ レスピマット 2吸入×1日1回 or エンクラッセ エリプタ',
    reason: 'Group A（CAT<10+mMRC 0-1+増悪なし）は LAMA単剤で十分',
    fromStates: ['naive'],
    drugClass: 'LAMA',
    forbidden: ['cm_narrow_angle_glaucoma'],
    avoidWhen: ['cm_bph_urinary_retention', 'co_dpi_insufficient_effort'],
    note: 'eGFR関係なく使用可。高齢・吸気力弱ければスピリーバ レスピマット',
  },

  // === Group B / E: LAMA/LABA 合剤第一選択 ===
  {
    id: 'start_lama_laba_group_b_from_naive',
    action: 'STEP_UP',
    drug: 'LAMA/LABA合剤 開始（Group B、症状あり）',
    example: 'アノーロ エリプタ、ウルティブロ、スピオルト いずれか 1日1回',
    reason: '症状あり（CAT≥10 or mMRC≥2）+ 増悪少ないなら合剤から',
    fromStates: ['naive'],
    drugClass: 'LAMA/LABA',
    forbidden: ['cm_narrow_angle_glaucoma'],
    avoidWhen: ['cm_bph_urinary_retention'],
    reassess: '4-8週後 CAT・mMRC・副作用',
  },
  {
    id: 'start_lama_laba_group_e_from_naive',
    action: 'STEP_UP',
    drug: 'LAMA/LABA合剤 開始（Group E、増悪歴あり）',
    example: 'アノーロ、ウルティブロ、スピオルト いずれか。eos≥300 なら早期ICS追加検討',
    reason: '増悪≥2 or 入院 → LAMA/LABA合剤で開始、表現型でICS判断',
    fromStates: ['naive'],
    drugClass: 'LAMA/LABA',
    preferredWhen: ['cm_frequent_exacerbator', 'cm_hospitalized_past_year'],
    forbidden: ['cm_narrow_angle_glaucoma'],
  },
  {
    id: 'stepup_lama_to_lama_laba',
    action: 'STEP_UP',
    drug: 'LAMA単剤 → LAMA/LABA合剤へ',
    example: 'スピリーバ単剤 → ウルティブロ or スピオルト',
    reason: 'LAMA単剤で症状残存・増悪で合剤化',
    fromStates: ['mono'],
    drugClass: 'LAMA/LABA',
    forbidden: ['cm_narrow_angle_glaucoma'],
  },

  // === Triple ===
  {
    id: 'add_ics_group_e_eos_high',
    action: 'STEP_UP',
    drug: 'Triple化: ICS追加（Group E + eos≥300）',
    example: 'LAMA/LABA → テリルジー エリプタ 100 へ切替（単吸入triple）',
    reason: '頻回増悪 + eos高値で ICS上乗せのベネフィット大',
    fromStates: ['dual'],
    drugClass: 'ICS/LABA/LAMA',
    preferredWhen: ['cm_eosinophilic_300', 'cm_frequent_exacerbator', 'cm_hospitalized_past_year'],
    avoidWhen: ['cm_pneumonia_hx', 'cm_eosinophilic_100'],
    forbidden: ['cm_active_tb', 'cm_narrow_angle_glaucoma'],
    reassess: '3ヶ月後 CAT・増悪頻度',
  },
  {
    id: 'switch_lama_laba_to_triple_aco',
    action: 'SWITCH',
    drug: 'ACO（喘息オーバーラップ）→ Triple',
    example: 'LAMA/LABA → テリルジー（ICS成分必須）',
    reason: '喘息成分があるため ICSなしは危険',
    fromStates: ['dual'],
    targetClass: 'ICS/LABA/LAMA',
    preferredWhen: ['cm_aco', 'cm_asthma_hx'],
    forbidden: ['cm_active_tb', 'cm_narrow_angle_glaucoma'],
  },
  {
    id: 'stepup_to_triple_single_inhaler',
    action: 'SWITCH',
    drug: '3剤別処方 → 単吸入triple化',
    example: 'ICS/LABA + LAMA の別々 → テリルジー1剤へ',
    reason: 'デバイス統一でアドヒアランス向上、月コスト削減',
    fromStates: ['triple'],
    targetClass: 'ICS/LABA/LAMA',
  },

  // === 急性増悪 ===
  {
    id: 'ae_copd_mild_saba_neb',
    action: 'ADD',
    drug: '軽度増悪: SABA+SAMAネブ反復',
    example: 'サルブタモール + イプラトロピウム ネブ 20分毎×3回、自宅SABA吸入頻回',
    reason: '軽度（SpO2≥95、会話可）は外来対応',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['rf_ae_copd_mild'],
    note: '24-48h内に再評価、改善なければOCS/抗生剤追加',
  },
  {
    id: 'ae_copd_moderate_ocs_antibiotic',
    action: 'ADD',
    drug: '中等度増悪: OCS burst + 喀痰膿性なら抗生剤',
    example: 'プレドニン 30mg/日×5日（漸減不要）+ 喀痰膿性なら AMPC/CVA or ドキシ×5-7日',
    reason: 'GOLD 2024: 中等度増悪で早期OCSが入院回避',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['rf_ae_copd_moderate'],
    note: '1週間以内follow up、反応みて抗生剤エスカレーション or de-escalation',
  },
  {
    id: 'ae_copd_severe_admit',
    action: 'REFER',
    drug: '⚠ 重度増悪: 救急搬送・入院',
    reason: '呼吸困難severe、SpO2<90、意識障害、在宅管理困難',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    urgentWhen: ['rf_ae_copd_severe', 'rf_respiratory_failure'],
    note: '酸素（SpO2 88-92%目標、CO2貯留型は特に）+ IV/NIV/IMV、広域抗生剤（緑膿菌カバー検討）',
  },
  {
    id: 'post_ae_stepup',
    action: 'STEP_UP',
    drug: '増悪後の step up',
    reason: '増悪 = コントロール不足',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_frequent_exacerbator', 'cm_hospitalized_past_year'],
    note: '退院後 90日は high-risk。肺リハ・ワクチン・手技確認',
  },

  // === ICS withdrawal ===
  {
    id: 'withdraw_ics_pneumonia',
    action: 'SWITCH',
    drug: 'ICS中止 → LAMA/LABA へ（ICS肺炎発症）',
    example: 'テリルジー → アノーロ or ウルティブロ',
    reason: 'ICS関連肺炎リスク > ICSベネフィット',
    fromStates: ['triple'],
    targetClass: 'LAMA/LABA',
    urgentWhen: ['se_ics_pneumonia'],
    triggerSideEffects: ['se_ics_pneumonia'],
  },
  {
    id: 'withdraw_ics_low_eos',
    action: 'SWITCH',
    drug: 'ICS中止検討（eos<100 + 増悪なし）',
    example: 'テリルジー → アノーロ（WISDOM試験）',
    reason: 'eos<100 かつ 過去1年増悪なしなら ICS削減で肺炎リスク減',
    fromStates: ['triple'],
    targetClass: 'LAMA/LABA',
    preferredWhen: ['cm_eosinophilic_100'],
    avoidWhen: ['cm_frequent_exacerbator', 'cm_aco'],
  },

  // === SWITCH ===
  {
    id: 'switch_lama_glaucoma_bph',
    action: 'SWITCH',
    drug: 'LAMA中止 → LABA単剤（緑内障・BPH悪化）',
    example: 'スピリーバ → インダカテロール（オンブレス）',
    reason: '抗コリン副作用で緑内障発作・尿閉',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_lama_glaucoma', 'se_lama_urinary_retention'],
    targetClass: 'LABA',
  },
  {
    id: 'switch_dpi_to_smi_technique',
    action: 'SWITCH',
    drug: 'DPI → SMI（レスピマット）へ切替（吸気力不足）',
    example: 'シーブリ → スピオルト（SMI、低吸気流量可）',
    reason: '高齢・重症で吸気流量<50L/min、DPI効果減弱',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_dpi_insufficient_effort', 'co_elderly_75'],
  },
  {
    id: 'switch_bid_to_qd_adherence',
    action: 'SWITCH',
    drug: 'BID → QD製剤へ（アドヒアランス改善）',
    example: 'エクリラ/ビベスピ → アノーロ/ウルティブロ/スピオルト/テリルジー',
    reason: '1日1回でアドヒアランス向上',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_poor_adherence_bid'],
  },

  // === Preventive ===
  {
    id: 'prescribe_vaccines',
    action: 'ADD',
    drug: 'ワクチン一式（インフル/肺炎球菌/RSV/帯状疱疹/COVID）',
    example: 'インフル年1回 + PPSV23(+PCV13) + RSV 60歳↑ + 帯状疱疹(シングリックス) + COVID',
    reason: 'COPD は感染性増悪の予防が予後改善',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    avoidWhen: ['co_vaccines_current'],
  },
  {
    id: 'start_hot_resp_failure',
    action: 'REFER',
    drug: '在宅酸素療法（HOT）導入',
    example: '安静時 PaO2≤55 or ≤60+臓器障害で適応、15h/日以上',
    reason: '予後改善エビデンス',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['rf_respiratory_failure'],
    preferredWhen: ['rf_respiratory_failure', 'cm_cor_pulmonale'],
    specialistGate: true,
  },
  {
    id: 'pulm_rehab_referral',
    action: 'ADD',
    drug: '肺リハ紹介',
    reason: 'mMRC≥2 に強く推奨。症状・QOL・増悪すべて改善',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_pulm_rehab_candidate'],
  },
  {
    id: 'address_cachexia',
    action: 'WATCH',
    drug: '栄養介入（悪液質・気腫型）',
    example: 'BMI<21 で予後不良。BCAA・高蛋白・少量頻回食・筋力訓練',
    reason: '栄養不良は独立予後因子',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_malnutrition', 'cm_cachexia'],
  },

  // === REFER ===
  {
    id: 'refer_respiratory_specialist_severe',
    action: 'REFER',
    drug: '呼吸器専門医紹介（重症・治療抵抗性）',
    reason: 'FEV1<30、年2回以上増悪、HOT導入、α1-AT欠損疑い',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_alpha1at_deficient', 'cm_frequent_exacerbator', 'cm_cor_pulmonale', 'cm_co2_retainer'],
    urgentWhen: ['cm_alpha1at_deficient'],
  },
  {
    id: 'refer_smoking_cessation_clinic',
    action: 'REFER',
    drug: '禁煙外来紹介',
    reason: '自力禁煙困難例',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    preferredWhen: ['co_current_smoker'],
  },

  // === 併存症対応 ===
  {
    id: 'manage_comorbid_hf',
    action: 'WATCH',
    drug: '心不全併存時: β1選択性（ビソ・カル）推奨、非選択性は禁忌',
    reason: 'COPD+HF合併多い。BNP/心エコー、利尿薬調整',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_hf'],
  },
  {
    id: 'manage_comorbid_depression',
    action: 'WATCH',
    drug: 'うつ・不安併存',
    example: 'SSRI/SNRI + CBT、呼吸リハでQOL改善',
    reason: 'CATスコアの交絡因子、アドヒアランス悪化',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_depression'],
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'LAMA / LAMA含有合剤',
    modifiers: ['cm_narrow_angle_glaucoma'],
    reason: '【禁忌】狭隅角緑内障（抗コリン作用で眼圧急上昇）',
  },
  {
    drug: 'LAMA / LAMA含有合剤',
    modifiers: ['cm_bph_urinary_retention'],
    reason: '【慎重】重症BPH・尿閉既往で尿閉増悪リスク',
  },
  {
    drug: 'ICS / ICS含有合剤',
    modifiers: ['cm_active_tb'],
    reason: '【禁忌】活動性結核悪化',
  },
  {
    drug: 'ICS新規開始',
    modifiers: ['cm_pneumonia_hx', 'cm_eosinophilic_100'],
    reason: '【注意】肺炎既往 + eos低値では ICSベネフィット低く肺炎リスク増。LAMA/LABA優先',
  },
  {
    drug: '非選択性β遮断薬（プロプラノロール等）',
    modifiers: ['co_nonselective_bb_use'],
    reason: '【禁忌】気管支攣縮誘発。β1選択性（ビソ・カル）へ切替を循環器と相談',
  },
  {
    drug: '高流量酸素',
    modifiers: ['cm_co2_retainer'],
    reason: '【注意】CO2ナルコーシス。SpO2 88-92%目標、ベンチュリマスク',
  },
];
