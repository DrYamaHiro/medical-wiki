import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * CPI（C-peptide Index）計算ツール
 *
 * 計算式: CPI = 空腹時Cペプチド(ng/mL) / 空腹時血糖(mg/dL) × 100
 *
 * 判定基準:
 *   CPI >= 1.2  インスリン分泌能保持 → 経口薬で管理可能
 *   0.8 <= CPI < 1.2  インスリン分泌能低下 → インスリン導入検討
 *   CPI < 0.8  インスリン依存状態 → インスリン必須
 *
 * 参考: Funakoshi S, et al. J Diabetes Investig. 2011;2(5):377-380.
 */
export default function CPICalculator() {
  const [cpeptide, setCpeptide] = useState('');
  const [glucose, setGlucose] = useState('');

  const result = useMemo(() => {
    const c = parseFloat(cpeptide);
    const g = parseFloat(glucose);
    if (!c || !g || c <= 0 || g <= 0) return null;
    return (c / g) * 100;
  }, [cpeptide, glucose]);

  const judge = useMemo(() => {
    if (result === null) return null;
    if (result >= 1.2) return { text: 'インスリン分泌能保持', sub: '経口薬で管理可能', color: '#2E7D32' };
    if (result >= 0.8) return { text: 'インスリン分泌能低下', sub: 'インスリン導入を検討', color: '#E65100' };
    return { text: 'インスリン依存状態', sub: 'インスリン治療が必要', color: '#C62828' };
  }, [result]);

  const reset = () => { setCpeptide(''); setGlucose(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>CPI（C-peptide Index）</h3>
          <p className={styles.calcSub}>インスリン分泌能の評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            空腹時Cペプチド
            <span className={styles.inputUnit}>ng/mL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={styles.inputField}
              value={cpeptide}
              onChange={(e) => setCpeptide(e.target.value)}
              placeholder="0.0"
            />
            <span className={styles.unitText}>ng/mL</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            空腹時血糖
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              placeholder="0"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>CPI</span>
          <span className={styles.resultValue}>
            {result !== null ? result.toFixed(2) : '---'}
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
              <th>CPI</th>
              <th>判定</th>
              <th>対応</th>
            </tr>
          </thead>
          <tbody>
            <tr className={result !== null && result >= 1.2 ? styles.active : ''}>
              <td>1.2 以上</td>
              <td>分泌能保持</td>
              <td>経口薬</td>
            </tr>
            <tr className={result !== null && result >= 0.8 && result < 1.2 ? styles.active : ''}>
              <td>0.8 〜 1.2</td>
              <td>分泌能低下</td>
              <td>インスリン検討</td>
            </tr>
            <tr className={result !== null && result < 0.8 ? styles.active : ''}>
              <td>0.8 未満</td>
              <td>インスリン依存</td>
              <td>インスリン必須</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> CPI = 空腹時Cペプチド(ng/mL) / 空腹時血糖(mg/dL) x 100
        </p>
        <p>
          <strong>注意:</strong> 空腹時の検体で評価。食後やグルカゴン負荷後のCペプチドでは使用しない。
          SU薬内服中は内因性分泌が刺激されるため過大評価の可能性あり。
        </p>
        <p>
          Funakoshi S, et al. J Diabetes Investig. 2011;2(5):377-380.
        </p>
      </div>
    </div>
  );
}
