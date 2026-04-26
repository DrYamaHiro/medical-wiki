import React, { useReducer, useMemo, useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import { OVERVIEW_DISEASES, DISEASE_CATEGORIES } from './overviewRegistry';
import { LIFESTYLE_OPTIONS, LIFESTYLE_RESTRICTION_REASONS } from './lifestyleOptions';
import { LIFESTYLE_RECOMMENDATIONS_V01 } from './lifestyleRecommendationsV01';
import { OVERVIEW_CONTRAINDICATIONS_VERSION, OVERVIEW_CONTRAINDICATIONS_LAST_UPDATED, evaluateContraindications } from './overviewContraindications';
import { SCORE_DEFINITIONS, COMMON_LAB_FIELDS, COMMON_HISTORY_FIELDS, detectMissingFactors } from './scoreDefinitions';
import { encodeFollowupCode, decodeFollowupCode } from './followCode';
import { recordEvent } from './uxLog';
import { ABBREVIATIONS, annotateAbbreviations } from './abbreviations';
import { suggestTreatment, detectSharedClasses } from './treatmentEngine';
import { detectOverlap, detectInteractions, detectToggleThrash } from './drugInteractions';
import TreatmentBooster from '../TreatmentBooster';

// 略語ホバー表示コンポーネント (コメディカル配慮)
function Abbr({ children, term }) {
  const t = term || children;
  const full = ABBREVIATIONS[t];
  if (!full) return <>{children}</>;
  return <abbr title={full} style={{ borderBottom: '1px dotted currentColor', cursor: 'help', textDecoration: 'none' }}>{children}</abbr>;
}

// 任意のテキストを自動注釈付きでレンダリング (略語をすべて <abbr title> 化)
function AnnotatedText({ children }) {
  if (!children || typeof children !== 'string') return <>{children}</>;
  return <>{annotateAbbreviations(children, React)}</>;
}

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
   Phase 2: 今後の治療戦略
   ============================================================ */
const FOLLOW_OPTIONS = [
  { value: '1w',  label: '1週後 (緊急/不安定)' },
  { value: '2w',  label: '2週後 (要早期再評価)' },
  { value: '4w',  label: '1ヶ月後 (基本)' },
  { value: '8w',  label: '2ヶ月後 (安定)' },
  { value: '12w', label: '3ヶ月後 (処方限度・最長)' },
  { value: '12m', label: '1年後/有事再診 (検診経過観察)' },
];

/* ============================================================
   State / Reducer
   ============================================================ */
// 疾患キー → 患者ヘッダー併存疾患フラグ のマッピング (片方向 forward sync)
const DISEASE_TO_CM_MAP = {
  ht: 'cm_ht', dlp: 'cm_dlp', t2dm: 'cm_dm',
  ckd: 'cm_ckd_g45',
  ascvd2: 'cm_ascvd', hf: 'cm_chf',
};

// 治療状況 (STEP 1)
const TX_STATUS_OPTIONS = [
  { id: 'untreated',    label: '未治療' },
  { id: 'lifestyle_only', label: '生活指導のみ' },
  { id: 'on_treatment', label: '薬物治療中 (薬剤・用量を選択)' },
];

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
  uiState: { expandedDiseaseId: null, expandedSuggestionId: null, expandedTreatmentId: null, globalFollowIn: '', globalFollowAuto: true, reverseTriggerDismissed: false, linkDisabled: {}, toggleHistory: [] },
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
      const { disease, classId, drugClass, allDiseases } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      const newDetails = { ...cur.classDetails };
      const turningOn = !newDetails[classId];
      let sourceDrug = null;
      let sourceDose = '';
      if (!turningOn) {
        delete newDetails[classId];
      } else {
        sourceDrug = drugClass.drugs?.[0];
        const defaultDose = sourceDrug?.doses?.find((d) => d.isDefault) || sourceDrug?.doses?.[0];
        sourceDose = defaultDose?.value || '';
        newDetails[classId] = { drugId: sourceDrug?.id || '', dose: sourceDose };
      }
      const curTxStatus = (turningOn && Object.keys(newDetails).length > 0)
        ? 'on_treatment'
        : cur.txStatus;
      let newSelections = { ...state.selectionsByDisease, [disease]: { ...cur, classDetails: newDetails, txStatus: curTxStatus } };
      // 横断 auto-link: sharedClass 一致クラスを他の選択疾患でも自動 ON/OFF
      const sc = drugClass.sharedClass;
      const linkDisabled = state.uiState.linkDisabled || {};
      if (sc && allDiseases && !linkDisabled[sc]) {
        for (const otherDk of state.selectedDiseases) {
          if (otherDk === disease) continue;
          const otherMeta = allDiseases.find((d) => d.key === otherDk);
          if (!otherMeta) continue;
          const otherClass = otherMeta.drugClasses.find((c) => c.sharedClass === sc);
          if (!otherClass) continue;
          const otherCur = newSelections[otherDk] || { classDetails: {}, lifestyle: '', restriction: null };
          const otherDetails = { ...otherCur.classDetails };
          if (turningOn && !otherDetails[otherClass.id]) {
            // ブランド名マッチで連動先の薬剤を選ぶ (フォシーガ/ジャディアンス等の整合性確保)
            let targetDrug = null;
            if (sourceDrug) {
              const sourceBrand = (sourceDrug.name.match(/\((.+?)\)/)?.[1] || sourceDrug.name).split('/')[0].trim();
              const sourceGeneric = sourceDrug.name.split(' ')[0].trim();
              targetDrug = otherClass.drugs.find((d) => d.name.includes(sourceBrand))
                || otherClass.drugs.find((d) => d.name.includes(sourceGeneric))
                || otherClass.drugs[0];
            } else {
              targetDrug = otherClass.drugs[0];
            }
            const matchedDose = targetDrug?.doses?.find((d) => d.value === sourceDose);
            const finalDose = matchedDose
              ? sourceDose
              : (targetDrug?.doses?.find((x) => x.isDefault)?.value || targetDrug?.doses?.[0]?.value || '');
            otherDetails[otherClass.id] = { drugId: targetDrug?.id || '', dose: finalDose };
          } else if (!turningOn && otherDetails[otherClass.id]) {
            delete otherDetails[otherClass.id];
          }
          const otherHas = Object.keys(otherDetails).length > 0;
          const otherTxStatus = otherHas ? 'on_treatment' : otherCur.txStatus;
          newSelections[otherDk] = { ...otherCur, classDetails: otherDetails, txStatus: otherTxStatus };
        }
      }
      return { ...state, selectionsByDisease: newSelections };
    }
    case 'SET_DRUG_IN_CLASS': {
      const { disease, classId, drugId, dose, drugClass, allDiseases } = action.payload;
      const cur = state.selectionsByDisease[disease] || { classDetails: {}, lifestyle: '', restriction: null };
      let newSelections = { ...state.selectionsByDisease, [disease]: { ...cur, classDetails: { ...cur.classDetails, [classId]: { drugId, dose } } } };
      // 横断 dose sync: sharedClass 一致クラスを他の選択疾患でも同期 (link 有効時のみ)
      const sc = drugClass?.sharedClass;
      const linkDisabled = state.uiState.linkDisabled || {};
      // toggle history 追加 (drug 切替を thrash 検出に利用)
      const newHistory = [...(state.uiState.toggleHistory || []), { sharedClass: sc, drugId, t: Date.now() }].slice(-12);
      if (sc && allDiseases && !linkDisabled[sc]) {
        for (const otherDk of state.selectedDiseases) {
          if (otherDk === disease) continue;
          const otherMeta = allDiseases.find((d) => d.key === otherDk);
          if (!otherMeta) continue;
          const otherClass = otherMeta.drugClasses.find((c) => c.sharedClass === sc);
          if (!otherClass) continue;
          const otherCur = newSelections[otherDk];
          if (!otherCur || !otherCur.classDetails?.[otherClass.id]) continue;
          // 同名薬剤を otherClass.drugs から探す (name の前半が一致するものを優先)
          const sourceDrug = drugClass.drugs.find((d) => d.id === drugId);
          let targetDrug = null;
          if (sourceDrug) {
            const sourceBrand = (sourceDrug.name.match(/\((.+?)\)/)?.[1] || sourceDrug.name).split('/')[0];
            targetDrug = otherClass.drugs.find((d) => d.name.includes(sourceBrand)) || otherClass.drugs.find((d) => d.name.split(' ')[0] === sourceDrug.name.split(' ')[0]);
          }
          if (!targetDrug) continue;
          // dose が targetDrug.doses にあれば同期、無ければそのまま
          const matchedDose = targetDrug.doses.find((d) => d.value === dose);
          const newDose = matchedDose ? dose : (targetDrug.doses.find((d) => d.isDefault)?.value || targetDrug.doses[0]?.value || '');
          newSelections[otherDk] = { ...otherCur, classDetails: { ...otherCur.classDetails, [otherClass.id]: { drugId: targetDrug.id, dose: newDose } } };
        }
      }
      return { ...state, selectionsByDisease: newSelections, uiState: { ...state.uiState, toggleHistory: newHistory } };
    }
    case 'TOGGLE_LINK_DISABLED': {
      const { sharedClass } = action.payload;
      const cur = state.uiState.linkDisabled || {};
      return { ...state, uiState: { ...state.uiState, linkDisabled: { ...cur, [sharedClass]: !cur[sharedClass] } } };
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
    case 'SET_UI_EXPANDED_SUGGESTION':
      return { ...state, uiState: { ...state.uiState, expandedSuggestionId: action.payload } };
    case 'SET_UI_EXPANDED_TREATMENT':
      return { ...state, uiState: { ...state.uiState, expandedTreatmentId: action.payload } };
    case 'SET_GLOBAL_FOLLOW':
      return { ...state, uiState: { ...state.uiState, globalFollowIn: action.payload } };
    case 'SET_GLOBAL_FOLLOW_AUTO':
      return { ...state, uiState: { ...state.uiState, globalFollowAuto: action.payload } };
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
          <p className={styles.subtitle}>慢性疾患の薬剤・食事運動・治療戦略・フォローコード</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.stepIndicator}>
            Phase: {state.step === 'entry' ? '入口' : state.step === 'step0' ? '1 疾患選択' : state.step === 'step0_5' ? '2 リスク層別' : state.step === 'step1' ? '3 現在の処方' : state.step === 'step2' ? '4 治療戦略' : 'まとめ'}
          </span>
          <button className={styles.resetBtn} onClick={handleNewPatient} title="次患者の診療を開始 (全消去)">次の患者へ</button>
        </div>
      </div>

      {violations.filter((v) => v.severity === 'critical').length > 0 && (
        <div className={styles.criticalSticky} role="alert" aria-live="assertive">
          <span>⚠ 禁忌違反 {violations.filter((v) => v.severity === 'critical').length}件</span>
          <span className={styles.criticalStickyDetail}>
            {violations.filter((v) => v.severity === 'critical').slice(0, 2).map((v, i) => (
              <span key={i}>{i > 0 ? ' / ' : ''}{v.message}</span>
            ))}
            {violations.filter((v) => v.severity === 'critical').length > 2 && ' …他'}
          </span>
        </div>
      )}

      <PatientHeaderPanel state={state} dispatch={dispatch} />

      {state.step === 'entry' && <EntryPanel state={state} dispatch={dispatch} onImport={handleImportCode} onNew={() => goto('step0')} />}
      {state.step === 'step0' && <Step0Panel state={state} dispatch={dispatch} reverseProposals={reverseTriggerProposals} onNext={() => goto('step0_5')} onBack={() => goto('entry')} />}
      {state.step === 'step0_5' && <Step05Panel state={state} dispatch={dispatch} onNext={() => goto('step1')} onBack={() => goto('step0')} />}
      {state.step === 'step1' && <Step1Panel state={state} dispatch={dispatch} violations={violations} onNext={() => goto('step2')} onBack={() => goto('step0_5')} />}
      {state.step === 'step2' && <Step2Panel state={state} dispatch={dispatch} violations={violations} onNext={() => { handleIssueCode(); goto('summary'); }} onBack={() => goto('step1')} />}
      {state.step === 'summary' && <SummaryPanel state={state} dispatch={dispatch} violations={violations} onBack={() => goto('step2')} onCopy={() => navigator.clipboard?.writeText(state.followupCode.issued)} />}

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

// Phase が進んだら詳細を畳む対象 step
const COMPACT_HEADER_STEPS = new Set(['step1', 'step2', 'summary']);

function PatientHeaderPanel({ state, dispatch }) {
  const update = (patch) => dispatch({ type: 'SET_PATIENT_HEADER', payload: patch });
  const ph = state.patientHeader;
  const showReproductive = ph.sex === 'F' && REPRODUCTIVE_AGE_RANGES.has(ph.age);
  const compact = COMPACT_HEADER_STEPS.has(state.step);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!showReproductive && (ph.co_pregnancy || ph.co_lactation)) {
      update({ co_pregnancy: false, co_lactation: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReproductive]);

  const ageLabel = AGE_RANGE_OPTIONS.find((o) => o.value === ph.age)?.label;
  const sexLabel = ph.sex === 'M' ? '男性' : ph.sex === 'F' ? '女性' : '';
  const smokeLabel = ph.smoking === 'never' ? '非喫煙' : ph.smoking === 'past' ? '過去喫煙' : ph.smoking === 'current' ? '現喫煙' : '';

  // Phase 3 以降: コンパクト表示 (年齢・性別・主要フラグだけを横一列、編集不可)
  if (compact && ph.age && ph.sex && ph.smoking && !showAll) {
    const flags = [];
    if (ph.co_pregnancy) flags.push('妊娠中');
    if (ph.co_lactation) flags.push('授乳中');
    if (ph.co_frail) flags.push('フレイル');
    return (
      <div className={`${styles.patientHeader} ${styles.patientHeaderCompact}`}>
        <span className={styles.compactBadge}>👤 {ageLabel} / {sexLabel} / {smokeLabel}{flags.length > 0 ? ` / ${flags.join('・')}` : ''}</span>
        <button type="button" className={styles.compactEditBtn} onClick={() => setShowAll(true)}>変更</button>
      </div>
    );
  }

  return (
    <div className={styles.patientHeader}>
      <div className={styles.sectionTitle}>
        患者ヘッダー <span className={styles.sectionHint}>(全スコアで共有・患者切替時消去)</span>
        {compact && <button type="button" className={styles.compactEditBtn} style={{ marginLeft: '0.6rem' }} onClick={() => setShowAll(false)}>畳む</button>}
      </div>

      {!ph.age && (
        <div className={styles.bigPickerBlock}>
          <div className={styles.bigPickerLabel}>年齢層をタップ</div>
          <div className={styles.bigPickerGrid}>
            {AGE_RANGE_OPTIONS.map((o) => (
              <button key={o.value} type="button" className={styles.bigPickerBtn} onClick={() => update({ age: o.value })}>{o.label}</button>
            ))}
          </div>
        </div>
      )}
      {ph.age && !ph.sex && (
        <div className={styles.bigPickerBlock}>
          <div className={styles.bigPickerLabel}>性別をタップ</div>
          <div className={styles.bigPickerGrid}>
            <button type="button" className={styles.bigPickerBtn} onClick={() => update({ sex: 'M' })}>男性</button>
            <button type="button" className={styles.bigPickerBtn} onClick={() => update({ sex: 'F' })}>女性</button>
          </div>
        </div>
      )}
      {ph.age && ph.sex && !ph.smoking && (
        <div className={styles.bigPickerBlock}>
          <div className={styles.bigPickerLabel}>喫煙状態をタップ</div>
          <div className={styles.bigPickerGrid}>
            <button type="button" className={styles.bigPickerBtn} onClick={() => update({ smoking: 'never' })}>非喫煙</button>
            <button type="button" className={styles.bigPickerBtn} onClick={() => update({ smoking: 'past' })}>過去喫煙</button>
            <button type="button" className={styles.bigPickerBtn} onClick={() => update({ smoking: 'current' })}>現喫煙</button>
          </div>
        </div>
      )}

      {(ph.age || ph.sex || ph.smoking) && (
        <div className={styles.patientSummaryRow}>
          {ph.age && (
            <button type="button" className={styles.patientSummaryChip} onClick={() => update({ age: '' })} title="変更">
              年齢: {ageLabel} ✎
            </button>
          )}
          {ph.sex && (
            <button type="button" className={styles.patientSummaryChip} onClick={() => update({ sex: '' })} title="変更">
              性別: {sexLabel} ✎
            </button>
          )}
          {ph.smoking && (
            <button type="button" className={styles.patientSummaryChip} onClick={() => update({ smoking: '' })} title="変更">
              喫煙: {smokeLabel} ✎
            </button>
          )}
        </div>
      )}

      {ph.age && ph.sex && ph.smoking && (
        <div className={styles.bigPickerBlock} style={{ marginTop: '0.5rem' }}>
          <div className={styles.bigPickerLabel}>追加情報 (該当時タップ)</div>
          <div className={styles.bigPickerGrid}>
            {showReproductive && (
              <button type="button"
                className={`${styles.bigPickerBtn} ${ph.co_pregnancy ? styles.bigPickerBtnActive : ''}`}
                onClick={() => update({ co_pregnancy: !ph.co_pregnancy })}>
                妊娠中 {ph.co_pregnancy ? '✓' : ''}
              </button>
            )}
            {showReproductive && (
              <button type="button"
                className={`${styles.bigPickerBtn} ${ph.co_lactation ? styles.bigPickerBtnActive : ''}`}
                onClick={() => update({ co_lactation: !ph.co_lactation })}>
                授乳中 {ph.co_lactation ? '✓' : ''}
              </button>
            )}
            <button type="button"
              className={`${styles.bigPickerBtn} ${ph.co_frail ? styles.bigPickerBtnActive : ''}`}
              onClick={() => update({ co_frail: !ph.co_frail })}>
              フレイル {ph.co_frail ? '✓' : ''}
            </button>
          </div>
        </div>
      )}
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
      <div className={styles.sectionTitle}>Phase 1: 慢性疾患の選択 <span className={styles.sectionHint}>(複数選択可)</span></div>
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
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={state.selectedDiseases.length === 0} onClick={onNext}>次へ → Phase 2 リスク層別</button>
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
      <div className={styles.sectionTitle}>Phase 2: リスクスコア層別 <span className={styles.sectionHint}>(共通検査値を1度入力 → 全スコアで自動計算)</span></div>
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
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNext}>次へ → Phase 3 現在の処方</button>
      </div>
    </div>
  );
}

// 折りたたみ式ボタンピッカー — 未選択時はヘッダーのみ、タップで展開、選択後はサマリー表示
function ButtonPicker({ id, label, value, options, onChange, hint }) {
  const [open, setOpen] = useState(!value);
  useEffect(() => { if (!value) setOpen(true); }, [value]);
  const currentLabel = options.find((o) => o.value === value)?.label;
  return (
    <div className={styles.labPickerBlock}>
      <button type="button"
        className={`${styles.labPickerHeader} ${value ? styles.labPickerHeaderSelected : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}>
        <span>
          {label}
          {hint && <span className={styles.sectionHint}> → {hint}</span>}
        </span>
        <span>
          {value
            ? <span className={styles.labPickerCurrent}>{currentLabel} ✎</span>
            : <span className={styles.labPickerEmpty}>未選択 ▶</span>}
        </span>
      </button>
      {open && (
        <div className={styles.labPickerOptions}>
          {options.map((o) => (
            <button key={o.value} type="button"
              className={`${styles.bigPickerBtnSm} ${value === o.value ? styles.bigPickerBtnActive : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.label}
            </button>
          ))}
          {value && (
            <button type="button" className={styles.bigPickerBtnSm} onClick={() => { onChange(''); }}>
              クリア
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// 共通検査値パネル
function CommonLabsPanel({ state, dispatch, requiredIds }) {
  return (
    <div className={styles.scorePanel} style={{ background: '#e3f2fd', borderColor: '#1976d2' }}>
      <div className={styles.scorePanelTitle}>共通検査値 <span className={styles.sectionHint}>(複数スコアで自動共有)</span></div>
      {COMMON_LAB_FIELDS.filter((f) => requiredIds.includes(f.id)).map((f) => (
        <ButtonPicker key={f.id}
          id={`lab_${f.id}`}
          label={f.label}
          hint={f.usedBy.join(', ')}
          value={state.commonLabs[f.id] || ''}
          options={f.options}
          onChange={(v) => dispatch({ type: 'SET_COMMON_LAB', payload: { [f.id]: v } })}
        />
      ))}
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
      {sc.skipped && <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>スコア未入力 (Phase 3 で全候補表示)</div>}
    </div>
  );
}

function ScoreInputField({ input, value, onChange }) {
  if (input.type === 'select') {
    return (
      <ButtonPicker
        id={`score_input_${input.id}`}
        label={input.label}
        value={value || ''}
        options={input.options}
        onChange={onChange}
      />
    );
  }
  if (input.type === 'checkbox') {
    const id = `score_input_${input.id}`;
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
  // 横断 sharedClass 検出 — 複数の選択疾患で同じ sharedClass を持つクラスを抽出
  const sharedTagged = useMemo(() => {
    const counts = {};
    for (const dk of state.selectedDiseases) {
      const meta = OVERVIEW_DISEASES.find((d) => d.key === dk);
      if (!meta) continue;
      for (const c of meta.drugClasses) {
        if (c.sharedClass) counts[c.sharedClass] = (counts[c.sharedClass] || 0) + 1;
      }
    }
    return new Set(Object.entries(counts).filter(([_, n]) => n >= 2).map(([k]) => k));
  }, [state.selectedDiseases.join(',')]);
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Phase 3: 現在の処方 <span className={styles.sectionHint}>(クラス→薬剤→用量、必要に応じて食事運動)</span></div>
      {violations.filter((v) => v.severity === 'critical').length > 0 && (
        <div className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert" aria-live="assertive">
          ⚠ 禁忌違反 {violations.filter((v) => v.severity === 'critical').length}件 — 該当薬剤を確認してください
        </div>
      )}
      {sharedTagged.size > 0 && (
        <div className={styles.sharedClassBox}>
          <div className={styles.sharedClassTitle}>🔗 複数疾患で共通の薬剤クラス — 連動 ON/OFF</div>
          <div className={styles.sharedClassRow} style={{ marginBottom: '0.4rem' }}>
            連動 ON: 一方を選ぶと他疾患でも自動同期 (薬剤・用量とも) / OFF: 各疾患で独立選択
          </div>
          <div className={styles.chipGrid}>
            {[...sharedTagged].map((sc) => {
              const disabled = !!state.uiState.linkDisabled?.[sc];
              return (
                <button key={sc} type="button"
                  className={`${styles.bigPickerBtnSm} ${disabled ? '' : styles.bigPickerBtnActive}`}
                  onClick={() => dispatch({ type: 'TOGGLE_LINK_DISABLED', payload: { sharedClass: sc } })}
                  title={disabled ? `${sc} 連動 OFF (各疾患で独立)` : `${sc} 連動 ON (タップで OFF)`}>
                  {disabled ? '🔓' : '🔗'} {sc} {disabled ? '(独立)' : '(連動)'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* トグル交互押し検出 */}
      {(() => {
        const thrash = detectToggleThrash(state.uiState.toggleHistory);
        if (!thrash) return null;
        const disabled = !!state.uiState.linkDisabled?.[thrash.sharedClass];
        if (disabled) return null;
        return (
          <div className={`${styles.alertBanner} ${styles.alertWarning}`}>
            <div>
              💡 {thrash.sharedClass} の薬剤を短時間で何度も切替えています。各疾患で別の薬剤を使いたい場合は連動を OFF にできます。
              <button className={styles.copyBtn} style={{ marginLeft: '0.5rem' }}
                onClick={() => dispatch({ type: 'TOGGLE_LINK_DISABLED', payload: { sharedClass: thrash.sharedClass } })}>
                {thrash.sharedClass} 連動を OFF にする
              </button>
            </div>
          </div>
        );
      })()}

      {/* 同効薬重複警告 (連動 OFF 時に発生) */}
      {(() => {
        const overlaps = detectOverlap(state, OVERVIEW_DISEASES);
        if (overlaps.length === 0) return null;
        return overlaps.map((o, i) => (
          <div key={`ov-${i}`} className={`${styles.alertBanner} ${o.severity === 'critical' ? styles.alertCritical : styles.alertWarning}`} role="alert">
            <div>
              <strong>⚠ 同効薬重複: {o.sharedClass}</strong>
              <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{o.message}</div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', opacity: 0.85 }}>
                対象疾患: {o.diseases.map((dk) => OVERVIEW_DISEASES.find((d) => d.key === dk)?.label).join(' / ')}
              </div>
            </div>
          </div>
        ));
      })()}

      {/* 飲み合わせ警告 */}
      {(() => {
        const interactions = detectInteractions(state, OVERVIEW_DISEASES);
        if (interactions.length === 0) return null;
        return interactions.map((it, i) => (
          <div key={`int-${i}`} className={`${styles.alertBanner} ${it.severity === 'critical' ? styles.alertCritical : styles.alertWarning}`} role="alert">
            <div>
              <strong>💊 飲み合わせ: {it.message}</strong>
              {it.hint && <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{it.hint}</div>}
            </div>
          </div>
        ));
      })()}
      {state.selectedDiseases.map((key) => {
        const d = OVERVIEW_DISEASES.find((x) => x.key === key);
        if (!d) return null;
        return <DiseaseAccordion key={key} disease={d} state={state} dispatch={dispatch} violations={violations} sharedTagged={sharedTagged} />;
      })}
      {!canProceed && (
        <div className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert">
          ⚠ 「食事+運動 [制限考慮]」選択疾患で制限理由が未指定: {incompleteRestrictions.join(', ')}
        </div>
      )}
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} disabled={!canProceed} onClick={onNext}>次へ → Phase 4 治療戦略</button>
      </div>
    </div>
  );
}

function DiseaseAccordion({ disease, state, dispatch, violations, sharedTagged }) {
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
          <div className={styles.fieldLabel}>治療状況:</div>
          <div className={styles.chipGrid} role="radiogroup" aria-label="治療状況">
            {TX_STATUS_OPTIONS.map((s) => {
              const active = (sel.txStatus || '') === s.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={active}
                  className={`${styles.chip} ${styles.chipRadio} ${active ? styles.chipActive : ''}`}
                  onClick={() => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: disease.key, field: 'txStatus', value: active ? '' : s.id } })}>
                  {s.label}
                </button>
              );
            })}
          </div>

          {sel.txStatus === 'on_treatment' && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: '0.5rem' }}>薬剤クラス (複数選択可、展開で具体薬剤・用量):</div>
              {disease.drugClasses.map((dc) => (
                <DrugClassSection key={dc.id} disease={disease} drugClass={dc} sel={sel} dispatch={dispatch} violations={violations} sharedTagged={sharedTagged} />
              ))}
            </>
          )}

          {(sel.txStatus === 'lifestyle_only' || sel.txStatus === 'on_treatment') && !disease.hideLifestyle && (
            <LifestyleRow disease={disease} sel={sel} dispatch={dispatch} />
          )}
          {sel.txStatus === 'on_treatment' && disease.controlIndicator && (
            <ControlStatusRow disease={disease} sel={sel} dispatch={dispatch} />
          )}
        </div>
      )}
    </div>
  );
}

// 薬剤クラスラベル等の略語を auto-annotate (新方式: annotateAbbreviations 経由で全略語を自動置換)
function renderClassLabel(label) {
  return annotateAbbreviations(label, React);
}

function DrugClassSection({ disease, drugClass, sel, dispatch, violations, sharedTagged }) {
  const isSelected = !!sel.classDetails?.[drugClass.id];
  const detail = sel.classDetails?.[drugClass.id];
  const violation = violations.find((v) => v.message?.includes(drugClass.label) || v.ruleId?.includes(drugClass.id));
  const isShared = !!drugClass.sharedClass && sharedTagged?.has(drugClass.sharedClass);

  return (
    <div className={styles.drugClassRow}>
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        className={`${styles.chip} ${isSelected ? styles.chipActive : ''} ${violation ? styles.chipCritical : ''} ${isShared ? styles.chipShared : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_DRUG_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugClass, allDiseases: OVERVIEW_DISEASES } })}
        title={drugClass.tooltip + (isShared ? ` — 他疾患と共通 (${drugClass.sharedClass}): 同時選択されます` : '')}
      >
        {renderClassLabel(drugClass.label)}
        {isShared && <span className={styles.sharedTag} aria-label={`${drugClass.sharedClass} 共通薬剤`}>🔗 {drugClass.sharedClass}</span>}
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
                    dispatch({ type: 'SET_DRUG_IN_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugId: drug.id, dose: defaultDose?.value || '', drugClass, allDiseases: OVERVIEW_DISEASES } });
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
              <div style={{ marginTop: '0.5rem' }}>
                <div className={styles.fieldLabel}>用量:</div>
                <div className={styles.chipGrid}>
                  {drug.doses.map((dose) => {
                    const active = detail.dose === dose.value;
                    return (
                      <button key={dose.value} type="button"
                        className={`${styles.bigPickerBtnSm} ${active ? styles.bigPickerBtnActive : ''}`}
                        onClick={() => dispatch({ type: 'SET_DRUG_IN_CLASS', payload: { disease: disease.key, classId: drugClass.id, drugId: detail.drugId, dose: dose.value, drugClass, allDiseases: OVERVIEW_DISEASES } })}>
                        {dose.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// コントロール状態行 (喘息・COPDなど) — 「コントロール不良」ON時に提案エンジンで吸入手技/アドヒアランス/併存症介入が上位提案される
function ControlStatusRow({ disease, sel, dispatch }) {
  const checked = !!sel.uncontrolled;
  return (
    <div className={styles.lifestyleRow}>
      <div className={styles.lifestyleLabel}>コントロール状態:</div>
      <div className={styles.chipGrid} role="radiogroup" aria-label="コントロール状態">
        <button type="button" role="radio" aria-checked={!checked}
          className={`${styles.chip} ${styles.chipRadio} ${!checked ? styles.chipActive : ''}`}
          onClick={() => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: disease.key, field: 'uncontrolled', value: false } })}>
          コントロール良好
        </button>
        <button type="button" role="radio" aria-checked={checked}
          className={`${styles.chip} ${styles.chipRadio} ${checked ? styles.chipActive : ''}`}
          onClick={() => dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: disease.key, field: 'uncontrolled', value: true } })}>
          コントロール不良
        </button>
      </div>
      {checked && (
        <div className={styles.lifestyleRec} style={{ background: '#fff3e0', borderLeftColor: '#ef6c00', color: '#e65100' }}>
          コントロール不良時は、増量前にまず<strong>吸入手技・アドヒアランス・併存症介入</strong>が上位提案として表示されます (Phase 4)。
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
function Step2Panel({ state, dispatch, violations, onNext, onBack }) {
  const sharedClasses = useMemo(() => detectSharedClasses(state), [state.selectedDiseases, state.scoresByDisease, state.selectionsByDisease, state.patientHeader, state.commonLabs, state.commonHistory]);
  const followRec = useMemo(() => recommendFollowUp(state, violations), [state, violations]);
  // 推奨をデフォルト値に同期 (ユーザが既に override していなければ)
  useEffect(() => {
    if (!state.uiState.globalFollowIn || state.uiState.globalFollowAuto) {
      dispatch({ type: 'SET_GLOBAL_FOLLOW', payload: followRec.recommendedValue });
      dispatch({ type: 'SET_GLOBAL_FOLLOW_AUTO', payload: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followRec.recommendedValue]);
  const followIn = state.uiState.globalFollowIn || followRec.recommendedValue;
  const recLabel = FOLLOW_OPTIONS.find((o) => o.value === followIn)?.label;
  const isAuto = state.uiState.globalFollowAuto !== false;
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Phase 4: 治療戦略 <span className={styles.sectionHint}>(GLベース自動生成、疾患毎に提案を採用)</span></div>

      {/* 全疾患をまとめた次回再診目安 */}
      <div className={styles.followBox}>
        <div className={styles.followTitle}>
          📅 次回再診目安: <strong>{recLabel}</strong>
          {isAuto && <span className={styles.followAutoTag}>自動推奨</span>}
        </div>
        <div className={styles.followReasons}>
          {followRec.reasons.map((r, i) => <div key={i}>・{r}</div>)}
        </div>
        <div className={styles.followOverride}>
          <div className={styles.fieldLabel}>調整 (上書き):</div>
          <div className={styles.chipGrid}>
            {FOLLOW_OPTIONS.map((o) => (
              <button key={o.value} type="button"
                className={`${styles.bigPickerBtnSm} ${followIn === o.value ? styles.bigPickerBtnActive : ''}`}
                onClick={() => {
                  dispatch({ type: 'SET_GLOBAL_FOLLOW', payload: o.value });
                  dispatch({ type: 'SET_GLOBAL_FOLLOW_AUTO', payload: false });
                }}>
                {o.label}
              </button>
            ))}
            {!isAuto && (
              <button type="button" className={styles.bigPickerBtnSm}
                onClick={() => dispatch({ type: 'SET_GLOBAL_FOLLOW_AUTO', payload: true })}>
                自動推奨に戻す
              </button>
            )}
          </div>
        </div>
      </div>

      {sharedClasses.length > 0 && (
        <div className={styles.sharedClassBox}>
          <div className={styles.sharedClassTitle}>📌 複数疾患を同時カバーする推奨</div>
          {sharedClasses.map((sc, i) => (
            <div key={i} className={styles.sharedClassRow}>
              <strong>{sc.sharedClass}</strong>: {sc.items.map((it) => OVERVIEW_DISEASES.find((d) => d.key === it.disease)?.label).join(' + ')} の{sc.items.length}疾患を同時カバー
              {sc.items[0].drug && <span style={{ marginLeft: '0.5rem', color: '#1565c0' }}>→ {sc.items[0].drug}{sc.items[0].dose ? ` (${sc.items[0].dose})` : ''}</span>}
            </div>
          ))}
        </div>
      )}

      {state.selectedDiseases.map((key) => {
        const d = OVERVIEW_DISEASES.find((x) => x.key === key);
        if (!d) return null;
        return <DiseaseSuggestionCard key={key} disease={d} state={state} dispatch={dispatch} sharedClasses={sharedClasses} />;
      })}
      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る</button>
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={onNext}>まとめ + コード発行</button>
      </div>
    </div>
  );
}

// 推奨ラベルテーブル
const ACTION_LABEL = {
  start: '開始', add: '追加', titrate_up: '増量', titrate_down: '減量', titrate: '漸増',
  switch: '切替', stop: '中止', taper: '減量・漸減', urgent: '緊急対応', maintain: '現状維持',
  watch: '経過観察', refer: '専門医紹介', monitor: 'モニタ', caution: '注意', consider: '検討',
  consider_add: '追加検討', consider_alt: '代替検討', consider_other_disease: '他疾患側で検討',
  alternative: '代替案', lifestyle: '生活指導', lifestyle_first: '生活指導先行', reduce_or_stop: '減量・中止',
  check: '確認',
};
function actionLabel(a) { return ACTION_LABEL[a] || a; }
function sevClassName(sev) {
  if (sev === 'critical') return styles.alertCritical;
  if (sev === 'high') return styles.alertWarning;
  return styles.alertInfo;
}

// 推奨カード本文 — primary/detail/stepFlow を優先、なければ drug/reason へフォールバック
function RecBody({ rec, compact }) {
  const headline = rec.primary || rec.drug || actionLabel(rec.action);
  const subline = rec.detail || rec.reason || rec.concerns;
  return (
    <>
      <div className={styles.recHeadline}>
        <span className={styles.recAction}>{actionLabel(rec.action)}</span>
        <span className={styles.recPrimary}><AnnotatedText>{headline}</AnnotatedText></span>
      </div>
      {rec.stepFlow && <div className={styles.recStepFlow}>📍 <AnnotatedText>{rec.stepFlow}</AnnotatedText></div>}
      {rec.dose && <div className={styles.recDose}>用法: <AnnotatedText>{rec.dose}</AnnotatedText></div>}
      {subline && <div className={styles.recDetail}><AnnotatedText>{subline}</AnnotatedText></div>}
      {rec.concerns && rec.detail && <div className={styles.recConcerns}><AnnotatedText>{rec.concerns}</AnnotatedText></div>}
      {rec.gl && !compact && <div className={styles.recGl}>根拠: <AnnotatedText>{rec.gl}</AnnotatedText></div>}
    </>
  );
}

// 全疾患を見渡して次回再診目安を推奨する
// 院内方針: 処方は最長3ヶ月。慢性疾患を3ヶ月フォローと表示すること自体がリスク。
//   - 基本: 1-2ヶ月
//   - しぶしぶ許容: 3ヶ月
//   - 治療薬なし & 指摘事項なし (検診で軽度ひっかかったが治療適応外): 1年/有事再診
const FOLLOW_LEVELS = { URGENT: 0, SHORT: 1, NORMAL_1M: 2, NORMAL_2M: 3, MAX_3M: 4, ANNUAL: 5 };
const FOLLOW_VALUE_MAP = { 0: '1w', 1: '2w', 2: '4w', 3: '8w', 4: '12w', 5: '12m' };

function recommendFollowUp(state, violations) {
  const reasons = [];
  let level = FOLLOW_LEVELS.NORMAL_1M; // デフォルトは 1ヶ月
  const setMin = (lv, why) => { if (lv < level) level = lv; reasons.push(why); };
  const setMax = (lv, why) => { if (lv > level) level = lv; reasons.push(why); };

  const cl = state.commonLabs || {};
  const ph = state.patientHeader || {};

  // 治療なし・指摘事項なしケース判定
  const allUntreatedOrLifestyle = state.selectedDiseases.length > 0 && state.selectedDiseases.every((dk) => {
    const sel = state.selectionsByDisease?.[dk] || {};
    const noDrugs = Object.keys(sel.classDetails || {}).length === 0;
    return noDrugs && (sel.txStatus === 'untreated' || sel.txStatus === 'lifestyle_only' || !sel.txStatus);
  });
  const noWorrisomeLab = !cl.sbp_range || ['<120','120-129','130-139'].includes(cl.sbp_range);
  const noAbnormalHba1c = !cl.hba1c_range || ['unmeasured_normal','<5.6','5.6-5.9'].includes(cl.hba1c_range);
  const noAbnormalLdl = !cl.ldl_range || ['<70','70-99','100-119'].includes(cl.ldl_range);
  const noViolations = violations.length === 0;
  if (state.selectedDiseases.length === 0) {
    // 疾患選択なし → 表示しない (一覧外)
    setMax(FOLLOW_LEVELS.ANNUAL, '疾患選択なし');
    return { level: FOLLOW_LEVELS.ANNUAL, recommendedValue: FOLLOW_VALUE_MAP[FOLLOW_LEVELS.ANNUAL], reasons: ['疾患未選択'] };
  }
  if (allUntreatedOrLifestyle && noWorrisomeLab && noAbnormalHba1c && noAbnormalLdl && noViolations) {
    setMax(FOLLOW_LEVELS.ANNUAL, '治療薬なし・指摘事項なし → 1年後/有事再診 (来年検診で異常あれば来院)');
    return { level: FOLLOW_LEVELS.ANNUAL, recommendedValue: FOLLOW_VALUE_MAP[FOLLOW_LEVELS.ANNUAL], reasons };
  }

  // 危険系
  if (violations.some((v) => v.severity === 'critical')) setMin(FOLLOW_LEVELS.URGENT, '禁忌違反あり → 即日見直し・1週以内');
  if (cl.sbp_range === '180+') setMin(FOLLOW_LEVELS.URGENT, 'SBP≥180 → 当日精査・1週以内');
  if (cl.hba1c_range === '10+') setMin(FOLLOW_LEVELS.SHORT, 'HbA1c≥10 → 2週');
  if (cl.tg_range === '1000+') setMin(FOLLOW_LEVELS.URGENT, 'TG≥1000 → 即日精査 (膵炎リスク)');

  // コントロール不良
  for (const dk of state.selectedDiseases) {
    const sel = state.selectionsByDisease?.[dk];
    if (sel?.uncontrolled) setMin(FOLLOW_LEVELS.SHORT, `${OVERVIEW_DISEASES.find((d) => d.key === dk)?.label || dk} がコントロール不良 → 2週で再評価`);
  }

  // 新規開始/大幅変更
  let bigChange = false;
  for (const dk of state.selectedDiseases) {
    try {
      const sel = state.selectionsByDisease?.[dk] || {};
      const recsRaw = suggestTreatment(dk, state);
      const recs = sortRecsBySeverity(recsRaw);
      const adopted = recs[sel.selectedRecIdx ?? 0];
      if (!adopted) continue;
      const big = ['start', 'switch', 'titrate_up', 'add'].includes(adopted.action);
      if (big && (adopted.severity === 'critical' || adopted.severity === 'high')) {
        bigChange = true;
        setMin(FOLLOW_LEVELS.NORMAL_1M, `${OVERVIEW_DISEASES.find((d) => d.key === dk)?.label || dk} で薬剤大幅変更 → 1ヶ月で効果・副作用確認`);
      }
    } catch (e) { /* skip */ }
  }

  if (ph.cm_ckd_g45) setMin(FOLLOW_LEVELS.NORMAL_1M, 'CKD G4-5 → 1ヶ月ごとに腎機能・K再評価');
  const hfScore = state.scoresByDisease?.hf?.result;
  if (hfScore?.nyha === '3' || hfScore?.nyha === '4') setMin(FOLLOW_LEVELS.SHORT, 'NYHA III-IV → 2週で再評価');

  // 安定例 → 1-2ヶ月。3ヶ月は「しぶしぶ許容」のみ
  if (level === FOLLOW_LEVELS.NORMAL_1M && !bigChange) {
    // 安定で大幅変更もない → 2ヶ月に緩めても許容
    setMax(FOLLOW_LEVELS.NORMAL_2M, '症状・検査値安定、大幅な薬剤変更なし → 2ヶ月後でも許容');
  }

  return { level, recommendedValue: FOLLOW_VALUE_MAP[level], reasons };
}

// severity ソート (critical→high→medium→low)
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
function sortRecsBySeverity(recs) {
  return [...recs].map((r, i) => ({ r, i })).sort((a, b) => {
    const sa = SEV_ORDER[a.r.severity] ?? 4;
    const sb = SEV_ORDER[b.r.severity] ?? 4;
    if (sa !== sb) return sa - sb;
    return a.i - b.i;
  }).map((x) => x.r);
}

// スコア結果からの管理目標サマリー (疾患別)
function computeScoreSummary(disease, state) {
  const sc = state.scoresByDisease?.[disease.key];
  const ph = state.patientHeader || {};
  const cl = state.commonLabs || {};
  const lines = [];

  if (disease.key === 'dlp') {
    if (!sc?.result) return null;
    const r = sc.result;
    lines.push(`久山町スコア = ${r.points}点 (${r.label})`);
    if (r.ldlTarget) lines.push(`LDL管理目標: <${r.ldlTarget} mg/dL`);
  } else if (disease.key === 'ht') {
    if (!sc?.result) return null;
    const r = sc.result;
    const tierJp = { low: '低', medium: '中', high: '高', very_high: '非常に高' }[r.tier] || r.tier;
    lines.push(`JSH2025リスク区分: ${tierJp}リスク (危険因子${r.rfCount}個${r.derivedGrade ? `、BP ${r.derivedGrade}` : ''})`);
    const target = ph.cm_dm || ph.cm_ckd_g45 || state.commonHistory?.stroke || ph.cm_ascvd
      ? '<130/80 (DM/CKD/ASCVD合併で強化目標)'
      : '<140/90 (75歳未満)';
    lines.push(`BP管理目標: ${target}`);
    lines.push(`家庭血圧目標: 上記-5 mmHg (例: 診察 130/80 → 家庭 125/75)`);
  } else if (disease.key === 'ckd') {
    if (!sc?.result) return null;
    const r = sc.result;
    lines.push(`KDIGO病期: ${r.gStage}${r.aStage} (${r.risk}リスク)`);
    lines.push(`管理目標: 蛋白尿減少+eGFR低下抑制 (ARB+SGLT2i 強推奨)`);
    lines.push(`BP管理目標: <130/80, K監視 (5.5以上で吸着薬)`);
  } else if (disease.key === 'af') {
    if (!sc?.result) return null;
    const r = sc.result;
    if (r.chadsvasc) lines.push(`CHA₂DS₂-VASc = ${r.chadsvasc.score}点 → 抗凝固${r.chadsvasc.anticoag === 'recommend' ? '推奨' : r.chadsvasc.anticoag === 'consider' ? '考慮' : '不要'}`);
    if (r.hasbled) lines.push(`HAS-BLED = ${r.hasbled.score}点 (${r.hasbled.tier === 'high' ? '高出血リスク・修正可能因子要対応' : r.hasbled.tier === 'moderate' ? '中等度' : '低リスク'})`);
    lines.push(`管理目標: レート制御 HR<110 / リズム制御は専門医併診`);
  } else if (disease.key === 'hf') {
    if (!sc?.result) return null;
    const r = sc.result;
    lines.push(r.label || '');
    if (r.ef === 'reduced') lines.push('管理目標: 4本柱 (ARNI/ACEi+βB+MRA+SGLT2i) 全て導入・最大耐用量');
    else if (r.ef === 'preserved') lines.push('管理目標: SGLT2i 第一選択+うっ血対症 (利尿薬)');
    else if (r.ef === 'mid_range') lines.push('管理目標: SGLT2i + 必要時 HFrEF類似管理');
    lines.push('体重: 毎日測定、+2kg/数日 で利尿薬調整');
  } else if (disease.key === 'copd') {
    if (!sc?.result) return null;
    const r = sc.result;
    lines.push(`GOLD ${r.group}: ${r.label}`);
    lines.push(`管理目標: 症状緩和+増悪予防+FEV1低下抑制`);
    lines.push(`必須: 禁煙・ワクチン (インフル/肺炎球菌/RSV/帯状疱疹/COVID)`);
  } else if (disease.key === 't2dm') {
    const hba1c = cl.hba1c_range;
    if (!hba1c) return null;
    let target = '<7.0%';
    if (ph.co_frail || ph.co_elderly_75) target = '<8.0% (フレイル/超高齢、低血糖回避)';
    else if (ph.cm_ascvd || ph.cm_chf || ph.cm_ckd_g45) target = '<7.0% (合併症あり、低血糖避ける)';
    lines.push(`現HbA1c: ${hba1c} → 管理目標: ${target}`);
    lines.push(`第一選択: メトホルミン (eGFR<30で禁忌)`);
    if (ph.cm_ascvd || ph.cm_chf) lines.push('合併症あり → SGLT2i/GLP-1RA 併用が GL推奨 (心腎保護)');
    if (ph.cm_ckd_g45) lines.push('CKD合併: SGLT2i + リナグリプチン (用量調整不要)');
  } else if (disease.key === 'gout') {
    const sel = state.selectionsByDisease?.[disease.key];
    lines.push(`SUA管理目標: 結節 <5.0 / 発作既往 <6.0 / 無症候+合併症 <7.0 (過降下フロア 3.0)`);
    lines.push(`第一選択: アロプリノール (HLA-B*5801確認)、eGFR<30はフェブキソスタット`);
    if (sel?.uncontrolled) lines.push('発作頻発 → ULT忠実度確認+コルヒチン予防 (3-6ヶ月)');
  } else if (disease.key === 'ascvd2') {
    lines.push(`管理目標: LDL <70 (高リスクは <55)、SBP <130/80、HbA1c <7.0`);
    lines.push(`必須: 抗血小板薬 (アスピリン/クロピドグレル) + 高強度スタチン`);
    lines.push(`完全禁煙 + 心リハ + 心保護薬 (ARB/βB)`);
  } else if (disease.key === 'asthma') {
    const sel = state.selectionsByDisease?.[disease.key];
    lines.push(`管理目標: 症状ゼロ・夜間覚醒なし・SABA頓用ゼロ (理想)`);
    lines.push(`評価: ACT≥20 / SABA頓用 年≤2缶`);
    if (sel?.uncontrolled) lines.push('コントロール不良 → 増量前に 吸入手技+アドヒアランス+併存症 (GERD/鼻炎/肥満/OSAS) 介入');
  }
  if (lines.length === 0) return null;
  return lines;
}

// 疾患ごとの治療提案カード — アコーディオン: 閉じている時は採用提案のみ、開くと候補一覧
function DiseaseSuggestionCard({ disease, state, dispatch, sharedClasses }) {
  const sel = state.selectionsByDisease[disease.key] || {};
  const recsRaw = useMemo(() => suggestTreatment(disease.key, state), [disease.key, state.patientHeader, state.commonLabs, state.commonHistory, state.scoresByDisease, state.selectionsByDisease]);
  const recs = useMemo(() => sortRecsBySeverity(recsRaw), [recsRaw]);
  const expanded = state.uiState.expandedSuggestionId === disease.key;
  const setExpanded = (open) => dispatch({ type: 'SET_UI_EXPANDED_SUGGESTION', payload: open ? disease.key : null });
  const scoreSummary = computeScoreSummary(disease, state);

  if (!recs || recs.length === 0) {
    return (
      <div className={`${styles.scorePanel} ${categoryClass(disease.category)}`}>
        <div className={styles.scorePanelTitle}>{disease.label}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Phase 3 で治療状況を選び、必要なら Phase 2 のスコアを完了してください。
        </div>
      </div>
    );
  }

  const selectedIdx = sel.selectedRecIdx ?? 0;
  const selected = recs[selectedIdx] || recs[0];
  const isSharedDrug = sharedClasses?.some((sc) => sc.sharedClass === selected.sharedClass);

  return (
    <div className={`${styles.suggestionAccordion} ${categoryClass(disease.category)}`}>
      <button className={styles.suggestionAccordionHeader}
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}>
        <span className={styles.suggestionAccordionTitle}>
          {expanded ? '▼' : '▶'} {disease.label}
          <span className={styles.suggestionCount}>({recs.length}案)</span>
          {isSharedDrug && <span className={styles.sharedTag}>🔗 {selected.sharedClass}</span>}
        </span>
      </button>

      {/* スコア結果サマリー — 全案に先立って管理目標を提示 */}
      {scoreSummary && (
        <div className={styles.scoreSummaryBox}>
          <div className={styles.scoreSummaryTitle}>📊 リスク評価・管理目標</div>
          {scoreSummary.map((line, i) => (
            <div key={i} className={styles.scoreSummaryLine}><AnnotatedText>{line}</AnnotatedText></div>
          ))}
        </div>
      )}

      {/* 閉じている時も採用案は常に表示 */}
      <div className={`${styles.alertBanner} ${sevClassName(selected.severity)} ${styles.adoptedRec}`}>
        <div style={{ width: '100%' }}>
          <div className={styles.adoptedHeader}>採用中 (第{selectedIdx + 1}案 / {recs.length}案中)</div>
          <RecBody rec={selected} compact={!expanded} />
        </div>
      </div>

      {expanded && recs.length > 1 && (
        <div className={styles.suggestionAlternatives}>
          <div className={styles.suggestionAltLabel}>他の候補 (クリックで採用):</div>
          {recs.map((r, idx) => {
            if (idx === selectedIdx) return null;
            return (
              <button key={idx} type="button" className={`${styles.alertBanner} ${sevClassName(r.severity)} ${styles.suggestionBtn} ${styles.altRec}`}
                onClick={() => {
                  dispatch({ type: 'SET_STEP2_FIELD', payload: { disease: disease.key, field: 'selectedRecIdx', value: idx } });
                }}>
                <div style={{ width: '100%' }}>
                  <div className={styles.adoptedHeader}>第{idx + 1}案{r.sharedClass ? ` ・ ${r.sharedClass}` : ''}</div>
                  <RecBody rec={r} compact />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 詳細治療設計: Treatment Booster inline 連携 */}
      <DetailedTreatmentBlock disease={disease} state={state} dispatch={dispatch} />
    </div>
  );
}

// Treatment Booster inline 呼び出しブロック
function DetailedTreatmentBlock({ disease, state, dispatch }) {
  if (!disease.boosterKey) return null;
  const open = state.uiState.expandedTreatmentId === disease.key;
  const setOpen = (v) => dispatch({ type: 'SET_UI_EXPANDED_TREATMENT', payload: v ? disease.key : null });
  const sel = state.selectionsByDisease[disease.key] || {};
  // 現在の選択を Treatment Booster の prefill 用に変換
  const prefilledDrugs = useMemo(() => {
    const drugIds = Object.keys(sel.classDetails || {});
    return drugIds.map((cid) => {
      const klass = disease.drugClasses.find((c) => c.id === cid);
      const drug = klass?.drugs.find((d) => d.id === sel.classDetails[cid].drugId);
      return drug?.name || klass?.label;
    }).filter(Boolean).join(',');
  }, [sel.classDetails, disease.drugClasses]);

  return (
    <div className={styles.detailedTreatmentBlock}>
      <button type="button" className={styles.detailedTreatmentBtn}
        onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? '▼ 詳細治療設計を閉じる' : `▶ ${disease.label} の詳細治療設計を開く`}
      </button>
      {open && (
        <div className={styles.embeddedTreatment}>
          <div className={styles.embeddedTreatmentHint}>
            🔗 現在の選択 ({prefilledDrugs || '未選択'}) を引継ぎ。詳細設計後の判断はカルテに記載してください
          </div>
          <TreatmentBooster
            disease={disease.boosterKey}
            initialDrugs={prefilledDrugs}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY
   ============================================================ */
// カルテ貼付用テキスト生成
function buildCarteText(state) {
  const lines = [];
  lines.push('【慢性疾患管理ブースター 出力】');
  const ph = state.patientHeader;
  const ageL = AGE_RANGE_OPTIONS.find((o) => o.value === ph.age)?.label;
  const sexL = ph.sex === 'M' ? '男性' : ph.sex === 'F' ? '女性' : '';
  const smkL = ph.smoking === 'never' ? '非喫煙' : ph.smoking === 'past' ? '過去喫煙' : ph.smoking === 'current' ? '現喫煙' : '';
  const phBits = [ageL, sexL, smkL].filter(Boolean).join(' / ');
  lines.push(`患者: ${phBits}${ph.co_pregnancy ? ' / 妊娠中' : ''}${ph.co_lactation ? ' / 授乳中' : ''}${ph.co_frail ? ' / フレイル' : ''}`);

  const txStatusLabel = (s) => ({ untreated: '未治療', lifestyle_only: '生活指導のみ', on_treatment: '薬物治療中' }[s] || '未指定');
  for (const key of state.selectedDiseases) {
    const d = OVERVIEW_DISEASES.find((x) => x.key === key);
    if (!d) continue;
    const sel = state.selectionsByDisease[key] || {};
    const drugSummary = Object.entries(sel.classDetails || {}).map(([cid, det]) => {
      const dc = d.drugClasses.find((c) => c.id === cid);
      const drug = dc?.drugs.find((dr) => dr.id === det.drugId);
      const doseLabel = drug?.doses.find((x) => x.value === det.dose)?.label || det.dose;
      return `${drug?.name || dc?.label} ${doseLabel}`.trim();
    }).filter(Boolean);
    lines.push('');
    lines.push(`■ ${d.label}`);
    lines.push(`  状況: ${txStatusLabel(sel.txStatus)}${sel.uncontrolled ? ' (コントロール不良)' : ''}`);
    if (drugSummary.length > 0) lines.push(`  処方: ${drugSummary.join(' + ')}`);

    const recs = suggestTreatment(key, state);
    const sortedRecs = [...recs].sort((a, b) => (({ critical: 0, high: 1, medium: 2, low: 3 }[a.severity] ?? 4) - ({ critical: 0, high: 1, medium: 2, low: 3 }[b.severity] ?? 4)));
    const adopted = sortedRecs[sel.selectedRecIdx ?? 0];
    if (adopted) {
      const head = adopted.primary || adopted.drug || '';
      const dose = adopted.dose ? ` (${adopted.dose})` : '';
      lines.push(`  治療提案: ${actionLabel(adopted.action)}: ${head}${dose}`);
      if (adopted.detail || adopted.reason) lines.push(`    根拠: ${adopted.detail || adopted.reason}${adopted.gl ? ` [${adopted.gl}]` : ''}`);
    }
    const score = state.scoresByDisease?.[key]?.result;
    if (score?.label) lines.push(`  評価: ${score.label}`);
  }
  const followLabel = FOLLOW_OPTIONS.find((o) => o.value === state.uiState?.globalFollowIn)?.label;
  if (followLabel) {
    lines.push('');
    lines.push(`次回フォロー: ${followLabel}`);
  }
  if (state.followupCode.issued) {
    lines.push(`フォローコード: ${state.followupCode.issued}`);
  }
  return lines.join('\n');
}

function SummaryPanel({ state, dispatch, violations, onBack, onCopy }) {
  const sharedClasses = useMemo(() => detectSharedClasses(state), [state]);
  const txStatusLabel = (s) => ({ untreated: '未治療', lifestyle_only: '生活指導のみ', on_treatment: '薬物治療中' }[s] || '未指定');
  const carteText = useMemo(() => buildCarteText(state), [state]);
  const [copied, setCopied] = useState(false);
  const handleCopyCarte = useCallback(() => {
    navigator.clipboard?.writeText(carteText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [carteText]);
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>まとめ</div>
      {violations.filter((v) => v.severity === 'critical').map((v, i) => (
        <div key={i} className={`${styles.alertBanner} ${styles.alertCritical}`} role="alert">⚠ {v.message}</div>
      ))}
      {violations.filter((v) => v.severity === 'warning').map((v, i) => (
        <div key={i} className={`${styles.alertBanner} ${styles.alertWarning}`} role="alert">⚡ {v.message}</div>
      ))}

      {sharedClasses.length > 0 && (
        <div className={styles.sharedClassBox}>
          <div className={styles.sharedClassTitle}>📌 複数疾患を同時カバーする薬剤</div>
          {sharedClasses.map((sc, i) => (
            <div key={i} className={styles.sharedClassRow}>
              <strong>{sc.sharedClass}</strong>: {sc.items.map((it) => OVERVIEW_DISEASES.find((d) => d.key === it.disease)?.label).join(' + ')}
              {sc.items[0].drug && <span style={{ marginLeft: '0.5rem', color: '#1565c0' }}>→ {sc.items[0].drug}{sc.items[0].dose ? ` (${sc.items[0].dose})` : ''}</span>}
            </div>
          ))}
        </div>
      )}

      {state.followupCode.issued && (
        <div style={{ marginTop: '0.8rem' }}>
          <div className={styles.fieldLabel}>フォローコード (再診時の復元用、カルテ貼付テキストにも含まれます)</div>
          <div className={styles.codeBox}>
            <span className={styles.codeDisplay}>{state.followupCode.issued}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.8rem' }}>
        <div className={styles.fieldLabel}>選択内容</div>
        <div>
          {state.selectedDiseases.map((key) => {
            const d = OVERVIEW_DISEASES.find((x) => x.key === key);
            if (!d) return null;
            const sel = state.selectionsByDisease[key] || {};
            const lo = LIFESTYLE_OPTIONS.find((l) => l.id === sel.lifestyle);
            const drugSummary = Object.entries(sel.classDetails || {}).map(([cid, det]) => {
              const dc = d.drugClasses.find((c) => c.id === cid);
              const drug = dc?.drugs.find((dr) => dr.id === det.drugId);
              return `${drug?.name || dc?.label} ${det.dose || ''}`.trim();
            }).filter(Boolean);

            const recs = suggestTreatment(key, state);
            const selectedIdx = sel.selectedRecIdx ?? 0;
            const adoptedRec = recs[selectedIdx];
            const adoptedHead = adoptedRec ? (adoptedRec.primary || adoptedRec.drug || actionLabel(adoptedRec.action)) : '';
            const adoptedSub  = adoptedRec ? (adoptedRec.detail || adoptedRec.reason) : '';

            return (
              <div key={key} className={`${styles.summaryDiseaseCard} ${categoryClass(d.category)}`}>
                <div className={styles.summaryDiseaseTitle}>{d.label}</div>
                <div className={styles.summaryRow}>
                  <strong>現在の処方 (Phase 3):</strong> {txStatusLabel(sel.txStatus)}
                  {sel.txStatus === 'on_treatment' && drugSummary.length > 0 && <div style={{ marginLeft: '1rem' }}>処方: {drugSummary.join(' + ')}</div>}
                  {lo && <div style={{ marginLeft: '1rem' }}>生活: {lo.label}</div>}
                  {sel.uncontrolled && <div style={{ marginLeft: '1rem', color: '#e65100' }}>※ コントロール不良</div>}
                </div>
                {adoptedRec && (
                  <div className={styles.summaryRow}>
                    <strong>採用治療提案 (Phase 4 第{selectedIdx + 1}案):</strong>
                    <div style={{ marginLeft: '1rem' }}>
                      {actionLabel(adoptedRec.action)}: {adoptedHead}
                      {adoptedRec.dose && ` — ${adoptedRec.dose}`}
                    </div>
                    {adoptedRec.stepFlow && <div style={{ marginLeft: '1rem', fontSize: '0.82rem' }}>📍 {adoptedRec.stepFlow}</div>}
                    <div style={{ marginLeft: '1rem', fontSize: '0.82rem', color: 'var(--ifm-color-emphasis-700)' }}>
                      {adoptedSub}
                      {adoptedRec.gl && ` (根拠: ${adoptedRec.gl})`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* カルテ貼付用テキスト */}
      <div className={styles.section} style={{ padding: '0.8rem 1rem' }}>
        <div className={styles.sectionTitle}>カルテ貼付用 <span className={styles.sectionHint}>(コピーして電子カルテへ。メモはカルテ側に記載)</span></div>
        <textarea readOnly className={styles.carteText} value={carteText} />
        <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={handleCopyCarte} style={{ marginTop: '0.5rem' }}>
          {copied ? '✓ コピー済み' : '📋 全文コピー'}
        </button>
      </div>

      <div className={styles.navRow}>
        <button className={`${styles.navBtn} ${styles.navBtnSecondary}`} onClick={onBack}>戻る (再編集)</button>
      </div>
    </div>
  );
}
