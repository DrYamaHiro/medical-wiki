/**
 * Overview Booster — 慢性疾患メタデータ
 *
 * v0.1 MVP: 11疾患 (生活習慣病3 + 循環器3 + 腎1 + 呼吸2 + 代謝1 + 二次予防1)
 * - 個別 TreatmentBooster がある: HT/DLP/T2DM/喘息/COPD/痛風
 * - 個別 TreatmentBooster がまだない (Hub 内薬剤辞書で対応): HFrEF/HFpEF/CKD/AF/動脈硬化二次予防
 *
 * STEP 1 で表示する代表薬剤クラスはここで定義 (10剤程度に絞り、詳細は個別Boosterへ deep link)
 */

import { TREATMENT_DATA } from '../TreatmentBooster/registry';

// 疾患カテゴリ色 (色覚配慮: 太い左ボーダー + テキストカテゴリ名併記)
export const DISEASE_CATEGORIES = {
  cardiovascular: { label: '循環器',   color: '#c62828' },
  metabolic:      { label: '代謝',     color: '#ef6c00' },
  renal:          { label: '腎',       color: '#6a1b9a' },
  respiratory:    { label: '呼吸器',   color: '#0097a7' },
  mental:         { label: '精神/神経', color: '#2e7d32' },
  musculoskeletal:{ label: '骨/関節',   color: '#5d4037' },
};

// 11疾患マスタ
export const OVERVIEW_DISEASES = [
  {
    key: 'ht', label: '高血圧', icd: 'I10',
    category: 'cardiovascular',
    boosterKey: 'hypertension',
    deepLink: '/docs/002-Chronic-Treatment/i10-hypertension-treatment',
    scoreKind: 'jsh2025_risk',
    drugClasses: [
      { id: 'ht_arb',     label: 'ARB',         examples: 'アジルバ20mg / ロサルタン50mg' },
      { id: 'ht_acei',    label: 'ACE阻害薬',   examples: 'イミダプリル5mg' },
      { id: 'ht_ccb',     label: 'CCB',         examples: 'アムロジピン5mg' },
      { id: 'ht_thiazide',label: 'サイアザイド利尿薬', examples: 'トリクロルメチアジド0.5mg' },
      { id: 'ht_mra',     label: 'MRA',         examples: 'スピロノラクトン25mg / エサキセレノン2.5mg' },
      { id: 'ht_arni',    label: 'ARNI',        examples: 'エンレスト100-200mg×2' },
      { id: 'ht_bb',      label: 'β遮断薬',     examples: 'ビソプロロール2.5mg / カルベジロール5mg' },
    ],
  },
  {
    key: 'dlp', label: '脂質異常症', icd: 'E78',
    category: 'metabolic',
    boosterKey: 'dyslipidemia',
    deepLink: '/docs/002-Chronic-Treatment/e78-dyslipidemia-treatment',
    scoreKind: 'hisayama',
    drugClasses: [
      { id: 'dlp_statin_low',   label: 'スタチン (低強度)', examples: 'プラバスタチン10mg' },
      { id: 'dlp_statin_mid',   label: 'スタチン (中強度)', examples: 'ピタバスタチン2mg / アトルバスタチン10mg' },
      { id: 'dlp_statin_high',  label: 'スタチン (高強度)', examples: 'ロスバスタチン10-20mg' },
      { id: 'dlp_eze',          label: 'エゼチミブ',         examples: 'ゼチーア10mg' },
      { id: 'dlp_fibrate',      label: 'フィブラート',       examples: 'ペマフィブラート0.2mg×2' },
      { id: 'dlp_pcsk9',        label: 'PCSK9阻害薬',        examples: 'エボロクマブ140mg 2W毎 / アリロクマブ150mg 2W毎' },
      { id: 'dlp_omega3',       label: 'オメガ-3',           examples: 'EPA 1800mg/日' },
    ],
  },
  {
    key: 't2dm', label: '2型糖尿病', icd: 'E11',
    category: 'metabolic',
    boosterKey: 't2dm',
    deepLink: '/docs/002-Chronic-Treatment/e11-t2dm-treatment',
    scoreKind: null, // v0.2 で追加
    drugClasses: [
      { id: 'dm_met',    label: 'メトホルミン', examples: 'メトグルコ500-750mg×2-3' },
      { id: 'dm_sglt2',  label: 'SGLT2i',       examples: 'ジャディアンス10mg / フォシーガ10mg' },
      { id: 'dm_glp1',   label: 'GLP-1RA',      examples: 'オゼンピック0.5mg/週 / リベルサス7mg' },
      { id: 'dm_dpp4',   label: 'DPP-4i',       examples: 'ジャヌビア50mg / トラゼンタ5mg (CKD)' },
      { id: 'dm_su',     label: 'SU (慎重)',     examples: 'アマリール0.5-3mg' },
      { id: 'dm_alphagi',label: 'α-GI',         examples: 'ボグリボース0.2-0.3mg' },
      { id: 'dm_insulin',label: 'インスリン',    examples: 'トレシーバ10U就寝前' },
    ],
  },
  {
    key: 'ckd', label: '慢性腎臓病 (CKD)', icd: 'N18',
    category: 'renal',
    boosterKey: null, // 個別 booster なし
    deepLink: null,
    scoreKind: 'kdigo_heatmap',
    drugClasses: [
      { id: 'ckd_arb',       label: 'ARB/ACEi',     examples: '糖尿病性腎症・蛋白尿で必須' },
      { id: 'ckd_sglt2',     label: 'SGLT2i',       examples: 'KDIGO 2024 強推奨 (DAPA-CKD/EMPA-KIDNEY)' },
      { id: 'ckd_finerenone',label: 'フィネレノン', examples: 'ケレンディア10-20mg/日 (DM併存)' },
      { id: 'ckd_loop',      label: 'ループ利尿薬', examples: 'フロセミド20-80mg' },
      { id: 'ckd_kbinder',   label: 'K吸着薬',      examples: 'ロケルマ / カリメート (K≥5.5)' },
      { id: 'ckd_pbinder',   label: 'リン吸着薬',   examples: '炭酸Ca / セベラマー (P≥5.0)' },
      { id: 'ckd_bicarb',    label: '重曹',         examples: '炭酸水素Na 1500-3000mg/日 (HCO3≤22)' },
      { id: 'ckd_hifphd',    label: 'HIF-PHD/ESA',  examples: 'ロキサデュスタット / ダルベポエチン (Hb<11)' },
    ],
  },
  {
    key: 'af', label: '心房細動', icd: 'I48',
    category: 'cardiovascular',
    boosterKey: null,
    deepLink: null,
    scoreKind: 'cha2ds2vasc_hasbled',
    drugClasses: [
      { id: 'af_doac_apix',  label: 'DOAC: アピキサバン', examples: 'エリキュース5mg×2 (高齢/低体重で2.5mg)' },
      { id: 'af_doac_riva',  label: 'DOAC: リバーロキサバン', examples: 'イグザレルト10-15mg/日' },
      { id: 'af_doac_edox',  label: 'DOAC: エドキサバン', examples: 'リクシアナ60mg/日 (eGFR 15-50で30mg)' },
      { id: 'af_doac_dabi',  label: 'DOAC: ダビガトラン', examples: 'プラザキサ110-150mg×2' },
      { id: 'af_warfarin',   label: 'ワルファリン (弁膜症)', examples: 'PT-INR 2-3 (高齢1.6-2.6)' },
      { id: 'af_bb',         label: 'β遮断薬 (レート制御)', examples: 'ビソプロロール2.5-5mg' },
      { id: 'af_cvb_nondhp', label: '非DHP系CCB',   examples: 'ベラパミル / ジルチアゼム (HFrEFには禁)' },
      { id: 'af_amio',       label: 'アミオダロン (リズム制御)', examples: '専門医併診' },
    ],
  },
  {
    key: 'hfref', label: '心不全 HFrEF (EF≤40%)', icd: 'I50',
    category: 'cardiovascular',
    boosterKey: null,
    deepLink: null,
    scoreKind: null,
    drugClasses: [
      { id: 'hf_arni',  label: 'ARNI',     examples: 'エンレスト100-200mg×2 (4本柱)' },
      { id: 'hf_bb',    label: 'β遮断薬',   examples: 'カルベジロール / ビソプロロール (4本柱)' },
      { id: 'hf_mra',   label: 'MRA',      examples: 'スピロノラクトン / エサキセレノン (4本柱)' },
      { id: 'hf_sglt2', label: 'SGLT2i',   examples: 'フォシーガ10mg / ジャディアンス10mg (4本柱)' },
      { id: 'hf_loop',  label: 'ループ利尿薬', examples: 'フロセミド20-80mg (うっ血対症)' },
      { id: 'hf_ivab',  label: 'イバブラジン', examples: 'コララン (HR≥75かつβ遮断max)' },
    ],
  },
  {
    key: 'hfpef', label: '心不全 HFpEF (EF>40%)', icd: 'I50',
    category: 'cardiovascular',
    boosterKey: null,
    deepLink: null,
    scoreKind: null,
    drugClasses: [
      { id: 'hfpef_sglt2', label: 'SGLT2i (第一選択)', examples: 'フォシーガ10mg / ジャディアンス10mg — EMPEROR-Preserved/DELIVER' },
      { id: 'hfpef_loop',  label: 'ループ利尿薬',     examples: 'うっ血症状緩和' },
      { id: 'hfpef_arb',   label: 'ARB/ACEi (HT併存)', examples: 'HFpEFで予後改善ェビデンス限定的' },
      { id: 'hfpef_mra',   label: 'MRA',              examples: 'TOPCAT試験で限定的だが個別考慮' },
    ],
  },
  {
    key: 'asthma', label: '気管支喘息', icd: 'J45',
    category: 'respiratory',
    boosterKey: 'asthma',
    deepLink: '/docs/002-Chronic-Treatment/j45-asthma-treatment',
    scoreKind: null,
    drugClasses: [
      { id: 'as_ics_laba_mart', label: 'ICS-LABA SMART (Track 1)', examples: 'シムビコート 1吸入×2+症状時' },
      { id: 'as_ics',           label: 'ICS単剤',                  examples: 'フルタイド100' },
      { id: 'as_lama',           label: 'LAMA (Step 4-5)',         examples: 'スピリーバ' },
      { id: 'as_triple',         label: 'Triple (Step 5)',         examples: 'テリルジー / エナジア' },
      { id: 'as_ltra',           label: 'LTRA',                    examples: 'モンテルカスト10mg夜' },
      { id: 'as_biologic',       label: '生物学的製剤 (Step 5)',    examples: 'ヌーカラ/ファセンラ/デュピクセント' },
      { id: 'as_saba',           label: 'SABA (頓用)',             examples: 'メプチン / サルタノール' },
      { id: 'as_ocs',            label: 'OCS (増悪burst)',         examples: 'プレドニン30mg×5日' },
    ],
  },
  {
    key: 'copd', label: 'COPD', icd: 'J44',
    category: 'respiratory',
    boosterKey: 'copd',
    deepLink: '/docs/002-Chronic-Treatment/j44-copd-treatment',
    scoreKind: 'gold_abe',
    drugClasses: [
      { id: 'copd_lama',       label: 'LAMA (Group A)',     examples: 'スピリーバ / シーブリ' },
      { id: 'copd_lama_laba',  label: 'LAMA/LABA (Group B)',examples: 'アノーロ / スピオルト / ウルティブロ' },
      { id: 'copd_triple',     label: 'Triple (Group E + eos≥300/ACO)', examples: 'テリルジー / ビレーズトリ' },
      { id: 'copd_ics_laba',   label: 'ICS/LABA (ACO限定)',  examples: 'シムビコート / レルベア' },
      { id: 'copd_saba',       label: 'SABA/SAMA (頓用)',    examples: 'サルタノール / アトロベント' },
      { id: 'copd_ocs',        label: 'OCS (増悪)',          examples: 'プレドニン30mg×5日' },
      { id: 'copd_macrolide',  label: 'マクロライド少量長期', examples: 'アジスロマイシン250mg×3/週 (頻回増悪)' },
    ],
  },
  {
    key: 'gout', label: '痛風・高尿酸血症', icd: 'M10',
    category: 'metabolic',
    boosterKey: 'gout',
    deepLink: '/docs/002-Chronic-Treatment/m10-gout-treatment',
    scoreKind: null,
    drugClasses: [
      { id: 'gout_allopurinol', label: 'アロプリノール',  examples: 'ザイロリック (eGFR別開始量)' },
      { id: 'gout_febuxostat',  label: 'フェブキソスタット', examples: 'フェブリク10-40mg' },
      { id: 'gout_topiroxostat',label: 'トピロキソスタット', examples: 'ウリアデック40-160mg' },
      { id: 'gout_benzbromarone',label: 'ベンズブロマロン', examples: 'ユリノーム25-50mg×2 (CKD G4-5禁忌)' },
      { id: 'gout_colchicine',  label: 'コルヒチン (急性/予防)', examples: '0.5mg/日 (CKD G4-5禁忌級)' },
      { id: 'gout_nsaid',       label: 'NSAID (急性発作)', examples: 'ナイキサン300mg×2×7日 (CKDで慎重)' },
      { id: 'gout_psl',         label: 'PSL (急性発作・NSAID不可時)', examples: 'プレドニン30mg×5日' },
    ],
  },
  {
    key: 'ascvd2', label: '動脈硬化 二次予防 (ASCVD)', icd: 'I25',
    category: 'cardiovascular',
    boosterKey: null,
    deepLink: null,
    scoreKind: null,
    drugClasses: [
      { id: 'asc_aspirin',      label: '抗血小板薬: アスピリン', examples: 'バイアスピリン100mg' },
      { id: 'asc_clopi',        label: '抗血小板薬: クロピドグレル', examples: 'プラビックス75mg (DAPT or 単独)' },
      { id: 'asc_statin_high',  label: 'スタチン高強度 (LDL<70)', examples: 'ロスバスタチン10-20mg / アトルバスタチン40-80mg' },
      { id: 'asc_eze',          label: 'エゼチミブ追加',       examples: 'スタチン+ゼチーア10mg' },
      { id: 'asc_pcsk9',        label: 'PCSK9阻害薬',          examples: 'スタチン最大量+ゼチーアでLDL未達時' },
      { id: 'asc_arb',          label: 'ARB/ACEi (心保護)',    examples: 'PCI後・MI後で適応' },
      { id: 'asc_bb',           label: 'β遮断薬 (心保護)',     examples: 'MI後・低EFで適応' },
    ],
  },
];

// 痛風 ULT 用閾値 (v0.1)
export const GOUT_ULT_THRESHOLDS = {
  start: {
    asymptomatic_no_comorbidity: 9.0,
    asymptomatic_with_comorbidity: 8.0,
    attack_history_or_tophus: 'always',
  },
  target: {
    tophus_present: 5.0,
    attack_history: 6.0,
    asymptomatic_with_comorbidity: 7.0,
    overcontrol_floor: 3.0,
  },
  allopurinol_starting: {
    eGFR_ge_60: '100mg/日',
    eGFR_30_59: '50mg/日',
    eGFR_lt_30: '50mg/日 隔日 (専門医併診)',
  },
  febuxostat_preferred: ['eGFR_lt_30', 'cm_hla_b5801_positive'],
  cares_warning: 'CV高リスク (MI/脳卒中既往) でアロプリノール優先 (CARES試験シグナル)',
};

// HFpEF SGLT2i 根拠
export const HFPEF_SGLT2_EVIDENCE = 'EMPEROR-Preserved (NEJM 2021) と DELIVER (NEJM 2022) で HFpEF の心不全入院・CV死を有意低下 (HR ~0.79)。EF >40% の HFpEF 全例で第一選択。DM 有無を問わず適応';

// 既存個別 booster の DRUGS を取得 (deep link で薬剤 pre-fill する時用)
export function getTreatmentBoosterDrugs(diseaseKey) {
  const meta = OVERVIEW_DISEASES.find((d) => d.key === diseaseKey);
  if (!meta?.boosterKey) return [];
  return TREATMENT_DATA[meta.boosterKey]?.data?.DRUGS || [];
}

// 全 booster の DRUGS を統合 (autocomplete用)
export function getAllTreatmentBoosterDrugs() {
  const all = [];
  for (const [boosterKey, entry] of Object.entries(TREATMENT_DATA)) {
    const drugs = entry?.data?.DRUGS || [];
    drugs.forEach((d) => {
      all.push({ ...d, boosterKey, displayLabel: `${d.label} [${entry.subtitle?.split('（')[0] || boosterKey}]` });
    });
  }
  return all;
}
