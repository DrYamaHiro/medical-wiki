import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

// Default data (fever) — used when no props are passed
import * as feverData from './feverData';

/* -------------------------------------------------------- */
/*  Scoring v2.1: floor は「自疾患の redFlags が発火」時のみ */
/*  Bug fix: ANY Red Flag で sev>=4 全疾患 floor=20 する     */
/*           無差別適用が無関係な重症疾患を top-3 に強制     */
/*           浮上させていた問題を解消                       */
/* -------------------------------------------------------- */
function calcScore(
  diff,
  selectedSymptoms,
  selectedFindings,
  hasActiveRedFlags,
  firedRedFlagConditions /* Set<string> — 発火した RED_FLAGS の conditions 和集合 */,
  SYMPTOMS /* v2.2: weight 個別化のための lookup */,
  FINDINGS
) {
  let matchCount = 0;
  const selS = new Set(selectedSymptoms);
  const selF = new Set(selectedFindings);

  // weight 個別化 (default sym=+2, fin=+3、特異度高い項目は +4)
  const symMap = new Map((SYMPTOMS || []).map((s) => [s.id, s]));
  const findMap = new Map((FINDINGS || []).map((f) => [f.id, f]));
  for (const symId of diff.symptoms) {
    if (selS.has(symId)) matchCount += symMap.get(symId)?.weight ?? 2;
  }
  for (const fId of diff.findings) {
    if (selF.has(fId)) matchCount += findMap.get(fId)?.weight ?? 3;
  }

  // negativeFindings: 「この所見が無い」ことが選択されると本疾患の確度が下がる
  const neg = diff.negativeFindings || [];
  let negHits = 0;
  for (const nId of neg) if (selF.has(nId)) negHits += 1;
  matchCount = Math.max(0, matchCount - 1.5 * negHits);

  const prev = diff.prevalenceWeight ?? 5;
  const sev = diff.severityWeight ?? 3;

  // 自疾患関連の Red Flag が選択された条件と交差するか
  const fired = firedRedFlagConditions || new Set();
  const ownRF = diff.redFlags || [];
  const hasRelevantRedFlag = ownRF.some((c) => fired.has(c));

  if (hasActiveRedFlags && hasRelevantRedFlag) {
    // 自疾患の Red Flag 発火 → 階段化 floor でブースト
    const floor = sev >= 5 ? 25 : sev >= 4 ? 18 : 0;
    const boosted = matchCount * (1 + sev * 0.4) + prev * 0.5;
    return Math.max(boosted, floor + matchCount);
  }

  // Red Flag 無し / または他疾患由来の Red Flag → 頻度ベース
  return matchCount * (1 + prev * 0.15) + prev * 1.5 + sev * 0.3;
}

/* -------------------------------------------------------- */
/*  Main Component                                          */
/* -------------------------------------------------------- */
export default function DiagnosticBooster({
  symptoms: propSymptoms,
  findings: propFindings,
  differentials: propDiffs,
  redFlags: propRedFlags,
  subtitle: propSubtitle,
}) {
  // Use props if provided, otherwise fall back to fever data
  const SYMPTOMS = propSymptoms || feverData.SYMPTOMS;
  const FINDINGS = propFindings || feverData.FINDINGS;
  const DIFFERENTIALS = propDiffs || feverData.DIFFERENTIALS;
  const RED_FLAGS = propRedFlags || feverData.RED_FLAGS;
  const subtitle = propSubtitle || '発熱の鑑別思考支援ツール';

  const [phase, setPhase] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFindings, setSelectedFindings] = useState([]);

  const toggleSymptom = useCallback((id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleFinding = useCallback((id) => {
    setSelectedFindings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const reset = useCallback(() => {
    setPhase(1);
    setSelectedSymptoms([]);
    setSelectedFindings([]);
  }, []);

  const visibleFindings = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const symSet = new Set(selectedSymptoms);
    return FINDINGS.filter(
      (f) => f.triggers.length === 0 || f.triggers.some((t) => symSet.has(t))
    );
  }, [selectedSymptoms, FINDINGS]);

  const activeRedFlags = useMemo(() => {
    const allSelected = new Set([...selectedSymptoms, ...selectedFindings]);
    return RED_FLAGS.filter((rf) =>
      rf.conditions.some((c) => allSelected.has(c))
    );
  }, [selectedSymptoms, selectedFindings, RED_FLAGS]);

  const hasRedFlags = activeRedFlags.length > 0;

  // 発火している RED_FLAGS の conditions の和集合 (calcScore 関連性判定用)
  const firedRedFlagConditions = useMemo(() => {
    const allSelected = new Set([...selectedSymptoms, ...selectedFindings]);
    const fired = new Set();
    for (const rf of activeRedFlags) {
      for (const c of rf.conditions) {
        if (allSelected.has(c)) fired.add(c);
      }
    }
    return fired;
  }, [activeRedFlags, selectedSymptoms, selectedFindings]);

  // Phase 2 #9: showWhen 条件付き表示判定
  const matchesShowWhen = useCallback((d) => {
    if (!d.showWhen || !Array.isArray(d.showWhen.anyOf)) return false;
    const selected = new Set([...selectedSymptoms, ...selectedFindings]);
    return d.showWhen.anyOf.some((c) => selected.has(c));
  }, [selectedSymptoms, selectedFindings]);

  const rankedDiffs = useMemo(() => {
    return DIFFERENTIALS.map((d) => ({
      ...d,
      _score: calcScore(d, selectedSymptoms, selectedFindings, hasRedFlags, firedRedFlagConditions, SYMPTOMS, FINDINGS),
    }))
      .filter((d) => d._score > 0 || matchesShowWhen(d) || d.alwaysShow)
      .sort((a, b) => b._score - a._score);
  }, [selectedSymptoms, selectedFindings, DIFFERENTIALS, hasRedFlags, firedRedFlagConditions, matchesShowWhen, SYMPTOMS, FINDINGS]);

  // Phase 3 開閉モード: null=auto (top-5 + sev≥4), true=全展開, false=全折畳み
  const [expandAll, setExpandAll] = useState(null);
  const isOpen = useCallback((diff, idx) => {
    if (expandAll === true) return true;
    if (expandAll === false) return false;
    return idx < 5 || (diff.severityWeight ?? 0) >= 4;
  }, [expandAll]);

  const symptomGroups = useMemo(() => {
    const groups = {};
    SYMPTOMS.forEach((s) => {
      if (!groups[s.cat]) groups[s.cat] = [];
      groups[s.cat].push(s);
    });
    return groups;
  }, [SYMPTOMS]);

  return (
    <div className={styles.booster}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Diagnostic Booster</p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.phaseIndicator}>
            Phase {phase}/3
          </span>
          <button className={styles.resetBtn} onClick={reset}>
            リセット
          </button>
        </div>
      </div>

      {/* Red Flag 警告 */}
      {activeRedFlags.length > 0 && (
        <div className={styles.redFlagBox}>
          {activeRedFlags.map((rf, i) => (
            <div
              key={i}
              className={
                rf.severity === 'critical'
                  ? styles.redFlagCritical
                  : styles.redFlagWarning
              }
            >
              {rf.severity === 'critical' ? '\u26a0\ufe0f ' : '\u26a0 '}
              {rf.message}
            </div>
          ))}
        </div>
      )}

      {/* Phase 1: 随伴症状 */}
      {phase >= 1 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 1: 随伴症状を選択
            <span className={styles.sectionHint}>（複数選択可）</span>
          </h4>
          {Object.entries(symptomGroups).map(([cat, items]) => (
            <div key={cat} className={styles.catGroup}>
              <span className={styles.catLabel}>{cat}</span>
              <div className={styles.chipGrid}>
                {items.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.chip} ${
                      selectedSymptoms.includes(s.id) ? styles.chipActive : ''
                    }`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {phase === 1 && selectedSymptoms.length === 0 && (
            <div className={styles.phaseHint} role="status" aria-live="polite">
              ⓘ Phase 2 へ進むには <strong>少なくとも1つの随伴症状</strong>を選択してください。該当がなくても主訴に近い症状を1つ選択してください。
            </div>
          )}
          {selectedSymptoms.length > 0 && phase === 1 && (
            <button
              className={styles.nextBtn}
              onClick={() => setPhase(2)}
            >
              Phase 2: 身体所見へ進む
            </button>
          )}
        </div>
      )}

      {/* Phase 2: 身体所見 */}
      {phase >= 2 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 2: 身体所見を選択
            <span className={styles.sectionHint}>（該当するものを選択）</span>
          </h4>
          <div className={styles.chipGrid}>
            {visibleFindings.map((f) => (
              <button
                key={f.id}
                className={`${styles.chip} ${
                  selectedFindings.includes(f.id) ? styles.chipActive : ''
                }`}
                onClick={() => toggleFinding(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {phase === 2 && (
            <button
              className={styles.nextBtn}
              onClick={() => setPhase(3)}
            >
              Phase 3: 鑑別結果を表示
            </button>
          )}
        </div>
      )}

      {/* Phase 3: 鑑別結果 */}
      {phase >= 3 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 3: 鑑別候補
            <span className={styles.sectionHint}>
              （一致度順に表示 / {rankedDiffs.length}件）
            </span>
          </h4>
          {selectedSymptoms.length === 0 ? (
            <div className={styles.phaseBlocker} role="alert">
              ⚠ 症状未選択のままでは鑑別は表示できません。Phase 1 に戻って症状を選択してください。
              <button className={styles.resetBtn} onClick={() => setPhase(1)} style={{ marginLeft: '0.5rem' }}>Phase 1 へ戻る</button>
            </div>
          ) : rankedDiffs.length === 0 ? (
            <p className={styles.noResult}>
              該当する鑑別候補がありません。症状・所見を追加してください。
            </p>
          ) : (
            <div className={styles.diffList}>
              <div className={styles.expandToggle}>
                <button
                  className={styles.toggleBtn}
                  onClick={() => setExpandAll(expandAll === true ? false : true)}
                  aria-pressed={expandAll === true}
                >
                  {expandAll === true ? '▼ 全件折畳み' : '▶ 全件展開'}
                </button>
                {expandAll !== null && (
                  <button className={styles.toggleBtn} onClick={() => setExpandAll(null)}>
                    自動 (top-5 + 重症)
                  </button>
                )}
                <span className={styles.toggleHint}>自動: 上位5件 + 重症度≥4 を常時展開</span>
              </div>
              {rankedDiffs.map((d, idx) => (
                <details key={d.id} className={styles.diffCard} open={isOpen(d, idx)}>
                  <summary className={styles.diffSummary}>
                    <span className={styles.diffRank}>#{idx + 1}</span>
                    <span className={styles.diffName}>{d.name}</span>
                    <span className={styles.diffCat}>{d.cat}</span>
                    <span className={styles.diffFreq}>{d.freq}</span>
                  </summary>
                  <div className={styles.diffBody}>
                    {d.resolvedStillDangerous && (
                      <div className={styles.resolvedWarning}>
                        &#9888; 症状が消失していても危険な疾患です。来院時に無症状でも精査を検討してください。
                      </div>
                    )}
                    {(d.severityWeight ?? 0) >= 4 && (
                      <div className={styles.severityContext}>
                        &#128312; 重篤な疾患の可能性があります。クリニックでの除外が困難な場合に紹介を検討してください。
                      </div>
                    )}
                    <p className={styles.diffComment}>{d.comment}</p>
                    <div className={styles.diffAction}>
                      <strong>Next Step:</strong> {d.nextStep}
                    </div>
                    {d.link && (
                      <a className={styles.diffLink} href={d.link}>
                        Wiki詳細ページへ
                      </a>
                    )}
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* 追加確認すべき所見 */}
          {rankedDiffs.length > 0 && (
            <div className={styles.additionalCheck}>
              <h5>この組み合わせで追加確認すべき所見:</h5>
              <ul>
                {rankedDiffs.slice(0, 5).flatMap((d) =>
                  d.findings
                    .filter((f) => !selectedFindings.includes(f))
                    .map((f) => {
                      const finding = FINDINGS.find((fd) => fd.id === f);
                      return finding ? (
                        <li key={`${d.id}-${f}`}>
                          <strong>{finding.label}</strong>
                          <span className={styles.checkReason}>
                            {' '}
                            ({d.name}の鑑別に有用)
                          </span>
                        </li>
                      ) : null;
                    })
                ).filter((v, i, a) => v && a.findIndex((x) => x && x.key === v.key) === i)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Red Flag 警告 (画面下部にも再掲、画面切れ対策) */}
      {activeRedFlags.length > 0 && (
        <div className={styles.redFlagBox} aria-label="Red Flag 再掲">
          <div className={styles.redFlagFooterLabel}>⚠ Red Flag (画面上部にも表示):</div>
          {activeRedFlags.map((rf, i) => (
            <div
              key={`bottom-${i}`}
              className={
                rf.severity === 'critical'
                  ? styles.redFlagCritical
                  : styles.redFlagWarning
              }
            >
              {rf.severity === 'critical' ? '⚠️ ' : '⚠ '}
              {rf.message}
            </div>
          ))}
        </div>
      )}

      {/* フッター */}
      <div className={styles.footer}>
        本ツールは診断思考の補助であり、臨床判断を代替するものではありません。
      </div>
    </div>
  );
}
