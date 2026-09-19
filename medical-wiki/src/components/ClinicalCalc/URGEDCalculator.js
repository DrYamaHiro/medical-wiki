import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';
import {
  URGED_CRITERIA,
  CRITERION_ANSWERS,
  COURSE,
  PATIENT_FLAGS,
  SUPPORTIVE,
  SECONDARY,
  IRLS_ITEMS,
  IRLS_LICENSE_NOTE,
  IRLS_USE_NOTE,
  IRLS_SEVERITY,
  ICSD3_NOTE,
  URGED_SOURCES,
  createInitialState,
  evaluateUrged,
  buildUrgedText,
} from './urgedData';

const ANSWER_CHIP_CLASS = {
  yes: 'chipYes',
  no: 'chipNo',
  unclear: 'chipUnclear',
};

const SECONDARY_GROUPS = [
  { key: 'iron', label: '鉄' },
  { key: 'disease', label: '基礎疾患・状態' },
  { key: 'drug', label: '薬剤' },
  { key: 'lifestyle', label: '生活因子' },
];

function Section({ num, title, note, children }) {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionNum}>{num}</span>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {note && <p className={styles.sectionNote}>{note}</p>}
      {children}
    </div>
  );
}

function Chip({ active, onClick, variant, children }) {
  const variantClass = variant && styles[variant] ? ` ${styles[variant]}` : '';
  return (
    <button
      type="button"
      className={`${styles.chip}${variantClass}${active ? ` ${styles.chipActive}` : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function URGEDCalculator() {
  const [state, setState] = useState(createInitialState);
  const [showIrls, setShowIrls] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const setCriterion = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      criteria: { ...prev.criteria, [key]: prev.criteria[key] === value ? null : value },
    }));
  }, []);

  const setSingle = useCallback((field, value) => {
    setState((prev) => ({ ...prev, [field]: prev[field] === value ? null : value }));
  }, []);

  const toggleInList = useCallback((field, value) => {
    setState((prev) => {
      const list = prev[field] || [];
      return {
        ...prev,
        [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }, []);

  const setIrls = useCallback((index, value) => {
    setState((prev) => {
      const next = [...prev.irls];
      next[index] = next[index] === value ? null : value;
      return { ...prev, irls: next };
    });
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
    setShowIrls(false);
    setShowSources(false);
  }, []);

  const result = useMemo(() => evaluateUrged(state), [state]);
  const outputText = useMemo(() => buildUrgedText(state, result), [state, result]);

  const irlsAnswered = result.irls.answered;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>URGED 基準チェックリスト</p>
          <p className={styles.calcSub}>レストレスレッグス症候群（RLS / Willis-Ekbom 病）</p>
        </div>
        <button type="button" className={styles.resetBtn} onClick={reset}>クリア</button>
      </div>

      <div className={styles.calcBody}>
        {/* ---------------- 1. 必須基準 ---------------- */}
        <Section
          num="1"
          title="必須診断基準（5 項目すべてが必要）"
          note={`IRLSSG 2012 改訂基準の 5 項目。すべてを満たすことが診断の必須条件。${ICSD3_NOTE}`}
        >
          {URGED_CRITERIA.map((c) => (
            <div className={styles.criteriaCard} key={c.key}>
              <div className={styles.criteriaHead}>
                <span className={styles.criteriaKey}>{c.key}</span>
                <span className={styles.criteriaTitle}>{c.title}</span>
              </div>
              <p className={styles.criteriaQ}>{c.question}</p>
              <p className={styles.criteriaHint}>{c.hint}</p>
              <div className={styles.chipRow}>
                {CRITERION_ANSWERS.map((a) => (
                  <Chip
                    key={a.value}
                    active={state.criteria[c.key] === a.value}
                    variant={ANSWER_CHIP_CLASS[a.value]}
                    onClick={() => setCriterion(c.key, a.value)}
                  >
                    {a.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

          {result.essential.status !== 'unanswered' && (
            <div className={styles.statusBadge} style={{ background: result.judgment.color }}>
              {result.judgment.label}
              <span className={styles.statusSub}>
                該当 {result.essential.yesCount} / {result.essential.total}
                {result.essential.noCount > 0 && ` ・ 非該当 ${result.essential.noCount}`}
                {result.essential.unclearCount > 0 && ` ・ 不明 ${result.essential.unclearCount}`}
                {result.essential.unansweredCount > 0 && ` ・ 未回答 ${result.essential.unansweredCount}`}
              </span>
            </div>
          )}
        </Section>

        {/* ---------------- 2. 経過・臨床的意義 ---------------- */}
        <Section
          num="2"
          title="経過の特定と臨床的意義"
          note="頻度による経過型（慢性持続型 / 間欠型）を特定する。臨床的意義は ICSD-3 の診断要件であり、必須 5 基準とあわせて確認する。"
        >
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>{COURSE.frequency.label}</label>
            <div className={styles.chipRow}>
              {COURSE.frequency.options.map((o) => (
                <Chip
                  key={o.value}
                  active={state.frequency === o.value}
                  onClick={() => setSingle('frequency', o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
            <ul className={styles.summaryList}>
              {COURSE.frequency.options.map((o) => (
                <li key={o.value}>
                  <strong>{o.short}</strong>: {o.hint}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>{COURSE.significance.label}</label>
            <div className={styles.chipRow}>
              {COURSE.significance.options.map((o) => (
                <Chip
                  key={o.value}
                  active={state.significance === o.value}
                  onClick={() => setSingle('significance', o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
            {state.significance === 'yes' && (
              <div className={styles.chipRow}>
                {COURSE.significanceDetails.options.map((o) => (
                  <Chip
                    key={o.value}
                    active={state.significanceDetails.includes(o.value)}
                    onClick={() => toggleInList('significanceDetails', o.value)}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>患者背景</label>
            <div className={styles.chipRow}>
              {PATIENT_FLAGS.map((f) => (
                <Chip
                  key={f.key}
                  active={state.flags.includes(f.key)}
                  onClick={() => toggleInList('flags', f.key)}
                >
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>
        </Section>

        {/* ---------------- 3. 支持所見 ---------------- */}
        <Section
          num="3"
          title="診断を支持する所見（複数選択）"
          note="必須基準ではないが、診断の確からしさを補強する所見。"
        >
          <div className={styles.chipRow}>
            {SUPPORTIVE.map((o) => (
              <Chip
                key={o.key}
                active={state.supportive.includes(o.key)}
                onClick={() => toggleInList('supportive', o.key)}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>

        {/* ---------------- 4. 二次性・増悪因子 ---------------- */}
        <Section
          num="4"
          title="二次性・増悪因子と鉄の状態（複数選択）"
          note="該当があれば、まず原因・誘因の是正を優先する。"
        >
          {SECONDARY_GROUPS.map((g) => {
            const items = SECONDARY.filter((x) => x.group === g.key);
            if (items.length === 0) return null;
            return (
              <div className={styles.inputGroup} key={g.key}>
                <label className={styles.inputLabel}>{g.label}</label>
                <div className={styles.chipRow}>
                  {items.map((o) => (
                    <Chip
                      key={o.key}
                      active={state.secondary.includes(o.key)}
                      onClick={() => toggleInList('secondary', o.key)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
            );
          })}
        </Section>

        {/* ---------------- 5. IRLS ---------------- */}
        <Section
          num="5"
          title="IRLS 重症度（任意）"
          note={`10 項目・各 0-4 点・合計 0-40 点。0 なし / 1-10 軽症 / 11-20 中等症 / 21-30 重症 / 31-40 最重症。${IRLS_USE_NOTE}`}
        >
          <button
            type="button"
            className={styles.collapseToggle}
            aria-expanded={showIrls}
            onClick={() => setShowIrls((v) => !v)}
          >
            {showIrls ? 'IRLS 10 項目を閉じる' : 'IRLS 10 項目を開く'}
            {irlsAnswered > 0 && `（回答 ${irlsAnswered}/${IRLS_ITEMS.length}）`}
          </button>

          {showIrls && (
            <div style={{ marginTop: '0.7rem' }}>
              <p className={styles.sectionNote}>{IRLS_LICENSE_NOTE}</p>
              {IRLS_ITEMS.map((item, i) => (
                <div className={styles.irlsItem} key={item.no}>
                  <span className={styles.irlsLabel}>
                    {item.no}. {item.text}
                  </span>
                  <div className={styles.chipRow}>
                    {item.options.map((o) => (
                      <Chip
                        key={o.value}
                        active={state.irls[i] === o.value}
                        onClick={() => setIrls(i, o.value)}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.irls.score !== null && result.irls.severity && (
            <div className={styles.result} style={{ margin: '0.7rem 0 0' }}>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>IRLS 合計</span>
                <span className={styles.resultValue}>
                  {result.irls.score} / {result.irls.max} 点
                </span>
              </div>
              <div className={styles.resultJudge} style={{ background: result.irls.severity.color }}>
                {result.irls.severity.label}
              </div>
            </div>
          )}

          {result.irls.score === null && irlsAnswered > 0 && (
            <p className={styles.sectionNote}>
              未回答の項目があるため、合計点は表示していません（回答 {irlsAnswered}/{IRLS_ITEMS.length} 項目）。
            </p>
          )}

          <table className={styles.judgeTable} style={{ marginTop: '0.6rem' }}>
            <thead>
              <tr>
                <th>合計点</th>
                <th>重症度</th>
              </tr>
            </thead>
            <tbody>
              {IRLS_SEVERITY.map((s) => (
                <tr
                  key={s.label}
                  className={
                    result.irls.severity && result.irls.severity.label === s.label ? styles.active : undefined
                  }
                >
                  <td>{s.min === s.max ? s.min : `${s.min}-${s.max}`}</td>
                  <td>{s.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* ---------------- 6. 推奨検査・対応 ---------------- */}
        <Section num="6" title="推奨検査と対応の要点">
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>推奨検査</label>
            <ul className={styles.summaryList}>
              {result.workup.map((w) => (
                <li key={w}>{w}</li>
              ))}
              {result.workupOptional.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            {result.workupNotes.map((n) => (
              <p className={styles.sectionNote} key={n}>{n}</p>
            ))}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>対応の要点</label>
            <ul className={styles.summaryList}>
              {result.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className={styles.collapseToggle}
            aria-expanded={showSources}
            onClick={() => setShowSources((v) => !v)}
          >
            {showSources ? '出典を閉じる' : '出典を開く'}
          </button>
          {showSources && (
            <ul className={styles.summaryList} style={{ marginTop: '0.5rem' }}>
              {URGED_SOURCES.map((s) => (
                <li key={s.key}>
                  <strong>{s.label}</strong>
                  <br />
                  {s.citation}
                  {s.note && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>{s.note}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <PsychCopyBox text={outputText} />

      <div className={styles.note}>
        <strong>使い方:</strong> 必須基準 5 項目を「該当 / 非該当 / 不明」で入力すると判定が出ます。経過・支持所見・二次性因子・IRLS は任意入力で、入力した内容だけがコピー用テキストに反映されます。<br />
        <strong>診断の責任:</strong> 本ツールは問診の構造化を助ける補助ツールであり、診断の確定は医師が臨床的に行います。<br />
        <strong>薬物療法の用量:</strong> ここには記載していません。RLS 診療ページ（むずむず脚症候群 / G25.8）と Drug Reference を参照してください。<br />
        <strong>小児:</strong> 症状の表現が成人と異なり、本人の言葉での訴えの確認が必要です。成人向けの本チェックリストをそのまま適用しないでください。
      </div>
    </div>
  );
}
