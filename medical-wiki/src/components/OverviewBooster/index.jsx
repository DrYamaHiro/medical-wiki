import React, { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { OVERVIEW_DISEASES, DISEASE_CATEGORIES, GOUT_ULT_THRESHOLDS, HFPEF_SGLT2_EVIDENCE, getAllTreatmentBoosterDrugs } from './overviewRegistry';
import { LIFESTYLE_OPTIONS, LIFESTYLE_RESTRICTION_REASONS } from './lifestyleOptions';
import { LIFESTYLE_RECOMMENDATIONS_V01 } from './lifestyleRecommendationsV01';
import { OVERVIEW_CONTRAINDICATIONS_VERSION, OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED, evaluateContraindications } from './overviewContraindications';
import { SCORE_DEFINITIONS } from './scoreDefinitions';
import { encodeFollowupCode, decodeFollowupCode } from './followCode';
import { recordEvent } from './uxLog';

/* ============================================================
   State / Reducer
   ============================================================ */
const initialState = {
  step: 'entry', // 'entry' | 'step0' | 'step0_5' | 'step1' | 'summary'
  patientHeader: {
    age: '', sex: '',
    co_pregnancy: false, co_lactation: false,
    co_frail: false, co_elderly_75: false,
    currentMeds: [],
    note: '',
  },
  selectedDiseases: [],
  scoresByDisease: {},
  selectionsByDisease: {},
  uiState: { expandedDiseaseId: null, reverseTriggerDismissed: false },
  followupCode: { issued: '', importBuf: '', importError: null, oldDataWarning: false },
  startedAt: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'GOTO_STEP': return { ...state, step: action.payload };
    case 'SET_PATIENT_HEADER':
      return { ...state, patientHeader: { ...state.patientHeader, ...action.payload } };
    case 'TOGGLE_DISEASE': {
      const set = new Set(state.selectedDiseases);
      const id = action.payload;
      if (set.has(id)) {
        set.delete(id);
        const newSel = { ...state.selectionsByDisease }; delete newSel[id];
        const newScore = { ...state.scoresByDisease }; delete newScore[id];
        return { ...state, selectedDiseases: [...set], selectionsByDisease: newSel, scoresByDisease: newScore };
      } else {
        set.add(id);
        return { ...state, selectedDiseases: [...set] };
      }
    }
    case 'SET_SCORE_INPUT': {
      const { disease, input } = action.payload;
      return {
        ...state,
        scoresByDisease: {
          ...state.scoresByDisease,
          [disease]: { ...(state.scoresByDisease[disease] || {}), input: { ...(state.scoresByDisease[disease]?.input || {}), ...input } },
        },
      };
    }
    case 'SET_SCORE_RESULT': {
      const { disease, kind, result } = action.payload;
      return {
        ...state,
        scoresByDisease: {
          ...state.scoresByDisease,
          [disease]: { ...(state.scoresByDisease[disease] || {}), kind, result, scoredAt: new Date().toISOString() },
        },
      };
    }
    case 'SKIP_SCORE': {
      const { disease } = action.payload;
      return {
        ...state,
        scoresByDisease: {
          ...state.scoresByDisease,
          [disease]: { ...(state.scoresByDisease[disease] || {}), skipped: true },
        },
      };
    }
    case 'TOGGLE_DRUG': {
      const { disease, drugId } = action.payload;
      const cur = state.selectionsByDisease[disease] || { drugIds: [], lifestyle: '', restriction: null };
      const set = new Set(cur.drugIds);
      if (set.has(drugId)) set.delete(drugId); else set.add(drugId);
      return {
        ...state,
        selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, drugIds: [...set] } },
      };
    }
    case 'SET_LIFESTYLE': {
      const { disease, lifestyle } = action.payload;
      const cur = state.selectionsByDisease[disease] || { drugIds: [], lifestyle: '', restriction: null };
      const restriction = lifestyle === 'lifestyle_diet_exercise_restricted' ? cur.restriction : null;
      return {
        ...state,
        selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, lifestyle, restriction } },
      };
    }
    case 'SET_RESTRICTION': {
      const { disease, restriction } = action.payload;
      const cur = state.selectionsByDisease[disease] || { drugIds: [], lifestyle: '', restriction: null };
      return {
        ...state,
        selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, restriction } },
      };
    }
    case 'TOGGLE_ACCORDION': {
      const id = action.payload;
      return {
        ...state,
        uiState: { ...state.uiState, expandedDiseaseId: state.uiState.expandedDiseaseId === id ? null : id },
      };
    }
    case 'DISMISS_REVERSE_TRIGGER':
      return { ...state, uiState: { ...state.uiState, reverseTriggerDismissed: true } };
    case 'SET_FOLLOWUP_CODE':
      return { ...state, followupCode: { ...state.followupCode, ...action.payload } };
    case 'IMPORT_FROM_CODE': {
      const { patientHeader, selectedDiseases, selectionsByDisease } = action.payload;
      return {
        ...initialState,
        step: 'step0_5',
        patientHeader: { ...initialState.patientHeader, ...patientHeader },
        selectedDiseases,
        selectionsByDisease,
        followupCode: { ...initialState.followupCode, oldDataWarning: true },
        startedAt: Date.now(),
      };
    }
    case 'RESET_ALL':
      return { ...initialState, step: 'entry' };
    default:
      return state;
  }
}

/* ============================================================
   ヘルパー: 疾患カテゴリの CSS class
   ============================================================ */
function categoryClass(cat) {
  return styles[`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`] || '';
}

/* ============================================================
   メインコンポーネント
   ============================================================ */
export default function OverviewBooster() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    recordEvent('booster_open', {});
  }, []);

  /* ---------- 各ステップ遷移ハンドラ ---------- */
  const goto = useCallback((step) => {
    dispatch({ type: 'GOTO_STEP', payload: step });
    recordEvent(`step_${step}`, { selectedCount: state.selectedDiseases.length });
  }, [state.selectedDiseases]);

  const handleNewPatient = useCallback(() => {
    if (state.selectedDiseases.length > 0 || (state.followupCode.issued)) {
      const ok = window.confirm('次の患者を診療します。\n\n現在のセッション情報 (患者ヘッダー・選択疾患・スコア・薬剤・lifestyle) を全て消去します。');
      if (!ok) return;
    }
    dispatch({ type: 'RESET_ALL' });
    recordEvent('new_patient_session_reset', {});
  }, [state.selectedDiseases, state.followupCode]);

  const handleImportCode = useCallback(() => {
    const code = state.followupCode.importBuf;
    const result = decodeFollowupCode(code);
    if (!result.success) {
      dispatch({ type: 'SET_FOLLOWUP_CODE', payload: { importError: result.error } });
      recordEvent('code_decode_fail', { error: result.error });
      return;
    }
    dispatch({ type: 'IMPORT_FROM_CODE', payload: result.data });
    recordEvent('code_decode_success', { diseaseCount: result.data.selectedDiseases.length });
  }, [state.followupCode.importBuf]);

  const handleIssueCode = useCallback(() => {
    const code = encodeFollowupCode(state);
    if (code) {
      dispatch({ type: 'SET_FOLLOWUP_CODE', payload: { issued: code, oldDataWarning: false } });
      recordEvent('code_issued', {
        diseaseCount: state.selectedDiseases.length,
        codeLength: code.length,
        time_total_ms: Date.now() - startTimeRef.current,
      });
    }
  }, [state]);

  /* ---------- 禁忌評価 (リアルタイム) ---------- */
  const violations = useMemo(() => evaluateContraindications(state), [state.selectedDiseases, state.selectionsByDisease, state.scoresByDisease, state.patientHeader]);

  /* ---------- 逆引きトリガー ---------- */
  const reverseTriggerProposals = useMemo(() => {
    if (state.uiState.reverseTriggerDismissed) return [];
    const meds = state.patientHeader.currentMeds || [];
    if (meds.length === 0) return [];
    const allDrugs = getAllTreatmentBoosterDrugs();
    const proposed = new Set();
    for (const id of meds) {
      const drug = allDrugs.find((d) => d.id === id);
      if (!drug) continue;
      // booster key → disease key 変換
      const disease = OVERVIEW_DISEASES.find((d) => d.boosterKey === drug.boosterKey);
      if (disease && !state.selectedDiseases.includes(disease.key)) proposed.add(disease.key);
    }
    return [...proposed];
  }, [state.patientHeader.currentMeds, state.selectedDiseases, state.uiState.reverseTriggerDismissed]);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>📖 Overview Booster — 慢性疾患統合俯瞰</p>
          <p className={styles.subtitle}>多疾患併存の薬剤俯瞰・食事運動・フォローコード生成</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.stepIndicator}>
            STEP: {state.step === 'entry' ? '入口' : state.step === 'step0' ? '0 (疾患選択)' : state.step === 'step0_5' ? '0.5 (スコア)' : state.step === 'step1' ? '1 (薬剤・食事運動)' : 'まとめ'}
          </span>
          <button className={styles.resetBtn} onClick={handleNewPatient} title="次患者の診療を開始 (全消去)">
            👤→👤 次の患者へ
          </button>
        </div>
      </div>

      <details className={styles.helpDetails}>
        <summary className={styles.helpSummary}>ℹ️ 使い方ガイド</summary>
        <div className={styles.helpBody}>
          <p><strong>このBoosterの目的</strong></p>
          <p>慢性疾患を**俯瞰的に把握**し、多疾患併存患者の薬剤・食事運動を1画面で整理。詳細処方判断は個別Treatment Boosterで行ってください。</p>
          <p><strong>STEP フロー</strong></p>
          <ol>
            <li><strong>入口</strong>: フォローコード入力 (再診) or 新規開始</li>
            <li><strong>STEP 0</strong>: 患者の慢性疾患を chip で選択</li>
            <li><strong>STEP 0.5</strong>: 5疾患 (DLP/HT/CKD/AF/COPD) でリスクスコア層別 (任意スキップ可)</li>
            <li><strong>STEP 1</strong>: 各疾患の主要薬剤 + 食事運動を toggle で選択</li>
            <li><strong>まとめ</strong>: フォローコード発行 + 禁忌警告 + 個別 Booster へ deep link</li>
          </ol>
          <p><strong>食事運動 3択</strong></p>
          <ul>
            <li>🍱 食事療法のみ — 重度整形/心不全代償破綻/運動絶対禁忌</li>
            <li>🍱+🏃 食事+運動療法 (default)</li>
            <li>🍱+🏃⚠ 食事+運動 [制限考慮] — 整形/心血管/呼吸/腎/フレイル等で運動制限あり</li>
          </ul>
        </div>
      </details>

      {/* Patient Header */}
      <PatientHeaderPanel state={state} dispatch={dispatch} />

      {/* Step routing */}
      {state.step === 'entry' && <EntryPanel state={state} dispatch={dispatch} onImport={handleImportCode} onNew={() => goto('step0')} />}
      {state.step === 'step0' && (
        <Step0Panel state={state} dispatch={dispatch}
          reverseProposals={reverseTriggerProposals}
          onNext={() => goto('step0_5')} onBack={() => goto('entry')}
        />
      )}
      {state.step === 'step0_5' && (
        <Step05Panel state={state} dispatch={dispatch}
          onNext={() => goto('step1')} onBack={() => goto('step0')}
        />
      )}
      {state.step === 'step1' && (
        <Step1Panel state={state} dispatch={dispatch} violations={violations}
          onNext={() => { handleIssueCode(); goto('summary'); }}
          onBack={() => goto('step0_5')}
        />
      )}
      {state.step === 'summary' && (
        <SummaryPanel state={state} violations={violations}
          onBack={() => goto('step1')}
          onCopy={() => navigator.clipboard?.writeText(state.followupCode.issued)}
        />
      )}

      <div className={styles.versionLabel}>
        禁忌ルール v{OVERVIEW_CONTRAINDICATIONS_VERSION} (最終更新: {OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED})
      </div>
    </div>
  );
}

/* ============================================================
   Patient Header
   ============================================================ */
// 年齢 range → ≥75歳判定
const AGE_75_RANGES = new Set(['75-79', '80-89', '90+']);

function PatientHeaderPanel({ state, dispatch }) {
  const update = (patch) => {
    // 年齢が変わったら co_elderly_75 を自動推定
    if (patch.age !== undefined) {
      patch.co_elderly_75 = AGE_75_RANGES.has(patch.age);
    }
    dispatch({ type: 'SET_PATIENT_HEADER', payload: patch });
  };
  return (
    <div className={styles.patientHeader}>
      <div className={styles.sectionTitle}>👤 患者ヘッダー <span className={styles.sectionHint}>(全STEP共有・患者切替時消去)</span></div>
      <div className={styles.patientGrid}>
        <div>
          <label className={styles.fieldLabel} htmlFor="ph_age">年齢層</label>
          <select id="ph_age" className={styles.fieldInput} value={state.patientHeader.age || ''} onChange={(e) => update({ age: e.target.value })}>
            <option value="">--</option>
            <option value="<40">&lt;40歳</option>
            <option value="40-49">40-49歳</option>
            <option value="50-59">50-59歳</option>
            <option value="60-64">60-64歳</option>
            <option value="65-69">65-69歳</option>
            <option value="70-74">70-74歳</option>
            <option value="75-79">75-79歳</option>
            <option value="80-89">80-89歳</option>
            <option value="90+">≥90歳</option>
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel} htmlFor="ph_sex">性別</label>
          <select id="ph_sex" className={styles.fieldInput} value={state.patientHeader.sex} onChange={(e) => update({ sex: e.target.value })}>
            <option value="">--</option>
            <option value="M">男性</option>
            <option value="F">女性</option>
          </select>
        </div>
        <CheckboxField id="ph_preg" label="妊娠中" checked={state.patientHeader.co_pregnancy} onChange={(v) => update({ co_pregnancy: v })} />
        <CheckboxField id="ph_lact" label="授乳中" checked={state.patientHeader.co_lactation} onChange={(v) => update({ co_lactation: v })} />
        <CheckboxField id="ph_frail" label="フレイル" checked={state.patientHeader.co_frail} onChange={(v) => update({ co_frail: v })} />
      </div>
    </div>
  );
}
function CheckboxField({ id, label, checked, onChange }) {
  return (
    <div>
      <label className={styles.fieldLabel} htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginRight: 4 }} />
        {label}
      </label>
    </div>
  );
}

/* ============================================================
   Entry Panel
   ============================================================ */
function EntryPanel({ state, dispatch, onImport, onNew }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>🚪 入口</div>
      <div style={{ marginBottom: '0.8rem' }}>
        <label className={styles.fieldLabel} htmlFor="code_input">フォローコードをお持ちの方 (再診)</label>
        <div className={styles.codeBox}>
          <input id="code_input" className={styles.codeInput} placeholder="OB1-XXXX-XXXX-..."
            value={state.followupCode.importBuf}
            onChange={(e) => dispatch({ type: 'SET_FOLLOWUP_CODE', payload: { importBuf: e.target.value, importError: null } })}
          />
          <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onImport} disabled={!state.followupCode.importBuf}>
            復元 →
          </button>
        </div>
        {state.followupCode.importError && (
          <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">
            ⚠ {state.followupCode.importError}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--ifm-color-emphasis-500)' }}>— または —</div>
      <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNew}>
        + 新規セッションを開始
      </button>
    </div>
  );
}

/* ============================================================
   STEP 0: 疾患マルチセレクト
   ============================================================ */
function Step0Panel({ state, dispatch, reverseProposals, onNext, onBack }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 0: 慢性疾患の選択 <span className={styles.sectionHint}>(複数選択可)</span></div>

      {reverseProposals.length > 0 && (
        <div className={styles.reverseTrigger}>
          <div className={styles.reverseTriggerHeader}>
            <span>🔍 処方薬からの提案 (任意)</span>
            <button className={styles.reverseTriggerClose} onClick={() => dispatch({ type: 'DISMISS_REVERSE_TRIGGER' })}>✕ 閉じる</button>
          </div>
          <div>
            患者の処方薬から以下の疾患が推定されます:
            <ul>
              {reverseProposals.map((key) => {
                const d = OVERVIEW_DISEASES.find((x) => x.key === key);
                return d ? <li key={key}>{DISEASE_CATEGORIES[d.category]?.icon} {d.label}</li> : null;
              })}
            </ul>
            該当する疾患の chip を下から選択してください。
          </div>
        </div>
      )}

      <div className={styles.chipGrid} role="group" aria-label="慢性疾患選択 (複数選択可)">
        {OVERVIEW_DISEASES.map((d) => {
          const selected = state.selectedDiseases.includes(d.key);
          const cat = DISEASE_CATEGORIES[d.category];
          return (
            <button
              key={d.key}
              role="checkbox"
              aria-checked={selected}
              aria-label={`${d.label} (${cat?.label || d.category})`}
              className={`${styles.chip} ${selected ? styles.chipActive : ''} ${categoryClass(d.category)}`}
              onClick={() => dispatch({ type: 'TOGGLE_DISEASE', payload: d.key })}
            >
              {cat?.icon} {d.label}
            </button>
          );
        })}
      </div>

      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>← 戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={state.selectedDiseases.length === 0} onClick={onNext}>
          次へ → STEP 0.5
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 0.5: スコア層別
   ============================================================ */
function Step05Panel({ state, dispatch, onNext, onBack }) {
  const scorableDiseases = state.selectedDiseases
    .map((key) => OVERVIEW_DISEASES.find((d) => d.key === key))
    .filter((d) => d && d.scoreKind);

  if (scorableDiseases.length === 0) {
    // スコア対象なし、スキップ
    useEffect(() => { onNext(); }, []);
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 0.5: リスクスコア層別 <span className={styles.sectionHint}>(各スコアは任意スキップ可、計算は自動)</span></div>

      {state.followupCode.oldDataWarning && (
        <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">
          ⚠ 前回のスコアです。<strong>今日の検査値で再入力</strong>してください (古い検査値での治療判断は事故源)
        </div>
      )}

      {scorableDiseases.map((d) => (
        <ScoreCard key={d.key} disease={d} state={state} dispatch={dispatch} />
      ))}

      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>← 戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNext}>次へ → STEP 1</button>
      </div>
    </div>
  );
}

function ScoreCard({ disease, state, dispatch }) {
  const def = SCORE_DEFINITIONS[disease.scoreKind];
  if (!def) return null;
  const sc = state.scoresByDisease[disease.key] || {};
  const update = (input) => {
    dispatch({ type: 'SET_SCORE_INPUT', payload: { disease: disease.key, input } });
    // 入力完了で自動計算
    const newInput = { ...(sc.input || {}), ...input };
    try {
      const result = def.calc(newInput);
      dispatch({ type: 'SET_SCORE_RESULT', payload: { disease: disease.key, kind: disease.scoreKind, result } });
    } catch {}
  };
  const skip = () => dispatch({ type: 'SKIP_SCORE', payload: { disease: disease.key } });

  const cat = DISEASE_CATEGORIES[disease.category];
  return (
    <div className={`${styles.scorePanel} ${categoryClass(disease.category)}`} role="region" aria-labelledby={`score-${disease.key}`}>
      <div className={styles.scorePanelHeader}>
        <div id={`score-${disease.key}`} className={styles.scorePanelTitle}>
          {cat?.icon} {disease.label} — {def.name} <span className={styles.sectionHint}>({def.discipline})</span>
        </div>
        <button className={styles.skipBtn} onClick={skip} aria-label={`${def.name} をスキップ`}>後で入力</button>
      </div>
      {!sc.skipped && (
        <>
          <div className={styles.scoreInputGrid}>
            {def.inputs.map((inp) => (
              <ScoreInputField key={inp.id} input={inp} value={sc.input?.[inp.id]} onChange={(v) => update({ [inp.id]: v })} />
            ))}
          </div>
          {sc.result && <ScoreResultDisplay kind={disease.scoreKind} result={sc.result} />}
        </>
      )}
      {sc.skipped && <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>ℹ スコア未入力 (STEP 1 で全候補表示)</div>}
    </div>
  );
}

function ScoreInputField({ input, value, onChange }) {
  const id = `score_input_${input.id}`;
  if (input.type === 'select') {
    return (
      <div>
        <label className={styles.fieldLabel} htmlFor={id}>{input.label}</label>
        <select id={id} className={styles.fieldInput} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">--</option>
          {input.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  if (input.type === 'checkbox') {
    return (
      <div>
        <label className={styles.fieldLabel} htmlFor={id}>
          <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ marginRight: 4 }} />
          {input.label}
        </label>
      </div>
    );
  }
  return (
    <div>
      <label className={styles.fieldLabel} htmlFor={id}>{input.label}{input.unit ? ` (${input.unit})` : ''}</label>
      <input id={id} type="number" className={styles.fieldInput} value={value ?? ''} placeholder={input.placeholder || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ScoreResultDisplay({ kind, result }) {
  if (kind === 'cha2ds2vasc_hasbled') {
    return (
      <div aria-live="polite">
        <div className={`${styles.scoreResult} ${result.chadsvasc.anticoag === 'recommend' ? styles.scoreResultHigh : styles.scoreResultMedium}`}>{result.chadsvasc.label}</div>
        <div className={`${styles.scoreResult} ${result.hasbled.tier === 'high' ? styles.scoreResultHigh : styles.scoreResultLow}`}>{result.hasbled.label}</div>
      </div>
    );
  }
  const tier = result.tier || result.risk || result.group;
  const tierClass = (
    tier === 'low' || tier === 'green' || tier === 'A' ? styles.scoreResultLow :
    tier === 'medium' || tier === 'yellow' || tier === 'B' ? styles.scoreResultMedium :
    tier === 'high' || tier === 'orange' || tier === 'E' ? styles.scoreResultHigh :
    tier === 'very_high' || tier === 'red' ? styles.scoreResultVeryHigh : styles.scoreResultMedium
  );
  return (
    <div className={`${styles.scoreResult} ${tierClass}`} aria-live="polite">
      {result.label || JSON.stringify(result)}
    </div>
  );
}

/* ============================================================
   STEP 1: 各疾患の薬剤・食事運動 toggle
   ============================================================ */
function Step1Panel({ state, dispatch, violations, onNext, onBack }) {
  const incompleteRestrictions = state.selectedDiseases.filter((key) => {
    const sel = state.selectionsByDisease[key];
    return sel?.lifestyle === 'lifestyle_diet_exercise_restricted' && !sel?.restriction;
  });
  const canProceed = incompleteRestrictions.length === 0;

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 1: 薬剤・食事運動 <span className={styles.sectionHint}>(各疾患を展開して選択)</span></div>

      {violations.filter((v) => v.severity === 'critical').length > 0 && (
        <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert" aria-live="assertive">
          ⚠ 禁忌違反が検出されています ({violations.filter((v) => v.severity === 'critical').length}件)。下記疾患カードで該当薬剤を確認してください。
        </div>
      )}

      {state.selectedDiseases.map((key) => {
        const d = OVERVIEW_DISEASES.find((x) => x.key === key);
        if (!d) return null;
        return <DiseaseAccordion key={key} disease={d} state={state} dispatch={dispatch} violations={violations} />;
      })}

      {!canProceed && (
        <div className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert">
          ⚠ 「食事+運動 [制限考慮]」を選択した疾患で、制限理由が未指定です: {incompleteRestrictions.join(', ')}
        </div>
      )}

      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>← 戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={!canProceed} onClick={onNext}>まとめ + コード発行 →</button>
      </div>
    </div>
  );
}

function DiseaseAccordion({ disease, state, dispatch, violations }) {
  const expanded = state.uiState.expandedDiseaseId === disease.key;
  const sel = state.selectionsByDisease[disease.key] || { drugIds: [], lifestyle: '', restriction: null };
  const cat = DISEASE_CATEGORIES[disease.category];

  const summary = (() => {
    const parts = [];
    sel.drugIds.forEach((id) => {
      const dc = disease.drugClasses.find((c) => c.id === id);
      if (dc) parts.push(dc.label);
    });
    if (sel.lifestyle) {
      const lo = LIFESTYLE_OPTIONS.find((l) => l.id === sel.lifestyle);
      if (lo) parts.push(lo.label);
    }
    return parts.length > 0 ? parts.join(' + ') : null;
  })();

  return (
    <div className={`${styles.accordion} ${categoryClass(disease.category)}`}>
      <button
        className={styles.accordionHeader}
        aria-expanded={expanded}
        aria-controls={`panel-${disease.key}`}
        onClick={() => dispatch({ type: 'TOGGLE_ACCORDION', payload: disease.key })}
      >
        <span className={styles.accordionTitle}>
          {expanded ? '▼' : '▶'} {cat?.icon} {disease.label}
        </span>
        <span className={summary ? styles.accordionSummary : styles.accordionUnselected}>
          {summary || '…未選択'}
        </span>
      </button>
      {expanded && (
        <div id={`panel-${disease.key}`} role="region" aria-labelledby={`acc-${disease.key}`} className={styles.accordionBody}>
          {disease.key === 'gout' && (
            <div className={styles.lifestyleRec}>
              <strong>痛風 ULT 閾値:</strong> 結節 SUA&lt;5.0 / 発作既往&lt;6.0 / 無症候+合併症&lt;7.0 / 過降下フロア 3.0
              <br />
              <strong>アロプリノール開始量:</strong> eGFR≥60→100mg, 30-59→50mg, &lt;30→50mg隔日
              <br />
              <strong>{GOUT_ULT_THRESHOLDS.cares_warning}</strong>
            </div>
          )}
          {disease.key === 'hfpef' && (
            <div className={styles.lifestyleRec}>
              <strong>SGLT2i 第一選択:</strong> {HFPEF_SGLT2_EVIDENCE}
            </div>
          )}

          <div className={styles.fieldLabel}>主要薬剤クラス (複数選択可):</div>
          <div className={styles.chipGrid} role="group" aria-label={`${disease.label} の薬剤候補`}>
            {disease.drugClasses.map((dc) => {
              const selected = sel.drugIds.includes(dc.id);
              const violation = violations.find((v) => {
                const r = require('./overviewContraindications').OVERVIEW_CONTRAINDICATIONS.find(x => x.id === v.ruleId);
                return r?.drugClassIds?.includes(dc.id);
              });
              return (
                <button
                  key={dc.id}
                  role="checkbox"
                  aria-checked={selected}
                  className={`${styles.chip} ${selected ? styles.chipActive : ''} ${violation ? styles.chipCritical : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_DRUG', payload: { disease: disease.key, drugId: dc.id } })}
                  title={dc.examples}
                >
                  {dc.label}
                </button>
              );
            })}
          </div>

          {disease.deepLink && (
            <a className={styles.deepLinkBtn} href={`${disease.deepLink}?currentDrugs=${sel.drugIds.join(',')}`} target="_blank" rel="noopener noreferrer">
              個別 Booster で詳細編集 →
            </a>
          )}

          <LifestyleRow disease={disease} sel={sel} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
}

function LifestyleRow({ disease, sel, dispatch }) {
  const setLs = (lifestyle) => dispatch({ type: 'SET_LIFESTYLE', payload: { disease: disease.key, lifestyle } });
  const setRr = (restriction) => dispatch({ type: 'SET_RESTRICTION', payload: { disease: disease.key, restriction } });

  const recsForDisease = LIFESTYLE_RECOMMENDATIONS_V01[disease.key];
  let recText = '';
  if (recsForDisease) {
    if (sel.lifestyle === 'lifestyle_diet') recText = recsForDisease.diet;
    else if (sel.lifestyle === 'lifestyle_diet_exercise') recText = recsForDisease.diet_exercise;
    else if (sel.lifestyle === 'lifestyle_diet_exercise_restricted' && sel.restriction) {
      recText = recsForDisease.diet_exercise_restricted?.[sel.restriction] || '';
    }
  }

  return (
    <div className={styles.lifestyleRow}>
      <div className={styles.lifestyleLabel}>食事・運動療法 (排他選択):</div>
      <div className={styles.chipGrid} role="radiogroup" aria-label="食事運動療法選択">
        {LIFESTYLE_OPTIONS.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={sel.lifestyle === o.id}
            className={`${styles.chip} ${styles.chipRadio} ${sel.lifestyle === o.id ? styles.chipActive : ''}`}
            onClick={() => setLs(sel.lifestyle === o.id ? '' : o.id)}
            title={o.description}
          >
            {o.label}
          </button>
        ))}
      </div>
      {sel.lifestyle === 'lifestyle_diet_exercise_restricted' && (
        <div className={styles.restrictionPanel}>
          <div className={styles.restrictionLabel}>
            運動制限の理由 <span className={styles.restrictionRequired}>(必須選択)</span>:
          </div>
          <div className={styles.chipGrid} role="radiogroup" aria-label="運動制限の理由">
            {LIFESTYLE_RESTRICTION_REASONS.map((r) => (
              <button
                key={r.id}
                role="radio"
                aria-checked={sel.restriction === r.id}
                className={`${styles.chip} ${styles.chipRadio} ${sel.restriction === r.id ? styles.chipActive : ''}`}
                onClick={() => setRr(sel.restriction === r.id ? null : r.id)}
                title={r.description}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {recText && (
        <div className={styles.lifestyleRec}>{recText}</div>
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY
   ============================================================ */
function SummaryPanel({ state, violations, onBack, onCopy }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>📋 まとめ</div>

      {violations.filter((v) => v.severity === 'critical').map((v, i) => (
        <div key={i} className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">⚠ {v.message}</div>
      ))}
      {violations.filter((v) => v.severity === 'warning').map((v, i) => (
        <div key={i} className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert">⚡ {v.message}</div>
      ))}

      {state.followupCode.issued && (
        <div style={{ marginTop: '0.8rem' }}>
          <div className={styles.fieldLabel}>フォローコード (紙カルテに記載してください)</div>
          <div className={styles.codeBox}>
            <span className={styles.codeDisplay}>{state.followupCode.issued}</span>
            <button className={styles.copyBtn} onClick={onCopy}>📋 コピー</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.8rem' }}>
        <div className={styles.fieldLabel}>選択内容</div>
        <ul style={{ marginLeft: '1rem', fontSize: '0.88rem' }}>
          {state.selectedDiseases.map((key) => {
            const d = OVERVIEW_DISEASES.find((x) => x.key === key);
            const sel = state.selectionsByDisease[key];
            const cat = DISEASE_CATEGORIES[d?.category];
            const drugs = (sel?.drugIds || []).map((id) => d.drugClasses.find((c) => c.id === id)?.label).filter(Boolean);
            const lo = LIFESTYLE_OPTIONS.find((l) => l.id === sel?.lifestyle);
            return d ? (
              <li key={key} style={{ marginBottom: '0.5rem' }}>
                <strong>{cat?.icon} {d.label}</strong>: {drugs.length > 0 ? drugs.join(' + ') : '薬剤未選択'}
                {lo && <span> + {lo.label}</span>}
                {d.deepLink && <a className={styles.deepLinkBtn} href={`${d.deepLink}?currentDrugs=${(sel?.drugIds || []).join(',')}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem' }}>詳細 →</a>}
              </li>
            ) : null;
          })}
        </ul>
      </div>

      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>← 戻る (再編集)</button>
      </div>
    </div>
  );
}
