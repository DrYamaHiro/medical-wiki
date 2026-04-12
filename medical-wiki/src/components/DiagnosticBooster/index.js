import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { SYMPTOMS, FINDINGS, DIFFERENTIALS, RED_FLAGS } from './feverData';

/* -------------------------------------------------------- */
/*  Scoring: 選択された症状・所見と各鑑別の一致度を算出     */
/* -------------------------------------------------------- */
function score(diff, selectedSymptoms, selectedFindings) {
  let s = 0;
  const selS = new Set(selectedSymptoms);
  const selF = new Set(selectedFindings);

  // 症状マッチ
  for (const sym of diff.symptoms) {
    if (selS.has(sym)) s += 2;
  }
  // 所見マッチ（より重み高い）
  for (const f of diff.findings) {
    if (selF.has(f)) s += 3;
  }
  // 選択された症状が疾患に含まれない場合は減点しない（候補から外さない）
  return s;
}

/* -------------------------------------------------------- */
/*  Main Component                                          */
/* -------------------------------------------------------- */
export default function DiagnosticBooster() {
  const [phase, setPhase] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFindings, setSelectedFindings] = useState([]);

  // 症状トグル
  const toggleSymptom = useCallback((id) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // 所見トグル
  const toggleFinding = useCallback((id) => {
    setSelectedFindings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // リセット
  const reset = useCallback(() => {
    setPhase(1);
    setSelectedSymptoms([]);
    setSelectedFindings([]);
  }, []);

  // Phase 2: 表示する所見をフィルタ
  const visibleFindings = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    const symSet = new Set(selectedSymptoms);
    return FINDINGS.filter(
      (f) => f.triggers.length === 0 || f.triggers.some((t) => symSet.has(t))
    );
  }, [selectedSymptoms]);

  // Red Flag 検出
  const activeRedFlags = useMemo(() => {
    const allSelected = new Set([...selectedSymptoms, ...selectedFindings]);
    return RED_FLAGS.filter((rf) =>
      rf.conditions.some((c) => allSelected.has(c))
    );
  }, [selectedSymptoms, selectedFindings]);

  // 鑑別候補のスコアリング・ソート
  const rankedDiffs = useMemo(() => {
    return DIFFERENTIALS.map((d) => ({
      ...d,
      score: score(d, selectedSymptoms, selectedFindings),
    }))
      .filter((d) => d.score > 0 || d.alwaysShow)
      .sort((a, b) => b.score - a.score);
  }, [selectedSymptoms, selectedFindings]);

  // 症状をカテゴリ別にグループ化
  const symptomGroups = useMemo(() => {
    const groups = {};
    SYMPTOMS.forEach((s) => {
      if (!groups[s.cat]) groups[s.cat] = [];
      groups[s.cat].push(s);
    });
    return groups;
  }, []);

  return (
    <div className={styles.booster}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Diagnostic Booster</p>
          <p className={styles.subtitle}>発熱の鑑別思考支援ツール</p>
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
          {rankedDiffs.length === 0 ? (
            <p className={styles.noResult}>
              該当する鑑別候補がありません。症状・所見を追加してください。
            </p>
          ) : (
            <div className={styles.diffList}>
              {rankedDiffs.map((d, idx) => (
                <details key={d.id} className={styles.diffCard} open={idx < 3}>
                  <summary className={styles.diffSummary}>
                    <span className={styles.diffRank}>#{idx + 1}</span>
                    <span className={styles.diffName}>{d.name}</span>
                    <span className={styles.diffCat}>{d.cat}</span>
                    <span className={styles.diffFreq}>{d.freq}</span>
                  </summary>
                  <div className={styles.diffBody}>
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

      {/* フッター */}
      <div className={styles.footer}>
        本ツールは診断思考の補助であり、臨床判断を代替するものではありません。
      </div>
    </div>
  );
}
