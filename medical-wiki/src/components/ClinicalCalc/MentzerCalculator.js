import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * Mentzer index 計算ツール
 *
 * 計算式: MCV (fL) / RBC (×10⁶/μL)
 *   <13  → β サラセミア (thalassemia trait) 示唆
 *   >13  → 鉄欠乏性貧血 (IDA) 示唆
 *   =13  → 灰色域 (両者鑑別困難)
 *
 * 適応: 小球性 (MCV < 80 fL) 貧血の鑑別、感度〜80%程度、あくまで補助指標
 * 参考: Mentzer WC. Lancet 1973;1(7808):882.
 *
 * 補助情報:
 *   - サラセミア: RBC が保たれる or 高値、赤血球が多いが小球性
 *   - IDA:      RBC が低下、赤血球の産生が抑えられる
 *   - 併存 (IDA + サラセミア) では判定不能
 *   - 慢性炎症性貧血 (ACD) では鑑別に有用でない
 */
export default function MentzerCalculator() {
  const [mcv, setMcv] = useState('');
  const [rbc, setRbc] = useState('');

  const mcvVal = parseFloat(mcv);
  const rbcVal = parseFloat(rbc);
  const mcvValid = isFinite(mcvVal) && mcvVal > 0;
  const rbcValid = isFinite(rbcVal) && rbcVal > 0;

  const index = useMemo(() => {
    if (!mcvValid || !rbcValid) return null;
    return mcvVal / rbcVal;
  }, [mcvVal, rbcVal, mcvValid, rbcValid]);

  const microcytic = mcvValid && mcvVal < 80;

  const judge = useMemo(() => {
    if (index === null) return null;
    if (index < 13) return { text: 'サラセミア (β-thalassemia trait) を示唆', sub: 'Mentzer < 13', color: '#1565C0' };
    if (index > 13) return { text: '鉄欠乏性貧血 (IDA) を示唆', sub: 'Mentzer > 13', color: '#C62828' };
    return { text: '判定困難 (灰色域)', sub: 'Mentzer = 13 前後は両者の鑑別不能', color: '#616161' };
  }, [index]);

  const reset = () => { setMcv(''); setRbc(''); };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>Mentzer index</h3>
          <p className={styles.calcSub}>小球性貧血の鑑別 (サラセミア vs 鉄欠乏性貧血)</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* MCV */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            MCV (平均赤血球容積)
            <span className={styles.inputUnit}>fL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.1"
              min="0"
              className={styles.inputField}
              value={mcv}
              onChange={(e) => setMcv(e.target.value)}
              placeholder="例: 68"
            />
            <span className={styles.unitText}>fL</span>
          </div>
        </div>

        {/* RBC */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            RBC (赤血球数)
            <span className={styles.inputUnit}>×10⁶/μL (million/μL)</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="0.01"
              min="0"
              className={styles.inputField}
              value={rbc}
              onChange={(e) => setRbc(e.target.value)}
              placeholder="例: 5.20"
            />
            <span className={styles.unitText}>×10⁶/μL</span>
          </div>
        </div>
      </div>

      {/* MCV 未小球性の注記 */}
      {mcvValid && !microcytic && (
        <div style={{
          margin: '0 1.2rem 0.8rem',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          background: '#FFF8E1',
          border: '1px solid #F9A825',
          fontSize: '0.85rem',
          color: '#8D6E00',
        }}>
          MCV ≥80 fL のため小球性貧血ではありません。Mentzer index は本来<strong>小球性貧血 (MCV &lt;80 fL) の鑑別</strong>で使用します。他の貧血 (正球性・大球性) では別の鑑別体系を参照してください。
        </div>
      )}

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>Mentzer index</span>
          <span className={styles.resultValue}>
            {index !== null ? index.toFixed(2) : '---'}
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
              <th>Mentzer index</th>
              <th>示唆される病態</th>
            </tr>
          </thead>
          <tbody>
            <tr className={index !== null && index < 13 ? styles.active : ''}>
              <td style={{ color: '#1565C0', fontWeight: 700 }}>&lt; 13</td>
              <td>β-thalassemia trait (サラセミア)</td>
            </tr>
            <tr className={index !== null && index === 13 ? styles.active : ''}>
              <td style={{ color: '#616161', fontWeight: 700 }}>= 13</td>
              <td>灰色域 (両者鑑別困難)</td>
            </tr>
            <tr className={index !== null && index > 13 ? styles.active : ''}>
              <td style={{ color: '#C62828', fontWeight: 700 }}>&gt; 13</td>
              <td>鉄欠乏性貧血 (IDA)</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>計算式:</strong> MCV (fL) ÷ RBC (×10⁶/μL)
        </p>
        <p>
          <strong>適応:</strong> 小球性貧血 (MCV &lt;80 fL) の一次鑑別。感度・特異度は概ね 70-80% 程度で、あくまで補助指標。確定にはフェリチン・血清鉄・TIBC・Hb 電気泳動 (HbA2, HbF) 等の追加検査を要します。
        </p>
        <p>
          <strong>解釈のコツ:</strong>
        </p>
        <ul style={{ marginTop: '0.2rem', paddingLeft: '1.2rem' }}>
          <li><strong>サラセミア</strong>: RBC が保たれる or 高値、MCV は低いが RBC は高いため index が小さくなる。</li>
          <li><strong>IDA</strong>: RBC 産生も低下し MCV も低下、両者の比が 13 を超える。</li>
          <li><strong>混在例 (IDA + サラセミア併存)</strong> や <strong>慢性炎症性貧血 (ACD)</strong> では判定困難、確定検査へ進めてください。</li>
        </ul>
        <p>
          <strong>参考:</strong> Mentzer WC. <em>Lancet</em> 1973;1(7808):882.
        </p>
      </div>
    </div>
  );
}
