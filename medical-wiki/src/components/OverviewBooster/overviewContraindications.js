/**
 * Overview Booster — 軽量 DO_NOT_RULES (14ルール)
 *
 * 個別 TreatmentBooster の DO_NOT_RULES とは別レイヤー。
 * Overview の選択結果 (疾患・薬剤クラス・lifestyle・patientHeader) をリアルタイム評価。
 * 違反検出時は SUMMARY 画面で赤バナー強制表示。
 */

export const OVERVIEW_CONTRAINDICATIONS_VERSION = 1;
export const OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED = '2026-04-26';

export const OVERVIEW_CONTRAINDICATIONS = [
  // === 疾患×薬剤の禁忌 ===
  {
    id: 'gout_hctz',
    severity: 'critical',
    type: 'disease_drug',
    diseases: ['gout'],
    drugClassIds: ['ht_thiazide'],
    message: '【禁忌相当】痛風 + サイアザイド利尿薬 → 尿酸排泄低下で発作誘発。ロサルタン (HCTZ抜き) 優先',
  },
  {
    id: 'asthma_ns_bb',
    severity: 'critical',
    type: 'disease_drug',
    diseases: ['asthma'],
    drugClassIds: ['ht_bb', 'af_bb'],
    drugClassFilter: 'nonselective',
    message: '【禁忌】喘息 + 非選択性β遮断薬 → 気管支攣縮。β1選択性 (ビソプロロール) でも喘息悪化リスク、避ける',
  },
  {
    id: 'copd_ns_bb',
    severity: 'critical',
    type: 'disease_drug',
    diseases: ['copd'],
    drugClassIds: ['ht_bb', 'af_bb'],
    drugClassFilter: 'nonselective',
    message: '【禁忌】COPD + 非選択性β遮断薬 → 気管支攣縮。β1選択性なら慎重投与可だが心疾患合併時の利益と天秤',
  },
  {
    id: 'ckd_g45_nsaid',
    severity: 'critical',
    type: 'score_drug',
    diseases: ['ckd'],
    scoreCondition: 'kdigo_g4_or_g5',
    drugClassIds: ['gout_nsaid'],
    message: '【禁忌】CKD G4-5 + NSAID → AKI・高K血症リスク。PSL や コルヒチン (G4-5でも禁忌級だが) 等の代替',
  },
  {
    id: 'ckd_g45_benzbromarone',
    severity: 'critical',
    type: 'score_drug',
    diseases: ['ckd'],
    scoreCondition: 'kdigo_g4_or_g5',
    drugClassIds: ['gout_benzbromarone'],
    message: '【禁忌】CKD G4-5 + ベンズブロマロン → 効果減弱+腎負担。フェブキソスタット (eGFR<30で減量) へ',
  },
  {
    id: 'ckd_g45_colchicine',
    severity: 'critical',
    type: 'score_drug',
    diseases: ['ckd'],
    scoreCondition: 'kdigo_g4_or_g5',
    drugClassIds: ['gout_colchicine'],
    message: '【禁忌級】CKD G4-5 + コルヒチン → 蓄積で横紋筋融解・骨髄抑制 (死亡例)。eGFR 30-60は減量 (0.5mg隔日)',
  },

  // === 妊娠時禁忌 (患者ヘッダー) ===
  {
    id: 'pregnancy_arb_acei_arni',
    severity: 'critical',
    type: 'patient_drug',
    patientFlags: ['co_pregnancy'],
    drugClassIds: ['ht_arb', 'ht_acei', 'ht_arni', 'ckd_arb', 'asc_arb', 'hf_arni', 'hfpef_arb'],
    message: '【禁忌】妊娠 + ARB/ACEi/ARNI → 胎児腎障害・羊水過少。即時中止しメチルドパへ',
  },
  {
    id: 'pregnancy_sglt2',
    severity: 'critical',
    type: 'patient_drug',
    patientFlags: ['co_pregnancy'],
    drugClassIds: ['dm_sglt2', 'ckd_sglt2', 'hf_sglt2', 'hfpef_sglt2'],
    message: '【禁忌】妊娠 + SGLT2i → 胎児への影響データ不足。インスリンへ切替',
  },
  {
    id: 'pregnancy_statin_fibrate',
    severity: 'critical',
    type: 'patient_drug',
    patientFlags: ['co_pregnancy', 'co_pregnancy_planning'],
    drugClassIds: ['dlp_statin_low', 'dlp_statin_mid', 'dlp_statin_high', 'dlp_fibrate', 'dlp_pcsk9', 'asc_statin_high'],
    message: '【禁忌】妊娠/挙児希望 + スタチン/フィブラート/PCSK9i → 即時中止。授乳中も同様',
  },

  // === 同クラス排他・併用注意 ===
  {
    id: 'arb_acei_arni_overlap',
    severity: 'critical',
    type: 'mutual_exclusion',
    drugClassGroups: [['ht_arb', 'ckd_arb', 'asc_arb', 'hfpef_arb'],
                      ['ht_acei'],
                      ['ht_arni', 'hf_arni']],
    message: '【併用禁忌】ARB / ACEi / ARNI のうち1つだけ選択 (併用は K上昇・腎障害・血圧低下リスク)',
  },
  {
    id: 'doac_warfarin_overlap',
    severity: 'critical',
    type: 'mutual_exclusion',
    drugClassGroups: [['af_doac_apix', 'af_doac_riva', 'af_doac_edox', 'af_doac_dabi'],
                      ['af_warfarin']],
    message: '【併用禁忌】DOAC と ワルファリンの同時併用は不可。切替時は休薬期間確認',
  },
  {
    id: 'doac_antiplatelet_caution',
    severity: 'warning',
    type: 'caution',
    drugClassGroups: [['af_doac_apix', 'af_doac_riva', 'af_doac_edox', 'af_doac_dabi', 'af_warfarin'],
                      ['asc_aspirin', 'asc_clopi']],
    message: '【注意】抗凝固薬 + 抗血小板薬 → 出血リスク増。HAS-BLED 評価+PPI併用検討。慢性安定期の冠動脈疾患は抗凝固単剤も検討',
  },
  {
    id: 'k_accumulation',
    severity: 'warning',
    type: 'sum_count',
    drugClassIds: ['ht_arb', 'ht_acei', 'ht_arni', 'ht_mra', 'hf_mra', 'ckd_arb', 'ckd_finerenone', 'ckd_kbinder', 'asc_arb', 'hf_arni', 'hfpef_arb', 'hfpef_mra'],
    threshold: 3,
    excludeIds: ['ckd_kbinder'], // K吸着は逆方向なので相殺
    message: '【K上昇リスク累積】K上昇方向の薬剤を3種以上選択。採血monitor (K, Cr) を1-2週後に',
  },

  // === コード復元時の古い検査警告 ===
  {
    id: 'old_score_warning',
    severity: 'critical',
    type: 'temporal',
    triggerOn: 'code_decoded',
    message: '⚠ 前回入力したスコアです。STEP 0.5 で今日の検査値を再入力してください',
  },
];

/**
 * 与えられた state からルール違反を抽出
 */
export function evaluateContraindications(state) {
  const violations = [];
  const selectedDiseases = state.selectedDiseases || [];
  const selectionsByDisease = state.selectionsByDisease || {};
  const scoresByDisease = state.scoresByDisease || {};
  const patientHeader = state.patientHeader || {};

  // 全選択薬剤クラスIDを集約
  const allSelectedDrugIds = new Set();
  for (const sel of Object.values(selectionsByDisease)) {
    (sel?.drugIds || []).forEach((id) => allSelectedDrugIds.add(id));
  }

  for (const rule of OVERVIEW_CONTRAINDICATIONS) {
    if (rule.type === 'temporal') continue; // 別途トリガー

    if (rule.type === 'disease_drug') {
      const diseaseMatch = (rule.diseases || []).some((d) => selectedDiseases.includes(d));
      if (!diseaseMatch) continue;
      const drugMatch = (rule.drugClassIds || []).some((id) => allSelectedDrugIds.has(id));
      if (drugMatch) violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      continue;
    }

    if (rule.type === 'score_drug') {
      const diseaseMatch = (rule.diseases || []).some((d) => selectedDiseases.includes(d));
      if (!diseaseMatch) continue;
      const score = scoresByDisease[rule.diseases[0]];
      if (!score?.result) continue;
      const condMatch = checkScoreCondition(score, rule.scoreCondition);
      if (!condMatch) continue;
      const drugMatch = (rule.drugClassIds || []).some((id) => allSelectedDrugIds.has(id));
      if (drugMatch) violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      continue;
    }

    if (rule.type === 'patient_drug') {
      const flagMatch = (rule.patientFlags || []).some((f) => patientHeader[f]);
      if (!flagMatch) continue;
      const drugMatch = (rule.drugClassIds || []).some((id) => allSelectedDrugIds.has(id));
      if (drugMatch) violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      continue;
    }

    if (rule.type === 'mutual_exclusion') {
      const groupHits = (rule.drugClassGroups || []).filter((group) =>
        group.some((id) => allSelectedDrugIds.has(id))
      );
      if (groupHits.length >= 2) violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      continue;
    }

    if (rule.type === 'caution') {
      const groupHits = (rule.drugClassGroups || []).filter((group) =>
        group.some((id) => allSelectedDrugIds.has(id))
      );
      if (groupHits.length >= 2) violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      continue;
    }

    if (rule.type === 'sum_count') {
      const exclude = new Set(rule.excludeIds || []);
      const matched = (rule.drugClassIds || []).filter((id) => allSelectedDrugIds.has(id) && !exclude.has(id));
      if (matched.length >= (rule.threshold || 3)) {
        violations.push({ ruleId: rule.id, severity: rule.severity, message: rule.message });
      }
      continue;
    }
  }

  return violations;
}

function checkScoreCondition(score, condition) {
  if (condition === 'kdigo_g4_or_g5') {
    return score.kind === 'kdigo_heatmap' && (score.result?.gStage === 'G4' || score.result?.gStage === 'G5');
  }
  return false;
}
