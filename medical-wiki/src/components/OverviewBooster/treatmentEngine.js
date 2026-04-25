/**
 * 慢性疾患管理ブースター — 治療提案エンジン (拡充版)
 *
 * 各疾患について、患者ヘッダー・共通検査値・共通病歴・スコア結果・現在処方から
 * 5-10件の提案を生成。各提案に sharedClass を付与し、複数疾患で同じ薬剤クラスが
 * 推奨される場合は detectSharedClasses() で交差検出可能。
 *
 * 推奨構造: { severity, action, drug, dose, reason, gl, sharedClass? }
 *  - severity: 'critical' | 'high' | 'medium' | 'low'
 *  - sharedClass: 'SGLT2i' | 'ARB' | 'ACEi' | 'MRA' | 'ARNI' | 'Statin' | 'Lifestyle' 等
 *    (複数疾患で共通ヒットさせるためのタグ)
 */

// ============================================================
// HT 治療提案 (拡充: 8案)
// ============================================================
function suggestHt(ctx) {
  const { patientHeader: ph, commonLabs: cl, commonHistory: ch, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const grade = scoreResult?.derivedGrade;
  const tier = scoreResult?.tier;
  const hasArb = drugIds.includes('ht_arb');
  const hasAcei = drugIds.includes('ht_acei');
  const hasCcb = drugIds.includes('ht_ccb');
  const hasThiazide = drugIds.includes('ht_thiazide');
  const hasMra = drugIds.includes('ht_mra');
  const hasArni = drugIds.includes('ht_arni');
  const drugCount = drugIds.length;

  // 緊急/禁忌系
  if (ph.co_pregnancy) {
    recs.push({ severity: 'critical', action: 'switch', drug: 'メチルドパ', dose: '250mg×2/日 開始',
      reason: '妊娠中はARB/ACEi/ARNI禁忌 (胎児腎障害・羊水過少)。メチルドパが第一選択。',
      gl: 'JSH2025 妊娠HT', sharedClass: 'pregnancy' });
    recs.push({ severity: 'high', action: 'add', drug: 'ラベタロール (β遮断+α遮断)', dose: '100-200mg×2/日',
      reason: '妊娠HTでメチルドパに上乗せ可能。', gl: 'JSH2025' });
    recs.push({ severity: 'high', action: 'consider', drug: 'ニフェジピン徐放', dose: 'アダラートCR 20-40mg/日',
      reason: '妊娠HT 第二選択 (CCB)。', gl: 'JSH2025' });
    return recs;
  }

  if (cl.sbp_range === '180+' || grade === 'grade3') {
    recs.push({ severity: 'critical', action: 'urgent',
      reason: 'SBP≥180/grade III HT。眼底/蛋白尿/意識/胸痛で臓器障害確認、要なら救急。',
      gl: 'JSH2025' });
  }

  // 痛風×サイアザイド警告
  if (hasThiazide && (ph.cm_gout || ch.gout_attack)) {
    recs.push({ severity: 'critical', action: 'switch',
      drug: 'ロサルタン (尿酸軽度低下作用)', dose: '50-100mg/日',
      reason: 'サイアザイドは痛風増悪。ロサルタンへ切替が JSH2025 推奨。',
      gl: 'JSH2025', sharedClass: 'ARB' });
  }

  // 第1選択推奨
  if (drugCount === 0) {
    if (tier === 'low' && grade === 'grade1') {
      recs.push({ severity: 'medium', action: 'lifestyle_first',
        reason: '低リスク I度HTは生活改善 1ヶ月 trial 後に再評価。減塩6g/日・有酸素150分/週・減量。',
        gl: 'JSH2025', sharedClass: 'Lifestyle' });
    }
    recs.push({ severity: 'high', action: 'start', drug: 'ARB単剤',
      dose: 'アジルバ20mg/日 or ロサルタン50mg/日',
      reason: '第一選択 (心保護・腎保護・代謝中性)。',
      gl: 'JSH2025 Step 1', sharedClass: 'ARB' });
    recs.push({ severity: 'high', action: 'start', drug: 'CCB単剤',
      dose: 'アムロジピン5mg/日',
      reason: '第一選択代替 (高齢者・脳卒中既往で実績)。',
      gl: 'JSH2025 Step 1', sharedClass: 'CCB' });
    if (grade === 'grade2' || grade === 'grade3') {
      recs.push({ severity: 'high', action: 'start', drug: 'ARB+CCB併用 (合剤)',
        dose: 'ザクラスHD (アジルバ20+アムロジピン5)',
        reason: 'II-III度HTは併用先行が効率的。合剤でアドヒアランス向上。',
        gl: 'JSH2025 Step 2', sharedClass: 'ARB' });
    }
  }

  // 単剤未達
  if (drugCount === 1 && (tier === 'high' || tier === 'medium' || grade === 'grade2' || grade === 'grade3')) {
    if (hasArb && !hasCcb) {
      recs.push({ severity: 'high', action: 'add', drug: 'CCB追加',
        dose: 'アムロジピン 5mg/日',
        reason: 'ARB単剤未達 → CCB併用 (ARB+CCB は標準2剤)。',
        gl: 'JSH2025 Step 2', sharedClass: 'CCB' });
      recs.push({ severity: 'medium', action: 'titrate_up', drug: 'ARB増量',
        dose: 'アジルバ 20mg → 40mg/日',
        reason: '最大量未達なら増量も同等推奨 (JSH2025: 増量と併用は同等)。',
        gl: 'JSH2025', sharedClass: 'ARB' });
    } else if (hasCcb && !hasArb) {
      recs.push({ severity: 'high', action: 'add', drug: 'ARB追加',
        dose: 'アジルバ 20mg/日',
        reason: 'CCB単剤未達 → ARB併用が標準。',
        gl: 'JSH2025 Step 2', sharedClass: 'ARB' });
    }
  }

  // 多剤併用での MRA 追加
  if (drugCount >= 3 && !hasMra && (tier === 'high' || grade === 'grade2' || grade === 'grade3')) {
    recs.push({ severity: 'high', action: 'add', drug: 'MRA追加 (治療抵抗性)',
      dose: 'スピロノラクトン 25mg/日 (K monitor)',
      reason: '3剤で未達ならMRAが第4選択。治療抵抗性HTは二次性HT精査も。',
      gl: 'JSH2025', sharedClass: 'MRA' });
  }

  // 利尿薬追加
  if (drugCount >= 2 && !hasThiazide && !ph.cm_gout && (tier === 'high' || grade === 'grade2' || grade === 'grade3')) {
    recs.push({ severity: 'medium', action: 'add', drug: '利尿薬追加',
      dose: 'トリクロルメチアジド 0.5mg/日 (低用量、JSH2025推奨)',
      reason: '2剤未達で利尿薬の追加 (ARB+CCB+利尿薬は標準3剤)。',
      gl: 'JSH2025 Step 3', sharedClass: 'Diuretic' });
  }

  // CKD G4-5 併存
  if (ph.cm_ckd_g45 && !hasArb && !hasAcei) {
    recs.push({ severity: 'high', action: 'add', drug: 'ARB (CKD進行抑制)',
      dose: 'ロサルタン 25mg/日 (G4-5は低用量導入)',
      reason: 'CKD進行抑制でARB必須。Cr 30%以内上昇は許容、K monitor。',
      gl: 'KDIGO 2024 / JSH2025', sharedClass: 'ARB' });
  }

  // DM併存 → SGLT2i 連携
  if (ph.cm_dm) {
    recs.push({ severity: 'medium', action: 'consider_other_disease',
      drug: 'SGLT2i併用 (DM治療側で)', dose: 'ジャディアンス 10mg/日',
      reason: 'DM併存HTで SGLT2i は心腎保護を強化。HT薬とは別レイヤー。',
      gl: 'JSH2025 / KDIGO 2024', sharedClass: 'SGLT2i' });
  }

  // 生活指導
  recs.push({ severity: 'low', action: 'lifestyle',
    reason: '減塩 6g/日未満・DASH食・有酸素150分/週・減量・節酒・禁煙。SBP -5〜10 mmHg期待。',
    gl: 'JSH2025', sharedClass: 'Lifestyle' });

  // コントロール良好
  if (tier === 'low' && drugCount > 0) {
    recs.push({ severity: 'low', action: 'maintain',
      reason: '良好。家庭BP記録継続、3-6ヶ月後再評価。',
      gl: 'JSH2025' });
  }

  return recs;
}

// ============================================================
// DLP 治療提案 (拡充: 8-10案)
// ============================================================
function suggestDlp(ctx) {
  const { patientHeader: ph, commonLabs: cl, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});

  if (ph.co_pregnancy || ph.co_pregnancy_planning || ph.co_lactation) {
    recs.push({ severity: 'critical', action: 'stop',
      reason: '妊娠/挙児希望/授乳中はスタチン・フィブラート・PCSK9i禁忌。即時中止。',
      gl: 'JAS2022', sharedClass: 'pregnancy' });
    recs.push({ severity: 'medium', action: 'consider', drug: 'コレスチミド (妊娠時選択肢)',
      dose: 'コレバイン 1.5g×3/日',
      reason: '胆汁酸吸着薬は妊娠中も使用可。',
      gl: 'JAS2022' });
    return recs;
  }

  // 高TG → 膵炎優先
  if (cl.tg_range === '1000+') {
    recs.push({ severity: 'critical', action: 'urgent',
      reason: 'TG≥1000 急性膵炎切迫。即日精査・絶食・補液検討。',
      gl: 'JAS2022' });
  }
  if (cl.tg_range === '500-999' || cl.tg_range === '1000+') {
    recs.push({ severity: 'high', action: 'start', drug: 'ペマフィブラート',
      dose: 'パルモディア 0.2mg×2/日',
      reason: 'TG≥500は膵炎予防でフィブラート第一。スタチン併用時はペマ推奨。',
      gl: 'JAS2022', sharedClass: 'Fibrate' });
    recs.push({ severity: 'medium', action: 'add', drug: 'EPA',
      dose: 'エパデール 1800mg/日',
      reason: 'TG低下補助 (JELIS試験)。',
      gl: 'JAS2022' });
  }

  const ldlTarget = scoreResult?.ldlTarget;
  const tier = scoreResult?.tier;
  const ldlMap = { '<70': 65, '70-99': 85, '100-119': 110, '120-139': 130, '140-159': 150, '160-179': 170, '180+': 200 };
  const currentLdl = ldlMap[cl.ldl_range];
  const drugCount = drugIds.length;
  const hasAnyStatin = drugIds.some((id) => id.startsWith('dlp_statin'));
  const hasHighStatin = drugIds.includes('dlp_statin_high');
  const hasMidStatin = drugIds.includes('dlp_statin_mid');
  const hasEze = drugIds.includes('dlp_eze');
  const hasPcsk9 = drugIds.includes('dlp_pcsk9');

  if (ph.cm_fh && !hasHighStatin) {
    recs.push({ severity: 'high', action: 'start', drug: 'ロスバスタチン (高強度)',
      dose: 'クレストール 10-20mg/日 + 家族カスケードスクリーニング',
      reason: 'FHは early aggressive statin therapy が GL推奨。',
      gl: 'JAS2022 / JFH GL', sharedClass: 'Statin' });
  }

  if (ldlTarget && currentLdl) {
    if (currentLdl > ldlTarget + 20) {
      if (drugCount === 0) {
        if (tier === 'very_high' || ph.cm_ascvd) {
          recs.push({ severity: 'high', action: 'start', drug: 'ロスバスタチン (高強度)',
            dose: 'クレストール 10mg/日 (二次予防 LDL <70)',
            reason: `二次予防/超高リスク → 高強度スタチンで強力LDL低下。目標 <${ldlTarget}。`,
            gl: 'JAS2022', sharedClass: 'Statin' });
          recs.push({ severity: 'high', action: 'start', drug: 'アトルバスタチン (高強度代替)',
            dose: 'リピトール 40mg/日',
            reason: '高強度スタチンの代替。`atorvastatin`は CYP3A4 相互作用注意。',
            gl: 'JAS2022', sharedClass: 'Statin' });
        } else {
          recs.push({ severity: 'high', action: 'start', drug: 'ピタバスタチン (中強度)',
            dose: 'リバロ 2mg/日',
            reason: `LDL目標 <${ldlTarget} 未達。中強度スタチン開始 (LDL 約30-40%低下)。`,
            gl: 'JAS2022', sharedClass: 'Statin' });
          recs.push({ severity: 'medium', action: 'start', drug: 'プラバスタチン (低強度、肝障害例)',
            dose: 'メバロチン 10mg/日',
            reason: '中強度に懸念がある場合の低強度選択。',
            gl: 'JAS2022', sharedClass: 'Statin' });
        }
      } else if (hasAnyStatin && !hasHighStatin && hasMidStatin) {
        recs.push({ severity: 'high', action: 'titrate_up', drug: '高強度スタチンへ増量',
          dose: 'ロスバスタチン 10-20mg/日 or アトルバスタチン 40mg/日',
          reason: '中強度スタチンで未達 → 高強度へ。LDL 追加20-30%低下期待。',
          gl: 'JAS2022', sharedClass: 'Statin' });
      }
      if (hasAnyStatin && !hasEze) {
        recs.push({ severity: 'high', action: 'add', drug: 'エゼチミブ',
          dose: 'ゼチーア 10mg/日 追加',
          reason: 'スタチンに加え LDL 約20%追加低下 (相加効果)。',
          gl: 'JAS2022' });
      }
      if (hasAnyStatin && hasEze && !hasPcsk9 && (tier === 'very_high' || ph.cm_ascvd)) {
        recs.push({ severity: 'medium', action: 'consider', drug: 'PCSK9阻害薬',
          dose: 'エボロクマブ 140mg SC 2週毎',
          reason: 'スタチン最大 + エゼチミブでも未達。二次予防+LDL未達で保険適応。',
          gl: 'JAS2022' });
      }
    } else if (currentLdl <= ldlTarget) {
      recs.push({ severity: 'low', action: 'maintain',
        reason: `LDL目標 <${ldlTarget} 達成。現治療継続、3-6ヶ月後再評価。`,
        gl: 'JAS2022' });
    } else {
      recs.push({ severity: 'medium', action: 'watch',
        reason: `目標 <${ldlTarget} に近接 (現${currentLdl}前後)。生活指導継続+次回再評価。`,
        gl: 'JAS2022' });
    }
  }

  // 生活指導
  recs.push({ severity: 'low', action: 'lifestyle',
    reason: '飽和脂肪酸<7%E、トランス脂肪ゼロ、魚 週2回、植物ステロール 2g/日。有酸素 週200-300分。',
    gl: 'JAS2022', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// T2DM 治療提案 (拡充: 8-10案)
// ============================================================
function suggestT2dm(ctx) {
  const { patientHeader: ph, commonLabs: cl, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const hba1c = cl.hba1c_range;

  if (ph.co_pregnancy) {
    recs.push({ severity: 'critical', action: 'switch', drug: 'インスリン',
      reason: '妊娠中は経口薬全面禁忌。インスリンへ即時切替し産科+糖尿病専門医併診。',
      gl: 'JDS2024 妊娠DM', sharedClass: 'pregnancy' });
    return recs;
  }

  if (hba1c === '10+') {
    recs.push({ severity: 'critical', action: 'urgent',
      drug: 'インスリン即時導入', dose: 'basal 0.1-0.2U/kg就寝前',
      reason: 'HbA1c≥10% は症候性高血糖の可能性。糖尿病内科紹介+ケトン症状警告。',
      gl: 'JDS2024' });
  }

  const hasMet = drugIds.includes('dm_met');
  const hasSglt2 = drugIds.includes('dm_sglt2');
  const hasGlp1 = drugIds.includes('dm_glp1');
  const hasDpp4 = drugIds.includes('dm_dpp4');
  const hasSu = drugIds.includes('dm_su');
  const drugCount = drugIds.length;

  // ASCVD/HF併存 → SGLT2i/GLP-1RA
  if ((ph.cm_ascvd || ph.cm_chf) && !hasSglt2) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬',
      dose: 'ジャディアンス 10mg/日 or フォシーガ 10mg/日',
      reason: 'ASCVD/HF併存DMは SGLT2i 第一級推奨 (心血管死・HF入院低下)。',
      gl: 'JDS2024 / KDIGO 2024', sharedClass: 'SGLT2i' });
  }
  if ((ph.cm_ascvd || cl.bmi_range === '30-34' || cl.bmi_range === '35+') && !hasGlp1) {
    recs.push({ severity: 'high', action: 'add', drug: 'GLP-1RA',
      dose: 'オゼンピック 0.5mg SC週1 or リベルサス 7mg/日',
      reason: 'ASCVD/肥満DMで MACE低下+体重減。',
      gl: 'JDS2024', sharedClass: 'GLP-1RA' });
  }

  // CKD併存
  if (ph.cm_ckd_g45) {
    if (!hasSglt2) {
      recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬 (CKD)',
        dose: 'ダパグリフロジン 10mg/日 (eGFR 25以上)',
        reason: 'CKD G4-5でも SGLT2i は腎保護効果あり。',
        gl: 'KDIGO 2024', sharedClass: 'SGLT2i' });
    }
    if (!hasDpp4) {
      recs.push({ severity: 'medium', action: 'add', drug: 'DPP-4i (リナグリプチン、用量調整不要)',
        dose: 'トラゼンタ 5mg/日',
        reason: 'CKD G3-G5 で胆汁排泄・用量調整不要。SGLT2i禁忌時の代替。',
        gl: 'JDS2024', sharedClass: 'DPP-4i' });
    }
  }

  // 一般推奨
  if (drugCount === 0 && (hba1c === '6.5-6.9' || hba1c === '7.0-7.9' || hba1c === '8.0-9.9')) {
    recs.push({ severity: 'high', action: 'start', drug: 'メトホルミン',
      dose: 'メトグルコ 500mg×2/日 (eGFR≥45なら漸増、<30禁忌)',
      reason: 'T2DM第一選択。',
      gl: 'JDS2024', sharedClass: 'Metformin' });
    if (cl.bmi_range === '25-29' || cl.bmi_range === '30-34' || cl.bmi_range === '35+') {
      recs.push({ severity: 'high', action: 'start', drug: 'メトホルミン+SGLT2i (肥満DM)',
        dose: 'メトホルミン + ジャディアンス 10mg',
        reason: '肥満DMは早期 SGLT2i 併用で体重減・心腎保護。',
        gl: 'JDS2024', sharedClass: 'SGLT2i' });
    }
  } else if (hasMet && drugCount === 1 && (hba1c === '7.0-7.9' || hba1c === '8.0-9.9')) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬',
      reason: 'メトホルミン単剤未達。心腎保護を併せ持つ SGLT2i 第一。',
      gl: 'JDS2024', sharedClass: 'SGLT2i' });
    recs.push({ severity: 'high', action: 'add', drug: 'GLP-1RA (肥満時)',
      reason: '体重減を狙う場合 GLP-1RA。',
      gl: 'JDS2024', sharedClass: 'GLP-1RA' });
    recs.push({ severity: 'medium', action: 'add', drug: 'DPP-4i (低血糖回避)',
      reason: '高齢・低血糖リスク高い場合の選択肢。',
      gl: 'JDS2024', sharedClass: 'DPP-4i' });
  } else if (hasSu && (hba1c === '<5.6' || hba1c === '5.6-5.9')) {
    recs.push({ severity: 'medium', action: 'taper', drug: 'SU減量',
      reason: '過降下リスク (HbA1c<6.0+SU)。低血糖無自覚に警戒、SU→DPP-4iへ切替検討。',
      gl: 'JDS2024' });
  }

  if (drugCount > 0 && (hba1c === '6.5-6.9' || hba1c === '<5.6')) {
    recs.push({ severity: 'low', action: 'maintain',
      reason: 'コントロール良好。3ヶ月後再評価。',
      gl: 'JDS2024' });
  }

  // 生活指導
  recs.push({ severity: 'low', action: 'lifestyle',
    reason: 'カロリー 25-30kcal/標準体重kg、糖質制限、有酸素 週150-200分+レジスタンス。食後10-15分歩行。',
    gl: 'JDS2024', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// CKD 治療提案 (拡充)
// ============================================================
function suggestCkd(ctx) {
  const { patientHeader: ph, commonLabs: cl, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const gStage = scoreResult?.gStage;
  const aStage = scoreResult?.aStage;

  if (ph.co_pregnancy && drugIds.some((id) => ['ckd_arb', 'ckd_sglt2'].includes(id))) {
    recs.push({ severity: 'critical', action: 'stop',
      reason: '妊娠中ARB/ACEi/SGLT2i禁忌。即時中止、メチルドパ等へ切替。',
      gl: 'KDIGO 2024', sharedClass: 'pregnancy' });
    return recs;
  }

  if ((gStage === 'G3a' || gStage === 'G3b' || gStage === 'G4') && !drugIds.includes('ckd_arb')) {
    recs.push({ severity: 'high', action: 'start', drug: 'ARB',
      dose: 'ロサルタン 50mg/日 (G3b-G4は 25mg開始)',
      reason: '蛋白尿/HT併存CKDの第一選択。Cr 30%以内上昇は許容、K monitor。',
      gl: 'KDIGO 2024', sharedClass: 'ARB' });
  }
  if ((gStage === 'G2' || gStage === 'G3a' || gStage === 'G3b' || gStage === 'G4') && !drugIds.includes('ckd_sglt2')) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬',
      dose: 'ダパグリフロジン 10mg/日 (eGFR ≥25で開始)',
      reason: 'KDIGO 2024 強推奨 (DAPA-CKD/EMPA-KIDNEY: eGFR 30-40%抑制)。DM有無問わず。',
      gl: 'KDIGO 2024', sharedClass: 'SGLT2i' });
  }

  // フィネレノン
  if (ph.cm_dm && (gStage === 'G3a' || gStage === 'G3b') && (aStage === 'A2' || aStage === 'A3')) {
    recs.push({ severity: 'medium', action: 'add', drug: 'フィネレノン',
      dose: 'ケレンディア 10-20mg/日',
      reason: 'DM併存CKD (蛋白尿あり) で eGFR低下抑制 (FIDELITY)。K monitor必須。',
      gl: 'KDIGO 2024', sharedClass: 'MRA-ns' });
  }

  // K上昇リスク
  const kRiseDrugs = drugIds.filter((id) => ['ckd_arb', 'ckd_finerenone', 'ht_mra', 'hf_mra', 'ht_arni', 'hf_arni'].includes(id));
  if (kRiseDrugs.length >= 2 && (cl.k_range === '5.1-5.4' || cl.k_range === '5.5+')) {
    recs.push({ severity: 'high', action: 'monitor',
      reason: `K上昇方向の薬剤 ${kRiseDrugs.length}種使用 + K ${cl.k_range}。1-2週後再検、必要時K吸着薬追加。`,
      gl: 'KDIGO 2024' });
    recs.push({ severity: 'medium', action: 'add', drug: 'K吸着薬',
      dose: 'ロケルマ 5g/日 or カリメート 5g×2-3/日',
      reason: 'K>5.5でK吸着薬追加。RAS阻害薬を続けるための補助。',
      gl: 'KDIGO 2024' });
  }

  // 貧血
  recs.push({ severity: 'low', action: 'consider', drug: 'HIF-PHD/ESA (貧血併存時)',
    dose: 'ロキサデュスタット 70mg×3/週 or ダルベポエチン 30μg SC 2週毎',
    reason: 'CKD G3b以降+Hb<11で腎性貧血治療。',
    gl: 'KDIGO 2024' });

  // アシドーシス
  recs.push({ severity: 'low', action: 'consider', drug: '重曹',
    dose: '炭酸水素Na 1500mg/日 (3包分3)',
    reason: 'HCO3≤22 で代謝性アシドーシス補正。',
    gl: 'KDIGO 2024' });

  // G5
  if (gStage === 'G5') {
    recs.push({ severity: 'critical', action: 'refer',
      reason: 'G5 (eGFR<15) は腎代替療法 (透析・移植) の準備。腎臓内科早期紹介。',
      gl: 'KDIGO 2024' });
  }

  recs.push({ severity: 'low', action: 'lifestyle',
    reason: 'G3a 蛋白 0.8-1.0g/kg、G3b-4 0.6-0.8g/kg。塩分<6g/日、K制限 (G3b≤2000mg)、リン制限 (G4-5≤1000mg)。',
    gl: 'KDIGO 2024', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// AF 治療提案 (拡充)
// ============================================================
function suggestAf(ctx) {
  const { patientHeader: ph, commonLabs: cl, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const cha2ds = scoreResult?.chadsvasc;
  const hasbled = scoreResult?.hasbled;
  const hasDoac = drugIds.some((id) => id.startsWith('af_doac_'));
  const hasWarfarin = drugIds.includes('af_warfarin');
  const hasBb = drugIds.includes('af_bb');

  if (cha2ds?.anticoag === 'recommend' && !hasDoac && !hasWarfarin) {
    let dose = 'エリキュース 5mg×2/日 (高齢/低体重/Cr上昇の2項目該当時は2.5mg×2)';
    if (cl.egfr_range === '15-29') dose = 'リクシアナ 30mg/日 (CrCl低下)';
    recs.push({ severity: 'high', action: 'start', drug: 'DOAC: アピキサバン (第一選択)',
      dose, reason: `CHA₂DS₂-VASc=${cha2ds.score}点で抗凝固推奨 (HAS-BLED=${hasbled?.score})。`,
      gl: 'JCS2020-AF / ESC 2020', sharedClass: 'DOAC' });
    recs.push({ severity: 'high', action: 'start', drug: 'DOAC: リバーロキサバン',
      dose: 'イグザレルト 15mg/日 (CrCl 30-49なら10mg)',
      reason: '1日1回投与、食事と共に服用。',
      gl: 'JCS2020-AF', sharedClass: 'DOAC' });
    recs.push({ severity: 'high', action: 'start', drug: 'DOAC: エドキサバン',
      dose: 'リクシアナ 60mg/日 (CrCl 15-50/低体重で30mg)',
      reason: '1日1回投与、低用量設定が明確。',
      gl: 'JCS2020-AF', sharedClass: 'DOAC' });
    recs.push({ severity: 'medium', action: 'consider', drug: 'DOAC: ダビガトラン',
      dose: 'プラザキサ 110mg×2 or 150mg×2',
      reason: '消化管出血少ない選択肢。CrCl<30禁忌。',
      gl: 'JCS2020-AF', sharedClass: 'DOAC' });
  }

  if (hasbled?.tier === 'high') {
    recs.push({ severity: 'high', action: 'caution',
      reason: `HAS-BLED=${hasbled.score} (高出血リスク)。BP制御・NSAID/アルコール最小化・PPI併用検討。`,
      gl: 'JCS2020-AF' });
  }

  // レート制御
  if (!hasBb && drugIds.length > 0) {
    recs.push({ severity: 'medium', action: 'add', drug: 'β遮断薬 (レート制御)',
      dose: 'ビソプロロール 2.5mg/日',
      reason: 'AFのレート制御は β遮断薬が第一。心拍数 <110目標。',
      gl: 'JCS2020-AF', sharedClass: 'BB' });
    recs.push({ severity: 'medium', action: 'consider', drug: '非DHP系CCB (HFrEF禁)',
      dose: 'ベラパミル 120mg/日 or ジルチアゼム 90mg/日',
      reason: 'β遮断不可・喘息併存時のレート制御代替。HFrEFには禁忌。',
      gl: 'JCS2020-AF', sharedClass: 'CCB' });
  }

  // リズム制御
  recs.push({ severity: 'low', action: 'consider', drug: 'リズム制御 (専門医)',
    dose: 'アミオダロン 200mg/日 維持',
    reason: '症状強い AF・カテーテルアブレーション候補は専門医併診。',
    gl: 'JCS2020-AF' });

  return recs;
}

// ============================================================
// HF (統合)
// ============================================================
function suggestHf(ctx) {
  const { selection, scoreResult } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const ef = scoreResult?.ef;
  const hasArni = drugIds.includes('hf_arni');
  const hasBb = drugIds.includes('hf_bb');
  const hasMra = drugIds.includes('hf_mra');
  const hasSglt2 = drugIds.includes('hf_sglt2');
  const hasLoop = drugIds.includes('hf_loop');

  if (!ef || ef === 'unknown') {
    recs.push({ severity: 'critical', action: 'urgent',
      reason: 'EF未測定。心エコーで EF測定が最優先 (HFrEF/HFmrEF/HFpEF で治療が大きく異なる)。',
      gl: 'JCS2024' });
    return recs;
  }

  if (ef === 'reduced') {
    if (!hasArni) recs.push({ severity: 'high', action: 'start', drug: 'ARNI',
      dose: 'エンレスト 100mg×2/日 (低BPなら50mg×2、目標200mg×2)',
      reason: 'HFrEF 4本柱の核。死亡率20%低下 (PARADIGM-HF)。', gl: 'JCS2024', sharedClass: 'ARNI' });
    if (!hasBb) recs.push({ severity: 'high', action: 'start', drug: 'β遮断薬',
      dose: 'カルベジロール 1.25mg×2/日 (HF開始量、漸増)',
      reason: 'HFrEF 4本柱。死亡率改善エビデンス多数。', gl: 'JCS2024', sharedClass: 'BB' });
    if (!hasMra) recs.push({ severity: 'high', action: 'start', drug: 'MRA',
      dose: 'スピロノラクトン 25mg/日 (K monitor)',
      reason: 'HFrEF 4本柱。RALES試験で予後改善。', gl: 'JCS2024', sharedClass: 'MRA' });
    if (!hasSglt2) recs.push({ severity: 'high', action: 'start', drug: 'SGLT2阻害薬',
      dose: 'フォシーガ or ジャディアンス 10mg/日',
      reason: 'HFrEF 4本柱。DAPA-HF/EMPEROR-Reduced で予後改善。', gl: 'JCS2024', sharedClass: 'SGLT2i' });
    if (!hasLoop) recs.push({ severity: 'medium', action: 'consider', drug: 'ループ利尿薬',
      dose: 'フロセミド 20-40mg/日 (うっ血症状あれば)',
      reason: 'うっ血症状緩和は症状管理として標準。', gl: 'JCS2024' });
    recs.push({ severity: 'low', action: 'consider', drug: 'イバブラジン (HR≥75時)',
      dose: 'コララン 5mg×2/日',
      reason: 'β遮断薬最大量でHR≥75残るならHF入院低下 (SHIFT)。', gl: 'JCS2024' });
  } else if (ef === 'preserved') {
    if (!hasSglt2) recs.push({ severity: 'high', action: 'start', drug: 'SGLT2阻害薬',
      dose: 'ダパグリフロジン 10mg/日 or エンパグリフロジン 10mg/日',
      reason: 'HFpEF全例で第一選択。EMPEROR-Preserved/DELIVER (HR ~0.79)。', gl: 'JCS2024', sharedClass: 'SGLT2i' });
    if (!hasLoop) recs.push({ severity: 'medium', action: 'consider', drug: 'ループ利尿薬',
      dose: 'フロセミド 20mg/日',
      reason: 'うっ血症状緩和。', gl: 'JCS2024' });
    recs.push({ severity: 'medium', action: 'consider', drug: 'MRA (個別)',
      dose: 'スピロノラクトン 12.5-25mg/日',
      reason: 'TOPCAT試験で限定的、症状/再入院多い症例で考慮。', gl: 'JCS2024', sharedClass: 'MRA' });
    recs.push({ severity: 'low', action: 'consider', drug: 'ARB (HT併存)',
      dose: 'ロサルタン 50-100mg/日',
      reason: 'HT併存時は ARB追加。', gl: 'JCS2024', sharedClass: 'ARB' });
  } else if (ef === 'mid_range') {
    if (!hasSglt2) recs.push({ severity: 'high', action: 'start', drug: 'SGLT2阻害薬',
      dose: 'ダパグリフロジン 10mg/日',
      reason: 'HFmrEF (EF 41-49%) で SGLT2i 推奨。', gl: 'JCS2024', sharedClass: 'SGLT2i' });
    if (!hasArni) recs.push({ severity: 'medium', action: 'consider', drug: 'ARNI',
      reason: 'HFmrEF 症状重い症例で HFrEF類似管理を検討。', gl: 'JCS2024', sharedClass: 'ARNI' });
    if (!hasBb) recs.push({ severity: 'medium', action: 'consider', drug: 'β遮断薬',
      reason: 'HFmrEF 症状重い症例で予後改善期待。', gl: 'JCS2024', sharedClass: 'BB' });
    if (!hasMra) recs.push({ severity: 'medium', action: 'consider', drug: 'MRA',
      reason: 'HFmrEF 個別判断。', gl: 'JCS2024', sharedClass: 'MRA' });
  }

  recs.push({ severity: 'low', action: 'lifestyle',
    reason: '塩分 <2-3g/日 (HFrEF重症)、水分 <1.5-2L/日、アルコール禁、毎日体重測定 (+2kg=利尿薬trigger)、心リハ。',
    gl: 'JCS2024', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// 喘息 (GINA Step 1-5、現在Step → 移行先 を明示)
// ============================================================
function suggestAsthma(ctx) {
  const { selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const hasMart = drugIds.includes('as_ics_laba_mart');
  const hasIcs = drugIds.includes('as_ics');
  const hasLama = drugIds.includes('as_lama');
  const hasTriple = drugIds.includes('as_triple');
  const hasBio = drugIds.includes('as_biologic');
  const hasLtra = drugIds.includes('as_ltra');
  const hasOcs = drugIds.includes('as_ocs');

  // 現在の Step 推定 (GINA 2024 Track 1 ベース)
  let currentStep = '未治療';
  if (hasBio) currentStep = 'Step 5 (生物学的製剤)';
  else if (hasTriple) currentStep = 'Step 4-5 (Triple)';
  else if (hasMart && hasLama) currentStep = 'Step 4 (ICS-LABA + LAMA)';
  else if (hasMart) currentStep = 'Step 3 (ICS-formoterol SMART 中用量) または Step 1-2 (低用量)';
  else if (hasIcs) currentStep = 'Step 2 (ICS単剤、Track 2)';

  const concernsBase = '吸入手技 (Teach-back)・アドヒアランス・併存症 (GERD/アレルギー性鼻炎/肥満/OSAS/喫煙) を再確認。"見かけ上uncontrolled"の50-70%は上記が原因。';

  if (drugIds.length === 0) {
    recs.push({ severity: 'high', action: 'start',
      drug: '【現在: 未治療 → Step 1-2 へ GO】 as-needed ICS-formoterol (Track 1 / AIR)',
      dose: 'シムビコート 1吸入 症状時 (Maintenance不要・症状時のみ)',
      reason: 'GINA 2024 軽症: ICS-formoterol を症状時 reliever 兼用が preferred。SABA単独は死亡リスクで非推奨。',
      gl: 'GINA 2024 Track 1 Step 1-2',
      concerns: '懸念点: 吸入手技指導が必要 (デバイス慣れ)・症状時のみで定期使用なし→アドヒアランス課題あり。',
      sharedClass: 'ICS-LABA' });
    recs.push({ severity: 'medium', action: 'alternative',
      drug: '【代替: Step 1-2 Track 2】 ICS低用量+SABA頓用',
      dose: 'フルタイド 50μg×2/日 + メプチン 頓用',
      reason: 'Track 1 が困難な場合の代替。', gl: 'GINA 2024 Track 2 Step 1-2',
      concerns: '懸念点: SABA過使用 (年≥3 canister) は死亡リスク増。' });
    recs.push({ severity: 'medium', action: 'consider', drug: 'LTRA併用 (鼻炎/AERD併存)',
      dose: 'モンテルカスト 10mg夜',
      reason: 'アレルギー性鼻炎/AERD併存例で ICS補助。', gl: 'GINA 2024',
      concerns: '神経精神症状 (悪夢・うつ) を稀に報告。' });
  } else if (hasMart && !hasLama && !hasTriple) {
    recs.push({ severity: 'high', action: 'titrate_up',
      drug: `【現在: ${currentStep} → Step 3-4 へ GO】 ICS-formoterol を中用量へ増量`,
      dose: 'シムビコート 2吸入×2/日 + 症状時',
      reason: 'GINA 2024 Step 3-4: SMART療法で中用量へ増量、約70%でコントロール達成。',
      gl: 'GINA 2024 Track 1 Step 3-4',
      concerns: `懸念点: ${concernsBase} 増量前に吸入手技を Teach-back で必ず確認。`,
      sharedClass: 'ICS-LABA' });
    recs.push({ severity: 'medium', action: 'add',
      drug: `【現在: ${currentStep} → Step 4 へ GO】 LAMA追加 (Triple化)`,
      dose: 'スピリーバ レスピマット 2.5μg×2吸入/日',
      reason: 'ICS-LABA未達ならStep 4でLAMA追加。',
      gl: 'GINA 2024 Step 4',
      concerns: '懸念点: 緑内障・前立腺肥大で慎重。3デバイス→単吸入Triple化で アドヒアランス向上検討。' });
    if (!hasLtra) {
      recs.push({ severity: 'medium', action: 'add',
        drug: '【補助: 鼻炎/AERD併存時】 LTRA追加',
        dose: 'モンテルカスト 10mg夜',
        reason: 'アレルギー鼻炎・運動誘発喘息で LTRA補助。', gl: 'GINA 2024',
        concerns: '神経精神症状 (悪夢・うつ) 稀。' });
    }
  } else if (hasTriple && !hasBio) {
    recs.push({ severity: 'high', action: 'consider',
      drug: `【現在: ${currentStep} → Step 5 へ GO】 生物学的製剤: アンチIgE (オマリズマブ)`,
      dose: '体重・IgE別 SC 2-4週毎',
      reason: 'アレルギー型 (IgE高/atopy多種) → omalizumab。',
      gl: 'GINA 2024 Step 5',
      concerns: '懸念点: 高額・アナフィラキシー稀・専門医導入必須。導入前に Type 2 表現型評価 (eos/FeNO/IgE)。',
      sharedClass: 'Biologic' });
    recs.push({ severity: 'high', action: 'consider',
      drug: `【現在: ${currentStep} → Step 5 へ GO】 生物学的製剤: アンチIL-5 (メポ/ベンラ)`,
      dose: 'メポリズマブ 100mg SC 4週毎 / ベンラリズマブ 30mg SC 8週毎',
      reason: '好酸球性 (eos≥300) → mepolizumab/benralizumab。',
      gl: 'GINA 2024 Step 5',
      concerns: '懸念点: eos値で適応判断、専門医導入。',
      sharedClass: 'Biologic' });
    recs.push({ severity: 'high', action: 'consider',
      drug: `【現在: ${currentStep} → Step 5 へ GO】 生物学的製剤: アンチIL-4/13 (デュピルマブ)`,
      dose: 'デュピクセント 300mg SC 2週毎',
      reason: 'アトピー/鼻茸/AERD/OCS依存 → dupilumab最適応 (蕁麻疹・アトピーにも効果)。',
      gl: 'GINA 2024 Step 5',
      concerns: '懸念点: 結膜炎・好酸球一過性上昇。',
      sharedClass: 'Biologic' });
    recs.push({ severity: 'high', action: 'consider',
      drug: `【現在: ${currentStep} → Step 5 へ GO】 生物学的製剤: アンチTSLP (テゼペルマブ)`,
      dose: 'テゼスパイア 210mg SC 4週毎',
      reason: 'T2-low含む全表現型に有効、最新選択肢 (NAVIGATOR試験)。',
      gl: 'GINA 2024 Step 5',
      concerns: '懸念点: 比較的新しい薬剤、長期データ蓄積中。',
      sharedClass: 'Biologic' });
    recs.push({ severity: 'medium', action: 'consider_alt',
      drug: '【代替: 生物学的製剤待機中】 OCS最小量 (短期)',
      dose: 'プレドニン 5-10mg/日',
      reason: '生物学的製剤導入待機中の症状コントロール。',
      gl: 'GINA 2024',
      concerns: '懸念点: 長期OCSは骨粗鬆症・糖尿病・白内障リスク。生物学的製剤導入後は離脱目標。' });
  } else if (hasIcs && !hasMart) {
    recs.push({ severity: 'medium', action: 'switch',
      drug: `【現在: ${currentStep} → Step 1-2 Track 1 へ GO】 ICS単剤 → ICS-formoterol SMART`,
      dose: 'フルタイド → シムビコート 2吸入×2 + 症状時',
      reason: 'Track 2 (ICS+SABA) より Track 1 (SMART) が GINA 2024 で preferred。',
      gl: 'GINA 2024',
      concerns: '懸念点: デバイス変更で手技再指導必要。',
      sharedClass: 'ICS-LABA' });
  }

  if (hasOcs) {
    recs.push({ severity: 'high', action: 'taper',
      drug: '【OCS依存からの離脱】 生物学的製剤導入 + OCS漸減',
      reason: '長期OCSは予後悪化。生物学的製剤導入で OCS離脱が GINA 2024 推奨。',
      gl: 'GINA 2024',
      concerns: '副腎不全に注意、急速中止禁止。漸減プロトコル必要。' });
  }

  recs.push({ severity: 'low', action: 'lifestyle',
    reason: `${concernsBase} 妊娠中はブデソニド優先 (リスクデータ最も多い)。AERD は NSAID完全回避。`,
    gl: 'GINA 2024', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// COPD 治療提案 (拡充)
// ============================================================
function suggestCopd(ctx) {
  const { commonHistory: ch, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const group = scoreResult?.group;

  if (group === 'A' && !drugIds.includes('copd_lama')) {
    recs.push({ severity: 'high', action: 'start', drug: 'LAMA単剤',
      dose: 'スピリーバ レスピマット 2.5μg×2吸入/日',
      reason: 'GOLD Group A は LAMA単剤推奨。', gl: 'GOLD 2024', sharedClass: 'LAMA' });
    recs.push({ severity: 'medium', action: 'alternative', drug: 'LAMA代替 (グリコピロニウム)',
      dose: 'シーブリ 50μg 1吸入/日',
      reason: '1日1回投与で簡便。', gl: 'GOLD 2024', sharedClass: 'LAMA' });
  }
  if (group === 'B' && !drugIds.includes('copd_lama_laba') && !drugIds.includes('copd_triple')) {
    recs.push({ severity: 'high', action: 'start', drug: 'LAMA/LABA合剤',
      dose: 'アノーロエリプタ 1吸入/日',
      reason: 'GOLD Group B は LAMA/LABA合剤推奨。', gl: 'GOLD 2024' });
    recs.push({ severity: 'medium', action: 'alternative', drug: 'LAMA/LABA代替',
      dose: 'スピオルト レスピマット 2吸入/日 or ウルティブロ 1吸入/日',
      reason: 'デバイス選択肢。', gl: 'GOLD 2024' });
  }
  if (group === 'E' && !drugIds.includes('copd_triple')) {
    recs.push({ severity: 'high', action: 'start', drug: 'Triple (ICS含)',
      dose: 'テリルジー 100エリプタ 1吸入/日',
      reason: 'GOLD Group E (頻回増悪) は Triple推奨、特に eos≥300/ACO併存時。',
      gl: 'GOLD 2024' });
    recs.push({ severity: 'medium', action: 'consider', drug: 'マクロライド少量長期 (頻回増悪)',
      dose: 'アジスロマイシン 250mg×3/週',
      reason: 'Triple使用でも頻回増悪継続なら考慮。QT延長注意。',
      gl: 'GOLD 2024' });
  }

  if (ch.smoking_current || ctx.patientHeader?.smoking === 'current') {
    recs.push({ severity: 'critical', action: 'lifestyle',
      reason: '禁煙が最優先 (FEV1低下抑制・予後改善)。バレニクリン/ニコチンパッチ/禁煙外来。',
      gl: 'GOLD 2024', sharedClass: 'Lifestyle' });
  }

  recs.push({ severity: 'medium', action: 'add', drug: '肺リハビリテーション',
    reason: 'mMRC≥2 で強推奨。運動耐容能・QOL改善。',
    gl: 'GOLD 2024' });

  recs.push({ severity: 'medium', action: 'lifestyle', drug: 'ワクチン一式',
    reason: 'インフル年1回・肺炎球菌・RSV・帯状疱疹・COVID-19。',
    gl: 'GOLD 2024' });

  return recs;
}

// ============================================================
// 痛風 治療提案 (拡充)
// ============================================================
function suggestGout(ctx) {
  const { patientHeader: ph, commonLabs: cl, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});

  if (ph.cm_ckd_g45) {
    if (drugIds.includes('gout_benzbromarone')) {
      recs.push({ severity: 'critical', action: 'switch',
        reason: 'CKD G4-5でベンズブロマロン禁忌。フェブキソスタットへ切替。',
        gl: 'JP痛風GL2022' });
    }
    if (drugIds.includes('gout_colchicine')) {
      recs.push({ severity: 'critical', action: 'reduce_or_stop',
        reason: 'CKD G4-5でコルヒチン禁忌級 (横紋筋融解・骨髄抑制死亡例)。',
        gl: 'JP痛風GL2022' });
    }
  }

  if (cl.egfr_range === '15-29' || cl.egfr_range === '<15') {
    if (drugIds.includes('gout_allopurinol')) {
      recs.push({ severity: 'high', action: 'titrate_down', drug: 'アロプリノール減量',
        dose: '50mg隔日まで減量、専門医併診',
        reason: 'eGFR<30で蓄積リスク。', gl: 'JP痛風GL2022' });
    }
    recs.push({ severity: 'high', action: 'switch', drug: 'フェブキソスタット (CKD推奨)',
      dose: 'フェブリク 10mg/日 開始、漸増 60mg',
      reason: 'eGFR<30で用量調整不要・安全性高い。', gl: 'JP痛風GL2022' });
  } else {
    if (drugIds.length === 0) {
      recs.push({ severity: 'high', action: 'start', drug: 'アロプリノール',
        dose: 'ザイロリック 100mg/日 (eGFR≥60、HLA-B*5801確認後)',
        reason: '尿酸生成抑制 第一選択。CARES試験ではアロプリ優先。',
        gl: 'JP痛風GL2022' });
      recs.push({ severity: 'medium', action: 'alternative', drug: 'フェブキソスタット (代替)',
        dose: 'フェブリク 10-40mg/日',
        reason: 'CV高リスクなら CARES に注意、それ以外は同等選択肢。',
        gl: 'JP痛風GL2022' });
    }
  }

  // 急性発作中
  if (ph.gout_acute_attack) {
    recs.push({ severity: 'high', action: 'urgent', drug: 'NSAID/コルヒチン/PSL',
      dose: 'ナイキサン 300mg×2×7日 / コルヒチン 1mg→0.5mg / プレドニン 30mg×5日',
      reason: '急性発作中。新規尿酸降下薬は厳禁、既服用は継続。',
      gl: 'JP痛風GL2022' });
  }

  recs.push({ severity: 'medium', action: 'consider', drug: 'コルヒチン予防',
    dose: '0.5mg/日 ×3-6ヶ月 (ULT開始期 flare予防)',
    reason: '尿酸降下薬開始時 flare予防。',
    gl: 'JP痛風GL2022' });

  recs.push({ severity: 'low', action: 'lifestyle',
    reason: 'プリン体食制限 (内臓・魚卵)、果糖控え、アルコール≤25g/日 (ビール特に控)、水分≥2L/日、減量月1-2kg。',
    gl: 'JP痛風GL2022', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// 動脈硬化 二次予防 (新設)
// ============================================================
function suggestAscvd2(ctx) {
  const { selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const hasAspirin = drugIds.includes('asc_aspirin');
  const hasClopi = drugIds.includes('asc_clopi');
  const hasStatin = drugIds.includes('asc_statin_high');
  const hasEze = drugIds.includes('asc_eze');
  const hasArb = drugIds.includes('asc_arb');
  const hasBb = drugIds.includes('asc_bb');

  if (!hasAspirin && !hasClopi) {
    recs.push({ severity: 'high', action: 'start', drug: '抗血小板薬: アスピリン',
      dose: 'バイアスピリン 100mg/日 + PPI併用',
      reason: '二次予防の基本。長期投与。', gl: 'JAS2022', sharedClass: 'Antiplatelet' });
    recs.push({ severity: 'high', action: 'start', drug: '抗血小板薬: クロピドグレル (PCI後DAPT or アスピリン不耐)',
      dose: 'プラビックス 75mg/日',
      reason: 'PCI後12ヶ月DAPT後にアスピリンへ単剤化、または不耐時の単独使用。',
      gl: 'JAS2022', sharedClass: 'Antiplatelet' });
  }
  if (!hasStatin) {
    recs.push({ severity: 'high', action: 'start', drug: 'スタチン高強度 (LDL <70)',
      dose: 'ロスバスタチン 10-20mg/日 or アトルバスタチン 40-80mg/日',
      reason: '二次予防LDL目標 <70。', gl: 'JAS2022', sharedClass: 'Statin' });
  }
  if (hasStatin && !hasEze) {
    recs.push({ severity: 'medium', action: 'add', drug: 'エゼチミブ追加',
      dose: 'ゼチーア 10mg/日',
      reason: 'スタチン+エゼチミブで LDL 約20%追加低下。', gl: 'JAS2022' });
  }
  if (!hasArb) {
    recs.push({ severity: 'medium', action: 'add', drug: 'ARB/ACEi (心保護)',
      dose: 'ロサルタン 50mg/日 or イミダプリル 5mg/日',
      reason: 'PCI後・MI後・低EFで適応。', gl: 'JAS2022', sharedClass: 'ARB' });
  }
  if (!hasBb) {
    recs.push({ severity: 'medium', action: 'add', drug: 'β遮断薬 (心保護)',
      dose: 'ビソプロロール 2.5mg/日',
      reason: 'MI後・低EFで予後改善。', gl: 'JAS2022', sharedClass: 'BB' });
  }

  recs.push({ severity: 'critical', action: 'lifestyle',
    reason: '完全禁煙 (再発ハザード2倍)、地中海食、心リハ 週150-200分、ストレス管理。',
    gl: 'JAS2022', sharedClass: 'Lifestyle' });

  return recs;
}

// ============================================================
// メインディスパッチャ
// ============================================================
const SUGGESTERS = {
  ht: suggestHt,
  dlp: suggestDlp,
  t2dm: suggestT2dm,
  ckd: suggestCkd,
  af: suggestAf,
  hf: suggestHf,
  asthma: suggestAsthma,
  copd: suggestCopd,
  gout: suggestGout,
  ascvd2: suggestAscvd2,
};

export function suggestTreatment(diseaseKey, state) {
  const fn = SUGGESTERS[diseaseKey];
  if (!fn) return [];
  const ctx = {
    patientHeader: state.patientHeader || {},
    commonLabs: state.commonLabs || {},
    commonHistory: state.commonHistory || {},
    scoreResult: state.scoresByDisease?.[diseaseKey]?.result,
    selection: state.selectionsByDisease?.[diseaseKey],
  };
  try { return fn(ctx) || []; } catch (e) { return []; }
}

// ============================================================
// 横断: 同一薬剤クラスを複数疾患で推奨している場合の検出
// 全提案 (採用案だけでなく) を見て、複数疾患で重複する sharedClass を表示
// ============================================================
export function detectSharedClasses(state) {
  const map = {}; // sharedClass → [{ disease, drug, dose }]
  for (const dk of state.selectedDiseases || []) {
    const recs = suggestTreatment(dk, state);
    for (const rec of recs) {
      if (!rec.sharedClass) continue;
      if (!map[rec.sharedClass]) map[rec.sharedClass] = [];
      // 同一疾患で複数 rec ヒットしても1度だけ
      if (!map[rec.sharedClass].some((it) => it.disease === dk)) {
        map[rec.sharedClass].push({ disease: dk, drug: rec.drug, dose: rec.dose });
      }
    }
  }
  const shared = [];
  for (const [sc, list] of Object.entries(map)) {
    if (list.length >= 2 && sc !== 'Lifestyle' && sc !== 'pregnancy') {
      shared.push({ sharedClass: sc, items: list });
    }
  }
  return shared;
}
