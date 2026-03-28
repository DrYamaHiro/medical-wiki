import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const ITEMS = [
  { key: 'cancer', label: '活動性の悪性腫瘍（治療中、6ヶ月以内、緩和的治療）', score: 1 },
  { key: 'paralysis', label: '下肢麻痺・不全麻痺、最近のギプス固定', score: 1 },
  { key: 'bedrest', label: '3日以上の臥床安静、または12週以内の全身/局所麻酔下の大手術', score: 1 },
  { key: 'tenderness', label: '下肢深部静脈の走行に沿った圧痛', score: 1 },
  { key: 'swelling', label: '下肢全体の腫脹', score: 1 },
  { key: 'calf', label: '患側の腓腹部周径が健側より3cm以上大きい', score: 1 },
  { key: 'edema', label: '患側の圧痕性浮腫', score: 1 },
  { key: 'vein', label: '患側の表在静脈の怒張（静脈瘤でない）', score: 1 },
  { key: 'history', label: 'DVTの既往', score: 1 },
  { key: 'alt', label: 'DVTと同等以上に考えられる他の診断がある', score: -2 },
];

function getTwoTier(score) {
  if (score <= 1) return { text: 'DVT unlikely', color: '#2E7D32' };
  return { text: 'DVT likely', color: '#C62828' };
}

function getJudgment(score) {
  if (score <= 0) {
    return { text: '低リスク（DVT確率5%）— D-dimer測定', color: '#2E7D32' };
  }
  if (score <= 2) {
    return { text: '中リスク（DVT確率17%）— D-dimer測定', color: '#F9A825' };
  }
  return { text: '高リスク（DVT確率53%）— エコー検査', color: '#C62828' };
}

export default function WellsDVTCalculator() {
  const initState = {};
  ITEMS.forEach((item) => { initState[item.key] = false; });

  const [checks, setChecks] = useState(initState);

  const toggle = useCallback((key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const reset = useCallback(() => {
    const s = {};
    ITEMS.forEach((item) => { s[item.key] = false; });
    setChecks(s);
  }, []);

  const score = ITEMS.reduce((sum, item) => sum + (checks[item.key] ? item.score : 0), 0);
  const twoTier = getTwoTier(score);
  const judgment = getJudgment(score);

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>Wells Score for DVT</p>
          <p className={styles.calcSub}>深部静脈血栓症 臨床的確率評価</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.checkList}>
          {ITEMS.map((item) => (
            <label
              key={item.key}
              className={`${styles.checkItem} ${checks[item.key] ? styles.checkItemActive : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checks[item.key]}
                onChange={() => toggle(item.key)}
              />
              <span className={styles.checkLabel}>{item.label}</span>
              <span className={styles.checkScore}>
                {item.score > 0 ? `+${item.score}` : item.score}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.result}>
        <div className={styles.resultRow}>
          <span className={styles.resultLabel}>合計スコア</span>
          <span className={styles.resultValue}>{score} 点</span>
        </div>
        <div className={styles.resultJudge} style={{ background: twoTier.color }}>
          【2段階分類】{twoTier.text}
        </div>
        <div className={styles.resultJudge} style={{ background: judgment.color, marginTop: '0.5rem' }}>
          【3段階分類】{judgment.text}
        </div>
      </div>

      <div className={styles.note}>
        <strong>2段階分類:</strong> 1点以下: DVT unlikely → D-dimer測定 / 2点以上: DVT likely → エコー検査<br />
        <strong>3段階分類:</strong> 0点以下: 低リスク（5%） / 1-2点: 中リスク（17%） / 3点以上: 高リスク（53%）<br />
        <strong>年齢調整D-dimerカットオフ:</strong> 50歳以上では 年齢 &times; 10 ng/mL をカットオフとする。<br />
        <strong>参考:</strong> Wells PS, et al. N Engl J Med 2003; 349(13):1227-1235.
      </div>
    </div>
  );
}
