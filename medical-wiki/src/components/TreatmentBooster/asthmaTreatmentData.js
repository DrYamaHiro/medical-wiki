/**
 * Treatment Booster — 気管支喘息 治療修正データ
 * 喘息予防・管理ガイドライン2024 (JGL2024) + GINA 2024 準拠
 */

/* -------------------------------------------------------- */
/*  DRUGS (~30剤)                                          */
/* -------------------------------------------------------- */
export const DRUGS = [
  // ===== ICS 単剤 (6剤) =====
  { id: 'ics_flut_disc', label: 'フルチカゾンプロピオン酸（フルタイド100ディスカス）', class: 'ICS',
    potency: 'low-medium', device: 'DPI',
    doses: [
      { value: '100_bid', label: '100μg×2回/日（低用量）', isDefault: true },
      { value: '200_bid', label: '200μg×2回/日（中用量）' },
      { value: '500_bid', label: '500μg×2回/日（高用量）', isMax: true },
    ] },
  { id: 'ics_bud_turb', label: 'ブデソニド（パルミコート200タービュヘイラー）', class: 'ICS',
    potency: 'low-medium', device: 'DPI',
    doses: [
      { value: '200_bid', label: '200μg×2回/日（低用量）', isDefault: true },
      { value: '400_bid', label: '400μg×2回/日（中用量）' },
      { value: '800_bid', label: '800μg×2回/日（高用量）', isMax: true },
    ] },
  { id: 'ics_mom_twist', label: 'モメタゾン（アズマネックス100ツイストヘラー）', class: 'ICS',
    potency: 'low-medium', device: 'DPI',
    doses: [
      { value: '100_bid', label: '100μg×2回/日（低用量）', isDefault: true },
      { value: '200_bid', label: '200μg×2回/日（中用量）' },
      { value: '400_bid', label: '400μg×2回/日（高用量）', isMax: true },
    ] },
  { id: 'ics_cic_mdi', label: 'シクレソニド（オルベスコ100インヘラー）', class: 'ICS',
    potency: 'low-medium', device: 'pMDI',
    doses: [
      { value: '100_qd', label: '100μg×1回/日（低用量・プロドラッグ）', isDefault: true },
      { value: '200_qd', label: '200μg×1回/日（中用量）' },
      { value: '200_bid', label: '200μg×2回/日（高用量）', isMax: true },
    ] },
  { id: 'ics_bec_mdi', label: 'ベクロメタゾン（キュバール100エアゾール）', class: 'ICS',
    potency: 'low-medium', device: 'pMDI',
    doses: [
      { value: '100_bid', label: '100μg×2吸入×2回/日（低用量400）', isDefault: true },
      { value: '200_bid', label: '200μg×2吸入×2回/日（中用量800）' },
      { value: '400_bid', label: '400μg×2吸入×2回/日（高用量1600）', isMax: true },
    ] },
  { id: 'ics_ff_ell', label: 'フルチカゾンフランカルボン（アニュイティ100エリプタ）', class: 'ICS',
    potency: 'low-high', device: 'DPI',
    doses: [
      { value: '100_qd', label: '100μg×1回/日（低-中用量）', isDefault: true },
      { value: '200_qd', label: '200μg×1回/日（高用量）', isMax: true },
    ] },

  // ===== ICS/LABA 合剤 (5剤) =====
  { id: 'combo_symb', label: 'シムビコート タービュヘイラー 160/4.5', class: 'ICS/LABA',
    potency: 'low-medium', device: 'DPI', mart_capable: true,
    doses: [
      { value: '160_bid_1', label: '1吸入×2回/日（低用量）', isDefault: true },
      { value: '160_bid_2', label: '2吸入×2回/日（中用量）' },
      { value: '160_mart', label: 'MART: 1吸入×2回/日 + 発作時追加（合計≤12）' },
    ] },
  { id: 'combo_adoair', label: 'アドエア ディスカス 100/250/500', class: 'ICS/LABA',
    potency: 'low-high', device: 'DPI',
    doses: [
      { value: '100_bid', label: 'アドエア100 1吸入×2回/日（低用量）', isDefault: true },
      { value: '250_bid', label: 'アドエア250 1吸入×2回/日（中用量）' },
      { value: '500_bid', label: 'アドエア500 1吸入×2回/日（高用量）', isMax: true },
    ] },
  { id: 'combo_relvar', label: 'レルベア エリプタ 100/200', class: 'ICS/LABA',
    potency: 'medium-high', device: 'DPI',
    doses: [
      { value: '100_qd', label: 'レルベア100 1日1回1吸入（低-中用量）', isDefault: true },
      { value: '200_qd', label: 'レルベア200 1日1回1吸入（高用量）', isMax: true },
    ] },
  { id: 'combo_flutiform', label: 'フルティフォーム pMDI 50/125/250', class: 'ICS/LABA',
    potency: 'low-high', device: 'pMDI',
    doses: [
      { value: '50_bid_2', label: 'フルティフォーム50 2吸入×2回（低用量・小児可）', isDefault: true },
      { value: '125_bid_2', label: 'フルティフォーム125 2吸入×2回（中用量）' },
      { value: '250_bid_2', label: 'フルティフォーム250 2吸入×2回（高用量）', isMax: true },
    ] },
  { id: 'combo_atectura', label: 'アテキュラ ブリーズヘラー 150/80・160・320', class: 'ICS/LABA',
    potency: 'low-high', device: 'DPI',
    doses: [
      { value: '80_qd', label: 'アテキュラ低 1日1回（低用量）', isDefault: true },
      { value: '160_qd', label: 'アテキュラ中 1日1回（中用量）' },
      { value: '320_qd', label: 'アテキュラ高 1日1回（高用量）', isMax: true },
    ] },

  // ===== LAMA 単剤 =====
  { id: 'lama_tio_resp', label: 'チオトロピウム（スピリーバ レスピマット）2.5μg', class: 'LAMA',
    device: 'SMI',
    doses: [{ value: '2_qd', label: '2吸入×1回/日', isDefault: true, isMax: true }] },

  // ===== ICS/LABA/LAMA Triple (4剤) =====
  { id: 'triple_enerzair_M', label: 'エナジア ブリーズヘラー 中用量（150/50/80）',
    class: 'ICS/LABA/LAMA', potency: 'medium', device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入×1回/日', isDefault: true }] },
  { id: 'triple_enerzair_H', label: 'エナジア ブリーズヘラー 高用量（150/50/160）',
    class: 'ICS/LABA/LAMA', potency: 'high', device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入×1回/日', isDefault: true, isMax: true }] },
  { id: 'triple_trelegy_L', label: 'テリルジー エリプタ 100（25/62.5/100）',
    class: 'ICS/LABA/LAMA', potency: 'low-medium', device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入×1回/日', isDefault: true }] },
  { id: 'triple_trelegy_H', label: 'テリルジー エリプタ 200（25/62.5/200）',
    class: 'ICS/LABA/LAMA', potency: 'high', device: 'DPI',
    doses: [{ value: '1_qd', label: '1吸入×1回/日', isDefault: true, isMax: true }] },

  // ===== Biologics (Step 5, 5剤) =====
  { id: 'bio_omab', label: 'オマリズマブ（ゾレア）', class: '生物学的製剤',
    specialistOnly: true,
    doses: [{ value: 'sc_ige', label: '75-600mg SC 2-4週毎（IgE+体重で計算）', isDefault: true, isMax: true }] },
  { id: 'bio_mep', label: 'メポリズマブ（ヌーカラ）', class: '生物学的製剤',
    specialistOnly: true,
    doses: [{ value: '100_q4w', label: '100mg SC 4週毎', isDefault: true, isMax: true }] },
  { id: 'bio_ben', label: 'ベンラリズマブ（ファセンラ）', class: '生物学的製剤',
    specialistOnly: true,
    doses: [{ value: '30_q8w', label: '30mg SC 導入3回q4w → q8w', isDefault: true, isMax: true }] },
  { id: 'bio_dup', label: 'デュピルマブ（デュピクセント）', class: '生物学的製剤',
    specialistOnly: true,
    doses: [{ value: '300_q2w', label: '600mg初回→300mg SC 2週毎', isDefault: true, isMax: true }] },
  { id: 'bio_tez', label: 'テゼペルマブ（テゼスパイア）', class: '生物学的製剤',
    specialistOnly: true,
    doses: [{ value: '210_q4w', label: '210mg SC 4週毎', isDefault: true, isMax: true }] },

  // ===== SABA (リリーバー) =====
  { id: 'saba_salb', label: 'サルブタモール（サルタノール/ベネトリン）100μg', class: 'SABA',
    device: 'pMDI',
    doses: [{ value: '1_prn', label: '発作時1-2吸入（20分毎×3回まで、1日最大8）', isDefault: true }] },
  { id: 'saba_proca', label: 'プロカテロール（メプチンエアー）10μg', class: 'SABA',
    device: 'pMDI',
    doses: [{ value: '2_prn', label: '発作時1-2吸入（1日最大8吸入）', isDefault: true }] },

  // ===== LTRA (2剤) =====
  { id: 'ltra_mont', label: 'モンテルカスト（キプレス/シングレア）', class: 'LTRA',
    doses: [
      { value: '10_qd', label: '10mg×1回 就寝前（成人）', isDefault: true, isMax: true },
      { value: '5_qd_child', label: '5mgチュアブル×1回 就寝前（6-14歳）' },
      { value: '4_qd_child', label: '4mgチュアブル×1回 就寝前（1-5歳）' },
    ] },
  { id: 'ltra_pran', label: 'プランルカスト（オノン）', class: 'LTRA',
    doses: [{ value: '225_bid', label: '225mg×2回/日', isDefault: true, isMax: true }] },

  // ===== OCS (経口ステロイド) =====
  { id: 'ocs_pred', label: 'プレドニゾロン（プレドニン）', class: 'OCS',
    doses: [
      { value: '30_burst', label: '30mg/日×5-7日（burst・中等症）', isDefault: true },
      { value: '50_burst', label: '50mg/日×5-7日（重症）' },
      { value: '5_maint', label: '5mg/日（長期維持・最小）' },
      { value: '10_maint', label: '10mg/日（長期維持・依存）' },
    ] },

  // ===== Theophylline =====
  { id: 'theo_sr', label: 'テオフィリン徐放（テオドール/ユニフィル）', class: 'テオフィリン',
    doses: [
      { value: '200_bid', label: '200mg×2回/日', isDefault: true },
      { value: '400_bid', label: '400mg×2回/日', isMax: true },
    ] },

  // ===== 添加薬 =====
  { id: 'add_suplatast', label: 'スプラタスト（アイピーディ）', class: 'Th2サイトカイン阻害',
    doses: [{ value: '100_tid', label: '100mg×3回/日', isDefault: true, isMax: true }] },
];

/* -------------------------------------------------------- */
/*  MODIFIERS                                               */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // === 副作用 ===
  { id: 'se_oral_candidiasis', label: '口腔カンジダ症', cat: '副作用' },
  { id: 'se_dysphonia', label: '嗄声・発声障害', cat: '副作用' },
  { id: 'se_adrenal_suppression', label: '副腎抑制（高用量ICS+OCS）', cat: '副作用', severity: 'critical' },
  { id: 'se_cataract_glaucoma', label: '白内障・緑内障（長期高用量）', cat: '副作用' },
  { id: 'se_ocs_side_effects', label: '長期OCS副作用（骨粗鬆症/HPA軸/DM/白内障）', cat: '副作用', severity: 'critical' },
  { id: 'se_tachycardia_tremor', label: 'β刺激過量（頻脈・振戦）', cat: '副作用' },
  { id: 'se_ltra_neuropsych', label: 'LTRA精神症状（自殺念慮・悪夢・抑うつ、FDA black box）', cat: '副作用', severity: 'critical' },
  { id: 'se_theophylline_toxicity', label: 'テオフィリン中毒（嘔気/頻脈/痙攣）', cat: '副作用', severity: 'critical' },

  // === 併存疾患 — 一般 ===
  { id: 'cm_gerd', label: '胃食道逆流症 (GERD)', cat: '併存疾患' },
  { id: 'cm_gerd_nocturnal', label: '夜間GERD（咳・逆流感）', cat: '併存疾患' },
  { id: 'cm_allergic_rhinitis', label: 'アレルギー性鼻炎', cat: '併存疾患' },
  { id: 'cm_chronic_sinusitis', label: '慢性副鼻腔炎', cat: '併存疾患' },
  { id: 'cm_nasal_polyps', label: '鼻茸', cat: '併存疾患' },
  { id: 'cm_obesity_bmi30', label: '肥満 (BMI≥30)', cat: '併存疾患' },
  { id: 'cm_obesity_bmi35', label: '高度肥満 (BMI≥35)', cat: '併存疾患' },
  { id: 'cm_osas', label: '睡眠時無呼吸症候群 (SAS)', cat: '併存疾患' },
  { id: 'cm_osas_suspected', label: 'OSAS疑い（いびき・日中眠気）', cat: '併存疾患' },
  { id: 'cm_aco', label: 'ACO (asthma-COPD overlap)', cat: '併存疾患' },
  { id: 'cm_anxiety_depression', label: '不安・うつ併存', cat: '併存疾患' },
  { id: 'cm_abpa', label: 'ABPA（アレルギー性気管支肺アスペルギルス症）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_abpa_suspect', label: 'ABPA疑い（eos高・IgE高）', cat: '併存疾患' },
  { id: 'cm_atopy', label: 'アトピー性皮膚炎併存', cat: '併存疾患' },

  // === Phenotype (fortypes & biologic selection) ===
  { id: 'cm_eosinophilic_150', label: '好酸球 150-299/μL', cat: 'Phenotype' },
  { id: 'cm_eosinophilic_300', label: '好酸球 ≥300/μL', cat: 'Phenotype' },
  { id: 'cm_feno_high', label: 'FeNO ≥25 ppb', cat: 'Phenotype' },
  { id: 'cm_total_ige_high', label: '総IgE高値 + 通年感作', cat: 'Phenotype' },
  { id: 'cm_allergic_phenotype', label: 'アレルギー型（IgE+特異的IgE陽性）', cat: 'Phenotype' },
  { id: 'cm_type2_high', label: 'Type2-high（eos + FeNO高値）', cat: 'Phenotype' },
  { id: 'cm_type2_low', label: 'Type2-low（eos低 + FeNO低）', cat: 'Phenotype' },
  { id: 'cm_aerd', label: 'AERD（アスピリン喘息・N-ERD）', cat: 'Phenotype', severity: 'critical' },
  { id: 'cm_nsaid_intolerance', label: 'NSAID過敏', cat: 'Phenotype' },
  { id: 'cm_occupational', label: '職業性喘息', cat: 'Phenotype' },
  { id: 'cm_exercise_induced_only', label: '運動誘発のみ', cat: 'Phenotype' },
  { id: 'cm_severe_refractory', label: '重症難治性（Step 5でも未達）', cat: 'Phenotype', severity: 'critical' },

  // === 増悪・重症度 ===
  { id: 'cm_frequent_exacerbator', label: '頻回増悪（≥2回/年 全身ステロイド要）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_exacerbation_past_year_1', label: '過去1年に増悪 1回', cat: '併存疾患' },
  { id: 'cm_exacerbation_past_year_ge2', label: '過去1年に増悪 2回以上', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_icu_admission_hx', label: 'ICU入室歴（喘息）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_intubation_hx', label: '挿管歴（near-fatal asthma）', cat: 'Red Flag', severity: 'critical' },
  { id: 'cm_pef_variability_high', label: 'PEF日内変動 >20%', cat: '併存疾患' },
  { id: 'cm_persistent_obstruction', label: '持続性気流閉塞（吸入後 FEV1/FVC<70%）', cat: '併存疾患' },
  { id: 'cm_ocs_dependent', label: '慢性OCS使用中（週2回以上 or 定期）', cat: '併存疾患', severity: 'critical' },

  // === LAMA 禁忌・注意 ===
  { id: 'cm_narrow_angle_glaucoma', label: '狭隅角緑内障', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_bph_urinary_retention', label: 'BPH・排尿障害', cat: '併存疾患' },

  // === 活動性感染 ===
  { id: 'cm_active_tb', label: '活動性肺結核', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_active_fungal', label: '活動性真菌感染', cat: '併存疾患', severity: 'critical' },

  // === 制約 — 特殊集団 ===
  { id: 'co_pregnancy', label: '妊娠中（喘息管理）', cat: '制約', severity: 'critical' },
  { id: 'co_pregnancy_planning', label: '妊娠希望', cat: '制約' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_pediatric_5_11', label: '小児 5-11歳', cat: '制約' },
  { id: 'co_pediatric_lt5', label: '幼児 5歳未満', cat: '制約', severity: 'critical' },
  { id: 'co_elderly_65', label: '高齢者 (≥65歳)', cat: '制約' },
  { id: 'co_elderly_80', label: '超高齢者 (≥80歳)', cat: '制約' },
  { id: 'co_smoker_current', label: '現喫煙', cat: '制約' },
  { id: 'co_smoker_past', label: '過去喫煙（1年以内中止）', cat: '制約' },
  { id: 'co_seasonal_allergic', label: '季節性（花粉期等）', cat: '制約' },
  { id: 'co_occupational_trigger', label: '職業性抗原曝露', cat: '制約' },

  // === 制約 — デバイス/手技/アドヒアランス ===
  { id: 'co_poor_inhaler_technique', label: '吸入手技不良', cat: '制約', severity: 'critical' },
  { id: 'co_poor_adherence', label: 'アドヒアランス不良（処方の<70%）', cat: '制約', severity: 'critical' },
  { id: 'co_high_saba_user', label: 'SABA過使用（年≥3 canister or 月≥1 canister）', cat: '制約', severity: 'critical' },
  { id: 'co_saba_only_current', label: '現在SABA単独（維持ICSなし）', cat: '制約' },
  { id: 'co_dpi_insufficient_effort', label: 'DPI吸気力不足（<30 L/min）', cat: '制約' },
  { id: 'co_pmdi_coordination', label: 'pMDI協調困難', cat: '制約' },
  { id: 'co_multiple_devices', label: '複数デバイス併用（混乱リスク）', cat: '制約' },
  { id: 'co_cognitive_impairment', label: '認知機能低下（手技学習困難）', cat: '制約' },
  { id: 'co_hand_dexterity_poor', label: '手指機能低下（関節炎・麻痺）', cat: '制約' },
  { id: 'co_spacer_unavailable', label: 'スペーサー未使用/入手困難', cat: '制約' },
  { id: 'co_mart_compatible', label: 'MART療法適応可（アドヒアランス・手技OK）', cat: '制約' },
  { id: 'co_exercise_induced_reliever', label: '運動前 pre-medication 希望', cat: '制約' },

  // === 制約 — OCS/生物製剤関連 ===
  { id: 'co_ocs_burst_current', label: 'OCS burst中（発作直後）', cat: '制約' },
  { id: 'co_stable_3mo_on_step3plus', label: 'Step3以上で3ヶ月以上安定', cat: '制約' },
  { id: 'cm_cyp_interaction', label: 'CYP阻害薬併用（テオフィリン代謝影響）', cat: '併存疾患' },

  // === Track 状態 (UI 入力) ===
  { id: 'co_current_track1', label: '現在Track 1 (AIR/MART) 使用中', cat: '制約' },
  { id: 'co_current_track2', label: '現在Track 2 (conventional) 使用中', cat: '制約' },

  // === Red Flag (増悪重症度) ===
  { id: 'rf_exacerbation_mild', label: '軽度増悪（会話可、PEF>60%、SpO2>95%）', cat: 'Red Flag' },
  { id: 'rf_exacerbation_moderate', label: '中等度増悪（会話切れる、PEF 40-60%、SpO2 92-95%）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_exacerbation_severe', label: '重症増悪（会話不能、PEF<40%、SpO2<92%）', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_exacerbation_life_threatening', label: '生命危機（意識障害/silent chest/bradycardia）', cat: 'Red Flag', severity: 'critical' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC (JGL2024 + GINA 2024)                    */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '喘息コントロール評価（過去4週間）',
  inputs: [
    { id: 'act_score', label: 'ACTスコア', unit: '点', placeholder: '例:20 (0-25)' },
    { id: 'daytime_sx_per_week', label: '日中症状頻度', unit: '回/週', placeholder: '例:3' },
    { id: 'night_awake_per_month', label: '夜間覚醒', unit: '回/月', placeholder: '例:4' },
    { id: 'reliever_per_week', label: 'リリーバー使用頻度', unit: '回/週', placeholder: '例:3' },
    { id: 'activity_limitation', label: '活動制限（0=なし/1=あり）', unit: '0or1', placeholder: '0' },
    { id: 'exacerbation_past_year', label: '過去1年の増悪（OCS使用）', unit: '回', placeholder: '例:1' },
    { id: 'exacerbation_past_week', label: '過去1週の増悪（0=なし/1=あり）', unit: '0or1', placeholder: '0' },
    { id: 'pef_percent', label: 'PEF %pred', unit: '%', placeholder: '任意' },
    { id: 'pef_variability', label: 'PEF日内変動', unit: '%', placeholder: '任意' },
  ],
  note: 'JGL2024/GINA2024 4段階判定。ACT/4基準の厳しい側を採用。重症度（mild/moderate/severe）は現在の治療ステップから別途導出',
  deriveStatus: (v, modifiers = []) => {
    const has = (m) => modifiers.includes(m);
    const num = (x) => (x === '' || x == null || x === undefined ? null : Number(x));

    const act = num(v.act_score);
    const day = num(v.daytime_sx_per_week);
    const night = num(v.night_awake_per_month);
    const reliever = num(v.reliever_per_week);
    const actLim = num(v.activity_limitation);
    const exacWk = num(v.exacerbation_past_week) ?? 0;
    const pef = num(v.pef_percent);
    const pefVar = num(v.pef_variability);

    // 何も入力なし
    if (act === null && day === null && night === null && reliever === null && actLim === null) {
      return null;
    }

    // GINA 4-criteria count
    let failed = 0;
    if (day !== null && day >= 2) failed++;
    if (night !== null && night >= 1) failed++;
    if (reliever !== null && reliever >= 2) failed++;
    if (actLim === 1) failed++;

    // Red flag → uncontrolled
    const redFlag =
      exacWk === 1 ||
      (act !== null && act < 16) ||
      failed >= 3 ||
      (pef !== null && pef < 60) ||
      (pefVar !== null && pefVar > 30) ||
      has('cm_icu_admission_hx') ||
      has('cm_intubation_hx') ||
      has('rf_exacerbation_moderate') ||
      has('rf_exacerbation_severe') ||
      has('rf_exacerbation_life_threatening');
    if (redFlag) return 'uncontrolled';

    const minimalSx = failed === 0 && (act === null || act >= 23);
    const overCtrl =
      has('co_stable_3mo_on_step3plus') &&
      minimalSx &&
      (has('se_oral_candidiasis') || has('se_dysphonia') || has('se_ocs_side_effects'));
    if (overCtrl) return 'overcontrolled';

    const wellByCount = failed === 0;
    const wellByAct = act !== null && act >= 20;
    const partlyByAct = act !== null && act >= 16 && act < 20;

    if (wellByCount && (act === null || wellByAct)) return 'controlled';
    if ((failed >= 1 && failed <= 2) || partlyByAct) return 'near_target';
    return 'controlled';
  },
};

/* -------------------------------------------------------- */
/*  MAINTAIN_BLOCKERS                                       */
/* -------------------------------------------------------- */
export const MAINTAIN_BLOCKERS = [
  'rf_exacerbation_mild',
  'rf_exacerbation_moderate',
  'rf_exacerbation_severe',
  'rf_exacerbation_life_threatening',
  'cm_frequent_exacerbator',
  'cm_exacerbation_past_year_ge2',
  'cm_icu_admission_hx',
  'cm_intubation_hx',
  'co_high_saba_user',
  'co_saba_only_current',
  'co_poor_inhaler_technique',
  'se_oral_candidiasis',
  'se_ocs_side_effects',
  'se_ltra_neuropsych',
  'cm_ocs_dependent',
  'co_pregnancy',
  'cm_active_tb',
  'cm_active_fungal',
  'cm_abpa',
];

/* -------------------------------------------------------- */
/*  DISEASE-SPECIFIC HELPERS                                */
/* -------------------------------------------------------- */
export function formatAppliedTarget(/* modifiers */) {
  return 'Well-controlled（日中症状<2/週・夜間覚醒なし・活動制限なし・リリーバー<2/週・増悪なし、ACT≥20）';
}

export function suggestAgeNudge(/* values, modifiers */) {
  return false;
}

export function autoFlagLabel(f) {
  return (
    {
      cm_frequent_exacerbator: '頻回増悪（≥2回/年）自動検出',
      co_high_saba_user: 'SABA過使用自動検出',
    }[f] || f
  );
}

export function computeAutoFlags(metricValues, modifiers, currentDrugs, allDrugs) {
  const flags = [];
  const exac = metricValues.exacerbation_past_year;
  if (exac !== undefined && exac >= 2) {
    flags.push('cm_exacerbation_past_year_ge2');
    flags.push('cm_frequent_exacerbator');
  } else if (exac !== undefined && exac === 1) {
    flags.push('cm_exacerbation_past_year_1');
  }
  const reliever = metricValues.reliever_per_week;
  if (reliever !== undefined && reliever >= 2) {
    flags.push('cm_reliever_dependent');
  }
  // SABA単独使用の自動検出
  if (currentDrugs && currentDrugs.length > 0 && allDrugs) {
    const classes = new Set();
    currentDrugs.forEach((entry) => {
      const id = typeof entry === 'string' ? entry : entry.id;
      const drug = allDrugs.find((d) => d.id === id);
      if (drug) classes.add(drug.class);
    });
    const hasSABA = classes.has('SABA');
    const hasController = ['ICS', 'ICS/LABA', 'ICS/LABA/LAMA', 'LTRA'].some((c) => classes.has(c));
    if (hasSABA && !hasController && !modifiers.includes('co_saba_only_current')) {
      flags.push('co_saba_only_current');
    }
  }
  return flags;
}

export function computeInfoAlerts(metricValues, modifiers) {
  const alerts = [];
  const mods = modifiers || [];
  const act = metricValues.act_score;
  const exac = metricValues.exacerbation_past_year;
  const reliever = metricValues.reliever_per_week;

  if (act !== undefined && act < 16) {
    alerts.push({
      type: 'act_very_poor',
      label: 'ACT<16: コントロール極めて不良',
      detail: '即座のstep up + 吸入手技・アドヒアランス確認。増悪リスク高い、頻回follow up',
    });
  } else if (act !== undefined && act >= 16 && act < 20) {
    alerts.push({
      type: 'act_suboptimal',
      label: 'ACT 16-19: 部分的コントロール',
      detail: 'step up 前に手技・アドヒアランス・併存症（GERD・鼻炎・肥満・OSAS）確認',
    });
  }
  if (exac !== undefined && exac >= 2) {
    alerts.push({
      type: 'frequent_exacerbator',
      label: '⚠ 頻回増悪（≥2回/年）',
      detail: '生物学的製剤検討の対象。type2 炎症マーカー（eos・FeNO・IgE）測定し専門医紹介',
    });
  }
  if (reliever !== undefined && reliever >= 2) {
    alerts.push({
      type: 'reliever_overuse',
      label: 'リリーバー頻用（≥2回/週）',
      detail: 'コントロール不良指標。SABA依存なら即AIR/MART移行 + ICS強化検討',
    });
  }
  if (mods.includes('co_pregnancy')) {
    alerts.push({
      type: 'pregnancy',
      label: '妊娠中：ICS継続が最優先',
      detail: 'コントロール不良のほうが母児リスク高い。ブデソニドエビデンス最多。増悪時はOCS躊躇なく使用',
    });
  }
  if (mods.includes('cm_aerd')) {
    alerts.push({
      type: 'aerd_warning',
      label: '⚠ AERD: NSAID全般回避',
      detail: 'アセトアミノフェン使用可（1回 ≤500mg 推奨）。COX-2 は個別判断。お薬手帳・電カル赤フラグ',
    });
  }
  return alerts;
}

export function computeConnectedAlerts({ currentClasses, modifiers, currentDrugs /*, allDrugs */ }) {
  const alerts = [];
  const mods = modifiers || [];
  const hasICS = currentClasses.has('ICS') || currentClasses.has('ICS/LABA') || currentClasses.has('ICS/LABA/LAMA');
  const hasLABA = currentClasses.has('LABA') || currentClasses.has('ICS/LABA') || currentClasses.has('ICS/LABA/LAMA');
  const hasLAMA = currentClasses.has('LAMA') || currentClasses.has('ICS/LABA/LAMA');
  const hasSABA = currentClasses.has('SABA');
  const hasLTRA = currentClasses.has('LTRA');
  const hasOCS = currentClasses.has('OCS');
  const hasBiologic = currentClasses.has('生物学的製剤');

  // SABA単独 → 死亡リスク警告
  if (hasSABA && !hasICS) {
    alerts.push({
      type: 'saba_only_mortality',
      label: '⚠ SABA単独治療: 喘息死リスク',
      detail: 'GINA 2024: SABA単独は非推奨。ICS-formoterol AIR療法 or 低用量ICS + SABA頓用へ即移行',
      severity: 'critical',
    });
  }

  // SABA過使用
  if (mods.includes('co_high_saba_user')) {
    alerts.push({
      type: 'saba_overuse_death',
      label: '⚠ SABA過使用（≥3 canisters/年）',
      detail: '喘息死の独立リスク因子。AIR/MART移行必須、ICS強化、受診頻度up',
      severity: 'critical',
    });
  }

  // 吸入手技・アドヒアランス未確認でstep up警告
  if ((mods.includes('co_poor_inhaler_technique') || mods.includes('co_poor_adherence')) &&
      (mods.includes('rf_exacerbation_moderate') || mods.includes('cm_frequent_exacerbator'))) {
    alerts.push({
      type: 'check_before_stepup',
      label: 'Step up 前に手技・アドヒアランス確認',
      detail: '見かけ上 uncontrolled の 50-70% は手技・アドヒアランス不良が原因。確認してから step up',
    });
  }

  // LAMA + 狭隅角緑内障
  if (hasLAMA && mods.includes('cm_narrow_angle_glaucoma')) {
    alerts.push({
      type: 'lama_glaucoma',
      label: '⚠ LAMA + 狭隅角緑内障: 禁忌',
      detail: '抗コリン作用で眼圧上昇。LAMA中止、LTRA/Biologic で代替',
      severity: 'critical',
    });
  }

  // LAMA + BPH
  if (hasLAMA && mods.includes('cm_bph_urinary_retention')) {
    alerts.push({
      type: 'lama_bph',
      label: 'LAMA + BPH/排尿障害: 慎重',
      detail: '尿閉リスク。泌尿器科と相談、症状出現時は中止',
    });
  }

  // ACE阻害薬なし、GERD + 喘息
  if (hasICS && mods.includes('cm_gerd') && !mods.includes('cm_gerd_nocturnal')) {
    alerts.push({
      type: 'gerd_asthma',
      label: 'GERD併存: 治療で喘息改善可能',
      detail: 'PPI 8-12週 + 生活指導（食後3h臥位禁止、就寝前食事禁止）。夜間咳優位なら優先介入',
    });
  }

  // One airway (鼻炎+喘息、鼻ステロイド未処方)
  if (mods.includes('cm_allergic_rhinitis') && !mods.includes('co_nasal_steroid_used')) {
    alerts.push({
      type: 'one_airway',
      label: 'アレルギー性鼻炎併存: 鼻ステロイド追加',
      detail: 'フルチカゾン点鼻 1日2回。鼻治療で喘息1段階下げられるケースあり',
    });
  }

  // Samter triad
  if (mods.includes('cm_aerd') && mods.includes('cm_nasal_polyps')) {
    alerts.push({
      type: 'samter_triad',
      label: '⚠ Samter triad（AERD + 鼻茸）',
      detail: '重症 eosinophilic phenotype。dupilumab 最適応（鼻茸併存で強い）、NSAID完全回避',
      severity: 'critical',
    });
  }

  // CPAP benefit
  if (mods.includes('cm_osas') && (mods.includes('cm_frequent_exacerbator') || mods.includes('cm_exacerbation_past_year_ge2'))) {
    alerts.push({
      type: 'osas_asthma',
      label: 'OSAS + 喘息未達: CPAPで改善可能',
      detail: 'CPAPアドヒアランス確認/導入で夜間喘息改善エビデンスあり',
    });
  }

  // 現喫煙警告
  if (mods.includes('co_smoker_current')) {
    alerts.push({
      type: 'smoker_ics_resistance',
      label: '⚠ 現喫煙: ICS効果減弱',
      detail: '禁煙が最優先。バレニクリン・ニコチンパッチ。ICS効果回復まで6-12ヶ月',
      severity: 'critical',
    });
  }

  // ABPA疑い
  if (mods.includes('cm_abpa_suspect') || mods.includes('cm_abpa')) {
    alerts.push({
      type: 'abpa_referral',
      label: 'ABPA疑い/診断: 呼吸器専門医紹介',
      detail: 'アスペルギルス特異的IgE・沈降抗体・総IgE・胸部CT。抗真菌薬+ステロイド管理',
      severity: mods.includes('cm_abpa') ? 'critical' : undefined,
    });
  }

  // OCS依存 → Biologics候補
  if (mods.includes('cm_ocs_dependent') && !hasBiologic) {
    alerts.push({
      type: 'ocs_dependent_biologic',
      label: '⚠ OCS依存: 生物学的製剤検討',
      detail: 'dupilumab/benralizumab で OCS離脱エビデンス強。専門医紹介 + type2 mark 測定',
      severity: 'critical',
    });
  }

  // テオフィリン + CYP阻害薬
  if (currentClasses.has('テオフィリン') && mods.includes('cm_cyp_interaction')) {
    alerts.push({
      type: 'theo_cyp',
      label: 'テオフィリン + CYP阻害薬',
      detail: 'シメチジン/キノロン/マクロライドで血中濃度↑。減量 or 中止、血中濃度測定（5-15μg/mL目標）',
    });
  }

  // 妊娠 + 喘息
  if (mods.includes('co_pregnancy')) {
    alerts.push({
      type: 'pregnancy_asthma',
      label: '妊娠 + 喘息',
      detail: 'ICS継続（ブデソニド優先）。OCS必要時使用可（胎盤通過少）。コントロール不良のほうが母児リスク高い',
    });
  }

  // 小児 5歳未満
  if (mods.includes('co_pediatric_lt5')) {
    alerts.push({
      type: 'pediatric_lt5',
      label: '⚠ 5歳未満: 小児科紹介',
      detail: '診断・用量・デバイスすべて専門管理。スペーサー+マスク必須',
      severity: 'critical',
    });
  }

  return alerts;
}

export function isHighRiskForWatch(modifiers) {
  return [
    'cm_frequent_exacerbator',
    'cm_exacerbation_past_year_ge2',
    'cm_icu_admission_hx',
    'cm_intubation_hx',
    'cm_ocs_dependent',
    'co_high_saba_user',
    'cm_severe_refractory',
    'rf_exacerbation_moderate',
    'rf_exacerbation_severe',
    'rf_exacerbation_life_threatening',
  ].some((m) => modifiers.includes(m));
}

export function getCurrentClasses(currentDrugs, allDrugs) {
  const classes = new Set();
  currentDrugs.forEach((entry) => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
    // 合剤展開
    if (drug?.class === 'ICS/LABA') {
      classes.add('ICS');
      classes.add('LABA');
    }
    if (drug?.class === 'ICS/LABA/LAMA') {
      classes.add('ICS');
      classes.add('LABA');
      classes.add('LAMA');
    }
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
  const hasHighDose = modifiers.includes('se_oral_candidiasis') || modifiers.includes('se_dysphonia');
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（Well-controlled）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '非薬物療法継続（トリガー回避、禁煙、ワクチン）',
    reason:
      'ACT≥20、症状 <2回/週、夜間覚醒なし、活動制限なし、増悪なし。現行治療を維持し、3ヶ月後に再評価',
    reassess: hasHighDose
      ? '3ヶ月後 ACT・吸入手技・副作用（カンジダ・嗄声）確認、3ヶ月安定後にstep down検討'
      : '3ヶ月後 ACT・PEF・吸入手技・アドヒアランス確認',
    note: '維持期でも吸入手技は3-6ヶ月毎に teach-back で確認。トリガー（花粉・ウイルス感染）対策と年1回インフル・肺炎球菌ワクチン',
  };
}

export function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '経過観察 + 手技/アドヒアランス/併存症確認',
    example: drugLabels
      ? `現行処方: ${drugLabels}。吸入手技 teach-back、アドヒアランス問診、GERD/鼻炎/肥満/OSAS/喫煙 の確認`
      : '吸入指導、トリガー回避、生活指導',
    reason:
      'コントロール部分的。step up の前に「手技・アドヒアランス・併存症」の3確認が GINA 2024 推奨。見かけ上uncontrolledの 50-70% はこの3要素',
    reassess: '2-4週後に ACT・PEF・症状頻度・手技再評価。改善なければ step up',
    note: '頻回増悪・ICU歴ありの超高リスクでは即 step up も検討',
  };
}

export function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers = []) {
  const avoidMap = {
    ics_flut_disc: ['se_oral_candidiasis', 'se_dysphonia', 'co_dpi_insufficient_effort'],
    ics_bud_turb: ['se_oral_candidiasis', 'co_dpi_insufficient_effort'],
    ics_mom_twist: ['se_oral_candidiasis', 'co_dpi_insufficient_effort'],
    ics_cic_mdi: ['co_pmdi_coordination'],
    ics_bec_mdi: ['se_oral_candidiasis', 'co_pmdi_coordination'],
    ics_ff_ell: ['se_oral_candidiasis', 'co_dpi_insufficient_effort'],
    combo_symb: ['se_oral_candidiasis', 'se_tachycardia_tremor', 'co_dpi_insufficient_effort'],
    combo_adoair: ['se_oral_candidiasis', 'se_tachycardia_tremor', 'co_dpi_insufficient_effort'],
    combo_relvar: ['se_oral_candidiasis', 'se_tachycardia_tremor', 'co_dpi_insufficient_effort'],
    combo_flutiform: ['se_oral_candidiasis', 'se_tachycardia_tremor', 'co_pmdi_coordination'],
    combo_atectura: ['se_oral_candidiasis', 'se_tachycardia_tremor'],
    lama_tio_resp: ['cm_bph_urinary_retention'],
    triple_enerzair_M: ['se_oral_candidiasis', 'cm_bph_urinary_retention'],
    triple_enerzair_H: ['se_oral_candidiasis', 'cm_bph_urinary_retention'],
    triple_trelegy_L: ['se_oral_candidiasis', 'cm_bph_urinary_retention'],
    triple_trelegy_H: ['se_oral_candidiasis', 'cm_bph_urinary_retention'],
    ocs_pred: ['se_ocs_side_effects'],
    theo_sr: ['se_theophylline_toxicity', 'cm_cyp_interaction'],
    ltra_mont: ['se_ltra_neuropsych'],
  };
  const forbiddenMap = {
    ics_flut_disc: ['cm_active_tb', 'cm_active_fungal'],
    ics_bud_turb: ['cm_active_tb', 'cm_active_fungal'],
    ics_mom_twist: ['cm_active_tb', 'cm_active_fungal'],
    ics_cic_mdi: ['cm_active_tb', 'cm_active_fungal'],
    ics_bec_mdi: ['cm_active_tb', 'cm_active_fungal'],
    ics_ff_ell: ['cm_active_tb', 'cm_active_fungal'],
    lama_tio_resp: ['cm_narrow_angle_glaucoma'],
    triple_enerzair_M: ['cm_narrow_angle_glaucoma'],
    triple_enerzair_H: ['cm_narrow_angle_glaucoma'],
    triple_trelegy_L: ['cm_narrow_angle_glaucoma'],
    triple_trelegy_H: ['cm_narrow_angle_glaucoma'],
    ltra_mont: ['se_ltra_neuropsych'],
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
      '現用量で目標未達。同一薬剤の増量は新薬追加よりアドヒアランス・コストの面で優先。吸入手技・アドヒアランスは必ず先に確認',
    avoidWhen: avoidMap[drug.id] || [],
    forbidden: forbiddenMap[drug.id] || [],
    reassess: '4-8週後に ACT・PEF・副作用（カンジダ・嗄声・頻脈）確認',
    _isDoseUp: true,
    _drugClass: drug.class,
  }));
}

/* -------------------------------------------------------- */
/*  RECOMMENDATIONS                                         */
/* -------------------------------------------------------- */
export const RECOMMENDATIONS = [
  // ===== A) NAIVE / Step 1-2 =====
  {
    id: 'naive_lifestyle_trigger_avoidance',
    action: 'WATCH',
    drug: 'トリガー回避・禁煙・ワクチン',
    example: '禁煙、花粉・ダニ対策、インフル/肺炎球菌ワクチン、職業抗原回避',
    reason: '軽症・間欠型では生活指導のみで管理可能。薬物療法前にトリガー同定と回避',
    fromStates: ['naive'],
    forbidden: ['rf_exacerbation_moderate', 'rf_exacerbation_severe', 'cm_frequent_exacerbator', 'cm_icu_admission_hx'],
  },
  {
    id: 'start_air_step1_track1',
    action: 'STEP_UP',
    drug: 'Track 1 (GINA preferred): 頓用 ICS-ホルモテロール',
    example: 'シムビコート タービュヘイラー 発作時1吸入（必要時）',
    reason: 'GINA 2024: SABA単独は非推奨。軽症・間欠型でも ICS含む頓用で増悪・喘息死を抑制',
    fromStates: ['naive'],
    drugClass: 'ICS/LABA',
    preferredWhen: ['co_mart_compatible'],
    forbidden: ['co_pregnancy', 'cm_active_tb', 'cm_active_fungal'],
    reassess: '4週後に ACT・吸入手技・症状頻度',
    note: 'Track 1 優先。SABA canister 過使用予防にも有効',
  },
  {
    id: 'start_ics_low_track2',
    action: 'STEP_UP',
    drug: 'Track 2: 低用量ICS定期 + SABA頓用',
    example: 'フルタイド100 1吸入×2回/日 + サルタノール頓用',
    reason: 'Track 2 (conventional)。MART不可 or 患者希望時の代替',
    fromStates: ['naive'],
    drugClass: 'ICS',
    forbidden: ['co_pregnancy', 'cm_active_tb', 'cm_active_fungal'],
    note: 'Track 1 のほうが GINA 2024 preferred',
  },
  {
    id: 'start_ltra_allergic_rhinitis',
    action: 'STEP_UP',
    drug: 'LTRA（モンテルカスト）開始（アレルギー性鼻炎併存）',
    example: 'キプレス 10mg 就寝前（鼻炎・喘息同時管理）',
    reason: '軽症喘息 + 鼻炎併存で有用。吸入器使用困難例にも',
    fromStates: ['naive', 'mono'],
    drugClass: 'LTRA',
    preferredWhen: ['cm_allergic_rhinitis', 'co_exercise_induced_reliever'],
    avoidWhen: ['se_ltra_neuropsych'],
    note: 'FDA black box: 神経精神症状（自殺念慮・悪夢）。子供・精神疾患患者で注意',
  },
  {
    id: 'refer_pediatric_lt5',
    action: 'REFER',
    drug: '小児科専門医紹介（5歳未満）',
    reason: '5歳未満の喘息診断・治療は小児科専門。スペーサー + マスク必須',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    urgentWhen: ['co_pediatric_lt5'],
    preferredWhen: ['co_pediatric_lt5'],
  },

  // ===== B) Step 2-3 (mono → dual) =====
  {
    id: 'start_mart_step3',
    action: 'STEP_UP',
    drug: 'Step 3 MART（ICS-ホルモテロール 定期+頓用）',
    example: 'シムビコート 1吸入×2回/日 + 発作時頓用（合計≤12）',
    reason: 'Track 1 Step 3 推奨。増悪抑制エビデンス強（SYGMA/Novel START）',
    fromStates: ['mono'],
    drugClass: 'ICS/LABA',
    preferredWhen: ['co_mart_compatible'],
    forbidden: ['co_pregnancy', 'cm_active_tb', 'cm_active_fungal'],
  },
  {
    id: 'start_ics_laba_track2_step3',
    action: 'STEP_UP',
    drug: 'Track 2 Step 3: 通常 ICS/LABA + SABA',
    example: 'アドエア100 1吸入×2回 or レルベア100 1日1回',
    reason: 'MART不可 or 患者希望時の代替',
    fromStates: ['mono'],
    drugClass: 'ICS/LABA',
    forbidden: ['co_pregnancy', 'cm_active_tb', 'cm_active_fungal'],
  },
  {
    id: 'mono_add_ltra',
    action: 'ADD',
    drug: 'LTRA追加（アレルギー性鼻炎/運動誘発/AERD）',
    example: '現行ICS継続 + キプレス10mg 就寝前',
    reason: 'Step up の代替 or 併存症対応',
    fromStates: ['mono'],
    drugClass: 'LTRA',
    preferredWhen: ['cm_allergic_rhinitis', 'cm_exercise_induced_only', 'cm_aerd'],
    avoidWhen: ['se_ltra_neuropsych'],
  },
  {
    id: 'switch_to_mart_from_track2',
    action: 'SWITCH',
    drug: 'Track 2 → Track 1 (MART) へ切替',
    example: 'アドエア中止 → シムビコート MART',
    reason: '頻回増悪例で Track 1 のほうが増悪抑制効果強い',
    fromStates: ['dual'],
    preferredWhen: ['cm_frequent_exacerbator', 'cm_exacerbation_past_year_ge2'],
    targetClass: 'ICS/LABA',
    forbidden: ['co_pregnancy'],
  },
  {
    id: 'stepup_ics_low_to_medium',
    action: 'DOSE_UP',
    drug: '低用量ICS → 中用量（単一製剤内で）',
    example: 'フルタイド100×2回 → 200×2回',
    reason: '手技・アドヒアランス確認後のstep up',
    fromStates: ['mono', 'dual'],
    drugClass: 'ICS',
  },
  {
    id: 'stepup_to_mart_step4',
    action: 'STEP_UP',
    drug: 'Step 4 MART 強化（中用量）',
    example: 'シムビコート 2吸入×2回 + 発作時頓用',
    reason: 'Step 3で未達 → 中用量へ',
    fromStates: ['dual'],
    drugClass: 'ICS/LABA',
  },

  // ===== C) Step 4-5 (dual → triple) =====
  {
    id: 'add_lama_step4_to_5',
    action: 'ADD',
    drug: 'LAMA追加（Step 4→5）',
    example: '現行ICS/LABA継続 + スピリーバ レスピマット 2吸入×1回/日',
    reason: 'ICS/LABA中-高用量で未達。チオトロピウム追加で増悪抑制（IRIDIUM/TRIGGER）',
    fromStates: ['dual'],
    drugClass: 'LAMA',
    preferredWhen: ['cm_frequent_exacerbator', 'cm_persistent_obstruction', 'cm_aco'],
    forbidden: ['cm_narrow_angle_glaucoma'],
    avoidWhen: ['cm_bph_urinary_retention'],
  },
  {
    id: 'switch_to_triple_single_inhaler',
    action: 'SWITCH',
    drug: '2剤 → 単一吸入3剤へ切替',
    example: 'ICS/LABA + LAMA 別々 → エナジア or テリルジー 1日1回',
    reason: 'デバイス統一でアドヒアランス向上（CAPTAIN試験）',
    fromStates: ['triple'],
    targetClass: 'ICS/LABA/LAMA',
    preferredWhen: ['co_poor_adherence', 'co_multiple_devices'],
    forbidden: ['cm_narrow_angle_glaucoma'],
  },
  {
    id: 'stepup_triple_medium_to_high',
    action: 'DOSE_UP',
    drug: 'Triple 中用量 → 高用量',
    example: 'エナジア中 → エナジア高 / テリルジー100 → 200',
    reason: 'ICS成分増量で抗炎症強化',
    fromStates: ['triple'],
    drugClass: 'ICS/LABA/LAMA',
  },
  {
    id: 'consider_biologic_step5',
    action: 'REFER',
    drug: '生物学的製剤検討・専門医紹介',
    reason: '高用量triple + 未達 → 重症持続型。phenotype評価 + biologics導入',
    fromStates: ['triple', 'quad_plus'],
    urgentWhen: ['cm_severe_refractory'],
    preferredWhen: ['cm_frequent_exacerbator', 'cm_ocs_dependent', 'cm_exacerbation_past_year_ge2'],
    specialistGate: true,
    note: 'Baseline: eos・FeNO・総IgE・特異的IgE測定してから紹介',
  },
  {
    id: 'refer_respiratory_specialist',
    action: 'REFER',
    drug: '呼吸器専門医紹介（重症喘息評価）',
    reason: '高用量triple未達、頻回増悪、OCS依存',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_frequent_exacerbator', 'cm_ocs_dependent'],
    specialistGate: true,
  },

  // ===== D) Biologic recommendations (informational, specialist gate) =====
  {
    id: 'prefer_omalizumab_allergic',
    action: 'REFER',
    drug: 'オマリズマブ候補（アレルギー型）',
    reason: '通年性アレルゲン感作 + 総IgE高値で第一選択',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_total_ige_high', 'cm_allergic_phenotype'],
    specialistGate: true,
  },
  {
    id: 'prefer_mepolizumab_eosinophilic',
    action: 'REFER',
    drug: 'メポリズマブ or ベンラリズマブ候補（好酸球性）',
    reason: '末梢血eos ≥150で適応',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_eosinophilic_300', 'cm_eosinophilic_150'],
    specialistGate: true,
  },
  {
    id: 'prefer_dupilumab_atopy',
    action: 'REFER',
    drug: 'デュピルマブ候補（アトピー併存・鼻茸・OCS依存）',
    reason: 'Type2 炎症 + アトピー/鼻茸で最適。OCS減量エビデンス強',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_atopy', 'cm_nasal_polyps', 'cm_ocs_dependent', 'cm_feno_high'],
    specialistGate: true,
  },
  {
    id: 'prefer_tezepelumab_mixed',
    action: 'REFER',
    drug: 'テゼペルマブ候補（phenotype混合・T2-low）',
    reason: 'Phenotype不問、T2-lowでも有効な唯一のbiologic',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_type2_low', 'cm_severe_refractory'],
    specialistGate: true,
  },
  {
    id: 'screen_type2_inflammation',
    action: 'WATCH',
    drug: 'Baseline type2 炎症マーカー測定',
    example: '末梢血好酸球数・FeNO・総IgE・特異的IgE（ダニ・ハウスダスト・動物・カビ）',
    reason: '生物学的製剤選択の意思決定材料。紹介前にGP側で実施可能',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_frequent_exacerbator', 'cm_ocs_dependent', 'cm_severe_refractory'],
  },

  // ===== E) Reliever strategy =====
  {
    id: 'reliever_switch_saba_to_air',
    action: 'SWITCH',
    drug: 'SABA → ICS-ホルモテロール頓用（AIR）',
    example: 'サルタノール中止 → シムビコート頓用',
    reason: 'GINA Track 1。SABA単独は喘息死リスク増',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_high_saba_user', 'co_saba_only_current', 'cm_frequent_exacerbator'],
  },
  {
    id: 'reliever_review_saba_overuse',
    action: 'WATCH',
    drug: '⚠ SABA過使用レビュー',
    reason: '年≥3本 or 月≥1本はコントロール不良+死亡リスク',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['co_high_saba_user'],
    note: 'AIR移行 + ICS強化を検討。手技・アドヒアランス確認',
  },
  {
    id: 'reliever_emergency_saba_burst',
    action: 'WATCH',
    drug: '増悪時SABA連用ガイド',
    example: 'サルタノール 4吸入を20分毎×3回（1時間で12吸入）。改善なしで受診',
    reason: 'Yellow zone（PEF 60-80%）時の自己対応',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
  },

  // ===== F) Exacerbation =====
  {
    id: 'exacerbation_mild_saba_burst',
    action: 'ADD',
    drug: '軽度増悪: SABA連用 + ICS倍量',
    example: 'サルタノール 4吸入×20分毎×3回 + ICS用量2-4倍×1-2週',
    reason: '軽度（会話可、PEF>60%）は自宅対応可',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['rf_exacerbation_mild'],
  },
  {
    id: 'exacerbation_moderate_ocs_burst',
    action: 'ADD',
    drug: '中等度増悪: OCS burst開始',
    example: 'プレドニン 30mg/日 × 5-7日（漸減不要） + SABA継続',
    reason: '中等度（会話切れる、PEF 40-60%）は早期OCSで入院回避',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['rf_exacerbation_moderate'],
    note: '1週間以内follow up',
  },
  {
    id: 'exacerbation_severe_ed',
    action: 'REFER',
    drug: '重症増悪: 救急搬送',
    reason: '重症（会話不能、PEF<40%、SpO2<92%）',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['rf_exacerbation_severe'],
    note: '酸素(SpO2 93-95%)、連続SABAネブ、Ipratropium併用、IVステロイド、MgSO4考慮',
  },
  {
    id: 'exacerbation_life_threatening_emergency',
    action: 'REFER',
    drug: '⚠ 生命危機: 即時救急搬送',
    reason: '意識障害/silent chest/bradycardia/cyanosis → 挿管準備',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['rf_exacerbation_life_threatening'],
  },
  {
    id: 'post_exacerbation_stepup',
    action: 'STEP_UP',
    drug: '増悪後step up + follow up強化',
    reason: '増悪 = コントロール不足のシグナル',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_exacerbation_past_year_1', 'cm_exacerbation_past_year_ge2'],
    note: '1週間以内follow up、ICS増量、action plan更新、吸入手技確認',
  },

  // ===== G) Comorbidity =====
  {
    id: 'treat_gerd_first',
    action: 'ADD',
    drug: 'GERD治療（PPI + 生活指導）',
    example: 'ランソプラゾール15mg/日 + 食後3h臥位禁止 + 就寝前食事禁止',
    reason: 'GERD治療で喘息コントロール改善エビデンスあり',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_gerd', 'cm_gerd_nocturnal'],
    note: '8-12週で喘息再評価',
  },
  {
    id: 'treat_rhinitis_first',
    action: 'ADD',
    drug: '鼻ステロイド + 抗ヒスタミン薬（アレルギー性鼻炎）',
    example: 'フルチカゾン点鼻 1日2回 + フェキソフェナジン60mg×2',
    reason: 'One airway: 鼻治療で喘息1段階下げ可能例あり',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_allergic_rhinitis', 'cm_chronic_sinusitis'],
  },
  {
    id: 'address_nasal_polyps',
    action: 'REFER',
    drug: '耳鼻科紹介 + dupilumab検討（鼻茸）',
    reason: '鼻茸+重症喘息は dupilumab 最適応',
    fromStates: ['dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_nasal_polyps'],
  },
  {
    id: 'weight_reduction_obesity',
    action: 'WATCH',
    drug: '減量指導（BMI≥30）',
    example: '5-10%減量目標、GLP-1RA・減量手術も選択肢',
    reason: '肥満は喘息コントロール悪化因子。減量で改善報告',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_obesity_bmi30', 'cm_obesity_bmi35'],
  },
  {
    id: 'screen_osas',
    action: 'WATCH',
    drug: 'OSASスクリーニング（STOP-BANG）',
    example: 'STOP-BANG 3点以上でPSG検査',
    reason: 'OSAS+喘息で CPAP導入が喘息改善エビデンスあり',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['cm_osas_suspected', 'cm_obesity_bmi30', 'cm_frequent_exacerbator'],
  },
  {
    id: 'smoking_cessation',
    action: 'WATCH',
    drug: '⚠ 禁煙支援',
    example: 'バレニクリン、ニコチンパッチ、禁煙外来',
    reason: '現喫煙でICS効果減弱。ACO相当として扱う',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['co_smoker_current'],
  },
  {
    id: 'aco_add_lama_early',
    action: 'ADD',
    drug: 'ACO: LAMA早期追加',
    example: 'チオトロピウム 2.5μg 2吸入×1回/日 早期追加',
    reason: '喫煙歴+可変性+持続性閉塞 = ACO。LAMA早期導入',
    fromStates: ['mono', 'dual'],
    drugClass: 'LAMA',
    preferredWhen: ['cm_aco'],
    forbidden: ['cm_narrow_angle_glaucoma'],
  },
  {
    id: 'refer_abpa_suspected',
    action: 'REFER',
    drug: 'ABPA疑い → 呼吸器専門医',
    reason: 'アスペルギルス特異的IgE・沈降抗体・総IgE・胸部CT',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_abpa_suspect'],
    urgentWhen: ['cm_abpa'],
    note: '総IgE>1000・中心性気管支拡張で診断支持',
  },

  // ===== H) TAPER / Step-down =====
  {
    id: 'stepdown_after_stable',
    action: 'TAPER',
    drug: 'Step down（3ヶ月以上安定）',
    example: 'ICS用量 25-50%減、中用量→低用量',
    reason: 'Well-controlled ≥3ヶ月 → 副作用減・コスト削減',
    fromStates: ['mono', 'dual', 'triple'],
    requiresAny: ['co_stable_3mo_on_step3plus'],
    avoidWhen: ['co_seasonal_allergic', 'co_pregnancy_planning', 'cm_exacerbation_past_year_1'],
    note: 'LABA中止は慎重（コントロール悪化リスク）。完全中止は避ける',
  },
  {
    id: 'reduce_ocs_dependency',
    action: 'TAPER',
    drug: 'OCS依存離脱（biologics併用）',
    example: '2.5mg/月ペースで漸減、HPA軸評価併行',
    reason: 'Biologics（dupilumab/benralizumab）導入でOCS減量・離脱',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['cm_ocs_dependent'],
    specialistGate: true,
  },

  // ===== I) Safety / adherence =====
  {
    id: 'check_technique_before_stepup',
    action: 'WATCH',
    drug: 'Step up 前に吸入手技確認',
    example: 'Teach-back法: 「今教えたことを見せてください」',
    reason: '見かけ上uncontrolledの主因。Step up より先に確認',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['co_poor_inhaler_technique'],
  },
  {
    id: 'check_adherence_before_stepup',
    action: 'WATCH',
    drug: 'Step up 前にアドヒアランス確認',
    example: '処方残数、MPR、3-question set',
    reason: '処方の<70%なら step up 前に支援強化',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['co_poor_adherence'],
  },
  {
    id: 'switch_dpi_to_pmdi_low_effort',
    action: 'SWITCH',
    drug: 'DPI → pMDI + スペーサー（吸気力不足）',
    example: 'フルタイドディスカス → フルティフォーム pMDI + スペーサー',
    reason: '吸気力<30 L/minで DPI 効果減弱',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['co_dpi_insufficient_effort', 'co_elderly_65'],
  },
  {
    id: 'simplify_to_single_device',
    action: 'SWITCH',
    drug: '複数デバイス → 単一デバイス化',
    example: 'ICS + ICS/LABA併用 → ICS/LABA単独 or triple単吸入',
    reason: 'デバイス統一でエラー減、アドヒアランス向上',
    fromStates: ['dual', 'triple'],
    preferredWhen: ['co_multiple_devices', 'co_poor_adherence'],
  },
  {
    id: 'switch_bid_to_qd_adherence',
    action: 'SWITCH',
    drug: '1日2回 → 1日1回製剤へ',
    example: 'アドエア → レルベア / アニュイティ',
    reason: '1日1回でアドヒアランス20-30%向上',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_poor_adherence'],
  },

  // ===== J) Special populations =====
  {
    id: 'pregnancy_continue_ics',
    action: 'WATCH',
    drug: '妊娠中: ICS継続推奨（ブデソニド優先）',
    reason: 'コントロール不良のほうが母児リスク高い',
    fromStates: ['mono', 'dual', 'triple'],
    preferredWhen: ['co_pregnancy'],
    note: 'ブデソニド（パルミコート）がエビデンス最多。OCSバースト必要時使用可',
  },
  {
    id: 'aerd_avoid_nsaid',
    action: 'WATCH',
    drug: '⚠ AERD: NSAID全般回避',
    example: 'アセトアミノフェン使用可（1回≤500mg推奨）。COX-2は個別',
    reason: 'アスピリン・NSAID で誘発。カルテ・お薬手帳に赤フラグ',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    urgentWhen: ['cm_aerd'],
    preferredWhen: ['cm_aerd', 'cm_nsaid_intolerance'],
  },
  {
    id: 'aerd_add_ltra',
    action: 'ADD',
    drug: 'AERD: LTRA追加',
    example: 'モンテルカスト 10mg 就寝前',
    reason: 'AERDでLT経路優位、LTRA有効性強',
    fromStates: ['mono', 'dual'],
    drugClass: 'LTRA',
    preferredWhen: ['cm_aerd'],
    avoidWhen: ['se_ltra_neuropsych'],
  },
  {
    id: 'exercise_induced_premedication',
    action: 'ADD',
    drug: '運動前 pre-medication',
    example: '運動15-30分前にサルタノール2吸入 or AIR 1吸入',
    reason: '運動誘発発作予防',
    fromStates: ['mono'],
    preferredWhen: ['cm_exercise_induced_only', 'co_exercise_induced_reliever'],
  },
  {
    id: 'occupational_referral',
    action: 'REFER',
    drug: '職業性 → 産業医 + 呼吸器専門医',
    reason: '抗原回避が治療の本質。2年以内に改善多い',
    fromStates: ['naive', 'mono', 'dual', 'triple'],
    preferredWhen: ['cm_occupational', 'co_occupational_trigger'],
  },
  {
    id: 'seasonal_pre_stepup',
    action: 'STEP_UP',
    drug: '花粉期前の予防的step up',
    example: '花粉飛散2週間前から ICS増量 or LTRA併用',
    reason: '季節性抗原で増悪予防',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['co_seasonal_allergic', 'cm_exacerbation_past_year_1'],
  },

  // ===== K) Side effect handling =====
  {
    id: 'switch_ics_candida',
    action: 'SWITCH',
    drug: '口腔カンジダ → シクレソニドへ切替',
    example: 'フルタイド中止 → オルベスコ 100μg×1回/日',
    reason: 'シクレソニドはプロドラッグで口腔副作用少',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_oral_candidiasis', 'se_dysphonia'],
    targetClass: 'ICS',
    note: 'スペーサー + うがい徹底も併行',
  },
  {
    id: 'stop_ltra_psych',
    action: 'STOP',
    drug: '⚠ LTRA中止（神経精神症状）',
    example: 'モンテルカスト即中止、他剤へ変更',
    reason: 'FDA black box: 自殺念慮・悪夢・抑うつ',
    fromStates: ['mono', 'dual', 'triple'],
    urgentWhen: ['se_ltra_neuropsych'],
    triggerSideEffects: ['se_ltra_neuropsych'],
  },
  {
    id: 'reduce_ocs_chronic',
    action: 'TAPER',
    drug: '慢性OCS減量（biologics併用）',
    reason: '長期副作用（骨粗鬆症・HPA軸抑制・DM・白内障・感染症）',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_ocs_dependent', 'se_ocs_side_effects'],
    specialistGate: true,
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES                                            */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'SABA 単独治療（維持薬なし）',
    modifiers: ['co_saba_only_current'],
    reason: '【GINA 2024非推奨】SABA単独は喘息死リスク増。ICS-formoterol AIR/MART or 低用量ICS + SABA頓用へ即移行',
  },
  {
    drug: 'SABA 過使用',
    modifiers: ['co_high_saba_user'],
    reason: '【警告】年≥3本/月≥1本は喘息死の独立リスク。AIR/MART移行、ICS強化、受診頻度up',
  },
  {
    drug: 'LABA 単独（ICSなし）',
    modifiers: [],
    reason: '【禁忌】LABA単独は喘息関連死増加（SMART試験）。必ずICS併用合剤で処方',
  },
  {
    drug: 'LAMA (チオトロピウム/トリプル)',
    modifiers: ['cm_narrow_angle_glaucoma'],
    reason: '【禁忌】狭隅角緑内障（抗コリン作用で眼圧上昇）',
  },
  {
    drug: 'LAMA (チオトロピウム/トリプル)',
    modifiers: ['cm_bph_urinary_retention'],
    reason: '【相対禁忌】BPH・尿閉既往。泌尿器科コンサル後慎重投与',
  },
  {
    drug: 'ICS',
    modifiers: ['cm_active_tb', 'cm_active_fungal'],
    reason: '【禁忌】活動性肺結核・真菌感染で悪化リスク',
  },
  {
    drug: '非選択性β遮断薬（プロプラノロール等）',
    modifiers: [],
    reason: '【禁忌】β2受容体遮断で喘息発作誘発',
  },
  {
    drug: 'アスピリン・NSAID全般',
    modifiers: ['cm_aerd'],
    reason: '【禁忌】AERDで急性発作誘発。アセトアミノフェン使用可（1回≤500mg推奨）',
  },
  {
    drug: 'LTRA (モンテルカスト)',
    modifiers: ['se_ltra_neuropsych'],
    reason: '【FDA black box】自殺念慮・悪夢・抑うつ。即中止し他剤へ',
  },
  {
    drug: 'テオフィリン',
    modifiers: ['cm_cyp_interaction'],
    reason: '【注意】CYP阻害薬（シメチジン/キノロン/マクロライド）併用で血中濃度↑。減量 or 中止、血中濃度測定',
  },
  {
    drug: '吸入薬全般（手技不良）',
    modifiers: ['co_poor_inhaler_technique'],
    reason: '【要注意】step up 前に手技確認必須。見かけ上uncontrolledの主因',
  },
  {
    drug: '経口血糖降下薬・OCS長期',
    modifiers: ['cm_ocs_dependent', 'se_ocs_side_effects'],
    reason: '【警告】骨粗鬆症・HPA軸抑制・DM・白内障予防策必須。Biologics検討で減量',
  },
  {
    drug: 'ブデソニド以外のICS（妊娠）',
    modifiers: ['co_pregnancy'],
    reason: '【慎重】妊娠中はブデソニドがエビデンス最多。他ICSからブデソニドへ切替検討',
  },
];
