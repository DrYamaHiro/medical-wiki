import React, { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.css';

const SERIES_A = ['桜', '猫', '電車'];
const SERIES_B = ['梅', '犬', '自動車'];

export default function HDSRCalculator() {
  const [series, setSeries] = useState('A');
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState({ year: null, month: null, day: null, dow: null });
  const [q3, setQ3] = useState(null);
  const [q4, setQ4] = useState([null, null, null]);
  const [q5, setQ5] = useState({ a: null, b: null });
  const [q6, setQ6] = useState({ a: null, b: null });
  const [q7, setQ7] = useState([null, null, null]);
  const [q8, setQ8] = useState([null, null, null, null, null]);
  const [q9, setQ9] = useState(null);

  const reset = useCallback(() => {
    setQ1(null);
    setQ2({ year: null, month: null, day: null, dow: null });
    setQ3(null);
    setQ4([null, null, null]);
    setQ5({ a: null, b: null });
    setQ6({ a: null, b: null });
    setQ7([null, null, null]);
    setQ8([null, null, null, null, null]);
    setQ9(null);
  }, []);

  const allAnswered = useMemo(() => {
    return (
      q1 !== null &&
      q2.year !== null && q2.month !== null && q2.day !== null && q2.dow !== null &&
      q3 !== null &&
      q4.every(v => v !== null) &&
      q5.a !== null && q5.b !== null &&
      q6.a !== null && q6.b !== null &&
      q7.every(v => v !== null) &&
      q8.every(v => v !== null) &&
      q9 !== null
    );
  }, [q1, q2, q3, q4, q5, q6, q7, q8, q9]);

  const score = useMemo(() => {
    if (!allAnswered) return null;
    let s = 0;
    s += q1;
    s += q2.year + q2.month + q2.day + q2.dow;
    s += q3;
    s += q4.reduce((a, b) => a + b, 0);
    s += q5.a + q5.b;
    s += q6.a + q6.b;
    s += q7.reduce((a, b) => a + b, 0);
    s += q8.reduce((a, b) => a + b, 0);
    s += q9;
    return s;
  }, [allAnswered, q1, q2, q3, q4, q5, q6, q7, q8, q9]);

  const judge = score !== null
    ? score >= 21
      ? { text: '正常範囲', color: '#2E7D32' }
      : { text: '認知症の疑い — 専門的な精査を推奨', color: '#C62828' }
    : null;

  const words = series === 'A' ? SERIES_A : SERIES_B;

  const BtnRow = ({ label, value, setter, options }) => (
    <div className={styles.inputGroup}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.toggleGroup}>
        {options.map(opt => (
          <button
            key={opt.label}
            className={`${styles.toggleBtn} ${value === opt.value ? styles.toggleBtnActive : ''}`}
            onClick={() => setter(value === opt.value ? null : opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const setQ4Item = (idx, val) => setQ4(prev => { const n = [...prev]; n[idx] = n[idx] === val ? null : val; return n; });
  const setQ7Item = (idx, val) => setQ7(prev => { const n = [...prev]; n[idx] = n[idx] === val ? null : val; return n; });
  const setQ8Item = (idx, val) => setQ8(prev => { const n = [...prev]; n[idx] = n[idx] === val ? null : val; return n; });

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>HDS-R</p>
          <p className={styles.calcSub}>長谷川式簡易知能評価スケール改訂版</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        {/* Q1 年齢 */}
        <BtnRow
          label="1. お歳はいくつですか?（±2歳まで正解）"
          value={q1}
          setter={setQ1}
          options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
        />

        {/* Q2 日時の見当識 */}
        <div style={{ marginBottom: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
          2. 今日は何年の何月何日ですか? 何曜日ですか?
        </div>
        {[
          { label: '年', key: 'year' },
          { label: '月', key: 'month' },
          { label: '日', key: 'day' },
          { label: '曜日', key: 'dow' },
        ].map(item => (
          <BtnRow
            key={item.key}
            label={`　${item.label}`}
            value={q2[item.key]}
            setter={val => setQ2(prev => ({ ...prev, [item.key]: prev[item.key] === val ? null : val }))}
            options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
          />
        ))}

        {/* Q3 場所の見当識 */}
        <BtnRow
          label="3. 私たちがいるところはどこですか?"
          value={q3}
          setter={setQ3}
          options={[
            { label: '自発的回答 (2点)', value: 2 },
            { label: '5択から選択 (1点)', value: 1 },
            { label: '不正解 (0点)', value: 0 },
          ]}
        />

        {/* Q4 3つの言葉の記銘 */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>4. 3つの言葉の記銘（系列選択）</label>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${series === 'A' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setSeries('A'); setQ4([null, null, null]); setQ7([null, null, null]); }}
            >
              系列A（桜・猫・電車）
            </button>
            <button
              className={`${styles.toggleBtn} ${series === 'B' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setSeries('B'); setQ4([null, null, null]); setQ7([null, null, null]); }}
            >
              系列B（梅・犬・自動車）
            </button>
          </div>
        </div>
        {words.map((w, i) => (
          <BtnRow
            key={`q4-${i}`}
            label={`　「${w}」`}
            value={q4[i]}
            setter={val => setQ4Item(i, val)}
            options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
          />
        ))}

        {/* Q5 計算 */}
        <div style={{ marginBottom: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
          5. 100から7を順番に引いてください
        </div>
        <BtnRow
          label="　100 - 7 = 93"
          value={q5.a}
          setter={val => setQ5(prev => ({ ...prev, a: prev.a === val ? null : val }))}
          options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
        />
        <BtnRow
          label="　93 - 7 = 86"
          value={q5.b}
          setter={val => setQ5(prev => ({ ...prev, b: prev.b === val ? null : val }))}
          options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
        />

        {/* Q6 数字の逆唱 */}
        <div style={{ marginBottom: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
          6. 数字の逆唱
        </div>
        <BtnRow
          label="　6-8-2 → 2-8-6"
          value={q6.a}
          setter={val => setQ6(prev => ({ ...prev, a: prev.a === val ? null : val }))}
          options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
        />
        <BtnRow
          label="　3-5-2-9 → 9-2-5-3"
          value={q6.b}
          setter={val => setQ6(prev => ({ ...prev, b: prev.b === val ? null : val }))}
          options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
        />

        {/* Q7 遅延再生 */}
        <div style={{ marginBottom: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
          7. 先ほどの3つの言葉の再生
        </div>
        {words.map((w, i) => (
          <BtnRow
            key={`q7-${i}`}
            label={`　「${w}」`}
            value={q7[i]}
            setter={val => setQ7Item(i, val)}
            options={[
              { label: '自発的 (2点)', value: 2 },
              { label: 'ヒント後 (1点)', value: 1 },
              { label: '不正解 (0点)', value: 0 },
            ]}
          />
        ))}

        {/* Q8 5つの品物 */}
        <div style={{ marginBottom: '0.3rem', fontWeight: 700, fontSize: '0.9rem' }}>
          8. 5つの品物の記銘（何があったか）
        </div>
        {['品物1', '品物2', '品物3', '品物4', '品物5'].map((label, i) => (
          <BtnRow
            key={`q8-${i}`}
            label={`　${label}`}
            value={q8[i]}
            setter={val => setQ8Item(i, val)}
            options={[{ label: '正解 (1点)', value: 1 }, { label: '不正解 (0点)', value: 0 }]}
          />
        ))}

        {/* Q9 野菜の名前 */}
        <BtnRow
          label="9. 知っている野菜の名前（言えた個数）"
          value={q9}
          setter={setQ9}
          options={[
            { label: '0-5個 (0点)', value: 0 },
            { label: '6個 (1点)', value: 1 },
            { label: '7個 (2点)', value: 2 },
            { label: '8個 (3点)', value: 3 },
            { label: '9個 (4点)', value: 4 },
            { label: '10個以上 (5点)', value: 5 },
          ]}
        />
      </div>

      {judge && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>合計スコア</span>
            <span className={styles.resultValue}>{score} / 30 点</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> 21-30点: 正常範囲 / 20点以下: 認知症の疑い<br />
        <strong>注:</strong> 20点以下では認知症の疑いがあり、専門的な精査を推奨します。
        カットオフ値は20/21点です。
      </div>
    </div>
  );
}
