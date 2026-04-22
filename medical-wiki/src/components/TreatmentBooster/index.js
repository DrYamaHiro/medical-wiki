import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

/* -------------------------------------------------------- */
/*  Scoring: 現在の治療 + 修飾因子から各推奨の適合度を算出    */
/* -------------------------------------------------------- */
function calcScore(rec, currentDrugs, modifiers, controlStatus) {
  // fromStates条件: 現在の治療ステートに適合しない推奨は除外
  const currentState = detectCurrentState(currentDrugs, rec._allDrugs);
  if (rec.fromStates && !rec.fromStates.includes(currentState)) {
    return { score: -1, excluded: 'state-mismatch' };
  }

  // 禁忌チェック: forbidden修飾因子があれば除外
  if (rec.forbidden && rec.forbidden.some((f) => modifiers.includes(f))) {
    return { score: -1, excluded: 'forbidden', reason: rec.forbidden };
  }

  let score = 0;

  // Control score: 推奨アクションとコントロール状態の整合性
  if (rec.action === 'STEP_UP' || rec.action === 'ADD') {
    if (controlStatus === 'uncontrolled') score += 10;
    else if (controlStatus === 'partial') score += 6;
    else if (controlStatus === 'controlled') score -= 5; // penalize step-up when controlled
  } else if (rec.action === 'TAPER' || rec.action === 'STOP') {
    if (controlStatus === 'controlled') score += 8;
    else if (controlStatus === 'partial') score += 2;
    else score -= 10;
  } else if (rec.action === 'SWITCH') {
    // SWITCH depends on side effect presence
    if (rec.triggerSideEffects && rec.triggerSideEffects.some((s) => modifiers.includes(s))) {
      score += 10;
    } else {
      score += 3;
    }
  } else if (rec.action === 'REFER') {
    if (controlStatus === 'uncontrolled') score += 5;
  }

  // Preferred modifiers: comorbidity-specific boost
  if (rec.preferredWhen) {
    const matches = rec.preferredWhen.filter((m) => modifiers.includes(m));
    score += matches.length * 3;
  }

  // Avoid modifiers: soft penalty
  if (rec.avoidWhen) {
    const matches = rec.avoidWhen.filter((m) => modifiers.includes(m));
    score -= matches.length * 4;
  }

  // Side effect relief: boost SWITCH/TAPER if matching side effect
  if (rec.triggerSideEffects) {
    const matches = rec.triggerSideEffects.filter((s) => modifiers.includes(s));
    score += matches.length * 5;
  }

  // Red flag floor: specialist/refer with severe triggers stays top-3
  if (rec.action === 'REFER' && rec.urgentWhen) {
    const matches = rec.urgentWhen.filter((m) => modifiers.includes(m));
    if (matches.length > 0) {
      score = Math.max(score, 15);
    }
  }

  return { score, excluded: null };
}

/* -------------------------------------------------------- */
/*  Detect current treatment state from selected drugs     */
/* -------------------------------------------------------- */
function detectCurrentState(currentDrugs, allDrugs) {
  if (currentDrugs.length === 0) return 'naive';
  // Group by class
  const classes = new Set();
  currentDrugs.forEach((id) => {
    const drug = allDrugs.find((d) => d.id === id);
    if (drug) classes.add(drug.class);
  });
  const count = classes.size;
  if (count === 1) return 'mono';
  if (count === 2) return 'dual';
  if (count === 3) return 'triple';
  return 'quad_plus';
}

/* -------------------------------------------------------- */
/*  Derive control status from metric value                 */
/* -------------------------------------------------------- */
function deriveControlStatus(metric, values, controlThresholds, overrideStatus) {
  if (overrideStatus) return overrideStatus;
  if (!controlThresholds) return null;
  return controlThresholds(values);
}

/* -------------------------------------------------------- */
/*  Main Component                                          */
/* -------------------------------------------------------- */
export default function TreatmentBooster({
  drugs: propDrugs,
  modifiers: propModifiers,
  controlMetric: propControlMetric,
  recommendations: propRecommendations,
  doNotRules: propDoNotRules,
  subtitle: propSubtitle,
  disease: propDisease,
}) {
  const DRUGS = propDrugs || [];
  const MODIFIERS = propModifiers || [];
  const CONTROL_METRIC = propControlMetric || {};
  const RECOMMENDATIONS = propRecommendations || [];
  const DO_NOT_RULES = propDoNotRules || [];
  const subtitle = propSubtitle || '治療修正の思考支援ツール';

  const [phase, setPhase] = useState(1);
  const [currentDrugs, setCurrentDrugs] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [metricValues, setMetricValues] = useState({});
  const [overrideStatus, setOverrideStatus] = useState(null);

  const toggleDrug = useCallback((id) => {
    setCurrentDrugs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleModifier = useCallback((id) => {
    setModifiers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const reset = useCallback(() => {
    setPhase(1);
    setCurrentDrugs([]);
    setModifiers([]);
    setMetricValues({});
    setOverrideStatus(null);
  }, []);

  const controlStatus = useMemo(() => {
    return deriveControlStatus(
      CONTROL_METRIC,
      metricValues,
      CONTROL_METRIC.deriveStatus,
      overrideStatus
    );
  }, [metricValues, overrideStatus, CONTROL_METRIC]);

  const currentState = useMemo(
    () => detectCurrentState(currentDrugs, DRUGS),
    [currentDrugs, DRUGS]
  );

  // Group drugs by class for display
  const drugGroups = useMemo(() => {
    const g = {};
    DRUGS.forEach((d) => {
      if (!g[d.class]) g[d.class] = [];
      g[d.class].push(d);
    });
    return g;
  }, [DRUGS]);

  // Group modifiers by category
  const modifierGroups = useMemo(() => {
    const g = {};
    MODIFIERS.forEach((m) => {
      if (!g[m.cat]) g[m.cat] = [];
      g[m.cat].push(m);
    });
    return g;
  }, [MODIFIERS]);

  // Active DO NOT rules
  const activeDoNot = useMemo(() => {
    return DO_NOT_RULES.filter((r) => {
      if (r.modifiers) {
        return r.modifiers.some((m) => modifiers.includes(m));
      }
      return false;
    });
  }, [modifiers, DO_NOT_RULES]);

  // Urgent recommendations (Red Flag triggered) — always visible banner
  const urgentRecs = useMemo(() => {
    return RECOMMENDATIONS.filter((r) => {
      if (!r.urgentWhen) return false;
      return r.urgentWhen.some((m) => modifiers.includes(m));
    });
  }, [RECOMMENDATIONS, modifiers]);

  // Ranked recommendations (excluding urgent ones shown in banner)
  const rankedRecs = useMemo(() => {
    const urgentIds = new Set(urgentRecs.map((r) => r.id));
    return RECOMMENDATIONS.map((r) => {
      const { score, excluded, reason } = calcScore(
        { ...r, _allDrugs: DRUGS },
        currentDrugs,
        modifiers,
        controlStatus
      );
      return { ...r, _score: score, _excluded: excluded, _reason: reason };
    })
      .filter((r) => r._score > 0 && !urgentIds.has(r.id))
      .sort((a, b) => b._score - a._score);
  }, [RECOMMENDATIONS, DRUGS, currentDrugs, modifiers, controlStatus, urgentRecs]);

  return (
    <div className={styles.booster}>
      {/* ヘッダー */}
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

      {/* 緊急推奨バナー（Red Flag発動時・常時最上位） */}
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

      {/* アクティブなDO NOT警告 */}
      {activeDoNot.length > 0 && (
        <div className={styles.doNotBox}>
          {activeDoNot.map((r, i) => (
            <div key={i} className={styles.doNotItem}>
              &#10060; <strong>{r.drug}</strong>: {r.reason}
            </div>
          ))}
        </div>
      )}

      {/* 現在の治療ステート表示 */}
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
            <span className={styles.sectionHint}>（服用中の薬剤を選択・未治療可）</span>
          </h4>
          {Object.entries(drugGroups).map(([cls, items]) => (
            <div key={cls} className={styles.catGroup}>
              <span className={styles.catLabel}>{cls}</span>
              <div className={styles.chipGrid}>
                {items.map((d) => (
                  <button
                    key={d.id}
                    className={`${styles.chip} ${
                      currentDrugs.includes(d.id) ? styles.chipActive : ''
                    }`}
                    onClick={() => toggleDrug(d.id)}
                  >
                    {d.label}
                  </button>
                ))}
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

      {/* Phase 2: コントロール状態 + 修飾因子 */}
      {phase >= 2 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 2: コントロール状態・修飾因子
            <span className={styles.sectionHint}>
              （数値入力 + 該当するチップを選択）
            </span>
          </h4>

          {/* 数値入力 */}
          {CONTROL_METRIC.label && (
            <div className={styles.metricBox}>
              <label className={styles.metricLabel}>
                {CONTROL_METRIC.label}
              </label>
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
                          [inp.id]: e.target.value === '' ? undefined : parseFloat(e.target.value),
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
                      onClick={() =>
                        setOverrideStatus(overrideStatus === s ? null : s)
                      }
                    >
                      {statusLabel(s)}
                      {overrideStatus === s ? ' (手動)' : ''}
                    </button>
                  ))}
                </div>
              )}
              {CONTROL_METRIC.note && (
                <p className={styles.metricNote}>{CONTROL_METRIC.note}</p>
              )}
            </div>
          )}

          {/* 修飾因子チップ */}
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

      {/* Phase 3: 推奨修正 */}
      {phase >= 3 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 3: 推奨治療修正
            <span className={styles.sectionHint}>（適合度順 / {rankedRecs.length}件）</span>
          </h4>

          {rankedRecs.length === 0 ? (
            <p className={styles.noResult}>
              条件に合う推奨がありません。
              {currentDrugs.length === 0 && controlStatus === null
                ? '現在の治療または指標を入力してください。'
                : '現在の治療を見直すか、禁忌の修飾因子を確認してください。'}
            </p>
          ) : (
            <div className={styles.recList}>
              {rankedRecs.map((r, idx) => (
                <details
                  key={r.id}
                  className={`${styles.recCard} ${styles[`rec_${r.action.toLowerCase()}`]}`}
                  open={idx < 3}
                >
                  <summary className={styles.recSummary}>
                    <span className={styles.recRank}>#{idx + 1}</span>
                    <span
                      className={`${styles.recAction} ${styles[`action_${r.action.toLowerCase()}`]}`}
                    >
                      {actionLabel(r.action)}
                    </span>
                    <span className={styles.recDrug}>{r.drug}</span>
                    {r.specialistGate && (
                      <span className={styles.specialistTag}>要専門医</span>
                    )}
                  </summary>
                  <div className={styles.recBody}>
                    {r.example && (
                      <div className={styles.recExample}>
                        <strong>処方例:</strong> {r.example}
                      </div>
                    )}
                    {r.reason && (
                      <div className={styles.recReason}>
                        <strong>理由:</strong> {r.reason}
                      </div>
                    )}
                    {r.connectedAlert && (
                      <div className={styles.connectedAlert}>
                        &#128279; <strong>連携疾患:</strong> {r.connectedAlert}
                      </div>
                    )}
                    {r.reassess && (
                      <div className={styles.reassess}>
                        &#9200; <strong>再評価:</strong> {r.reassess}
                      </div>
                    )}
                    {r.note && <p className={styles.recNote}>{r.note}</p>}
                  </div>
                </details>
              ))}
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
  return { controlled: 'コントロール良好', partial: '部分的', uncontrolled: 'コントロール不良' }[s] || s;
}

function actionLabel(action) {
  return (
    {
      STEP_UP: 'ステップアップ',
      ADD: '薬剤追加',
      SWITCH: '薬剤変更',
      TAPER: '減量',
      STOP: '中止',
      REFER: '紹介',
    }[action] || action
  );
}
