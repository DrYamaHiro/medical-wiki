import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * FIB-4 index計算ツール
 *
 * 計算式: FIB-4 = (Age × AST) / (PLT_10^9/L × √ALT)
 *   血小板数は万/μLで入力 → ×10 で 10^9/L に変換
 *   例: 15万/μL → 150 × 10^9/L
 *
 * 判定:
 *   < 1.30   肝線維化の可能性低い（陰性的中率90%）
 *   1.30-2.66 グレーゾーン（追加精査を検討）
 *   >= 2.67  肝線維化の可能性高い（陽性的中率65%）
 *
 * 参考: Sterling RK, et al. Hepatology. 2006.
 */
export default function FIB4Calculator() {
  const [age, setAge] = useState('');
  const [ast, setAst] = useState('');
  const [alt, setAlt] = useState('');
  const [plt, setPlt] = useState('');

  const fib4 = useMemo(() => {
    const a = parseFloat(age);
    const astVal = parseFloat(ast);
    const altVal = parseFloat(alt);
    const pltVal = parseFloat(plt);
    if (!a || !astVal || !altVal || !pltVal || a <= 0 || astVal <= 0 || altVal <= 0 || pltVal <= 0) return null;
    const pltConverted = pltVal * 10; // 万/μL → 10^9/L
    return (a * astVal) / (pltConverted * Math.sqrt(altVal));
  }, [age, ast, alt, plt]);

  const judge = useMemo(() => {
    if (fib4 === null) return null;
    if (fib4 < 1.30) return { text: '肝線維化の可能性低い', sub: '陰性的中率 90%', color: '#2E7D32' };
    if (fib4 < 2.67) return { text: 'グレーゾーン', sub: '追加精査を検討', color: '#F9A825' };
    return { text: '肝線維化の可能性高い', sub: '陽性的中率 65%', color: '#C62828' };
  }, [fib4]);

  const isYoung = useMemo(() => {
    const a = parseFloat(age);
    return a > 0 && a < 35;
  }, [age]);

  const reset = () => { setAge(''); setAst(''); setAlt(''); setPlt(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>FIB-4 index</h3>
          <p className={styles.calcSub}>肝線維化の非侵襲的スクリーニング</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 年齢 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>年齢</label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="18"
              className={styles.inputField}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>歳</span>
          </div>
        </div>

        {/* AST */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            AST
            <span className={styles.inputUnit}>U/L</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={ast}
              onChange={(e) => setAst(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>U/L</span>
          </div>
        </div>

        {/* ALT */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            ALT
            <span className={styles.inputUnit}>U/L</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>U/L</span>
          </div>
        </div>

        {/* 血小板数 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            血小板数
            <span className={styles.inputUnit}>万/μL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={styles.inputField}
              value={plt}
              onChange={(e) => setPlt(e.target.value)}
              placeholder="0.0"
            />
            <span className={styles.unitText}>万/μL</span>
          </div>
        </div>
      </div>

      {/* 年齢注意 */}
      {isYoung && (
        <div style={{
          margin: '0 1.2rem 0.8rem',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          background: '#FFF3E0',
          border: '1px solid #E65100',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#BF360C',
        }}>
          35歳未満では偽陰性が多く、FIB-4の信頼性が低下します
        </div>
      )}

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>FIB-4 index</span>
          <span className={styles.resultValue}>
            {fib4 !== null ? fib4.toFixed(2) : '---'}
          </span>
        </div>
        {judge && (
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
          </div>
        )}
      </div>

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>FIB-4</th>
              <th>判定</th>
              <th>備考</th>
            </tr>
          </thead>
          <tbody>
            <tr className={fib4 !== null && fib4 < 1.30 ? styles.active : ''}>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>1.30 未満</td>
              <td>線維化の可能性低い</td>
              <td>陰性的中率 90%</td>
            </tr>
            <tr className={fib4 !== null && fib4 >= 1.30 && fib4 < 2.67 ? styles.active : ''}>
              <td style={{ color: '#F9A825', fontWeight: 700 }}>1.30 〜 2.66</td>
              <td>グレーゾーン</td>
              <td>追加精査を検討</td>
            </tr>
            <tr className={fib4 !== null && fib4 >= 2.67 ? styles.active : ''}>
              <td style={{ color: '#C62828', fontWeight: 700 }}>2.67 以上</td>
              <td>線維化の可能性高い</td>
              <td>陽性的中率 65%</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> FIB-4 = (年齢 × AST) / (PLT [10<sup>9</sup>/L] × √ALT)
        </p>
        <p>
          <strong>注意:</strong> 肝線維化の非侵襲的スクリーニング。NAFLD/MASLD、慢性肝炎の評価に有用。
          35歳未満では偽陰性が多く信頼性が低下します。
        </p>
        <p>
          Sterling RK, et al. Hepatology. 2006.
        </p>
      </div>
    </div>
  );
}
