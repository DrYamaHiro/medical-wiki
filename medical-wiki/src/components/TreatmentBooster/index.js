import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { TREATMENT_DATA } from './registry';

/* -------------------------------------------------------- */
/*  Helpers                                                 */
/* -------------------------------------------------------- */
function getDrugIds(currentDrugs) {
  return currentDrugs.map((d) => (typeof d === 'string' ? d : d.id));
}

function detectCurrentState(currentDrugs, allDrugs) {
  if (currentDrugs.length === 0) return 'naive';
  const classes = new Set();
  const ids = getDrugIds(currentDrugs);
  ids.forEach((id) => {
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
  });
  // 合剤は2クラス扱い（ARB+CCB）
  if (ids.some((id) => id.startsWith('combo_'))) {
    classes.add('_combo_implied');
  }
  const count = classes.size;
  if (count === 1) return 'mono';
  if (count === 2) return 'dual';
  if (count === 3) return 'triple';
  return 'quad_plus';
}

function detectDoseHeadroom(currentDrugs, allDrugs) {
  // Returns array of {drug, currentDose, nextDose} for drugs with room to escalate
  const headroom = [];
  currentDrugs.forEach((entry) => {
    if (typeof entry === 'string') return; // no dose info
    const drug = allDrugs.find((d) => d.id === entry.id);
    if (!drug?.doses) return;
    const idx = drug.doses.findIndex((x) => x.value === entry.dose);
    if (idx < 0 || idx >= drug.doses.length - 1) return;
    const nextDose = drug.doses[idx + 1];
    headroom.push({
      drug,
      currentDose: drug.doses[idx],
      nextDose,
    });
  });
  return headroom;
}

// Modifiers that contradict "現状維持/観察" — any present = no MAINTAIN / WATCH
// 慢性の合併症 (cm_ckd_adv, cm_aortic_stenosis) は安定していれば維持可なので除外。
// 副作用 (se_*) と Red Flag (rf_*) と妊娠のみ。
const MAINTAIN_BLOCKERS = [
  'se_hyperK',
  'se_creatinine_up',
  'se_cough',
  'se_edema',
  'se_hypotension',
  'se_hypoK',
  'se_uric_up',
  'se_bradycardia',
  'se_gynecomastia',
  'co_pregnancy',
  'rf_severe_ht',
  'rf_2nd_suspect',
  'rf_hypoK_severe',
  'rf_target_organ',
];

function drugRegimenLabel(currentDrugs, allDrugs) {
  return currentDrugs
    .map((entry) => {
      if (typeof entry === 'string') {
        const d = allDrugs.find((x) => x.id === entry);
        return d?.label || entry;
      }
      const d = allDrugs.find((x) => x.id === entry.id);
      if (!d) return entry.id;
      const doseLabel = d.doses?.find((x) => x.value === entry.dose)?.label || '';
      return doseLabel ? `${d.label} ${doseLabel}` : d.label;
    })
    .join(' + ');
}

function synthesizeMaintainRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  const hasCKD = ['cm_ckd', 'cm_ckd_adv'].some((m) => modifiers.includes(m));
  const hasCKDadv = modifiers.includes('cm_ckd_adv');
  const hasDM = modifiers.includes('cm_dm');
  const extraNote =
    hasCKDadv
      ? 'CKD G4併存: K・Creを1-3ヶ月毎、家庭血圧は週単位で確認。腎臓専門医との共同管理が望ましい'
      : hasCKD
      ? 'CKD併存: 4週後にK・Creを確認、NSAID併用時はTriple Whammyに注意'
      : hasDM
      ? 'DM併存: 次回も +5以内なら継続、超過傾向なら早期増量を検討'
      : '家庭血圧には±10mmHg程度の日間変動が生理的に存在する。単回の値ではなく2週平均で評価する';
  const reassess = hasCKDadv
    ? '2-4週後に家庭血圧、月1回のK・Cre、血圧傾向に変化があれば速やかに対応'
    : hasCKD
    ? '4週後に家庭血圧 + K・Cre、NSAID使用有無を毎回確認'
    : '4-8週後に家庭血圧再確認。冬場・夏場の季節変動も考慮し、2週間平均で判断';
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（目標内）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '未治療継続（生活習慣のみ）',
    reason:
      '家庭血圧が目標域（または目標+5mmHg以内の日間変動許容範囲）。不要な薬剤変更はアドヒアランス低下・副作用のリスク。現行を継続し次回に経過確認',
    reassess,
    note: extraNote,
  };
}

// WATCH — "ちょっと超えてる〜くらいで様子見" の機微を明示
// 高リスク併存（DM/post-MI/HF/蛋白尿）の場合は早期介入を優先するため呼び出し側で抑制する
function synthesizeWatchRec(currentDrugs, allDrugs, modifiers = []) {
  const drugLabels = drugRegimenLabel(currentDrugs, allDrugs);
  const hasCKD = ['cm_ckd', 'cm_ckd_adv'].some((m) => modifiers.includes(m));
  return {
    id: '_watch',
    action: 'WATCH',
    drug: '経過観察 + 生活指導強化',
    example: drugLabels
      ? `現行処方を継続: ${drugLabels}。減塩(6g/日未満)・減量・運動・節酒の強化`
      : '生活習慣改善を優先（減塩・減量・運動・節酒・禁煙）',
    reason:
      '目標をわずかに超過しているが、家庭血圧の日間変動±10mmHg以内の可能性。単回の測定値で薬物強化せず、2-4週後の家庭血圧平均で再判断',
    reassess: hasCKD
      ? '2週後に家庭血圧 + K・Cre確認（CKD併存のため短め）'
      : '2-4週後に家庭血圧平均（朝・夜各2回×14日）で再評価。生活指導の遵守状況を確認',
    note: '白衣効果・測定手技・服薬タイミング・季節も影響する。慌てて薬を増やすより「次の2週間の平均」を待つのが賢明',
  };
}

function synthesizeDoseUpRecs(currentDrugs, allDrugs, modifiers) {
  const headroom = detectDoseHeadroom(currentDrugs, allDrugs);
  // Guards: both soft (avoidWhen) and hard (forbidden)
  const avoidMap = {
    ccb_am: ['se_edema', 'fh_ccb_edema', 'se_hypotension', 'co_frail'],
    ccb_nif: ['se_edema', 'fh_ccb_edema', 'se_hypotension', 'co_frail'],
    ccb_cil: ['se_edema', 'se_hypotension', 'co_frail'],
    diu_tri: ['cm_gout', 'se_uric_up', 'fh_thiazide_hypoK', 'se_hypoK'],
    diu_ind: ['cm_gout', 'se_uric_up', 'fh_thiazide_hypoK', 'se_hypoK'],
    acei_ena: ['se_cough', 'fh_acei_cough', 'se_creatinine_up'],
    acei_ima: ['se_cough', 'fh_acei_cough', 'se_creatinine_up'],
    arb_azl: ['se_creatinine_up'],
    arb_tel: ['se_creatinine_up'],
    arb_ols: ['se_creatinine_up'],
    arb_val: ['se_creatinine_up'],
    arb_can: ['se_creatinine_up'],
    arb_los: ['se_creatinine_up'],
    bb_bis: ['se_bradycardia', 'fh_bb_bradycardia', 'cm_asthma', 'co_frail'],
    bb_car: ['se_bradycardia', 'fh_bb_bradycardia', 'cm_asthma', 'co_frail'],
    alpha_tam: ['se_hypotension', 'co_frail', 'co_elderly'],
  };
  const forbiddenMap = {
    arb_azl: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    arb_tel: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    arb_ols: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    arb_val: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    arb_can: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    arb_los: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    acei_ena: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    acei_ima: ['co_pregnancy', 'cm_bilateral_rvs', 'se_hyperK'],
    mra_spi: ['se_hyperK', 'cm_ckd_adv'],
    mra_ese: ['se_hyperK', 'cm_ckd_adv'],
    diu_tri: ['cm_ckd_adv'],
    diu_ind: ['cm_ckd_adv'],
  };
  return headroom.map(({ drug, currentDose, nextDose }) => {
    return {
      id: `_dose_up_${drug.id}`,
      action: 'DOSE_UP',
      drug: `${drug.label}を${nextDose.label}へ増量`,
      example: `${drug.label}${nextDose.label} 1回1錠 1日1回 朝食後（現用量${currentDose.label}から増量）`,
      reason:
        '現用量で目標未達。同一薬剤の増量は新薬追加よりアドヒアランス・コストの面で優先される第一手',
      avoidWhen: avoidMap[drug.id] || [],
      forbidden: forbiddenMap[drug.id] || [],
      reassess: '2-4週後に家庭血圧・副作用確認',
      _isDoseUp: true,
      _drugClass: drug.class,
    };
  });
}

// detect whether currentDrugs include any drug at its max dose (used for combo-switch gating)
function anyDrugAtMax(currentDrugs, allDrugs) {
  return currentDrugs.some((entry) => {
    if (typeof entry === 'string') return false;
    const drug = allDrugs.find((d) => d.id === entry.id);
    if (!drug?.doses) return false;
    const dose = drug.doses.find((x) => x.value === entry.dose);
    return !!dose?.isMax;
  });
}

/* -------------------------------------------------------- */
/*  Scoring                                                 */
/* -------------------------------------------------------- */
function getCurrentClasses(currentDrugs, allDrugs) {
  const classes = new Set();
  const ids = getDrugIds(currentDrugs);
  ids.forEach((id) => {
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
    // 合剤は ARB+CCB として展開
    if (id === 'combo_zac' || id === 'combo_mic' || id === 'combo_azl') {
      classes.add('ARB');
      classes.add('Ca拮抗薬');
    }
    if (id === 'combo_pre') {
      classes.add('ARB');
      classes.add('利尿薬');
    }
  });
  return classes;
}

function calcScore(rec, currentDrugs, modifiers, controlStatus, allDrugs) {
  const currentState = detectCurrentState(currentDrugs, allDrugs);
  if (rec.fromStates && !rec.fromStates.includes(currentState)) {
    return { score: -1, excluded: 'state-mismatch' };
  }

  if (rec.forbidden && rec.forbidden.some((f) => modifiers.includes(f))) {
    return { score: -1, excluded: 'forbidden', reason: rec.forbidden };
  }

  // requiresAny: rec は指定された modifier のいずれかが選択されていないと発火しない
  // （例: taper_controlled_stable は co_stable_6mo を要求）
  if (rec.requiresAny && !rec.requiresAny.some((m) => modifiers.includes(m))) {
    return { score: -1, excluded: 'requires-missing' };
  }

  // Same-class ADD suppression
  if (rec.action === 'ADD' && rec.drugClass) {
    const currentClasses = getCurrentClasses(currentDrugs, allDrugs);
    if (currentClasses.has(rec.drugClass)) {
      return { score: -1, excluded: 'same-class' };
    }
  }

  // Same-class SWITCH suppression: ARB→ARB のような意味のない SWITCH を除外
  // triggerSideEffects が一致するときは例外（副作用で別のARBへスイッチ）
  if (rec.action === 'SWITCH' && rec.targetClass) {
    const currentClasses = getCurrentClasses(currentDrugs, allDrugs);
    const hasTriggerMatch = rec.triggerSideEffects?.some((s) => modifiers.includes(s));
    if (currentClasses.has(rec.targetClass) && !hasTriggerMatch) {
      return { score: -1, excluded: 'same-class-switch' };
    }
  }

  if (rec._requiresMaxDose) {
    const hasMax = anyDrugAtMax(currentDrugs, allDrugs);
    const hasUrgent = rec.urgentWhen?.some((m) => modifiers.includes(m));
    if (!hasMax && !hasUrgent) {
      return { score: -1, excluded: 'not-at-max-dose' };
    }
  }

  let score = 0;
  const isEscalation =
    rec.action === 'STEP_UP' || rec.action === 'ADD' || rec.action === 'DOSE_UP';

  if (isEscalation) {
    if (controlStatus === 'uncontrolled') score += 10;
    else if (controlStatus === 'partial' || controlStatus === 'near_target') score += 3; // 様子見優先: エスカレーションは低めに
    else if (controlStatus === 'controlled') score -= 12;
    else score += 4;
  } else if (rec.action === 'TAPER' || rec.action === 'STOP') {
    if (controlStatus === 'controlled') score += 8;
    else if (controlStatus === 'near_target' || controlStatus === 'partial') score += 1;
    else score -= 10;
  } else if (rec.action === 'SWITCH') {
    if (rec.triggerSideEffects && rec.triggerSideEffects.some((s) => modifiers.includes(s))) {
      score += 10;
    } else {
      score -= 3;
    }
  } else if (rec.action === 'REFER') {
    if (controlStatus === 'uncontrolled') score += 5;
  }

  if (rec.action === 'DOSE_UP' && (controlStatus === 'near_target' || controlStatus === 'partial' || controlStatus === 'uncontrolled')) {
    score += 3;
  }

  // preferredWhen: スタック上限を 2 にして DM+CKD+蛋白尿の三重ブーストを抑制
  // かつ controlled 時のエスカレーションにはブーストしない
  if (rec.preferredWhen) {
    const matches = rec.preferredWhen.filter((m) => modifiers.includes(m));
    const cappedMatches = Math.min(matches.length, 2);
    if (isEscalation && controlStatus === 'controlled') {
      // no boost
    } else if (isEscalation && (controlStatus === 'near_target' || controlStatus === 'partial')) {
      score += cappedMatches * 1; // 様子見ゾーンでは弱めに
    } else {
      score += cappedMatches * 3;
    }
  }

  if (rec.avoidWhen) {
    const matches = rec.avoidWhen.filter((m) => modifiers.includes(m));
    score -= matches.length * 4;
  }

  if (rec.triggerSideEffects) {
    const matches = rec.triggerSideEffects.filter((s) => modifiers.includes(s));
    score += matches.length * 5;
  }

  if (rec.action === 'REFER' && rec.urgentWhen) {
    const matches = rec.urgentWhen.filter((m) => modifiers.includes(m));
    if (matches.length > 0) {
      score = Math.max(score, 15);
    }
  }

  return { score, excluded: null };
}

/* -------------------------------------------------------- */
/*  Tiered display: split recs into primary/alternates/later */
/* -------------------------------------------------------- */
function splitTiers(ranked, controlStatus) {
  if (ranked.length === 0) return { primary: [], alternates: [], later: [] };
  const caps = {
    controlled: { primary: 0, alternates: 0, later: 2 },
    near_target: { primary: 0, alternates: 1, later: 3 }, // WATCH is primary (injected); DOSE_UPを1件alt、ほかlater
    partial: { primary: 1, alternates: 2, later: 3 },
    uncontrolled: { primary: 1, alternates: 2, later: 4 },
    null_: { primary: 1, alternates: 2, later: 3 },
  };
  const key = controlStatus || 'null_';
  const cap = caps[key] || caps.null_;
  const top = ranked[0]._score;
  const alternateGate = top * 0.6;
  const laterGate = top * 0.3;

  const primary = ranked.slice(0, cap.primary);
  const rest = ranked.slice(cap.primary);
  const alternates = rest
    .filter((r) => r._score >= alternateGate)
    .slice(0, cap.alternates);
  const usedIds = new Set([...primary, ...alternates].map((r) => r.id));
  const later = rest
    .filter((r) => !usedIds.has(r.id) && r._score >= laterGate)
    .slice(0, cap.later);
  return { primary, alternates, later };
}

function deriveControlStatus(values, deriveFn, override, modifiers) {
  if (override) return override;
  if (!deriveFn) return null;
  return deriveFn(values, modifiers);
}

/* -------------------------------------------------------- */
/*  Main Component                                          */
/* -------------------------------------------------------- */
export default function TreatmentBooster({
  disease: propDisease,
  drugs: propDrugs,
  modifiers: propModifiers,
  controlMetric: propControlMetric,
  recommendations: propRecommendations,
  doNotRules: propDoNotRules,
  subtitle: propSubtitle,
}) {
  const registryEntry = propDisease ? TREATMENT_DATA[propDisease] : null;
  const registryData = registryEntry?.data;

  const DRUGS = propDrugs || registryData?.DRUGS || [];
  const MODIFIERS = propModifiers || registryData?.MODIFIERS || [];
  const CONTROL_METRIC = propControlMetric || registryData?.CONTROL_METRIC || {};
  const RECOMMENDATIONS = propRecommendations || registryData?.RECOMMENDATIONS || [];
  const DO_NOT_RULES = propDoNotRules || registryData?.DO_NOT_RULES || [];
  const subtitle = propSubtitle || registryEntry?.subtitle || '治療修正の思考支援ツール';

  const [phase, setPhase] = useState(1);
  // currentDrugs: array of { id, dose } objects
  const [currentDrugs, setCurrentDrugs] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [metricValues, setMetricValues] = useState({});
  const [overrideStatus, setOverrideStatus] = useState(null);

  const toggleDrug = useCallback(
    (id) => {
      setCurrentDrugs((prev) => {
        const exists = prev.find((x) => x.id === id);
        if (exists) return prev.filter((x) => x.id !== id);
        const drug = DRUGS.find((d) => d.id === id);
        const defaultDose =
          drug?.doses?.find((x) => x.isDefault)?.value || drug?.doses?.[0]?.value || null;
        return [...prev, { id, dose: defaultDose }];
      });
    },
    [DRUGS]
  );

  const setDose = useCallback((id, dose) => {
    setCurrentDrugs((prev) => prev.map((x) => (x.id === id ? { ...x, dose } : x)));
  }, []);

  const toggleModifier = useCallback((id) => {
    setModifiers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const reset = useCallback(() => {
    setPhase(1);
    setCurrentDrugs([]);
    setModifiers([]);
    setMetricValues({});
    setOverrideStatus(null);
  }, []);

  const controlStatus = useMemo(
    () => deriveControlStatus(metricValues, CONTROL_METRIC.deriveStatus, overrideStatus, modifiers),
    [metricValues, overrideStatus, CONTROL_METRIC, modifiers]
  );

  const currentState = useMemo(() => detectCurrentState(currentDrugs, DRUGS), [currentDrugs, DRUGS]);

  const drugGroups = useMemo(() => {
    const g = {};
    DRUGS.forEach((d) => {
      if (!g[d.class]) g[d.class] = [];
      g[d.class].push(d);
    });
    return g;
  }, [DRUGS]);

  const modifierGroups = useMemo(() => {
    const g = {};
    MODIFIERS.forEach((m) => {
      if (!g[m.cat]) g[m.cat] = [];
      g[m.cat].push(m);
    });
    return g;
  }, [MODIFIERS]);

  const activeDoNot = useMemo(() => {
    return DO_NOT_RULES.filter((r) => r.modifiers && r.modifiers.some((m) => modifiers.includes(m)));
  }, [modifiers, DO_NOT_RULES]);

  const urgentRecs = useMemo(() => {
    return RECOMMENDATIONS.filter(
      (r) =>
        r.urgentWhen &&
        r.urgentWhen.some((m) => modifiers.includes(m)) &&
        // Urgent banner must also respect forbidden — never show a contraindicated drug as urgent
        !(r.forbidden && r.forbidden.some((f) => modifiers.includes(f)))
    );
  }, [RECOMMENDATIONS, modifiers]);

  // Synthesized recs: DOSE_UP + MAINTAIN
  const doseUpRecs = useMemo(
    () => synthesizeDoseUpRecs(currentDrugs, DRUGS, modifiers),
    [currentDrugs, DRUGS, modifiers]
  );

  // DO_NOT ruleが current regimen に関連するかどうかを判定する
  // （例: 痛風患者でサイアザイドDO_NOTが発火しても、患者がサイアザイド非服用なら MAINTAIN 抑制の必要なし）
  const relevantDoNot = useMemo(() => {
    const currentClasses = getCurrentClasses(currentDrugs, DRUGS);
    return DO_NOT_RULES.some((r) => {
      if (!r.modifiers || !r.modifiers.some((m) => modifiers.includes(m))) return false;
      // DO_NOT rule の drug 文字列に current class が含まれるかを緩くマッチング
      const ruleText = r.drug || '';
      return [...currentClasses].some((cls) => ruleText.includes(cls));
    });
  }, [currentDrugs, DRUGS, modifiers, DO_NOT_RULES]);

  // MAINTAIN: controlStatus === 'controlled' でのみ発火。ブロッカー・緊急・関連DO_NOTで抑制。
  // CKD/DM等の合併症は reassess/note に反映。
  const maintainRec = useMemo(() => {
    if (controlStatus !== 'controlled') return null;
    if (MAINTAIN_BLOCKERS.some((m) => modifiers.includes(m))) return null;
    if (urgentRecs.length > 0) return null;
    if (relevantDoNot) return null;
    return synthesizeMaintainRec(currentDrugs, DRUGS, modifiers);
  }, [controlStatus, currentDrugs, DRUGS, modifiers, urgentRecs, relevantDoNot]);

  // WATCH: controlStatus === 'near_target' で発火（目標+5〜+15mmHg、様子見ゾーン）
  // 高リスク（DM/post-MI/HF/蛋白尿）併存時は WATCH primary を抑制し、介入案を優先表示させる。
  const watchRec = useMemo(() => {
    if (controlStatus !== 'near_target') return null;
    if (MAINTAIN_BLOCKERS.some((m) => modifiers.includes(m))) return null;
    if (urgentRecs.length > 0) return null;
    if (relevantDoNot) return null;
    const isHighRisk = ['cm_dm', 'cm_post_mi', 'cm_hf', 'cm_proteinuria'].some((m) =>
      modifiers.includes(m)
    );
    if (isHighRisk) return null;
    return synthesizeWatchRec(currentDrugs, DRUGS, modifiers);
  }, [controlStatus, currentDrugs, DRUGS, modifiers, urgentRecs, relevantDoNot]);

  // Ranked recs (excluding urgent banner items)
  const rankedRecs = useMemo(() => {
    const urgentIds = new Set(urgentRecs.map((r) => r.id));
    const allRecs = [...RECOMMENDATIONS, ...doseUpRecs];
    return allRecs
      .map((r) => {
        const { score, excluded, reason } = calcScore(r, currentDrugs, modifiers, controlStatus, DRUGS);
        return { ...r, _score: score, _excluded: excluded, _reason: reason };
      })
      .filter((r) => r._score > 0 && !urgentIds.has(r.id))
      .sort((a, b) => b._score - a._score);
  }, [RECOMMENDATIONS, doseUpRecs, DRUGS, currentDrugs, modifiers, controlStatus, urgentRecs]);

  const { primary, alternates, later } = useMemo(
    () => splitTiers(rankedRecs, controlStatus),
    [rankedRecs, controlStatus]
  );

  // Inject MAINTAIN / WATCH at the top
  const primaryWithMaintain = useMemo(() => {
    if (maintainRec) return [maintainRec, ...primary];
    if (watchRec) return [watchRec, ...primary];
    return primary;
  }, [maintainRec, watchRec, primary]);

  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Treatment Booster</p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.phaseIndicator}>Phase {phase}/3</span>
          <button className={styles.resetBtn} onClick={reset}>
            リセット
          </button>
        </div>
      </div>

      {urgentRecs.length > 0 && (
        <div className={styles.urgentBox}>
          {urgentRecs.map((r) => (
            <div key={r.id} className={styles.urgentItem}>
              &#128680; <strong>緊急 / {actionLabel(r.action)}:</strong> {r.drug}
              {r.note && <div className={styles.urgentNote}>{r.note}</div>}
            </div>
          ))}
        </div>
      )}

      {activeDoNot.length > 0 && (
        <div className={styles.doNotBox}>
          {activeDoNot.map((r, i) => (
            <div key={i} className={styles.doNotItem}>
              &#10060; <strong>{r.drug}</strong>: {r.reason}
            </div>
          ))}
        </div>
      )}

      {currentDrugs.length > 0 && phase >= 1 && (
        <div className={styles.stateBar}>
          現在の治療ステート: <strong>{stateLabel(currentState)}</strong>
        </div>
      )}

      {/* Phase 1: 現在の治療 */}
      {phase >= 1 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 1: 現在の治療
            <span className={styles.sectionHint}>（服用中の薬剤と用量を選択・未治療可）</span>
          </h4>
          {Object.entries(drugGroups).map(([cls, items]) => (
            <div key={cls} className={styles.catGroup}>
              <span className={styles.catLabel}>{cls}</span>
              <div className={styles.chipGrid}>
                {items.map((d) => {
                  const active = currentDrugs.find((x) => x.id === d.id);
                  return (
                    <div key={d.id} className={styles.drugChipWrap}>
                      <button
                        className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                        onClick={() => toggleDrug(d.id)}
                      >
                        {d.label}
                      </button>
                      {active && d.doses && (
                        <div className={styles.dosePicker}>
                          {d.doses.map((dose) => (
                            <button
                              key={dose.value}
                              className={`${styles.doseChip} ${
                                active.dose === dose.value ? styles.doseChipActive : ''
                              }`}
                              onClick={() => setDose(d.id, dose.value)}
                            >
                              {dose.label}
                              {dose.isMax && <span className={styles.maxBadge}>最大</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {phase === 1 && (
            <button className={styles.nextBtn} onClick={() => setPhase(2)}>
              Phase 2: コントロール状態・修飾因子へ進む
            </button>
          )}
        </div>
      )}

      {/* Phase 2 */}
      {phase >= 2 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 2: コントロール状態・修飾因子
            <span className={styles.sectionHint}>（数値入力 + 該当するチップを選択）</span>
          </h4>

          {CONTROL_METRIC.label && (
            <div className={styles.metricBox}>
              <label className={styles.metricLabel}>{CONTROL_METRIC.label}</label>
              <div className={styles.metricInputs}>
                {(CONTROL_METRIC.inputs || []).map((inp) => (
                  <div key={inp.id} className={styles.metricInputGroup}>
                    <span className={styles.inputHint}>{inp.label}</span>
                    <input
                      type="number"
                      className={styles.numberInput}
                      value={metricValues[inp.id] ?? ''}
                      onChange={(e) =>
                        setMetricValues({
                          ...metricValues,
                          [inp.id]:
                            e.target.value === '' ? undefined : parseFloat(e.target.value),
                        })
                      }
                      placeholder={inp.placeholder || ''}
                    />
                    <span className={styles.inputUnit}>{inp.unit}</span>
                  </div>
                ))}
              </div>
              {(metricValues.sbp !== undefined || metricValues.dbp !== undefined) && (
                <div className={styles.targetLine}>
                  適用目標: <strong>{formatAppliedTarget(modifiers)}</strong>
                  {suggestAgeNudge(metricValues, modifiers) && (
                    <span className={styles.ageNudge}>
                      &#128161; 75歳以上なら「75歳以上の高齢者」を選択してください（目標緩和）
                    </span>
                  )}
                </div>
              )}
              {controlStatus && (
                <div className={styles.statusRow}>
                  {['controlled', 'near_target', 'uncontrolled'].map((s) => (
                    <button
                      key={s}
                      className={`${styles.statusChip} ${
                        controlStatus === s ? styles[`status_${s}`] : ''
                      }`}
                      onClick={() => setOverrideStatus(overrideStatus === s ? null : s)}
                    >
                      {statusLabel(s)}
                      {overrideStatus === s ? ' (手動)' : ''}
                    </button>
                  ))}
                </div>
              )}
              {CONTROL_METRIC.note && <p className={styles.metricNote}>{CONTROL_METRIC.note}</p>}
            </div>
          )}

          {Object.entries(modifierGroups).map(([cat, items]) => (
            <div key={cat} className={styles.catGroup}>
              <span className={styles.catLabel}>{cat}</span>
              <div className={styles.chipGrid}>
                {items.map((m) => (
                  <button
                    key={m.id}
                    className={`${styles.chip} ${
                      modifiers.includes(m.id) ? styles.chipActive : ''
                    } ${m.severity === 'critical' ? styles.chipCritical : ''}`}
                    onClick={() => toggleModifier(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {phase === 2 && (
            <button className={styles.nextBtn} onClick={() => setPhase(3)}>
              Phase 3: 推奨修正を表示
            </button>
          )}
        </div>
      )}

      {/* Phase 3: Tiered recommendations */}
      {phase >= 3 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 3: 推奨治療修正
            <span className={styles.sectionHint}>
              （Primary {primaryWithMaintain.length}件 / Alt {alternates.length}件 / Later{' '}
              {later.length}件）
            </span>
          </h4>

          {primaryWithMaintain.length === 0 && alternates.length === 0 && later.length === 0 ? (
            <p className={styles.noResult}>
              条件に合う推奨がありません。
              {currentDrugs.length === 0 && controlStatus === null
                ? '現在の治療または指標を入力してください。'
                : '現在の治療を見直すか、禁忌の修飾因子を確認してください。'}
            </p>
          ) : (
            <div className={styles.recList}>
              {primaryWithMaintain.length > 0 && (
                <>
                  <div className={styles.tierLabel}>推奨（Primary）</div>
                  {primaryWithMaintain.map((r, idx) => (
                    <RecCard key={r.id} rec={r} rank={idx + 1} open={true} />
                  ))}
                </>
              )}
              {alternates.length > 0 && (
                <>
                  <div className={styles.tierLabel}>代替案（Alternates）</div>
                  {alternates.map((r, idx) => (
                    <RecCard
                      key={r.id}
                      rec={r}
                      rank={primaryWithMaintain.length + idx + 1}
                      open={false}
                    />
                  ))}
                </>
              )}
              {later.length > 0 && (
                <>
                  <div className={styles.tierLabel}>後で検討（Later）</div>
                  {later.map((r, idx) => (
                    <RecCard
                      key={r.id}
                      rec={r}
                      rank={primaryWithMaintain.length + alternates.length + idx + 1}
                      open={false}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        本ツールは治療思考の補助であり、臨床判断を代替するものではありません。薬剤選択・用量・中止の最終判断は主治医が行ってください。
      </div>
    </div>
  );
}

function RecCard({ rec, rank, open }) {
  return (
    <details
      className={`${styles.recCard} ${styles[`rec_${rec.action.toLowerCase()}`] || ''}`}
      open={open}
    >
      <summary className={styles.recSummary}>
        <span className={styles.recRank}>#{rank}</span>
        <span className={`${styles.recAction} ${styles[`action_${rec.action.toLowerCase()}`] || ''}`}>
          {actionLabel(rec.action)}
        </span>
        <span className={styles.recDrug}>{rec.drug}</span>
        {rec.specialistGate && <span className={styles.specialistTag}>要専門医</span>}
      </summary>
      <div className={styles.recBody}>
        {rec.example && (
          <div className={styles.recExample}>
            <strong>処方例:</strong> {rec.example}
          </div>
        )}
        {rec.reason && (
          <div className={styles.recReason}>
            <strong>理由:</strong> {rec.reason}
          </div>
        )}
        {rec.connectedAlert && (
          <div className={styles.connectedAlert}>
            &#128279; <strong>連携疾患:</strong> {rec.connectedAlert}
          </div>
        )}
        {rec.reassess && (
          <div className={styles.reassess}>
            &#9200; <strong>再評価:</strong> {rec.reassess}
          </div>
        )}
        {rec.note && <p className={styles.recNote}>{rec.note}</p>}
      </div>
    </details>
  );
}

function stateLabel(state) {
  return (
    {
      naive: '無治療',
      mono: '単剤療法',
      dual: '2剤併用',
      triple: '3剤併用',
      quad_plus: '4剤以上',
    }[state] || state
  );
}

function statusLabel(s) {
  return (
    {
      controlled: 'コントロール良好（目標内）',
      near_target: '目標+5〜+15（様子見）',
      partial: '部分的',
      uncontrolled: 'コントロール不良（+15以上）',
    }[s] || s
  );
}

function formatAppliedTarget(modifiers) {
  const isElderly = modifiers.includes('co_elderly') || modifiers.includes('co_frail');
  const isHighRisk = [
    'cm_dm',
    'cm_ckd',
    'cm_ckd_adv',
    'cm_proteinuria',
    'cm_cad',
    'cm_post_mi',
    'cm_hf',
  ].some((m) => modifiers.includes(m));
  if (isElderly && !isHighRisk) return '< 135/85 mmHg（75歳以上・高リスク非合併）';
  if (isHighRisk) return '< 125/75 mmHg（高リスク併存で厳格目標）';
  return '< 125/75 mmHg（一般成人）';
}

// SBPが125-145付近・DBPが75-92付近だが co_elderly が未選択の場合に表示するヒント
function suggestAgeNudge(values, modifiers) {
  if (modifiers.includes('co_elderly') || modifiers.includes('co_frail')) return false;
  const s = values.sbp;
  const d = values.dbp;
  // 目標+5〜+15に相当するゾーン（高齢者だと目標内になる可能性がある）
  const sInNudgeZone = s !== undefined && s >= 130 && s < 145;
  const dInNudgeZone = d !== undefined && d >= 80 && d < 92;
  return sInNudgeZone || dInNudgeZone;
}

function actionLabel(action) {
  return (
    {
      MAINTAIN: '現状維持',
      WATCH: '経過観察',
      DOSE_UP: '増量',
      STEP_UP: 'ステップアップ',
      ADD: '薬剤追加',
      SWITCH: '薬剤変更',
      TAPER: '減量',
      STOP: '中止',
      REFER: '紹介',
    }[action] || action
  );
}
