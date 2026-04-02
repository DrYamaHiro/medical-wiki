import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import { VACCINE_DATA, DATA_LAST_UPDATED, DATA_FISCAL_YEAR } from './vaccineData';

/**
 * ワクチン料金計算ツール
 *
 * ワクチン選択 → 自治体選択（契約自治体 or 未契約） → 請求額・自己負担額を自動計算
 */

const NO_CONTRACT = '__NO_CONTRACT__';

const selectStyle = {
  width: '100%',
  padding: '0.5rem 0.7rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  border: '2px solid var(--ifm-color-emphasis-300)',
  borderRadius: 6,
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
};

export default function VaccineBillingCalculator() {
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const vaccine = useMemo(() => {
    if (!selectedVaccine) return null;
    return VACCINE_DATA.find(v => v.name === selectedVaccine) || null;
  }, [selectedVaccine]);

  const matchedContract = useMemo(() => {
    if (!vaccine || !selectedCity || selectedCity === NO_CONTRACT) return null;
    return vaccine.contracts.find(c => c.city === selectedCity) || null;
  }, [vaccine, selectedCity]);

  const hasContract = matchedContract !== null;
  const isNoContract = selectedCity === NO_CONTRACT;
  const subsidy = hasContract ? matchedContract.subsidy : 0;
  const patientPay = vaccine ? Math.max(0, vaccine.clinicPrice - subsidy) : 0;
  const showResult = vaccine && selectedCity;

  const reset = () => {
    setSelectedVaccine('');
    setSelectedCity('');
  };

  return (
    <div className={styles.calc} style={{ maxWidth: 600 }}>
      {/* ヘッダー */}
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>ワクチン料金計算</h3>
          <p className={styles.calcSub}>
            {DATA_FISCAL_YEAR} / データ更新: {DATA_LAST_UPDATED}
          </p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      {/* 入力セクション */}
      <div className={styles.calcBody}>
        {/* ワクチン選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>ワクチン選択</label>
          <select
            value={selectedVaccine}
            onChange={e => { setSelectedVaccine(e.target.value); setSelectedCity(''); }}
            style={selectStyle}
          >
            <option value="">-- ワクチンを選択 --</option>
            {VACCINE_DATA.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* ワクチン情報 */}
        {vaccine && (
          <>
            <div style={{
              padding: '0.5rem 0.8rem',
              marginBottom: '1rem',
              borderRadius: 6,
              background: 'var(--ifm-color-emphasis-100)',
              fontSize: '0.82rem',
              color: 'var(--ifm-color-emphasis-600)',
            }}>
              {vaccine.notes}
            </div>

            {/* 自治体選択 */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                患者の居住自治体
              </label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- 自治体を選択 --</option>
                {vaccine.contracts.map(c => (
                  <option key={c.city} value={c.city}>
                    {c.city}（助成あり: {c.subsidy.toLocaleString()}円）
                  </option>
                ))}
                <option value={NO_CONTRACT}>
                  その他（契約なし・全額自費）
                </option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* 結果表示 */}
      {showResult && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>接種料金（税込）</span>
            <span className={styles.resultValue}>
              {vaccine.clinicPrice.toLocaleString()}円
            </span>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>
              自治体助成
              {hasContract && (
                <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>
                  （{matchedContract.city}）
                </span>
              )}
            </span>
            <span className={styles.resultValue} style={{
              color: hasContract ? '#2E7D32' : 'var(--ifm-color-emphasis-400)',
            }}>
              {hasContract ? `−${subsidy.toLocaleString()}円` : 'なし'}
            </span>
          </div>

          {hasContract && matchedContract.conditions && (
            <div className={styles.resultRow} style={{ padding: '0.3rem 1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
                助成条件: {matchedContract.conditions}
                {matchedContract.residentOnly && ' ※住民のみ対象'}
              </span>
            </div>
          )}

          <div className={styles.resultJudge} style={{
            background: hasContract ? '#1565C0' : '#E65100',
            fontSize: '1.2rem',
          }}>
            患者自己負担: {patientPay.toLocaleString()}円
            {isNoContract && (
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 2 }}>
                契約なし → 全額自費
              </div>
            )}
            {hasContract && patientPay === 0 && (
              <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 2 }}>
                公費全額助成
              </div>
            )}
          </div>
        </div>
      )}

      {/* 契約自治体一覧テーブル（常に表示） */}
      {vaccine && vaccine.contracts.length > 0 && (
        <div style={{ padding: '0.5rem 1.2rem 1rem' }}>
          <details>
            <summary style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--ifm-color-primary)',
            }}>
              契約自治体一覧（{vaccine.contracts.length}件）
            </summary>
            <table className={styles.judgeTable} style={{ marginTop: '0.5rem' }}>
              <thead>
                <tr>
                  <th>自治体</th>
                  <th>助成額</th>
                  <th>条件</th>
                  <th>自己負担</th>
                </tr>
              </thead>
              <tbody>
                {vaccine.contracts.map(c => (
                  <tr key={c.city} className={
                    matchedContract && matchedContract.city === c.city ? styles.active : ''
                  }>
                    <td>{c.city}</td>
                    <td>{c.subsidy.toLocaleString()}円</td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {c.conditions}
                      {c.residentOnly && ' (住民のみ)'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {Math.max(0, vaccine.clinicPrice - c.subsidy).toLocaleString()}円
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}

      {vaccine && vaccine.contracts.length === 0 && (
        <div className={styles.note}>
          このワクチンは全額自費です。自治体助成の契約はありません。
        </div>
      )}

      {/* フッター */}
      <div className={styles.note}>
        <strong>注意:</strong> 料金は{DATA_FISCAL_YEAR}時点のものです。
        助成額・対象条件は自治体により異なり、年度途中で変更される場合があります。
        不明な場合は患者の居住自治体に直接お問い合わせください。<br/>
        <strong>データ編集:</strong> ワクチンの追加・料金変更・契約自治体の更新は{' '}
        <code>vaccineData.js</code> を編集してください。
      </div>
    </div>
  );
}
