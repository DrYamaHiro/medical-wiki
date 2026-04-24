/**
 * Treatment Booster — 痛風・高尿酸血症 治療修正データ
 * 高尿酸血症・痛風の治療ガイドライン 第3版（2022改訂）準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // 尿酸生成抑制薬 (XO阻害薬)
  { id: 'ulo_allo', label: 'アロプリノール（ザイロリック）', class: '尿酸生成抑制薬',
    doses: [
      { value: '100', label: '100mg×1（導入、eGFR低下は隔日）', isDefault: true },
      { value: '200', label: '200mg 分2' },
      { value: '300', label: '300mg 分3（最大）', isMax: true },
    ] },
  { id: 'ulo_feb', label: 'フェブキソスタット（フェブリク）', class: '尿酸生成抑制薬',
    doses: [
      { value: '10', label: '10mg×1（開始）', isDefault: true },
      { value: '20', label: '20mg×1' },
      { value: '40', label: '40mg×1（最大）', isMax: true },
    ] },
  { id: 'ulo_topi', label: 'トピロキソスタット（トピロリック/ウリアデック）', class: '尿酸生成抑制薬',
    doses: [
      { value: '20', label: '20mg×2/日', isDefault: true },
      { value: '40', label: '40mg×2/日' },
      { value: '60', label: '60mg×2/日（最大）', isMax: true },
    ] },

  // 尿酸排泄促進薬
  { id: 'ure_ben', label: 'ベンズブロマロン（ユリノーム）', class: '尿酸排泄促進薬',
    doses: [
      { value: '25', label: '25mg×1（開始）', isDefault: true },
      { value: '50', label: '50mg×1' },
      { value: '100', label: '100mg×1（最大）', isMax: true },
    ] },
  { id: 'ure_pro', label: 'プロベネシド（ベネシッド）', class: '尿酸排泄促進薬',
    doses: [
      { value: '500', label: '500mg×2/日', isDefault: true },
      { value: '1000', label: '1000mg×2/日' },
      { value: '2000', label: '2000mg/日（最大）', isMax: true },
    ] },

  // 尿アルカリ化薬
  { id: 'alk_uralyt', label: 'クエン酸K/Naクエン酸配合（ウラリット）', class: '尿アルカリ化薬',
    doses: [
      { value: '3g', label: '1g×3/日（尿pH 6.2-6.8目標）', isDefault: true, isMax: true },
    ] },

  // 急性発作治療薬
  { id: 'nsaid_naproxen', label: 'ナプロキセン（ナイキサン）', class: 'NSAID',
    doses: [
      { value: '600', label: '300mg×2/日', isDefault: true },
      { value: '900', label: '300mg×3/日（最大）', isMax: true },
    ] },
  { id: 'nsaid_loxo', label: 'ロキソプロフェン（ロキソニン）', class: 'NSAID',
    doses: [
      { value: '180', label: '60mg×3/日', isDefault: true, isMax: true },
    ] },
  { id: 'nsaid_cele', label: 'セレコキシブ（セレコックス）', class: 'NSAID',
    doses: [
      { value: '200', label: '100mg×2/日', isDefault: true },
      { value: '400', label: '200mg×2/日（最大）', isMax: true },
    ] },
  { id: 'acute_col', label: 'コルヒチン', class: 'コルヒチン',
    doses: [
      { value: '0.5_prophylaxis', label: '0.5mg×1-2/日（予防・尿酸降下薬開始時併用）', isDefault: true },
      { value: '1.0_acute', label: '1mg初回→1h後0.5mg（急性期）', isMax: true },
    ] },
  { id: 'acute_psl', label: 'プレドニゾロン（プレドニン）', class: 'OCS',
    doses: [
      { value: '30_burst', label: '30mg/日×3-5日→tapering（7-10日）', isDefault: true, isMax: true },
    ] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_allopurinol_skin_reaction', label: 'アロプリノール皮疹・SJS/TEN/DIHS疑い', cat: '副作用', severity: 'critical' },
  { id: 'se_benzbromarone_hepatitis', label: 'ベンズブロマロン肝障害', cat: '副作用', severity: 'critical' },
  { id: 'se_febuxostat_lft_up', label: 'フェブキソスタット肝機能上昇', cat: '副作用' },
  { id: 'se_colchicine_gi', label: 'コルヒチンGI症状（下痢・嘔気）', cat: '副作用' },
  { id: 'se_nsaid_intolerance', label: 'NSAID不耐', cat: '副作用' },
  { id: 'se_low_ua_cognitive', label: 'SUA<3.0で認知・パーキンソン症状', cat: '副作用', severity: 'critical' },

  // 併存疾患
  { id: 'cm_gout_attack_hx', label: '痛風発作既往あり', cat: '併存疾患' },
  { id: 'cm_gout_tophus', label: '痛風結節あり', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_urate_stone', label: '尿酸結石既往', cat: '併存疾患' },
  { id: 'cm_asymptomatic_hyperUA', label: '無症候性高尿酸血症（発作既往なし）', cat: '併存疾患' },
  { id: 'cm_urate_production_high', label: '尿酸産生過剰型', cat: '併存疾患' },
  { id: 'cm_urate_excretion_low', label: '尿酸排泄低下型', cat: '併存疾患' },
  { id: 'cm_hla_b5801_positive', label: 'HLA-B*5801陽性', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_cv_high_risk', label: '心血管高リスク（CAD/HF/脳卒中既往）', cat: '併存疾患' },
  { id: 'cm_ckd', label: 'CKD (eGFR 30-59)', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5 (eGFR<30)', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_liver_severe', label: '肝機能障害 Child-Pugh B以上', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_peptic_ulcer_hx', label: '消化性潰瘍既往', cat: '併存疾患' },
  { id: 'cm_dm', label: '糖尿病併存', cat: '併存疾患' },
  { id: 'cm_hf', label: '心不全併存', cat: '併存疾患' },
  { id: 'cm_ht_diuretic', label: '利尿薬由来高尿酸血症（サイアザイド等）', cat: '併存疾患' },

  // 制約
  { id: 'co_attack_frequent', label: '発作年2回以上', cat: '制約', severity: 'critical' },
  { id: 'co_attack_free_5y', label: '5年以上無発作（減量検討可）', cat: '制約' },
  { id: 'co_on_urate_lowering', label: '尿酸降下薬 既服用中', cat: '制約' },
  { id: 'co_on_ult_prophylaxis', label: 'コルヒチン予防内服中（尿酸降下薬開始期）', cat: '制約' },
  { id: 'co_cyp3a4_inhibitor', label: 'CYP3A4/P-gp阻害薬併用（マクロライド・ベラパミル・シクロスポリン）', cat: '制約', severity: 'critical' },
  { id: 'co_azathioprine_use', label: 'アザチオプリン併用', cat: '制約', severity: 'critical' },
  { id: 'co_anticoag_major', label: '抗凝固薬併用（ワルファリン/DOAC）', cat: '制約' },
  { id: 'co_alcohol_excess', label: '過度のアルコール摂取（ビール/蒸留酒）', cat: '制約' },
  { id: 'co_purine_rich_diet', label: 'プリン体過多食（臓物・魚卵等）', cat: '制約' },
  { id: 'co_obese', label: '肥満 (BMI≥25)', cat: '制約' },
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_elderly_75', label: '75歳以上', cat: '制約' },

  // 失敗歴
  { id: 'fh_allo_rash', label: 'アロプリノール皮疹で中止歴', cat: '失敗歴' },
  { id: 'fh_benzbromarone_lft', label: 'ベンズブロマロン肝障害で中止歴', cat: '失敗歴' },

  // Red Flag
  { id: 'rf_gout_attack_current', label: '急性痛風発作中', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_sjs_suspect', label: 'SJS/TEN疑い（発疹+発熱+粘膜病変）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_polyarticular_attack', label: '多関節同時発作（感染性関節炎鑑別要）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC                                          */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '尿酸コントロール（SUA + 発作頻度）',
  inputs: [
    { id: 'sua', label: '血清尿酸', unit: 'mg/dL', placeholder: '例:6.8' },
    { id: 'attacks_past_year', label: '過去1年の発作回数', unit: '回', placeholder: '例:0' },
    { id: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', placeholder: '任意' },
    { id: 'urine_ph', label: '尿pH', unit: '', placeholder: '任意:6.0' },
  ],
  note: 'JP GL2022: 痛風結節あり SUA<5.0、発作既往あり<6.0、無症候+合併症<7.0、無症候単独は経過観察（SUA≥8.0で治療検討、≥9.0で強く推奨）。過降下 <3.0 で認知リスク報告',
  deriveStatus: (v, modifiers = []) => {
    const ua = v.sua;
    if (ua === undefined) return null;

    const has = (m) => modifiers.includes(m);

    // Overcontrolled: 過降下
    if (ua < 3.0) return 'overcontrolled';
    if (has('se_low_ua_cognitive')) return 'overcontrolled';

    // Target 選択
    let target;
    if (has('cm_gout_tophus')) target = 5.0;
    else if (has('cm_gout_attack_hx')) target = 6.0;
    else if (has('cm_asymptomatic_hyperUA')) {
      const hasComp = ['cm_ht', 'cm_ckd', 'cm_urate_stone', 'cm_dm', 'cm_hf'].some(has);
      target = hasComp ? 7.0 : 8.0;
    } else target = 7.0;

    // 急性発作中 + 発作頻回 = uncontrolled
    if (has('rf_gout_attack_current')) return 'uncontrolled';
    if (has('co_attack_frequent')) return 'uncontrolled';

    const diff = ua - target;
    if (diff <= 0.5) return 'controlled';
    if (diff < 1.5) return 'near_target';
    return 'uncontrolled';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_gout_attack_current',
  'rf_sjs_suspect',
  'rf_polyarticular_attack',
  'se_allopurinol_skin_reaction',
  'se_benzbromarone_hepatitis',
  'se_low_ua_cognitive',
  'co_attack_frequent',
  'cm_gout_tophus',
];

/* -------------------------------------------------------- */
/*  HELPERS                                                 */
/* -------------------------------------------------------- */
export function formatAppliedTarget(modifiers = []) {
  const has = (m) => modifiers.includes(m);
  if (has('cm_gout_tophus')) return 'SUA <5.0 mg/dL（痛風結節あり、厳格目標）';
  if (has('cm_gout_attack_hx')) return 'SUA <6.0 mg/dL（痛風既往あり）';
  if (has('cm_asymptomatic_hyperUA')) {
    const hasComp = ['cm_ht', 'cm_ckd', 'cm_urate_stone', 'cm_dm', 'cm_hf'].some(has);
    return hasComp
      ? 'SUA <7.0 mg/dL（無症候性 + 合併症あり、治療適応）'
      : 'SUA <8.0 mg/dL（無症候性単独、SUA≥9.0で治療強く推奨）';
  }
  return 'SUA <7.0 mg/dL（一般）';
}

export function suggestAgeNudge() {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      co_attack_frequent: '発作年≥2回 自動検出',
      se_low_ua_cognitive: 'SUA<3.0 過降下検出',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const attacks = metricValues.attacks_past_year;
  const ua = metricValues.sua;
  if (attacks !== undefined && attacks >= 2) flags.push('co_attack_frequent');
  if (ua !== undefined && ua < 3.0) flags.push('se_low_ua_cognitive');
  // 現行尿酸降下薬服用の自動検出
  if (currentDrugs && currentDrugs.length > 0 && allDrugs) {
    const classes = new Set();
    currentDrugs.forEach((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const drug = allDrugs.find((d) => d.id === id);
      if (drug) classes.add(drug.class);
    });
    if (classes.has('尿酸生成抑制薬') || classes.has('尿酸排泄促進薬')) {
      flags.push('co_on_urate_lowering');
    }
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  const ua = metricValues.sua;
  if (ua !== undefined && ua >= 9.0 && mods.includes('cm_asymptomatic_hyperUA')) {
    alerts.push({
      type: 'ua_9_asymptomatic',
      label: 'SUA≥9.0 無症候性: 薬物療法を強く推奨',
      detail: '腎障害・尿酸結石リスク高い。合併症の有無問わず薬物療法開始を検討',
    });
  }
  if (mods.includes('rf_gout_attack_current')) {
    alerts.push({
      type: 'attack_current_warning',
      label: '⚠ 急性発作中: 尿酸降下薬の新規開始は禁',
      detail: 'すでに服用中なら継続。NSAID/コルヒチン/PSLで急性期対応。発作消退後（2週目安）に降下薬開始',
    });
  }
  if (mods.includes('rf_polyarticular_attack')) {
    alerts.push({
      type: 'polyarticular_sepsis_rule_out',
      label: '⚠ 多関節発作: 感染性関節炎の鑑別必須',
      detail: '関節穿刺で結晶同定 + 細菌培養。敗血症疑いなら即入院',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs, metricValues */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasAllo = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'ulo_allo');
  const hasBenz = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'ure_ben');
  const hasFeb = currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'ulo_feb');
  const hasColch = currentClasses.has('コルヒチン');
  const hasNsaid = currentClasses.has('NSAID');

  if (hasAllo && mods.includes('cm_hla_b5801_positive')) {
    alerts.push({
      type: 'allo_sjs_risk',
      label: '⚠ アロプリノール + HLA-B*5801+: SJS/TEN高リスク',
      detail: 'アジア人で～20%陽性。フェブキソスタット/トピロキソスタットへ切替',
      severity: 'critical',
    });
  }
  if (hasAllo && mods.includes('co_azathioprine_use')) {
    alerts.push({
      type: 'allo_aza_interaction',
      label: '⚠ アロプリノール + アザチオプリン: 骨髄抑制禁忌',
      detail: 'XOI で AZA代謝抑制 → 骨髄抑制死亡例。アロプリノール中止 or AZA減量',
      severity: 'critical',
    });
  }
  if (hasBenz && mods.includes('cm_urate_stone')) {
    alerts.push({
      type: 'benz_stone',
      label: '⚠ ベンズブロマロン + 尿酸結石: 禁忌',
      detail: '尿中尿酸増加で結石悪化。尿酸降下薬 は尿酸生成抑制薬へ変更',
      severity: 'critical',
    });
  }
  if (hasBenz && mods.includes('cm_liver_severe')) {
    alerts.push({
      type: 'benz_liver',
      label: '⚠ ベンズブロマロン + 肝障害: 劇症肝炎リスク',
      detail: '開始6ヶ月はALT月1モニター。既往ある者は禁忌相当',
      severity: 'critical',
    });
  }
  if (hasFeb && mods.includes('cm_cv_high_risk')) {
    alerts.push({
      type: 'feb_cv_risk',
      label: 'フェブキソスタット + 心血管高リスク: CARES試験の懸念',
      detail: 'allopurinolとの比較でCV死亡シグナル。CV既往例はアロプリノール（HLA-B*5801-前提）優先を検討',
    });
  }
  if (hasColch && mods.includes('co_cyp3a4_inhibitor')) {
    alerts.push({
      type: 'colchicine_cyp3a4',
      label: '⚠ コルヒチン + CYP3A4阻害薬: 血中濃度急上昇',
      detail: 'マクロライド/ベラパミル/シクロスポリン併用で死亡例。代替抗菌薬 or コルヒチン一時中止',
      severity: 'critical',
    });
  }
  if (hasNsaid && mods.includes('cm_ckd_g45')) {
    alerts.push({
      type: 'nsaid_ckd',
      label: '⚠ NSAID + CKD G4-5: AKIリスク',
      detail: 'NSAID中止、PSL short burst または関節内ステロイドへ切替',
      severity: 'critical',
    });
  }
  if (hasNsaid && mods.includes('cm_peptic_ulcer_hx')) {
    alerts.push({
      type: 'nsaid_ulcer',
      label: 'NSAID + 消化性潰瘍既往: PPI併用必須',
      detail: 'PPI（ランソプラゾール等）併用 or セレコキシブ（COX-2）選択',
    });
  }
  if (mods.includes('co_on_urate_lowering') && mods.includes('rf_gout_attack_current')) {
    alerts.push({
      type: 'ult_continue_during_attack',
      label: '既服用尿酸降下薬は発作中も継続',
      detail: '中断は血清尿酸変動で flare 遷延。用量そのまま維持',
    });
  }
  if (mods.includes('co_alcohol_excess')) {
    alerts.push({
      type: 'alcohol_excess',
      label: 'アルコール過多は痛風コントロールの大敵',
      detail: 'ビール（プリン体+代謝負荷）・蒸留酒ともに SUA 上昇。節酒指導',
    });
  }
  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'rf_gout_attack_current',
    'rf_sjs_suspect',
    'rf_polyarticular_attack',
    'cm_gout_tophus',
    'co_attack_frequent',
    'cm_hla_b5801_positive',
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
    drug: '現状維持（SUA目標達成・無発作）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '生活指導のみ継続',
    reason: 'SUA目標内かつ過去1年発作なし。不要な変更はリスク',
    reassess: '6ヶ月毎に SUA・AST/ALT・Cre。5年以上無発作なら減量検討（taper_ul_attack_free_5y）',
    note: '生活指導（節酒・プリン体制限・水分2L・体重管理）の継続が鍵',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '経過観察 + 生活指導強化',
    example: '節酒・プリン体制限・水分2L・減量5-10%',
    reason: 'SUA がわずかに目標超え。食事・飲酒・運動見直しで改善可能',
    reassess: '3ヶ月後に SUA 再測定。改善なければ薬物療法開始',
    note: '無症候性+合併症なしで SUA<9.0 は生活指導のみで経過可',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    ulo_allo: ['cm_ckd_g45', 'se_allopurinol_skin_reaction', 'fh_allo_rash'],
    ulo_feb: ['cm_cv_high_risk', 'se_febuxostat_lft_up'],
    ure_ben: ['cm_urate_stone', 'cm_liver_severe', 'fh_benzbromarone_lft'],
  };
  const forbiddenMap = {
    ulo_allo: ['cm_hla_b5801_positive', 'co_azathioprine_use', 'rf_gout_attack_current'],
    ulo_feb: ['co_pregnancy', 'rf_gout_attack_current'],
    ure_ben: ['cm_urate_stone', 'cm_ckd_g45', 'co_pregnancy'],
    nsaid_naproxen: ['cm_ckd_g45', 'se_nsaid_intolerance'],
    nsaid_loxo: ['cm_ckd_g45', 'se_nsaid_intolerance'],
    acute_col: ['co_cyp3a4_inhibitor', 'cm_ckd_g45'],
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
    example: `${drug.label} ${nextDose.label}（現用量 ${currentDose.label} から段階増量）`,
    reason: '現用量で目標未達。同一薬剤の漸増は新薬追加より優先',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '4-8週後 SUA・AST/ALT・eGFR。尿酸降下薬開始/増量時は flare 予防にコルヒチン0.5mg併用',
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
    drug: '生活指導のみ（無症候性・合併症なし）',
    example: '節酒（ビール<350mL/日・蒸留酒制限）、プリン体制限、水分2L、減量5-10%、運動',
    reason: '無症候性高尿酸血症で合併症なし、SUA<9.0 は薬物療法適応外',
    fromStates: ['naive'],
    forbidden: ['cm_gout_attack_hx', 'cm_gout_tophus', 'rf_gout_attack_current', 'co_attack_frequent'],
    reassess: '3-6ヶ月後に SUA 再測定',
  },
  {
    id: 'start_allopurinol_ckd_ok',
    action: 'STEP_UP',
    drug: 'アロプリノール開始（eGFR≥60、HLA-B*5801陰性確認後）',
    example: 'ザイロリック錠100mg 1日1回 朝食後（2週後に反応確認し漸増）',
    reason: '古典的第一選択。CYP非依存、eGFR別用量調整。HLA-B*5801検査（アジア人20%陽性）推奨',
    fromStates: ['naive'],
    drugClass: '尿酸生成抑制薬',
    preferredWhen: ['cm_urate_production_high', 'cm_gout_attack_hx'],
    forbidden: ['cm_hla_b5801_positive', 'co_azathioprine_use', 'rf_gout_attack_current', 'co_pregnancy'],
    avoidWhen: ['cm_ckd_g45', 'fh_allo_rash'],
    reassess: '4週後 SUA・AST/ALT・Cre・皮疹確認',
    note: 'eGFR 30-59 で 100mg 隔日〜1日、<30 で 100mg 隔日〜最大 100mg/日',
  },
  {
    id: 'start_febuxostat_ckd_or_allo_unable',
    action: 'STEP_UP',
    drug: 'フェブキソスタット開始（CKDまたはアロプリノール不耐）',
    example: 'フェブリク錠10mg 1日1回 朝食後（4週後20mg、最大40mg）',
    reason: '腎機能調整不要、アロプリノール不耐例。CARES試験の心血管シグナルに留意',
    fromStates: ['naive'],
    drugClass: '尿酸生成抑制薬',
    preferredWhen: ['cm_ckd', 'cm_ckd_g45', 'cm_hla_b5801_positive', 'fh_allo_rash'],
    avoidWhen: ['cm_cv_high_risk'],
    forbidden: ['co_pregnancy', 'rf_gout_attack_current'],
    reassess: '4週後 SUA・AST/ALT',
  },
  {
    id: 'start_benzbromarone_excretor',
    action: 'STEP_UP',
    drug: 'ベンズブロマロン開始（排泄低下型、結石なし、eGFR>30）',
    example: 'ユリノーム錠25mg 1日1回（最大100mg）+ ウラリット併用',
    reason: '排泄低下型で結石既往なし、eGFR保存例の選択肢。劇症肝炎注意',
    fromStates: ['naive'],
    drugClass: '尿酸排泄促進薬',
    preferredWhen: ['cm_urate_excretion_low'],
    forbidden: ['cm_urate_stone', 'cm_ckd_g45', 'cm_liver_severe', 'fh_benzbromarone_lft', 'co_pregnancy'],
    reassess: '開始6ヶ月は月1 ALT モニター、SUA確認',
  },

  // === Mono→Dual ===
  {
    id: 'add_alkaline_stone_prevention',
    action: 'ADD',
    drug: 'ウラリット追加（尿酸結石予防/尿pH<6.0）',
    example: 'ウラリット-U 1g×3回/日（尿pH 6.2-6.8目標）',
    reason: '尿酸排泄促進薬との併用、尿酸結石既往や尿pH低値',
    fromStates: ['mono'],
    drugClass: '尿アルカリ化薬',
    preferredWhen: ['cm_urate_stone'],
  },
  {
    id: 'switch_allopurinol_to_febuxostat_sjs',
    action: 'SWITCH',
    drug: 'アロプリノール中止 → フェブキソスタットへ',
    example: 'ザイロリック中止 → フェブリク 10mg 開始',
    reason: 'HLA-B*5801陽性、皮疹既往、SJS/TEN疑い',
    fromStates: ['mono', 'dual'],
    targetClass: '尿酸生成抑制薬',
    urgentWhen: ['rf_sjs_suspect', 'se_allopurinol_skin_reaction'],
    triggerSideEffects: ['se_allopurinol_skin_reaction', 'fh_allo_rash'],
    preferredWhen: ['cm_hla_b5801_positive'],
  },
  {
    id: 'switch_febuxostat_to_allopurinol_cv',
    action: 'SWITCH',
    drug: 'フェブキソスタット中止 → アロプリノールへ（CV高リスク）',
    example: 'フェブリク中止 → ザイロリック 100mg 開始（HLA-B*5801確認後）',
    reason: 'CARES試験の心血管シグナル懸念、CV既往例',
    fromStates: ['mono', 'dual'],
    targetClass: '尿酸生成抑制薬',
    preferredWhen: ['cm_cv_high_risk'],
    forbidden: ['cm_hla_b5801_positive', 'co_azathioprine_use'],
  },

  // === 急性発作 pathway ===
  {
    id: 'acute_attack_nsaid_first',
    action: 'ADD',
    drug: '急性発作: NSAID 第一選択',
    example: 'ナイキサン 300mg×2-3/日 5-7日、またはロキソニン 60mg×3/日',
    reason: '急性発作の第一選択。24-48h以内の開始で効果高い',
    fromStates: ['naive', 'mono', 'dual'],
    urgentWhen: ['rf_gout_attack_current'],
    drugClass: 'NSAID',
    forbidden: ['cm_ckd_g45', 'se_nsaid_intolerance', 'co_anticoag_major', 'cm_peptic_ulcer_hx'],
  },
  {
    id: 'acute_attack_colchicine_early',
    action: 'ADD',
    drug: '急性発作 24h以内: コルヒチン',
    example: 'コルヒチン1mg初回 → 1h後0.5mg（発症24h超なら効果減）',
    reason: '発症24h以内でNSAIDと同等か上回る効果。GI症状に注意',
    fromStates: ['naive', 'mono', 'dual'],
    urgentWhen: ['rf_gout_attack_current'],
    drugClass: 'コルヒチン',
    forbidden: ['co_cyp3a4_inhibitor', 'cm_ckd_g45'],
    avoidWhen: ['se_colchicine_gi'],
  },
  {
    id: 'acute_attack_steroid_fallback',
    action: 'ADD',
    drug: '急性発作: PSL short burst (NSAID/コルヒチン不可時)',
    example: 'プレドニン 30-40mg/日 × 3-5日 → tapering 計7-10日',
    reason: 'CKD進行例・抗凝固併用・多関節炎・NSAID不耐でPSL優先',
    fromStates: ['naive', 'mono', 'dual'],
    urgentWhen: ['rf_gout_attack_current'],
    preferredWhen: ['cm_ckd_g45', 'co_anticoag_major', 'se_nsaid_intolerance'],
    note: '単関節ならトリアムシノロン関節内注射優先',
  },
  {
    id: 'maintain_ult_during_attack',
    action: 'MAINTAIN',
    drug: '⚠ 既服用の尿酸降下薬は発作中も継続（中断・減量・変更しない）',
    reason: '急性発作中のSUA急変で発作遷延。既服用は用量そのまま継続が原則。新規開始のみ厳禁',
    example: '現行処方: アロプリノール100mg / フェブリク10mg / ベンズブロマロン25mg 等 — すべて同量で継続',
    fromStates: ['mono', 'dual'],
    urgentWhen: ['rf_gout_attack_current'],
    preferredWhen: ['co_on_urate_lowering'],
    note: '患者が「発作中だから薬を止めようか」と自己判断しがち → 明示的に継続指示を',
  },
  {
    id: 'urgent_no_new_ult_during_attack',
    action: 'WATCH',
    drug: '⚠ 急性発作中の新規尿酸降下薬開始は厳禁',
    reason: '急性発作中に尿酸生成抑制薬（アロプリノール・フェブキソスタット）や尿酸排泄促進薬（ベンズブロマロン）を新規開始すると、SUA急変で発作が遷延・悪化する',
    example: '今回の発作は NSAID / コルヒチン / PSL short burst で対処。発作消退後 2週を目安に尿酸降下薬を開始',
    fromStates: ['naive'],
    urgentWhen: ['rf_gout_attack_current'],
    preferredWhen: ['rf_gout_attack_current'],
    note: '「今回の発作をきっかけに尿酸降下薬を」は NG。発作鎮静後に改めて開始',
  },
  {
    id: 'add_colchicine_prophylaxis_ult_start',
    action: 'ADD',
    drug: '尿酸降下薬開始/増量時に flare 予防コルヒチン併用',
    example: 'コルヒチン 0.5mg×1-2/日 × 3-6ヶ月',
    reason: '尿酸降下薬開始直後は SUA 変動で発作誘発しやすい',
    fromStates: ['mono'],
    drugClass: 'コルヒチン',
    preferredWhen: ['cm_gout_attack_hx', 'cm_gout_tophus'],
    forbidden: ['co_cyp3a4_inhibitor', 'cm_ckd_g45'],
    reassess: '3-6ヶ月で中止検討（結節あれば長期継続も）',
  },

  // === TAPER / STOP ===
  {
    id: 'taper_ul_attack_free_5y',
    action: 'TAPER',
    drug: '5年以上無発作 → 尿酸降下薬 減量検討',
    example: 'アロプリノール 300mg → 200mg へ段階減量、SUA推移確認',
    reason: '長期無発作で減量検討可。ただし中止は発作再燃リスク',
    fromStates: ['mono', 'dual'],
    requiresAny: ['co_attack_free_5y'],
    note: '結節あり or 過去に重症発作ある場合は継続が安全',
  },
  {
    id: 'discontinue_colchicine_prophylaxis_6mo',
    action: 'STOP',
    drug: 'コルヒチン予防の 3-6ヶ月で中止検討',
    reason: '尿酸降下薬安定期（SUA目標達成）に入ったら予防中止可',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_on_ult_prophylaxis'],
  },
  {
    id: 'taper_overcontrolled_ua',
    action: 'TAPER',
    drug: '過降下（SUA<3.0）→ 尿酸降下薬 減量',
    reason: '認知症状・パーキンソン症状リスク。SUA 5.0-6.0を目安に調整',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['se_low_ua_cognitive'],
  },

  // === REFER ===
  {
    id: 'refer_sjs_allopurinol',
    action: 'REFER',
    drug: '⚠ SJS/TEN疑い → 即中止 + 皮膚科・救急',
    reason: 'アロプリノール皮疹+発熱+粘膜病変は SJS/TEN 懸念',
    fromStates: ['mono', 'dual'],
    urgentWhen: ['rf_sjs_suspect'],
    preferredWhen: ['se_allopurinol_skin_reaction'],
  },
  {
    id: 'refer_severe_tophus',
    action: 'REFER',
    drug: '重症結節痛風 → リウマチ・腎臓専門医',
    reason: '多発結節・治療抵抗性・尿酸腎症併発例',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['cm_gout_tophus'],
  },
  {
    id: 'refer_recurrent_attack',
    action: 'REFER',
    drug: '頻回発作（年≥3回）→ 専門医紹介',
    reason: '尿酸降下薬最適化・二次性高尿酸血症検索・生物学的製剤（IL-1β阻害）検討',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['co_attack_frequent'],
    specialistGate: true,
  },

  // === 併存症 ===
  {
    id: 'address_alcohol_excess',
    action: 'WATCH',
    drug: '節酒指導（慢性期）',
    reason: 'アルコール過多は SUA 上昇の主要因。ただし急性発作中は「まず発作対応」が優先、節酒指導は落ち着いてから',
    fromStates: ['naive', 'mono', 'dual'],
    preferredWhen: ['co_alcohol_excess'],
    avoidWhen: ['rf_gout_attack_current'],
    note: '急性発作中の「節酒指導」は患者体感として的外れに映る。発作消退後の定期指導で',
  },
  {
    id: 'review_diuretic_induced',
    action: 'SWITCH',
    drug: 'サイアザイド利尿薬 → 他剤検討',
    reason: '利尿薬由来の高尿酸血症。HT治療薬の見直し',
    fromStates: ['naive', 'mono', 'dual'],
    preferredWhen: ['cm_ht_diuretic'],
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'アロプリノール',
    modifiers: ['cm_hla_b5801_positive'],
    reason: '【禁忌】SJS/TEN/DIHS高リスク。フェブキソスタット/トピロキソスタットへ',
  },
  {
    drug: 'アロプリノール',
    modifiers: ['co_azathioprine_use'],
    reason: '【禁忌】XOI で AZA代謝抑制 → 骨髄抑制死亡例',
  },
  {
    drug: 'ベンズブロマロン',
    modifiers: ['cm_urate_stone'],
    reason: '【禁忌】尿酸排泄促進で結石悪化',
  },
  {
    drug: 'ベンズブロマロン',
    modifiers: ['cm_liver_severe', 'fh_benzbromarone_lft'],
    reason: '【禁忌】劇症肝炎リスク。開始6ヶ月はALT月1モニター',
  },
  {
    drug: 'ベンズブロマロン / プロベネシド',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】eGFR<30で効果減弱・腎負担',
  },
  {
    drug: '尿酸降下薬（新規開始）',
    modifiers: ['rf_gout_attack_current'],
    reason: '【急性発作中の新規開始は厳禁】SUA急変で発作遷延・悪化。既に服用中の尿酸降下薬は用量そのまま継続',
  },
  {
    drug: 'コルヒチン',
    modifiers: ['co_cyp3a4_inhibitor'],
    reason: '【禁忌級】マクロライド・ベラパミル・シクロスポリン併用で血中濃度急上昇、死亡例',
  },
  {
    drug: 'NSAID',
    modifiers: ['cm_ckd_g45'],
    reason: '【禁忌】AKI・高K血症・体液貯留',
  },
  {
    drug: 'NSAID',
    modifiers: ['cm_peptic_ulcer_hx'],
    reason: '【注意】PPI併用必須。or セレコキシブ（COX-2）選択',
  },
  {
    drug: '尿酸降下薬',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】催奇形性懸念。妊娠中は急性発作時 PSL 短期のみ',
  },
  {
    drug: 'フェブキソスタット',
    modifiers: ['cm_cv_high_risk'],
    reason: '【警告】CARES試験で CV死亡シグナル。CV高リスクでアロプリノール優先',
  },
];
