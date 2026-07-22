import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { HOLTER_SECTIONS, HOLTER_ASSESSMENT_RULES } from './holterData.js';

const ABNORMAL_KEYWORDS = ['あり', '相関あり', '不整脈あり', '発作性', '持続性', 'ショック', '不適切', 'モビッツ', '完全房室', 'SSS', '疑い', 'torsades', '多形性'];

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

export default function HolterBooster() {
  const [findings, setFindings] = useState({});
  const [comments, setComments] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [collapsed, setCollapsed] = useState({});
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

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setFindings({});
    setComments({});
    setOverallComment('');
    setCollapsed({});
  };

  const gender = findings.sex === '女性' ? 'female' : 'male';

  // 出力テキスト生成
  const output = useMemo(() => {
    const lines = [`【ホルター心電図所見】 ${examDate}`];
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
        lines.push(`■ ${section.title}`);
        entries.forEach((e) => lines.push(`  ・${e}`));
      }
    });
    const trimmed = overallComment.trim();
    if (trimmed) {
      lines.push('');
      lines.push(`■ 全般所見・総合コメント`);
      lines.push(`  ${trimmed}`);
    }
    return lines.join('\n');
  }, [findings, comments, overallComment, examDate]);

  // アセスメント自動生成
  const assessments = useMemo(() => {
    return HOLTER_ASSESSMENT_RULES
      .filter((rule) => { try { return rule.when(findings); } catch { return false; } })
      .map((r) => r.text);
  }, [findings]);

  const fullOutput = useMemo(() => {
    if (assessments.length === 0) return output;
    return output + '\n\n■ 診断補助 (自動抽出)\n' + assessments.map((a) => `  ・${a}`).join('\n');
  }, [output, assessments]);

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
          <p className={styles.subtitle}>ホルター心電図レポートの数値・所見を入力すると、判読要約と診断補助コメントを自動生成</p>
        </div>
        <div className={styles.headerRight}>
          {(Object.keys(findings).length > 0 || overallComment) && (
            <button className={styles.resetBtn} onClick={reset} type="button">クリア</button>
          )}
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionToolbar}>
          <button type="button" className={styles.toolbarBtn} onClick={expandAll}>全て開く</button>
          <button type="button" className={styles.toolbarBtn} onClick={collapseAll}>全て閉じる</button>
        </div>

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
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemLabel}>
                        <span>{item.label}</span>
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
          <label className={styles.overallCommentLabel}>【全般所見・総合コメント】（記録全体に対する自由コメント）</label>
          <textarea
            className={styles.overallCommentArea}
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="例: 全体を通じて洞調律主体、症状時のイベント記録なし。次回 6ヶ月後再検予定。"
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
        </div>
        <pre className={styles.outputBox}>{fullOutput || '(まだ入力がありません)'}</pre>
        {assessments.length > 0 && (
          <div className={styles.assessmentList}>
            <p className={styles.assessmentTitle}>診断補助 ({assessments.length} 件)</p>
            {assessments.map((a, i) => (
              <p key={i} className={styles.assessmentItem}>{a}</p>
            ))}
          </div>
        )}
      </div>

      <div className={styles.note}>
        <strong>使い方:</strong> Philips DigiTrak XT / Zymed 等の解析レポートを見ながら、該当する数値・所見を入力してください。<br />
        <strong>診断補助:</strong> 入力値から自動的に臨床的示唆を抽出します（PVC 心筋症リスク、AF 検出、ペースメーカー適応、QT 延長 torsades リスク等）。あくまで判読サポートであり、最終判断は臨床医が行ってください。<br />
        <strong>注:</strong> ホルター記録の解釈は症状日誌との照合が本質的に重要です。「症状日誌との相関」欄を必ず確認してください。
      </div>
    </div>
  );
}
