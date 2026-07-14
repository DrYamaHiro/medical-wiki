import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { ECHO_REGIONS } from './echoData.js';

const ABNORMAL_KEYWORDS = ['異常', '肥厚', 'あり', '拡張', '上昇', '不均一', '腫大', '萎縮', '腫瘤', '狭窄', '低下', '逆方向', '貯留', '示唆', '疑い', '中等度', '高度', '閉塞', '血栓', '不可'];

function isAbnormal(value) {
  if (!value) return false;
  return ABNORMAL_KEYWORDS.some((k) => value.includes(k));
}

// 数値異常値検出
// item.normalRange: { min, max } または { byGender: { male:{min,max}, female:{min,max} } }
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

// 一括「正常」で選ぶ選択肢のキーワード（先頭一致）
const NORMAL_OPTION_KEYWORDS = ['正常', 'なし', '平滑', '良好', '異常なし', '順方向', '圧迫可', '>50%'];

function pickNormalOption(options) {
  if (!Array.isArray(options)) return null;
  for (const opt of options) {
    if (typeof opt !== 'string') continue;
    if (NORMAL_OPTION_KEYWORDS.some((k) => opt.startsWith(k))) return opt;
  }
  return null;
}

export default function EchoBooster() {
  const [region, setRegion] = useState(null);
  const [findings, setFindings] = useState({});
  const [comments, setComments] = useState({});
  const [overallComment, setOverallComment] = useState('');
  const [gender, setGender] = useState('male');
  const [collapsed, setCollapsed] = useState({});
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [copied, setCopied] = useState(false);

  const regionData = region ? ECHO_REGIONS[region] : null;

  const setField = useCallback((id, value) => {
    setFindings((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setComment = useCallback((id, value) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleSection = useCallback((organ) => {
    setCollapsed((prev) => ({ ...prev, [organ]: !prev[organ] }));
  }, []);

  const collapseAll = useCallback(() => {
    if (!regionData) return;
    const next = {};
    regionData.sections.forEach((s) => { next[s.organ] = true; });
    setCollapsed(next);
  }, [regionData]);

  const expandAll = useCallback(() => {
    setCollapsed({});
  }, []);

  const applyAllNormal = useCallback(() => {
    if (!regionData) return;
    const applied = {};
    let count = 0;
    regionData.sections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type !== 'choice') return;
        const normal = pickNormalOption(item.options);
        if (normal) {
          applied[item.id] = normal;
          count++;
        }
      });
    });
    if (count === 0) return;
    if (!window.confirm(`${count} 個の選択項目を「正常」相当に一括設定します。既存の選択も上書きしますが、よろしいですか？`)) return;
    setFindings((prev) => ({ ...prev, ...applied }));
  }, [regionData]);

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setFindings({});
    setComments({});
    setOverallComment('');
    setCollapsed({});
    setRegion(null);
  };

  const selectRegion = (key) => {
    if (region && region !== key && (Object.keys(findings).length > 0 || Object.keys(comments).length > 0 || overallComment)) {
      if (!window.confirm('部位を変更すると入力内容がクリアされます。よろしいですか？')) return;
    }
    setRegion(key);
    setFindings({});
    setComments({});
    setOverallComment('');
    setCollapsed({});
  };

  // 出力テキスト生成
  const output = useMemo(() => {
    if (!regionData) return '';
    const lines = [`【${regionData.label}所見】 ${examDate}`];
    regionData.sections.forEach((section) => {
      const entries = section.items
        .map((it) => {
          const v = findings[it.id];
          const c = (comments[it.id] || '').trim();
          const hasValue = v !== undefined && v !== '' && v !== null;
          if (!hasValue && !c) return null;
          let core;
          if (!hasValue) {
            core = `${it.label}: ${c}`;
            return core;
          }
          if (it.type === 'numeric') {
            core = `${it.label} ${v}${it.unit || ''}`;
          } else {
            core = `${it.label}: ${v}`;
          }
          if (c) {
            core += `（${c}）`;
          }
          return core;
        })
        .filter(Boolean);
      if (entries.length > 0) {
        lines.push(`${section.organ}: ${entries.join('、')}`);
      }
    });
    const trimmed = overallComment.trim();
    if (trimmed) {
      lines.push(`【全般所見】 ${trimmed}`);
    }
    return lines.join('\n');
  }, [regionData, findings, comments, overallComment, examDate]);

  // アセスメント自動生成 (findings に __gender を注入して rule に渡す)
  const assessments = useMemo(() => {
    if (!regionData?.assessmentRules) return [];
    const ctx = { ...findings, __gender: gender };
    return regionData.assessmentRules
      .filter((rule) => {
        try { return rule.when(ctx); } catch { return false; }
      })
      .map((r) => r.text);
  }, [regionData, findings, gender]);

  const fullOutput = useMemo(() => {
    if (!output) return '';
    if (assessments.length === 0) return output;
    return output + '\n【アセスメント】\n' + assessments.map((a) => `・${a}`).join('\n');
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
          <p className={styles.title}>Echo Booster</p>
          <p className={styles.subtitle}>エコー所見を選択・入力するとコピペ用テキストを自動生成</p>
        </div>
        <div className={styles.headerRight}>
          {(region || Object.keys(findings).length > 0) && (
            <button className={styles.resetBtn} onClick={reset} type="button">クリア</button>
          )}
        </div>
      </div>

      {/* Phase 0: 部位選択 */}
      <div className={styles.regionSection}>
        <h4 className={styles.sectionTitle}>
          <span className={styles.phaseBadge}>0</span>
          検査部位を選択
        </h4>
        <div className={styles.regionGrid}>
          {Object.entries(ECHO_REGIONS).map(([key, data]) => (
            <button
              key={key}
              type="button"
              className={`${styles.regionChip} ${region === key ? styles.regionChipActive : ''}`}
              onClick={() => selectRegion(key)}
            >
              {data.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase 1: 検査入力 */}
      {regionData && (
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>
            <span className={styles.phaseBadge}>1</span>
            所見入力 — {regionData.label}
          </h4>
          {regionData.askGender && (
            <div className={styles.genderRow}>
              <span className={styles.genderLabel}>性別（正常値の性差に反映）:</span>
              <div className={styles.genderChips}>
                <button
                  type="button"
                  className={`${styles.choiceChip} ${gender === 'male' ? styles.choiceChipActive : ''}`}
                  onClick={() => setGender('male')}
                >男性</button>
                <button
                  type="button"
                  className={`${styles.choiceChip} ${gender === 'female' ? styles.choiceChipActive : ''}`}
                  onClick={() => setGender('female')}
                >女性</button>
              </div>
            </div>
          )}
          <div className={styles.sectionToolbar}>
            <button type="button" className={`${styles.toolbarBtn} ${styles.toolbarBtnPrimary}`} onClick={applyAllNormal} title="全ての選択項目を『正常』相当（正常/なし/平滑/良好 等）に一括設定">全て正常を選択</button>
            <button type="button" className={styles.toolbarBtn} onClick={expandAll}>全て開く</button>
            <button type="button" className={styles.toolbarBtn} onClick={collapseAll}>全て閉じる</button>
          </div>
          {regionData.sections.map((section) => {
            const isCollapsed = !!collapsed[section.organ];
            const inputCount = section.items.filter((it) => {
              const v = findings[it.id];
              const c = comments[it.id];
              return (v !== undefined && v !== '' && v !== null) || (c && c.trim() !== '');
            }).length;
            return (
            <div key={section.organ} className={styles.organCard}>
              <button
                type="button"
                className={styles.organHeader}
                onClick={() => toggleSection(section.organ)}
                aria-expanded={!isCollapsed}
              >
                <span className={styles.organToggle}>{isCollapsed ? '▸' : '▾'}</span>
                <span className={styles.organName}>{section.organ}</span>
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
                          const abnormal = isAbnormal(opt);
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
            <label className={styles.overallCommentLabel}>【全般所見・特記事項】（部位全体に対する自由コメント）</label>
            <textarea
              className={styles.overallCommentArea}
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
              placeholder="例: 前回検査 (2025年10月) と比較して大きな変化なし。次回 6ヶ月後フォロー予定。"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Phase 2: 出力 */}
      {regionData && (
        <div className={styles.outputSection}>
          <h4 className={styles.outputTitle}>
            <span className={styles.phaseBadge}>2</span>
            コピペ用所見 + 自動アセスメント
          </h4>
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
          <div className={styles.outputBox}>
            {fullOutput || '所見を入力するとここにテキストが生成されます…'}
          </div>
          {assessments.length > 0 && (
            <div className={styles.assessmentList}>
              <p className={styles.assessmentTitle}>自動アセスメント候補</p>
              {assessments.map((a, i) => (
                <p key={i} className={styles.assessmentItem}>{a}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
