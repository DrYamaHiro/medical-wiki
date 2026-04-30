import React, { useState, useMemo, useCallback } from 'react';
import { calcScore } from '../DiagnosticBooster';
import { unionSymptoms, unionFindings, unionRedFlags, mergeDifferentials } from '../DiagnosticBooster/hubMerge';
import styles from '../DiagnosticBooster/styles.module.css';

import * as abdominalPain   from '../DiagnosticBooster/abdominalPainData';
import * as chestPain       from '../DiagnosticBooster/chestPainData';
import * as dizziness       from '../DiagnosticBooster/dizzinessData';
import * as fatigue         from '../DiagnosticBooster/fatigueData';
import * as fever           from '../DiagnosticBooster/feverData';
import * as headache        from '../DiagnosticBooster/headacheData';
import * as lymphadenopathy from '../DiagnosticBooster/lymphadenopathyData';
import * as palpitations    from '../DiagnosticBooster/palpitationsData';
import * as polyarthralgia  from '../DiagnosticBooster/polyarthralgiaData';
import * as rash            from '../DiagnosticBooster/rashData';
import * as syncope         from '../DiagnosticBooster/syncopeData';
import * as weightLoss      from '../DiagnosticBooster/weightLossData';

const BOOSTERS = {
  fever:           { label: '発熱',         data: fever },
  abdominalPain:   { label: '腹痛',         data: abdominalPain },
  chestPain:       { label: '胸痛',         data: chestPain },
  headache:        { label: '頭痛',         data: headache },
  dizziness:       { label: 'めまい',       data: dizziness },
  syncope:         { label: '失神',         data: syncope },
  palpitations:    { label: '動悸',         data: palpitations },
  fatigue:         { label: '倦怠感',       data: fatigue },
  weightLoss:      { label: '体重減少',     data: weightLoss },
  rash:            { label: '皮疹',         data: rash },
  polyarthralgia:  { label: '多関節痛',     data: polyarthralgia },
  lymphadenopathy: { label: 'リンパ節腫脹', data: lymphadenopathy },
};
const MAX_CC = 3;

export default function DiagnosticBoosterHub() {
  const [selectedBoosters, setSelectedBoosters] = useState(() => new Set());
  const [selectedSymptoms, setSelectedSymptoms] = useState(() => new Set());
  const [selectedFindings, setSelectedFindings] = useState(() => new Set());
  const [activeCat, setActiveCat] = useState(null);

  const toggleBooster = useCallback((key) => {
    setSelectedBoosters((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else if (n.size < MAX_CC) n.add(key);
      return n;
    });
  }, []);

  const toggleSym = useCallback((id) => {
    setSelectedSymptoms((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const toggleFind = useCallback((id) => {
    setSelectedFindings((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const selectedKeys = useMemo(() => [...selectedBoosters], [selectedBoosters]);

  const selectedModules = useMemo(() => selectedKeys.map((k) => BOOSTERS[k].data), [selectedKeys]);

  // Phase 1: union SYMPTOMS by id, max-weight merge
  const unionedSymptoms = useMemo(() => unionSymptoms(selectedModules), [selectedModules]);

  const symptomGroups = useMemo(() => {
    const g = {};
    unionedSymptoms.forEach((s) => { (g[s.cat || 'その他'] ||= []).push(s); });
    return g;
  }, [unionedSymptoms]);

  // Phase 2: union FINDINGS by id, merge triggers + max weight
  const unionedFindings = useMemo(() => unionFindings(selectedModules), [selectedModules]);

  const visibleFindings = useMemo(() => {
    if (selectedSymptoms.size === 0) return [];
    return unionedFindings.filter(
      (f) => (f.triggers || []).length === 0 || (f.triggers || []).some((t) => selectedSymptoms.has(t))
    );
  }, [unionedFindings, selectedSymptoms]);

  // Red Flags: dedupe by message+sorted(conditions)
  const allRedFlags = useMemo(() => unionRedFlags(selectedModules), [selectedModules]);
  const activeRedFlags = useMemo(() => {
    const sel = new Set([...selectedSymptoms, ...selectedFindings]);
    const seen = new Set();
    return allRedFlags.filter((rf) => {
      if (!rf.conditions.some((c) => sel.has(c))) return false;
      if (seen.has(rf.message)) return false;
      seen.add(rf.message);
      return true;
    });
  }, [allRedFlags, selectedSymptoms, selectedFindings]);

  const firedConditions = useMemo(() => {
    const sel = new Set([...selectedSymptoms, ...selectedFindings]);
    const fired = new Set();
    activeRedFlags.forEach((rf) => rf.conditions.forEach((c) => sel.has(c) && fired.add(c)));
    return fired;
  }, [activeRedFlags, selectedSymptoms, selectedFindings]);

  // showWhen 条件付き表示判定 (Hub 版)
  const matchesShowWhen = useCallback((d) => {
    if (!d.showWhen || !Array.isArray(d.showWhen.anyOf)) return false;
    const sel = new Set([...selectedSymptoms, ...selectedFindings]);
    return d.showWhen.anyOf.some((c) => sel.has(c));
  }, [selectedSymptoms, selectedFindings]);

  // Phase 3: per-booster scoring (native SYMPTOMS/FINDINGS for weight) → mergeDifferentials
  const rankedDiffs = useMemo(() => {
    const selS = [...selectedSymptoms];
    const selF = [...selectedFindings];
    const hasRF = activeRedFlags.length > 0;
    const rankedByBooster = {};
    selectedKeys.forEach((k) => {
      const { SYMPTOMS, FINDINGS, DIFFERENTIALS } = BOOSTERS[k].data;
      rankedByBooster[k] = (DIFFERENTIALS || []).map((d) => ({
        ...d,
        _score: calcScore(d, selS, selF, hasRF, firedConditions, SYMPTOMS, FINDINGS),
      })).filter((d) => d._score > 0 || matchesShowWhen(d));
    });
    return mergeDifferentials(rankedByBooster);
  }, [selectedKeys, selectedSymptoms, selectedFindings, activeRedFlags, firedConditions, matchesShowWhen]);

  const reset = () => {
    setSelectedBoosters(new Set());
    setSelectedSymptoms(new Set());
    setSelectedFindings(new Set());
    setActiveCat(null);
  };

  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>統合診断ハブ (MVP)</p>
          <p className={styles.subtitle}>複数主訴の統合鑑別 (最大3主訴)</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.resetBtn} onClick={reset}>リセット</button>
        </div>
      </div>

      {/* Active red flag banner (top) */}
      {activeRedFlags.length > 0 && (
        <div className={styles.redFlagBox}>
          {activeRedFlags.map((rf, i) => (
            <div key={i} className={rf.severity === 'critical' ? styles.redFlagCritical : styles.redFlagWarning}>
              {rf.severity === 'critical' ? '⚠️ ' : '⚠ '}
              {rf.message}
            </div>
          ))}
        </div>
      )}

      {/* Phase 0: Chief complaint chips (max 3) */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.phaseBadge}>0</span>
          主訴を選択（最大3つ）
          <span className={styles.sectionHint}>　{selectedBoosters.size}/{MAX_CC} 選択中</span>
        </h4>
        <div className={styles.chipGrid}>
          {Object.entries(BOOSTERS).map(([k, { label }]) => {
            const on = selectedBoosters.has(k);
            const disabled = !on && selectedBoosters.size >= MAX_CC;
            return (
              <button key={k} type="button" disabled={disabled}
                className={`${styles.ccChip} ${on ? styles.ccChipActive : ''}`}
                onClick={() => toggleBooster(k)}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase 1: category-tab + symptoms */}
      {selectedBoosters.size > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.phaseBadge}>1</span>
            随伴症状を選択
          </h4>

          {/* 選択中サマリー (常時表示、カテゴリ切替で消えない) */}
          {selectedSymptoms.size > 0 && (
            <div className={styles.selectedSummary}>
              <div className={styles.selectedSummaryLabel}>
                選択中の症状（{selectedSymptoms.size}件） — クリックで解除
              </div>
              <div className={styles.chipGrid}>
                {[...selectedSymptoms].map((id) => {
                  const s = unionedSymptoms.find((x) => x.id === id);
                  if (!s) return null;
                  return (
                    <button key={id} type="button"
                      className={styles.selectedChip}
                      onClick={() => toggleSym(id)}
                      title="クリックで解除">
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* カテゴリタブ */}
          <div className={styles.catTabBar}>
            {Object.keys(symptomGroups).map((cat) => (
              <button key={cat} type="button"
                className={`${styles.catTab} ${activeCat === cat ? styles.catTabActive : ''}`}
                onClick={() => setActiveCat(activeCat === cat ? null : cat)}>
                {cat}
                <span className={styles.catTabCount}>{symptomGroups[cat].length}</span>
              </button>
            ))}
          </div>

          {/* アクティブカテゴリの症状パネル */}
          {activeCat && symptomGroups[activeCat] ? (
            <div className={styles.itemPanel}>
              <div className={styles.itemPanelHint}>
                {activeCat} カテゴリの症状（複数選択可）
              </div>
              <div className={styles.chipGrid}>
                {symptomGroups[activeCat].map((s) => (
                  <button key={s.id} type="button"
                    className={`${styles.symptomChip} ${selectedSymptoms.has(s.id) ? styles.symptomChipActive : ''}`}
                    onClick={() => toggleSym(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.itemPanel}>
              <p className={styles.itemPanelHint}>
                ↑ 上のタブからカテゴリを選択して症状を追加してください
              </p>
            </div>
          )}
        </div>
      )}

      {/* Phase 2: findings */}
      {selectedSymptoms.size > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.phaseBadge}>2</span>
            身体所見を選択
          </h4>

          {/* 選択中の所見サマリー */}
          {selectedFindings.size > 0 && (
            <div className={styles.selectedSummary}>
              <div className={styles.selectedSummaryLabel}>
                選択中の所見（{selectedFindings.size}件） — クリックで解除
              </div>
              <div className={styles.chipGrid}>
                {[...selectedFindings].map((id) => {
                  const f = unionedFindings.find((x) => x.id === id);
                  if (!f) return null;
                  return (
                    <button key={id} type="button"
                      className={styles.selectedChip}
                      onClick={() => toggleFind(id)}
                      title="クリックで解除">
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.itemPanel} style={{ borderTop: '2px solid #43a047', borderRadius: '8px' }}>
            <div className={styles.itemPanelHint}>選択した症状に関連する所見が表示されています</div>
            <div className={styles.chipGrid}>
              {visibleFindings.map((f) => (
                <button key={f.id} type="button"
                  className={`${styles.symptomChip} ${selectedFindings.has(f.id) ? styles.symptomChipActive : ''}`}
                  onClick={() => toggleFind(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: ranked diffs */}
      {selectedSymptoms.size > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            Phase 3: 統合鑑別 ({rankedDiffs.length}件)
          </h4>
          {rankedDiffs.length === 0 ? (
            <p className={styles.noResult}>該当する鑑別候補がありません。症状・所見を追加してください。</p>
          ) : (
            <div className={styles.diffList}>
              {rankedDiffs.map((d, i) => (
                <details key={d.id} className={styles.diffCard}
                  open={i < 5 || (d.severityWeight ?? 0) >= 4}>
                  <summary className={styles.diffSummary}>
                    <span className={styles.diffRank}>#{i + 1}</span>
                    <span className={styles.diffName}>{d.name}</span>
                    <span className={styles.diffCat}>{d.cat}</span>
                    <span className={styles.diffFreq}>
                      [{(d._sourceBoosters || []).map((b) => BOOSTERS[b]?.label || b).join('+')}]
                    </span>
                  </summary>
                  <div className={styles.diffBody}>
                    {d.resolvedStillDangerous && (
                      <div className={styles.resolvedWarning}>
                        ⚠ 症状が消失していても危険な疾患です。来院時に無症状でも精査を検討してください。
                      </div>
                    )}
                    {(d.severityWeight ?? 0) >= 4 && (
                      <div className={styles.severityContext}>
                        🔸 重篤な疾患の可能性があります。クリニックでの除外が困難な場合に紹介を検討してください。
                      </div>
                    )}
                    <p className={styles.diffComment}>{d.comment}</p>
                    <div className={styles.diffAction}><strong>Next Step:</strong> {d.nextStep}</div>
                    {d.link && <a className={styles.diffLink} href={d.link}>Wiki詳細ページへ</a>}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active red flag banner (bottom — 画面切れ対策) */}
      {activeRedFlags.length > 0 && (
        <div className={styles.redFlagBox}>
          <div className={styles.redFlagFooterLabel}>⚠ Red Flag (画面上部にも表示):</div>
          {activeRedFlags.map((rf, i) => (
            <div key={'b-' + i} className={rf.severity === 'critical' ? styles.redFlagCritical : styles.redFlagWarning}>
              {rf.severity === 'critical' ? '⚠️ ' : '⚠ '}
              {rf.message}
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        本ツールは診断思考の補助であり、臨床判断を代替するものではありません。
      </div>
    </div>
  );
}
