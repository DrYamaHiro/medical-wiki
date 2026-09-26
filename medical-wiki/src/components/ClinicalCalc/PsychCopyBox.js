import React, { useState, useMemo, useEffect } from 'react';
import copyText, { COPY_FAILED_MESSAGE } from './copyText';

// 精神科系ツール共通のカルテ・紹介状貼付用コピーコンポーネント
// props:
//   text: string  — コピー対象テキスト (空文字/undefined ならコピーボタン非活性)
//   dateLabel: string — 日付ラベル (省略時 "検査日")
//   defaultDate: string — 初期日付 YYYY-MM-DD (省略時 今日)
//   onDateChange: (date) => void — 日付変更時のコールバック (省略時 内部 state)
//   heading: string — ボックス上部見出し (省略時 "カルテ・紹介状貼付用テキスト")
//   summary: string — 1 行要約（スコアと判定のみ）。指定時は「結果のみコピー」ボタンを表示

function formatToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PsychCopyBox({ text, summary, dateLabel = '実施日', defaultDate, onDateChange, heading = 'カルテ・紹介状貼付用テキスト' }) {
  // 今日の日付はマウント後に入れる（ビルド時の日付で SSR すると hydration が食い違うため）
  const [internalDate, setInternalDate] = useState(defaultDate || '');
  useEffect(() => {
    if (!defaultDate) setInternalDate((prev) => prev || formatToday());
  }, [defaultDate]);
  const [copied, setCopied] = useState('');

  const displayDate = defaultDate !== undefined && onDateChange ? defaultDate : internalDate;

  const finalText = useMemo(() => {
    if (!text) return '';
    return text.replace(/__DATE__/g, displayDate);
  }, [text, displayDate]);

  const finalSummary = useMemo(() => {
    if (!summary) return '';
    return summary.replace(/__DATE__/g, displayDate);
  }, [summary, displayDate]);

  const handleDateChange = (v) => {
    if (onDateChange) onDateChange(v);
    else setInternalDate(v);
  };

  const copy = async (key, value) => {
    if (!value) return;
    if (await copyText(value)) {
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } else {
      alert(COPY_FAILED_MESSAGE);
    }
  };

  const buttonStyle = (key, base) => ({
    padding: '0.4rem 0.9rem',
    fontSize: '0.85rem',
    background: copied === key ? '#00897b' : base,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
  });

  if (!text) return null;

  return (
    <div style={{
      margin: '1rem 1.2rem 0.5rem',
      padding: '0.9rem 1rem',
      background: 'linear-gradient(180deg, #e8f5e9 0%, #fff 100%)',
      border: '2px solid #66bb6a',
      borderRadius: '8px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.6rem',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1b5e20' }}>
          {heading}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>{dateLabel}:</label>
          <input
            type="date"
            value={displayDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{
              padding: '0.25rem 0.45rem',
              fontSize: '0.8rem',
              border: '1.5px solid #b0bec5',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          />
          {finalSummary && (
            <button type="button" onClick={() => copy('summary', finalSummary)} style={buttonStyle('summary', '#1565c0')}>
              {copied === 'summary' ? 'コピーしました' : '結果のみコピー'}
            </button>
          )}
          <button type="button" onClick={() => copy('full', finalText)} style={buttonStyle('full', '#2e7d32')}>
            {copied === 'full' ? 'コピーしました' : '全文コピー'}
          </button>
        </div>
      </div>
      {finalSummary && (
        <div style={{
          background: '#fff',
          border: '1px solid #90caf9',
          borderRadius: '6px',
          padding: '0.45rem 0.85rem',
          marginBottom: '0.5rem',
          fontSize: '0.86rem',
          fontWeight: 600,
          color: '#0d47a1',
          wordBreak: 'break-all',
        }}>{finalSummary}</div>
      )}
      <pre style={{
        background: '#fff',
        border: '1px solid #c8e6c9',
        borderRadius: '6px',
        padding: '0.7rem 0.85rem',
        fontFamily: '"Consolas", "Menlo", "Courier New", monospace',
        fontSize: '0.82rem',
        lineHeight: 1.55,
        color: '#263238',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        margin: 0,
        maxHeight: '320px',
        overflowY: 'auto',
      }}>{finalText}</pre>
    </div>
  );
}
