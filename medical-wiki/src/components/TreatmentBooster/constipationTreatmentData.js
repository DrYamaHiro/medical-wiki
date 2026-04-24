/**
 * Treatment Booster — 慢性便秘症 治療修正データ
 * 慢性便秘症診療ガイドライン 2023 (日本消化管学会) + Rome IV 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // 浸透圧性下剤（第一選択）
  { id: 'osm_mg', label: '酸化マグネシウム（マグミット/マグラックス）', class: '浸透圧性下剤',
    doses: [
      { value: '500', label: '500mg×3/日 分3（標準）', isDefault: true },
      { value: '1000', label: '1000mg×3/日 分3' },
      { value: '2000', label: '2000mg/日（最大）', isMax: true },
    ] },
  { id: 'osm_peg', label: 'ポリエチレングリコール（モビコール配合）', class: '浸透圧性下剤',
    doses: [
      { value: '2pack', label: '2包/日 分1-2', isDefault: true },
      { value: '4pack', label: '4包/日 分1-2' },
      { value: '6pack', label: '6包/日（最大）', isMax: true },
    ] },
  { id: 'osm_lac', label: 'ラクツロース（モニラック/ラグノス）', class: '浸透圧性下剤',
    doses: [
      { value: '30mL', label: '30mL/日 分2-3', isDefault: true },
      { value: '60mL', label: '60mL/日 分2-3', isMax: true },
    ] },

  // 上皮機能変容薬
  { id: 'sec_lub', label: 'ルビプロストン（アミティーザ）', class: '上皮機能変容薬',
    doses: [
      { value: '24', label: '24μg×2/日 食後', isDefault: true },
      { value: '48', label: '48μg×2/日', isMax: true },
    ] },
  { id: 'sec_lin', label: 'リナクロチド（リンゼス）', class: '上皮機能変容薬',
    doses: [
      { value: '0.25', label: '0.25mg×1/日 朝食前', isDefault: true },
      { value: '0.5', label: '0.5mg×1/日 朝食前', isMax: true },
    ] },
  { id: 'sec_elo', label: 'エロビキシバット（グーフィス）', class: '上皮機能変容薬',
    doses: [
      { value: '10', label: '10mg×1/日 朝食前', isDefault: true },
      { value: '15', label: '15mg×1/日 朝食前', isMax: true },
    ] },

  // オピオイド誘発便秘治療薬
  { id: 'pam_nal', label: 'ナルデメジン（スインプロイク）', class: 'PAMORA（末梢μオピオイド拮抗）',
    doses: [
      { value: '0.2', label: '0.2mg×1/日', isDefault: true, isMax: true },
    ] },

  // 刺激性下剤（頓用推奨）
  { id: 'stim_sen', label: 'センノシド（プルゼニド）', class: '刺激性下剤',
    doses: [
      { value: '12', label: '12mg 就寝前（頓用）', isDefault: true },
      { value: '24', label: '24mg 就寝前', isMax: true },
    ] },
  { id: 'stim_pico', label: 'ピコスルファートNa（ラキソベロン）', class: '刺激性下剤',
    doses: [
      { value: '10drops', label: '10-15滴/回 就寝前（頓用）', isDefault: true },
      { value: '15drops', label: '15滴/回', isMax: true },
    ] },

  // 坐剤・浣腸
  { id: 'rect_bis', label: 'ビサコジル坐剤（テレミンソフト）', class: '坐剤/浣腸',
    doses: [{ value: '10', label: '10mg 頓用', isDefault: true, isMax: true }] },
  { id: 'rect_gly', label: 'グリセリン浣腸', class: '坐剤/浣腸',
    doses: [
      { value: '30mL', label: '30mL 頓用', isDefault: true },
      { value: '60mL', label: '60mL 頓用', isMax: true },
    ] },

  // 漢方
  { id: 'kp_daio', label: '大黄甘草湯（ツムラ84）', class: '漢方',
    doses: [{ value: '7.5g', label: '7.5g 分3 食前', isDefault: true, isMax: true }] },
  { id: 'kp_mashi', label: '麻子仁丸（ツムラ126）', class: '漢方',
    doses: [{ value: '7.5g', label: '7.5g 分3 食前（高齢・硬便向き）', isDefault: true, isMax: true }] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_hypermagnesemia', label: '高Mg血症（Mg≥2.5、徐脈・呼吸抑制）', cat: '副作用', severity: 'critical' },
  { id: 'se_diarrhea_overcorrection', label: '過量下痢（Bristol 6-7持続）', cat: '副作用' },
  { id: 'se_electrolyte_abnormal', label: '低K・低Na等電解質異常', cat: '副作用' },
  { id: 'se_melanosis_coli', label: '大腸黒皮症（アントラキノン連用）', cat: '副作用' },
  { id: 'se_rebound_constipation', label: '反跳性便秘（刺激性中止後）', cat: '副作用' },
  { id: 'se_abdominal_pain', label: '腹痛（リナクロチド・ルビプロストン）', cat: '副作用' },
  { id: 'se_nausea', label: '嘔気（ルビプロストン）', cat: '副作用' },

  // 便秘分類
  { id: 'cm_constipation_functional', label: '機能性便秘症', cat: '分類' },
  { id: 'cm_ibs_c', label: 'IBS便秘型（IBS-C）', cat: '分類' },
  { id: 'cm_oic', label: 'オピオイド誘発便秘（OIC）', cat: '分類' },
  { id: 'cm_drug_induced_constipation', label: '薬剤性便秘（オピオイド以外）', cat: '分類' },
  { id: 'cm_secondary_metabolic', label: '二次性（甲状腺低下・低K・高Ca）', cat: '分類' },
  { id: 'cm_pelvic_floor_dysfunction', label: '骨盤底機能障害疑い（指かき出し・排出障害）', cat: '分類' },

  // 併存疾患
  { id: 'cm_ckd', label: 'CKD (eGFR 30-59)', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5 (eGFR<30)', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_hypothyroid', label: '甲状腺機能低下症', cat: '併存疾患' },
  { id: 'cm_parkinson', label: 'パーキンソン病', cat: '併存疾患' },
  { id: 'cm_spinal_cord', label: '脊髄病変・神経性便秘', cat: '併存疾患' },
  { id: 'cm_colon_surgery_hx', label: '結腸手術既往', cat: '併存疾患' },

  // 制約
  { id: 'co_opioid_use', label: 'オピオイド服用中（モルヒネ・オキシコドン等）', cat: '制約' },
  { id: 'co_anticholinergic_use', label: '抗コリン薬併用', cat: '制約' },
  { id: 'co_ca_channel_blocker_use', label: 'Ca拮抗薬併用（ベラパミル等）', cat: '制約' },
  { id: 'co_antidepressant_use', label: '抗うつ薬併用', cat: '制約' },
  { id: 'co_iron_supplement', label: '鉄剤併用', cat: '制約' },
  { id: 'co_antacid_use', label: '制酸薬（アルミ・Ca）併用', cat: '制約' },
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_elderly_65', label: '高齢者（≥65歳）', cat: '制約' },
  { id: 'co_elderly_75', label: '高齢者（≥75歳）', cat: '制約' },
  { id: 'co_pediatric_lt2', label: '乳幼児（2歳未満）', cat: '制約', severity: 'critical' },
  { id: 'co_chronic_stimulant_30d', label: '刺激性下剤30日以上連用', cat: '制約', severity: 'critical' },
  { id: 'co_fiber_water_low', label: '食物繊維・水分摂取不足', cat: '制約' },
  { id: 'co_defecation_habit_poor', label: '排便習慣不良（朝食後習慣なし）', cat: '制約' },

  // Red Flag（器質性疑い）
  { id: 'rf_red_flag_organic', label: 'Red Flag（血便/体重減少/50歳以降初発/貧血/家族歴/急激発症）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC                                          */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '便秘コントロール（Bristol + 頻度 + Rome IV）',
  inputs: [
    { id: 'bristol', label: 'Bristol Scale（1-7、3-5が正常）', unit: '', placeholder: '例:2' },
    { id: 'stool_freq', label: '排便頻度', unit: '回/週', placeholder: '例:2' },
    { id: 'straining', label: '強い息み（0/1）', unit: '', placeholder: '0' },
    { id: 'incomplete', label: '残便感（0/1）', unit: '', placeholder: '0' },
    { id: 'rome_count', label: 'Rome IV症状数（0-6）', unit: '', placeholder: '例:1' },
  ],
  note: 'Rome IV: 週3回未満/強い息み/残便感/硬便/指かき出し/閉塞感のうち2項目以上×3ヶ月。Red Flag（血便/体重減少/50歳以降/貧血/家族歴/急激発症）は薬物治療前に大腸内視鏡優先',
  deriveStatus: (v, modifiers = []) => {
    const b = v.bristol;
    const freq = v.stool_freq;
    const rome = v.rome_count;
    const has = (m) => modifiers.includes(m);

    if (b === undefined && freq === undefined && rome === undefined) return null;

    // Overcontrolled: 過量下痢・電解質異常
    if (b !== undefined && b >= 6) return 'overcontrolled';
    if (has('se_hypermagnesemia')) return 'overcontrolled';
    if (has('se_diarrhea_overcorrection')) return 'overcontrolled';
    if (has('se_electrolyte_abnormal')) return 'overcontrolled';

    // Red Flag は即 uncontrolled (精査優先)
    if (has('rf_red_flag_organic')) return 'uncontrolled';

    // Uncontrolled
    if (rome !== undefined && rome >= 2) return 'uncontrolled';
    if (b !== undefined && b <= 2 && freq !== undefined && freq < 3) return 'uncontrolled';

    // Near target
    if ((freq !== undefined && freq < 3) || (rome !== undefined && rome === 1)) return 'near_target';

    // Controlled
    if (b !== undefined && b >= 3 && b <= 5 && freq !== undefined && freq >= 3) return 'controlled';
    return 'near_target';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_red_flag_organic',
  'se_hypermagnesemia',
  'se_diarrhea_overcorrection',
  'se_electrolyte_abnormal',
  'co_chronic_stimulant_30d',
];

/* -------------------------------------------------------- */
/*  HELPERS                                                 */
/* -------------------------------------------------------- */
export function formatAppliedTarget() {
  return 'Bristol 3-5 + 排便 ≥3回/週 + Rome症状なし（息み・残便感なし）';
}

export function suggestAgeNudge() {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      co_chronic_stimulant_30d: '刺激性下剤30日超連用 自動検出',
      se_diarrhea_overcorrection: '過量下痢 自動検出',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers /*, currentDrugs, allDrugs */) {
  const flags = [];
  const b = metricValues.bristol;
  if (b !== undefined && b >= 6) flags.push('se_diarrhea_overcorrection');
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  if (mods.includes('rf_red_flag_organic')) {
    alerts.push({
      type: 'red_flag_urgent',
      label: '⚠ Red Flag: 薬物治療前に大腸内視鏡',
      detail: '50歳以降初発・血便・体重減少・貧血・家族歴は器質性（大腸癌・閉塞）疑い。CF優先',
    });
  }
  if (mods.includes('cm_secondary_metabolic') || mods.includes('cm_hypothyroid')) {
    alerts.push({
      type: 'secondary_workup',
      label: '二次性精査: TSH・Ca・K・Cr・血糖',
      detail: '甲状腺低下・低K・高Caで便秘誘発。原疾患治療で改善',
    });
  }
  if (mods.includes('co_opioid_use')) {
    alerts.push({
      type: 'opioid_oic_prevention',
      label: 'オピオイド服用中: OIC予防を',
      detail: 'オピオイド開始時点で OIC 予防介入。ナルデメジン0.2mg/日追加検討',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasMg = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'osm_mg');
  const hasStim = currentClasses.has('刺激性下剤');
  const hasLin = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'sec_lin');
  const hasNaldemedine = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'pam_nal');

  // 酸化Mg + CKD
  if (hasMg && (mods.includes('cm_ckd') || mods.includes('cm_ckd_g45'))) {
    alerts.push({
      type: 'mg_ckd',
      label: hasMg && mods.includes('cm_ckd_g45') ? '⚠ 酸化Mg + CKD G4-5: 高Mg血症リスク' : '酸化Mg + CKD: 血中Mg定期測定',
      detail: mods.includes('cm_ckd_g45')
        ? 'eGFR<30は禁忌相当。モビコール（PEG）へ切替'
        : '月1-3ヶ月毎のMg測定。2.5超なら中止・PEGへ',
      severity: mods.includes('cm_ckd_g45') ? 'critical' : undefined,
    });
  }

  // 酸化Mg + 高齢者長期
  if (hasMg && mods.includes('co_elderly_75')) {
    alerts.push({
      type: 'mg_elderly',
      label: '酸化Mg + 超高齢者: 血中Mg測定推奨',
      detail: '腎機能低下顕在化しやすく高Mg血症リスク。モビコールへの切替も検討',
    });
  }

  // 刺激性 + 連用
  if (hasStim && mods.includes('co_chronic_stimulant_30d')) {
    alerts.push({
      type: 'stimulant_chronic',
      label: '⚠ 刺激性下剤30日超連用: 依存・電解質異常',
      detail: 'アントラキノン系で大腸黒皮症、低K血症。浸透圧性ベースへ切替 + 頓用化',
      severity: 'critical',
    });
  }

  // オピオイド + OIC未対策
  if (mods.includes('co_opioid_use') && !hasNaldemedine) {
    alerts.push({
      type: 'opioid_no_naldemedine',
      label: '⚠ オピオイド + OIC未対策',
      detail: 'スインプロイク 0.2mg/日 追加推奨。PAMORAで中枢オピオイド鎮痛効果維持しつつOIC改善',
      severity: 'critical',
    });
  }

  // リナクロチド + IBS-C以外
  if (hasLin && !mods.includes('cm_ibs_c')) {
    alerts.push({
      type: 'linaclotide_non_ibs',
      label: 'リナクロチド適応確認',
      detail: 'IBS-C or 慢性特発性便秘以外は適応外・保険審査懸念',
    });
  }

  // 薬剤性便秘 + 誘因薬
  if (mods.includes('cm_drug_induced_constipation')) {
    const causes = [];
    if (mods.includes('co_anticholinergic_use')) causes.push('抗コリン');
    if (mods.includes('co_ca_channel_blocker_use')) causes.push('Ca拮抗');
    if (mods.includes('co_antidepressant_use')) causes.push('抗うつ');
    if (mods.includes('co_iron_supplement')) causes.push('鉄剤');
    if (mods.includes('co_antacid_use')) causes.push('制酸薬');
    if (causes.length) {
      alerts.push({
        type: 'drug_induced',
        label: `薬剤性便秘: ${causes.join('/')}`,
        detail: '原因薬の中止 or 代替（三環系→SSRI、ベラパミル→ARB等）検討',
      });
    }
  }

  // 妊娠 + 刺激性
  if (mods.includes('co_pregnancy') && hasStim) {
    alerts.push({
      type: 'pregnancy_stimulant',
      label: '⚠ 妊娠 + 刺激性下剤: 子宮収縮リスク',
      detail: 'アントラキノン系（センノシド・大黄）は早産誘発。モビコール・ラクツロースへ切替',
      severity: 'critical',
    });
  }

  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'rf_red_flag_organic',
    'se_hypermagnesemia',
    'co_chronic_stimulant_30d',
    'cm_ckd_g45',
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
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（良好な排便コントロール）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '食物繊維・水分・排便習慣の継続',
    reason: 'Bristol 3-5、週≥3回排便、Rome症状なし、副作用なし',
    reassess: '3ヶ月毎に漸減可能性評価。特に刺激性下剤は頓用化・中止を検討',
    note: '食物繊維20-25g/日、水分1.5L、朝食後15分の排便時間確保を継続',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '生活指導強化 + 4週後再評価',
    example: '食物繊維20-25g（野菜・果物・豆類・全粒穀物）、水分1.5L、朝食後15分トイレ、歩行運動',
    reason: '軽度症状（週<3回 or Rome 1項目）は生活改善で軽快する場合あり',
    reassess: '4週後に排便日誌・Bristol確認。改善なければ薬物療法',
    note: '排便時の怒責を減らす体位（前傾・踵浮かせ）指導も有用',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    osm_mg: ['cm_ckd', 'co_elderly_75', 'se_hypermagnesemia'],
    osm_peg: [],
    sec_lub: ['se_nausea', 'se_abdominal_pain'],
    sec_lin: ['se_abdominal_pain'],
    sec_elo: ['se_abdominal_pain'],
    stim_sen: ['co_chronic_stimulant_30d', 'se_melanosis_coli'],
    stim_pico: ['co_chronic_stimulant_30d'],
    kp_daio: ['co_pregnancy', 'co_chronic_stimulant_30d'],
  };
  const forbiddenMap = {
    osm_mg: ['cm_ckd_g45'],
    sec_lub: ['co_pregnancy'],
    pam_nal: [],
    stim_sen: ['co_pregnancy'],
    kp_daio: ['co_pregnancy'],
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
    example: `${drug.label} ${nextDose.label}（${currentDose.label} から段階増量）`,
    reason: '現用量で目標未達。同剤増量 > 新薬追加を優先',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '2-4週後に Bristol・頻度・副作用（下痢化・Mg等）',
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
    id: 'exclude_red_flag_first',
    action: 'REFER',
    drug: '⚠ Red Flag → 大腸内視鏡・消化器専門医優先',
    reason: '50歳以降初発・血便・体重減少・貧血・家族歴・急激発症は器質性（大腸癌・閉塞）疑い',
    fromStates: ['naive', 'mono', 'dual'],
    urgentWhen: ['rf_red_flag_organic'],
    preferredWhen: ['rf_red_flag_organic'],
    note: '薬物療法は精査後。治療で症状マスクされると診断遅延',
  },
  {
    id: 'naive_lifestyle_fiber_water',
    action: 'WATCH',
    drug: '生活指導（食物繊維・水分・排便習慣）',
    example: '食物繊維20-25g/日、水分1.5L、朝食後15分トイレ、歩行運動',
    reason: '機能性便秘の初期治療は非薬物療法',
    fromStates: ['naive'],
    forbidden: ['rf_red_flag_organic'],
    reassess: '4週後に再評価。改善なければ薬物療法',
  },
  {
    id: 'start_mg_oxide_first_line',
    action: 'STEP_UP',
    drug: '酸化マグネシウム開始（第一選択）',
    example: 'マグミット錠500mg 1回1錠 1日3回 毎食後',
    reason: '日本で最も処方される第一選択。安全性高いが高齢者・CKDでMg注意',
    fromStates: ['naive'],
    drugClass: '浸透圧性下剤',
    preferredWhen: ['cm_constipation_functional'],
    avoidWhen: ['cm_ckd', 'co_elderly_75'],
    forbidden: ['cm_ckd_g45', 'rf_red_flag_organic'],
    reassess: '2-4週後に Bristol・頻度、高齢者は3ヶ月毎Mg測定',
    note: 'PPI併用で効果減弱。過量で下痢・高Mg血症',
  },
  {
    id: 'start_peg_elderly_ckd',
    action: 'STEP_UP',
    drug: 'モビコール（PEG）開始（高齢者・CKD）',
    example: 'モビコール配合内用剤 2包/日 分1-2',
    reason: '酸化Mg禁忌・不適合例（CKD/高齢）の第一選択。安全性最高',
    fromStates: ['naive'],
    drugClass: '浸透圧性下剤',
    preferredWhen: ['cm_ckd', 'cm_ckd_g45', 'co_elderly_75'],
    forbidden: ['rf_red_flag_organic'],
    reassess: '2-4週後に Bristol・頻度',
    note: '2歳以上で保険適応。小児・高齢者・CKDすべて安全',
  },

  // === Mono→Dual ===
  {
    id: 'switch_mg_to_peg_elderly_ckd',
    action: 'SWITCH',
    drug: '酸化Mg → モビコール（PEG）へ切替',
    example: 'マグミット中止 → モビコール 2包/日',
    reason: '高齢者・CKD進行・Mg高値疑いで切替',
    fromStates: ['mono'],
    targetClass: '浸透圧性下剤',
    triggerSideEffects: ['se_hypermagnesemia'],
    preferredWhen: ['cm_ckd', 'cm_ckd_g45', 'co_elderly_75'],
    urgentWhen: ['se_hypermagnesemia'],
  },
  {
    id: 'start_linaclotide_ibs_c',
    action: 'STEP_UP',
    drug: 'リナクロチド（IBS便秘型）',
    example: 'リンゼス錠 0.25mg×1 朝食前',
    reason: 'IBS-C で腹痛・便秘両方に効果。GC-C作動薬',
    fromStates: ['naive', 'mono'],
    drugClass: '上皮機能変容薬',
    preferredWhen: ['cm_ibs_c'],
    forbidden: ['co_pediatric_lt2', 'rf_red_flag_organic'],
    note: '下痢・腹痛副作用。空腹時（朝食前）内服が重要',
  },
  {
    id: 'start_lubiprostone_cic',
    action: 'ADD',
    drug: 'ルビプロストン追加（慢性特発性便秘）',
    example: 'アミティーザ 24μg×2/日 食後',
    reason: '酸化Mg効果不十分な CIC（慢性特発性便秘）',
    fromStates: ['mono'],
    drugClass: '上皮機能変容薬',
    preferredWhen: ['cm_constipation_functional'],
    forbidden: ['co_pregnancy'],
    avoidWhen: ['se_nausea'],
    note: '嘔気副作用。食後内服で軽減',
  },
  {
    id: 'start_elobixibat_morning',
    action: 'STEP_UP',
    drug: 'エロビキシバット（朝排便希望）',
    example: 'グーフィス 10mg 朝食前',
    reason: '朝食後排便を誘導したい患者に。胆汁酸トランスポーター阻害',
    fromStates: ['naive', 'mono'],
    drugClass: '上皮機能変容薬',
    preferredWhen: ['cm_constipation_functional'],
    forbidden: ['rf_red_flag_organic'],
    note: '胆汁酸が結腸に到達し大腸運動促進',
  },
  {
    id: 'start_naldemedine_oic',
    action: 'STEP_UP',
    drug: 'ナルデメジン（オピオイド誘発便秘）',
    example: 'スインプロイク 0.2mg×1/日',
    reason: 'OIC専用。末梢μオピオイド拮抗で中枢鎮痛維持しつつ便秘改善',
    fromStates: ['naive', 'mono'],
    drugClass: 'PAMORA（末梢μオピオイド拮抗）',
    urgentWhen: ['co_opioid_use'],
    preferredWhen: ['cm_oic', 'co_opioid_use'],
    note: 'OIC以外は適応外・保険不可',
  },

  // === 頓用/急性 ===
  {
    id: 'add_stimulant_rescue_prn',
    action: 'ADD',
    drug: '刺激性下剤（頓用・連日回避）',
    example: 'センノシド 12-24mg 就寝前 頓用、またはテレミンソフト坐剤',
    reason: '浸透圧性で不十分な時の頓用。連日連用は回避',
    fromStates: ['mono', 'dual'],
    drugClass: '刺激性下剤',
    avoidWhen: ['co_chronic_stimulant_30d'],
    forbidden: ['co_pregnancy'],
    note: '週2-3回までの使用。連日化したら浸透圧性増量を',
  },
  {
    id: 'rectal_enema_impaction',
    action: 'ADD',
    drug: 'グリセリン浣腸（宿便）',
    example: 'グリセリン浣腸 30-60mL',
    reason: '宿便・急性排便困難。即効性',
    fromStates: ['mono', 'dual', 'triple'],
    drugClass: '坐剤/浣腸',
  },

  // === 薬剤性・二次性 ===
  {
    id: 'stop_constipating_drug_review',
    action: 'SWITCH',
    drug: '誘因薬の見直し（薬剤性便秘）',
    example: '三環系抗うつ薬→SSRI、ベラパミル→ARB、鉄剤→他形態・隔日投与',
    reason: '抗コリン・Ca拮抗・抗うつ・鉄剤・制酸薬は便秘誘発',
    fromStates: ['naive', 'mono', 'dual'],
    preferredWhen: ['cm_drug_induced_constipation'],
  },
  {
    id: 'workup_secondary_metabolic',
    action: 'WATCH',
    drug: '二次性便秘スクリーニング',
    example: 'TSH・FT4、Ca、K、Cr、血糖測定',
    reason: '甲状腺低下・低K・高Ca・DM性神経障害で便秘誘発',
    fromStates: ['naive'],
    preferredWhen: ['cm_secondary_metabolic', 'cm_hypothyroid'],
  },

  // === TAPER / STOP ===
  {
    id: 'taper_chronic_stimulant',
    action: 'TAPER',
    drug: '刺激性下剤30日超連用 → 漸減',
    reason: '依存形成・電解質異常・大腸黒皮症リスク',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_chronic_stimulant_30d'],
    note: '浸透圧性ベースへ移行し、刺激性は頓用へ',
  },
  {
    id: 'stop_overcorrection_diarrhea',
    action: 'TAPER',
    drug: '過量下痢 → 減量・一時中止',
    reason: 'Bristol 6-7 持続は過量、電解質異常リスク',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_diarrhea_overcorrection'],
    preferredWhen: ['se_diarrhea_overcorrection'],
  },

  // === REFER ===
  {
    id: 'refer_colonoscopy_red_flag',
    action: 'REFER',
    drug: '大腸内視鏡・消化器専門医',
    reason: 'Red Flag（器質性疑い）精査',
    fromStates: ['naive', 'mono'],
    urgentWhen: ['rf_red_flag_organic'],
    preferredWhen: ['rf_red_flag_organic'],
  },
  {
    id: 'refer_pelvic_floor_dysfunction',
    action: 'REFER',
    drug: '骨盤底機能障害疑い → 専門医（肛門科・婦人科）',
    reason: '指かき出し・排出障害・肛門脱疑い例',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_pelvic_floor_dysfunction'],
    note: 'バイオフィードバック療法が有効な場合あり',
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: '酸化マグネシウム',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌相当】eGFR<30で高Mg血症・致死的徐脈/呼吸抑制。モビコール（PEG）へ切替',
  },
  {
    drug: '酸化マグネシウム（高齢者長期）',
    modifiers: ['co_elderly_75'],
    reason: '【要モニタ】血中Mg 3-6ヶ月毎測定必須。2.5超で中止・PEGへ',
  },
  {
    drug: '刺激性下剤（30日以上連用）',
    modifiers: ['co_chronic_stimulant_30d'],
    reason: '【要注意】依存・電解質異常・大腸黒皮症。頓用化・浸透圧性ベースへ',
  },
  {
    drug: 'アントラキノン系（センノシド・大黄甘草湯）',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】子宮収縮誘発、早産リスク。モビコール・ラクツロースへ',
  },
  {
    drug: 'ルビプロストン',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】動物実験で胎児毒性',
  },
  {
    drug: '薬物治療全般',
    modifiers: ['rf_red_flag_organic'],
    reason: '【精査優先】Red Flag（50歳以降初発・血便・体重減少・貧血・家族歴）は大腸内視鏡先行',
  },
  {
    drug: 'ナルデメジン',
    modifiers: [],
    reason: '【保険】OIC専用。オピオイド非使用例は適応外',
  },
  {
    drug: 'リナクロチド',
    modifiers: ['co_pediatric_lt2'],
    reason: '【禁忌】2歳未満',
  },
];
