/**
 * 慢性疾患管理ブースター — 治療提案エンジン
 *
 * 各疾患について、患者ヘッダー・共通検査値・共通病歴・スコア結果・現在処方から
 * 「次の一手」を自動生成する。
 *
 * 設計原則:
 * - 推奨は配列で複数返す (上から順に: critical → primary → secondary)
 * - 各推奨は { severity, action, drug?, dose?, reason, gl } 構造
 * - 禁忌・妊娠は最優先
 * - GL根拠を明示 (JSH2025/JDS2024/JAS2022/KDIGO2024/JCS2024 等)
 */

// ============================================================
// HT 治療提案
// ============================================================
function suggestHt(ctx) {
  const { patientHeader: ph, commonLabs: cl, commonHistory: ch, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});

  // 妊娠時の禁忌切替 (最優先)
  if (ph.co_pregnancy) {
    const hasArbAcei = drugIds.some((id) => ['ht_arb', 'ht_acei', 'ht_arni'].includes(id));
    if (hasArbAcei) {
      recs.push({ severity: 'critical', action: 'switch', drug: 'メチルドパ', dose: '250mg×2/日 開始',
        reason: '妊娠中はARB/ACEi/ARNI禁忌 (胎児腎障害・羊水過少)。メチルドパが第一選択。',
        gl: 'JSH2025 妊娠HT' });
    } else {
      recs.push({ severity: 'high', action: 'start', drug: 'メチルドパ', dose: '250mg×2/日',
        reason: '妊娠HTの第一選択。効果不十分ならラベタロール/ニフェジピン徐放を併用。',
        gl: 'JSH2025' });
    }
    return recs;
  }

  // BP grade と層別から選択
  const grade = scoreResult?.derivedGrade;
  const tier = scoreResult?.tier;
  const hasArb = drugIds.includes('ht_arb');
  const hasCcb = drugIds.includes('ht_ccb');
  const hasThiazide = drugIds.includes('ht_thiazide');
  const drugCount = drugIds.length;

  // grade III: 緊急対応
  if (grade === 'grade3') {
    if (cl.sbp_range === '180+') {
      recs.push({ severity: 'critical', action: 'urgent',
        reason: 'SBP≥180は高血圧緊急症の可能性。眼底/蛋白尿/意識/胸痛を確認、必要時は救急搬送。',
        gl: 'JSH2025' });
    }
    if (drugCount === 0) {
      recs.push({ severity: 'high', action: 'start', drug: 'ARB+CCB併用',
        dose: 'アジルバ20mg + アムロジピン5mg (合剤=ザクラス)',
        reason: 'III度HTは併用先行。ARB+CCB は心腎保護とエビデンス豊富。',
        gl: 'JSH2025 Step 2' });
    }
  }

  // 痛風併存でサイアザイド使用中 → 切替警告
  if (hasThiazide && drugIds.includes('gout_attack_history')) {
    recs.push({ severity: 'critical', action: 'switch',
      reason: 'サイアザイド利尿薬は尿酸上昇で痛風増悪。ロサルタン (尿酸軽度低下) へ切替推奨。',
      gl: 'JSH2025' });
  }

  // CKD G4-G5 併存
  if (ph.cm_ckd_g45 && !drugIds.some((id) => ['ht_arb', 'ht_acei'].includes(id))) {
    recs.push({ severity: 'high', action: 'add', drug: 'ARB',
      dose: 'ロサルタン 25mg/日 開始 (CKD G4-5、低用量導入)',
      reason: 'CKD進行抑制でARB/ACEi必須 (蛋白尿あれば特に)。Cr 30%以内上昇は許容、K監視。',
      gl: 'KDIGO 2024' });
  }

  // DM併存 → SGLT2i 連携検討
  if (ph.cm_dm && !drugIds.includes('ht_arni')) {
    recs.push({ severity: 'medium', action: 'consider',
      reason: 'DM併存HTは SGLT2i (DM Booster側) で心腎保護を強化できる。HT薬は ARB 第一。',
      gl: 'JSH2025 / KDIGO 2024' });
  }

  // tier 別の主要推奨
  if (drugCount === 0) {
    if (tier === 'low' && grade === 'grade1') {
      recs.push({ severity: 'medium', action: 'lifestyle_first',
        reason: '低リスク I度HTは生活改善 1ヶ月 trial 後に再評価。減塩6g/日・有酸素運動・減量。',
        gl: 'JSH2025' });
    } else if (grade === 'grade1' || grade === 'grade2') {
      recs.push({ severity: 'high', action: 'start', drug: 'ARB単剤',
        dose: 'アジルバ20mg/日 (またはロサルタン50mg/日)',
        reason: 'I-II度HTで第一選択はARB。CCBも同等可。',
        gl: 'JSH2025 Step 1' });
    }
  } else if (drugCount === 1 && (tier === 'high' || tier === 'medium') && (grade === 'grade2' || grade === 'grade3')) {
    if (hasArb && !hasCcb) {
      recs.push({ severity: 'high', action: 'add', drug: 'CCB追加',
        dose: 'アムロジピン 5mg/日',
        reason: 'ARB単剤未達で CCB併用は標準 (ARB+CCB合剤も検討)。',
        gl: 'JSH2025 Step 2' });
    } else if (hasCcb && !hasArb) {
      recs.push({ severity: 'high', action: 'add', drug: 'ARB追加',
        dose: 'アジルバ 20mg/日',
        reason: 'CCB単剤未達で ARB併用は標準。',
        gl: 'JSH2025 Step 2' });
    } else {
      recs.push({ severity: 'medium', action: 'titrate_up',
        reason: '単剤未達。最大量未達なら増量、最大量近ければ別系統追加。',
        gl: 'JSH2025' });
    }
  } else if (drugCount >= 2 && (tier === 'high' || grade === 'grade2' || grade === 'grade3') && !hasThiazide) {
    recs.push({ severity: 'high', action: 'add', drug: '利尿薬追加',
      dose: 'トリクロルメチアジド 0.5mg/日 (低用量、痛風なし時)',
      reason: '2剤未達で利尿薬の追加 (ARB+CCB+利尿薬は標準3剤)。',
      gl: 'JSH2025 Step 3' });
  } else if (tier === 'low' && drugCount > 0) {
    recs.push({ severity: 'low', action: 'maintain',
      reason: 'コントロール良好。家庭BP記録継続、3-6ヶ月後再評価。',
      gl: 'JSH2025' });
  }

  return recs;
}

// ============================================================
// DLP 治療提案
// ============================================================
function suggestDlp(ctx) {
  const { patientHeader: ph, commonLabs: cl, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});

  if (ph.co_pregnancy || ph.co_pregnancy_planning || ph.co_lactation) {
    const hasStatin = drugIds.some((id) => id.startsWith('dlp_statin'));
    if (hasStatin || drugIds.includes('dlp_fibrate') || drugIds.includes('dlp_pcsk9')) {
      recs.push({ severity: 'critical', action: 'stop',
        reason: '妊娠/挙児希望/授乳中はスタチン・フィブラート・PCSK9i禁忌。即時中止し胆汁酸吸着薬へ。',
        gl: 'JAS2022' });
    }
    return recs;
  }

  // 高TG → 膵炎リスク優先
  if (cl.tg_range === '500-999' || cl.tg_range === '1000+') {
    if (cl.tg_range === '1000+') {
      recs.push({ severity: 'critical', action: 'urgent',
        reason: 'TG≥1000 は急性膵炎切迫。即日精査・絶食・補液検討。',
        gl: 'JAS2022' });
    }
    if (!drugIds.includes('dlp_fibrate')) {
      recs.push({ severity: 'high', action: 'start', drug: 'ペマフィブラート',
        dose: 'パルモディア 0.2mg×2/日',
        reason: 'TG≥500は膵炎予防でフィブラート第一。スタチン併用時はペマ推奨。',
        gl: 'JAS2022' });
    }
  }

  const ldlTarget = scoreResult?.ldlTarget;
  const tier = scoreResult?.tier;
  const ldlMap = { '<70': 65, '70-99': 85, '100-119': 110, '120-139': 130, '140-159': 150, '160-179': 170, '180+': 200 };
  const currentLdl = ldlMap[cl.ldl_range];
  const drugCount = drugIds.length;
  const hasAnyStatin = drugIds.some((id) => id.startsWith('dlp_statin'));
  const hasHighStatin = drugIds.includes('dlp_statin_high');
  const hasEze = drugIds.includes('dlp_eze');

  if (!ldlTarget || !currentLdl) return recs;

  // FH 強疑い
  if (ph.cm_fh && !hasHighStatin) {
    recs.push({ severity: 'high', action: 'start', drug: 'ロスバスタチン (高強度)',
      dose: 'クレストール 10-20mg/日 + 家族カスケードスクリーニング',
      reason: 'FHは early aggressive statin therapy が GL推奨。',
      gl: 'JAS2022 / JFH GL' });
  }

  if (currentLdl > ldlTarget + 20) {
    if (drugCount === 0) {
      const drug = (tier === 'very_high' || ph.cm_ascvd) ? 'ロスバスタチン (高強度)' : 'ピタバスタチン (中強度)';
      const dose = (tier === 'very_high' || ph.cm_ascvd) ? 'クレストール 10mg/日' : 'リバロ 2mg/日';
      recs.push({ severity: 'high', action: 'start', drug, dose,
        reason: `LDL目標 <${ldlTarget} 未達 (差${currentLdl - ldlTarget}+)。スタチン開始。`,
        gl: 'JAS2022' });
    } else if (hasAnyStatin && !hasEze && !hasHighStatin) {
      recs.push({ severity: 'high', action: 'titrate_up',
        reason: 'スタチン単剤未達。高強度 (ロスバスタチン20mg/アトルバ40mg) へ増量、それでも未達ならエゼチミブ追加。',
        gl: 'JAS2022' });
    } else if (hasAnyStatin && !hasEze) {
      recs.push({ severity: 'high', action: 'add', drug: 'エゼチミブ',
        dose: 'ゼチーア 10mg/日 追加',
        reason: '高強度スタチンでも未達。エゼチミブ上乗せで LDL 約20%追加低下。',
        gl: 'JAS2022' });
    } else if (hasAnyStatin && hasEze) {
      recs.push({ severity: 'medium', action: 'consider', drug: 'PCSK9阻害薬',
        reason: 'スタチン最大 + エゼチミブでも未達。PCSK9阻害薬検討 (保険適応: 二次予防+LDL未達)。',
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

  return recs;
}

// ============================================================
// T2DM 治療提案
// ============================================================
function suggestT2dm(ctx) {
  const { patientHeader: ph, commonLabs: cl, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const hba1c = cl.hba1c_range;

  if (ph.co_pregnancy) {
    if (drugIds.length > 0) {
      recs.push({ severity: 'critical', action: 'switch', drug: 'インスリン',
        reason: '妊娠中は経口薬全面禁忌 (胎盤移行・催奇形性懸念)。インスリンへ即時切替し産科+糖尿病専門医併診。',
        gl: 'JDS2024 妊娠DM' });
    }
    return recs;
  }

  // 症候性高血糖
  if (hba1c === '10+') {
    recs.push({ severity: 'critical', action: 'urgent',
      reason: 'HbA1c≥10% は症候性高血糖の可能性。インスリン即時導入 (basal 0.1-0.2U/kg) + 糖尿病内科紹介。ケトン症状 (吐気/腹痛/呼気アセトン臭) を患者に警告。',
      gl: 'JDS2024' });
  }

  const hasMet = drugIds.includes('dm_met');
  const hasSglt2 = drugIds.includes('dm_sglt2');
  const hasGlp1 = drugIds.includes('dm_glp1');
  const drugCount = drugIds.length;

  // ASCVD/HF併存 → SGLT2i/GLP-1RA優先
  if ((ph.cm_ascvd || ph.cm_chf) && !hasSglt2 && !hasGlp1) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬',
      dose: 'ジャディアンス 10mg/日',
      reason: 'ASCVD/HF併存DMは SGLT2i 第一級推奨 (心血管死・HF入院低下)。',
      gl: 'JDS2024 / KDIGO 2024' });
  }

  // CKD併存
  if (ph.cm_ckd_g45 && !hasSglt2 && !drugIds.includes('dm_dpp4')) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬 or DPP-4阻害薬',
      dose: 'ダパグリフロジン 10mg/日 or リナグリプチン (トラゼンタ) 5mg/日',
      reason: 'CKD G4-5でも SGLT2i (eGFR 25以上) は腎保護効果あり。DPP-4iはリナグリプチン (用量調整不要)。',
      gl: 'KDIGO 2024' });
  }

  // 一般推奨
  if (drugCount === 0 && (hba1c === '6.5-6.9' || hba1c === '7.0-7.9' || hba1c === '8.0-9.9')) {
    recs.push({ severity: 'high', action: 'start', drug: 'メトホルミン',
      dose: 'メトグルコ 500mg×2/日 (腎機能良好なら漸増)',
      reason: 'T2DM第一選択。ただし eGFR<30 は禁忌、eGFR 30-45 は最大1000mg。',
      gl: 'JDS2024' });
    if (cl.bmi_range === '25-29' || cl.bmi_range === '30-34' || cl.bmi_range === '35+') {
      recs.push({ severity: 'medium', action: 'consider_add', drug: 'GLP-1RA併用検討',
        reason: '肥満DMは GLP-1RA で体重減・心血管利益も期待。',
        gl: 'JDS2024' });
    }
  } else if (hasMet && drugCount === 1 && (hba1c === '7.0-7.9' || hba1c === '8.0-9.9')) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2i または GLP-1RA',
      reason: 'メトホルミン単剤未達。心腎保護を併せ持つ SGLT2i 第一、肥満なら GLP-1RA。',
      gl: 'JDS2024' });
  } else if (drugCount > 0 && (hba1c === '<5.6' || hba1c === '5.6-5.9') && drugIds.includes('dm_su')) {
    recs.push({ severity: 'medium', action: 'taper',
      reason: '過降下リスク (HbA1c<6.0+SU) → SU減量 or DPP-4iへ切替検討。低血糖無自覚に警戒。',
      gl: 'JDS2024' });
  } else if (drugCount > 0 && (hba1c === '6.5-6.9' || hba1c === '<5.6')) {
    recs.push({ severity: 'low', action: 'maintain',
      reason: 'コントロール良好。3ヶ月後再評価。',
      gl: 'JDS2024' });
  }

  return recs;
}

// ============================================================
// CKD 治療提案
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
      gl: 'KDIGO 2024' });
    return recs;
  }

  // ARB/SGLT2i 標準 (G3-G4で推奨度最大)
  if ((gStage === 'G3a' || gStage === 'G3b' || gStage === 'G4') && !drugIds.includes('ckd_arb')) {
    recs.push({ severity: 'high', action: 'start', drug: 'ARB',
      dose: 'ロサルタン 50mg/日 (G3b-G4は 25mg開始)',
      reason: '蛋白尿/HT併存CKDの第一選択。Cr 30%以内上昇は許容、K監視。',
      gl: 'KDIGO 2024' });
  }
  if ((gStage === 'G2' || gStage === 'G3a' || gStage === 'G3b' || gStage === 'G4') && !drugIds.includes('ckd_sglt2')) {
    recs.push({ severity: 'high', action: 'add', drug: 'SGLT2阻害薬',
      dose: 'ダパグリフロジン 10mg/日 (eGFR ≥25で開始)',
      reason: 'KDIGO 2024 強推奨 (DAPA-CKD/EMPA-KIDNEY: eGFR 30-40%抑制)。DM有無問わず。',
      gl: 'KDIGO 2024' });
  }

  // フィネレノン (DM併存CKDのみ)
  if (ph.cm_dm && (gStage === 'G3a' || gStage === 'G3b') && (aStage === 'A2' || aStage === 'A3') && !drugIds.includes('ckd_finerenone')) {
    recs.push({ severity: 'medium', action: 'add', drug: 'フィネレノン',
      dose: 'ケレンディア 10-20mg/日',
      reason: 'DM併存CKD (蛋白尿あり) で eGFR低下抑制エビデンス (FIDELITY)。K monitor必須。',
      gl: 'KDIGO 2024' });
  }

  // K上昇リスク累積
  const kRiseDrugs = drugIds.filter((id) => ['ckd_arb', 'ckd_finerenone', 'ht_mra', 'hf_mra', 'ht_arni', 'hf_arni'].includes(id));
  if (kRiseDrugs.length >= 2 && (cl.k_range === '5.1-5.4' || cl.k_range === '5.5+')) {
    recs.push({ severity: 'high', action: 'monitor',
      reason: `K上昇方向の薬剤 ${kRiseDrugs.length}種使用 + K ${cl.k_range}。1-2週後再検、必要時K吸着薬追加。`,
      gl: 'KDIGO 2024' });
  }

  // G5
  if (gStage === 'G5') {
    recs.push({ severity: 'critical', action: 'refer',
      reason: 'G5 (eGFR<15) は腎代替療法 (透析・移植) の準備。腎臓内科へ早期紹介。',
      gl: 'KDIGO 2024' });
  }

  return recs;
}

// ============================================================
// AF 治療提案
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
    let dose = 'エリキュース 5mg×2/日';
    if (cl.egfr_range === '15-29') dose = 'リクシアナ 30mg/日 (CrCl低下)';
    if (['75-79','80-89','90+'].includes(ph.age) && cl.egfr_range !== '90+') {
      dose = 'エリキュース 5mg×2/日 (高齢/低体重/Cr上昇の2項目該当時は2.5mg×2)';
    }
    recs.push({ severity: 'high', action: 'start', drug: 'DOAC (アピキサバン 第一選択)',
      dose,
      reason: `CHA₂DS₂-VASc=${cha2ds.score}点で抗凝固推奨。出血リスク (HAS-BLED=${hasbled?.score}) と天秤。`,
      gl: 'JCS2020-AF / ESC 2020' });
  }

  if (hasbled?.tier === 'high') {
    recs.push({ severity: 'high', action: 'caution',
      reason: `HAS-BLED=${hasbled.score} (高出血リスク)。修正可能因子 (BP/NSAID/アルコール) を最小化。PPI併用検討。`,
      gl: 'JCS2020-AF' });
  }

  // レート制御
  if (!hasBb && drugIds.length > 0) {
    recs.push({ severity: 'medium', action: 'add', drug: 'β遮断薬 (レート制御)',
      dose: 'ビソプロロール 2.5mg/日',
      reason: 'AFのレート制御は β遮断薬が第一。心拍数 <110目標。',
      gl: 'JCS2020-AF' });
  }

  return recs;
}

// ============================================================
// HF (統合: EFで分岐)
// ============================================================
function suggestHf(ctx) {
  const { selection, scoreResult } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const ef = scoreResult?.ef;

  // EF未測定 → 心エコー強推奨
  if (!ef || ef === 'unknown') {
    recs.push({ severity: 'critical', action: 'urgent', priority: 1,
      reason: 'EF未測定。心エコーで EF測定が最優先 (HFrEF/HFmrEF/HFpEF で治療が大きく異なる)。',
      gl: 'JCS2024' });
    return recs;
  }

  const hasArni = drugIds.includes('hf_arni');
  const hasBb = drugIds.includes('hf_bb');
  const hasMra = drugIds.includes('hf_mra');
  const hasSglt2 = drugIds.includes('hf_sglt2');
  const hasLoop = drugIds.includes('hf_loop');

  if (ef === 'reduced') {
    // HFrEF: 4本柱
    const pillars = [hasArni, hasBb, hasMra, hasSglt2].filter(Boolean).length;
    if (pillars < 4) {
      const missing = [];
      if (!hasArni) missing.push('ARNI (エンレスト 100mg×2、目標200mg×2)');
      if (!hasBb) missing.push('β遮断薬 (カルベジロール 1.25mg×2、漸増)');
      if (!hasMra) missing.push('MRA (スピロノラクトン 25mg/日、K monitor)');
      if (!hasSglt2) missing.push('SGLT2i (フォシーガ 10mg/日)');
      recs.push({ severity: 'high', action: 'add', priority: 1, drug: '4本柱の不足成分',
        dose: missing.join(' / '),
        reason: `HFrEF 4本柱 ${pillars}/4 のみ。残り${4-pillars}剤追加で予後改善が標準。`,
        gl: 'JCS2024' });
      // 代替: 段階的導入案
      recs.push({ severity: 'medium', action: 'titrate', priority: 2,
        reason: '段階的導入 (BP低めなら ARNI低用量から開始 → β遮断薬 → MRA → SGLT2i の順)',
        gl: 'JCS2024' });
    } else {
      recs.push({ severity: 'low', action: 'maintain', priority: 1,
        reason: '4本柱完成。各薬剤の目標用量達成を確認、未達なら漸増。',
        gl: 'JCS2024' });
    }
    if (!hasLoop) {
      recs.push({ severity: 'medium', action: 'consider', priority: 3, drug: 'ループ利尿薬',
        dose: 'うっ血症状あれば フロセミド 20-40mg/日',
        reason: 'うっ血症状緩和は症状管理として標準。', gl: 'JCS2024' });
    }
  } else if (ef === 'preserved') {
    // HFpEF
    if (!hasSglt2) {
      recs.push({ severity: 'high', action: 'start', priority: 1, drug: 'SGLT2阻害薬',
        dose: 'ダパグリフロジン 10mg/日 or エンパグリフロジン 10mg/日',
        reason: 'HFpEF全例で第一選択。EMPEROR-Preserved/DELIVER で心不全入院・CV死を有意低下 (HR ~0.79)。EF >40% / DM 有無問わず。',
        gl: 'JCS2024' });
    } else {
      recs.push({ severity: 'low', action: 'maintain', priority: 1,
        reason: 'SGLT2i継続。うっ血悪化時はループ利尿薬調整。', gl: 'JCS2024' });
    }
    recs.push({ severity: 'medium', action: 'consider', priority: 2, drug: 'MRA (個別)',
      dose: 'スピロノラクトン 12.5-25mg/日',
      reason: 'HFpEFでの MRA は TOPCAT試験で限定的だが、症状/再入院多い症例で考慮。', gl: 'JCS2024' });
  } else if (ef === 'mid_range') {
    // HFmrEF
    recs.push({ severity: 'high', action: 'start', priority: 1, drug: 'SGLT2阻害薬',
      dose: 'ダパグリフロジン 10mg/日',
      reason: 'HFmrEF (EF 41-49%) は SGLT2i 推奨。HFrEF寄りなら 4本柱類似管理を検討。',
      gl: 'JCS2024' });
    if (!hasArni && !hasBb) {
      recs.push({ severity: 'medium', action: 'consider', priority: 2, drug: 'ARNI/β遮断薬/MRA',
        reason: 'HFmrEFの症状重い症例ではHFrEF類似の管理が予後改善期待。',
        gl: 'JCS2024' });
    }
  }
  return recs;
}

// ============================================================
// 喘息 治療提案 (GINA Step 1-5、明確化)
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

  if (drugIds.length === 0) {
    recs.push({ severity: 'high', action: 'start', priority: 1, drug: 'Step 1-2: as-needed ICS-formoterol',
      dose: 'シムビコート 1吸入 症状時 (Track 1 / AIR therapy)',
      reason: 'GINA 2024: 軽症から ICS-formoterol を症状時 reliever として使用。SABA単独は死亡リスクで非推奨。',
      gl: 'GINA 2024 Track 1 Step 1-2' });
    recs.push({ severity: 'medium', action: 'alternative', priority: 2, drug: 'Step 1-2 代替: ICS低用量+SABA頓用',
      dose: 'フルタイド 50μg×2/日 + メプチン 頓用 (Track 2)',
      reason: 'Track 1 が困難な場合の代替。アドヒアランス課題に注意。',
      gl: 'GINA 2024 Track 2 Step 1-2' });
  } else if (hasMart && !hasLama && !hasTriple) {
    recs.push({ severity: 'high', action: 'titrate_up', priority: 1, drug: 'Step 3-4: ICS-formoterol 用量増',
      dose: 'シムビコート 2吸入×2/日 + 症状時',
      reason: 'GINA 2024 Step 3-4: SMART療法で ICS-formoterol を維持+リリーバー兼用。中用量へ増量で約70%がコントロール達成。',
      gl: 'GINA 2024 Track 1 Step 3-4' });
    recs.push({ severity: 'medium', action: 'add', priority: 2, drug: 'Step 4: LAMA追加',
      dose: 'スピリーバ レスピマット 2.5μg×2吸入/日',
      reason: 'ICS-LABA単独で未達ならStep 4でLAMA追加 (Triple化)。', gl: 'GINA 2024 Step 4' });
  } else if (hasTriple && !hasBio) {
    recs.push({ severity: 'high', action: 'consider', priority: 1, drug: 'Step 5: 生物学的製剤検討',
      dose: 'eos≥300/IgE高/atopy → デュピクセント 300mg SC 2W毎 / メポリズマブ / ベンラリズマブ',
      reason: 'GINA 2024 Step 5: Triple未達で頻回増悪・OCS依存なら生物学的製剤。表現型 (T2型) で薬剤選択。',
      gl: 'GINA 2024 Step 5' });
    recs.push({ severity: 'medium', action: 'consider_alt', priority: 2, drug: 'OCS最小用量維持 (短期)',
      reason: '生物学的製剤導入待機中の症状コントロール用、長期OCSは骨粗鬆症リスクで回避。', gl: 'GINA 2024' });
  } else if (hasIcs && !hasMart) {
    recs.push({ severity: 'medium', action: 'switch', priority: 1, drug: 'ICS単剤 → ICS-LABA SMART (Track 1)',
      dose: 'フルタイド → シムビコート 2吸入×2 + 症状時',
      reason: 'Track 2 (ICS+SABA) より Track 1 (SMART) が GINA 2024 では preferred。',
      gl: 'GINA 2024' });
  }
  return recs;
}

// ============================================================
// COPD 治療提案
// ============================================================
function suggestCopd(ctx) {
  const { commonHistory: ch, scoreResult, selection } = ctx;
  const recs = [];
  const drugIds = Object.keys(selection?.classDetails || {});
  const group = scoreResult?.group;

  if (group === 'A' && !drugIds.includes('copd_lama')) {
    recs.push({ severity: 'high', action: 'start', drug: 'LAMA単剤',
      dose: 'スピリーバ レスピマット 2.5μg×2吸入/日',
      reason: 'GOLD Group A は LAMA単剤推奨。',
      gl: 'GOLD 2024' });
  } else if (group === 'B' && !drugIds.includes('copd_lama_laba') && !drugIds.includes('copd_triple')) {
    recs.push({ severity: 'high', action: 'start', drug: 'LAMA/LABA合剤',
      dose: 'アノーロエリプタ 1吸入/日',
      reason: 'GOLD Group B は LAMA/LABA合剤推奨。',
      gl: 'GOLD 2024' });
  } else if (group === 'E' && !drugIds.includes('copd_triple')) {
    recs.push({ severity: 'high', action: 'start', drug: 'Triple (ICS含)',
      dose: 'テリルジー 100エリプタ 1吸入/日',
      reason: 'GOLD Group E (頻回増悪) は Triple推奨、特に eos≥300/ACO併存時。',
      gl: 'GOLD 2024' });
  }

  if (ch.smoking_current) {
    recs.push({ severity: 'critical', action: 'lifestyle',
      reason: '禁煙が最優先 (FEV1低下抑制・予後改善)。バレニクリン/ニコチンパッチ/禁煙外来。',
      gl: 'GOLD 2024' });
  }

  return recs;
}

// ============================================================
// 痛風 治療提案
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
        reason: 'CKD G4-5でコルヒチン禁忌級 (横紋筋融解・骨髄抑制死亡例)。eGFR 30-60は0.5mg隔日。',
        gl: 'JP痛風GL2022' });
    }
  }

  if (cl.egfr_range === '15-29' || cl.egfr_range === '<15') {
    if (drugIds.includes('gout_allopurinol')) {
      recs.push({ severity: 'high', action: 'titrate_down',
        reason: 'eGFR<30でアロプリノール 50mg隔日まで減量、専門医併診推奨。',
        gl: 'JP痛風GL2022' });
    }
  }

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
