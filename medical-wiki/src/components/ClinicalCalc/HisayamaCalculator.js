import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * 久山町スコア計算ツール（簡易版）
 *
 * 久山町研究に基づく動脈硬化性疾患（冠動脈疾患・脳卒中）の10年リスク予測。
 * ポイント加算方式による簡易スコアリング。
 *
 * 参考: Hisayama Study（久山町研究）
 *       日本動脈硬化学会 動脈硬化性疾患予防ガイドライン 2022年版
 */
export default function HisayamaCalculator() {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [smoking, setSmoking] = useState(null);
  const [sbp, setSbp] = useState('');
  const [diabetes, setDiabetes] = useState(null);
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');

  const tcHdlRatio = useMemo(() => {
    const t = parseFloat(tc);
    const h = parseFloat(hdl);
    if (!t || !h || t <= 0 || h <= 0) return null;
    return t / h;
  }, [tc, hdl]);

  const score = useMemo(() => {
    const a = parseInt(age, 10);
    if (!a || a < 40 || a > 79) return null;
    if (smoking === null || diabetes === null) return null;
    const s = parseFloat(sbp);
    if (!s || s <= 0) return null;
    if (tcHdlRatio === null) return null;

    let pts = 0;

    // 年齢
    if (a >= 70) pts += 8;
    else if (a >= 60) pts += 7;
    else if (a >= 50) pts += 5;

    // 喫煙
    if (smoking) pts += (sex === 'male' ? 4 : 3);

    // 収縮期血圧
    if (s >= 160) pts += 3;
    else if (s >= 140) pts += 2;
    else if (s >= 120) pts += 1;

    // 糖尿病
    if (diabetes) pts += (sex === 'male' ? 3 : 4);

    // TC/HDL比
    if (tcHdlRatio >= 6) pts += 3;
    else if (tcHdlRatio >= 5) pts += 2;
    else if (tcHdlRatio >= 4) pts += 1;

    return pts;
  }, [sex, age, smoking, sbp, diabetes, tcHdlRatio]);

  const judge = useMemo(() => {
    if (score === null) return null;
    if (score <= 5) return { text: '低リスク', sub: '10年リスク 2%未満', color: '#2E7D32', mgmt: 'LDL目標 160 mg/dL未満（一次予防・カテゴリーI相当）' };
    if (score <= 10) return { text: '中リスク', sub: '10年リスク 2〜9%', color: '#E65100', mgmt: 'LDL目標 140 mg/dL未満（一次予防・カテゴリーII相当）' };
    if (score <= 15) return { text: '高リスク', sub: '10年リスク 10〜19%', color: '#C62828', mgmt: 'LDL目標 120 mg/dL未満（一次予防・カテゴリーIII相当）' };
    return { text: '極高リスク', sub: '10年リスク 20%以上', color: '#B71C1C', mgmt: 'LDL目標 100 mg/dL未満（二次予防に準じた厳格管理）' };
  }, [score]);

  const reset = () => {
    setSex('male');
    setAge('');
    setSmoking(null);
    setSbp('');
    setDiabetes(null);
    setTc('');
    setHdl('');
  };

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>久山町スコア（動脈硬化性疾患リスク）</h3>
          <p className={styles.calcSub}>冠動脈疾患・脳卒中の10年リスク予測</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 性別 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>性別</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('male')}
            >男性</button>
            <button
              className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('female')}
            >女性</button>
          </div>
        </div>

        {/* 年齢 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            年齢
            <span className={styles.inputUnit}>40〜79歳</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="40"
              max="79"
              className={styles.inputField}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="65"
            />
            <span className={styles.unitText}>歳</span>
          </div>
        </div>

        {/* 喫煙 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>喫煙</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${smoking === true ? styles.toggleBtnActive : ''}`}
              onClick={() => setSmoking(true)}
            >あり</button>
            <button
              className={`${styles.toggleBtn} ${smoking === false ? styles.toggleBtnActive : ''}`}
              onClick={() => setSmoking(false)}
            >なし</button>
          </div>
        </div>

        {/* 収縮期血圧 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            収縮期血圧
            <span className={styles.inputUnit}>mmHg</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="60"
              max="260"
              className={styles.inputField}
              value={sbp}
              onChange={(e) => setSbp(e.target.value)}
              placeholder="130"
            />
            <span className={styles.unitText}>mmHg</span>
          </div>
        </div>

        {/* 糖尿病 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>糖尿病</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${diabetes === true ? styles.toggleBtnActive : ''}`}
              onClick={() => setDiabetes(true)}
            >あり</button>
            <button
              className={`${styles.toggleBtn} ${diabetes === false ? styles.toggleBtnActive : ''}`}
              onClick={() => setDiabetes(false)}
            >なし</button>
          </div>
        </div>

        {/* 総コレステロール */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            総コレステロール
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="50"
              max="500"
              className={styles.inputField}
              value={tc}
              onChange={(e) => setTc(e.target.value)}
              placeholder="220"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>

        {/* HDLコレステロール */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            HDLコレステロール
            <span className={styles.inputUnit}>mg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="10"
              max="200"
              className={styles.inputField}
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              placeholder="55"
            />
            <span className={styles.unitText}>mg/dL</span>
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>スコア合計</span>
          <span className={styles.resultValue}>
            {score !== null ? `${score} 点` : '---'}
          </span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>TC/HDL比</span>
          <span className={styles.resultValue} style={{ fontSize: '1.1rem' }}>
            {tcHdlRatio !== null ? tcHdlRatio.toFixed(2) : '---'}
          </span>
        </div>
        {judge && (
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
            <br />
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{judge.mgmt}</span>
          </div>
        )}
      </div>

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>スコア</th>
              <th>リスク区分</th>
              <th>10年リスク</th>
            </tr>
          </thead>
          <tbody>
            <tr className={score !== null && score <= 5 ? styles.active : ''}>
              <td>0〜5</td>
              <td>低リスク</td>
              <td>2%未満</td>
            </tr>
            <tr className={score !== null && score >= 6 && score <= 10 ? styles.active : ''}>
              <td>6〜10</td>
              <td>中リスク</td>
              <td>2〜9%</td>
            </tr>
            <tr className={score !== null && score >= 11 && score <= 15 ? styles.active : ''}>
              <td>11〜15</td>
              <td>高リスク</td>
              <td>10〜19%</td>
            </tr>
            <tr className={score !== null && score >= 16 ? styles.active : ''}>
              <td>16以上</td>
              <td>極高リスク</td>
              <td>20%以上</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>注意:</strong> 本ツールは久山町研究に基づく簡易スコアリングであり、
          正確な絶対リスクの算出には原著論文の回帰係数が必要です。
          脂質管理目標の設定には吹田スコアも併せてご参照ください。
        </p>
        <p>
          <strong>参考文献:</strong> Hisayama Study（久山町研究）; 日本動脈硬化学会
          動脈硬化性疾患予防ガイドライン 2022年版.
        </p>
      </div>
    </div>
  );
}
