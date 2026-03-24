import React, { useState, useCallback } from 'react';
import styles from './styles.module.css';

const GRADES = [
  { value: 0, label: 'Grade 0: 激しい運動をしたときだけ息切れがある' },
  { value: 1, label: 'Grade 1: 平坦な道を早足で歩く、または緩やかな坂道を歩くときに息切れがある' },
  { value: 2, label: 'Grade 2: 息切れがあるので同年代の人よりも平坦な道を歩くのが遅い、あるいは自分のペースで平坦な道を歩いていても息切れのために立ち止まることがある' },
  { value: 3, label: 'Grade 3: 平坦な道を100mまたは数分歩くと息切れのために立ち止まる' },
  { value: 4, label: 'Grade 4: 息切れがひどくて外出ができない、あるいは着替えでも息切れがある' },
];

function getJudgment(grade) {
  if (grade <= 1) return { text: '軽度', color: '#2E7D32' };
  if (grade === 2) return { text: '中等度', color: '#F9A825' };
  return { text: '重度', color: '#C62828' };
}

export default function MMRCCalculator() {
  const [selected, setSelected] = useState(null);

  const select = useCallback((value) => {
    setSelected((prev) => (prev === value ? null : value));
  }, []);

  const reset = useCallback(() => {
    setSelected(null);
  }, []);

  const judge = selected !== null ? getJudgment(selected) : null;

  return (
    <div className={styles.calc}>
      <div className={styles.calcHeader}>
        <div>
          <p className={styles.calcTitle}>mMRC 息切れスケール</p>
          <p className={styles.calcSub}>修正MRC（Medical Research Council）息切れスケール</p>
        </div>
        <button className={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      <div className={styles.calcBody}>
        <div className={styles.checkList}>
          {GRADES.map((g) => (
            <label
              key={g.value}
              className={`${styles.checkItem} ${selected === g.value ? styles.checkItemActive : ''}`}
            >
              <input
                type="radio"
                name="mmrc"
                className={styles.checkbox}
                checked={selected === g.value}
                onChange={() => select(g.value)}
              />
              <span className={styles.checkLabel}>{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      {judge && (
        <div className={styles.result}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>mMRC Grade</span>
            <span className={styles.resultValue}>{selected}</span>
          </div>
          <div className={styles.resultJudge} style={{ background: judge.color }}>
            {judge.text}
          </div>
        </div>
      )}

      {selected !== null && selected >= 2 && (
        <div style={{
          margin: '0 1.2rem 0.5rem',
          padding: '0.7rem 1rem',
          background: '#FFF3E0',
          border: '2px solid #E65100',
          borderRadius: '8px',
          color: '#E65100',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}>
          mMRC Grade 2以上: GOLD ABE分類においてE群（増悪群）に該当する可能性があります
        </div>
      )}

      <div className={styles.note}>
        <strong>判定基準:</strong> Grade 0-1: 軽度 / Grade 2: 中等度 / Grade 3-4: 重度<br />
        <strong>参考:</strong> Bestall JC, et al. Thorax 1999; 54(7):581-586.<br />
        GOLD 2023ガイドラインでは、mMRC 2以上はABE分類のE群該当の指標の一つです。
      </div>
    </div>
  );
}
