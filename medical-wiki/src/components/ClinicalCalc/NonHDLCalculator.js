import React, { useState, useMemo } from 'react';
import styles from './styles.module.css';
import PsychCopyBox from './PsychCopyBox';

/**
 * non-HDL-C 計算ツール
 *
 * 算出経路（優先順位順、入力が揃った経路を自動選択）:
 *   経路1: non-HDL-C = TC − HDL-C          … 定義式。最も正確。TG 値に依存しない
 *   経路2: non-HDL-C = LDL-C + TG/5        … Friedewald 式の逆算。TG < 400 mg/dL でのみ有効
 *
 * 判定（日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022）:
 *   non-HDL-C < 150     正常域
 *   150 ≦ non-HDL < 170 境界域高non-HDL-C血症
 *   non-HDL-C ≧ 170     高non-HDL-C血症
 *
 * リスク区分別管理目標（non-HDL-C 目標 = LDL-C 目標 + 30 mg/dL）
 */

const RISK_CATEGORIES = [
  { key: 'none', label: '未選択', ldl: null, nonhdl: null, note: '' },
  { key: 'low', label: '一次予防 低リスク', ldl: 160, nonhdl: 190, note: '久山町スコアによる低リスク' },
  { key: 'mid', label: '一次予防 中リスク', ldl: 140, nonhdl: 170, note: '久山町スコアによる中リスク' },
  { key: 'high', label: '一次予防 高リスク', ldl: 120, nonhdl: 150, note: '糖尿病・CKD・末梢動脈疾患・非心原性脳梗塞など' },
  { key: 'sec', label: '二次予防', ldl: 100, nonhdl: 130, note: '冠動脈疾患またはアテローム血栓性脳梗塞の既往' },
  { key: 'sec2', label: '二次予防（高リスク病態）', ldl: 70, nonhdl: 100, note: '急性冠症候群・家族性高コレステロール血症・糖尿病合併・冠動脈疾患とアテローム血栓性脳梗塞の合併' },
];

function getJudgment(v) {
  if (v < 150) return { text: '正常域', sub: 'non-HDL-C 150 mg/dL 未満', color: '#2E7D32' };
  if (v < 170) return { text: '境界域高non-HDL-C血症', sub: 'non-HDL-C 150〜169 mg/dL', color: '#F9A825' };
  return { text: '高non-HDL-C血症', sub: 'non-HDL-C 170 mg/dL 以上', color: '#C62828' };
}

export default function NonHDLCalculator() {
  const [tc, setTc] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');
  const [tg, setTg] = useState('');
  const [risk, setRisk] = useState('none');

  const tcVal = parseFloat(tc);
  const hdlVal = parseFloat(hdl);
  const ldlVal = parseFloat(ldl);
  const tgVal = parseFloat(tg);

  const ok = (v) => isFinite(v) && v > 0;
  const tgOver400 = isFinite(tgVal) && tgVal >= 400;

  // 算出経路を自動選択
  const calc = useMemo(() => {
    // 経路1: TC − HDL（定義式、最優先）
    if (ok(tcVal) && ok(hdlVal)) {
      return {
        value: tcVal - hdlVal,
        route: 'definition',
        formula: `non-HDL-C = TC ${tcVal} − HDL-C ${hdlVal}`,
        label: '定義式（TC − HDL-C）',
        caveat: null,
      };
    }
    // 経路2: LDL + TG/5（Friedewald 逆算）
    if (ok(ldlVal) && isFinite(tgVal) && tgVal >= 0) {
      if (tgVal >= 400) {
        return {
          value: null,
          route: 'friedewald',
          formula: null,
          label: 'Friedewald 逆算（TG − 使用不可）',
          caveat: 'TG 400 mg/dL 以上では Friedewald 式が成立しないため、この経路では算出できません。TC と HDL-C を入力してください。',
        };
      }
      return {
        value: ldlVal + tgVal / 5,
        route: 'friedewald',
        formula: `non-HDL-C = LDL-C ${ldlVal} + TG ${tgVal} ÷ 5`,
        label: 'Friedewald 逆算（LDL-C + TG/5）',
        caveat: 'Friedewald 式からの逆算値です。TC と HDL-C が測定されていれば、そちらの定義式による算出がより正確です。',
      };
    }
    return { value: null, route: null, formula: null, label: null, caveat: null };
  }, [tcVal, hdlVal, ldlVal, tgVal]);

  // 不足している入力の案内
  const missingHint = useMemo(() => {
    if (calc.value !== null) return null;
    if (calc.route === 'friedewald' && calc.caveat) return null; // TG≥400 の警告を優先
    const have = [];
    if (ok(tcVal)) have.push('TC');
    if (ok(hdlVal)) have.push('HDL-C');
    if (ok(ldlVal)) have.push('LDL-C');
    if (isFinite(tgVal) && tgVal >= 0) have.push('TG');
    if (have.length === 0) return '検査値を入力してください。「TC + HDL-C」または「LDL-C + TG」のどちらかが揃えば算出できます。';
    return `現在の入力: ${have.join('・')}。あと「TC + HDL-C」または「LDL-C + TG」のいずれかの組み合わせが揃うと算出できます。`;
  }, [calc, tcVal, hdlVal, ldlVal, tgVal]);

  // 参考: 他の値も算出できる場合は補助表示
  const derived = useMemo(() => {
    const d = [];
    // LDL-C（Friedewald）が計算できる場合
    if (ok(tcVal) && ok(hdlVal) && isFinite(tgVal) && tgVal >= 0 && tgVal < 400 && !ok(ldlVal)) {
      d.push({ label: 'LDL-C（Friedewald 式で参考算出）', value: (tcVal - hdlVal - tgVal / 5).toFixed(0), unit: 'mg/dL' });
    }
    // TC が計算できる場合
    if (!ok(tcVal) && ok(ldlVal) && ok(hdlVal) && isFinite(tgVal) && tgVal >= 0 && tgVal < 400) {
      d.push({ label: 'TC（Friedewald 逆算で参考算出）', value: (ldlVal + hdlVal + tgVal / 5).toFixed(0), unit: 'mg/dL' });
    }
    return d;
  }, [tcVal, hdlVal, ldlVal, tgVal]);

  const judge = calc.value !== null ? getJudgment(calc.value) : null;
  const riskObj = RISK_CATEGORIES.find((r) => r.key === risk);
  const target = riskObj && riskObj.nonhdl;
  const targetMet = calc.value !== null && target !== null && target !== undefined ? calc.value < target : null;

  const reset = () => { setTc(''); setHdl(''); setLdl(''); setTg(''); setRisk('none'); };

  const outputText = useMemo(() => {
    if (calc.value === null) return '';
    const lines = [];
    lines.push('【non-HDL-C 算出 __DATE__】');
    lines.push('');
    lines.push(`non-HDL-C: ${calc.value.toFixed(0)} mg/dL → ${judge.text}`);
    lines.push(`算出方法: ${calc.label}`);
    if (calc.formula) lines.push(`　${calc.formula}`);
    lines.push('');
    lines.push('■ 入力値');
    if (ok(tcVal)) lines.push(`  総コレステロール (TC): ${tcVal} mg/dL`);
    if (ok(hdlVal)) lines.push(`  HDL-C: ${hdlVal} mg/dL`);
    if (ok(ldlVal)) lines.push(`  LDL-C: ${ldlVal} mg/dL`);
    if (isFinite(tgVal)) lines.push(`  中性脂肪 (TG): ${tgVal} mg/dL`);
    derived.forEach((d) => lines.push(`  ${d.label}: ${d.value} ${d.unit}`));
    lines.push('');
    lines.push('■ 判定');
    lines.push(`${judge.text} (${judge.sub})`);
    if (riskObj && riskObj.nonhdl) {
      lines.push('');
      lines.push('■ 管理目標');
      lines.push(`リスク区分: ${riskObj.label}`);
      lines.push(`  non-HDL-C 目標: ${riskObj.nonhdl} mg/dL 未満 (LDL-C 目標 ${riskObj.ldl} mg/dL 未満 + 30)`);
      lines.push(`  現在値 ${calc.value.toFixed(0)} mg/dL → ${targetMet ? '目標達成' : '目標未達'}`);
    }
    if (calc.caveat) {
      lines.push('');
      lines.push(`※ ${calc.caveat}`);
    }
    if (tgOver400) {
      lines.push('※ TG 400 mg/dL 以上のため、Friedewald 式による LDL-C 推算は使用不可。non-HDL-C は TG の影響を受けにくく、この状況で有用な指標。');
    }
    lines.push('');
    lines.push('※ 日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022 に基づく。');
    return lines.join('\n');
  }, [calc, judge, riskObj, targetMet, tcVal, hdlVal, ldlVal, tgVal, derived, tgOver400]);

  const numField = (label, unit, value, setter, placeholder, hint) => (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>
        {label}
        <span className={styles.inputUnit}>{unit}</span>
      </label>
      <div className={styles.inputRow}>
        <input
          type="number"
          step="1"
          min="0"
          className={styles.inputField}
          value={value}
          onChange={(e) => setter(e.target.value)}
          placeholder={placeholder}
        />
        <span className={styles.unitText}>mg/dL</span>
      </div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.2rem' }}>{hint}</div>}
    </div>
  );

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <h3 className={styles.calcTitle}>non-HDL-C 計算</h3>
          <p className={styles.calcSub}>動脈硬化性疾患予防ガイドライン2022</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div style={{
          marginBottom: '0.8rem', padding: '0.6rem 0.8rem', background: '#e3f2fd',
          border: '1.5px solid #90caf9', borderRadius: '6px', fontSize: '0.82rem', color: '#0d47a1',
        }}>
          <strong>算出に必要な組み合わせ（どちらか一方で可）</strong><br />
          ① <strong>TC + HDL-C</strong> → 定義式 non-HDL-C = TC − HDL-C（最も正確、TG に依存しない）<br />
          ② <strong>LDL-C + TG</strong> → Friedewald 逆算 non-HDL-C = LDL-C + TG/5（TG &lt; 400 のみ）
        </div>

        {numField('総コレステロール（TC）', 'mg/dL', tc, setTc, '例: 220', '①の経路に使用')}
        {numField('HDL-C', 'mg/dL', hdl, setHdl, '例: 55', '①の経路に使用')}
        {numField('LDL-C', 'mg/dL', ldl, setLdl, '例: 130', '②の経路に使用（直接法・Friedewald 値いずれも可）')}
        {numField('中性脂肪（TG）', 'mg/dL', tg, setTg, '例: 150', '②の経路に使用')}

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>リスク区分（管理目標の判定用・任意）</label>
          <div className={styles.toggleGroup} style={{ flexWrap: 'wrap' }}>
            {RISK_CATEGORIES.map((r) => (
              <button
                key={r.key}
                className={`${styles.toggleBtn} ${risk === r.key ? styles.toggleBtnActive : ''}`}
                onClick={() => setRisk(r.key)}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                title={r.note}
              >
                {r.label}
              </button>
            ))}
          </div>
          {riskObj && riskObj.note && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.3rem' }}>
              {riskObj.note}
            </div>
          )}
        </div>
      </div>

      {/* 入力不足の案内 */}
      {missingHint && (
        <div style={{
          margin: '0 1.2rem 0.8rem', padding: '0.6rem 0.8rem', borderRadius: '6px',
          background: '#eceff1', border: '1px solid #b0bec5', fontSize: '0.82rem', color: '#37474f',
        }}>
          {missingHint}
        </div>
      )}

      {/* TG≥400 で Friedewald 経路が使えない場合 */}
      {calc.caveat && calc.value === null && (
        <div style={{
          margin: '0 1.2rem 0.8rem', padding: '0.6rem 0.8rem', borderRadius: '6px',
          background: '#FFEBEE', border: '1px solid #C62828', fontSize: '0.85rem',
          fontWeight: 600, color: '#B71C1C',
        }}>
          {calc.caveat}
        </div>
      )}

      {/* TG≥400 の一般警告（定義式で算出できている場合） */}
      {tgOver400 && calc.value !== null && (
        <div style={{
          margin: '0 1.2rem 0.8rem', padding: '0.6rem 0.8rem', borderRadius: '6px',
          background: '#FFF8E1', border: '1px solid #F9A825', fontSize: '0.82rem', color: '#8D6E00',
        }}>
          TG 400 mg/dL 以上のため Friedewald 式による LDL-C 推算は使用不可ですが、
          <strong>non-HDL-C は TG の影響を受けにくく、高TG血症例で特に有用な指標</strong>です。
        </div>
      )}

      {/* 結果 */}
      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>non-HDL-C</span>
          <span className={styles.resultValue}>
            {calc.value !== null ? calc.value.toFixed(0) : '---'}
            {calc.value !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.3rem' }}>mg/dL</span>
            )}
          </span>
        </div>
        {calc.value !== null && calc.label && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>算出方法</span>
            <span className={styles.resultValue} style={{ fontSize: '0.85rem' }}>{calc.label}</span>
          </div>
        )}
        {derived.map((d, i) => (
          <div className={styles.resultRow} key={i}>
            <span className={styles.resultLabel}>{d.label}</span>
            <span className={styles.resultValue} style={{ fontSize: '0.95rem' }}>{d.value} {d.unit}</span>
          </div>
        ))}
        {riskObj && riskObj.nonhdl && calc.value !== null && (
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>管理目標（{riskObj.label}）</span>
            <span className={styles.resultValue} style={{ fontSize: '0.95rem', color: targetMet ? '#2E7D32' : '#C62828' }}>
              &lt; {riskObj.nonhdl} mg/dL / {targetMet ? '達成' : '未達'}
            </span>
          </div>
        )}
        {judge && (
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{judge.sub}</span>
          </div>
        )}
      </div>

      {/* Friedewald 逆算時の注記 */}
      {calc.caveat && calc.value !== null && (
        <div style={{
          margin: '0 1.2rem 0.5rem', padding: '0.6rem 0.8rem', borderRadius: '6px',
          background: '#e8f4fd', border: '1px solid #64b5f6', fontSize: '0.8rem', color: '#0d47a1',
        }}>
          {calc.caveat}
        </div>
      )}

      <PsychCopyBox text={outputText} dateLabel="採血日" />

      <div className={styles.note}>
        <table className={styles.judgeTable}>
          <thead>
            <tr>
              <th>non-HDL-C</th>
              <th>判定</th>
            </tr>
          </thead>
          <tbody>
            <tr className={calc.value !== null && calc.value < 150 ? styles.active : ''}>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>150 未満</td>
              <td>正常域</td>
            </tr>
            <tr className={calc.value !== null && calc.value >= 150 && calc.value < 170 ? styles.active : ''}>
              <td style={{ color: '#F9A825', fontWeight: 700 }}>150 〜 169</td>
              <td>境界域高non-HDL-C血症</td>
            </tr>
            <tr className={calc.value !== null && calc.value >= 170 ? styles.active : ''}>
              <td style={{ color: '#C62828', fontWeight: 700 }}>170 以上</td>
              <td>高non-HDL-C血症</td>
            </tr>
          </tbody>
        </table>

        <p><strong>計算式:</strong></p>
        <ul style={{ marginTop: '0.2rem', paddingLeft: '1.2rem' }}>
          <li><strong>定義式:</strong> non-HDL-C = TC − HDL-C（TG 値に依存しないため最も正確）</li>
          <li><strong>Friedewald 逆算:</strong> non-HDL-C = LDL-C + TG/5（TG &lt; 400 mg/dL でのみ有効）</li>
        </ul>

        <p><strong>リスク区分別 管理目標</strong>（non-HDL-C 目標 = LDL-C 目標 + 30 mg/dL）:</p>
        <table className={styles.judgeTable}>
          <thead>
            <tr><th>リスク区分</th><th>LDL-C</th><th>non-HDL-C</th></tr>
          </thead>
          <tbody>
            <tr className={risk === 'low' ? styles.active : ''}><td>一次予防 低リスク</td><td>&lt; 160</td><td>&lt; 190</td></tr>
            <tr className={risk === 'mid' ? styles.active : ''}><td>一次予防 中リスク</td><td>&lt; 140</td><td>&lt; 170</td></tr>
            <tr className={risk === 'high' ? styles.active : ''}><td>一次予防 高リスク</td><td>&lt; 120</td><td>&lt; 150</td></tr>
            <tr className={risk === 'sec' ? styles.active : ''}><td>二次予防</td><td>&lt; 100</td><td>&lt; 130</td></tr>
            <tr className={risk === 'sec2' ? styles.active : ''}><td>二次予防（高リスク病態）</td><td>&lt; 70</td><td>&lt; 100</td></tr>
          </tbody>
        </table>

        <p>
          <strong>non-HDL-C の臨床的意義:</strong> LDL 以外のアテローム惹起性リポ蛋白（VLDL・IDL・レムナント・Lp(a) 等）をすべて含むため、
          特に<strong>高TG血症・食後採血・糖尿病・メタボリック症候群</strong>では LDL-C より病態を反映します。
          <strong>随時（非空腹時）採血でも評価可能</strong>な点も利点です。
        </p>
        <p>
          <strong>注意:</strong> TG 400 mg/dL 以上では Friedewald 式による LDL-C 推算が使用不可となりますが、
          non-HDL-C は TG の影響を受けにくいため、この状況でこそ有用な指標となります。
        </p>
        <p>日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022</p>
      </div>
    </div>
  );
}
