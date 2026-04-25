/**
 * Treatment Booster — 不眠症 治療修正データ
 * 睡眠薬の適正な使用と休薬のための診療GL (厚労省2014) + 日本睡眠学会GL 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS                                                   */
/* -------------------------------------------------------- */
export const DRUGS = [
  // オレキシン受容体拮抗薬 (第一選択群)
  { id: 'ora_suv', label: 'スボレキサント（ベルソムラ）', class: 'オレキシン受容体拮抗薬',
    doses: [
      { value: '10', label: '10mg 就寝直前' },
      { value: '15', label: '15mg 就寝直前', isDefault: true },
      { value: '20', label: '20mg 就寝直前', isMax: true },
    ] },
  { id: 'ora_lem', label: 'レンボレキサント（デエビゴ）', class: 'オレキシン受容体拮抗薬',
    doses: [
      { value: '2.5', label: '2.5mg 就寝直前' },
      { value: '5', label: '5mg 就寝直前', isDefault: true },
      { value: '10', label: '10mg 就寝直前', isMax: true },
    ] },

  // メラトニン受容体作動薬
  { id: 'mel_ram', label: 'ラメルテオン（ロゼレム）', class: 'メラトニン受容体作動薬',
    doses: [{ value: '8', label: '8mg 就寝30分前', isDefault: true, isMax: true }] },

  // 非BZ系 (Z-drug)
  { id: 'zd_zol', label: 'ゾルピデム（マイスリー）', class: 'Z-drug',
    doses: [
      { value: '5', label: '5mg 就寝直前', isDefault: true },
      { value: '10', label: '10mg 就寝直前', isMax: true },
    ] },
  { id: 'zd_esz', label: 'エスゾピクロン（ルネスタ）', class: 'Z-drug',
    doses: [
      { value: '1', label: '1mg 就寝直前' },
      { value: '2', label: '2mg 就寝直前', isDefault: true },
      { value: '3', label: '3mg 就寝直前', isMax: true },
    ] },
  { id: 'zd_zop', label: 'ゾピクロン（アモバン）', class: 'Z-drug',
    doses: [
      { value: '7.5', label: '7.5mg 就寝直前', isDefault: true },
      { value: '10', label: '10mg 就寝直前', isMax: true },
    ] },

  // BZ系 (GL非推奨・短期のみ)
  { id: 'bz_bro', label: 'ブロチゾラム（レンドルミン）短時間型', class: 'BZ系',
    doses: [
      { value: '0.125', label: '0.125mg' },
      { value: '0.25', label: '0.25mg', isDefault: true, isMax: true },
    ] },
  { id: 'bz_flu', label: 'フルニトラゼパム（サイレース）中長時間型', class: 'BZ系',
    doses: [
      { value: '1', label: '1mg', isDefault: true },
      { value: '2', label: '2mg', isMax: true },
    ] },
  { id: 'bz_tri', label: 'トリアゾラム（ハルシオン）超短時間型', class: 'BZ系',
    doses: [
      { value: '0.125', label: '0.125mg', isDefault: true },
      { value: '0.25', label: '0.25mg', isMax: true },
    ] },

  // 抗うつ薬 (off-label for insomnia / 併存時)
  { id: 'ad_trz', label: 'トラゾドン（レスリン/デジレル）', class: '抗うつ薬（鎮静系）',
    doses: [
      { value: '25', label: '25mg 就寝前' },
      { value: '50', label: '50mg 就寝前', isDefault: true },
      { value: '75', label: '75mg 就寝前', isMax: true },
    ] },
  { id: 'ad_mir', label: 'ミルタザピン（リフレックス/レメロン）', class: '抗うつ薬（鎮静系）',
    doses: [
      { value: '7.5', label: '7.5mg 就寝前' },
      { value: '15', label: '15mg 就寝前', isDefault: true },
      { value: '30', label: '30mg 就寝前', isMax: true },
    ] },

  // 漢方
  { id: 'kp_yok', label: '抑肝散（ツムラ54）', class: '漢方',
    doses: [{ value: '7.5g', label: '7.5g 分3 食前', isDefault: true, isMax: true }] },
  { id: 'kp_san', label: '酸棗仁湯（ツムラ103）', class: '漢方',
    doses: [{ value: '7.5g', label: '7.5g 分3 食前', isDefault: true, isMax: true }] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // ===== 不眠症タイプ（最優先、主要選択） =====
  // 数字入力不要でここから選ぶだけで大まかな薬剤選択に影響
  { id: 'cm_insomnia_onset', label: '入眠困難', cat: '不眠症タイプ（主要選択）' },
  { id: 'cm_insomnia_maintenance', label: '中途覚醒', cat: '不眠症タイプ（主要選択）' },
  { id: 'cm_insomnia_early_morning', label: '早期覚醒（うつ鑑別要）', cat: '不眠症タイプ（主要選択）' },
  { id: 'cm_insomnia_nonrestorative', label: '熟眠障害', cat: '不眠症タイプ（主要選択）' },

  // 副作用
  { id: 'se_paradoxical_reaction', label: '奇異反応（興奮・攻撃性）', cat: '副作用', severity: 'critical' },
  { id: 'se_anterograde_amnesia', label: '前向性健忘・睡眠時行動（運転・電話・食事）', cat: '副作用', severity: 'critical' },
  { id: 'se_morning_hangover', label: '翌朝持ち越し・日中傾眠', cat: '副作用' },
  { id: 'se_falls_elderly', label: '夜間転倒・ふらつき', cat: '副作用', severity: 'critical' },
  { id: 'se_cognitive_impairment', label: '認知機能低下', cat: '副作用' },
  { id: 'se_rebound_insomnia', label: '反跳性不眠（中止後）', cat: '副作用' },
  { id: 'se_daytime_somnolence', label: '日中過眠', cat: '副作用' },

  // 期間
  { id: 'cm_chronic_insomnia', label: '3ヶ月以上持続（慢性）', cat: '期間' },
  { id: 'cm_transient_insomnia', label: '数週以内（一過性）', cat: '期間' },

  // 併存疾患
  { id: 'cm_depression', label: 'うつ病併存', cat: '併存疾患' },
  { id: 'cm_anxiety', label: '不安障害併存', cat: '併存疾患' },
  { id: 'cm_pain_related_insomnia', label: '疼痛誘発性不眠', cat: '併存疾患' },
  { id: 'cm_osas_suspected', label: 'OSAS疑い（いびき・日中傾眠・BMI≥30）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_osas_diagnosed', label: 'OSAS診断確定', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_rls', label: 'Restless Legs症候群', cat: '併存疾患' },
  { id: 'cm_dementia', label: '認知症併存', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_liver_severe', label: '肝機能障害 Child-Pugh B以上', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_dependence_risk', label: 'アルコール/物質依存歴', cat: '併存疾患' },
  { id: 'cm_parkinson', label: 'パーキンソン病', cat: '併存疾患' },

  // 制約
  { id: 'co_elderly_65', label: '高齢者（≥65歳）', cat: '制約' },
  { id: 'co_elderly_75', label: '高齢者（≥75歳）', cat: '制約', severity: 'critical' },
  { id: 'co_elderly_female', label: '高齢女性（ゾルピデム5mg上限）', cat: '制約' },
  { id: 'co_pregnancy', label: '妊娠中', cat: '制約', severity: 'critical' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_pediatric', label: '小児（18歳未満）', cat: '制約' },
  { id: 'co_chronic_use_3mo', label: '3ヶ月以上連用中', cat: '制約', severity: 'critical' },
  { id: 'co_polypharmacy_sleep', label: '睡眠薬複数併用', cat: '制約', severity: 'critical' },
  { id: 'co_sleep_hygiene_poor', label: '睡眠衛生不良', cat: '制約' },
  { id: 'co_caffeine_alcohol_excess', label: 'カフェイン/アルコール過多', cat: '制約' },
  { id: 'co_shift_worker', label: '交代勤務', cat: '制約' },
  { id: 'co_alcohol_concurrent', label: 'アルコール常用（夕方以降）', cat: '制約', severity: 'critical' },
  { id: 'co_cyp3a4_inhibitor', label: 'CYP3A4阻害薬併用（マクロライド・アゾール・グレープフルーツ等）', cat: '制約', severity: 'critical' },
  { id: 'co_fluvoxamine_use', label: 'フルボキサミン併用', cat: '制約', severity: 'critical' },
  { id: 'co_opioid_use', label: 'オピオイド使用中', cat: '制約', severity: 'critical' },
  { id: 'cm_co2_retention', label: 'CO2貯留（COPD/神経筋疾患）', cat: '併存疾患', severity: 'critical' },

  // 失敗歴
  { id: 'fh_bz_dependence', label: 'BZ系依存・離脱歴', cat: '失敗歴', severity: 'critical' },
  { id: 'fh_zdrug_tolerance', label: 'Z-drug 耐性形成歴', cat: '失敗歴' },

  // Red Flag
  { id: 'rf_suicidal_ideation', label: '希死念慮あり', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_severe_day_impairment', label: '重度日中機能障害（就労不能等）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC                                          */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '不眠症評価（ISI + 睡眠パラメータ）',
  inputs: [
    { id: 'isi_score', label: 'ISIスコア（0-28）', unit: '点', placeholder: '例:18' },
    { id: 'sleep_latency_min', label: '入眠潜時', unit: '分', placeholder: '例:45' },
    { id: 'night_wake_freq', label: '中途覚醒回数', unit: '回/夜', placeholder: '例:3' },
    { id: 'total_sleep_hr', label: '総睡眠時間', unit: 'h', placeholder: '例:5.5' },
    { id: 'day_impairment', label: '日中機能障害（0=なし/1=軽/2=重）', unit: '0-2', placeholder: '1' },
    { id: 'duration_months', label: '不眠持続期間', unit: '月', placeholder: '例:6' },
  ],
  note: '数字入力は任意（時間がない時はスキップ可）。「不眠症タイプ」チップ選択 + 状態ダイレクト選択で推奨が出ます。ISI 0-7:なし、8-14:sub-threshold、15-21:中等度、22-28:重症。3ヶ月以上連用で漸減計画必須',
  deriveStatus: (v, modifiers = []) => {
    const isi = v.isi_score;
    const sol = v.sleep_latency_min;
    const wakes = v.night_wake_freq;
    const tst = v.total_sleep_hr;
    const imp = v.day_impairment;
    const has = (m) => modifiers.includes(m);

    if (isi === undefined && sol === undefined && tst === undefined) return null;

    // Overcontrolled: 薬剤過量による副作用
    if (['se_falls_elderly', 'se_cognitive_impairment', 'se_morning_hangover', 'se_daytime_somnolence', 'se_anterograde_amnesia', 'se_paradoxical_reaction'].some(has)) {
      return 'overcontrolled';
    }

    // Uncontrolled
    if (isi !== undefined && isi >= 15) return 'uncontrolled';
    if (sol !== undefined && sol > 30 && imp !== undefined && imp >= 1) return 'uncontrolled';
    if (wakes !== undefined && wakes >= 3 && imp !== undefined && imp >= 1) return 'uncontrolled';
    if (has('rf_severe_day_impairment')) return 'uncontrolled';

    // Near target (sub-threshold)
    if (isi !== undefined && isi >= 8 && isi <= 14) return 'near_target';
    if (sol !== undefined && sol > 30 && (imp === undefined || imp === 0)) return 'near_target';

    // Controlled
    if (isi !== undefined && isi < 8 && (imp === undefined || imp === 0)) return 'controlled';
    return 'near_target';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'se_paradoxical_reaction',
  'se_anterograde_amnesia',
  'se_falls_elderly',
  'se_daytime_somnolence',
  'se_cognitive_impairment',
  'se_rebound_insomnia',
  'cm_dependence_risk',
  'co_chronic_use_3mo',
  'co_polypharmacy_sleep',
  'rf_suicidal_ideation',
];

/* -------------------------------------------------------- */
/*  HELPERS                                                 */
/* -------------------------------------------------------- */
export function formatAppliedTarget(modifiers = []) {
  if (modifiers.includes('co_elderly_75')) return 'ISI <10（高齢者、許容広め）+ 副作用なし';
  if (modifiers.includes('co_elderly_65')) return 'ISI <10（高齢者）+ 副作用なし';
  return 'ISI <8 + 入眠潜時 <30分 + 日中機能良好';
}

export function suggestAgeNudge() {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      co_chronic_use_3mo: '3ヶ月以上連用 自動検出',
      se_daytime_somnolence: '日中過眠 自動検出',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const duration = metricValues.duration_months;
  const imp = metricValues.day_impairment;
  if (duration !== undefined && duration >= 3) flags.push('co_chronic_use_3mo');
  if (imp !== undefined && imp >= 2) flags.push('rf_severe_day_impairment');
  // 複数睡眠薬使用検出
  if (currentDrugs && currentDrugs.length >= 2 && allDrugs) {
    const sedativeClasses = new Set();
    currentDrugs.forEach((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const d = allDrugs.find((x) => x.id === id);
      if (d && ['オレキシン受容体拮抗薬', 'メラトニン受容体作動薬', 'Z-drug', 'BZ系', '抗うつ薬（鎮静系）'].includes(d.class)) {
        sedativeClasses.add(d.class);
      }
    });
    if (sedativeClasses.size >= 2) flags.push('co_polypharmacy_sleep');
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  const isi = metricValues.isi_score;
  const duration = metricValues.duration_months;

  if (isi !== undefined && isi >= 22) {
    alerts.push({
      type: 'isi_severe',
      label: '⚠ ISI ≥22: 重症不眠',
      detail: '即時介入。精神科併診・CBT-I・薬物療法の複合アプローチ。希死念慮スクリーニング必須',
    });
  }
  if (duration !== undefined && duration >= 3) {
    alerts.push({
      type: 'chronic_3mo',
      label: '3ヶ月以上の慢性不眠 → CBT-I が第一選択',
      detail: '薬物単独では長期予後改善せず。CBT-I（認知行動療法）併用を推奨',
    });
  }
  if (mods.includes('cm_osas_suspected')) {
    alerts.push({
      type: 'osas_screen',
      label: '⚠ OSAS疑い: 睡眠検査優先',
      detail: 'STOP-BANG問診、PSG or 簡易検査。OSAS下でBZ系は呼吸抑制リスク。原疾患治療（CPAP）で不眠改善も',
    });
  }
  if (mods.includes('cm_depression')) {
    alerts.push({
      type: 'depression_comorbid',
      label: 'うつ併存: ミルタザピン/トラゾドン等鎮静系抗うつ薬が有用',
      detail: '不眠+うつの同時治療。PHQ-9スクリーニング、重症なら精神科紹介',
    });
  }
  if (mods.includes('rf_suicidal_ideation')) {
    alerts.push({
      type: 'suicide_risk',
      label: '⚠ 希死念慮: 即精神科紹介',
      detail: '大量処方は避け、短期処方 + 頻回受診。家族同席。BZ系は使用慎重',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasBZ = currentClasses.has('BZ系');
  const hasZdrug = currentClasses.has('Z-drug');
  const hasOrexin = currentClasses.has('オレキシン受容体拮抗薬');
  const hasBZ_or_Zdrug = hasBZ || hasZdrug;

  if (hasBZ && (mods.includes('cm_dementia') || mods.includes('co_elderly_75'))) {
    alerts.push({
      type: 'bz_dementia_falls',
      label: '⚠ BZ系 + 認知症/超高齢者: 転倒・せん妄リスク',
      detail: 'Beers基準で回避推奨。レンボレキサント（デエビゴ）やラメルテオン（ロゼレム）へ切替',
      severity: 'critical',
    });
  }
  if (hasBZ_or_Zdrug && (mods.includes('cm_osas_suspected') || mods.includes('cm_osas_diagnosed'))) {
    alerts.push({
      type: 'bz_osas',
      label: '⚠ BZ/Z-drug + OSAS: 呼吸抑制リスク',
      detail: 'オレキシン受容体拮抗薬 or メラトニン受容体作動薬へ切替。OSAS治療（CPAP）を並行',
      severity: 'critical',
    });
  }
  if (hasBZ_or_Zdrug && mods.includes('co_pregnancy')) {
    alerts.push({
      type: 'bz_pregnancy',
      label: '⚠ BZ/Z-drug + 妊娠: 催奇形性・新生児離脱・floppy infant',
      detail: '即中止検討。非薬物療法（CBT-I）優先。産婦人科・精神科連携',
      severity: 'critical',
    });
  }
  if (mods.includes('co_chronic_use_3mo') && hasBZ_or_Zdrug) {
    alerts.push({
      type: 'chronic_bz_taper',
      label: '3ヶ月以上連用: 漸減計画を',
      detail: '25%ずつ2-4週間隔で漸減。CBT-I併用、オレキシン/メラトニンへの置換も選択肢',
    });
  }
  if (hasBZ && mods.includes('co_polypharmacy_sleep')) {
    alerts.push({
      type: 'polypharmacy_sleep',
      label: '⚠ 睡眠薬複数併用',
      detail: '過鎮静・認知機能低下リスク。優先度低い薬から漸減、最終的に単剤化へ',
      severity: 'critical',
    });
  }
  if (hasBZ_or_Zdrug && mods.includes('cm_liver_severe')) {
    alerts.push({
      type: 'bz_liver',
      label: '⚠ BZ/Z-drug + 重症肝障害',
      detail: '代謝遅延で過鎮静。ラメルテオン（肝代謝も）も禁忌級、短時間型オレキシン（レンボレキサント）を慎重使用',
      severity: 'critical',
    });
  }
  if (currentDrugs.some((e) => (typeof e === 'string' ? e : e.id) === 'zd_zol') && mods.includes('co_elderly_female')) {
    alerts.push({
      type: 'zolpidem_elderly_female',
      label: 'ゾルピデム + 高齢女性: 5mg上限推奨',
      detail: 'FDA勧告: 女性は代謝遅く、翌朝運転障害。5mgを上限に',
    });
  }
  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'rf_suicidal_ideation',
    'rf_severe_day_impairment',
    'cm_osas_suspected',
    'cm_osas_diagnosed',
    'cm_depression',
    'cm_dementia',
    'fh_bz_dependence',
    'co_polypharmacy_sleep',
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
    drug: '現状維持（良好な睡眠コントロール）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '睡眠衛生のみ維持',
    reason: 'ISI低値、日中機能良好、副作用なし',
    reassess: '3ヶ月毎に漸減可能性評価（特にBZ/Z-drugは）。睡眠衛生の継続確認',
    note: '3ヶ月以上連用の場合は減量計画を常に意識。CBT-I併用で薬物離脱可能性を探る',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '睡眠衛生・CBT-I 強化 + 4週後再評価',
    example: '就寝・起床時刻固定、カフェイン/アルコール制限、寝室環境改善、刺激統制、睡眠制限療法',
    reason: 'ISI sub-threshold (8-14)。薬物より非薬物が長期有効性で優位',
    reassess: '4週後 ISI 再評価。改善なければ薬物療法（オレキシン/メラトニン優先）',
    note: 'CBT-I は薬物療法と同等以上の効果、かつ長期予後良好',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    ora_suv: ['se_morning_hangover', 'se_daytime_somnolence'],
    ora_lem: ['se_morning_hangover'],
    zd_zol: ['co_elderly_female', 'se_falls_elderly', 'se_anterograde_amnesia'],
    zd_esz: ['se_morning_hangover'],
    bz_bro: ['se_falls_elderly', 'co_elderly_75', 'cm_dementia'],
    bz_flu: ['se_morning_hangover', 'co_elderly_65'],
    bz_tri: ['se_anterograde_amnesia', 'fh_bz_dependence'],
  };
  const forbiddenMap = {
    bz_bro: ['cm_osas_suspected', 'cm_osas_diagnosed', 'cm_dementia', 'co_pregnancy'],
    bz_flu: ['cm_osas_suspected', 'cm_osas_diagnosed', 'cm_dementia', 'co_pregnancy', 'cm_liver_severe'],
    bz_tri: ['cm_osas_suspected', 'cm_osas_diagnosed', 'co_pregnancy'],
    zd_zol: ['cm_osas_suspected', 'co_pregnancy'],
    zd_esz: ['cm_osas_suspected', 'co_pregnancy'],
    zd_zop: ['cm_osas_suspected', 'co_pregnancy'],
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
    example: `${drug.label} ${nextDose.label}（現用量 ${currentDose.label} から）`,
    reason: 'BZ/Z-drugの増量は依存・耐性リスク。オレキシン/メラトニンは比較的安全',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '2週後 ISI・日中機能・副作用（持ち越し・健忘・転倒）',
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
    id: 'naive_sleep_hygiene_cbti_first',
    action: 'WATCH',
    drug: '睡眠衛生指導 + CBT-I 導入（第一選択）',
    example: '就寝・起床時刻固定、カフェイン<午後・アルコール制限、寝室環境改善、日中活動、刺激統制・睡眠制限療法',
    reason: 'GINA/JP GL: 不眠症の第一選択は非薬物療法。薬物より長期予後良好',
    fromStates: ['naive'],
    forbidden: ['rf_suicidal_ideation', 'rf_severe_day_impairment'],
    reassess: '2-4週後 ISI・睡眠日誌で再評価',
  },
  {
    id: 'start_orexin_first_elderly',
    action: 'STEP_UP',
    drug: 'オレキシン受容体拮抗薬 開始（高齢者第一選択）',
    example: 'デエビゴ 5mg 就寝直前、または ベルソムラ 15mg',
    reason: '転倒・認知機能低下リスク低い。入眠+中途覚醒の両方に有効',
    fromStates: ['naive'],
    drugClass: 'オレキシン受容体拮抗薬',
    preferredWhen: ['co_elderly_65', 'co_elderly_75', 'cm_insomnia_maintenance', 'cm_insomnia_nonrestorative'],
    forbidden: ['cm_liver_severe', 'co_pregnancy'],
    reassess: '2週後 ISI・日中機能',
  },
  {
    id: 'start_melatonin_first_onset',
    action: 'STEP_UP',
    drug: 'ラメルテオン 開始（入眠障害・安全性優先）',
    example: 'ロゼレム 8mg 就寝30分前',
    reason: '依存性ゼロ、BZ回避、高齢者・認知症で最安全',
    fromStates: ['naive'],
    drugClass: 'メラトニン受容体作動薬',
    preferredWhen: ['co_elderly_75', 'cm_dementia', 'cm_insomnia_onset'],
    forbidden: ['cm_liver_severe', 'co_pregnancy', 'co_fluvoxamine_use'],
    avoidWhen: [],
    note: 'フルボキサミン併用禁忌（血中濃度上昇）',
  },
  {
    id: 'evaluate_nonrestorative_first',
    action: 'INVESTIGATE',
    drug: '熟眠障害: OSAS・PLMD・うつ・甲状腺・夜間頻尿の二次性鑑別を優先',
    example: 'OSAS問診（いびき/無呼吸/BMI≥30）、Epworth、TSH、PSG/簡易検査検討',
    reason: '熟眠障害単独は二次性原因が多く、薬剤前に原因検索が GL推奨',
    fromStates: ['naive'],
    preferredWhen: ['cm_insomnia_nonrestorative'],
    note: '原因不明で薬剤導入する場合はオレキシン拮抗薬が第一（睡眠構築改善）',
  },
  {
    id: 'start_orexin_nonrestorative',
    action: 'STEP_UP',
    drug: 'オレキシン受容体拮抗薬（熟眠障害・睡眠構築改善）',
    example: 'デエビゴ 5mg or ベルソムラ 15mg 就寝直前',
    reason: '熟眠障害（中途覚醒・浅い睡眠）にREM/Non-REM構築を保ちつつ作用',
    fromStates: ['naive'],
    drugClass: 'オレキシン受容体拮抗薬',
    preferredWhen: ['cm_insomnia_nonrestorative'],
    forbidden: ['cm_liver_severe', 'co_pregnancy', 'co_opioid_use', 'co_cyp3a4_inhibitor'],
    avoidWhen: ['cm_osas_suspected'],
    reassess: '4週後 ISI・日中倦怠感',
  },
  {
    id: 'start_zdrug_young_sleep_onset',
    action: 'STEP_UP',
    drug: 'Z-drug（ゾルピデム）短期開始（若年・入眠障害）',
    example: 'マイスリー 5mg 就寝直前、4週以内の短期使用',
    reason: '若年・一過性・入眠障害に短期使用。4週以内で終了計画を同時提示',
    fromStates: ['naive'],
    drugClass: 'Z-drug',
    preferredWhen: ['cm_insomnia_onset', 'cm_transient_insomnia'],
    forbidden: ['cm_osas_suspected', 'cm_dementia', 'co_pregnancy', 'co_elderly_75'],
    avoidWhen: ['co_elderly_female', 'co_chronic_use_3mo'],
    reassess: '2-4週後で継続可否判断、4週以内に漸減計画',
  },
  {
    id: 'start_eszopiclone_maintenance',
    action: 'STEP_UP',
    drug: 'エスゾピクロン（中途覚醒対応）',
    example: 'ルネスタ 2mg 就寝直前',
    reason: '中途覚醒優位で Z-drug中では長めの作用時間',
    fromStates: ['naive'],
    drugClass: 'Z-drug',
    preferredWhen: ['cm_insomnia_maintenance'],
    forbidden: ['cm_osas_suspected', 'cm_dementia', 'co_pregnancy', 'co_elderly_75'],
    note: '苦味副作用あり（亜鉛欠乏で増強）',
  },
  {
    id: 'start_mirtazapine_with_depression',
    action: 'STEP_UP',
    drug: 'ミルタザピン（うつ＋不眠の同時治療）',
    example: 'リフレックス 15mg 就寝前（必要に応じて30mg）',
    reason: '鎮静作用強く、うつと不眠の一石二鳥。食欲低下も改善。プライマリケアで導入可、PHQ-9 ≥10 or 重症化兆候なら精神科併診',
    fromStates: ['naive', 'mono'],
    drugClass: '抗うつ薬（鎮静系）',
    preferredWhen: ['cm_depression'],
    avoidWhen: ['co_obese', 'cm_rls'],
    forbidden: ['co_pregnancy'],
    note: 'PHQ-9: 0-4軽症（睡眠衛生）/ 5-9軽度（経過観察+ミルタザピン考慮）/ 10-14中等度（ミルタザピン+精神科紹介検討）/ ≥15重度（精神科紹介必須）。体重増加・下肢不穏感（RLS悪化）注意',
  },

  // === SWITCH ===
  {
    id: 'switch_bz_to_orexin_elderly',
    action: 'SWITCH',
    drug: 'BZ系 → オレキシン受容体拮抗薬（高齢者）',
    example: 'ハルシオン/レンドルミン中止（漸減）→ デエビゴ 5mg',
    reason: '高齢者BZ使用は転倒・骨折・せん妄・認知低下リスク',
    fromStates: ['mono', 'dual'],
    targetClass: 'オレキシン受容体拮抗薬',
    preferredWhen: ['co_elderly_65', 'co_elderly_75', 'se_falls_elderly'],
    note: 'BZ漸減（25%×2週）とオレキシン開始を並行、反跳性不眠予防',
  },
  {
    id: 'switch_bz_to_melatonin_mild',
    action: 'SWITCH',
    drug: 'BZ → ラメルテオン（軽症・長期使用）',
    example: 'レンドルミン漸減 → ロゼレム 8mg',
    reason: '軽症不眠でBZ長期使用 → 最安全薬へ置換',
    fromStates: ['mono'],
    targetClass: 'メラトニン受容体作動薬',
    preferredWhen: ['co_elderly_75', 'cm_dementia', 'cm_dependence_risk'],
  },
  {
    id: 'switch_zdrug_to_orexin_tolerance',
    action: 'SWITCH',
    drug: 'Z-drug → オレキシン（耐性形成）',
    example: 'マイスリー漸減 → デエビゴ 5mg',
    reason: '効果減弱・増量傾向は耐性形成兆候',
    fromStates: ['mono'],
    triggerSideEffects: ['fh_zdrug_tolerance'],
    targetClass: 'オレキシン受容体拮抗薬',
  },

  // === TAPER / STOP ===
  {
    id: 'taper_chronic_bz_3mo',
    action: 'TAPER',
    drug: '3ヶ月以上のBZ連用 → 漸減計画',
    example: '25%ずつ2-4週間隔で漸減。必要時オレキシン/メラトニンへ置換',
    reason: '長期連用で依存形成・認知機能低下',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_chronic_use_3mo'],
    note: '急な中止は離脱症状（不眠悪化・不安・痙攣）。CBT-I併用で成功率向上',
  },
  {
    id: 'taper_polypharmacy_sleep',
    action: 'TAPER',
    drug: '複数睡眠薬併用 → 優先度低から漸減',
    reason: '過鎮静・認知低下・転倒リスク',
    fromStates: ['dual', 'triple', 'quad_plus'],
    preferredWhen: ['co_polypharmacy_sleep'],
  },
  {
    id: 'stop_on_paradoxical_reaction',
    action: 'STOP',
    drug: '奇異反応発現 → 即中止',
    example: 'BZ/Z-drug 即中止。興奮・攻撃性・健忘行動が発現',
    reason: 'BZ/Z-drugで奇異反応は希だが重大',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['se_paradoxical_reaction', 'se_anterograde_amnesia'],
    preferredWhen: ['se_paradoxical_reaction', 'se_anterograde_amnesia'],
  },

  // === REFER ===
  {
    id: 'refer_psychiatry_severe',
    action: 'REFER',
    drug: '精神科紹介（重症うつ・希死念慮）',
    reason: 'PHQ-9≥15 or 希死念慮あり',
    fromStates: ['naive', 'mono', 'dual'],
    urgentWhen: ['rf_suicidal_ideation'],
    preferredWhen: ['cm_depression', 'cm_anxiety'],
  },
  {
    id: 'refer_sleep_specialist_osas',
    action: 'REFER',
    drug: 'OSAS疑い → 呼吸器・睡眠医療専門医',
    reason: 'STOP-BANG ≥3 + BMI≥30 + 目撃無呼吸',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['cm_osas_suspected'],
    urgentWhen: ['cm_osas_suspected'],
    note: 'PSG or 簡易検査。CPAP導入で不眠改善',
  },
  {
    id: 'refer_rls_specialist',
    action: 'REFER',
    drug: 'RLS疑い → 神経内科',
    reason: '鉄代謝（フェリチン）・ドパミン作動薬評価',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_rls'],
  },

  // === 生活指導 ===
  {
    id: 'lifestyle_caffeine_alcohol',
    action: 'WATCH',
    drug: 'カフェイン・アルコール制限',
    example: 'カフェイン 15時以降禁、アルコール就寝前禁（半覚醒促進）',
    reason: '生活要因が不眠の主因の場合、薬物より効果大',
    fromStates: ['naive', 'mono'],
    preferredWhen: ['co_caffeine_alcohol_excess', 'co_sleep_hygiene_poor'],
  },
  {
    id: 'cbt_i_referral',
    action: 'ADD',
    drug: 'CBT-I 併用（慢性不眠の標準治療）',
    reason: '薬物と同等以上の効果、長期予後良好',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_chronic_insomnia', 'co_chronic_use_3mo'],
    note: '睡眠衛生・刺激統制・睡眠制限・認知再構成の複合プログラム',
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'BZ系 / Z-drug',
    modifiers: ['cm_osas_suspected', 'cm_osas_diagnosed'],
    reason: '【禁忌級】呼吸抑制リスク。OSAS下では使用回避',
  },
  {
    drug: 'BZ系 / Z-drug',
    modifiers: ['cm_dementia'],
    reason: '【禁忌級】せん妄・転倒・認知機能悪化（Beers基準）',
  },
  {
    drug: 'BZ系',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】催奇形性、新生児離脱症候群、floppy infant',
  },
  {
    drug: 'BZ系 / Z-drug',
    modifiers: ['cm_liver_severe'],
    reason: '【禁忌】代謝遅延・過鎮静',
  },
  {
    drug: '睡眠薬全般（3ヶ月以上連用）',
    modifiers: ['co_chronic_use_3mo'],
    reason: '【要注意】漸減計画なしの継続禁。CBT-I併用で減量目指す',
  },
  {
    drug: 'ゾルピデム',
    modifiers: ['co_elderly_female'],
    reason: '【FDA勧告】女性は代謝遅く5mg上限。翌朝運転障害',
  },
  {
    drug: 'ラメルテオン',
    modifiers: ['co_fluvoxamine_use'],
    reason: '【禁忌】フルボキサミン併用でCYP1A2阻害により血中濃度急上昇',
  },
  {
    drug: 'トリアゾラム（ハルシオン）',
    modifiers: ['co_elderly_65', 'co_elderly_75', 'fh_bz_dependence'],
    reason: '【ほぼ禁忌】超短時間型で依存・前向性健忘・奇異反応強い。高齢者ではBeers基準で回避必須',
  },
  {
    drug: 'BZ系 / Z-drug',
    modifiers: ['co_alcohol_concurrent'],
    reason: '【禁忌級】呼吸抑制相乗・死亡例。CBT-I + 断酒指導 + オレキシン拮抗薬へ',
  },
  {
    drug: 'BZ系 / Z-drug / オピオイド',
    modifiers: ['co_opioid_use'],
    reason: '【禁忌級】呼吸抑制相乗。FDAブラックボックス警告。オレキシン拮抗薬へ切替',
  },
  {
    drug: 'スボレキサント / レンボレキサント',
    modifiers: ['co_cyp3a4_inhibitor'],
    reason: '【用量制限】強CYP3A4阻害薬併用は禁忌。中等度阻害薬では半量に',
  },
  {
    drug: 'BZ系 / Z-drug',
    modifiers: ['cm_co2_retention'],
    reason: '【禁忌級】CO2貯留型呼吸不全で呼吸抑制増悪。オレキシン拮抗薬へ',
  },
];
