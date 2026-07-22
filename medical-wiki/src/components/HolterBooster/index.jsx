import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { HOLTER_SECTIONS, HOLTER_ASSESSMENT_RULES, buildNormalPreset, PRESET_NOTE, SCENARIO_PRESETS } from './holterData.js';

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

// section の初期折りたたみ状態を build
function buildInitialCollapsed() {
  const s = {};
  HOLTER_SECTIONS.forEach((sec) => {
    if (sec.defaultCollapsed) s[sec.id] = true;
  });
  return s;
}

export default function HolterBooster() {
  const [findings, setFindings] = useState({});
  const [comments, setComments] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [collapsed, setCollapsed] = useState(buildInitialCollapsed);
  const [examDate, setExamDate] = useState(formatToday);
  const [copied, setCopied] = useState(false);

  const setField = useCallback((id, value) => {
    setFindings((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setComment = useCallback((id, value) => {
    setComments((prev) => ({ ...prev, [id]: value }));
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

  const collapseAll = useCallback(() => {
    const next = {};
    HOLTER_SECTIONS.forEach((s) => { next[s.id] = true; });
    setCollapsed(next);
  }, []);

  const expandAll = useCallback(() => setCollapsed({}), []);

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

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setFindings({});
    setComments({});
    setOverallComment('');
    setCollapsed(buildInitialCollapsed());
  };

  const gender = findings.sex === '女性' ? 'female' : 'male';

  // 出力テキスト生成
  const output = useMemo(() => {
    const lines = [`【ホルター心電図所見 (ePatch 準拠)】 ${examDate}`];
    HOLTER_SECTIONS.forEach((section) => {
      const entries = section.items
        .map((it) => {
          const v = findings[it.id];
          const c = (comments[it.id] || '').trim();
          const hasValue = Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== '' && v !== null);
          if (!hasValue && !c) return null;
          let core;
          if (!hasValue) {
            return `${it.label}: ${c}`;
          }
          if (it.type === 'numeric') {
            core = `${it.label} ${v}${it.unit || ''}`;
          } else if (it.type === 'multichoice') {
            core = `${it.label}: ${v.join(' / ')}`;
          } else {
            core = `${it.label}: ${v}`;
          }
          if (c && it.type !== 'text') {
            core += `（${c}）`;
          }
          return core;
        })
        .filter(Boolean);
      if (entries.length > 0) {
        lines.push('');
        lines.push(`■ ${section.title}`);
        entries.forEach((e) => lines.push(`  ・${e}`));
      }
    });
    const trimmed = overallComment.trim();
    if (trimmed) {
      lines.push('');
      lines.push('■ 全般所見・総合コメント');
      lines.push(`  ${trimmed}`);
    }
    return lines.join('\n');
  }, [findings, comments, overallComment, examDate]);

  // アセスメント自動生成 (level 別にグルーピング)
  const assessmentGroups = useMemo(() => {
    const groups = { emergency: [], workup: [], reference: [] };
    HOLTER_ASSESSMENT_RULES.forEach((rule) => {
      try {
        if (rule.when(findings)) {
          const lv = rule.level || 'reference';
          if (groups[lv]) groups[lv].push(rule.text);
        }
      } catch { /* skip */ }
    });
    return groups;
  }, [findings]);

  const totalAssessCount = assessmentGroups.emergency.length + assessmentGroups.workup.length + assessmentGroups.reference.length;

  const fullOutput = useMemo(() => {
    if (totalAssessCount === 0) return output;
    const parts = [output, ''];
    if (assessmentGroups.emergency.length > 0) {
      parts.push('■ 【緊急】診断補助');
      assessmentGroups.emergency.forEach((t) => parts.push(`  ・${t}`));
    }
    if (assessmentGroups.workup.length > 0) {
      if (assessmentGroups.emergency.length > 0) parts.push('');
      parts.push('■ 【要精査】診断補助');
      assessmentGroups.workup.forEach((t) => parts.push(`  ・${t}`));
    }
    if (assessmentGroups.reference.length > 0) {
      if (assessmentGroups.emergency.length > 0 || assessmentGroups.workup.length > 0) parts.push('');
      parts.push('■ 【参考】診断補助');
      assessmentGroups.reference.forEach((t) => parts.push(`  ・${t}`));
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
            {assessmentGroups.emergency.map((t, i) => (
              <p key={i} className={styles.emergencyItem}>{t}</p>
            ))}
          </div>
        )}

        {HOLTER_SECTIONS.map((section) => {
          const isCollapsed = !!collapsed[section.id];
          const inputCount = section.items.filter((it) => {
            const v = findings[it.id];
            const c = comments[it.id];
            const has = Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== '' && v !== null);
            return has || (c && c.trim() !== '');
          }).length;
          return (
            <div key={section.id} className={styles.organCard}>
              <button
                type="button"
                className={styles.organHeader}
                onClick={() => toggleSection(section.id)}
                aria-expanded={!isCollapsed}
              >
                <span className={styles.organToggle}>{isCollapsed ? '▸' : '▾'}</span>
                <span className={styles.organName}>{section.title}</span>
                {inputCount > 0 && (
                  <span className={styles.organBadge}>{inputCount} 件入力済</span>
                )}
              </button>
              {!isCollapsed && (
                <div className={styles.organBody}>
                  {section.items.map((item) => (
                    <div key={item.id} className={`${styles.itemRow} ${item.emergency ? styles.itemRowEmergency : ''}`}>
                      <div className={styles.itemLabel}>
                        <span>
                          {item.label}
                          {item.emergency && <span className={styles.emergencyTag}>緊急</span>}
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
                              >
                                {opt}
                              </button>
                            );
                          })}
                          {item.type === 'numeric' && (
                            <>
                              <input
                                type="number"
                                step="any"
                                className={`${styles.numInput} ${isNumericOutOfRange(item, findings[item.id], gender) ? styles.numInputAbnormal : ''}`}
                                value={findings[item.id] || ''}
                                onChange={(e) => setField(item.id, e.target.value)}
                                placeholder={item.placeholder}
                                title={item.normalRange?.note || ''}
                              />
                              {item.unit && <span className={styles.unit}>{item.unit}</span>}
                            </>
                          )}
                          {item.type === 'text' && (
                            <input
                              type="text"
                              className={styles.textInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              placeholder={item.placeholder}
                            />
                          )}
                        </div>
                        <input
                          type="text"
                          className={styles.commentInput}
                          value={comments[item.id] || ''}
                          onChange={(e) => setComment(item.id, e.target.value)}
                          placeholder="自由コメント（任意）"
                        />
                      </div>
                    </div>
                  ))}
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
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>検査日:</label>
          <input
            type="date"
            className={styles.dateInput}
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
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
                {assessmentGroups.emergency.map((a, i) => (<p key={i} className={styles.assessmentItem}>{a}</p>))}
              </div>
            )}
            {assessmentGroups.workup.length > 0 && (
              <div className={`${styles.assessmentPanel} ${styles.panelWorkup}`}>
                <p className={styles.assessmentTitle}>【要精査】 ({assessmentGroups.workup.length})</p>
                {assessmentGroups.workup.map((a, i) => (<p key={i} className={styles.assessmentItem}>{a}</p>))}
              </div>
            )}
            {assessmentGroups.reference.length > 0 && (
              <div className={`${styles.assessmentPanel} ${styles.panelReference}`}>
                <p className={styles.assessmentTitle}>【参考】 ({assessmentGroups.reference.length})</p>
                {assessmentGroups.reference.map((a, i) => (<p key={i} className={styles.assessmentItem}>{a}</p>))}
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
