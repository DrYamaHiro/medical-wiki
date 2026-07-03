import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';
import { ECHO_REGIONS } from './echoData.js';

const ABNORMAL_KEYWORDS = ['異常', '肥厚', 'あり', '拡張', '上昇', '不均一', '腫大', '萎縮', '腫瘤', '狭窄', '低下', '逆方向', '貯留', '示唆', '疑い', '中等度', '高度', '閉塞', '血栓', '不可'];

function isAbnormal(value) {
  if (!value) return false;
  return ABNORMAL_KEYWORDS.some((k) => value.includes(k));
}

export default function EchoBooster() {
  const [region, setRegion] = useState(null);
  const [findings, setFindings] = useState({});
  const [comments, setComments] = useState({});
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

  const reset = () => {
    if (!window.confirm('入力内容をすべてクリアしますか？')) return;
    setFindings({});
    setComments({});
    setRegion(null);
  };

  const selectRegion = (key) => {
    if (region && region !== key && (Object.keys(findings).length > 0 || Object.keys(comments).length > 0)) {
      if (!window.confirm('部位を変更すると入力内容がクリアされます。よろしいですか？')) return;
    }
    setRegion(key);
    setFindings({});
    setComments({});
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
          if (c && it.type !== 'text') {
            core += `（${c}）`;
          }
          return core;
        })
        .filter(Boolean);
      if (entries.length > 0) {
        lines.push(`${section.organ}: ${entries.join('、')}`);
      }
    });
    return lines.join('\n');
  }, [regionData, findings, comments, examDate]);

  // アセスメント自動生成
  const assessments = useMemo(() => {
    if (!regionData?.assessmentRules) return [];
    return regionData.assessmentRules
      .filter((rule) => {
        try { return rule.when(findings); } catch { return false; }
      })
      .map((r) => r.text);
  }, [regionData, findings]);

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
          {regionData.sections.map((section) => (
            <div key={section.organ} className={styles.organCard}>
              <div className={styles.organHeader}>{section.organ}</div>
              <div className={styles.organBody}>
                {section.items.map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemLabel}>
                      <span>{item.label}</span>
                      {item.hint && <span className={styles.itemHint}>{item.hint}</span>}
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
                              className={styles.numInput}
                              value={findings[item.id] || ''}
                              onChange={(e) => setField(item.id, e.target.value)}
                              placeholder={item.placeholder}
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
                      {item.type !== 'text' && (
                        <input
                          type="text"
                          className={styles.commentInput}
                          value={comments[item.id] || ''}
                          onChange={(e) => setComment(item.id, e.target.value)}
                          placeholder="自由コメント（任意）"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
