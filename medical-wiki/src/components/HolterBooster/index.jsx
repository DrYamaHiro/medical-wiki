import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import {
  HOLTER_SECTIONS, HOLTER_ASSESSMENT_RULES, buildNormalPreset, PRESET_NOTE, SCENARIO_PRESETS,
  SYMPTOM_MATRIX_SYMPTOMS, SYMPTOM_MATRIX_ARRHYTHMIAS, DAILY_BURDEN_COLUMNS, DAILY_HR_COLUMNS,
  durationToHours, formatDuration, formatDateTimeWithDay, formatDateWithDay, daysBetweenInclusive,
  HOLTER_GROUPS, sectionIdToGroupId, isTraceValue,
} from './holterData.js';

const ABNORMAL_KEYWORDS = ['あり', '相関あり', '発作性', '持続性', 'ショック', '不適切', 'モビッツ', 'Mobitz II', '完全', '高度', '2:1', 'SSS', '疑い', 'torsades', '多形性'];

function isChoiceAbnormal(value) {
  if (!value) return false;
  return ABNORMAL_KEYWORDS.some((k) => value.includes(k));
}

function isNumericOutOfRange(item, value, gender) {
  if (value === undefined || value === '' || value === null) return false;
  const n = parseFloat(value);
  if (!isFinite(n)) return false;
  const nr = item.normalRange;
  if (!nr) return false;
  let range = nr;
  if (nr.byGender) {
    const g = gender === 'female' ? 'female' : 'male';
    range = nr.byGender[g];
    if (!range) return false;
  }
  if (typeof range.min === 'number' && n < range.min) return true;
  if (typeof range.max === 'number' && n > range.max) return true;
  return false;
}

function formatToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// section の初期折りたたみ状態: 全セクションデフォルト折りたたみ
function buildInitialCollapsed() {
  const s = {};
  HOLTER_SECTIONS.forEach((sec) => { s[sec.id] = true; });
  s.symptom_matrix = true;
  s.daily_burden = true;
  return s;
}

// group の初期折りたたみ状態: 全グループデフォルト折りたたみ
function buildInitialGroupCollapsed() {
  const g = {};
  HOLTER_GROUPS.forEach((grp) => { g[grp.id] = true; });
  return g;
}

export default function HolterBooster() {
  const [findings, setFindings] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [collapsed, setCollapsed] = useState(buildInitialCollapsed);
  const [groupCollapsed, setGroupCollapsed] = useState(buildInitialGroupCollapsed);
  const [copied, setCopied] = useState(false);

  // Phase 3: 症状マトリクス state
  const [symptomMatrix, setSymptomMatrix] = useState({});
  // Phase 3: 日次負荷 state (array of row objects)
  const [dailyBurden, setDailyBurden] = useState([]);
  // Phase 9: 日次心拍数 state (array of row objects)
  const [dailyHeartRate, setDailyHeartRate] = useState([]);
  // Phase 3: セクション DOM への ref (スクロール用)
  const sectionRefs = useRef({});
  // Phase 3: 症状マトリクス・日次負荷用の特殊 sectionId (assessment rule 側と一致)
  sectionRefs.current.symptom_matrix = sectionRefs.current.symptom_matrix || { current: null };
  sectionRefs.current.daily_burden = sectionRefs.current.daily_burden || { current: null };

  const toggleMatrixCell = useCallback((symptom, arr) => {
    const key = `${symptom}→${arr}`;
    setSymptomMatrix((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const addDailyRow = useCallback(() => {
    setDailyBurden((prev) => [...prev, {}]);
  }, []);

  const updateDailyRow = useCallback((idx, key, value) => {
    setDailyBurden((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  }, []);

  const removeDailyRow = useCallback((idx) => {
    setDailyBurden((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Phase 9: 日次心拍数テーブル操作
  const addDailyHRRow = useCallback(() => {
    setDailyHeartRate((prev) => [...prev, {}]);
  }, []);
  const updateDailyHRRow = useCallback((idx, key, value) => {
    setDailyHeartRate((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  }, []);
  const removeDailyHRRow = useCallback((idx) => {
    setDailyHeartRate((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    if (!sectionId) return;
    // 対応する親グループを展開
    const gId = sectionIdToGroupId(sectionId);
    if (gId) setGroupCollapsed((prev) => ({ ...prev, [gId]: false }));
    // 対応セクションを展開
    setCollapsed((prev) => ({ ...prev, [sectionId]: false }));
    // 次フレームでスクロール
    setTimeout(() => {
      const el = document.getElementById(`holter-section-${sectionId}`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }, []);

  const setField = useCallback((id, value) => {
    setFindings((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleMultiChoice = useCallback((id, opt) => {
    setFindings((prev) => {
      const cur = Array.isArray(prev[id]) ? prev[id] : [];
      const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
      return { ...prev, [id]: next };
    });
  }, []);

  const toggleSection = useCallback((secId) => {
    setCollapsed((prev) => ({ ...prev, [secId]: !prev[secId] }));
  }, []);

  const toggleGroup = useCallback((gId) => {
    setGroupCollapsed((prev) => ({ ...prev, [gId]: !prev[gId] }));
  }, []);

  const collapseAll = useCallback(() => {
    setGroupCollapsed(buildInitialGroupCollapsed());
    setCollapsed(buildInitialCollapsed());
  }, []);

  const expandAll = useCallback(() => {
    setGroupCollapsed({});
    setCollapsed({});
  }, []);

  const applyNormalPreset = useCallback(() => {
    if (!window.confirm('「洞調律・有意所見なし」プリセットを適用します。\n全ての選択項目 (陽性所見・AF/AVB/心室調律/ST変動 等) を「なし」相当に上書きし、全般所見に注記が追記されます。\nよろしいですか？')) return;
    const preset = buildNormalPreset();
    setFindings((prev) => ({ ...prev, ...preset }));
    setOverallComment((prev) => {
      if (prev.includes(PRESET_NOTE)) return prev;
      return prev ? `${prev}\n${PRESET_NOTE}` : PRESET_NOTE;
    });
  }, []);

  const applyScenarioPreset = useCallback((scenario) => {
    if (!window.confirm(`「${scenario.label}」プリセットを適用します。\n${scenario.description}\n\n全ての選択項目を上書きし、全般所見に注記が追記されます。よろしいですか？`)) return;
    const preset = scenario.apply();
    setFindings((prev) => ({ ...prev, ...preset }));
    setOverallComment((prev) => {
      if (prev.includes(scenario.note)) return prev;
      return prev ? `${prev}\n${scenario.note}` : scenario.note;
    });
  }, []);

  // Phase 8: 5b「ペースメーカーなし」選択 → find_pm_failure を自動で「該当なし」に反映
  useEffect(() => {
    const pacing = findings.pacing_present;
    if (pacing === 'ペースメーカーなし (該当なし)' && findings.find_pm_failure !== '該当なし (デバイスなし)') {
      setFindings((prev) => ({ ...prev, find_pm_failure: '該当なし (デバイスなし)' }));
    }
    // PM あり選択に切り替わり かつ既存が「該当なし」なら空にして再選択を促す
    if (pacing === 'あり (下記に拍動数)' && findings.find_pm_failure === '該当なし (デバイスなし)') {
      setFindings((prev) => ({ ...prev, find_pm_failure: '' }));
    }
  }, [findings.pacing_present, findings.find_pm_failure]);

  // Phase 8: sub_header の「全てなし」ボタン — 該当 sub_group 内の choice item を「なし」に一括設定
  const applyAllNoneFromHeader = useCallback((section, headerIdx) => {
    // 該当 sub_header 以降、次の sub_header または末尾までの choice item を対象
    const targets = [];
    for (let i = headerIdx + 1; i < section.items.length; i++) {
      const it = section.items[i];
      if (it.type === 'sub_header') break;
      if (it.type !== 'choice') continue;
      // 特殊: find_pm_failure は「該当なし (デバイスなし)」
      if (it.id === 'find_pm_failure') targets.push([it.id, '該当なし (デバイスなし)']);
      else if (it.options && it.options.includes('なし')) targets.push([it.id, 'なし']);
    }
    if (targets.length === 0) return;
    if (!window.confirm(`この区分の ${targets.length} 項目を「なし」に一括設定します。既存の選択は上書きされます。よろしいですか？`)) return;
    setFindings((prev) => {
      const next = { ...prev };
      targets.forEach(([id, val]) => { next[id] = val; });
      return next;
    });
  }, []);

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setFindings({});
    setOverallComment('');
    setCollapsed(buildInitialCollapsed());
    setGroupCollapsed(buildInitialGroupCollapsed());
    setSymptomMatrix({});
    setDailyBurden([]);
    setDailyHeartRate([]);
  };

  const gender = findings.sex === '女性' ? 'female' : 'male';

  // assessment rule に渡す拡張 findings (matrix・daily_burden + duration/日数から数値派生)
  const enrichedFindings = useMemo(() => {
    // 解析時間の時分秒 → 総時間 (小数) を rule 互換のため analyze_hours にセット
    const analyzeHours = durationToHours(findings.analyze_duration);
    // 記録期間 (日数) を record_days_num として算出 (両端含む)
    const recDays = daysBetweenInclusive(findings.record_start_date, findings.record_end_date);
    return {
      ...findings,
      analyze_hours: analyzeHours > 0 ? analyzeHours : undefined,
      record_days_num: recDays,
      symptom_matrix: symptomMatrix,
      daily_burden: dailyBurden,
    };
  }, [findings, symptomMatrix, dailyBurden]);

  // 出力テキスト生成
  const output = useMemo(() => {
    const reportDate = findings.report_date || formatToday();
    const startDate = findings.record_start_date;
    const lines = [`【ホルター心電図所見 (ePatch 準拠)】 レポート日 ${reportDate}`];
    // 記録期間の総日数を計算し先頭近くに提示
    const recDays = daysBetweenInclusive(findings.record_start_date, findings.record_end_date);
    HOLTER_SECTIONS.forEach((section) => {
      // sectionGate: gate が「なし」等なら gate item のみ出力
      const gate = section.sectionGate;
      const gateVal = gate ? findings[gate.itemId] : undefined;
      const isGatedAbsent = gate && gate.absentValues.includes(gateVal);
      const entries = section.items
        .filter((it) => it.type !== 'sub_header' && it.type !== 'linked_display')
        .map((it) => {
          if (isGatedAbsent && it.id !== gate.itemId) return null; // gate 以外は出力しない
          const v = findings[it.id];
          const hasValueForObj = it.type === 'duration' && v && typeof v === 'object' && (v.d || v.h || v.m || v.s);
          const hasValueForArr = Array.isArray(v) && v.length > 0;
          const hasValueForPrim = !Array.isArray(v) && (typeof v !== 'object' || v === null) && (v !== undefined && v !== '' && v !== null);
          if (!hasValueForObj && !hasValueForArr && !hasValueForPrim) return null;
          if (it.type === 'numeric') return `${it.label} ${v}${it.unit || ''}`; // trace ("<0.01") もそのまま連結
          if (it.type === 'multichoice') return `${it.label}: ${v.join(' / ')}`;
          if (it.type === 'date') return `${it.label}: ${formatDateWithDay(v, startDate)}`;
          if (it.type === 'datetime') return `${it.label}: ${formatDateTimeWithDay(v, startDate)}`;
          if (it.type === 'duration') return `${it.label}: ${formatDuration(v)}`;
          if (it.type === 'time') return `${it.label}: ${v}`;
          return `${it.label}: ${v}`;
        })
        .filter(Boolean);
      // レポートサマリーの記録期間の合計日数を追記
      if (section.id === 'report_summary' && recDays && entries.length > 0) {
        entries.push(`(記録期間: 合計 ${recDays} 日間)`);
      }
      if (entries.length > 0) {
        lines.push('');
        lines.push(`■ ${section.title}`);
        entries.forEach((e) => lines.push(`  ・${e}`));
      }
    });
    // 症状 × 不整脈 マトリクス出力
    const matrixEntries = Object.entries(symptomMatrix).filter(([, v]) => v).map(([k]) => k);
    if (matrixEntries.length > 0) {
      lines.push('');
      lines.push('■ 症状 × 不整脈 クロス集計');
      matrixEntries.forEach((k) => lines.push(`  ・${k}`));
    }
    // 日次負荷サマリー出力
    const isValueSet = (v) => {
      if (v === undefined || v === '' || v === null) return false;
      if (typeof v === 'object' && !Array.isArray(v)) return !!(v.d || v.h || v.m || v.s);
      return true;
    };
    const validDaily = dailyBurden.filter((r) => Object.values(r).some(isValueSet));
    if (validDaily.length > 0) {
      lines.push('');
      lines.push('■ 日次負荷サマリー');
      validDaily.forEach((r) => {
        const parts = DAILY_BURDEN_COLUMNS
          .filter((c) => isValueSet(r[c.key]))
          .map((c) => {
            const v = r[c.key];
            if (c.type === 'date') return `${c.label} ${formatDateWithDay(v, startDate)}`;
            if (c.type === 'datetime') return `${c.label} ${formatDateTimeWithDay(v, startDate)}`;
            if (c.type === 'duration') return `${c.label} ${formatDuration(v)}`;
            return `${c.label} ${v}`;
          });
        if (parts.length > 0) lines.push(`  ・${parts.join(' / ')}`);
      });
    }
    // 日次心拍数出力
    const validDailyHR = dailyHeartRate.filter((r) => Object.values(r).some(isValueSet));
    if (validDailyHR.length > 0) {
      lines.push('');
      lines.push('■ 日次心拍数');
      validDailyHR.forEach((r) => {
        const parts = DAILY_HR_COLUMNS
          .filter((c) => isValueSet(r[c.key]))
          .map((c) => {
            const v = r[c.key];
            if (c.type === 'date') return `${c.label} ${formatDateWithDay(v, startDate)}`;
            if (c.type === 'duration') return `${c.label} ${formatDuration(v)}`;
            return `${c.label} ${v}`;
          });
        if (parts.length > 0) lines.push(`  ・${parts.join(' / ')}`);
      });
    }
    const trimmed = overallComment.trim();
    if (trimmed) {
      lines.push('');
      lines.push('■ 全般所見・総合コメント');
      lines.push(`  ${trimmed}`);
    }
    return lines.join('\n');
  }, [findings, overallComment, symptomMatrix, dailyBurden, dailyHeartRate]);

  // アセスメント自動生成 (level 別にグルーピング、sectionId 付き)
  const assessmentGroups = useMemo(() => {
    const groups = { emergency: [], workup: [], reference: [] };
    HOLTER_ASSESSMENT_RULES.forEach((rule) => {
      try {
        if (rule.when(enrichedFindings)) {
          const lv = rule.level || 'reference';
          if (groups[lv]) groups[lv].push({ text: rule.text, sectionId: rule.sectionId });
        }
      } catch { /* skip */ }
    });
    return groups;
  }, [enrichedFindings]);

  const totalAssessCount = assessmentGroups.emergency.length + assessmentGroups.workup.length + assessmentGroups.reference.length;

  const fullOutput = useMemo(() => {
    if (totalAssessCount === 0) return output;
    const parts = [output, ''];
    if (assessmentGroups.emergency.length > 0) {
      parts.push('■ 【緊急】診断補助');
      assessmentGroups.emergency.forEach((a) => parts.push(`  ・${a.text}`));
    }
    if (assessmentGroups.workup.length > 0) {
      if (assessmentGroups.emergency.length > 0) parts.push('');
      parts.push('■ 【要精査】診断補助');
      assessmentGroups.workup.forEach((a) => parts.push(`  ・${a.text}`));
    }
    if (assessmentGroups.reference.length > 0) {
      if (assessmentGroups.emergency.length > 0 || assessmentGroups.workup.length > 0) parts.push('');
      parts.push('■ 【参考】診断補助');
      assessmentGroups.reference.forEach((a) => parts.push(`  ・${a.text}`));
    }
    return parts.join('\n');
  }, [output, assessmentGroups, totalAssessCount]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(fullOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert('クリップボードへのコピーに失敗しました。テキストを手動で選択してコピーしてください。');
    }
  };

  return (
    <div className={styles.booster}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Holter Booster</p>
          <p className={styles.subtitle}>Philips ePatch レポート順にサクサク入力 → 【緊急/要精査/参考】3段階の診断補助を自動生成</p>
        </div>
        <div className={styles.headerRight}>
          {(Object.keys(findings).length > 0 || overallComment) && (
            <button className={styles.resetBtn} onClick={reset} type="button">クリア</button>
          )}
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionToolbar}>
          <div className={styles.presetGroup}>
            <span className={styles.presetGroupLabel}>プリセット:</span>
            <button
              type="button"
              className={`${styles.toolbarBtn} ${styles.presetBtn}`}
              onClick={applyNormalPreset}
              title="ePatch 陽性所見リストと ST/AF/AVB/心室調律 を全て「なし」に一括設定します。数値項目は変更されません。個別項目の実測値は手動で入力してください。"
            >
              洞調律・有意所見なし（要確認）
            </button>
            {SCENARIO_PRESETS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.toolbarBtn} ${styles.scenarioBtn}`}
                onClick={() => applyScenarioPreset(s)}
                title={s.description}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className={styles.expandGroup}>
            <button type="button" className={styles.toolbarBtn} onClick={expandAll}>全て開く</button>
            <button type="button" className={styles.toolbarBtn} onClick={collapseAll}>全て閉じる</button>
          </div>
        </div>

        {/* 緊急ボックス (assessment に emergency あれば上部に表示) */}
        {assessmentGroups.emergency.length > 0 && (
          <div className={styles.emergencyBox}>
            <div className={styles.emergencyHeader}>【緊急】 診断補助 ({assessmentGroups.emergency.length} 件) — ePatch メール連絡項目相当</div>
            {assessmentGroups.emergency.map((a, i) => (
              <p key={i} className={styles.emergencyItem}>
                {a.text}
                {a.sectionId && (
                  <button
                    type="button"
                    className={styles.scrollBtn}
                    onClick={() => scrollToSection(a.sectionId)}
                    title="対応セクションへ移動"
                  >対応欄へ ▸</button>
                )}
              </p>
            ))}
          </div>
        )}

        {HOLTER_GROUPS.map((group) => {
          const isGroupCollapsed = !!groupCollapsed[group.id];
          // 表示順は HOLTER_GROUPS.sectionIds の並びを厳守 (ファイル順ではない)
          const groupSections = group.sectionIds
            .map((id) => HOLTER_SECTIONS.find((s) => s.id === id))
            .filter(Boolean);
          // グループ全体の入力済み件数
          let groupInputCount = 0;
          groupSections.forEach((sec) => {
            if (sec.id === 'symptom_matrix') groupInputCount += Object.values(symptomMatrix).filter(Boolean).length;
            else if (sec.id === 'daily_burden') groupInputCount += dailyBurden.length;
            else groupInputCount += sec.items.filter((it) => {
              if (it.type === 'sub_header' || it.type === 'linked_display') return false;
              const v = findings[it.id];
              if (Array.isArray(v)) return v.length > 0;
              if (v && typeof v === 'object') return !!(v.d || v.h || v.m || v.s);
              return v !== undefined && v !== '' && v !== null;
            }).length;
          });
          return (
            <div key={group.id} className={styles.groupCard}>
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={!isGroupCollapsed}
              >
                <span className={styles.groupToggle}>{isGroupCollapsed ? '▸' : '▾'}</span>
                <span className={styles.groupName}>{group.title}</span>
                {groupInputCount > 0 && (
                  <span className={styles.groupBadge}>合計 {groupInputCount} 件入力</span>
                )}
              </button>
              {group.subtitle && !isGroupCollapsed && (
                <div className={styles.groupSubtitle}>{group.subtitle}</div>
              )}
              {!isGroupCollapsed && (
                <div className={styles.groupBody}>
                  {groupSections.map((section) => {
          const isCollapsed = !!collapsed[section.id];
          // 特殊セクション: 症状マトリクス / 日次負荷 / 日次心拍数 の入力済カウント
          let inputCount;
          if (section.id === 'symptom_matrix') {
            inputCount = Object.values(symptomMatrix).filter(Boolean).length;
          } else if (section.id === 'daily_burden') {
            inputCount = dailyBurden.length;
          } else if (section.id === 'daily_heart_rate') {
            inputCount = dailyHeartRate.length;
          } else {
            inputCount = section.items.filter((it) => {
              if (it.type === 'sub_header' || it.type === 'linked_display') return false;
              const v = findings[it.id];
              if (Array.isArray(v)) return v.length > 0;
              if (v && typeof v === 'object') return !!(v.d || v.h || v.m || v.s); // duration 型
              return v !== undefined && v !== '' && v !== null;
            }).length;
          }
          const badgeLabel = section.id === 'symptom_matrix' ? `${inputCount} 件対応`
            : (section.id === 'daily_burden' || section.id === 'daily_heart_rate') ? `${inputCount} 日入力済`
            : `${inputCount} 件入力済`;
          return (
            <div key={section.id} id={`holter-section-${section.id}`} className={styles.organCard}>
              <button
                type="button"
                className={styles.organHeader}
                onClick={() => toggleSection(section.id)}
                aria-expanded={!isCollapsed}
              >
                <span className={styles.organToggle}>{isCollapsed ? '▸' : '▾'}</span>
                <span className={styles.organName}>{section.title}</span>
                {inputCount > 0 && (
                  <span className={styles.organBadge}>{badgeLabel}</span>
                )}
              </button>
              {!isCollapsed && section.id === 'symptom_matrix' && (
                <div className={styles.organBody}>
                  <p className={styles.matrixHint}>ePatch p.12「患者症状 vs 不整脈相関」の要旨。症状ごとに紐付いた不整脈をクリックしてください。</p>
                  <div className={styles.matrixWrapper}>
                    <table className={styles.matrix}>
                      <thead>
                        <tr>
                          <th className={styles.matrixCorner}>症状 \ 不整脈</th>
                          {SYMPTOM_MATRIX_ARRHYTHMIAS.map((a) => (
                            <th key={a} className={styles.matrixColHead}>{a}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SYMPTOM_MATRIX_SYMPTOMS.map((s) => (
                          <tr key={s}>
                            <th className={styles.matrixRowHead}>{s}</th>
                            {SYMPTOM_MATRIX_ARRHYTHMIAS.map((a) => {
                              const key = `${s}→${a}`;
                              const active = !!symptomMatrix[key];
                              return (
                                <td key={a} className={styles.matrixCell}>
                                  <button
                                    type="button"
                                    className={`${styles.matrixBtn} ${active ? styles.matrixBtnActive : ''}`}
                                    onClick={() => toggleMatrixCell(s, a)}
                                    aria-pressed={active}
                                  >
                                    {active ? '●' : ''}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {!isCollapsed && (section.id === 'daily_burden' || section.id === 'daily_heart_rate') && (() => {
                const isBurden = section.id === 'daily_burden';
                const cols = isBurden ? DAILY_BURDEN_COLUMNS : DAILY_HR_COLUMNS;
                const rows = isBurden ? dailyBurden : dailyHeartRate;
                const updateRow = isBurden ? updateDailyRow : updateDailyHRRow;
                const removeRow = isBurden ? removeDailyRow : removeDailyHRRow;
                const addRow = isBurden ? addDailyRow : addDailyHRRow;
                const hint = isBurden
                  ? 'ePatch p.9「日次負荷サマリー」— 日ごとの割合と拍動数/エピソード数を入力。<0.01% はチップで指定可。'
                  : 'ePatch「日次心拍数」— 日ごとの総心拍数・最大/最小/平均 HR・解析可能時間を入力。';
                return (
                <div className={styles.organBody}>
                  <p className={styles.matrixHint}>{hint}</p>
                  <div className={styles.dailyTableWrapper}>
                    <table className={styles.dailyTable}>
                      <thead>
                        <tr>
                          {cols.map((c) => (<th key={c.key} style={{ minWidth: c.width }}>{c.label}</th>))}
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 && (
                          <tr>
                            <td colSpan={cols.length + 1} className={styles.dailyEmpty}>「+ 日を追加」で日次データを入力できます (任意入力)。</td>
                          </tr>
                        )}
                        {rows.map((row, idx) => (
                          <tr key={idx}>
                            {cols.map((c) => (
                              <td key={c.key}>
                                {c.type === 'date' && (
                                  <input type="date" className={styles.dailyInput} value={row[c.key] || ''} onChange={(e) => updateRow(idx, c.key, e.target.value)} />
                                )}
                                {c.type === 'datetime' && (
                                  <input type="datetime-local" step="1" className={styles.dailyInput} value={row[c.key] || ''} onChange={(e) => updateRow(idx, c.key, e.target.value)} />
                                )}
                                {c.type === 'duration' && (() => {
                                  const d = (row[c.key] && typeof row[c.key] === 'object') ? row[c.key] : { d: '', h: '', m: '', s: '' };
                                  const upd = (k, val) => updateRow(idx, c.key, { ...d, [k]: val });
                                  return (
                                    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <input type="number" min="0" step="1" className={styles.dailyInput} style={{ width: '48px' }} value={d.d || ''} onChange={(e) => upd('d', e.target.value)} placeholder="日" />
                                      <span style={{ fontSize: '0.7rem' }}>日</span>
                                      <input type="number" min="0" max="23" step="1" className={styles.dailyInput} style={{ width: '48px' }} value={d.h || ''} onChange={(e) => upd('h', e.target.value)} placeholder="時" />
                                      <span style={{ fontSize: '0.7rem' }}>時</span>
                                      <input type="number" min="0" max="59" step="1" className={styles.dailyInput} style={{ width: '48px' }} value={d.m || ''} onChange={(e) => upd('m', e.target.value)} placeholder="分" />
                                      <span style={{ fontSize: '0.7rem' }}>分</span>
                                      <input type="number" min="0" max="59" step="1" className={styles.dailyInput} style={{ width: '48px' }} value={d.s || ''} onChange={(e) => upd('s', e.target.value)} placeholder="秒" />
                                      <span style={{ fontSize: '0.7rem' }}>秒</span>
                                    </span>
                                  );
                                })()}
                                {c.type === 'numeric' && (() => {
                                  const cellVal = row[c.key];
                                  const cellTrace = isTraceValue(cellVal);
                                  return (
                                    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <input
                                        type="number"
                                        step="any"
                                        className={styles.dailyInput}
                                        style={{ width: c.allowsTrace ? '55px' : '', ...(cellTrace ? { background: '#eceff1', color: '#90a4ae' } : {}) }}
                                        value={cellTrace ? '' : (cellVal || '')}
                                        onChange={(e) => updateRow(idx, c.key, e.target.value)}
                                        placeholder={c.placeholder}
                                        disabled={cellTrace}
                                      />
                                      {c.allowsTrace && (
                                        <button
                                          type="button"
                                          className={`${styles.traceChip} ${cellTrace ? styles.traceChipActive : ''}`}
                                          style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', margin: 0 }}
                                          onClick={() => updateRow(idx, c.key, cellTrace ? '' : '<0.01')}
                                          title="ePatch レポートで <0.01% と表記されている場合に使用"
                                        >{cellTrace ? '<0.01 ✓' : '<0.01'}</button>
                                      )}
                                    </span>
                                  );
                                })()}
                                {c.type === 'text' && (
                                  <input type="text" className={styles.dailyInput} value={row[c.key] || ''} onChange={(e) => updateRow(idx, c.key, e.target.value)} placeholder={c.placeholder} />
                                )}
                              </td>
                            ))}
                            <td>
                              <button type="button" className={styles.dailyRemoveBtn} onClick={() => removeRow(idx)} title="この行を削除">×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className={styles.dailyAddBtn} onClick={addRow}>+ 日を追加</button>
                </div>
                );
              })()}
              {!isCollapsed && section.id !== 'symptom_matrix' && section.id !== 'daily_burden' && section.id !== 'daily_heart_rate' && (
                <div className={styles.organBody}>
                  {section.items.map((item, itemIdx) => {
                    // sub_header 型 は視覚区切りとして描画 (入力欄なし、任意で「全てなし」ボタン付き)
                    if (item.type === 'sub_header') {
                      return (
                        <div key={item.id} className={styles.subHeader}>
                          <span>{item.label}</span>
                          {item.allNoneButton && (
                            <button
                              type="button"
                              className={styles.subHeaderBtn}
                              onClick={() => applyAllNoneFromHeader(section, itemIdx)}
                              title="この区分の項目を全て「なし」に一括設定"
                            >この区分を全てなし</button>
                          )}
                        </div>
                      );
                    }
                    // sectionGate: gate が「なし」等の absentValues に一致していて、
                    // かつこの item が gate item 自体でなければ disabled 化
                    let isGatedOff = false;
                    if (section.sectionGate) {
                      const gateVal = findings[section.sectionGate.itemId];
                      if (section.sectionGate.absentValues.includes(gateVal) && item.id !== section.sectionGate.itemId) {
                        isGatedOff = true;
                      }
                    }
                    return (
                    <div key={item.id} className={`${styles.itemRow} ${item.emergency ? styles.itemRowEmergency : ''} ${isGatedOff ? styles.itemRowGatedOff : ''}`}>
                      <div className={styles.itemLabel}>
                        <span>
                          {item.label}
                          {item.emergency && <span className={styles.emergencyTag}>緊急</span>}
                          {isGatedOff && <span className={styles.gatedTag}>入力不要</span>}
                        </span>
                        {(item.hint || item.normalRange?.note) && (
                          <span className={styles.itemHint}>{item.hint || item.normalRange.note}</span>
                        )}
                      </div>
                      <div className={styles.itemValueWrap}>
                        <div className={styles.itemValue}>
                          {item.type === 'choice' && item.options.map((opt) => {
                            const active = findings[item.id] === opt;
                            const abnormal = isChoiceAbnormal(opt);
                            const cls = [styles.choiceChip];
                            if (abnormal) cls.push(styles.choiceChipAbnormal);
                            if (active) cls.push(abnormal ? styles.choiceChipAbnormalActive : styles.choiceChipActive);
                            return (
                              <button
                                key={opt}
                                type="button"
                                className={cls.join(' ')}
                                onClick={() => setField(item.id, active ? '' : opt)}
                                disabled={isGatedOff}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          {item.type === 'multichoice' && item.options.map((opt) => {
                            const cur = Array.isArray(findings[item.id]) ? findings[item.id] : [];
                            const active = cur.includes(opt);
                            const abnormal = isChoiceAbnormal(opt);
                            const cls = [styles.choiceChip];
                            if (abnormal) cls.push(styles.choiceChipAbnormal);
                            if (active) cls.push(abnormal ? styles.choiceChipAbnormalActive : styles.choiceChipActive);
                            return (
                              <button
                                key={opt}
                                type="button"
                                className={cls.join(' ')}
                                onClick={() => toggleMultiChoice(item.id, opt)}
                                disabled={isGatedOff}
                              >
                                {opt}
                              </button>
                            );
                          })}
                          {item.type === 'numeric' && (() => {
                            const v = findings[item.id];
                            const isTrace = isTraceValue(v);
                            return (
                              <>
                                <input
                                  type="number"
                                  step="any"
                                  className={`${styles.numInput} ${isNumericOutOfRange(item, v, gender) ? styles.numInputAbnormal : ''}`}
                                  value={isTrace ? '' : (v || '')}
                                  onChange={(e) => setField(item.id, e.target.value)}
                                  placeholder={item.placeholder}
                                  title={item.normalRange?.note || ''}
                                  disabled={isTrace || isGatedOff}
                                  style={(isTrace || isGatedOff) ? { background: '#eceff1', color: '#90a4ae' } : {}}
                                />
                                {item.unit && <span className={styles.unit}>{item.unit}</span>}
                                {item.allowsTrace && (
                                  <button
                                    type="button"
                                    className={`${styles.traceChip} ${isTrace ? styles.traceChipActive : ''}`}
                                    onClick={() => setField(item.id, isTrace ? '' : '<0.01')}
                                    title="ePatch レポートで <0.01% と表記されている場合に使用"
                                    disabled={isGatedOff}
                                  >
                                    {isTrace ? '<0.01% ✓' : '<0.01%'}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                          {item.type === 'text' && (
                            <input
                              type="text"
                              className={styles.textInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              placeholder={item.placeholder}
                              disabled={isGatedOff}
                            />
                          )}
                          {item.type === 'date' && (
                            <input
                              type="date"
                              className={styles.dateInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              disabled={isGatedOff}
                            />
                          )}
                          {item.type === 'datetime' && (
                            <input
                              type="datetime-local"
                              step="1"
                              className={styles.dateInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              disabled={isGatedOff}
                            />
                          )}
                          {item.type === 'time' && (
                            <input
                              type="time"
                              step="1"
                              className={styles.dateInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              disabled={isGatedOff}
                            />
                          )}
                          {item.type === 'linked_display' && (() => {
                            const v = findings[item.sourceId];
                            const hasV = v !== undefined && v !== '' && v !== null;
                            return (
                              <span className={styles.linkedDisplay}>
                                {hasV ? (
                                  <strong>{v}{item.unit || ''}</strong>
                                ) : (
                                  <span className={styles.linkedDisplayEmpty}>未入力</span>
                                )}
                                {item.sourceSectionId && (
                                  <button
                                    type="button"
                                    className={styles.scrollBtn}
                                    onClick={() => scrollToSection(item.sourceSectionId)}
                                    title="入力元セクションへ移動"
                                  >入力欄へ ▸</button>
                                )}
                              </span>
                            );
                          })()}
                          {item.type === 'duration' && (() => {
                            const d = (findings[item.id] && typeof findings[item.id] === 'object') ? findings[item.id] : { d: '', h: '', m: '', s: '' };
                            const upd = (k, val) => setField(item.id, { ...d, [k]: val });
                            return (
                              <>
                                <input type="number" min="0" step="1" className={styles.numInput} style={{ width: '60px' }} value={d.d || ''} onChange={(e) => upd('d', e.target.value)} placeholder="日" disabled={isGatedOff} />
                                <span className={styles.unit}>日</span>
                                <input type="number" min="0" max="23" step="1" className={styles.numInput} style={{ width: '60px' }} value={d.h || ''} onChange={(e) => upd('h', e.target.value)} placeholder="時" disabled={isGatedOff} />
                                <span className={styles.unit}>時間</span>
                                <input type="number" min="0" max="59" step="1" className={styles.numInput} style={{ width: '60px' }} value={d.m || ''} onChange={(e) => upd('m', e.target.value)} placeholder="分" disabled={isGatedOff} />
                                <span className={styles.unit}>分</span>
                                <input type="number" min="0" max="59" step="1" className={styles.numInput} style={{ width: '60px' }} value={d.s || ''} onChange={(e) => upd('s', e.target.value)} placeholder="秒" disabled={isGatedOff} />
                                <span className={styles.unit}>秒</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className={styles.overallCommentBlock}>
          <label className={styles.overallCommentLabel}>【全般所見・総合コメント】（記録全体・年齢・基礎疾患・薬剤・今後の方針など自由記載）</label>
          <textarea
            className={styles.overallCommentArea}
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="例: 65歳男性、動悸・失神精査。全体を通じて洞調律主体、症状時のイベント記録なし。次回 6ヶ月後再検予定。"
            rows={3}
          />
        </div>
      </div>

      <div className={styles.outputSection}>
        <h4 className={styles.outputTitle}>コピペ用所見 + 診断補助</h4>
        <div className={styles.outputControls}>
          <span style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>
            レポート日: <strong>{findings.report_date || formatToday()}</strong> (レポートサマリー欄で変更可)
          </span>
          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={copyOutput}
            disabled={!fullOutput}
          >
            {copied ? 'コピーしました' : '全文コピー'}
          </button>
          {totalAssessCount > 0 && (
            <span className={styles.assessBadgeGroup}>
              {assessmentGroups.emergency.length > 0 && <span className={`${styles.assessBadge} ${styles.badgeEmergency}`}>緊急 {assessmentGroups.emergency.length}</span>}
              {assessmentGroups.workup.length > 0 && <span className={`${styles.assessBadge} ${styles.badgeWorkup}`}>要精査 {assessmentGroups.workup.length}</span>}
              {assessmentGroups.reference.length > 0 && <span className={`${styles.assessBadge} ${styles.badgeReference}`}>参考 {assessmentGroups.reference.length}</span>}
            </span>
          )}
        </div>
        <pre className={styles.outputBox}>{fullOutput || '(まだ入力がありません)'}</pre>
        {totalAssessCount > 0 && (
          <div className={styles.assessmentPanels}>
            {assessmentGroups.emergency.length > 0 && (
              <div className={`${styles.assessmentPanel} ${styles.panelEmergency}`}>
                <p className={styles.assessmentTitle}>【緊急】 ({assessmentGroups.emergency.length})</p>
                {assessmentGroups.emergency.map((a, i) => (
                  <p key={i} className={styles.assessmentItem}>
                    {a.text}
                    {a.sectionId && (<button type="button" className={styles.scrollBtn} onClick={() => scrollToSection(a.sectionId)}>対応欄へ ▸</button>)}
                  </p>
                ))}
              </div>
            )}
            {assessmentGroups.workup.length > 0 && (
              <div className={`${styles.assessmentPanel} ${styles.panelWorkup}`}>
                <p className={styles.assessmentTitle}>【要精査】 ({assessmentGroups.workup.length})</p>
                {assessmentGroups.workup.map((a, i) => (
                  <p key={i} className={styles.assessmentItem}>
                    {a.text}
                    {a.sectionId && (<button type="button" className={styles.scrollBtn} onClick={() => scrollToSection(a.sectionId)}>対応欄へ ▸</button>)}
                  </p>
                ))}
              </div>
            )}
            {assessmentGroups.reference.length > 0 && (
              <div className={`${styles.assessmentPanel} ${styles.panelReference}`}>
                <p className={styles.assessmentTitle}>【参考】 ({assessmentGroups.reference.length})</p>
                {assessmentGroups.reference.map((a, i) => (
                  <p key={i} className={styles.assessmentItem}>
                    {a.text}
                    {a.sectionId && (<button type="button" className={styles.scrollBtn} onClick={() => scrollToSection(a.sectionId)}>対応欄へ ▸</button>)}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.note}>
        <strong>使い方:</strong> Philips ePatch レポートを開き、上から順にサマリー→異所性→エピソード→陽性所見チェック→ST→CVHRI→HRV→QT→PM の順で該当項目を入力してください。<br />
        <strong>「洞調律・有意所見なし（要確認）」プリセット:</strong> 陽性所見15項目 + 詳細17項目 + AF/AVB/心室調律/ST変動 を一括で「なし」にセットします。数値項目 (CVHRI・SDNN・QTc等) は変更しません。押した後は個別項目を必ず実レポートと照合してください。<br />
        <strong>診断補助 3段階:</strong> 【緊急】ePatch メール連絡項目相当、循環器コンサルト即時対象。【要精査】追加評価・治療介入検討。【参考】臨床背景として意識。<br />
        <strong>CVHRI ≥15:</strong> ePatch が明示的に閉塞性睡眠時無呼吸 (OSA) 疑い → 睡眠簡易検査早期実施を推奨する指標です。STOP-BANG との併用も検討してください。<br />
        <strong>注:</strong> 本ツールは判読サポート、最終診断は臨床医の判断で行ってください。
      </div>
    </div>
  );
}
