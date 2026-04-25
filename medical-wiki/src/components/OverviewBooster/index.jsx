import React, { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import { OVERVIEW_DISEASES, DISEASE_CATEGORIES, GOUT_ULT_THRESHOLDS, HFPEF_SGLT2_EVIDENCE, getAllTreatmentBoosterDrugs } from './overviewRegistry';
import { LIFESTYLE_OPTIONS, LIFESTYLE_RESTRICTION_REASONS } from './lifestyleOptions';
import { LIFESTYLE_RECOMMENDATIONS_V01 } from './lifestyleRecommendationsV01';
import { OVERVIEW_CONTRAINDICATIONS_VERSION, OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED, evaluateContraindications } from './overviewContraindications';
import { SCORE_DEFINITIONS, COMMON_LAB_FIELDS, COMMON_HISTORY_FIELDS, detectMissingFactors } from './scoreDefinitions';
import { encodeFollowupCode, decodeFollowupCode } from './followCode';
import { recordEvent } from './uxLog';

/* ============================================================
   患者ヘッダー: 横断共有される因子を一括入力
   - 年齢層 (range)、性別、喫煙状態
   - 主要併存疾患 (cm_dm/cm_ht/cm_dlp/cm_ascvd/cm_chf/cm_ckd_g45/cm_fh)
   - 妊娠/授乳/フレイル
   ============================================================ */
const AGE_75_RANGES = new Set(['75-79', '80-89', '90+']);
const AGE_RANGE_OPTIONS = [
  { value: '<40', label: '<40歳' }, { value: '40-49', label: '40-49歳' }, { value: '50-59', label: '50-59歳' },
  { value: '60-64', label: '60-64歳' }, { value: '65-69', label: '65-69歳' }, { value: '70-74', label: '70-74歳' },
  { value: '75-79', label: '75-79歳' }, { value: '80-89', label: '80-89歳' }, { value: '90+', label: '≥90歳' },
];

const COMORBIDITY_FLAGS = [
  { id: 'cm_ht',       label: '高血圧 (既往/治療中)' },
  { id: 'cm_dm',       label: '糖尿病' },
  { id: 'cm_dlp',      label: '脂質異常症' },
  { id: 'cm_ascvd',    label: 'ASCVD既往 (MI/PCI/CABG/脳梗塞/PAD)' },
  { id: 'cm_chf',      label: '心不全' },
  { id: 'cm_ckd_g45',  label: 'CKD G4-5 (eGFR<30)' },
  { id: 'cm_fh',       label: '家族性高コレステロール血症 (FH)' },
];

/* ============================================================
   STEP 2: 今後の治療戦略 (v0.2 簡易実装)
   ============================================================ */
const NEXT_ACTIONS = [
  { id: 'maintain',  label: '現状維持' },
  { id: 'titrate_up',label: '増量' },
  { id: 'add',       label: '追加' },
  { id: 'switch',    label: '切替' },
  { id: 'taper',     label: '減量' },
  { id: 'refer',     label: '専門医紹介' },
];
const FOLLOW_OPTIONS = [
  { value: '1w',  label: '1週後' },
  { value: '2w',  label: '2週後' },
  { value: '4w',  label: '4週後' },
  { value: '8w',  label: '8-12週後' },
  { value: '6m',  label: '半年後' },
  { value: '12m', label: '1年後' },
];

/* ============================================================
   State / Reducer
   ============================================================ */
// 疾患キー → 患者ヘッダー併存疾患フラグ のマッピング (片方向 forward sync)
const DISEASE_TO_CM_MAP = {
  ht: 'cm_ht', dlp: 'cm_dlp', t2dm: 'cm_dm',
  ckd: 'cm_ckd_g45',  // CKD は G4-5 のみ自動 ON ではないが、cm_ckd_g45 は eGFR で別途確定
  ascvd2: 'cm_ascvd', hfref: 'cm_chf', hfpef: 'cm_chf',
};

const initialState = {
  schemaVersion: 3,
  step: 'entry',
  patientHeader: {
    age: '', sex: '', smoking: '',
    co_pregnancy: false, co_lactation: false, co_frail: false,
    co_elderly_75: false,
    cm_ht: false, cm_dm: false, cm_dlp: false,
    cm_ascvd: false, cm_chf: false, cm_ckd_g45: false, cm_fh: false,
    note: '',
  },
  commonLabs: {
    sbp_range: '', dbp_range: '',
    ldl_range: '', hdl_range: '', tg_range: '',
    hba1c_range: '',
    egfr_range: '', uacr_range: '',
    bmi_range: '', k_range: '',
  },
  commonHistory: {
    stroke: false, mi_pci: false, pad: false,
    bleed_hx: false, liver_dysfx: false, organ_damage: false,
    nsaid_use: false, antiplatelet: false, alcohol_heavy: false,
  },
  selectedDiseases: [],
  scoresByDisease: {},
  // selectionsByDisease[diseaseKey] = {
  //   classDetails: { [classId]: { drugId, dose } },  // クラス→薬剤→用量
  //   lifestyle, restriction,
  //   nextAction, followIn, goalNote                   // STEP 2
  // }
  selectionsByDisease: {},
  uiState: { expandedDiseaseId: null, reverseTriggerDismissed: false },
  followupCode: { issued: '', importBuf: '', importError: null, oldDataWarning: false },
};

function reducer(state, action) {
  switch (action.type) {
    case 'GOTO_STEP': return { ...state, step: action.payload };
    case 'SET_PATIENT_HEADER': {
      const next = { ...state.patientHeader, ...action.payload };
      if (action.payload.age !== undefined) next.co_elderly_75 = AGE_75_RANGES.has(action.payload.age);
      return { ...state, patientHeader: next };
    }
    case 'TOGGLE_DISEASE': {
      const set = new Set(state.selectedDiseases);
      const id = action.payload;
      if (set.has(id)) {
        set.delete(id);
        const newSel = { ...state.selectionsByDisease }; delete newSel[id];
        const newScore = { ...state.scoresByDisease }; delete newScore[id];
        // 削除時は cm_* を触らない (既往は事実として残す)
        return { ...state, selectedDiseases: [...set], selectionsByDisease: newSel, scoresByDisease: newScore };
      } else {
        set.add(id);
        // forward sync: cm_* を自動 ON (片方向、解除時は触らない)
        const cmKey = DISEASE_TO_CM_MAP[id];
        const newPh = (cmKey && cmKey !== 'cm_ckd_g45') ? { ...state.patientHeader, [cmKey]: true } : state.patientHeader;
        return { ...state, selectedDiseases: [...set], patientHeader: newPh };
      }
    }
    case 'SET_COMMON_LAB': {
      return { ...state, commonLabs: { ...state.commonLabs, ...action.payload } };
    }
    case 'SET_COMMON_HISTORY': {
      return { ...state, commonHistory: { ...state.commonHistory, ...action.payload } };
    }
    case 'SET_SCORE_INPUT': {
      const { disease, input } = action.payload;
      return { ...state, scoresByDisease: { ...state.scoresByDisease, [disease]: { ...(state.scoresByDisease[disease] || {}), input: { ...(state.scoresByDisease[disease]?.input || {}), ...input } } } };
    }
    case 'SET_SCORE_RESULT': {
      const { disease, kind, result } = action.payload;
      return { ...state, scoresByDisease: { ...state.scoresByDisease, [disease]: { ...(state.scoresByDisease[disease] || {}), kind, result, scoredAt: new Date().toISOString() } } };
    }
    case 'SKIP_SCORE': {
      const { disease } = action.payload;
      return { ...state, scoresByDisease: { ...state.scoresByDisease, [disease]: { ...(state.scoresByDisease[disease] || {}), skipped: true } } };
    }
    case 'TOGGLE_DRUG_CLASS': {
      const { disease, classId, drugClass } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      const newDetails = { ...cur.classDetails };
      if (newDetails[classId]) {
        delete newDetails[classId];
      } else {
        // 初回: default 薬剤・用量を自動選択
        const firstDrug = drugClass.drugs?.[0];
        const defaultDose = firstDrug?.doses?.find((d) => d.isDefault) || firstDrug?.doses?.[0];
        newDetails[classId] = { drugId: firstDrug?.id || '', dose: defaultDose?.value || '' };
      }
      return { ...state, selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, classDetails: newDetails } } };
    }
    case 'SET_DRUG_IN_CLASS': {
      const { disease, classId, drugId, dose } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      return { ...state, selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, classDetails: { ...cur.classDetails, [classId]: { drugId, dose } } } } };
    }
    case 'SET_LIFESTYLE': {
      const { disease, lifestyle } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      const restriction = lifestyle === 'lifestyle_diet_exercise_restricted' ? cur.restriction : null;
      return { ...state, selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, lifestyle, restriction } } };
    }
    case 'SET_RESTRICTION': {
      const { disease, restriction } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      return { ...state, selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, restriction } } };
    }
    case 'SET_STEP2_FIELD': {
      const { disease, field, value } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      return { ...state, selectionsByDisease: { ...state.selectionsByDisease, [disease]: { ...cur, [field]: value } } };
    }
    case 'TOGGLE_ACCORDION': {
      const id = action.payload;
      return { ...state, uiState: { ...state.uiState, expandedDiseaseId: state.uiState.expandedDiseaseId === id ? null : id } };
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
      };
    }
    case 'RESET_ALL':
      return { ...initialState, step: 'entry' };
    default:
      return state;
  }
}

function categoryClass(cat) {
  return styles[`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`] || '';
}

/* ============================================================
   メインコンポーネント
   ============================================================ */
export default function OverviewBooster() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const startTimeRef = useRef(Date.now());

  useEffect(() => { recordEvent('booster_open', {}); }, []);

  const goto = useCallback((step) => {
    dispatch({ type: 'GOTO_STEP', payload: step });
    recordEvent(`step_${step}`, { selectedCount: state.selectedDiseases.length });
  }, [state.selectedDiseases]);

  const handleNewPatient = useCallback(() => {
    if (state.selectedDiseases.length > 0 || state.followupCode.issued) {
      const ok = window.confirm('次の患者を診療します。\n\n現在のセッション情報を全て消去します。');
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
    // followCode は drugClassIds の old shape を期待するため、互換用にbridge
    const bridgedSelections = {};
    for (const [k, v] of Object.entries(state.selectionsByDisease)) {
      bridgedSelections[k] = {
        drugIds: Object.keys(v.classDetails || {}),
        lifestyle: v.lifestyle || '',
        restriction: v.restriction || null,
      };
    }
    const code = encodeFollowupCode({ ...state, selectionsByDisease: bridgedSelections });
    if (code) {
      dispatch({ type: 'SET_FOLLOWUP_CODE', payload: { issued: code, oldDataWarning: false } });
      recordEvent('code_issued', { diseaseCount: state.selectedDiseases.length, codeLength: code.length, time_total_ms: Date.now() - startTimeRef.current });
    }
  }, [state]);

  // 禁忌評価 — selectionsByDisease を旧shape (drugIds) に bridge
  const bridgedSelectionsForCheck = useMemo(() => {
    const out = {};
    for (const [k, v] of Object.entries(state.selectionsByDisease)) {
      out[k] = { ...v, drugIds: Object.keys(v.classDetails || {}) };
    }
    return out;
  }, [state.selectionsByDisease]);

  const violations = useMemo(() => evaluateContraindications({ ...state, selectionsByDisease: bridgedSelectionsForCheck }), [state.selectedDiseases, bridgedSelectionsForCheck, state.scoresByDisease, state.patientHeader]);

  // 逆引きトリガー
  const reverseTriggerProposals = useMemo(() => {
    if (state.uiState.reverseTriggerDismissed) return [];
    return [];
  }, [state.uiState.reverseTriggerDismissed]);

  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>慢性疾患管理ブースター</p>
          <p className={styles.subtitle}>多疾患併存の薬剤俯瞰・食事運動・治療戦略・フォローコード</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.stepIndicator}>
            STEP: {state.step === 'entry' ? '入口' : state.step === 'step0' ? '0 (疾患選択)' : state.step === 'step0_5' ? '0.5 (スコア)' : state.step === 'step1' ? '1 (薬剤・食事運動)' : state.step === 'step2' ? '2 (治療戦略)' : 'まとめ'}
          </span>
          <button className={styles.resetBtn} onClick={handleNewPatient} title="次患者の診療を開始 (全消去)">次の患者へ</button>
        </div>
      </div>

      <details className={styles.helpDetails}>
        <summary className={styles.helpSummary}>使い方ガイド</summary>
        <div className={styles.helpBody}>
          <p><strong>このブースターの目的</strong></p>
          <p>慢性疾患を俯瞰的に把握し、薬剤・食事運動・今後の治療戦略を1画面で整理。</p>
          <p><strong>STEP フロー</strong></p>
          <ol>
            <li>患者ヘッダー: 全STEP共有の年齢・性別・喫煙・主要併存・妊娠等を1回だけ入力</li>
            <li>STEP 0: 患者の慢性疾患を選択</li>
            <li>STEP 0.5: 5疾患でリスクスコア層別 (患者ヘッダーから自動継承、再入力不要)</li>
            <li>STEP 1: 各疾患の現在の薬剤 + 食事運動を選択</li>
            <li>STEP 2: 今後の治療戦略 (現状維持/増量/追加/切替/減量/紹介 + フォロー時期)</li>
            <li>まとめ: フォローコード発行 + 禁忌警告 + 個別 Booster へ deep link</li>
          </ol>
          <p><strong>薬剤選択の3階層</strong></p>
          <ul>
            <li>薬剤クラス chip (例: ARB)</li>
            <li>展開で具体薬剤 chip (アジルバ / ロサルタン / テルミサルタン …)</li>
            <li>各薬剤に用量 select (10mg/20mg/40mg …)</li>
          </ul>
        </div>
      </details>

      <PatientHeaderPanel state={state} dispatch={dispatch} />

      {state.step === 'entry' && <EntryPanel state={state} dispatch={dispatch} onImport={handleImportCode} onNew={() => goto('step0')} />}
      {state.step === 'step0' && <Step0Panel state={state} dispatch={dispatch} reverseProposals={reverseTriggerProposals} onNext={() => goto('step0_5')} onBack={() => goto('entry')} />}
      {state.step === 'step0_5' && <Step05Panel state={state} dispatch={dispatch} onNext={() => goto('step1')} onBack={() => goto('step0')} />}
      {state.step === 'step1' && <Step1Panel state={state} dispatch={dispatch} violations={violations} onNext={() => goto('step2')} onBack={() => goto('step0_5')} />}
      {state.step === 'step2' && <Step2Panel state={state} dispatch={dispatch} onNext={() => { handleIssueCode(); goto('summary'); }} onBack={() => goto('step1')} />}
      {state.step === 'summary' && <SummaryPanel state={state} violations={violations} onBack={() => goto('step2')} onCopy={() => navigator.clipboard?.writeText(state.followupCode.issued)} />}

      <div className={styles.versionLabel}>
        禁忌ルール v{OVERVIEW_CONTRAINDICATIONS_VERSION} (最終更新: {OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED})
      </div>
    </div>
  );
}

/* ============================================================
   Patient Header — 横断共有因子
   ============================================================ */
// 妊娠可能年齢層 (<50歳) — 妊娠/授乳は女性かつこの年齢層でのみ表示
const REPRODUCTIVE_AGE_RANGES = new Set(['<40', '40-49']);

function PatientHeaderPanel({ state, dispatch }) {
  const update = (patch) => dispatch({ type: 'SET_PATIENT_HEADER', payload: patch });
  const showReproductive = state.patientHeader.sex === 'F' && REPRODUCTIVE_AGE_RANGES.has(state.patientHeader.age);

  // 50歳以上 or 男性に変更されたら自動で妊娠/授乳フラグを下げる (誤データ持越し防止)
  useEffect(() => {
    if (!showReproductive && (state.patientHeader.co_pregnancy || state.patientHeader.co_lactation)) {
      update({ co_pregnancy: false, co_lactation: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReproductive]);

  return (
    <div className={styles.patientHeader}>
      <div className={styles.sectionTitle}>患者ヘッダー <span className={styles.sectionHint}>(全スコアで共有・患者切替時消去)</span></div>
      <div className={styles.patientGrid}>
        <div>
          <label className={styles.fieldLabel} htmlFor="ph_age">年齢層</label>
          <select id="ph_age" className={styles.fieldInput} value={state.patientHeader.age || ''} onChange={(e) => update({ age: e.target.value })}>
            <option value="">--</option>
            {AGE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel} htmlFor="ph_sex">性別</label>
          <select id="ph_sex" className={styles.fieldInput} value={state.patientHeader.sex || ''} onChange={(e) => update({ sex: e.target.value })}>
            <option value="">--</option>
            <option value="M">男性</option>
            <option value="F">女性</option>
          </select>
        </div>
        <div>
          <label className={styles.fieldLabel} htmlFor="ph_smoking">喫煙状態</label>
          <select id="ph_smoking" className={styles.fieldInput} value={state.patientHeader.smoking || ''} onChange={(e) => update({ smoking: e.target.value })}>
            <option value="">--</option>
            <option value="never">非喫煙</option>
            <option value="past">過去喫煙</option>
            <option value="current">現喫煙</option>
          </select>
        </div>
        {showReproductive && <CheckboxField id="ph_preg" label="妊娠中" checked={state.patientHeader.co_pregnancy} onChange={(v) => update({ co_pregnancy: v })} />}
        {showReproductive && <CheckboxField id="ph_lact" label="授乳中" checked={state.patientHeader.co_lactation} onChange={(v) => update({ co_lactation: v })} />}
        <CheckboxField id="ph_frail" label="フレイル" checked={state.patientHeader.co_frail} onChange={(v) => update({ co_frail: v })} />
      </div>
      <div className={styles.fieldLabel} style={{ marginTop: '0.6rem' }}>主要併存疾患 (横断共有):</div>
      <div className={styles.chipGrid}>
        {COMORBIDITY_FLAGS.map((cm) => (
          <button
            key={cm.id}
            type="button"
            role="checkbox"
            aria-checked={!!state.patientHeader[cm.id]}
            className={`${styles.chip} ${state.patientHeader[cm.id] ? styles.chipActive : ''}`}
            onClick={() => update({ [cm.id]: !state.patientHeader[cm.id] })}
          >
            {cm.label}
          </button>
        ))}
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
      <div className={styles.sectionTitle}>入口</div>
      <div style={{ marginBottom: '0.8rem' }}>
        <label className={styles.fieldLabel} htmlFor="code_input">フォローコードをお持ちの方 (再診)</label>
        <div className={styles.codeBox}>
          <input id="code_input" className={styles.codeInput} placeholder="OB1-XXXX-XXXX-..."
            value={state.followupCode.importBuf}
            onChange={(e) => dispatch({ type: 'SET_FOLLOWUP_CODE', payload: { importBuf: e.target.value, importError: null } })} />
          <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onImport} disabled={!state.followupCode.importBuf}>復元</button>
        </div>
        {state.followupCode.importError && <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">⚠ {state.followupCode.importError}</div>}
      </div>
      <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--ifm-color-emphasis-500)' }}>— または —</div>
      <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNew}>+ 新規セッションを開始</button>
    </div>
  );
}

/* ============================================================
   STEP 0
   ============================================================ */
function Step0Panel({ state, dispatch, onNext, onBack }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 0: 慢性疾患の選択 <span className={styles.sectionHint}>(複数選択可)</span></div>
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
              {d.label}
            </button>
          );
        })}
      </div>
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={state.selectedDiseases.length === 0} onClick={onNext}>次へ → STEP 0.5</button>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 0.5
   ============================================================ */
function Step05Panel({ state, dispatch, onNext, onBack }) {
  const scorableDiseases = state.selectedDiseases.map((key) => OVERVIEW_DISEASES.find((d) => d.key === key)).filter((d) => d && d.scoreKind);

  // 選択疾患のスコアが必要とする lab/history フィールドだけを表示 (動的フィルタ)
  const requiredLabIds = useMemo(() => {
    const set = new Set();
    for (const d of scorableDiseases) {
      const def = SCORE_DEFINITIONS[d.scoreKind];
      (def?.requires?.commonLabs || []).forEach((id) => set.add(id));
    }
    return [...set];
  }, [scorableDiseases.map((d) => d.key).join(',')]);

  const requiredHistoryIds = useMemo(() => {
    const set = new Set();
    for (const d of scorableDiseases) {
      const def = SCORE_DEFINITIONS[d.scoreKind];
      (def?.requires?.commonHistory || []).forEach((id) => set.add(id));
    }
    return [...set];
  }, [scorableDiseases.map((d) => d.key).join(',')]);

  if (scorableDiseases.length === 0) {
    useEffect(() => { onNext(); }, []);
    return null;
  }
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 0.5: リスクスコア層別 <span className={styles.sectionHint}>(共通検査値を1度入力 → 全スコアで自動計算)</span></div>
      {state.followupCode.oldDataWarning && (
        <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">
          ⚠ 前回のスコアです。<strong>今日の検査値で再入力</strong>してください
        </div>
      )}

      {/* 共通検査値パネル — 選択疾患に必要な項目のみ表示 */}
      {requiredLabIds.length > 0 && <CommonLabsPanel state={state} dispatch={dispatch} requiredIds={requiredLabIds} />}

      {/* 共通病歴パネル — 選択疾患に必要な項目のみ表示 */}
      {requiredHistoryIds.length > 0 && <CommonHistoryPanel state={state} dispatch={dispatch} requiredIds={requiredHistoryIds} />}

      {scorableDiseases.map((d) => (
        <ScoreCard key={d.key} disease={d} state={state} dispatch={dispatch} />
      ))}
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNext}>次へ → STEP 1</button>
      </div>
    </div>
  );
}

// 共通検査値パネル
function CommonLabsPanel({ state, dispatch, requiredIds }) {
  return (
    <div className={styles.scorePanel} style={{ background: '#e3f2fd', borderColor: '#1976d2' }}>
      <div className={styles.scorePanelTitle}>共通検査値 <span className={styles.sectionHint}>(複数スコアで自動共有)</span></div>
      <div className={styles.scoreInputGrid}>
        {COMMON_LAB_FIELDS.filter((f) => requiredIds.includes(f.id)).map((f) => (
          <div key={f.id}>
            <label className={styles.fieldLabel} htmlFor={`lab_${f.id}`}>
              {f.label} <span className={styles.sectionHint}>→ {f.usedBy.join(', ')}</span>
            </label>
            <select id={`lab_${f.id}`} className={styles.fieldInput}
              value={state.commonLabs[f.id] || ''}
              onChange={(e) => dispatch({ type: 'SET_COMMON_LAB', payload: { [f.id]: e.target.value } })}>
              <option value="">--</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// 共通病歴パネル
function CommonHistoryPanel({ state, dispatch, requiredIds }) {
  return (
    <div className={styles.scorePanel} style={{ background: '#fff3e0', borderColor: '#ef6c00' }}>
      <div className={styles.scorePanelTitle}>既往・生活因子 <span className={styles.sectionHint}>(複数スコアで自動共有)</span></div>
      <div className={styles.chipGrid}>
        {COMMON_HISTORY_FIELDS.filter((f) => requiredIds.includes(f.id)).map((f) => {
          const checked = !!state.commonHistory[f.id];
          return (
            <button key={f.id} type="button" role="checkbox" aria-checked={checked}
              className={`${styles.chip} ${checked ? styles.chipActive : ''}`}
              onClick={() => dispatch({ type: 'SET_COMMON_HISTORY', payload: { [f.id]: !checked } })}>
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreCard({ disease, state, dispatch }) {
  const def = SCORE_DEFINITIONS[disease.scoreKind];
  if (!def) return null;
  const sc = state.scoresByDisease[disease.key] || {};

  // ctx を構築して calc 実行
  const recompute = (newLocalInput) => {
    const ctx = {
      patientHeader: state.patientHeader,
      commonLabs: state.commonLabs,
      commonHistory: state.commonHistory,
      localInput: newLocalInput,
    };
    try {
      const result = def.calc(ctx);
      dispatch({ type: 'SET_SCORE_RESULT', payload: { disease: disease.key, kind: disease.scoreKind, result } });
    } catch {}
  };

  const update = (patch) => {
    dispatch({ type: 'SET_SCORE_INPUT', payload: { disease: disease.key, input: patch } });
    const newInput = { ...(sc.input || {}), ...patch };
    recompute(newInput);
  };

  // 共通入力 (commonLabs/commonHistory/patientHeader) が変わった時もここで再計算
  useEffect(() => {
    if (!sc.skipped) recompute(sc.input || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.commonLabs, state.commonHistory, state.patientHeader]);

  const skip = () => dispatch({ type: 'SKIP_SCORE', payload: { disease: disease.key } });

  // 不足因子検出
  const missing = useMemo(() => detectMissingFactors(disease.scoreKind, state), [disease.scoreKind, state.patientHeader, state.commonLabs, state.commonHistory]);
  const hasMissing = missing && (missing.patientHeader.length > 0 || missing.commonLabs.length > 0);

  return (
    <div className={`${styles.scorePanel} ${categoryClass(disease.category)}`} role="region" aria-labelledby={`score-${disease.key}`}>
      <div className={styles.scorePanelHeader}>
        <div id={`score-${disease.key}`} className={styles.scorePanelTitle}>
          {disease.label} — {def.name} <span className={styles.sectionHint}>({def.discipline})</span>
        </div>
        <button className={styles.skipBtn} onClick={skip} aria-label={`${def.name} をスキップ`}>後で入力</button>
      </div>
      {hasMissing && !sc.skipped && (
        <div className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert" style={{ margin: '0.4rem 0' }}>
          未入力因子: {[...missing.patientHeader.map((k) => `患者ヘッダー.${k}`), ...missing.commonLabs.map((k) => `検査値.${k}`)].join(', ')} — 入力すると自動計算されます
        </div>
      )}
      {!sc.skipped && def.localInputs && def.localInputs.length > 0 && (
        <>
          <div className={styles.fieldLabel} style={{ marginTop: '0.4rem' }}>このスコア固有の項目:</div>
          <div className={styles.scoreInputGrid}>
            {def.localInputs.map((inp) => (
              <ScoreInputField key={inp.id} input={inp} value={sc.input?.[inp.id]} onChange={(v) => update({ [inp.id]: v })} />
            ))}
          </div>
        </>
      )}
      {!sc.skipped && sc.result && <ScoreResultDisplay kind={disease.scoreKind} result={sc.result} />}
      {sc.skipped && <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>スコア未入力 (STEP 1 で全候補表示)</div>}
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
  return null;
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
  return <div className={`${styles.scoreResult} ${tierClass}`} aria-live="polite">{result.label || JSON.stringify(result)}</div>;
}

/* ============================================================
   STEP 1
   ============================================================ */
function Step1Panel({ state, dispatch, violations, onNext, onBack }) {
  const incompleteRestrictions = state.selectedDiseases.filter((key) => {
    const sel = state.selectionsByDisease[key];
    return sel?.lifestyle === 'lifestyle_diet_exercise_restricted' && !sel?.restriction;
  });
  const canProceed = incompleteRestrictions.length === 0;
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 1: 現在の薬剤・食事運動 <span className={styles.sectionHint}>(クラス→薬剤→用量の3段階)</span></div>
      {violations.filter((v) => v.severity === 'critical').length > 0 && (
        <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert" aria-live="assertive">
          ⚠ 禁忌違反 {violations.filter((v) => v.severity === 'critical').length}件 — 該当薬剤を確認してください
        </div>
      )}
      {state.selectedDiseases.map((key) => {
        const d = OVERVIEW_DISEASES.find((x) => x.key === key);
        if (!d) return null;
        return <DiseaseAccordion key={key} disease={d} state={state} dispatch={dispatch} violations={violations} />;
      })}
      {!canProceed && (
        <div className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert">
          ⚠ 「食事+運動 [制限考慮]」選択疾患で制限理由が未指定: {incompleteRestrictions.join(', ')}
        </div>
      )}
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={!canProceed} onClick={onNext}>次へ → STEP 2 治療戦略</button>
      </div>
    </div>
  );
}

function DiseaseAccordion({ disease, state, dispatch, violations }) {
  const expanded = state.uiState.expandedDiseaseId === disease.key;
  const sel = state.selectionsByDisease[disease.key] || { classDetails: {}, lifestyle: '', restriction: null };
  const cat = DISEASE_CATEGORIES[disease.category];

  // サマリ
  const summaryParts = [];
  Object.entries(sel.classDetails || {}).forEach(([classId, det]) => {
    const dc = disease.drugClasses.find((c) => c.id === classId);
    if (!dc) return;
    const drug = dc.drugs.find((d) => d.id === det.drugId);
    summaryParts.push(`${drug?.name || dc.label} ${det.dose || ''}`.trim());
  });
  if (sel.lifestyle) {
    const lo = LIFESTYLE_OPTIONS.find((l) => l.id === sel.lifestyle);
    if (lo) summaryParts.push(lo.label);
  }
  const summary = summaryParts.join(' + ') || null;

  return (
    <div className={`${styles.accordion} ${categoryClass(disease.category)}`}>
      <button className={styles.accordionHeader} aria-expanded={expanded} aria-controls={`panel-${disease.key}`}
        onClick={() => dispatch({ type: 'TOGGLE_ACCORDION', payload: disease.key })}>
        <span className={styles.accordionTitle}>{expanded ? '▼' : '▶'} {disease.label}</span>
        <span className={summary ? styles.accordionSummary : styles.accordionUnselected}>{summary || '…未選択'}</span>
      </button>
      {expanded && (
        <div id={`panel-${disease.key}`} role="region" className={styles.accordionBody}>
          {disease.key === 'gout' && (
            <div className={styles.lifestyleRec}>
              <strong>痛風 ULT 閾値:</strong> 結節 SUA&lt;5.0 / 発作既往&lt;6.0 / 無症候+合併症&lt;7.0 / 過降下フロア 3.0
              <br /><strong>アロプリノール開始:</strong> eGFR≥60→100mg, 30-59→50mg, &lt;30→50mg隔日 (専門医併診)
              <br /><strong>{GOUT_ULT_THRESHOLDS.cares_warning}</strong>
            </div>
          )}
          {disease.key === 'hfpef' && (
            <div className={styles.lifestyleRec}>
              <strong>SGLT2i 第一選択:</strong> {HFPEF_SGLT2_EVIDENCE}
            </div>
          )}

          <div className={styles.fieldLabel}>薬剤クラス (複数選択可、展開で具体薬剤・用量):</div>
          {disease.drugClasses.map((dc) => (
            <DrugClassSection key={dc.id} disease={disease} drugClass={dc} sel={sel} dispatch={dispatch} violations={violations} />
          ))}

          {disease.deepLink && (
            <a className={styles.deepLinkBtn} href={disease.deepLink} target="_blank" rel="noopener noreferrer">
              個別 Booster で詳細編集 (修飾子・推奨ロジック含む)
            </a>
          )}

          <LifestyleRow disease={disease} sel={sel} dispatch={dispatch} />
        </div>
      )}
    </div>
  );
}

function DrugClassSection({ disease, drugClass, sel, dispatch, violations }) {
  const isSelected = !!sel.classDetails?.[drugClass.id];
  const detail = sel.classDetails?.[drugClass.id];
  const violation = violations.find((v) => v.message?.includes(drugClass.label) || v.ruleId?.includes(drugClass.id));

  return (
    <div className={styles.drugClassRow}>
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        className={`${styles.chip} ${isSelected ? styles.chipActive : ''} ${violation ? styles.chipCritical : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_DRUG_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugClass } })}
        title={drugClass.tooltip}
      >
        {drugClass.label}
      </button>
      {isSelected && (
        <div className={styles.drugDetailPanel}>
          <div className={styles.fieldLabel} style={{ marginTop: '0.4rem' }}>具体薬剤 (1つ選択):</div>
          <div className={styles.chipGrid}>
            {drugClass.drugs.map((drug) => {
              const drugSelected = detail?.drugId === drug.id;
              return (
                <button
                  key={drug.id}
                  type="button"
                  role="radio"
                  aria-checked={drugSelected}
                  className={`${styles.chip} ${styles.chipRadio} ${drugSelected ? styles.chipActive : ''}`}
                  onClick={() => {
                    const defaultDose = drug.doses.find((d) => d.isDefault) || drug.doses[0];
                    dispatch({ type: 'SET_DRUG_IN_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugId: drug.id, dose: defaultDose?.value || '' } });
                  }}
                >
                  {drug.name}
                </button>
              );
            })}
          </div>
          {detail?.drugId && (() => {
            const drug = drugClass.drugs.find((d) => d.id === detail.drugId);
            if (!drug) return null;
            return (
              <div style={{ marginTop: '0.4rem' }}>
                <label className={styles.fieldLabel} htmlFor={`dose_${disease.key}_${drugClass.id}`}>用量:</label>
                <select id={`dose_${disease.key}_${drugClass.id}`} className={styles.fieldInput}
                  value={detail.dose || ''}
                  onChange={(e) => dispatch({ type: 'SET_DRUG_IN_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugId: detail.drugId, dose: e.target.value } })}>
                  {drug.doses.map((dose) => <option key={dose.value} value={dose.value}>{dose.label}</option>)}
                </select>
              </div>
            );
          })()}
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
          <button key={o.id} type="button" role="radio" aria-checked={sel.lifestyle === o.id}
            className={`${styles.chip} ${styles.chipRadio} ${sel.lifestyle === o.id ? styles.chipActive : ''}`}
            onClick={() => setLs(sel.lifestyle === o.id ? '' : o.id)} title={o.description}>
            {o.label}
          </button>
        ))}
      </div>
      {sel.lifestyle === 'lifestyle_diet_exercise_restricted' && (
        <div className={styles.restrictionPanel}>
          <div className={styles.restrictionLabel}>運動制限の理由 <span className={styles.restrictionRequired}>(必須選択)</span>:</div>
          <div className={styles.chipGrid} role="radiogroup" aria-label="運動制限の理由">
            {LIFESTYLE_RESTRICTION_REASONS.map((r) => (
              <button key={r.id} type="button" role="radio" aria-checked={sel.restriction === r.id}
                className={`${styles.chip} ${styles.chipRadio} ${sel.restriction === r.id ? styles.chipActive : ''}`}
                onClick={() => setRr(sel.restriction === r.id ? null : r.id)} title={r.description}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {recText && <div className={styles.lifestyleRec}>{recText}</div>}
    </div>
  );
}

/* ============================================================
   STEP 2: 今後の治療戦略 (v0.2 簡易実装)
   ============================================================ */
function Step2Panel({ state, dispatch, onNext, onBack }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>STEP 2: 今後の治療戦略 <span className={styles.sectionHint}>(疾患ごとに次の一手・フォロー時期)</span></div>
      {state.selectedDiseases.map((key) => {
        const d = OVERVIEW_DISEASES.find((x) => x.key === key);
        if (!d) return null;
        const sel = state.selectionsByDisease[key] || {};
        return (
          <div key={key} className={`${styles.scorePanel} ${categoryClass(d.category)}`}>
            <div className={styles.scorePanelTitle}>{d.label}</div>
            <div className={styles.fieldLabel} style={{ marginTop: '0.4rem' }}>次の一手:</div>
            <div className={styles.chipGrid} role="radiogroup">
              {NEXT_ACTIONS.map((a) => (
                <button key={a.id} type="button" role="radio" aria-checked={sel.nextAction === a.id}
                  className={`${styles.chip} ${styles.chipRadio} ${sel.nextAction === a.id ? styles.chipActive : ''}`}
                  onClick={() => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: key, field: 'nextAction', value: sel.nextAction === a.id ? '' : a.id } })}>
                  {a.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label className={styles.fieldLabel} htmlFor={`follow_${key}`}>次回フォロー時期:</label>
              <select id={`follow_${key}`} className={styles.fieldInput} value={sel.followIn || ''}
                onChange={(e) => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: key, field: 'followIn', value: e.target.value } })}>
                <option value="">--</option>
                {FOLLOW_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <label className={styles.fieldLabel} htmlFor={`goalNote_${key}`}>目標メモ (任意):</label>
              <input id={`goalNote_${key}`} type="text" className={styles.fieldInput} value={sel.goalNote || ''}
                placeholder="例: HbA1c<7.0、LDL<70、家庭BP<125/75 等"
                onChange={(e) => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: key, field: 'goalNote', value: e.target.value } })} />
            </div>
          </div>
        );
      })}
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNext}>まとめ + コード発行</button>
      </div>
    </div>
  );
}

/* ============================================================
   SUMMARY
   ============================================================ */
function SummaryPanel({ state, violations, onBack, onCopy }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>まとめ</div>
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
            <button className={styles.copyBtn} onClick={onCopy}>コピー</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: '0.8rem' }}>
        <div className={styles.fieldLabel}>選択内容</div>
        <ul style={{ marginLeft: '1rem', fontSize: '0.88rem' }}>
          {state.selectedDiseases.map((key) => {
            const d = OVERVIEW_DISEASES.find((x) => x.key === key);
            const sel = state.selectionsByDisease[key] || {};
            const lo = LIFESTYLE_OPTIONS.find((l) => l.id === sel.lifestyle);
            const drugSummary = Object.entries(sel.classDetails || {}).map(([cid, det]) => {
              const dc = d.drugClasses.find((c) => c.id === cid);
              const drug = dc?.drugs.find((dr) => dr.id === det.drugId);
              return `${drug?.name || dc?.label} ${det.dose || ''}`.trim();
            }).filter(Boolean);
            const action = NEXT_ACTIONS.find((a) => a.id === sel.nextAction)?.label;
            const follow = FOLLOW_OPTIONS.find((f) => f.value === sel.followIn)?.label;
            return d ? (
              <li key={key} style={{ marginBottom: '0.7rem' }}>
                <strong>{d.label}</strong>: {drugSummary.length > 0 ? drugSummary.join(' + ') : '薬剤未選択'}
                {lo && <span> + {lo.label}</span>}
                {action && <div style={{ marginLeft: '1rem', fontSize: '0.85rem' }}>→ 次の一手: {action}{follow ? ` / フォロー: ${follow}` : ''}{sel.goalNote ? ` / 目標: ${sel.goalNote}` : ''}</div>}
                {d.deepLink && <a className={styles.deepLinkBtn} href={d.deepLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '0.5rem', marginTop: '0.3rem' }}>個別 Booster</a>}
              </li>
            ) : null;
          })}
        </ul>
      </div>
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る (再編集)</button>
      </div>
    </div>
  );
}
