/**
 * Treatment Booster — 高血圧 治療修正データ
 * JSH2025（日本高血圧学会 高血圧治療ガイドライン2025）準拠
 *
 * Schema:
 * - DRUGS: 現在服用中の薬剤チップ（class別）
 * - MODIFIERS: 副作用・併存疾患・制約・失敗歴
 * - CONTROL_METRIC: 家庭血圧による状態判定（4段階: controlled / near_target / partial / uncontrolled）
 * - RECOMMENDATIONS: 推奨治療修正の配列
 * - DO_NOT_RULES: 絶対禁忌の表示ルール
 */

/* -------------------------------------------------------- */
/*  DRUGS (現在服用中の薬剤)                                */
/* -------------------------------------------------------- */
export const DRUGS = [
  // ARB
  { id: 'arb_azl', label: 'アジルバ（アジルサルタン）', class: 'ARB',
    doses: [{ value: '10', label: '10mg' }, { value: '20', label: '20mg', isDefault: true }, { value: '40', label: '40mg', isMax: true }] },
  { id: 'arb_tel', label: 'テルミサルタン', class: 'ARB',
    doses: [{ value: '20', label: '20mg' }, { value: '40', label: '40mg', isDefault: true }, { value: '80', label: '80mg', isMax: true }] },
  { id: 'arb_ols', label: 'オルメサルタン', class: 'ARB',
    doses: [{ value: '10', label: '10mg' }, { value: '20', label: '20mg', isDefault: true }, { value: '40', label: '40mg', isMax: true }] },
  { id: 'arb_val', label: 'バルサルタン', class: 'ARB',
    doses: [{ value: '40', label: '40mg' }, { value: '80', label: '80mg', isDefault: true }, { value: '160', label: '160mg', isMax: true }] },
  { id: 'arb_can', label: 'カンデサルタン', class: 'ARB',
    doses: [{ value: '4', label: '4mg' }, { value: '8', label: '8mg', isDefault: true }, { value: '12', label: '12mg', isMax: true }] },
  { id: 'arb_los', label: 'ロサルタン', class: 'ARB',
    doses: [{ value: '25', label: '25mg' }, { value: '50', label: '50mg', isDefault: true }, { value: '100', label: '100mg', isMax: true }] },

  // ACE阻害薬
  { id: 'acei_ena', label: 'エナラプリル', class: 'ACE阻害薬',
    doses: [{ value: '2.5', label: '2.5mg' }, { value: '5', label: '5mg', isDefault: true }, { value: '10', label: '10mg', isMax: true }] },
  { id: 'acei_ima', label: 'イミダプリル', class: 'ACE阻害薬',
    doses: [{ value: '2.5', label: '2.5mg' }, { value: '5', label: '5mg', isDefault: true }, { value: '10', label: '10mg', isMax: true }] },

  // Ca拮抗薬
  { id: 'ccb_am', label: 'アムロジピン', class: 'Ca拮抗薬',
    doses: [{ value: '2.5', label: '2.5mg' }, { value: '5', label: '5mg', isDefault: true }, { value: '10', label: '10mg', isMax: true }] },
  { id: 'ccb_nif', label: 'ニフェジピンCR', class: 'Ca拮抗薬',
    doses: [{ value: '20', label: '20mg' }, { value: '40', label: '40mg', isDefault: true }, { value: '80', label: '80mg', isMax: true }] },
  { id: 'ccb_cil', label: 'シルニジピン', class: 'Ca拮抗薬',
    doses: [{ value: '5', label: '5mg' }, { value: '10', label: '10mg', isDefault: true }, { value: '20', label: '20mg', isMax: true }] },

  // 利尿薬（JSH2025: サイアザイドは少量で使用開始推奨）
  { id: 'diu_tri', label: 'トリクロルメチアジド', class: '利尿薬',
    doses: [{ value: '0.5', label: '0.5mg', isDefault: true }, { value: '1', label: '1mg' }, { value: '2', label: '2mg', isMax: true }] },
  { id: 'diu_ind', label: 'インダパミド', class: '利尿薬',
    doses: [{ value: '0.5', label: '0.5mg', isDefault: true }, { value: '1', label: '1mg' }, { value: '2', label: '2mg', isMax: true }] },

  // β遮断薬
  { id: 'bb_bis', label: 'ビソプロロール', class: 'β遮断薬',
    doses: [{ value: '0.625', label: '0.625mg' }, { value: '1.25', label: '1.25mg' }, { value: '2.5', label: '2.5mg', isDefault: true }, { value: '5', label: '5mg', isMax: true }] },
  { id: 'bb_car', label: 'カルベジロール', class: 'β遮断薬',
    doses: [{ value: '1.25', label: '1.25mg' }, { value: '2.5', label: '2.5mg' }, { value: '5', label: '5mg', isDefault: true }, { value: '10', label: '10mg' }, { value: '20', label: '20mg', isMax: true }] },

  // MRA (JSH2025 G2)
  { id: 'mra_spi', label: 'スピロノラクトン', class: 'MRA',
    doses: [{ value: '12.5', label: '12.5mg' }, { value: '25', label: '25mg', isDefault: true }, { value: '50', label: '50mg', isMax: true }] },
  { id: 'mra_ese', label: 'エサキセレノン（ミネブロ）', class: 'MRA',
    doses: [{ value: '1.25', label: '1.25mg' }, { value: '2.5', label: '2.5mg', isDefault: true }, { value: '5', label: '5mg', isMax: true }] },

  // ARNI (JSH2025で高血圧に位置づけ、G2)
  { id: 'arni_sac', label: 'サクビトリルバルサルタン（エンレスト）', class: 'ARNI',
    doses: [{ value: '100', label: '100mg' }, { value: '200', label: '200mg', isDefault: true }, { value: '400', label: '400mg', isMax: true }] },
  { id: 'alpha_tam', label: 'タムスロシン（BPH併存時）', class: 'α遮断薬',
    doses: [{ value: '0.1', label: '0.1mg' }, { value: '0.2', label: '0.2mg', isDefault: true, isMax: true }] },

  // 合剤（よく使われる）— 合剤には増量の概念はないためdosesなし
  { id: 'combo_zac', label: 'ザクラス（アジルバ+アムロジピン）', class: '合剤' },
  { id: 'combo_mic', label: 'ミカムロ（テルミ+アムロジピン）', class: '合剤' },
  { id: 'combo_pre', label: 'プレミネント（ロサルタン+HCTZ）', class: '合剤' },
  { id: 'combo_azl', label: 'アテディオ（アジルバ+アムロジピン）', class: '合剤' },
];

/* -------------------------------------------------------- */
/*  CONTROL_METRIC (家庭血圧)                              */
/* -------------------------------------------------------- */
export const CONTROL_METRIC = {
  label: '家庭血圧平均（朝・夜の2週間平均）※診察室血圧も任意入力で白衣HT/仮面HT検出',
  inputs: [
    { id: 'sbp', label: '家庭SBP', unit: 'mmHg', placeholder: '例:128' },
    { id: 'dbp', label: '家庭DBP', unit: 'mmHg', placeholder: '例:78' },
    { id: 'office_sbp', label: '診察室SBP', unit: 'mmHg', placeholder: '任意:142' },
    { id: 'office_dbp', label: '診察室DBP', unit: 'mmHg', placeholder: '任意:88' },
    { id: 'sbp_sd', label: '家庭SBP変動SD', unit: 'mmHg', placeholder: '任意:12' },
  ],
  note: 'JSH2025: 全年齢で家庭血圧 <125/75（診察室 <130/80）に統一。ただし75歳以上は健康・機能状態で4カテゴリー分類（カテゴリー2以降で目標緩和、カテゴリー3以降は収縮期<120への降圧を避ける）。目標+5mmHg以内は日間変動範囲内として「目標内」扱い',
  /**
   * deriveStatus — JSH2025準拠の判定
   *  controlled:     目標達成 or 目標+5以内（日間変動内、維持）
   *  near_target:    目標+5〜+15（経過観察、個別判断・早期ステップアップ検討）
   *  uncontrolled:   目標+15以上（明確に目標未達、介入必要）
   *  overcontrolled: カテゴリー3以上でSBP<120（過降圧、減量検討）
   *
   * 高齢者カテゴリー（JSH2025 Table 3）:
   *   co_elderly:    カテゴリー1（ADL保持、自力通院可能）→ 非高齢者と同様の目標 <125/75
   *   co_frail:      カテゴリー2（手段的ADL低下、介助必要）→ 家庭 <135/85
   *   co_adl_severe: カテゴリー3（基本的ADL低下、通院困難）→ 家庭 <145/90、<120 は避ける
   *   co_end_of_life:カテゴリー4（エンド・オブ・ライフ）→ 個別判断、目安 140-160
   *
   * JSH2025 変更点: JSH2019の「75歳以上は<135/85」は撤廃。高齢でも原則 <125/75 を目指し、
   * 有害事象がある場合のみカテゴリー分類に応じて緩和する。
   */
  deriveStatus: (v, modifiers = []) => {
    const s = v.sbp;
    const d = v.dbp;
    if (s === undefined && d === undefined) return null;

    const cat4 = modifiers.includes('co_end_of_life');
    const cat3 = modifiers.includes('co_adl_severe');
    const cat2 = modifiers.includes('co_frail');

    // JSH2025: カテゴリー別目標（家庭血圧換算、診察室-5mmHg が目安）
    let sTarget = 125, dTarget = 75; // 原則（カテゴリー1 含む、全年齢）
    if (cat4) { sTarget = 155; dTarget = 95; }
    else if (cat3) { sTarget = 145; dTarget = 90; }
    else if (cat2) { sTarget = 135; dTarget = 85; }

    // 過降圧検出（JSH2025 Table 3）: カテゴリー3 では SBP<120 を避ける
    // カテゴリー2 でも SBP<120 は減量考慮
    if ((cat3 || cat4) && s !== undefined && s < 120) {
      return 'overcontrolled';
    }
    if (cat2 && s !== undefined && s < 115) {
      return 'overcontrolled';
    }

    const sMiss = s !== undefined ? s - sTarget : -Infinity;
    const dMiss = d !== undefined ? d - dTarget : -Infinity;
    const worst = Math.max(sMiss, dMiss);

    if (worst <= 5) return 'controlled';
    if (worst < 15) return 'near_target';
    return 'uncontrolled';
  },
};

/* -------------------------------------------------------- */
/*  MODIFIERS (副作用・併存疾患・制約・失敗歴)              */
/* -------------------------------------------------------- */
export const MODIFIERS = [
  // 副作用
  { id: 'se_cough', label: '空咳', cat: '副作用' },
  { id: 'se_edema', label: '下腿浮腫', cat: '副作用' },
  { id: 'se_hypotension', label: '起立性低血圧/ふらつき', cat: '副作用' },
  { id: 'se_hypoK', label: '低カリウム血症', cat: '副作用' },
  { id: 'se_hyperK', label: '高カリウム血症（K≧5.5）', cat: '副作用', severity: 'critical' },
  { id: 'se_creatinine_up', label: 'Cr上昇（30%超）', cat: '副作用' },
  { id: 'se_gynecomastia', label: '女性化乳房', cat: '副作用' },
  { id: 'se_uric_up', label: '尿酸上昇/痛風発作', cat: '副作用' },
  { id: 'se_bradycardia', label: '徐脈（HR<50）', cat: '副作用' },

  // 併存疾患
  { id: 'cm_dm', label: '2型糖尿病', cat: '併存疾患' },
  { id: 'cm_ckd', label: 'CKD G3a-G3b（eGFR 30-59）', cat: '併存疾患' },
  { id: 'cm_ckd_g45', label: 'CKD G4-5 (eGFR<30)', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_proteinuria', label: '蛋白尿（0.15g/gCr以上）', cat: '併存疾患' },
  { id: 'cm_hf', label: '心不全（HFrEF/HFpEF）', cat: '併存疾患' },
  { id: 'cm_cad', label: '冠動脈疾患/狭心症', cat: '併存疾患' },
  { id: 'cm_af', label: '心房細動', cat: '併存疾患' },
  { id: 'cm_post_mi', label: '心筋梗塞後', cat: '併存疾患' },
  { id: 'cm_stroke', label: '脳卒中既往', cat: '併存疾患' },
  { id: 'cm_bph', label: '前立腺肥大症', cat: '併存疾患' },
  { id: 'cm_gout', label: '痛風/高尿酸血症', cat: '併存疾患' },
  { id: 'cm_asthma', label: '喘息（コントロール不良）', cat: '併存疾患' },
  { id: 'cm_osas', label: '睡眠時無呼吸症候群', cat: '併存疾患' },
  { id: 'cm_nocturnal_ht', label: '夜間高血圧 / non-dipper', cat: '併存疾患' },
  { id: 'cm_morning_surge', label: '早朝高血圧', cat: '併存疾患' },
  { id: 'cm_aortic_stenosis', label: '大動脈弁狭窄症（重症）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_bilateral_rvs', label: '両側腎動脈狭窄', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_liver_severe', label: '肝機能障害（Child-Pugh B以上）', cat: '併存疾患', severity: 'critical' },
  { id: 'cm_salt_sensitive', label: '食塩感受性高血圧（推定）', cat: '併存疾患' },

  // 制約（JSH2025 高齢者カテゴリー Table 3 準拠、4択排他選択）
  { id: 'co_elderly', label: '75歳以上・ADL保持（カテゴリー1、目標 <125/75）', cat: '制約', radioGroup: 'ht_elderly_category' },
  { id: 'co_frail', label: 'フレイル〜要介護（カテゴリー2、目標 <135/85）', cat: '制約', radioGroup: 'ht_elderly_category' },
  { id: 'co_adl_severe', label: '基本的ADL低下・通院困難（カテゴリー3、目標 <145/90、<120回避）', cat: '制約', severity: 'critical', radioGroup: 'ht_elderly_category' },
  { id: 'co_end_of_life', label: 'エンド・オブ・ライフ（カテゴリー4、個別判断）', cat: '制約', severity: 'critical', radioGroup: 'ht_elderly_category' },
  { id: 'co_pregnancy', label: '妊娠/妊娠希望', cat: '制約', severity: 'critical' },
  { id: 'co_lactation', label: '授乳中', cat: '制約' },
  { id: 'co_polyp', label: 'ポリファーマシー（5剤以上）', cat: '制約' },
  { id: 'co_adherence', label: 'アドヒアランス不良（飲み忘れ多い）', cat: '制約' },
  { id: 'co_cost', label: 'コスト負担（後発品希望）', cat: '制約' },
  { id: 'co_nsaid', label: 'NSAID常用（整形疾患等）', cat: '制約' },
  { id: 'co_grade2', label: 'Grade II（診察室≥160/100 or 家庭≥145/90）', cat: '制約' },
  { id: 'co_stable_6mo', label: '6ヶ月以上コントロール安定', cat: '制約' },
  { id: 'co_reproductive_age', label: '妊娠可能年齢の女性（挙児希望・避妊未確定）', cat: '制約', severity: 'critical' },
  { id: 'co_obese', label: '肥満（BMI≥25）', cat: '制約' },
  { id: 'co_osa_risk', label: 'いびき・昼間眠気・家族の無呼吸指摘（OSA疑い）', cat: '制約' },

  // 失敗歴
  { id: 'fh_acei_cough', label: 'ACEi→空咳で中止歴', cat: '失敗歴' },
  { id: 'fh_ccb_edema', label: 'CCB→浮腫で中止歴', cat: '失敗歴' },
  { id: 'fh_thiazide_hypoK', label: 'チアザイド→低Kで中止歴', cat: '失敗歴' },
  { id: 'fh_bb_bradycardia', label: 'β遮断薬→徐脈で中止歴', cat: '失敗歴' },

  // Red Flag（緊急）
  { id: 'rf_severe_ht', label: 'SBP≥180 or DBP≥110', cat: 'Red Flag', severity: 'critical' },
  { id: 'rf_2nd_suspect', label: '若年発症/難治性（二次性疑い）', cat: 'Red Flag' },
  { id: 'rf_hypoK_severe', label: '低K血症+HT（原発性アルド疑い）', cat: 'Red Flag' },
  { id: 'rf_target_organ', label: '臓器障害進行中（眼底・蛋白尿悪化）', cat: 'Red Flag' },
];

/* -------------------------------------------------------- */
/*  RECOMMENDATIONS                                         */
/* -------------------------------------------------------- */
export const RECOMMENDATIONS = [
  // ===========================================
  // 無治療: 生活習慣指導が先か、薬物療法開始か
  // ===========================================
  {
    id: 'naive_lifestyle_first',
    action: 'WATCH',
    drug: '生活習慣改善を優先（STEP 1 前）',
    example: '減塩(6g/日未満)・減量(BMI<25)・運動(中等度30分×週5)・節酒・禁煙 + 家庭血圧手帳',
    reason: 'JSH2025: 低・中等リスクのI度高血圧では、生活習慣改善を1ヶ月以内に再評価。十分な降圧があれば薬物療法不要',
    fromStates: ['naive'],
    forbidden: ['co_grade2', 'rf_severe_ht', 'rf_target_organ', 'cm_hf', 'cm_post_mi', 'cm_stroke', 'cm_dm', 'cm_ckd', 'cm_ckd_g45', 'cm_proteinuria'],
    reassess: '1ヶ月後に家庭血圧で再評価。十分な降圧がなければ STEP 1 の薬物療法を開始',
    note: 'JSH2025: 診断後1ヶ月以内に再評価し、改善なければ薬物療法を遅らせず開始。高リスク併存例では最初から薬物療法併用',
  },
  {
    id: 'start_arb',
    action: 'STEP_UP',
    drug: 'ARBから開始',
    example: 'アジルバ錠20mg 1回1錠 1日1回 朝食後',
    reason: '糖尿病・CKD・蛋白尿を伴う高血圧では、ARBが第一選択（腎保護+心血管イベント減少）',
    fromStates: ['naive'],
    preferredWhen: ['cm_dm', 'cm_ckd', 'cm_proteinuria', 'cm_hf', 'cm_post_mi'],
    forbidden: ['co_pregnancy', 'cm_ckd_g45'],
    reassess: '2-4週後に家庭血圧 + 1ヶ月後にK・Cre測定',
    note: 'Cr上昇30%以内かつK<5.5は許容範囲。30%超上昇時は腎動脈狭窄を疑う',
  },
  {
    id: 'start_ccb',
    action: 'STEP_UP',
    drug: 'Ca拮抗薬から開始',
    example: 'アムロジピン錠5mg 1回1錠 1日1回 朝食後',
    reason: '高齢者・脳卒中既往・ISH（収縮期孤立性高血圧）では第一選択。安全性高い',
    fromStates: ['naive'],
    preferredWhen: ['co_elderly', 'cm_stroke', 'cm_cad'],
    avoidWhen: ['se_edema', 'fh_ccb_edema'],
    reassess: '2-4週後に家庭血圧・浮腫確認',
  },
  {
    id: 'start_thiazide',
    action: 'STEP_UP',
    drug: 'サイアザイド系利尿薬から開始（少量）',
    example: 'トリクロルメチアジド錠0.5mg 1回1錠 1日1回 朝食後（JSH2025: 少量で開始）',
    reason: 'JSH2025 G1b: 本来投与されるべき病態への使用率が低く積極的投与が望まれる。食塩感受性・高齢者に有効',
    fromStates: ['naive'],
    preferredWhen: ['co_cost', 'cm_salt_sensitive', 'co_elderly', 'co_frail'],
    avoidWhen: ['cm_gout', 'cm_dm', 'se_uric_up', 'fh_thiazide_hypoK'],
    forbidden: ['se_hypoK'],
    reassess: '4週後にK・Na・UA測定',
    note: 'JSH2025: 少量（0.5-1mg）で開始。低K血症・耐糖能悪化・高尿酸血症に注意。DM/痛風合併例では他剤優先',
  },
  {
    id: 'start_bb',
    action: 'STEP_UP',
    drug: 'β遮断薬から開始（ビソプロロール/カルベジロール）',
    example: 'ビソプロロール錠2.5mg 1回1錠 1日1回 朝食後',
    reason: 'JSH2025 G1b: 狭心症・心筋梗塞後・HFrEF・大動脈解離・胸部大動脈瘤で積極的適応。有用性・安全性が確立',
    fromStates: ['naive'],
    preferredWhen: ['cm_cad', 'cm_post_mi', 'cm_hf', 'cm_af'],
    avoidWhen: ['cm_asthma', 'fh_bb_bradycardia', 'se_bradycardia', 'co_adl_severe'],
    forbidden: ['co_pregnancy'],
    drugClass: 'β遮断薬',
    reassess: '2週後に心拍数・血圧確認。徐脈に注意しながら漸増',
    note: 'JSH2025: ビソプロロール・カルベジロールは糖尿病・高齢者への使用懸念が解消。積極的適応では第一選択の一つ',
  },
  {
    id: 'start_combo',
    action: 'STEP_UP',
    drug: 'ARB/CCB合剤で開始（Grade II以上）',
    example: 'ザクラス配合錠HD 1回1錠 1日1回 朝食後',
    reason: 'SBP≥160 or DBP≥100の中等症以上では初期から合剤推奨（JSH2025）',
    fromStates: ['naive'],
    preferredWhen: ['co_adherence', 'co_grade2'],
    urgentWhen: ['rf_severe_ht', 'co_grade2'],
    forbidden: ['co_pregnancy', 'cm_bilateral_rvs', 'cm_aortic_stenosis', 'se_hyperK'],
    reassess: '1-2週後に家庭血圧確認',
  },

  // ===========================================
  // STEP UP: 単剤 → 2剤（合剤推奨）
  // ===========================================
  {
    id: 'mono_to_arb_ccb',
    action: 'STEP_UP',
    drug: 'ARB/CCB合剤へ切り替え',
    example: 'ザクラス配合錠HD 1回1錠 1日1回 朝食後（既存薬中止）',
    reason: '単剤最大用量でも目標未達。ARB+CCBは最もエビデンスある併用で、合剤はアドヒアランス改善',
    fromStates: ['mono'],
    preferredWhen: ['co_adherence'],
    forbidden: ['co_pregnancy'],
    reassess: '2週後に家庭血圧',
    _requiresMaxDose: true,
    urgentWhen: ['co_grade2'],
  },
  {
    id: 'mono_add_ccb',
    action: 'ADD',
    drug: 'Ca拮抗薬追加',
    example: 'アムロジピン錠5mg 1回1錠 1日1回 朝食後',
    reason: 'ARB単剤で未達。ARB+CCBの2剤併用（エビデンス豊富）',
    fromStates: ['mono'],
    avoidWhen: ['se_edema', 'fh_ccb_edema'],
    reassess: '2週後に家庭血圧・浮腫確認',
    drugClass: 'Ca拮抗薬',
    note: 'JSH2025: 単剤未達時は「増量」と「併用」がほぼ同等推奨。\n・最大量未達 → 増量先行が許容\n・最大量近く / 高齢者で副作用懸念 → 併用先行\n・grade III(>180/110)・臓器障害あり → 併用優先',
  },
  {
    id: 'mono_add_thiazide',
    action: 'ADD',
    drug: 'サイアザイド系利尿薬追加',
    example: 'トリクロルメチアジド錠1mg 1回1錠 1日1回 朝食後',
    reason: 'ARB+利尿薬の組み合わせ。食塩感受性高血圧・高齢者に有効',
    fromStates: ['mono'],
    preferredWhen: ['co_elderly'],
    avoidWhen: ['cm_gout', 'se_uric_up', 'fh_thiazide_hypoK', 'cm_dm'],
    reassess: '4週後にK・Na・UA確認',
    drugClass: '利尿薬',
  },

  // ===========================================
  // STEP UP: 2剤 → 3剤
  // ===========================================
  {
    id: 'dual_add_thiazide',
    action: 'ADD',
    drug: 'サイアザイド系利尿薬追加（3剤目・原則投与）',
    example: 'トリクロルメチアジド錠0.5-1mg 1回1錠 1日1回 朝食後',
    reason: 'JSH2025 STEP 3: サイアザイド系利尿薬が投与されていなければ原則追加。ARB+CCB+利尿薬は標準的3剤併用',
    fromStates: ['dual'],
    avoidWhen: ['cm_gout', 'fh_thiazide_hypoK', 'cm_ckd_g45', 'se_hypoK'],
    reassess: '4週後にK・Na・UA・Cre確認',
    drugClass: '利尿薬',
  },
  {
    id: 'switch_to_arni',
    action: 'SWITCH',
    drug: 'ARB/ACEi → ARNI（サクビトリルバルサルタン）へ切替',
    example: 'ARB/ACEi中止 → 36時間休薬後 → サクビトリルバルサルタン錠200mg 1回1錠 1日1回',
    reason: 'JSH2025 G2: HFrEF・LVH併存HTで選択肢。ARB/ACEiから切替時は36時間の休薬期間必須（血管浮腫リスク）',
    fromStates: ['mono', 'dual'],
    targetClass: 'ARNI',
    preferredWhen: ['cm_hf', 'cm_post_mi'],
    forbidden: ['co_pregnancy', 'se_hyperK', 'cm_bilateral_rvs'],
    drugClass: 'ARNI',
    specialistGate: true,
    note: 'ARBとの併用は禁忌（36時間休薬必須）。血管浮腫既往例では禁忌。循環器専門医と連携推奨',
    reassess: '2週後に血圧・K・Cre',
    connectedAlert: 'HFrEF管理: ARNI+βB+MRA+SGLT2i（Fantastic Four）の構成を検討',
  },

  // ===========================================
  // STEP UP: 3剤 → 治療抵抗性高血圧
  // ===========================================
  {
    id: 'triple_add_mra',
    action: 'ADD',
    drug: 'MRA追加（治療抵抗性高血圧）',
    example: 'スピロノラクトン錠25mg 1回1錠 1日1回 朝食後（高齢/CKD G3は12.5mgから）／または エサキセレノン錠2.5mg 1回1錠 1日1回',
    reason: '3剤併用でも未達の治療抵抗性高血圧。MRA追加でエビデンスあり（PATHWAY-2）',
    fromStates: ['triple'],
    drugClass: 'MRA',
    forbidden: ['se_hyperK', 'cm_ckd_g45'],
    urgentWhen: ['rf_target_organ'],
    reassess: 'eGFR 60以上: 2週後・4週後・3ヶ月後にK/Cre、 eGFR 30-59: 週1回×2、隔週×2、月1回',
    note: '女性化乳房の副作用あり→エサキセレノン（非ステロイド性MRA）へ切り替え可',
    connectedAlert: '二次性高血圧（原発性アルドステロン症）の除外を検討',
  },
  {
    id: 'refer_resistant',
    action: 'REFER',
    drug: '循環器科/高血圧専門医へ紹介',
    reason: '3剤併用+MRAでも未達、または二次性高血圧疑い',
    fromStates: ['triple', 'quad_plus'],
    preferredWhen: ['rf_2nd_suspect', 'rf_hypoK_severe', 'rf_target_organ'],
    urgentWhen: ['rf_severe_ht', 'rf_target_organ'],
    note: '【二次性HTスクリーニング】原発性アルドステロン症: PAC/PRA比 ≥200 + PAC ≥120 pg/mL / 褐色細胞腫: 24時間尿メタネフリン・ノルメタネフリン / 腎血管性HT: 腎動脈Doppler or MRA / クッシング症候群: 24時間尿遊離コルチゾール / 甲状腺機能: TSH・FT4',
  },
  {
    id: 'screen_osa',
    action: 'REFER',
    drug: 'OSA（睡眠時無呼吸）スクリーニング・PSG検査',
    reason: '治療抵抗性HTの高頻度原因。JSH2025も3剤以降未達で除外を推奨',
    fromStates: ['triple', 'quad_plus'],
    requiresAny: ['co_osa_risk', 'cm_osas', 'co_obese', 'cm_nocturnal_ht'],
    preferredWhen: ['co_osa_risk', 'cm_osas', 'co_obese', 'cm_nocturnal_ht'],
    note: '【OSAスクリーニング】Epworth Sleepiness Scale（ESS）+ STOP-BANG質問票。疑い強ければ呼吸器内科/耳鼻科で終夜ポリソムノグラフィ（PSG）or 簡易型検査。CPAP導入で降圧効果 SBP 2-3mmHg報告あり',
    reassess: 'PSG施行後に再評価',
  },
  {
    id: 'nocturnal_bedtime_dosing',
    action: 'SWITCH',
    drug: '就寝前投与への変更（夜間高血圧・早朝高血圧）',
    example: 'アジルバ錠20mg 1回1錠 1日1回 就寝前（朝食後→就寝前へ変更）',
    reason: '夜間高血圧（non-dipper）・早朝高血圧の是正に、一部のARB/ACEi/CCBの就寝前投与を検討',
    fromStates: ['mono', 'dual', 'triple'],
    requiresAny: ['cm_nocturnal_ht', 'cm_morning_surge'],
    preferredWhen: ['cm_nocturnal_ht', 'cm_morning_surge', 'cm_osas'],
    avoidWhen: ['se_hypotension', 'co_frail', 'co_adl_severe', 'co_end_of_life'],
    specialistGate: true,
    note: 'エビデンス: MAPEC/HYGIA試験で心血管イベント減少報告あるも、TIME試験(2022)で差なし。ABPMで非降下型（dipping <10%）を確認してから実施することが望ましい',
    reassess: '2-4週後にABPM or 就寝前・早朝の家庭血圧測定',
  },
  {
    id: 'refer_ckd_advanced',
    action: 'REFER',
    drug: '腎臓内科へ紹介（CKD G4-G5 高血圧）',
    reason: 'eGFR<30では降圧薬の選択・用量調整・K管理が専門的。早期のネフロロジー共同管理が望ましい',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['cm_ckd_g45'],
    note: '【G4-G5管理】ARB/ACEi は慎重投与（Cr/K頻回モニタ）。サイアザイドはeGFR<30で効果減弱→ループ利尿薬（フロセミド等）を検討。高K血症時はK吸着薬（ロケルマ・カリメート）併用。透析導入時期の評価も並行',
    reassess: '月1回のK・Cre・eGFR・尿蛋白',
  },

  // ===========================================
  // SWITCH: 副作用・失敗歴による薬剤変更
  // ===========================================
  {
    id: 'switch_acei_to_arb',
    action: 'SWITCH',
    drug: 'ACEi → ARBへ変更',
    example: 'エナラプリル中止 → アジルバ錠20mg 1回1錠 1日1回',
    reason: 'ACEi由来の空咳。ARBは咳嗽の副作用がほぼなく、降圧効果は同等',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_cough'],
    preferredWhen: ['se_cough', 'fh_acei_cough'],
    forbidden: ['co_pregnancy'],
  },
  {
    id: 'switch_ccb_to_cil',
    action: 'SWITCH',
    drug: 'アムロジピン → シルニジピンへ変更',
    example: 'シルニジピン錠5mg 1回1錠 1日1回 朝食後',
    reason: 'CCB浮腫が主要問題。シルニジピンはN型阻害作用があり、交感神経抑制で浮腫軽減',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_edema'],
    avoidWhen: ['fh_ccb_edema'],
  },
  {
    id: 'switch_thiazide_to_arb',
    action: 'SWITCH',
    drug: 'サイアザイド → ARBへ変更',
    example: 'トリクロルメチアジド中止 → アジルバ錠20mg 1回1錠 1日1回',
    reason: 'サイアザイドによる低K・高尿酸・耐糖能悪化。ARBへ切り替え',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_hypoK', 'se_uric_up'],
    forbidden: ['co_pregnancy'],
  },
  {
    id: 'switch_thiazide_to_losartan',
    action: 'SWITCH',
    drug: 'サイアザイド → ロサルタンへ変更',
    example: 'ロサルタンK錠50mg 1回1錠 1日1回 朝食後',
    reason: '痛風合併時。ロサルタンは尿酸低下作用（URAT1阻害）を持つ唯一のARB',
    fromStates: ['mono', 'dual', 'triple'],
    triggerSideEffects: ['se_uric_up'],
    preferredWhen: ['cm_gout'],
    forbidden: ['co_pregnancy'],
  },

  // ===========================================
  // 併存疾患別の最適化
  // ===========================================
  {
    id: 'opt_dm_arb_sglt2',
    action: 'SWITCH',
    drug: 'ARBへ切り替え（腎保護強化）',
    example: 'テルミサルタン錠40mg 1回1錠 1日1回 朝食後（代謝改善・腎保護エビデンス豊富）',
    reason: 'DM+HTではARBが第一選択。SGLT2i併用で心腎保護エビデンス最強（EMPA-KIDNEY、DAPA-CKD）',
    fromStates: ['mono', 'dual'],
    targetClass: 'ARB',
    preferredWhen: ['cm_dm', 'cm_ckd', 'cm_proteinuria'],
    forbidden: ['co_pregnancy'],
    connectedAlert: 'DM管理側でSGLT2i追加を検討（別途DMテンプレート参照）。SGLT2iは単独で降圧効果もあり',
  },
  {
    id: 'opt_hf_add_bb',
    action: 'ADD',
    drug: 'β遮断薬追加（HFrEF適応）',
    example: 'ビソプロロール錠2.5mg 1回1錠 1日1回（徐々に増量）',
    reason: 'HFrEF+HT → β遮断薬は予後改善薬（Fantastic Four構成薬）',
    fromStates: ['mono', 'dual', 'triple'],
    drugClass: 'β遮断薬',
    preferredWhen: ['cm_hf', 'cm_post_mi'],
    avoidWhen: ['cm_asthma', 'fh_bb_bradycardia', 'se_bradycardia'],
    reassess: '2週毎に心拍・血圧確認',
    connectedAlert: 'HF管理: ARNI/ACEi + βB + MRA + SGLT2iの4剤併用を検討',
  },
  {
    id: 'opt_af_add_bb_or_ccb',
    action: 'ADD',
    drug: 'β遮断薬 または 非DHP-CCB（レートコントロール）',
    example: 'ビソプロロール錠2.5mg または ベラパミル錠40mg',
    reason: 'AF+HT → β遮断薬/非DHP-CCBでHR+BP同時コントロール',
    fromStates: ['mono', 'dual'],
    preferredWhen: ['cm_af'],
    avoidWhen: ['cm_asthma'],
    specialistGate: false,
    note: '抗凝固（DOAC）の適応を別途評価（CHADS2/CHA2DS2-VAScスコア）',
  },
  {
    id: 'opt_bph_add_alpha',
    action: 'ADD',
    drug: 'α遮断薬追加（BPH併存）',
    example: 'タムスロシン錠0.2mg 1回1錠 1日1回 朝食後',
    reason: 'BPH+HT → α遮断薬で排尿障害改善+軽度降圧の一石二鳥',
    fromStates: ['mono', 'dual', 'triple'],
    drugClass: 'α遮断薬',
    preferredWhen: ['cm_bph'],
    avoidWhen: ['se_hypotension', 'co_frail'],
  },

  // ===========================================
  // TAPER: 減量・中止
  // ===========================================
  {
    id: 'taper_elderly_hypotension',
    action: 'TAPER',
    drug: '降圧薬の減量（起立性低血圧・フレイル）',
    reason: '高齢者・フレイルで過降圧による転倒リスク。症候性低血圧・ふらつきを認めるときは速やかに減量',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    triggerSideEffects: ['se_hypotension'],
    preferredWhen: ['co_frail', 'co_adl_severe'],
    note: 'まず朝食後の最も作用の強い薬を1/2量に減量。2週後に再評価',
    reassess: '2週後に家庭血圧（起立時も測定）',
  },
  {
    id: 'taper_overcontrolled',
    action: 'TAPER',
    drug: '降圧薬の減量（過降圧）',
    reason: 'JSH2025 Table 3: カテゴリー3以上で収縮期<120への降圧は避ける。カテゴリー2でも<115で減量考慮。転倒・失神・臓器灌流低下リスク',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['co_adl_severe', 'co_end_of_life', 'co_frail'],
    note: 'まず作用の最も強い薬を1/2量に。2週後に家庭血圧の起立時含めた再評価',
    reassess: '2週後に家庭血圧（臥位・起立時両方を測定）',
  },
  {
    id: 'taper_controlled_stable',
    action: 'TAPER',
    drug: '降圧薬の見直し（コントロール良好で長期安定）',
    reason: 'コントロール良好が6ヶ月以上持続。ポリファーマシー回避のため最小有効用量を検討',
    fromStates: ['dual', 'triple', 'quad_plus'],
    requiresAny: ['co_stable_6mo'],
    preferredWhen: ['co_polyp', 'co_elderly'],
    note: 'いきなり中止は反跳性高血圧リスク。1剤ずつ減量、4週毎に評価',
    reassess: '4週後に家庭血圧',
  },

  // ===========================================
  // REFER: 紹介
  // ===========================================
  {
    id: 'refer_pregnancy',
    action: 'REFER',
    drug: '産婦人科・高血圧専門医へ緊急紹介',
    reason: '妊娠中の高血圧は専門管理が必要。ACEi/ARBは胎児腎毒性・羊水過少で禁忌',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    preferredWhen: ['co_pregnancy'],
    urgentWhen: ['co_pregnancy'],
    note: '【最優先】ACEi/ARBは即時中止（継続不可）。使用可能薬: メチルドパ、ラベタロール、ヒドララジン、ニフェジピン徐放（JSH2025妊娠高血圧GL準拠）',
  },
  {
    id: 'pregnancy_first_line_methyldopa',
    action: 'STEP_UP',
    drug: '妊娠HT 第一選択: メチルドパ',
    example: 'アルドメット 250mg×2 から開始（最大2000mg/日）',
    reason: 'メチルドパは長期安全性データ最大、妊娠HT 第一選択（JSH2025/ACOG 一致）',
    fromStates: ['naive'],
    drugClass: '中枢α2作動薬',
    preferredWhen: ['co_pregnancy'],
    note: '効果不十分なら ラベタロール（200-400mg×2-3） / ニフェジピン徐放（20-40mg×1-2）追加。緊急時はヒドララジン静注',
  },
  {
    id: 'pregnancy_switch_to_safe_drug',
    action: 'SWITCH',
    drug: '妊娠判明 → ARB/ACEi/MRA/利尿薬を即時中止し安全薬へ',
    example: '中止 → メチルドパ 250mg×2 開始、ラベタロール/ニフェジピン徐放併用',
    reason: 'ARB/ACEi: 胎児腎障害・羊水過少。MRA・利尿薬: 児の電解質・成長への影響',
    fromStates: ['mono', 'dual', 'triple', 'quad_plus'],
    targetClass: '中枢α2作動薬',
    urgentWhen: ['co_pregnancy'],
    preferredWhen: ['co_pregnancy'],
    note: 'ラベタロールは β遮断薬（喘息で慎重）、ニフェジピン徐放は CCB分類',
  },
  {
    id: 'refer_hypertensive_emergency',
    action: 'REFER',
    drug: '救急搬送（高血圧緊急症）',
    reason: 'SBP≥180 or DBP≥110 + 臓器障害（眼底出血、蛋白尿急増、意識障害、胸痛）',
    fromStates: ['naive', 'mono', 'dual', 'triple', 'quad_plus'],
    urgentWhen: ['rf_severe_ht', 'rf_target_organ'],
  },
];

/* -------------------------------------------------------- */
/*  DO_NOT_RULES (絶対禁忌の表示ルール)                    */
/* -------------------------------------------------------- */
export const DO_NOT_RULES = [
  {
    drug: 'ARB/ACE阻害薬',
    modifiers: ['co_pregnancy'],
    reason: '【禁忌】妊娠（胎児腎障害・羊水過少）→ 即時中止し産婦人科へ',
  },
  {
    drug: 'ARB/ACE阻害薬',
    modifiers: ['cm_bilateral_rvs'],
    reason: '【禁忌】両側腎動脈狭窄（急性腎障害リスク）',
  },
  {
    drug: 'ARB/ACE阻害薬',
    modifiers: ['se_hyperK'],
    reason: '高K血症（K≧5.5）継続下での追加・増量は禁忌。K≧6.0または心電図変化で即中止',
  },
  {
    drug: 'ARB/ACE阻害薬',
    modifiers: ['cm_ckd_g45'],
    reason: 'eGFR<30では慎重投与（Cr・K頻回チェック必須）',
  },
  {
    drug: 'ARB + 利尿薬 + NSAID',
    modifiers: ['co_nsaid', 'cm_ckd'],
    reason: 'Triple Whammy（AKI高リスク）→ NSAID中止またはARBの用量調整',
  },
  {
    drug: 'サイアザイド系利尿薬',
    modifiers: ['cm_gout'],
    reason: '痛風発作誘発リスク',
  },
  {
    drug: '非選択性β遮断薬',
    modifiers: ['cm_asthma'],
    reason: '【禁忌】喘息誘発・気管支攣縮（プロプラノロール等）',
  },
  {
    drug: 'β1選択性β遮断薬（ビソプロロール等）',
    modifiers: ['cm_asthma'],
    reason: '喘息コントロール不良時は慎重投与（必要時は呼吸器専門医と連携）',
  },
  {
    drug: 'MRA（スピロノラクトン/エサキセレノン）',
    modifiers: ['se_hyperK', 'cm_ckd_g45'],
    reason: '高K血症リスク増大（特にK≧5.0、eGFR<30で回避）',
  },
  {
    drug: 'ACE阻害薬/ARB + MRA + K製剤',
    modifiers: ['se_hyperK'],
    reason: '三者併用は高K血症リスク急増。K製剤は中止、他の2剤もK監視',
  },
  {
    drug: 'すべてのCa拮抗薬・ARB',
    modifiers: ['cm_aortic_stenosis'],
    reason: '重症大動脈弁狭窄での過降圧は失神・突然死リスク',
  },
  {
    drug: 'ロサルタン（カルベジロール）',
    modifiers: ['cm_liver_severe'],
    reason: '肝代謝薬（Child-Pugh B以上では減量または他剤選択）',
  },
  {
    drug: 'ACE阻害薬/ARB',
    modifiers: ['co_lactation'],
    reason: '授乳中は慎重投与。必要時はエナラプリル（母乳移行少）を選択',
  },
  {
    drug: 'β遮断薬',
    modifiers: ['se_bradycardia'],
    reason: '【JSH2025 Table 2】高度徐脈（HR<50）は禁忌。2-3度AVブロック既往も禁忌',
  },
  {
    drug: 'サイアザイド系利尿薬',
    modifiers: ['se_hypoK'],
    reason: '【JSH2025 Table 2】ナトリウム・カリウムが明らかに減少している病態では禁忌。ベースライン低K血症例では開始前に補正',
  },
  {
    drug: 'ARB + ARNI（サクビトリルバルサルタン）',
    modifiers: ['cm_hf', 'cm_post_mi'],
    reason: '【JSH2025】ARBとARNIの併用は禁忌（血管浮腫・腎機能悪化リスク）。ARNI使用時はARBを36時間以上休薬してから切替',
  },
];
// 注: 妊娠可能年齢 + ARB/ACEi 警告と Triple Whammy は connectedAlerts で動的に発火する
// （既存の "ARB + 利尿薬 + NSAID" DO_NOT と重複表示を避けるため、DO_NOT_RULES に追加せず connectedAlerts のみで警告）
