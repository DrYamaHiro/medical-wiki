import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import { VACCINE_LIST, CLINICS, DATA_LAST_UPDATED, DATA_FISCAL_YEAR } from './vaccineData';

/**
 * ワクチン料金計算ツール
 *
 * 拠点選択 → ワクチン選択 → 自治体選択 → 窓口負担・請求金額を自動表示
 */

const NO_CONTRACT = '__NO_CONTRACT__';
const EXEMPT = '__EXEMPT__';

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

const infoBoxStyle = {
  padding: '0.5rem 0.8rem',
  marginBottom: '1rem',
  borderRadius: 6,
  background: 'var(--ifm-color-emphasis-100)',
  fontSize: '0.82rem',
  color: 'var(--ifm-color-emphasis-600)',
};

function fmt(n) {
  if (n === 'TBD') return '未決定';
  if (n === null || n === undefined) return '要確認';
  return n.toLocaleString() + '円';
}

function isTBD(n) { return n === 'TBD'; }

export default function VaccineBillingCalculator() {
  const [clinicId, setClinicId] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isExempt, setIsExempt] = useState(false);

  const clinic = useMemo(() =>
    CLINICS.find(c => c.id === clinicId) || null, [clinicId]);

  // 選択した拠点で利用可能なワクチン（契約がある or selfPayがある）
  const availableVaccines = useMemo(() => {
    if (!clinicId) return VACCINE_LIST;
    return VACCINE_LIST;
  }, [clinicId]);

  const vaccine = useMemo(() =>
    VACCINE_LIST.find(v => v.name === vaccineName) || null, [vaccineName]);

  // この拠点・このワクチンの契約自治体リスト
  const contracts = useMemo(() => {
    if (!vaccine || !clinicId) return [];
    return vaccine.billing[clinicId] || [];
  }, [vaccine, clinicId]);

  const matched = useMemo(() => {
    if (!selectedCity || selectedCity === NO_CONTRACT) return null;
    return contracts.find(c => c.city === selectedCity) || null;
  }, [contracts, selectedCity]);

  const hasContract = matched !== null;
  const isNoContract = selectedCity === NO_CONTRACT;
  const showResult = vaccine && selectedCity;

  // 表示する金額
  const copay = hasContract
    ? (isExempt && matched.copayExempt !== undefined ? matched.copayExempt : matched.copay)
    : vaccine?.selfPay ?? null;
  const claim = hasContract
    ? (isExempt && matched.claimExempt !== undefined ? matched.claimExempt : matched.claim)
    : null;

  const reset = () => {
    setClinicId('');
    setVaccineName('');
    setSelectedCity('');
    setIsExempt(false);
  };

  // カテゴリでグループ化
  const categories = useMemo(() => {
    const cats = [];
    const seen = new Set();
    for (const v of availableVaccines) {
      if (!seen.has(v.category)) {
        seen.add(v.category);
        cats.push(v.category);
      }
    }
    return cats;
  }, [availableVaccines]);

  return (
    <div className={styles.calc} style={{ maxWidth: 620 }}>
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

      <div className={styles.calcBody}>
        {/* Step 1: 拠点選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>① 拠点</label>
          <select
            value={clinicId}
            onChange={e => { setClinicId(e.target.value); setVaccineName(''); setSelectedCity(''); setIsExempt(false); }}
            style={selectStyle}
          >
            <option value="">-- 拠点を選択 --</option>
            {CLINICS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}（{c.municipality}）
              </option>
            ))}
          </select>
        </div>

        {/* 拠点の注意事項 */}
        {clinic && clinic.notice && (
          <div style={{
            padding: '0.5rem 0.8rem',
            marginBottom: '1rem',
            borderRadius: 6,
            background: '#FFF3E0',
            fontSize: '0.85rem',
            color: '#E65100',
            fontWeight: 600,
          }}>
            {clinic.notice}
          </div>
        )}

        {/* Step 2: ワクチン選択 */}
        {clinicId && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>② ワクチン</label>
            <select
              value={vaccineName}
              onChange={e => { setVaccineName(e.target.value); setSelectedCity(''); setIsExempt(false); }}
              style={selectStyle}
            >
              <option value="">-- ワクチンを選択 --</option>
              {categories.map(cat => (
                <optgroup key={cat} label={cat}>
                  {availableVaccines.filter(v => v.category === cat).map(v => {
                    const bc = v.billing[clinicId] || [];
                    const tag = bc.length > 0 ? '公費あり' : '自費';
                    return (
                      <option key={v.name} value={v.name}>
                        {v.name} [{tag}]
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* ワクチン備考 */}
        {vaccine && <div style={infoBoxStyle}>{vaccine.notes}</div>}

        {/* Step 3: 自治体選択 */}
        {vaccine && clinicId && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>③ 患者の居住自治体</label>
            {contracts.length > 0 ? (
              <select
                value={selectedCity}
                onChange={e => { setSelectedCity(e.target.value); setIsExempt(false); }}
                style={selectStyle}
              >
                <option value="">-- 自治体を選択 --</option>
                {contracts.map(c => (
                  <option key={c.city} value={c.city}>
                    {c.city}（公費あり）
                  </option>
                ))}
                <option value={NO_CONTRACT}>その他（契約なし・全額自費）</option>
              </select>
            ) : (
              <div style={{ ...infoBoxStyle, background: '#FFF3E0', color: '#E65100', fontWeight: 600 }}>
                この拠点ではこのワクチンの公費契約はありません → 全額自費
              </div>
            )}
          </div>
        )}

        {/* 減免チェック */}
        {hasContract && matched.copayExempt !== undefined && (
          <div className={styles.inputGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isExempt}
                onChange={e => setIsExempt(e.target.checked)}
                className={styles.checkbox}
              />
              <span style={{ fontSize: '0.9rem' }}>
                {matched.exemptNote || '生活保護・非課税世帯'}（減免対象）
              </span>
            </label>
          </div>
        )}
      </div>

      {/* ===== 未決定バナー ===== */}
      {showResult && (isTBD(copay) || isTBD(claim) || (isNoContract && isTBD(vaccine.selfPay))) && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.6rem 0.8rem',
          borderRadius: 6,
          background: '#FFF3E0',
          border: '1px solid #FFB74D',
          fontSize: '0.82rem',
          color: '#E65100',
          fontWeight: 600,
        }}>
          ⚠ この項目の料金はまだ確定していません（シーズン前 or 自治体未公表）。確定次第データを更新します。
        </div>
      )}

      {/* ===== 結果表示 ===== */}
      {showResult && (
        <div className={styles.result}>
          {/* 窓口負担 */}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>窓口負担（患者支払額）</span>
            <span className={styles.resultValue} style={{
              color: copay === 0 ? '#2E7D32' : undefined,
            }}>
              {isNoContract
                ? (vaccine.selfPay != null ? fmt(vaccine.selfPay) : '要確認（設定価格）')
                : fmt(copay)}
            </span>
          </div>

          {/* 請求金額 */}
          {hasContract && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>
                自治体請求金額
                <span style={{ fontSize: '0.75rem', marginLeft: 4 }}>
                  （{matched.city}）
                </span>
              </span>
              <span className={styles.resultValue} style={{ color: '#1565C0' }}>
                {fmt(claim)}
              </span>
            </div>
          )}

          {/* 条件 */}
          {hasContract && matched.conditions && (
            <div className={styles.resultRow} style={{ padding: '0.3rem 1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-500)' }}>
                条件: {matched.conditions}
              </span>
            </div>
          )}

          {/* 償還払い注記 */}
          {hasContract && matched.isReimbursement && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#FFF8E1',
              fontSize: '0.8rem',
              color: '#F57F17',
              fontWeight: 600,
            }}>
              ⚠ 窓口では全額自費で徴収。患者が後日、領収書+明細書で市に助成金申請するフローです
            </div>
          )}

          {/* 判定バー */}
          <div className={styles.resultJudge} style={{
            background: hasContract ? '#1565C0' : '#E65100',
            fontSize: '1.1rem',
          }}>
            {isNoContract ? (
              <>
                全額自費: {vaccine.selfPay != null ? fmt(vaccine.selfPay) : '要確認'}
              </>
            ) : hasContract ? (
              <>
                窓口: {fmt(copay)} ／ 請求: {fmt(claim)}
                {isExempt && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: 2 }}>
                    減免適用
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* 契約なし＆自費も未設定の場合 */}
      {vaccine && clinicId && contracts.length === 0 && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#E65100' }}>
            全額自費: {vaccine.selfPay != null ? fmt(vaccine.selfPay) : '要確認（設定価格）'}
          </div>
        </div>
      )}

      {/* 契約自治体一覧テーブル */}
      {vaccine && clinicId && contracts.length > 0 && (
        <div style={{ padding: '0.5rem 1.2rem 1rem' }}>
          <details>
            <summary style={{
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              color: 'var(--ifm-color-primary)',
            }}>
              {clinic?.name} 契約自治体一覧（{contracts.length}件）
            </summary>
            <table className={styles.judgeTable} style={{ marginTop: '0.5rem' }}>
              <thead>
                <tr>
                  <th>自治体</th>
                  <th>窓口負担</th>
                  <th>請求金額</th>
                  <th>条件</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.city} className={
                    matched && matched.city === c.city ? styles.active : ''
                  }>
                    <td>{c.city}</td>
                    <td>{fmt(c.copay)}</td>
                    <td>{fmt(c.claim)}</td>
                    <td style={{ fontSize: '0.72rem' }}>{c.conditions || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}

      {/* フッター */}
      <div className={styles.note}>
        <strong>注意:</strong> 料金は{DATA_FISCAL_YEAR}時点です。
        「要確認」はデータ未入力です。<br/>
        <strong>データ編集:</strong>{' '}
        <code>vaccineData.js</code> を編集してワクチン・料金・契約自治体を更新してください。
      </div>
    </div>
  );
}
