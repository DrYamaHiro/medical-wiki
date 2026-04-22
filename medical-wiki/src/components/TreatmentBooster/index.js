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

// Modifiers that contradict "現状維持" — any of these present = do not recommend MAINTAIN
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
  'cm_bilateral_rvs',
  'cm_ckd_adv',
  'cm_aortic_stenosis',
  'co_pregnancy',
  'rf_severe_ht',
  'rf_2nd_suspect',
  'rf_hypoK_severe',
  'rf_target_organ',
];

function synthesizeMaintainRec(currentDrugs, allDrugs) {
  const drugLabels = currentDrugs
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
  return {
    id: '_maintain',
    action: 'MAINTAIN',
    drug: '現状維持（コントロール良好）',
    example: drugLabels ? `現行処方を継続: ${drugLabels}` : '未治療継続',
    reason:
      '家庭血圧の平均値が目標範囲内。不要な薬剤変更はアドヒアランス低下・副作用リスクの原因。現行処方を継続し、次回は4-8週後に再評価',
    reassess: '4-8週後に家庭血圧再確認。生活習慣（減塩・運動・減量）の強化は継続',
    note: 'シーズン変動・服薬遵守の低下・併用薬変化で血圧は揺らぐ。急変がなければ維持が最善手',
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

  // Same-class suppression: ADD rec for a class already in currentDrugs is nonsensical
  // (e.g., "add CCB" when patient is already on amlodipine)
  if (rec.action === 'ADD' && rec.drugClass) {
    const currentClasses = getCurrentClasses(currentDrugs, allDrugs);
    if (currentClasses.has(rec.drugClass)) {
      return { score: -1, excluded: 'same-class' };
    }
  }

  // Combo-switch gating: mono→combo switch should require max dose reached on current mono
  // UNLESS an urgent Grade II trigger is present
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
    else if (controlStatus === 'partial') score += 6;
    else if (controlStatus === 'controlled') score -= 12;
    else score += 4;
  } else if (rec.action === 'TAPER' || rec.action === 'STOP') {
    if (controlStatus === 'controlled') score += 8;
    else if (controlStatus === 'partial') score += 2;
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

  // DOSE_UP は ADD/STEP_UP より優先（同一薬剤の調整を先に試す）
  if (rec.action === 'DOSE_UP' && (controlStatus === 'partial' || controlStatus === 'uncontrolled')) {
    score += 4;
  }

  // Preferred modifiers: asymmetric — controlled 状態のときはエスカレーションへのブーストを停止
  if (rec.preferredWhen) {
    const matches = rec.preferredWhen.filter((m) => modifiers.includes(m));
    if (isEscalation && controlStatus === 'controlled') {
      // エスカレーションを正当化しない
    } else {
      score += matches.length * 3;
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
    partial: { primary: 1, alternates: 2, later: 3 },
    uncontrolled: { primary: 1, alternates: 2, later: 4 },
    null_: { primary: 1, alternates: 2, later: 3 },
  };
  const key = controlStatus || 'null_';
  const cap = caps[key];
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

function deriveControlStatus(values, deriveFn, override) {
  if (override) return override;
  if (!deriveFn) return null;
  return deriveFn(values);
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
    () => deriveControlStatus(metricValues, CONTROL_METRIC.deriveStatus, overrideStatus),
    [metricValues, overrideStatus, CONTROL_METRIC]
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

  const maintainRec = useMemo(() => {
    if (controlStatus !== 'controlled') return null;
    // Suppress MAINTAIN when blocker modifiers present (side effects, red flags, critical comorbidities)
    if (MAINTAIN_BLOCKERS.some((m) => modifiers.includes(m))) return null;
    // Suppress MAINTAIN when urgent recs present (urgent + maintain = contradictory)
    if (urgentRecs.length > 0) return null;
    // Suppress MAINTAIN when active DO_NOT rules present
    const hasDoNot = DO_NOT_RULES.some(
      (r) => r.modifiers && r.modifiers.some((m) => modifiers.includes(m))
    );
    if (hasDoNot) return null;
    return synthesizeMaintainRec(currentDrugs, DRUGS);
  }, [controlStatus, currentDrugs, DRUGS, modifiers, urgentRecs, DO_NOT_RULES]);

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

  // Inject MAINTAIN at the top when controlled
  const primaryWithMaintain = useMemo(() => {
    if (maintainRec) return [maintainRec, ...primary];
    return primary;
  }, [maintainRec, primary]);

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
              {controlStatus && (
                <div className={styles.statusRow}>
                  {['controlled', 'partial', 'uncontrolled'].map((s) => (
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
      controlled: 'コントロール良好',
      partial: '部分的',
      uncontrolled: 'コントロール不良',
    }[s] || s
  );
}

function actionLabel(action) {
  return (
    {
      MAINTAIN: '現状維持',
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
