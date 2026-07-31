import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';

/**
 * TSAT (Transferrin Saturation) 計算ツール
 *
 * 計算式: TSAT (%) = (血清鉄 Fe ÷ TIBC) × 100
 *   TIBC = Fe + UIBC の関係 (UIBC のみ入力時は Fe + UIBC で TIBC を自動算出)
 *
 * 判定 (TSAT 単独):
 *   >=45%   鉄過剰疑い (ヘモクロマトーシス等)
 *   20-44%  正常域
 *   16-19%  境界域 / 鉄欠乏傾向
 *   <16%    鉄欠乏の可能性高い
 *
 * フェリチン併用判定 (鉄代謝の総合評価):
 *   TSAT<20% + フェリチン<30      絶対的鉄欠乏 (IDA)
 *   TSAT<20% + フェリチン 30-100  機能的鉄欠乏 (炎症・CKD・心不全等で低値マスク)
 *   TSAT<20% + フェリチン>100     機能的鉄欠乏の可能性 (炎症性)
 *   TSAT>=20% + フェリチン<30     鉄貯蔵低下 (前 IDA)
 *   TSAT>=45% + フェリチン>300    鉄過剰 (遺伝性ヘモクロマトーシス精査)
 *
 * 参考:
 *   - JSH2022 (日本高血圧学会) 他各種鉄代謝ガイドライン
 *   - CKD (KDIGO 2012): TSAT ≤20% + フェリチン ≤100 で鉄補充検討
 *   - HFrEF (ESC 2021): TSAT <20% or フェリチン <100 で鉄欠乏、静注鉄投与適応検討
 */
export default function TSATCalculator() {
  const [fe, setFe] = useState('');
  const [tibcInput, setTibcInput] = useState('');
  const [uibcInput, setUibcInput] = useState('');
  const [ferritin, setFerritin] = useState('');
  const [sex, setSex] = useState('male');

  const feVal = parseFloat(fe);
  const tibcDirect = parseFloat(tibcInput);
  const uibcVal = parseFloat(uibcInput);
  const ferritinVal = parseFloat(ferritin);

  // TIBC は直接入力優先、なければ Fe + UIBC で算出
  const tibc = useMemo(() => {
    if (isFinite(tibcDirect) && tibcDirect > 0) return tibcDirect;
    if (isFinite(feVal) && feVal > 0 && isFinite(uibcVal) && uibcVal >= 0) return feVal + uibcVal;
    return null;
  }, [tibcDirect, feVal, uibcVal]);

  const tibcSource = useMemo(() => {
    if (isFinite(tibcDirect) && tibcDirect > 0) return 'direct';
    if (tibc !== null) return 'calculated';
    return null;
  }, [tibcDirect, tibc]);

  const tsat = useMemo(() => {
    if (!isFinite(feVal) || feVal <= 0) return null;
    if (tibc === null || tibc <= 0) return null;
    return (feVal / tibc) * 100;
  }, [feVal, tibc]);

  const tsatJudge = useMemo(() => {
    if (tsat === null) return null;
    if (tsat >= 45) return { text: '鉄過剰疑い', sub: 'TSAT ≥45%、遺伝性ヘモクロマトーシス等の精査を検討', color: '#B71C1C' };
    if (tsat >= 20) return { text: '正常域', sub: 'TSAT 20-44%', color: '#2E7D32' };
    if (tsat >= 16) return { text: '境界域 / 鉄欠乏傾向', sub: 'TSAT 16-19%', color: '#F9A825' };
    return { text: '鉄欠乏の可能性高い', sub: 'TSAT <16%', color: '#C62828' };
  }, [tsat]);

  // フェリチン併用判定
  const combinedJudge = useMemo(() => {
    if (tsat === null || !isFinite(ferritinVal) || ferritinVal <= 0) return null;
    if (tsat < 20 && ferritinVal < 30) {
      return { text: '絶対的鉄欠乏 (IDA)', sub: 'TSAT <20% + フェリチン <30 ng/mL、鉄補充適応', color: '#C62828' };
    }
    if (tsat < 20 && ferritinVal >= 30 && ferritinVal <= 100) {
      return { text: '機能的鉄欠乏の可能性', sub: 'TSAT <20% + フェリチン 30-100 ng/mL、炎症・CKD・心不全等でフェリチン偽正常化', color: '#EF6C00' };
    }
    if (tsat < 20 && ferritinVal > 100) {
      return { text: '機能的鉄欠乏 (炎症性)', sub: 'TSAT <20% + フェリチン >100 ng/mL、慢性炎症・悪性腫瘍等の背景考慮', color: '#EF6C00' };
    }
    if (tsat >= 20 && ferritinVal < 30) {
      return { text: '鉄貯蔵低下 (前 IDA)', sub: 'TSAT 保たれるがフェリチン <30 ng/mL、経過フォロー・食事指導', color: '#F9A825' };
    }
    if (tsat >= 45 && ferritinVal > 300) {
      return { text: '鉄過剰 (要精査)', sub: 'TSAT ≥45% + フェリチン >300 ng/mL、遺伝性ヘモクロマトーシス/二次性鉄過剰の精査', color: '#B71C1C' };
    }
    if (tsat >= 45) {
      return { text: '鉄過剰傾向', sub: 'TSAT ≥45%、原因検索 (輸血歴・肝疾患・遺伝的背景等)', color: '#E65100' };
    }
    return { text: '鉄代謝は正常範囲', sub: 'TSAT・フェリチンとも正常域', color: '#2E7D32' };
  }, [tsat, ferritinVal]);

  const reset = () => { setFe(''); setTibcInput(''); setUibcInput(''); setFerritin(''); };

  const normalRangeText = sex === 'female' ? '15-50%' : '20-45%';

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>TSAT (トランスフェリン飽和度)</h3>
          <p className={styles.calcSub}>鉄代謝評価 — 鉄欠乏・鉄過剰の鑑別</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 性別 (正常値目安の切替) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>性別 (正常範囲の目安)</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('male')}
            >男性 (20-45%)</button>
            <button
              className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleBtnActive : ''}`}
              onClick={() => setSex('female')}
            >女性 (15-50%)</button>
          </div>
        </div>

        {/* Fe (血清鉄) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            血清鉄 (Fe) [必須]
            <span className={styles.inputUnit}>μg/dL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={fe}
              onChange={(e) => setFe(e.target.value)}
              placeholder="例: 45"
            />
            <span className={styles.unitText}>μg/dL</span>
          </div>
        </div>

        {/* TIBC (直接入力優先) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            TIBC (総鉄結合能) [推奨]
            <span className={styles.inputUnit}>μg/dL — 直接入力優先</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={tibcInput}
              onChange={(e) => setTibcInput(e.target.value)}
              placeholder="例: 380"
            />
            <span className={styles.unitText}>μg/dL</span>
          </div>
        </div>

        {/* UIBC (代替) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            UIBC (不飽和鉄結合能) [TIBC 未入力時のみ使用]
            <span className={styles.inputUnit}>μg/dL — TIBC = Fe + UIBC で自動算出</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={uibcInput}
              onChange={(e) => setUibcInput(e.target.value)}
              placeholder="例: 335"
              disabled={isFinite(tibcDirect) && tibcDirect > 0}
              style={isFinite(tibcDirect) && tibcDirect > 0 ? { background: '#eceff1', color: '#90a4ae' } : {}}
            />
            <span className={styles.unitText}>μg/dL</span>
          </div>
        </div>

        {/* Ferritin (任意) */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            血清フェリチン [任意 — 総合判定用]
            <span className={styles.inputUnit}>ng/mL</span>
          </label>
          <div className={styles.inputRow}>
            <input
              type="number"
              step="1"
              min="0"
              className={styles.inputField}
              value={ferritin}
              onChange={(e) => setFerritin(e.target.value)}
              placeholder="例: 12"
            />
            <span className={styles.unitText}>ng/mL</span>
          </div>
        </div>
      </div>

      {/* TIBC 情報 */}
      {tibc !== null && (
        <div style={{
          margin: '0 1.2rem 0.6rem',
          padding: '0.5rem 0.7rem',
          borderRadius: '6px',
          background: tibcSource === 'calculated' ? '#e3f2fd' : '#f1f8e9',
          border: `1px solid ${tibcSource === 'calculated' ? '#64b5f6' : '#9ccc65'}`,
          fontSize: '0.82rem',
          color: '#263238',
        }}>
          {tibcSource === 'direct' && <>使用中の TIBC: <strong>{tibc.toFixed(0)} μg/dL</strong> (直接入力)</>}
          {tibcSource === 'calculated' && <>使用中の TIBC: <strong>{tibc.toFixed(0)} μg/dL</strong> (= Fe {feVal} + UIBC {uibcVal})</>}
        </div>
      )}

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>TSAT</span>
          <span className={styles.resultValue}>
            {tsat !== null ? tsat.toFixed(1) : '---'}
            {tsat !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>%</span>
            )}
          </span>
        </div>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>正常範囲 ({sex === 'female' ? '女性' : '男性'})</span>
          <span className={styles.resultValue} style={{ fontSize: '1rem' }}>{normalRangeText}</span>
        </div>
        {tsatJudge && (
          <div className={styles.resultJudge} style={{ background: tsatJudge.color }}>
            {tsatJudge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{tsatJudge.sub}</span>
          </div>
        )}
        {combinedJudge && (
          <div className={styles.resultJudge} style={{ background: combinedJudge.color, marginTop: '0.4rem' }}>
            [フェリチン併用判定] {combinedJudge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{combinedJudge.sub}</span>
          </div>
        )}
      </div>

      {/* 判定基準テーブル */}
      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>TSAT</th>
              <th>解釈</th>
            </tr>
          </thead>
          <tbody>
            <tr className={tsat !== null && tsat >= 45 ? styles.active : ''}>
              <td style={{ color: '#B71C1C', fontWeight: 700 }}>≥45%</td>
              <td>鉄過剰疑い (ヘモクロマトーシス等)</td>
            </tr>
            <tr className={tsat !== null && tsat >= 20 && tsat < 45 ? styles.active : ''}>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>20-44%</td>
              <td>正常域</td>
            </tr>
            <tr className={tsat !== null && tsat >= 16 && tsat < 20 ? styles.active : ''}>
              <td style={{ color: '#F9A825', fontWeight: 700 }}>16-19%</td>
              <td>境界域 / 鉄欠乏傾向</td>
            </tr>
            <tr className={tsat !== null && tsat < 16 ? styles.active : ''}>
              <td style={{ color: '#C62828', fontWeight: 700 }}>&lt;16%</td>
              <td>鉄欠乏の可能性高い</td>
            </tr>
          </tbody>
        </table>

        <p><strong>計算式:</strong> TSAT (%) = (血清鉄 Fe ÷ TIBC) × 100</p>
        <p><strong>TIBC:</strong> 直接入力を優先。未入力時は TIBC = Fe + UIBC で自動算出。</p>

        <p><strong>疾患別カットオフの目安:</strong></p>
        <ul style={{ marginTop: '0.2rem', paddingLeft: '1.2rem' }}>
          <li><strong>CKD (KDIGO 2012):</strong> TSAT ≤20% + フェリチン ≤100 ng/mL で鉄補充を検討。</li>
          <li><strong>心不全 HFrEF (ESC 2021):</strong> TSAT &lt;20% または フェリチン &lt;100 ng/mL で鉄欠乏、症候性なら静注鉄投与検討。</li>
          <li><strong>妊娠中:</strong> TSAT &lt;20% + フェリチン &lt;30 ng/mL は鉄欠乏、産科ガイドラインに準拠。</li>
        </ul>

        <p><strong>フェリチンの解釈上の注意:</strong> フェリチンは急性期反応物質のため、炎症・感染・悪性腫瘍・肝疾患で偽性上昇。TSAT 低値 + フェリチン正常〜高値でも「機能的鉄欠乏」の可能性を考慮してください。</p>

        <p><strong>関連ツール:</strong> 小球性貧血の鑑別には <a href="./mentzer">Mentzer index</a> を併用してください。</p>
      </div>
    </div>
  );
}
