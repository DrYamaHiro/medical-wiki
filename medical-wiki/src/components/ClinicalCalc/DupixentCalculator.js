import React, { useState, useMemo, useCallback } from 'react';
import styles from './styles.module.css';

/**
 * デュピクセント（デュピルマブ）投与量計算ツール
 *
 * 適応症:
 *   1. アトピー性皮膚炎（AD）
 *   2. 気管支喘息
 *   3. 鼻茸を伴う慢性副鼻腔炎（CRSwNP）
 *   4. 結節性痒疹
 *
 * 投与量は適応症・年齢・体重で決定（添付文書 2024年改訂版準拠）
 */

const INDICATIONS = [
  { key: 'ad', label: 'アトピー性皮膚炎' },
  { key: 'asthma', label: '気管支喘息' },
  { key: 'crsnp', label: '鼻茸を伴う慢性副鼻腔炎' },
  { key: 'pn', label: '結節性痒疹' },
];

const AGE_GROUPS = [
  { key: 'adult', label: '成人（15歳以上）' },
  { key: 'child_12_14', label: '12〜14歳' },
  { key: 'child_6_11', label: '6〜11歳' },
  { key: 'child_6m_5', label: '生後6ヶ月〜5歳' },
];

/**
 * 投与量決定ロジック（添付文書準拠）
 * 返値: { loading, loadingNote, maintenance, interval, pen, notes }
 */
function calcDose(indication, ageGroup, weight) {
  const w = parseFloat(weight);

  // === アトピー性皮膚炎 ===
  if (indication === 'ad') {
    if (ageGroup === 'adult' || ageGroup === 'child_12_14') {
      if (w && w >= 60) {
        return {
          loading: 600, loadingNote: '（300mg×2本を2箇所に注射）',
          maintenance: 300, interval: 2, pen: '300mgペン',
          notes: '初回のみ600mg、以降300mg 2週間隔',
        };
      }
      if (w && w >= 30) {
        return {
          loading: 400, loadingNote: '（200mg×2本を2箇所に注射）',
          maintenance: 200, interval: 2, pen: '200mgペン',
          notes: '初回のみ400mg、以降200mg 2週間隔',
        };
      }
      // 30kg未満の12-14歳は小児扱い
    }
    if (ageGroup === 'child_6_11' || (ageGroup === 'child_12_14' && w && w < 30)) {
      if (w && w >= 60) {
        return {
          loading: 600, loadingNote: '（300mg×2本）',
          maintenance: 300, interval: 2, pen: '300mgペン',
          notes: '60kg以上: 成人と同量',
        };
      }
      if (w && w >= 30) {
        return {
          loading: 400, loadingNote: '（200mg×2本）',
          maintenance: 200, interval: 2, pen: '200mgペン',
          notes: '30-60kg: 初回400mg、以降200mg 2週間隔',
        };
      }
      if (w && w >= 15) {
        return {
          loading: 600, loadingNote: '（300mg×2本）',
          maintenance: 300, interval: 4, pen: '300mgペン',
          notes: '15-30kg: 初回600mg、以降300mg 4週間隔',
        };
      }
      if (w && w >= 5) {
        return {
          loading: 200, loadingNote: '（200mg×1本）',
          maintenance: 200, interval: 4, pen: '200mgペン',
          notes: '5-15kg: 初回200mg、以降200mg 4週間隔',
        };
      }
      return { error: '5kg未満は投与対象外' };
    }
    if (ageGroup === 'child_6m_5') {
      if (w && w >= 15) {
        return {
          loading: 300, loadingNote: '（300mg×1本）',
          maintenance: 300, interval: 4, pen: '300mgペン',
          notes: '15kg以上: 初回300mg、以降300mg 4週間隔',
        };
      }
      if (w && w >= 5) {
        return {
          loading: 200, loadingNote: '（200mg×1本）',
          maintenance: 200, interval: 4, pen: '200mgペン',
          notes: '5-15kg: 初回200mg、以降200mg 4週間隔',
        };
      }
      return { error: '5kg未満は投与対象外' };
    }
  }

  // === 気管支喘息 ===
  if (indication === 'asthma') {
    if (ageGroup === 'adult' || ageGroup === 'child_12_14') {
      // 標準用量
      const isHighDose = false; // UI上で選択させることも可能だが、まずは標準用量
      return {
        loading: 400, loadingNote: '（200mg×2本を2箇所に注射）',
        maintenance: 200, interval: 2, pen: '200mgペン',
        notes: '初回のみ400mg、以降200mg 2週間隔。経口ステロイド依存例や重症AD合併例では初回600mg→300mg q2wも考慮。',
      };
    }
    if (ageGroup === 'child_6_11') {
      if (w && w >= 30) {
        return {
          loading: null, loadingNote: '',
          maintenance: 200, interval: 2, pen: '200mgペン',
          notes: '30kg以上: 200mg 2週間隔（負荷投与なし）。100mg q2wも可。',
        };
      }
      if (w && w >= 15) {
        return {
          loading: null, loadingNote: '',
          maintenance: 100, interval: 2, pen: '200mgペン（半量使用）',
          notes: '15-30kg: 100mg 2週間隔（負荷投与なし）。200mgペンの半量を使用。',
        };
      }
      return { error: '15kg未満の小児喘息への適応なし' };
    }
    if (ageGroup === 'child_6m_5') {
      return { error: '6歳未満の喘息には適応なし（6歳以上が対象）' };
    }
  }

  // === 鼻茸を伴う慢性副鼻腔炎 ===
  if (indication === 'crsnp') {
    if (ageGroup === 'adult') {
      return {
        loading: null, loadingNote: '',
        maintenance: 300, interval: 2, pen: '300mgペン',
        notes: '300mg 2週間隔（負荷投与なし）。既存の鼻噴霧用ステロイドは継続。',
      };
    }
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  // === 結節性痒疹 ===
  if (indication === 'pn') {
    if (ageGroup === 'adult') {
      return {
        loading: 600, loadingNote: '（300mg×2本を2箇所に注射）',
        maintenance: 300, interval: 2, pen: '300mgペン',
        notes: '初回のみ600mg、以降300mg 2週間隔',
      };
    }
    return { error: '成人のみ適応（小児への適応なし）' };
  }

  return null;
}

export default function DupixentCalculator() {
  const [indication, setIndication] = useState('ad');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [weight, setWeight] = useState('');

  const needsWeight = useMemo(() => {
    if (indication === 'crsnp' || indication === 'pn') return false;
    if (indication === 'ad') return true;
    if (indication === 'asthma') return ageGroup === 'child_6_11' || ageGroup === 'child_12_14';
    return false;
  }, [indication, ageGroup]);

  const availableAgeGroups = useMemo(() => {
    if (indication === 'crsnp' || indication === 'pn') {
      return AGE_GROUPS.filter(a => a.key === 'adult');
    }
    if (indication === 'asthma') {
      return AGE_GROUPS.filter(a => a.key !== 'child_6m_5');
    }
    return AGE_GROUPS; // AD: 全年齢
  }, [indication]);

  const result = useMemo(() => {
    if (needsWeight && (!weight || parseFloat(weight) <= 0)) return null;
    return calcDose(indication, ageGroup, weight);
  }, [indication, ageGroup, weight, needsWeight]);

  const reset = useCallback(() => {
    setWeight('');
  }, []);

  const handleIndicationChange = useCallback((key) => {
    setIndication(key);
    setWeight('');
    // 成人以外が使えない適応ではadultに戻す
    if (key === 'crsnp' || key === 'pn') setAgeGroup('adult');
  }, []);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>デュピクセント（デュピルマブ）投与量</p>
          <p className={styles.calcSub}>添付文書 投与量早見表</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* 適応症選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>適応症</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {INDICATIONS.map((ind) => (
              <button
                key={ind.key}
                className={`${styles.toggleBtn} ${indication === ind.key ? styles.toggleBtnActive : ''}`}
                onClick={() => handleIndicationChange(ind.key)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* 年齢選択 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>年齢区分</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {availableAgeGroups.map((ag) => (
              <button
                key={ag.key}
                className={`${styles.toggleBtn} ${ageGroup === ag.key ? styles.toggleBtnActive : ''}`}
                onClick={() => { setAgeGroup(ag.key); setWeight(''); }}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}
              >
                {ag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 体重入力 */}
        {needsWeight && (
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              体重 <span className={styles.inputUnit}>(kg)</span>
            </label>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.inputField}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例: 65"
                min="3"
                max="200"
                step="0.1"
              />
              <span className={styles.unitText}>kg</span>
            </div>
          </div>
        )}
      </div>

      {/* 結果表示 */}
      {result && !result.error && (
        <div className={styles.result}>
          {result.loading && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>初回（負荷投与）</span>
              <span className={styles.resultValue}>{result.loading}mg</span>
            </div>
          )}
          {result.loading && (
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>{result.loadingNote}</span>
            </div>
          )}
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>維持投与</span>
            <span className={styles.resultValue}>{result.maintenance}mg</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>投与間隔</span>
            <span className={styles.resultValue}>{result.interval}週間隔</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>使用製剤</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{result.pen}</span>
          </div>
          <div className={styles.resultJudge} style={{ background: '#1565c0' }}>
            {result.notes}
          </div>
        </div>
      )}

      {result && result.error && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#c62828' }}>
            {result.error}
          </div>
        </div>
      )}

      {!result && needsWeight && (
        <div className={styles.result}>
          <div className={styles.resultJudge} style={{ background: '#757575' }}>
            体重を入力してください
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className={styles.note}>
        <strong>注意事項:</strong><br />
        ・自己注射指導を実施し、十分な教育訓練を行ってから在宅自己注射に移行<br />
        ・注射部位: 腹部・大腿部・上腕外側（毎回異なる部位に注射）<br />
        ・冷蔵保存（2-8℃）。使用前に室温に45分以上戻す<br />
        ・結膜炎（特にAD）の発現に注意（約10-20%）<br />
        ・投与開始後も外用療法（ステロイド外用・保湿等）は継続<br />
        ・喘息: 経口ステロイドの急な中止は禁忌（漸減すること）
      </div>
    </div>
  );
}
