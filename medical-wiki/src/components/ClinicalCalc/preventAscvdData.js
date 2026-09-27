/**
 * preventAscvdData.js — 2026 ACC/AHA 脂質異常症ガイドライン（PREVENT-ASCVD）
 *
 * 実装仕様書 tool_spec.md（scratchpad/gl2026）のみを根拠に実装。
 * React に依存しない純粋なデータ + 関数のみ。node から直接テストできる（hisayamaData.js と同じ流儀）。
 */

/* ============================================================
   0. 数値ユーティリティ・入力範囲（§2.1, §2.2）
   ============================================================ */

const ok = (v) => typeof v === 'number' && isFinite(v);

// 受付範囲（id → [min, max]）。範囲外は「未入力」扱い＋赤字表示（UI 側）
export const FIELD_RANGES = {
  age: [20, 110],
  sbp: [60, 300],
  tc: [50, 1000],
  hdl: [5, 200],
  tg: [10, 10000],
  ldlLab: [5, 1000],
  ldlBaseline: [5, 1000],
  apob: [10, 400],
  lpa: [0, 1000],
  egfrLab: [1, 200],
  cr: [0.1, 20],
  cac: [0, 9999],
  nonHdlLab: [20, 1000], // spec_addendum_v2 §B-2
};

/**
 * 数値入力の検証（§2.1）: 空欄・非数・0以下は未入力（CAC のみ0を有効値とする）。
 * 受付範囲外は未入力扱い＋ outOfRange:true。年齢は満年齢（切り捨て）。
 * @returns {{value:number|null, outOfRange:boolean, range:[number,number]|null}}
 */
export function validNum(id, raw) {
  const n = typeof raw === 'number' ? raw : parseFloat(raw);
  const range = FIELD_RANGES[id] || null;
  if (!isFinite(n)) return { value: null, outOfRange: false, range };
  const allowZero = id === 'cac';
  if (!allowZero && n <= 0) return { value: null, outOfRange: false, range };
  if (range && (n < range[0] || n > range[1])) return { value: null, outOfRange: true, range };
  return { value: id === 'age' ? Math.floor(n) : n, outOfRange: false, range };
}

/* ============================================================
   1. PREVENT-ASCVD base model（§4）
   ============================================================ */

export const F_MMOL = 0.02586; // mg/dL → mmol/L

// 係数は preventr sysdata から逐語（§4.3）。base_10yr.csv / base_30yr.csv と一致確認済み。
const COEF = {
  ascvd10: {
    female: { a: 0.719883, nh: 0.1176967, h: -0.151185, s1: -0.0835358, s2: 0.3592852, dm: 0.8348585, smk: 0.4831078, e1: 0.4864619, e2: 0.0397779, bptx: 0.2265309, statin: -0.0592374, bptx_s2: -0.0395762, statin_nh: 0.0844423, a_nh: -0.0567839, a_h: 0.0325692, a_s2: -0.1035985, a_dm: -0.2417542, a_smk: -0.0791142, a_e1: -0.1671492, const: -3.819975 },
    male: { a: 0.7099847, nh: 0.1658663, h: -0.1144285, s1: -0.2837212, s2: 0.3239977, dm: 0.7189597, smk: 0.3956973, e1: 0.3690075, e2: 0.0203619, bptx: 0.2036522, statin: -0.0865581, bptx_s2: -0.0322916, statin_nh: 0.114563, a_nh: -0.0300005, a_h: 0.0232747, a_s2: -0.0927024, a_dm: -0.2018525, a_smk: -0.0970527, a_e1: -0.1217081, const: -3.500655 },
  },
  cvd10: {
    female: { a: 0.7939329, nh: 0.0305239, h: -0.1606857, s1: -0.2394003, s2: 0.3600781, dm: 0.8667604, smk: 0.5360739, e1: 0.6045917, e2: 0.0433769, bptx: 0.3151672, statin: -0.1477655, bptx_s2: -0.0663612, statin_nh: 0.1197879, a_nh: -0.0819715, a_h: 0.0306769, a_s2: -0.0946348, a_dm: -0.27057, a_smk: -0.078715, a_e1: -0.1637806, const: -3.307728 },
    male: { a: 0.7688528, nh: 0.0736174, h: -0.0954431, s1: -0.4347345, s2: 0.3362658, dm: 0.7692857, smk: 0.4386871, e1: 0.5378979, e2: 0.0164827, bptx: 0.288879, statin: -0.1337349, bptx_s2: -0.0475924, statin_nh: 0.150273, a_nh: -0.0517874, a_h: 0.0191169, a_s2: -0.1049477, a_dm: -0.2251948, a_smk: -0.0895067, a_e1: -0.1543702, const: -3.031168 },
  },
  ascvd30: {
    female: { a: 0.4669202, a2: -0.0893118, nh: 0.1256901, h: -0.1542255, s1: -0.0018093, s2: 0.322949, dm: 0.6296707, smk: 0.268292, e1: 0.100106, e2: 0.0499663, bptx: 0.1875292, statin: 0.0152476, bptx_s2: -0.0276123, statin_nh: 0.0736147, a_nh: -0.0521962, a_h: 0.0316918, a_s2: -0.1046101, a_dm: -0.2727793, a_smk: -0.1530907, a_e1: -0.1299149, const: -1.974074 },
    male: { a: 0.3994099, a2: -0.0937484, nh: 0.1744643, h: -0.120203, s1: -0.0665117, s2: 0.2753037, dm: 0.4790257, smk: 0.1782635, e1: -0.0218789, e2: 0.0602553, bptx: 0.1421182, statin: 0.0135996, bptx_s2: -0.0218265, statin_nh: 0.1013148, a_nh: -0.0312619, a_h: 0.020673, a_s2: -0.0920935, a_dm: -0.2159947, a_smk: -0.1548811, a_e1: -0.0712547, const: -1.736444 },
  },
  cvd30: {
    female: { a: 0.5503079, a2: -0.0928369, nh: 0.0409794, h: -0.1663306, s1: -0.1628654, s2: 0.3299505, dm: 0.6793894, smk: 0.3196112, e1: 0.1857101, e2: 0.0553528, bptx: 0.2894, statin: -0.075688, bptx_s2: -0.056367, statin_nh: 0.1071019, a_nh: -0.0751438, a_h: 0.0301786, a_s2: -0.0998776, a_dm: -0.3206166, a_smk: -0.1607862, a_e1: -0.1450788, const: -1.318827 },
    male: { a: 0.4627309, a2: -0.0984281, nh: 0.0836088, h: -0.1029824, s1: -0.2140352, s2: 0.2904325, dm: 0.5331276, smk: 0.2141914, e1: 0.1155556, e2: 0.0603775, bptx: 0.232714, statin: -0.0272112, bptx_s2: -0.0384488, statin_nh: 0.134192, a_nh: -0.0511759, a_h: 0.0165865, a_s2: -0.1101437, a_dm: -0.2585943, a_smk: -0.1566406, a_e1: -0.1166776, const: -1.148204 },
  },
};

function preventTerms(age, sbp, bptx, tc, hdl, statin, dm, smoking, egfr) {
  const a = (age - 55) / 10;
  const nh = (tc - hdl) * F_MMOL - 3.5;
  const h = (hdl * F_MMOL - 1.3) / 0.3;
  const s1 = (Math.min(sbp, 110) - 110) / 20;
  const s2 = (Math.max(sbp, 110) - 130) / 20;
  const e1 = (Math.min(egfr, 60) - 60) / -15;
  const e2 = (Math.max(egfr, 60) - 90) / -15;
  const dmN = dm ? 1 : 0;
  const smkN = smoking ? 1 : 0;
  const bptxN = bptx ? 1 : 0;
  const statinN = statin ? 1 : 0;
  return {
    a, a2: a * a, nh, h, s1, s2, dm: dmN, smk: smkN, e1, e2, bptx: bptxN, statin: statinN,
    bptx_s2: bptxN * s2, statin_nh: statinN * nh, a_nh: a * nh, a_h: a * h, a_s2: a * s2,
    a_dm: a * dmN, a_smk: a * smkN, a_e1: a * e1,
  };
}

function linpred(c, t, has30) {
  let x = c.const;
  x += c.a * t.a;
  if (has30) x += c.a2 * t.a2;
  x += c.nh * t.nh + c.h * t.h + c.s1 * t.s1 + c.s2 * t.s2 + c.dm * t.dm + c.smk * t.smk;
  x += c.e1 * t.e1 + c.e2 * t.e2 + c.bptx * t.bptx + c.statin * t.statin;
  x += c.bptx_s2 * t.bptx_s2 + c.statin_nh * t.statin_nh;
  x += c.a_nh * t.a_nh + c.a_h * t.a_h + c.a_s2 * t.a_s2 + c.a_dm * t.a_dm + c.a_smk * t.a_smk + c.a_e1 * t.a_e1;
  return x;
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

/** 表示の丸め（§4.4）: risk（0〜1）→ % 小数1桁、四捨五入（floor(x+0.5) 相当） */
export function pct1(risk) {
  return Math.floor(risk * 1000 + 0.5) / 10;
}

/**
 * PREVENT-ASCVD / total CVD の10年・30年リスク（%、丸め後）。
 * @param {'male'|'female'} sex
 * @param {'ascvd'|'cvd'} outcome  cvd は total CVD（テスト専用・画面には出さない §4.1）
 * @returns {{risk10:number, risk30:number|null}}
 */
export function preventRisk(sex, age, sbp, bptx, tc, hdl, statin, dm, smoking, egfr, outcome = 'ascvd') {
  const t = preventTerms(age, sbp, bptx, tc, hdl, statin, dm, smoking, egfr);
  const c10 = COEF[outcome + '10'][sex];
  const risk10 = pct1(sigmoid(linpred(c10, t, false)));
  let risk30 = null;
  if (age <= 59) {
    const c30 = COEF[outcome + '30'][sex];
    risk30 = pct1(sigmoid(linpred(c30, t, true)));
  }
  return { risk10, risk30 };
}

/** Sampson/NIH 式（§3.1.1）。丸め・0以下判定・TG>800 判定は呼び出し側で行う */
export function sampsonLdl(tc, hdl, tg) {
  const nonHdl = tc - hdl;
  return tc / 0.948 - hdl / 0.971 - (tg / 8.56 + (tg * nonHdl) / 2140 - (tg * tg) / 16100) - 9.44;
}

/**
 * spec_addendum_v2 §B-4: Sampson/NIH 式を TC について逆算（LDL-C・HDL-C・TG から non-HDL-C を推定する）。
 * TG ≤800 のときだけ呼び出し側で使う。
 */
export function tcFromSampson(ldl, hdl, tg) {
  return (ldl + hdl / 0.971 + tg / 8.56 - (tg * hdl) / 2140 - (tg * tg) / 16100 + 9.44) / (1 / 0.948 - tg / 2140);
}

/** CKD-EPI 2021 クレアチニン式（§3.3） */
export function ckdEpi2021(cr, age, sex) {
  const k = sex === 'female' ? 0.7 : 0.9;
  const alpha = sex === 'female' ? -0.241 : -0.302;
  const v = 142 * Math.pow(Math.min(cr / k, 1), alpha) * Math.pow(Math.max(cr / k, 1), -1.2)
    * Math.pow(0.9938, age) * (sex === 'female' ? 1.012 : 1);
  return { value: v, rounded: Math.floor(v + 0.5) };
}

/* ============================================================
   2. PREVENT 入力のクランプ（§4.5）
   ============================================================ */

// spec_addendum_v2 §A-4: クランプ注記を短縮
function clampNote(label, value, unit, lo, hi, endpoint) {
  return `${label} ${value} ${unit} → ${endpoint} で計算（PREVENT の範囲 ${lo}〜${hi}）`;
}

/**
 * PREVENT の変数変換用にクランプした値と注記を返す（年齢はクランプしない）。
 * @returns {{sbp:number|null, tc:number|null, hdl:number|null, egfr:number|null, clampNotes:string[]}}
 */
export function clampForPrevent({ sbp, tc, hdl, egfr }) {
  const clampNotes = [];
  let sbpC = sbp, tcC = tc, hdlC = hdl, egfrC = egfr;
  if (sbp !== null && sbp !== undefined) {
    if (sbp < 90) { clampNotes.push(clampNote('収縮期血圧', sbp, 'mmHg', 90, 180, 90)); sbpC = 90; }
    else if (sbp > 180) { clampNotes.push(clampNote('収縮期血圧', sbp, 'mmHg', 90, 180, 180)); sbpC = 180; }
  }
  if (tc !== null && tc !== undefined) {
    if (tc < 130) { clampNotes.push(clampNote('総コレステロール', tc, 'mg/dL', 130, 320, 130)); tcC = 130; }
    else if (tc > 320) { clampNotes.push(clampNote('総コレステロール', tc, 'mg/dL', 130, 320, 320)); tcC = 320; }
  }
  if (hdl !== null && hdl !== undefined) {
    if (hdl < 20) { clampNotes.push(clampNote('HDL-C', hdl, 'mg/dL', 20, 100, 20)); hdlC = 20; }
    else if (hdl > 100) { clampNotes.push(clampNote('HDL-C', hdl, 'mg/dL', 20, 100, 100)); hdlC = 100; }
  }
  if (egfr !== null && egfr !== undefined && egfr > 140) {
    clampNotes.push(clampNote('eGFR', egfr, 'mL/min/1.73m²', 15, 140, 140));
    egfrC = 140;
  }
  return { sbp: sbpC, tc: tcC, hdl: hdlC, egfr: egfrC, clampNotes };
}

/* ============================================================
   3. PREVENT 非適用の理由（§10.2）
   ============================================================ */

// spec_addendum_v2 §A-3: 文言は理由だけ（「適用外」は表示側 = buildText/buildSummary/UI が付ける）。
// fix_round3 item2 で復活させた PREVENT_NA_HFREF の存在自体は維持し、文言だけ短縮する。
export const PREVENT_NA = {
  PREVENT_NA_ASCVD: '二次予防',
  PREVENT_NA_FH: 'FH（3: Harm）',
  PREVENT_NA_LDL190: 'LDL-C ≥190',
  PREVENT_NA_AGE: '30〜79歳のみ',
  PREVENT_NA_CAC300: 'CAC ≥300',
  PREVENT_NA_HFREF: 'HFrEF: 心不全既往のない成人で作られた式',
  PREVENT_NA_ESKD: '末期腎不全: G5・透析・eGFR <15',
};

export function preventNaMissingText(missing) {
  return `未計算（未入力: ${missing.join('・')}）`;
}

/* ============================================================
   4. 注記文言（§10.3、定数名と逐語）
   ============================================================ */

// spec_addendum_v2 §A: 注記を臨床上の行動／安全に関わるものだけに絞る（1件あたり通常0〜2件）。
// 出典だけ・説明だけ・ツールの動き方の説明・定型文（旧 NOTE_INTENSITY 等）は削除し、
// 一般的に役立つものは mdx の「補足」へ移した（§A-6）。
export const NOTES = {
  NOTE_PREG_TABLE20: '妊娠中・授乳中は表20に従う（エゼチミブ・PCSK9 抗体・ベムペド酸・インクリシランは回避、スタチンは多くの場合中止）',
  NOTE_LDL_DISCORDANT: (lab, sampson) => `LDL-C 検査値 ${lab} と Sampson/NIH 式 ${sampson} で判定区分が変わりうる（判定は検査値）`,
  NOTE_STATIN_BASELINE: '治療前 LDL-C 未入力: 現在値で経路を判定（≥190・70〜189 は治療前値で確認）',
  NOTE_EGFR_LT60_NO_CKD: 'eGFR <60: 3か月以上持続なら CKD ステージを選択',
  NOTE_LOW_ENH: '低リスクでも強い早発CVD家族歴・非常に高い Lp(a) では LLT 検討が妥当な場合あり（p40）',
  NOTE_7679: '76〜79歳: 新規開始は 2b（余命2.5年以上・話し合い後）',
  NOTE_CAC0_HIGHRISK: (list) => `CAC=0 でも延期しない（${list.join('、')}）`,
  NOTE_CAC0_FH: 'FH・LDL-C ≥190 では CAC=0 でも延期しない',
  NOTE_CAROTID: '頸動脈プラークがあれば CAC=0 でも LLT 開始（p43）',
  NOTE_HD_START: '維持透析: スタチン新規開始の利益は RCT で示されていない',
  NOTE_HIV_DDI: 'ART とスタチンの相互作用を確認（Table 22）',
  NOTE_HFREF_CAVEAT: 'HFrEF 自体は LLT の適応ではない。重度 CAC・危険因子など他の適応で判断（p78）',
  NOTE_TAKEHOME1: 'LDL-C ≥160 または強い早発ASCVD家族歴: 薬物療法の早期検討（Take-Home 1）',
  NOTE_ELDER_CAC_POS: '>75歳: 新規開始は 2b（余命2.5年以上・話し合い後）',
  NOTE_LDL70_NONHDL: 'non-HDL-C ≥100（または不明）: 該当する区分推奨なし。個別に判断',
  NOTE_LPA_REFER: 'Lp(a) ≥200 nmol/L（≥75 mg/dL）: 脂質専門医紹介を考慮（Table 9）',
  NOTE_PRIMARY_LDL_LOW_CONTINUE: '治療前 LDL-C 不明: PREVENT は参考値。現行治療の継続が基本',
};

/* ============================================================
   5. 推奨カタログ RECS（§10.4）
   ============================================================ */

export const RECS = {
  P_LIFE: { text: '健康行動の推奨に加え、LLT の利益・リスクを話し合う', cor: '1', loe: 'A', ref: '4.2.3.7 推奨1（p44）' },
  P_LOW_COUNSEL: { text: '30〜59歳・10年 <3%・LDL-C <160・30年 <10%: 健康行動のカウンセリング', cor: '1', loe: 'A', ref: '4.2.3.7 推奨2（p44）' },
  P_LOW_STATIN: { text: '30〜59歳・10年 <3% でも LDL-C 160〜189 または30年 ≥10%: 中強度スタチンは妥当（累積曝露の低減）', cor: '2a', loe: 'C-LD', ref: '4.2.3.7 推奨3（p44）' },
  P_BORDER_STATIN: { text: '境界リスクで開始を決めた場合: 中強度スタチン（LDL-C 30〜49%低下）は妥当', cor: '2a', loe: 'A', ref: '4.2.3.7 推奨4（p44）' },
  P_BORDER_ENH: { text: '境界リスク: リスク増強因子（Table 13）を考慮して個別化するのは妥当', cor: '2a', loe: 'B-NR', ref: '4.2.3.3 推奨1（p39）' },
  P_BORDER_CRP: { text: '境界リスクで hsCRP ≥2 mg/L が連続2回（原因不明）: 高強度スタチンは有用', cor: '2a', loe: 'B-R', ref: '4.2.3.3 推奨2（p39）' },
  P_INTER_STATIN: { text: '中間リスク: 少なくとも中強度スタチン（30〜49%低下）。範囲上限寄りでは高強度（≥50%低下）が有益', cor: '1', loe: 'A', ref: '4.2.3.7 推奨5（p44）' },
  P_BI_GOAL: { text: '境界・中間リスクでスタチン開始時: 目標 LDL-C <100・non-HDL-C <130 は妥当', cor: '2a', loe: 'B-NR', ref: '4.2.3.7 推奨6（p44）' },
  P_HIGH_STATIN: { text: '高リスク: 高強度スタチン（LDL-C ≥50%低下）の開始を推奨', cor: '1', loe: 'A', ref: '4.2.3.7 推奨7（p44）' },
  P_HIGH_GOAL: { text: '高リスク: 目標 LDL-C <70・non-HDL-C <100 は妥当', cor: '2a', loe: 'B-R', ref: '4.2.3.7 推奨8（p44）' },
  P_HIGH_EZE: { text: '最大耐容量スタチンで目標未達: エゼチミブ追加は妥当', cor: '2a', loe: 'B-R', ref: '4.2.3.7 推奨9（p45）' },
  P_HIGH_PCSK9: { text: 'さらに未達: PCSK9 抗体またはベムペド酸の追加を考慮', cor: '2b', loe: 'B-NR', ref: '4.2.3.7 推奨10（p45）' },
  P_LDL70_NB: { text: '未治療 LDL-C <70・non-HDL-C <100 で追加の危険因子が無い場合、一次予防の LLT 開始で ASCVD リスク低減は見込みにくい', cor: '3: No Benefit', loe: 'B-NR', ref: '4.2.3.7 推奨12（p45）' },
  CAC_UNCERTAIN: { text: 'LLT の判断が不確実な場合: CAC でリスクを層別化し、見送り・延期・開始を決める', cor: '1', loe: 'B-R', ref: '4.2.3.6 推奨1（p41）' },
  CAC_ZERO: { text: 'CAC=0 で LLT を避けたい希望があり高リスク状態が無い場合: 治療を延期し3〜7年後に CAC 再検は妥当', cor: '2a', loe: 'B-NR', ref: '4.2.3.6 推奨2（p41）' },
  CAC_POS: { text: 'CAC >0: LLT 開始を推奨（特に ≥100 AU または ≥75パーセンタイル）', cor: '1', loe: 'B-NR', ref: '4.2.3.6 推奨3（p42）' },
  CAC_INTENS: { text: '中間・高リスクで治療強度が不確実な場合: CAC で目標を精緻化し強化を判断するのに有用', cor: '2a', loe: 'B-NR', ref: '4.2.3.6 推奨4（p42）' },
  CAC_INCID: { text: '非心臓CTでの偶発的CACは、LLT の開始・強化の判断で考慮すべき', cor: '1', loe: 'B-NR', ref: '4.2.3.6 推奨5（p42）' },
  S_CAC1000: { text: 'CAC ≥1000: LDL 低下療法（スタチン第一選択）の開始を推奨し ≥50%低下、LDL-C <55・non-HDL-C <85', cor: '1', loe: 'B-NR', ref: '4.2.7 推奨1（p67）' },
  S_CAC300: { text: 'CAC 300〜999: LDL 低下療法（スタチン第一選択）の開始を推奨し ≥50%低下、LDL-C <70・non-HDL-C <100', cor: '1', loe: 'B-R', ref: '4.2.7 推奨2（p67）' },
  S_CAC300_OPT: { text: 'CAC 300〜999: スタチン強化、必要に応じエゼチミブ・PCSK9 抗体・ベムペド酸追加で LDL-C <55・non-HDL-C <85 を目指すのは妥当', cor: '2a', loe: 'B-NR', ref: '4.2.7 推奨5（p68）' },
  S_CAC100: { text: 'CAC 100〜299 または ≥75パーセンタイル: LLT（スタチン第一選択）の開始を推奨し ≥50%低下、LDL-C <70・non-HDL-C <100', cor: '1', loe: 'B-R', ref: '4.2.7 推奨3（p67）' },
  S_CAC1: { text: 'CAC 1〜99 かつ <75パーセンタイル: 中強度スタチン（30〜49%低下）、LDL-C <100・non-HDL-C <130 は妥当', cor: '2a', loe: 'B-R', ref: '4.2.7 推奨4（p68）' },
  S_INCID_MILD: { text: '偶発的CAC（軽度）: 中強度スタチン（30〜49%低下）、LDL-C <100・non-HDL-C <130 は妥当', cor: '2a', loe: 'B-R／B-NR', ref: '4.2.7 推奨4・6（p68）' },
  S_INCID_MODSEV: { text: '偶発的CAC（中等度〜高度）: 高強度スタチン（≥50%低下）、LDL-C <70・non-HDL-C <100 は妥当', cor: '2a', loe: 'B-NR', ref: '4.2.7 推奨6（p68）' },
  SEC_NVH_STATIN: { text: '超高リスクでない臨床的ASCVD: 高強度スタチン（≥50%低下）の開始を推奨、LDL-C <70・non-HDL-C <100', cor: '1', loe: 'A', ref: '4.2.6 推奨1（p62）' },
  SEC_NVH_ADD: { text: '最大耐容量スタチンで未達: エゼチミブ、PCSK9 抗体、またはベムペド酸の追加は妥当（必要な低下幅と患者の希望で選択）', cor: '2a', loe: 'B-R', ref: '4.2.6 推奨2（p62）' },
  SEC_NVH_OPT: { text: '任意のより低い目標 LDL-C <55・non-HDL-C <85 に向けた同様の追加は妥当', cor: '2a', loe: 'B-R', ref: '4.2.6 推奨3（p62）' },
  SEC_NVH_INCL: { text: 'PCSK9 抗体が忍容・入手・継続できない場合: インクリシラン', cor: '2a', loe: '図12', ref: '図12 p65' },
  SEC_VH_STATIN: { text: '超高リスクの臨床的ASCVD: 高強度スタチン（≥50%低下）の開始を推奨、LDL-C <55・non-HDL-C <85', cor: '1', loe: 'A', ref: '4.2.6 推奨4（p62）' },
  SEC_VH_ADD: { text: '最大耐容量スタチンで未達: エゼチミブ および/または PCSK9 抗体を追加する', cor: '1', loe: 'A', ref: '4.2.6 推奨5（p62）' },
  SEC_VH_INCL: { text: 'エボロクマブ・アリロクマブが忍容・入手できない、または投与回数の少ない方を強く希望する場合: インクリシラン追加は妥当', cor: '2a', loe: 'B-R', ref: '4.2.6 推奨7（p62）' },
  SEC_VH_BEMP: { text: 'ベムペド酸（±エゼチミブ±PCSK9 抗体）の追加は妥当', cor: '2a', loe: 'B-R', ref: '4.2.6 推奨6（p62）' },
  SEC_LPA: { text: '臨床的ASCVD＋Lp(a) 高値で最大耐容量スタチン下に目標未達: 心血管イベント抑制が示された PCSK9 抗体を追加', cor: '1', loe: 'B-R', ref: '4.2.10 推奨2（p90）' },
  K40: { text: '40〜75歳・CKD G3以上・LDL-C 70〜189: 中強度スタチン、または中強度スタチン＋エゼチミブの開始を推奨', cor: '1', loe: 'B-R', ref: '4.2.8.8 推奨1（p79）' },
  K_ASCVD: { text: 'CKD G3以上＋臨床的ASCVD: 高強度スタチン±エゼチミブ±PCSK9 抗体で ≥50%低下、LDL-C <55・non-HDL-C <85', cor: '1', loe: 'B-R', ref: '4.2.8.8 推奨2（p79）' },
  KHD: { text: '維持透析: スタチン継続を考慮（期待余命・併存症・ASCVD 重症度で個別化）', cor: '2b', loe: 'C-LD', ref: '4.2.8.8 推奨3（p79）' },
  H40: { text: 'HIV（40〜75歳・安定したART中）: スタチンを推奨（初回ASCVDイベントと冠動脈硬化進展の抑制）', cor: '1', loe: 'B-R', ref: '4.2.8.9 推奨1（p80）' },
  HF_NB: { text: 'HFrEF のみを理由とする LLT の開始は推奨されない', cor: '3: No Benefit', loe: 'A', ref: '4.2.8.6 推奨1（p78）' },
  F_SEC: { text: '二次性脂質異常の原因を除外し対処する（Table 15）', cor: '1', loe: 'B-NR', ref: '4.2.4.3 推奨1（p51）' },
  F_STATIN: { text: '最大耐容量スタチンの開始を推奨', cor: '1', loe: 'B-R', ref: '4.2.4.3 推奨2（p51）' },
  F_GEN: { text: '二次性原因の無い LDL-C ≥190: FH のパネル遺伝学的検査は有用', cor: '2a', loe: 'B-NR', ref: '4.2.4.2 推奨2（p50）' },
  F_100: { text: 'ASCVD・追加の危険因子・HeFH・無症候性動脈硬化がいずれも無い: 最大耐容量スタチンにエゼチミブ、PCSK9 抗体 および/または ベムペド酸を追加し LDL-C <100・non-HDL-C <130', cor: '1', loe: 'B-NR', ref: '4.2.4.3 推奨3（p51）' },
  F_70: { text: 'ASCVD は無いが HeFH（臨床的/遺伝学的確定）・追加の危険因子・冠動脈石灰化のいずれかがあり最大耐容量スタチン下: エゼチミブ、PCSK9 抗体 および/または ベムペド酸を追加し LDL-C <70・non-HDL-C <100 を目指す', cor: '1', loe: 'B-R', ref: '4.2.4.3 推奨4（p51）' },
  F_55: { text: '臨床的ASCVD があり最大耐容量スタチン下: エゼチミブ、PCSK9 抗体 および/または ベムペド酸を追加し LDL-C <55・non-HDL-C <85 を目指す', cor: '1', loe: 'B-R', ref: '4.2.4.3 推奨5（p52）' },
  F_INCL: { text: '最大耐容量スタチン±エゼチミブで LDL-C ≥100: インクリシランは妥当（CVOT 未完了。LDL-C 低下のみの根拠。PCSK9 阻害の second-line）', cor: '2a', loe: 'B-R', ref: '4.2.4.3 推奨6（p52）' },
  F_NOPREVENT: { text: 'HeFH では一般集団用のリスク式（PREVENT 等）で10年・30年リスクを計算しない', cor: '3: Harm', loe: 'C-EO', ref: '4.2.4.1 推奨2（p49）' },
  HO_CONSULT: { text: 'HoFH: 先進的 LDL 低下薬・リポ蛋白アフェレーシスの検討のため脂質専門医へコンサルト', cor: '1', loe: 'B-NR', ref: '4.2.4.4 推奨1（p55）' },
  HO_STATIN: { text: 'HoFH: 最大耐容量スタチンの開始を推奨', cor: '1', loe: 'B-R', ref: '4.2.4.4 推奨2（p55）' },
  HO_ADD: { text: 'HoFH: エゼチミブ、PCSK9 抗体 および/または ベムペド酸の追加は妥当', cor: '2a', loe: 'B-R', ref: '4.2.4.4 推奨3（p55）' },
  D_40: { text: '40〜75歳の糖尿病（ASCVDなし）: 中強度スタチン（30〜49%低下）、LDL-C <100・non-HDL-C <130', cor: '1', loe: 'A', ref: '4.2.5 推奨1（p58）' },
  D_HIGH: { text: '複数のASCVD危険因子（図9: または PREVENT 10年 ≥10%）: 高強度スタチン（≥50%低下）、LDL-C <70・non-HDL-C <100 は妥当', cor: '2a', loe: 'B-R', ref: '4.2.5 推奨3（p58）・図9' },
  D_ADD: { text: 'PREVENT 10年 ≥10%: 最大耐容量スタチンにエゼチミブまたは PCSK9 抗体を追加し LDL-C <70・non-HDL-C <100 を目指すことを考慮', cor: '2b', loe: 'C-LD', ref: '4.2.5 推奨5（p58）' },
  D_SIDE: { text: 'スタチンの副作用がある場合: エゼチミブ および/または ベムペド酸、または PCSK9 抗体の開始を推奨', cor: '1', loe: 'B-R', ref: '4.2.5 推奨2（p58）' },
  D_DISC: { text: '>75歳: 利益・リスクの話し合い', cor: '1', loe: '図9', ref: '図9 p60' },
  D_75: { text: '>75歳（推定余命2.5年以上）: 話し合いの後、中強度スタチン開始を考慮', cor: '2b', loe: 'C-LD', ref: '4.2.5 推奨6（p58）' },
  D_20: { text: '20〜39歳で糖尿病特異的リスク増強因子（Table 17）あり: 中強度スタチン開始を考慮', cor: '2b', loe: 'C-LD', ref: '4.2.5 推奨7（p58）' },
  D_30PREVENT: { text: '30〜39歳で PREVENT 10年 ≥3% または30年 ≥10%: 中強度スタチン開始は妥当', cor: '2a', loe: '図9', ref: '図9 p60' },
  D_COUNSEL: { text: '上記に該当しない: 健康行動のカウンセリング', cor: '1', loe: '図9', ref: '図9 p60' },
  Y_LIFE: { text: '若年成人（>18〜39歳）: 食事・身体活動・体重最適化の推奨を行う', cor: '1', loe: 'B-NR', ref: '4.2.8.2 推奨1（p73）' },
  O_ELDER_DISC: { text: '高齢者: 優先事項・機能状態・多疾患併存・フレイル・多剤併用・余命を含めて話し合い、暦年齢だけで中止を判断しない', cor: '1', loe: 'C-EO', ref: '4.2.8.3 推奨1（p74）' },
  O_ELDER_START: { text: '>75歳・推定余命2.5年以上: 話し合いの後、中強度スタチン開始を考慮', cor: '2b', loe: 'B-NR', ref: '4.2.8.3 推奨2（p74）' },
  O_ELDER_CAC: { text: '>75歳・余命2.5年以上で判断が不確実: CAC を測定し、0 または 1〜10 なら LLT を避ける再分類を考慮', cor: '2b', loe: 'B-NR', ref: '4.2.8.3 推奨4（p74）' },
  O_LIFE1: { text: '余命1年未満: LDL 低下療法の中止を考慮', cor: '2b', loe: 'B-R', ref: '4.2.8.3 推奨3（p74）' },
  LPA1: { text: 'Lp(a) ≥125 nmol/L（≥50 mg/dL）: 修正可能な危険因子を早期から最適に管理する', cor: '1', loe: 'B-NR', ref: '4.2.10 推奨1（p90）' },
  TG_NONHDL: { text: 'TG ≥150: LDL-C より non-HDL-C または apoB を判断に用いる', cor: '2a', loe: 'B-NR', ref: '4.2.9 推奨7（p84）' },
  TG_FAST: { text: '随時 TG ≥400: 空腹時で脂質を再検', cor: '1', loe: 'B-NR', ref: '3.2 推奨2（p15）' },
  TG_SEVERE: { text: 'TG 500〜999（特に ≥1000）で食事療法後も持続: フィブラートまたは処方オメガ3 は妥当（膵炎リスク低減）', cor: '2a', loe: 'B-NR', ref: '4.2.9 推奨6（p84）' },
  TG_RDN: { text: '空腹時 TG ≥1000: 管理栄養士へ紹介', cor: '1', loe: 'B-NR', ref: '4.1.6 推奨1（p26）' },
  TG_DM_IPE: { text: '糖尿病（ASCVDなし）で追加のASCVD危険因子があり、スタチン内服中で LDL-C <100・空腹時 TG 150〜499: IPE（イコサペント酸エチル）の追加を考慮してもよい', cor: '2b', loe: 'B-R', ref: '4.2.5 推奨4（p58）' },
  TG_SEC_INTENSIFY: { text: '臨床的ASCVDで LDL-C ≥55・non-HDL-C ≥85（最大耐容量スタチン下）、TG 持続高値 150〜999: LDL-C 低下療法の強化を推奨', cor: '1', loe: 'B-R', ref: '4.2.9 推奨2（p83）' },
  TG_IPE_50: { text: '50歳以上で、臨床的ASCVD または 糖尿病＋ASCVD危険因子1つ以上、TG 持続高値 150〜499、LDL-C <100（最大耐容量スタチン下）: IPE の追加を考慮してもよい', cor: '2b', loe: 'B-R', ref: '4.2.9 推奨4（p83）' },
  PREG_STOP: { text: 'ASCVD 高リスクでない挙児希望者: 妊娠を試みる1〜2か月前、または妊娠判明時にスタチン中止', cor: '1', loe: 'C-LD', ref: '4.2.8.4 推奨1（p75）' },
  PREG_CONT: { text: 'FH または臨床的ASCVD の妊婦: 個別の利益・リスク討議の後にスタチン継続を考慮（継続する場合はプラバスタチン等の親水性スタチン）', cor: '2b', loe: 'C-LD', ref: '4.2.8.4 推奨5（p75）' },
  PREG_BAS: { text: '高TG血症の無い高コレステロール血症の妊娠・授乳中: 胆汁酸吸着薬は妥当', cor: '2a', loe: 'C-EO', ref: '4.2.8.4 推奨4（p75）' },
};

/** 表示形式: ・{text}［{cor}/{loe}］（LOE が図番号のときは ・ 区切り） */
export function corLoeBracket(cor, loe) {
  const sep = /^図/.test(loe) ? '・' : '/';
  return `［${cor}${sep}${loe}］`;
}

export function recText(id, conditional) {
  const r = RECS[id];
  const pre = conditional ? `${conditional}: ` : '';
  return `${pre}${r.text}${corLoeBracket(r.cor, r.loe)}`;
}

/* ============================================================
   6. 増強因子（Table 13, §2.2 G）
   ============================================================ */

export const ENHANCER_SHORT = {
  enh_fhx: '早発ASCVD家族歴',
  enh_anc: '高リスクの祖先',
  enh_prs: '高い多遺伝子リスク',
  enh_infl: '慢性炎症性疾患',
  enh_lpa: 'Lp(a)高値',
  enh_crp: 'hsCRP ≥2（複数回）',
  enh_tg: 'TG持続高値',
  enh_ckm: 'CKM症候群',
  enh_ldl: 'LDL-C 160〜189 等',
  enh_repro: '生殖関連リスクマーカー',
};

/** Lp(a) 判定（§3.5）: 単位ごとの閾値 */
export function lpaHigh(lpa, lpaUnit) {
  if (lpa === null || lpa === undefined || !lpaUnit) return false;
  return lpaUnit === 'nmol/L' ? lpa >= 125 : lpa >= 50;
}
export function lpaReferThreshold(lpa, lpaUnit) {
  if (lpa === null || lpa === undefined || !lpaUnit) return false;
  return lpaUnit === 'nmol/L' ? lpa >= 200 : lpa >= 75;
}

/** TG 高値の自動増強因子（fasting 別の閾値。§2.2 G, enh_tg） */
export function enhTgAuto(fasting, tg) {
  if (tg === null || tg === undefined) return false;
  if (fasting === 'fasting') return tg >= 150;
  return tg >= 175; // casual または未選択
}

/* ============================================================
   7. 目標・達成判定の共通ヘルパー
   ============================================================ */

export function attain(value, target) {
  if (value === null || value === undefined || target === null || target === undefined) return null;
  return value < target ? '達成' : '未達';
}

/** LDL-C 低下率（治療前比）の目標達成判定。reduction: '≥50%'|'30〜49%'|'≥30%'|null */
export function reductionAchieved(pct, reduction) {
  if (pct === null || pct === undefined || !reduction) return null;
  if (reduction === '≥50%') return pct >= 50;
  return pct >= 30; // '30〜49%' / '≥30%' はいずれも下限 30% で達成とする
}

function makeGoal(ldl, nonHdl, reduction, apoB, source, qualifier) {
  return { ldl, nonHdl, reduction: reduction || null, apoB: apoB || null, source, qualifier: qualifier || null };
}

/** §6.4/§6.3: LDL-C が最も低い方を採用（同値なら先に渡した方＝経路の主目標を優先） */
function pickLowerGoal(goals) {
  const valid = goals.filter((g) => g && ok(g.ldl));
  if (!valid.length) return null;
  return valid.reduce((min, g) => (g.ldl < min.ldl ? g : min));
}

/* ============================================================
   8. 評価本体 evaluate(p)（§5〜§9）
   ============================================================ */

const CKD_STAGE_LABEL = {
  none: 'なし・G1〜G2', G3a: 'G3a', G3b: 'G3b', G4: 'G4', G5: 'G5（透析なし）', dialysis: '維持透析',
};
const CKD_ADVANCED = ['G3a', 'G3b', 'G4', 'G5'];

function b(v) { return v === true; }

/**
 * @param {Object} p 入力（§2.2 の id をそのまま使う。数値は既に validNum 済み or null、
 *   トグルは true/false/null、CKD/incidCac/lpaUnit/fasting/sex は文字列 or null）
 * @returns {Object} §10.1 の戻り値
 */
export function evaluate(p) {
  const age = ok(p.age) ? Math.floor(p.age) : null;
  const sex = (p.sex === 'male' || p.sex === 'female') ? p.sex : null;
  // spec_addendum_v2 §B-2: dm はチェックボックス（あり/なし の二値、未チェック=false）。
  // トグルの「未入力」という第三状態は無い（null/undefined は false 扱い）。
  const dm = p.dm === true;
  const statin = p.statin === true ? true : (p.statin === false ? false : null);
  const bptx = p.bptx === true ? true : (p.bptx === false ? false : null);
  const smoking = p.smoking === true ? true : (p.smoking === false ? false : null);
  const sbp = ok(p.sbp) ? p.sbp : null;
  const tc = ok(p.tc) ? p.tc : null;
  const hdl = ok(p.hdl) ? p.hdl : null;
  const tg = ok(p.tg) ? p.tg : null;
  const fasting = (p.fasting === 'fasting' || p.fasting === 'casual') ? p.fasting : null;
  const ldlLab = ok(p.ldlLab) ? p.ldlLab : null;
  const nonHdlLab = ok(p.nonHdlLab) ? p.nonHdlLab : null; // spec_addendum_v2 §B-2（新規）
  const ldlBaseline = ok(p.ldlBaseline) ? p.ldlBaseline : null;
  const apob = ok(p.apob) ? p.apob : null;
  const lpa = ok(p.lpa) ? p.lpa : null;
  const lpaUnit = (p.lpaUnit === 'mg/dL' || p.lpaUnit === 'nmol/L') ? p.lpaUnit : null;
  const egfrLab = ok(p.egfrLab) ? p.egfrLab : null;
  const cr = ok(p.cr) ? p.cr : null;
  const cac = ok(p.cac) ? p.cac : null; // 0 は有効（呼び出し側で validNum('cac',...) 済み）
  const cac75 = b(p.cac75);
  const incidCac = (p.incidCac === 'mild' || p.incidCac === 'modsev') ? p.incidCac : 'none';
  const hefh = b(p.hefh);
  const hofh = b(p.hofh);
  const ckd = CKD_STAGE_LABEL[p.ckd] ? p.ckd : 'none';
  const hiv = b(p.hiv);
  const hfref = b(p.hfref);
  const preg = b(p.preg);
  const maxStatinEze = b(p.maxStatinEze);

  const notes = [];
  // fix_round1 A11: 妊娠・授乳中は結果の冒頭に警告（Table 20）
  const pregFlag = sex === 'female' && preg;
  if (pregFlag) notes.push(NOTES.NOTE_PREG_TABLE20);

  /* ---- 派生値: LDL-C・non-HDL-C（§3.1, §3.2、spec_addendum_v2 §B-4 で拡張） ---- */
  let tgOver800 = tg !== null && tg > 800;

  // spec_addendum_v2 §B-4: 総コレステロールが無いときの脂質の扱い（lipidMode）。
  // 'tc': tc が入力されている（現行どおり）。
  // 'nonhdl': nonHdlLab（検査報告値）、または ldlLab・hdl・tg（tg<=800）から Sampson/NIH 式を逆算。
  // 'hard': tc・nonHdlLab が無く tg>800（推定しない）。
  // 'missing': 上のどれにも当たらない（nonHdl を推定できない未入力項目にする、§B-3）。
  let lipidMode;
  let nonHdlSrc = null; // 'calc' | 'lab' | 'est'（表示用）
  let tcEffForSampson = null; // tc が無いときに Sampson 順算へ流用する実効 TC
  if (tc !== null) {
    lipidMode = 'tc';
    tcEffForSampson = tc;
  } else if (nonHdlLab !== null) {
    lipidMode = 'nonhdl';
    nonHdlSrc = 'lab';
    if (hdl !== null) tcEffForSampson = nonHdlLab + hdl;
  } else if (ldlLab !== null && hdl !== null && tg !== null && tg <= 800) {
    lipidMode = 'nonhdl';
    nonHdlSrc = 'est';
  } else if (tgOver800) {
    lipidMode = 'hard';
  } else {
    lipidMode = 'missing';
  }

  let nonHdl = null;
  if (lipidMode === 'tc') {
    nonHdl = (hdl !== null) ? Math.round(tc - hdl) : null;
    if (nonHdl !== null) nonHdlSrc = 'calc';
  } else if (lipidMode === 'nonhdl') {
    if (nonHdlSrc === 'lab') {
      nonHdl = Math.round(nonHdlLab);
    } else {
      // 'est': Sampson/NIH 式を TC について逆算し、そこから non-HDL-C を求める
      const tcBack = tcFromSampson(ldlLab, hdl, tg);
      nonHdl = Math.round(tcBack - hdl);
      tcEffForSampson = tcBack;
    }
  }
  // 'missing' / 'hard' の nonHdl（表示）は null のまま（仮定値は §B-3 の assumed 側にのみ入れる）

  let ldlSampson = null;
  if (!tgOver800 && tg !== null) {
    if (tc !== null && hdl !== null) {
      const raw = sampsonLdl(tc, hdl, tg);
      ldlSampson = raw > 0 ? Math.round(raw) : null;
    } else if (lipidMode === 'nonhdl' && nonHdlSrc === 'lab' && hdl !== null && tcEffForSampson !== null) {
      // spec_addendum_v2 §B-4 モード2: tcEff = nonHdlLab + hdl で Sampson 順算もできる
      const raw = sampsonLdl(tcEffForSampson, hdl, tg);
      ldlSampson = raw > 0 ? Math.round(raw) : null;
    }
    // モード3（'est': Sampson 逆算）では ldlSampson は計算しない（往復するだけのため、null のまま）
  }
  const ldlCurrent = ldlLab !== null ? ldlLab : ldlSampson;
  const ldlSource = ldlLab !== null ? 'lab' : (ldlSampson !== null ? 'sampson' : null);

  let ldlRoute = null;
  if (statin !== true) ldlRoute = ldlCurrent;
  else if (ldlBaseline !== null) ldlRoute = ldlBaseline;
  else { ldlRoute = ldlCurrent; if (ldlCurrent !== null) notes.push(NOTES.NOTE_STATIN_BASELINE); }

  if (ldlLab !== null && ldlSampson !== null) {
    const lo = Math.min(ldlLab, ldlSampson);
    const hi = Math.max(ldlLab, ldlSampson);
    // spec_addendum_v2 §A-2: 経路・区分に効く閾値だけに絞る（旧: 55,70,100,160,190）
    if ([70, 160, 190].some((t) => lo < t && t <= hi)) {
      notes.push(NOTES.NOTE_LDL_DISCORDANT(ldlLab, ldlSampson));
    }
  }

  const reductionPct = (statin === true && ldlBaseline !== null && ldlCurrent !== null && ldlBaseline > 0)
    ? Math.round(((ldlBaseline - ldlCurrent) / ldlBaseline) * 100)
    : null;

  /* ---- eGFR（§3.3） ---- */
  let egfrUsed = null;
  let egfrSource = null;
  // fix_round1 C6: CKD-EPI 2021 式は preventr の制約に合わせ 18〜100 歳のみ使用
  if (cr !== null && age !== null && age >= 18 && age <= 100 && sex !== null) {
    egfrUsed = ckdEpi2021(cr, age, sex).rounded;
    egfrSource = 'ckdepi';
  } else if (egfrLab !== null) {
    egfrUsed = egfrLab;
    egfrSource = 'lab';
    // spec_addendum_v2 §A-2: NOTE_EGFR_JSN は削除（入力欄のヒントと mdx 補足に既にある）
  }
  if ((ckd === 'none') && egfrUsed !== null && egfrUsed < 60) {
    notes.push(NOTES.NOTE_EGFR_LT60_NO_CKD);
  }

  /* ---- dmEnh（Table 17。egfr は自動 || 手動） ---- */
  const dmEnhIn = p.dmEnh || {};
  const dmEnhEgfrAuto = egfrUsed !== null && egfrUsed < 60;
  const dmEnh = {
    dur: b(dmEnhIn.dur), alb: b(dmEnhIn.alb), ret: b(dmEnhIn.ret), neu: b(dmEnhIn.neu), abi: b(dmEnhIn.abi),
    egfr: dmEnhEgfrAuto || b(dmEnhIn.egfr),
  };
  const dmEnhAny = dm === true && (dmEnh.dur || dmEnh.alb || dmEnh.egfr || dmEnh.ret || dmEnh.neu || dmEnh.abi);
  const DMENH_LABEL = {
    dur: '罹病期間が長い', alb: 'アルブミン尿≥30', egfr: 'eGFR<60', ret: '網膜症', neu: '神経障害', abi: 'ABI<0.9',
  };
  // fix_round2 R-UI2: eGFR は手動チェック時に「（自動）」を出さない（自動判定のときだけ付ける）
  const dmEnhLabels = Object.keys(DMENH_LABEL)
    .filter((k) => dmEnh[k])
    .map((k) => (k === 'egfr' && dmEnhEgfrAuto ? `${DMENH_LABEL[k]}（自動）` : DMENH_LABEL[k]));

  /* ---- 臨床的ASCVD（§2.2 A, A-2） ---- */
  const hasAscvdDef = b(p.acs) || b(p.mi) || b(p.angina) || b(p.revasc) || b(p.stroke) || b(p.tia) || b(p.pad);
  const ev = { acs12: b(p.ev_acs12), mi: b(p.ev_mi), isch: b(p.ev_isch), pad: b(p.ev_pad) };
  const hasAscvd = hasAscvdDef || ev.acs12 || ev.mi || ev.isch || ev.pad;

  /* ---- リスク増強因子（Table 13） ---- */
  const lpaHighFlag = lpaHigh(lpa, lpaUnit);
  const lpaReferFlag = lpaReferThreshold(lpa, lpaUnit);
  const enhTgFlag = enhTgAuto(fasting, tg);
  const enhLdlFlag = (ldlRoute !== null && ldlRoute >= 160 && ldlRoute <= 189)
    || (nonHdl !== null && nonHdl >= 190 && nonHdl <= 219)
    || (apob !== null && apob >= 120);
  // fix_round1 C4: 自動判定の増強因子（enh_lpa/enh_tg/enh_ldl）も手動でチェックできるようにする（auto||manual）
  const enhAutoFlags = { enh_lpa: lpaHighFlag, enh_tg: enhTgFlag, enh_ldl: enhLdlFlag };
  const enhancerFlags = {
    enh_fhx: b(p.enh_fhx), enh_anc: b(p.enh_anc), enh_prs: b(p.enh_prs), enh_infl: b(p.enh_infl),
    enh_lpa: lpaHighFlag || b(p.enh_lpa_manual), enh_crp: b(p.enh_crp), enh_tg: enhTgFlag || b(p.enh_tg_manual), enh_ckm: b(p.enh_ckm),
    enh_ldl: enhLdlFlag || b(p.enh_ldl_manual), enh_repro: sex === 'female' && b(p.enh_repro),
  };
  const enhancerIds = Object.keys(ENHANCER_SHORT).filter((k) => enhancerFlags[k]);
  const enhancers = { items: enhancerIds.map((k) => ENHANCER_SHORT[k]), count: enhancerIds.length, ids: enhancerIds, autoFlags: enhAutoFlags };

  /* ---- 超高リスク判定（図10, §7.1） ---- */
  const majorItemsMap = {
    acs12: ['過去12か月以内のACS', ev.acs12],
    mi: ['心筋梗塞の既往', ev.mi],
    isch: ['虚血性脳卒中の既往', ev.isch],
    pad: ['症候性PAD', ev.pad],
  };
  const majorItems = Object.values(majorItemsMap).filter(([, v]) => v).map(([l]) => l);
  const majorCount = majorItems.length;

  const age65 = age !== null && age >= 65;
  const age65Footnote = age !== null && age > 65;
  const ldlHr = maxStatinEze && ldlCurrent !== null && ldlCurrent >= 100;
  const ldlHrFootnote = maxStatinEze && ldlCurrent !== null && ldlCurrent > 100;
  const hrItemsMap = {
    age: ['年齢 ≥65歳', age65], cabgpci: ['CABG または PCI の既往', b(p.hr_cabgpci)],
    smoke: ['現在喫煙', smoking === true], dm: ['糖尿病', dm === true], hf: ['うっ血性心不全の既往', b(p.hr_hf)],
    htn: ['高血圧', b(p.hr_htn)], ldl: ['最大耐容量スタチン＋エゼチミブ下でLDL-C≥100', ldlHr],
  };
  const hrItems = Object.values(hrItemsMap).filter(([, v]) => v).map(([l]) => l);
  const hrCount = hrItems.length;
  const vhr = majorCount >= 2 || (majorCount === 1 && hrCount >= 2);

  const hrCountFootnote = [age65Footnote, b(p.hr_cabgpci), smoking === true, dm === true, b(p.hr_hf), b(p.hr_htn), ldlHrFootnote].filter(Boolean).length;
  const vhrFootnote = majorCount >= 2 || (majorCount === 1 && hrCountFootnote >= 2);

  // spec_addendum_v2 §A-2/§B-8: NOTE_VHR_AGE_MISSING・NOTE_VHR_LDL_MISSING は削除し、
  // buildSecondary() 内の「最低限追加すべき評価項目」（_secondaryRequired）に置き換える。

  /* ---- PREVENT 適用判定（§4.6、全経路共通の単一関数） ---- */
  function preventStatus(ldlRouteForCheck) {
    if (age === null || age < 30 || age > 79) return { ok: false, reason: 'PREVENT_NA_AGE' };
    if (hasAscvd) return { ok: false, reason: 'PREVENT_NA_ASCVD' };
    if (hefh || hofh) return { ok: false, reason: 'PREVENT_NA_FH' };
    if (ldlRouteForCheck !== null && ldlRouteForCheck >= 190) return { ok: false, reason: 'PREVENT_NA_LDL190' };
    if (cac !== null && cac >= 300) return { ok: false, reason: 'PREVENT_NA_CAC300' };
    // fix_round3 item2: 元仕様どおり復活（HFrEF は PREVENT の計算式そのものの適用外）。
    // routing 自体（route の割り当て、CAC 再分類・糖尿病・CKD・HIV・重症・二次予防の判定）は
    // PREVENT に依存しないため影響を受けない。HF_NB（条件付き）／NOTE_HFREF_CAVEAT は
    // 経路非依存の add-on のまま（hfrefAlso/hfrefNotes、fix_round2 R-A8）。
    if (hfref) return { ok: false, reason: 'PREVENT_NA_HFREF' };
    if (ckd === 'G5' || ckd === 'dialysis' || (egfrUsed !== null && egfrUsed < 15)) return { ok: false, reason: 'PREVENT_NA_ESKD' };
    // spec_addendum_v2 §B-9: 必須は性別と（'hard' のときの）総コレステロールまたは non-HDL-C だけ。
    // 他の7項目（SBP・HDL-C・non-HDL-C・eGFR・喫煙・降圧薬・スタチン）は §B-3 の仮定値で暫定計算する。
    const missing = [];
    if (sex === null) missing.push('性別');
    if (lipidMode === 'hard') missing.push('総コレステロール または non-HDL-C');
    if (missing.length) return { ok: false, missing };
    return { ok: true };
  }

  /* ---- spec_addendum_v2 §B-3〜B-6: 未入力項目の仮定値・範囲・判定の安定性 ---- */
  const ORDER = ['sbp', 'hdl', 'nonhdl', 'egfr', 'smk', 'bptx', 'statin'];
  const REQUIRED_LABEL = {
    sbp: '収縮期血圧', hdl: 'HDL-C', egfr: 'eGFR（またはクレアチニン）',
    smk: '喫煙', bptx: '降圧薬', statin: 'スタチン内服',
  };
  function nonhdlRequiredLabel() {
    // §B-4: ldlCurrent・hdl があり tg が無いとき TG（または総コレステロール）、それ以外は総コレステロール（またはnon-HDL-C）
    if (ldlCurrent !== null && hdl !== null && tg === null) return 'TG（または総コレステロール）';
    return '総コレステロール（または non-HDL-C）';
  }
  function requiredLabelFor(k) { return k === 'nonhdl' ? nonhdlRequiredLabel() : REQUIRED_LABEL[k]; }
  const EGFR_RANGE_BY_CKD = { none: [60, 105], G3a: [45, 59], G3b: [30, 44], G4: [15, 29] };
  const EGFR_ASSUMED_BY_CKD = { none: 80, G3a: 52, G3b: 37, G4: 22 };
  function candidatesFor(k) {
    // fix_v2_round1 L2: SBP の範囲上限を 160→180 に拡大
    if (k === 'sbp') return [100, 110, 180];
    if (k === 'hdl') return [35, 90];
    if (k === 'nonhdl') return ldlCurrent !== null ? [ldlCurrent + 10, ldlCurrent + 60] : [100, 190];
    if (k === 'egfr') {
      const base = EGFR_RANGE_BY_CKD[ckd] || EGFR_RANGE_BY_CKD.none;
      // fix_v2_round1 L2: eGFR・Cr が未入力で CKD 病期不明（none 相当）かつ 65歳以上なら下限を 45 に広げる
      // （既定の仮定値 80 は EGFR_ASSUMED_BY_CKD.none のまま変えない）
      if (base === EGFR_RANGE_BY_CKD.none && age !== null && age >= 65) return [45, 105];
      return base;
    }
    return [false, true]; // smk / bptx / statin
  }
  function assumedValueFor(k) {
    if (k === 'sbp') return 130;
    if (k === 'hdl') return sex === 'female' ? 65 : 55;
    if (k === 'nonhdl') return ldlCurrent !== null ? ldlCurrent + 30 : 145;
    if (k === 'egfr') return EGFR_ASSUMED_BY_CKD[ckd] !== undefined ? EGFR_ASSUMED_BY_CKD[ckd] : 80;
    return false; // smk / bptx / statin
  }
  function assumedLabelFor(k, v) {
    if (k === 'sbp') return `収縮期血圧 ${v}`;
    if (k === 'hdl') return `HDL-C ${v}`;
    if (k === 'nonhdl') return ldlCurrent !== null ? `non-HDL-C ${v}（LDL-C＋30）` : `non-HDL-C ${v}`;
    if (k === 'egfr') return `eGFR ${v}`;
    if (k === 'smk') return `喫煙 ${v ? 'あり' : 'なし'}`;
    if (k === 'bptx') return `降圧薬 ${v ? 'あり' : 'なし'}`;
    return `スタチン ${v ? 'あり' : 'なし'}`;
  }
  /** リスク計算の線形予測子は連続変数の区分線形和なので、範囲の最小・最大は候補値の全組み合わせで厳密に求まる（§B-5） */
  function riskAt(v) {
    const tcForCalc = lipidMode === 'tc' ? tc : (v.nonhdl + v.hdl);
    const clamped = clampForPrevent({ sbp: v.sbp, tc: tcForCalc, hdl: v.hdl, egfr: v.egfr });
    return preventRisk(sex, age, clamped.sbp, v.bptx, clamped.tc, clamped.hdl, v.statin, dm, v.smk, clamped.egfr);
  }
  function cartesian(arrays) {
    return arrays.reduce((acc, arr) => {
      const out = [];
      acc.forEach((prefix) => arr.forEach((v) => out.push([...prefix, v])));
      return out;
    }, [[]]);
  }
  /** §B-6: kind ごとの「判定キー」。同じキーの組み合わせだけなら区分・推奨は変わらない（stable） */
  function decisionKey(kind, r10, r30) {
    if (kind === 'primary') {
      const c = categoryFromRisk(r10);
      if (c === 'low' && age >= 30 && age <= 59 && !(ldlRoute !== null && ldlRoute >= 160 && ldlRoute <= 189)) {
        return c + (r30 !== null && r30 >= 10 ? '+30' : '-30');
      }
      return c;
    }
    if (kind === 'dm3039') return String(r10 >= 3 || (r30 !== null && r30 >= 10));
    if (kind === 'dm4075') return String(r10 >= 10);
    return 'none'; // kind===null は常に安定（追加項目なし）
  }
  /** §A-4: クランプ注記は測定値（仮定値ではない）のときだけ出す */
  function clampNotesForKnown() {
    const tcForClamp = lipidMode === 'tc' ? tc : ((nonHdl !== null && hdl !== null) ? nonHdl + hdl : null);
    return clampForPrevent({ sbp, tc: tcForClamp, hdl, egfr: egfrUsed }).clampNotes;
  }

  /**
   * spec_addendum_v2 §B: PREVENT のリスク計算。kind は §B-6 の呼び出し元テーブルに従う
   * （'primary' | 'dm3039' | 'dm4075' | null）。未入力の推定可能項目（§B-3）があれば
   * 仮定値による点推定に加え、候補値の全組み合わせで範囲・判定の安定性（provisional）を返す。
   */
  function computePrevent(kind) {
    const st = preventStatus(ldlRoute);
    if (!st.ok) return { ...st, clampNotes: [] };

    const known = {};
    const miss = [];
    if (sbp !== null) known.sbp = sbp; else miss.push('sbp');
    if (hdl !== null) known.hdl = hdl; else miss.push('hdl');
    if (lipidMode === 'missing') miss.push('nonhdl'); else known.nonhdl = nonHdl;
    if (egfrUsed !== null) known.egfr = egfrUsed; else miss.push('egfr');
    if (smoking !== null) known.smk = smoking; else miss.push('smk');
    if (bptx !== null) known.bptx = bptx; else miss.push('bptx');
    if (statin !== null) known.statin = statin; else miss.push('statin');

    const point = { ...known };
    miss.forEach((k) => { point[k] = assumedValueFor(k); });
    const pt = riskAt(point);
    const clampNotes = clampNotesForKnown();

    if (miss.length === 0) {
      return {
        ok: true, ascvd10: pt.risk10, ascvd30: pt.risk30, clampNotes,
        outOfLdlRange: ldlRoute !== null && ldlRoute < 70,
        ldlUnknown: ldlRoute === null,
        provisional: null,
      };
    }

    const missOrdered = ORDER.filter((k) => miss.includes(k));
    let min10 = Infinity; let max10 = -Infinity; let min30 = Infinity; let max30 = -Infinity;
    const keys = new Set();
    cartesian(missOrdered.map((k) => candidatesFor(k))).forEach((combo) => {
      const v = { ...point };
      missOrdered.forEach((k, i) => { v[k] = combo[i]; });
      const r = riskAt(v);
      if (r.risk10 < min10) min10 = r.risk10;
      if (r.risk10 > max10) max10 = r.risk10;
      if (r.risk30 !== null) { if (r.risk30 < min30) min30 = r.risk30; if (r.risk30 > max30) max30 = r.risk30; }
      keys.add(decisionKey(kind, r.risk10, r.risk30));
    });
    const stable = keys.size === 1;

    const items = missOrdered.map((k) => {
      const rs = candidatesFor(k).map((cv) => riskAt({ ...point, [k]: cv }));
      const ks = new Set(rs.map((r) => decisionKey(kind, r.risk10, r.risk30)));
      const r10s = rs.map((r) => r.risk10);
      const sw10 = Math.round((Math.max(...r10s) - Math.min(...r10s)) * 10) / 10;
      const r30s = rs.map((r) => r.risk30).filter((x) => x !== null);
      const sw30 = r30s.length ? Math.round((Math.max(...r30s) - Math.min(...r30s)) * 10) / 10 : 0;
      return { k, sw10, sw30, flips: ks.size > 1 };
    }).sort((a, b) => (b.sw10 - a.sw10) || (b.sw30 - a.sw30) || (ORDER.indexOf(a.k) - ORDER.indexOf(b.k)));

    let required = stable ? [] : items.filter((x) => x.flips).map((x) => x.k);
    if (!stable && required.length === 0) required = items.filter((x) => x.sw10 > 0 || x.sw30 > 0).slice(0, 3).map((x) => x.k);

    return {
      ok: true, ascvd10: pt.risk10, ascvd30: pt.risk30, clampNotes,
      outOfLdlRange: ldlRoute !== null && ldlRoute < 70,
      ldlUnknown: ldlRoute === null,
      provisional: {
        range10: [min10, max10],
        range30: pt.risk30 === null ? null : [min30, max30],
        stable,
        assumed: missOrdered.map((k) => assumedLabelFor(k, point[k])),
        required: required.map((k) => requiredLabelFor(k)),
      },
    };
  }

  /* ---- CAC 再分類（§6.4〜§6.6）共通ヘルパー ---- */
  function applyCac(category, isPrimaryLike) {
    // isPrimaryLike: route が primary/diabetes/ckd/hiv/young/elderly/ldl_lt70/subclinical のいずれか
    const extraRecs = [];
    const extraNotes = [];
    let candidateGoal = null;
    let optionalGoal = null;
    // fix_round3 item1: このヘルパーは applyCac を実際に呼んだ route でのみ elderCacEmphasis を
    // 立てるための唯一の入口。呼ぶたびにまずリセットする。
    lastElderLowCac = false;
    // spec_addendum_v2 §A-2: NOTE_CAC_INCID_IGNORED は削除（cac と incidCac が両方あるときの説明のみ）
    if (cac !== null) {
      // fix_round2 R-A10: 75歳超（経路を問わない）で CAC 0〜10 のときは S_CAC1・CAC_POS を出さず
      // O_ELDER_CAC（4.2.8.3 推奨4, p74, 2b/B-NR）を併記する。目標 <100 も採用しない。
      const elderLowCac = age !== null && age > 75 && cac <= 10;
      lastElderLowCac = elderLowCac;
      if (elderLowCac) {
        extraRecs.push('O_ELDER_CAC');
      } else if (cac >= 1000) {
        extraRecs.push('S_CAC1000');
        candidateGoal = makeGoal(55, 85, '≥50%', 55, 'S_CAC1000');
      } else if (cac >= 300) {
        extraRecs.push('S_CAC300', 'S_CAC300_OPT');
        candidateGoal = makeGoal(70, 100, '≥50%', 70, 'S_CAC300');
        optionalGoal = makeGoal(55, 85, null, 55, 'S_CAC300_OPT');
      } else if (cac >= 100 || (cac >= 1 && cac75)) {
        extraRecs.push('S_CAC100');
        candidateGoal = makeGoal(70, 100, '≥50%', null, 'S_CAC100');
      } else if (cac >= 1) {
        extraRecs.push('S_CAC1');
        candidateGoal = makeGoal(100, 130, '30〜49%', null, 'S_CAC1');
      }
      // cac === 0 は §6.5 で個別処理（呼び出し側）
      if (!elderLowCac && ['low', 'borderline', 'intermediate'].includes(category) && cac >= 1) {
        if (category === 'borderline' || category === 'intermediate') extraRecs.push('CAC_POS');
      }
      // spec_addendum_v2 §A-2: NOTE_CAC_AGE は削除（説明のみ）
    } else if (incidCac === 'mild') {
      extraRecs.push('S_INCID_MILD', 'CAC_INCID');
      candidateGoal = makeGoal(100, 130, '≥30%', null, 'S_INCID_MILD');
    } else if (incidCac === 'modsev') {
      extraRecs.push('S_INCID_MODSEV', 'CAC_INCID');
      candidateGoal = makeGoal(70, 100, '≥50%', null, 'S_INCID_MODSEV');
    }
    return { extraRecs, extraNotes, candidateGoal, optionalGoal };
  }

  const highRiskStateCac0 = (list = []) => {
    // §6.5 「高リスク状態」
    const found = [];
    if (ldlRoute !== null && ldlRoute >= 190) found.push('LDL-C≥190');
    if (hefh) found.push('HeFH');
    if (dm === true && age !== null && age > 40) found.push('糖尿病かつ40歳超');
    if (smoking === true) found.push('現在喫煙');
    if (enhancerFlags.enh_fhx) found.push('早発ASCVDの家族歴');
    return found;
  };

  // 「開始するかどうか」に関わる推奨（CKD/HIV の一次予防区分「参考」表示から除外する）
  const START_DECISION_RECS = ['P_LIFE', 'P_LOW_COUNSEL', 'P_BORDER_STATIN', 'CAC_UNCERTAIN'];
  // 妊娠中の「開始・追加」条件付けから除外する非薬物療法系の推奨 ID
  // fix_round2 R-A11: P_LOW_COUNSEL などの非薬物推奨は前置対象から外す
  const PREG_WRAP_EXCLUDE = ['P_LIFE', 'P_LOW_COUNSEL', 'D_COUNSEL', 'D_DISC', 'O_ELDER_DISC', 'Y_LIFE', 'F_SEC', 'HO_CONSULT'];
  // fix_round2 R-A11: 「他に該当する推奨」のうち妊娠中は表20の前置を付ける薬物療法系の ID
  const PREG_WRAP_ALSO_INCLUDE = ['K40', 'H40', 'TG_SEVERE', 'TG_DM_IPE', 'TG_SEC_INTENSIFY', 'TG_IPE_50'];
  // fix_round3 item1（旧 fix_round2 R-A10 の blocker 修正）: 高齢者 CAC 強調は「applyCac が実際に
  // O_ELDER_CAC を付けた経路」に限る。年齢・CAC 値だけで route 非依存に判定すると、CAC 再分類を
  // 行わない route（secondary・severe・hofh 等）にまで誤って強調が出てしまう。
  // applyCac() 呼び出し時にそのつど更新し、finalize() で読む（1回の evaluate() で route ビルダーは
  // 1つだけ実行され、applyCac の呼び出しは finalize() の前に高々1回しか起きないため安全）。
  let lastElderLowCac = false;

  /* ============================================================
     ルーティング（§5）
     ============================================================ */

  // 0. secondary
  if (hasAscvd) {
    return buildSecondary();
  }
  // 1. age 未入力
  if (age === null) {
    return incompleteResult(['年齢']);
  }
  // 2. hofh
  if (hofh) return buildHofh();
  // 3. hefh
  if (hefh) return buildSevere(true);
  // 4. ldlRoute 未確定 → 'provisional'（spec_addendum_v2 §B-9。旧: incomplete。fix_round1 A1 の
  //    方針「LDL-C 未確定のまま確定的な推奨や目標を出さない」は維持し、リスクだけ出す）
  if (ldlRoute === null) {
    return buildProvisional();
  }
  // 5. ldlRoute >= 190
  if (ldlRoute >= 190) return buildSevere(false);
  // 6.（spec_addendum_v2 §B-2: dm はチェックボックス。未チェック=false のため incomplete 分岐は無い）
  // 7. dm===true
  if (dm === true) return buildDiabetes();
  // 8. CKD G3a-G5, 40-75, LDL 70-189
  if (CKD_ADVANCED.includes(ckd) && age >= 40 && age <= 75 && ldlRoute >= 70 && ldlRoute <= 189) return buildCkd();
  // 9. dialysis
  if (ckd === 'dialysis') return buildDialysis();
  // 10. hiv 40-75
  if (hiv && age >= 40 && age <= 75) return buildHiv();
  // fix_round2 R-A8: HFrEF は独立した経路にしない。通常どおり振り分ける（下の各ルートへ）。
  // 12. age <=29
  if (age <= 29) return buildYoung();
  // 13. age >=80
  if (age >= 80) return buildElderly();
  // 14. cac >= 300
  if (cac !== null && cac >= 300) return buildSubclinical();
  // 15. ldlRoute < 70 かつ (statin!==true または ldlBaseline あり)
  if (ldlRoute < 70 && (statin !== true || ldlBaseline !== null)) return buildLdlLt70();
  // 16. primary
  return buildPrimary();

  function incompleteResult(missing) {
    return {
      route: 'incomplete', missing, title: null, sub: null, color: null, category: null,
      prevent: { ok: false }, vhr: null, goal: null, optionalGoal: null,
      recs: [], alsoApplies: [], addOnSteps: null, enhancers: null, notes: [],
      assumed: [], required: [],
      ldlCurrent, ldlSource, nonHdl, nonHdlSrc, ldlBaseline, ldlRoute, egfrUsed, egfrSource, cr, egfrLabValue: egfrLab,
      reductionPct, tgOver800, ldlSampson, dmEnhLabels,
    };
  }

  /* ============================================================
     共通の後処理: TG 注記・妊娠・Lp(a)・HFrEF 併存 など（§5.9, §8.12）
     ============================================================ */
  function commonAlsoApplies(route) {
    const also = [];
    if (route !== 'ckd' && CKD_ADVANCED.includes(ckd) && age !== null && age >= 40 && age <= 75 && ldlRoute !== null && ldlRoute >= 70 && ldlRoute <= 189 && route !== 'secondary') {
      also.push({ id: 'K40' });
    }
    if (route !== 'dialysis' && ckd === 'dialysis' && route !== 'secondary') also.push({ id: 'KHD' });
    if (route !== 'hiv' && hiv && age !== null && age >= 40 && age <= 75 && route !== 'secondary') also.push({ id: 'H40' });
    return also;
  }

  // fix_round2 R-A8: HFrEF にチェックがある場合は経路を問わず（incomplete を除く）
  // 常に HF_NB（条件付き）と固定注記を付ける。
  // fix_round3 item3: route==='secondary' では HF_NB を出さない（臨床的ASCVDがある時点で
  // conditional「臨床的ASCVDも他のLLT適応も無い場合」は成立し得ないため）。
  // spec_addendum_v2 §A-2（NOTE_HFREF_CAVEAT 行）: fix_round3 item3 の「secondary でも
  // NOTE_HFREF_CAVEAT は出す」を上書きし、secondary では注記も出さない（臨床的ASCVD 自体が
  // LLT の適応なので行動が変わらない）。
  function hfrefAlso(route) {
    return (hfref && route !== 'incomplete' && route !== 'secondary')
      ? [{ id: 'HF_NB', conditional: '臨床的ASCVDも他のLLT適応も無い場合' }] : [];
  }
  function hfrefNotes(route) {
    return (hfref && route !== 'incomplete' && route !== 'secondary') ? [NOTES.NOTE_HFREF_CAVEAT] : [];
  }

  function tgRecs() {
    const recs = [];
    if (tg !== null) {
      if (tg >= 150) recs.push({ id: 'TG_NONHDL' });
      if (fasting === 'casual' && tg >= 400) recs.push({ id: 'TG_FAST' });
      if (tg >= 500) recs.push({ id: 'TG_SEVERE' });
      if (tg >= 1000 && fasting === 'fasting') recs.push({ id: 'TG_RDN' });
      // fix_round1 B4 / fix_round2 R-TG: 追加の高 TG 関連推奨（#69 p58, #109・#111 p83）
      if (dm === true && !hasAscvd && statin === true && ldlCurrent !== null && ldlCurrent < 100 && tg >= 150 && tg <= 499) {
        // fix_round2 R-TG: 条件文に「空腹時 TG」を明記
        recs.push({ id: 'TG_DM_IPE', conditional: '空腹時TGかつ追加のASCVD危険因子がある場合' });
      }
      if (hasAscvd && statin === true && ldlCurrent !== null && ldlCurrent >= 55 && nonHdl !== null && nonHdl >= 85 && tg >= 150 && tg <= 999) {
        recs.push({ id: 'TG_SEC_INTENSIFY' });
      }
      if ((hasAscvd || dm === true) && age !== null && age >= 50 && statin === true && ldlCurrent !== null && ldlCurrent < 100 && tg >= 150 && tg <= 499) {
        // fix_round2 R-TG: 糖尿病のみ（ASCVD なし）の場合は「ASCVD 危険因子1つ以上がある場合」を付ける
        if (dm === true && !hasAscvd) {
          recs.push({ id: 'TG_IPE_50', conditional: 'ASCVD危険因子1つ以上がある場合' });
        } else {
          recs.push({ id: 'TG_IPE_50' });
        }
      }
    }
    return recs;
  }

  function pregAlso() {
    if (sex === 'female' && preg) return [{ id: 'PREG_STOP' }, { id: 'PREG_CONT' }, { id: 'PREG_BAS' }];
    return [];
  }

  function lpaAlso(excludeLpa1) {
    const also = [];
    if (!excludeLpa1 && lpaHighFlag) also.push({ id: 'LPA1' });
    return also;
  }

  function lpaNotes() {
    return lpaReferFlag ? [NOTES.NOTE_LPA_REFER] : [];
  }

  // fix_round1 A11 / fix_round2 R-A11: 開始・追加の推奨には「妊娠中は表20に従う」を前置する
  // （生活習慣の話し合い・二次性原因の検索・専門医紹介など薬物療法そのものではないものは除く）
  function pregWrap(recs) {
    if (!pregFlag) return recs;
    return recs.map((r) => (PREG_WRAP_EXCLUDE.includes(r.id) ? r : {
      ...r,
      conditional: r.conditional ? `妊娠中は表20に従う・${r.conditional}` : '妊娠中は表20に従う',
    }));
  }
  // fix_round2 R-A11: 「他に該当する推奨」のうち薬物療法系（TG_SEVERE のフィブラート、K40、H40、IPE 系）にも前置する
  function pregWrapAlso(items) {
    if (!pregFlag) return items;
    return items.map((r) => (PREG_WRAP_ALSO_INCLUDE.includes(r.id) ? {
      ...r,
      conditional: r.conditional ? `妊娠中は表20に従う・${r.conditional}` : '妊娠中は表20に従う',
    } : r));
  }

  function dedupeById(list) {
    const seen = new Set();
    return list.filter((x) => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
  }

  function finalize(base) {
    const route = base.route;
    // fix_round1 B4: TG に関する注記は「他に該当する推奨」欄へ
    const also = dedupeById(pregWrapAlso([
      ...(base.alsoApplies || []), ...commonAlsoApplies(route), ...pregAlso(), ...lpaAlso(base._lpa1InRecs),
      ...tgRecs(), ...hfrefAlso(route),
    ]));
    const extraNotes = [...lpaNotes(), ...hfrefNotes(route)];
    const recs = dedupeById(pregWrap(base.recs || []));
    // spec_addendum_v2 §A-2: goalNotes（NOTE_INTENSITY・NOTE_GOAL_BOTH・NOTE_MONITOR）は削除（mdx 補足へ移設）
    const prevent = base.prevent || { ok: false };
    // spec_addendum_v2 §B-7: 全経路共通の「仮定値」「最低限追加すべき評価項目」
    const assumed = (prevent.provisional && prevent.provisional.assumed) ? prevent.provisional.assumed : [];
    const requiredParts = [];
    if (route === 'provisional') requiredParts.push('LDL-C');
    if (prevent.missing) requiredParts.push(...prevent.missing);
    if (prevent.provisional && !prevent.provisional.stable) requiredParts.push(...prevent.provisional.required);
    if (base._secondaryRequired) requiredParts.push(...base._secondaryRequired);
    // fix_v2_round1 M1/M2: ldl_lt70・primary（スタチン内服未入力）、secondary（高リスク状態未確認）を
    // 汎用の「経路固有の必須確認項目」として required に合流させる
    if (base._extraRequired) requiredParts.push(...base._extraRequired);
    // fix_v2_round1 follow-up（2026-09-27）: 変動要因としての「スタチン内服」（provisional.required）と
    // M1 の「スタチン内服の有無」／「スタチン内服の有無（内服中なら治療前 LDL-C）」が両方入るときは、
    // M1 側の文言だけを残す（重複除去）。表示位置は早い方（通常は provisional.required 側）を使う。
    const STATIN_PLAIN = 'スタチン内服';
    const STATIN_M1_VARIANTS = ['スタチン内服の有無', 'スタチン内服の有無（内服中なら治療前 LDL-C）'];
    const statinPlainIdx = requiredParts.indexOf(STATIN_PLAIN);
    const statinM1Idx = requiredParts.findIndex((x) => STATIN_M1_VARIANTS.includes(x));
    let mergedRequiredParts = requiredParts;
    if (statinPlainIdx !== -1 && statinM1Idx !== -1) {
      const keepIdx = Math.min(statinPlainIdx, statinM1Idx);
      const dropIdx = Math.max(statinPlainIdx, statinM1Idx);
      const m1Text = requiredParts[statinM1Idx];
      mergedRequiredParts = requiredParts
        .map((x, i) => (i === keepIdx ? m1Text : x))
        .filter((x, i) => i !== dropIdx);
    }
    const required = [...new Set(mergedRequiredParts)];
    // spec_addendum_v2 §A-2 NOTE_STATIN_BASELINE: A13（primary の outOfLdlRange）では
    // NOTE_PRIMARY_LDL_LOW_CONTINUE と重複するため出さない
    const sharedNotes = base._excludeSharedNotes ? notes.filter((n) => !base._excludeSharedNotes.includes(n)) : notes;
    return {
      route,
      missing: base.missing || [],
      title: base.title, sub: base.sub, color: base.color,
      category: base.category || null,
      prevent,
      vhr: base.vhr || null,
      goal: base.goal || null,
      optionalGoal: base.optionalGoal || null,
      recs,
      alsoApplies: also,
      addOnSteps: base.addOnSteps || null,
      enhancers: base.enhancers !== undefined ? base.enhancers : null,
      notes: [...sharedNotes, ...(base.notes || []), ...extraNotes],
      assumed, required,
      ldlCurrent, ldlSource, nonHdl, nonHdlSrc, ldlBaseline, ldlRoute, egfrUsed, egfrSource, cr, egfrLabValue: egfrLab,
      reductionPct, tgOver800, ldlSampson, dmEnhLabels, age, hfref, cacValue: cac,
      vhrDetail: base.vhrDetail || null,
      // fix_round1/2 C3, fix_round3 item1: 高齢者 CAC 強調は applyCac が実際に
      // O_ELDER_CAC を付けた（elderLowCac が立った）route でのみ true にする
      elderCacEmphasis: route !== 'incomplete' && lastElderLowCac,
      hefhCalcified: !!base._hefhCalcified,
    };
  }

  /* ---------------- 0. secondary（§7） ---------------- */
  function buildSecondary() {
    let kind;
    const ckdSevere = CKD_ADVANCED.includes(ckd) || ckd === 'dialysis';
    const severeFh = hefh || (ldlRoute !== null && ldlRoute >= 190);
    if (vhr) kind = 'vhr';
    else if (ckdSevere) kind = 'ckd';
    else if (severeFh) kind = 'severe';
    else kind = 'nvh';

    let title; let sub; let color = '#C62828';
    let mainRecs = [];
    let goal; let optionalGoal = null; let addOnSteps = null;
    const localNotes = [];

    // 判定ボックス2行目（§7.2）: vhr は件数のみ、それ以外（nvh 等）は「超高リスク基準を満たさない」を付す。
    // 主要イベントが0件のときは、どの kind でも「（主要ASCVDイベントなし）」を併記する（§7.1）。
    function evtLine(noVhrSuffix) {
      let s = `主要ASCVDイベント ${majorCount}・高リスク状態 ${hrCount}`;
      if (!noVhrSuffix) s += '（超高リスク基準を満たさない）';
      if (majorCount === 0) s += '（主要ASCVDイベントなし）';
      return s;
    }

    if (kind === 'vhr') {
      title = '二次予防 超高リスク';
      sub = evtLine(true);
      color = '#8E0000';
      mainRecs = ['SEC_VH_STATIN', 'SEC_VH_ADD', 'SEC_VH_INCL', 'SEC_VH_BEMP'];
      if (ckdSevere) mainRecs.push('K_ASCVD');
      if (severeFh) mainRecs.push('F_55');
      goal = makeGoal(55, 85, '≥50%', 55, 'SEC_VH_STATIN');
      addOnSteps = FIG11_STEPS;
      // spec_addendum_v2 §A-2: NOTE_EZE_NOT_REQUIRED は削除（図11/図12 の追加手順で読める）
      // fix_round2 R-A12: 超高リスク（vhr）でも維持透析なら KHD と NOTE_HD_START を併記
      if (ckd === 'dialysis') {
        mainRecs.push('KHD');
        localNotes.push(NOTES.NOTE_HD_START);
      }
    } else if (kind === 'ckd') {
      title = '二次予防 CKD合併（超高リスクの経路）';
      sub = evtLine(true);
      color = '#8E0000';
      mainRecs = ['K_ASCVD', 'SEC_VH_ADD', 'SEC_VH_INCL', 'SEC_VH_BEMP'];
      goal = makeGoal(55, 85, '≥50%', 55, 'K_ASCVD');
      addOnSteps = FIG11_STEPS;
      // spec_addendum_v2 §A-2: NOTE_EZE_NOT_REQUIRED は削除
      // fix_round1 A12: 維持透析＋臨床的ASCVD は K_ASCVD に加え KHD と NOTE_HD_START を併記
      if (ckd === 'dialysis') {
        mainRecs.push('KHD');
        localNotes.push(NOTES.NOTE_HD_START);
      }
    } else if (kind === 'severe') {
      title = '二次予防 重症高コレステロール血症／HeFH 合併';
      sub = evtLine(true);
      color = '#8E0000';
      mainRecs = ['F_STATIN', 'F_55', 'F_INCL'];
      goal = makeGoal(55, 85, null, 55, 'F_55');
    } else {
      title = '二次予防（超高リスクでない）';
      sub = evtLine(false);
      color = '#C62828';
      mainRecs = ['SEC_NVH_STATIN', 'SEC_NVH_ADD', 'SEC_NVH_INCL'];
      goal = makeGoal(70, 100, '≥50%', 70, 'SEC_NVH_STATIN');
      optionalGoal = makeGoal(55, 85, null, 55, 'SEC_NVH_OPT');
      addOnSteps = FIG12_STEPS;
      // spec_addendum_v2 §A-2: NOTE_EZE_NOT_REQUIRED は削除
      // fix_round2 R-A12: 非超高リスク（nvh）でも維持透析なら KHD と NOTE_HD_START を併記
      // （実際には ckdSevere が先に kind='ckd' を確定させるため到達しないが、仕様の明記どおり実装）
      if (ckd === 'dialysis') {
        mainRecs.push('KHD');
        localNotes.push(NOTES.NOTE_HD_START);
      }
    }

    // §7.4: Lp(a) 高値で主目標未達 → SEC_LPA
    let lpa1InRecs = false;
    if (lpaHighFlag) {
      const notAttained = (attain(ldlCurrent, goal.ldl) === '未達') || (attain(nonHdl, goal.nonHdl) === '未達');
      if (notAttained) { mainRecs.push('SEC_LPA'); lpa1InRecs = false; }
    }
    if (age !== null && age >= 76) mainRecs.push('O_ELDER_DISC');

    // spec_addendum_v2 §B-8: 二次予防の未入力（年齢・喫煙・LDL-C）。分かれば超高リスクになりうる
    // （!vhr && majorCount===1 && hrCount+未入力数>=2）ときだけ required に入れる。
    const missingHr = [];
    if (age === null) missingHr.push('年齢');
    if (smoking === null) missingHr.push('喫煙');
    if (maxStatinEze && ldlCurrent === null) missingHr.push('LDL-C');
    const secondaryRequired = (!vhr && majorCount === 1 && (hrCount + missingHr.length) >= 2) ? [...missingHr] : [];
    // fix_v2_round1 M2: 主要イベント1件・高リスク状態0〜1件のときは、高リスク状態そのものの
    // 確認（未確認の可能性）を required に加える（missingHr の有無に関わらず独立して適用）
    if (!vhr && majorCount === 1 && hrCount <= 1) {
      secondaryRequired.push('高リスク状態の確認（糖尿病・高血圧・CABG/PCI・心不全）');
    }

    return finalize({
      route: 'secondary',
      title, sub, color,
      prevent: { ok: false, reason: 'PREVENT_NA_ASCVD' },
      vhr: { vhr, kind, majorItems, hrItems, majorCount, hrCount, vhrFootnote },
      goal, optionalGoal,
      recs: mainRecs.map((id) => ({ id })),
      addOnSteps,
      enhancers: null,
      notes: localNotes,
      _lpa1InRecs: lpa1InRecs,
      _secondaryRequired: secondaryRequired,
    });
  }

  /* ---------------- HoFH ---------------- */
  function buildHofh() {
    return finalize({
      route: 'hofh',
      title: 'HoFH（ホモ接合体家族性高コレステロール血症）',
      sub: '脂質専門医へのコンサルトを推奨',
      color: '#B71C1C',
      prevent: { ok: false, reason: 'PREVENT_NA_FH' },
      goal: null,
      recs: [{ id: 'HO_CONSULT' }, { id: 'HO_STATIN' }, { id: 'HO_ADD' }],
      enhancers: null,
      notes: [],
    });
  }

  /* ---------------- 重症高コレステロール血症／HeFH（route: severe） ---------------- */
  function buildSevere(isHefh) {
    const calcified = (cac !== null && cac >= 1) || incidCac !== 'none';
    const recs = [];
    recs.push({ id: 'F_SEC' }, { id: 'F_STATIN' });
    if (!isHefh) recs.push({ id: 'F_GEN' });

    // fix_round1 A4: #57/#58（F_100/F_70）は既存の RECS カタログにあるが推奨一覧に出ていなかった
    // ため追加する。HeFH または冠動脈石灰化ありなら F_70 のみ（判定理由を表示）、
    // それ以外は F_100/F_70 の2段（条件文で表示）。
    let goal;
    const localNotes = [];
    if (isHefh || calcified) {
      const reason = isHefh ? 'HeFH' : '冠動脈石灰化あり';
      recs.push({ id: 'F_70', conditional: reason });
      goal = makeGoal(70, 100, null, null, 'F_70');
    } else {
      recs.push({ id: 'F_100', conditional: '追加のASCVD危険因子・HeFH・無症候性動脈硬化がいずれも無い場合' });
      recs.push({ id: 'F_70', conditional: '追加の危険因子がある場合' });
      goal = makeGoal(70, 100, null, null, 'F_70', '（追加危険因子の有無で <100 も可: 臨床判断）');
    }
    recs.push({ id: 'F_INCL' });
    if (isHefh) recs.push({ id: 'F_NOPREVENT' });

    if (cac !== null && cac === 0) localNotes.push(NOTES.NOTE_CAC0_FH);
    // spec_addendum_v2 §A-2: NOTE_FH_CONSIDER は削除（推奨 F_GEN が同じ経路で既に出ている）

    const title = isHefh ? 'HeFH（家族性高コレステロール血症）' : '重症高コレステロール血症（LDL-C ≥190 mg/dL）';

    return finalize({
      route: 'severe',
      title, sub: 'PREVENT-ASCVD は用いない', color: '#B71C1C',
      prevent: { ok: false, reason: isHefh ? 'PREVENT_NA_FH' : 'PREVENT_NA_LDL190' },
      goal,
      recs,
      enhancers: null,
      notes: localNotes,
      _hefhCalcified: isHefh || calcified,
    });
  }

  /* ---------------- 糖尿病（route: diabetes） ---------------- */
  function buildDiabetes() {
    const recs = [];
    let goal = null;
    const localNotes = [];
    let prevent = { ok: false, reason: 'PREVENT_NA_AGE' };
    let sub = '';
    let provisionalStable = true; // 暫定だが判定が変わらないときだけ title に「（暫定入力あり）」を付ける
    let hasProvisional = false;

    if (age <= 29) {
      if (dmEnhAny) recs.push('D_20'); else recs.push('D_COUNSEL');
      prevent = { ok: false, reason: 'PREVENT_NA_AGE' };
    } else if (age <= 39) {
      const c = computePrevent('dm3039');
      prevent = c;
      if (c.provisional) { hasProvisional = true; provisionalStable = c.provisional.stable; }
      let anyShown = false;
      if (dmEnhAny) { recs.push('D_20'); anyShown = true; }
      if (c.ok && (!c.provisional || c.provisional.stable)) {
        const highRisk10 = c.ascvd10 >= 3.0;
        const highRisk30 = c.ascvd30 !== null && c.ascvd30 >= 10.0;
        if (highRisk10 || highRisk30) { recs.push('D_30PREVENT'); anyShown = true; }
      } else if (c.ok && c.provisional && !c.provisional.stable) {
        // spec_addendum_v2 §B-7: open のときの条件文（逐語）
        const [a10, b10] = c.provisional.range10;
        const r30txt = c.provisional.range30 ? `・30年 ${c.provisional.range30[0].toFixed(1)}〜${c.provisional.range30[1].toFixed(1)}%` : '';
        recs.push({ id: 'D_30PREVENT', conditional: `PREVENT 10年 ≥3% または 30年 ≥10% の場合（暫定 10年 ${a10.toFixed(1)}〜${b10.toFixed(1)}%${r30txt}）` });
        anyShown = true;
      } else if (!c.ok) {
        const why = c.missing ? `未入力項目 ${c.missing.join('・')}` : PREVENT_NA[c.reason];
        recs.push({ id: 'D_30PREVENT', conditional: `PREVENT 10年 ≥3% または 30年 ≥10% の場合（PREVENT 未計算: ${why}）` });
        anyShown = true;
      }
      if (!anyShown) recs.push('D_COUNSEL');
    } else if (age <= 75) {
      recs.push('D_40');
      // fix_round1 A7: 任意 apoB（<90/<70）は TG 条件なしで表示（図1・図9）
      goal = makeGoal(100, 130, '30〜49%', 90, 'D_40');
      const c = computePrevent('dm4075');
      prevent = c;
      if (c.provisional) { hasProvisional = true; provisionalStable = c.provisional.stable; }
      const highRiskDm = dmEnhAny;
      if (c.ok && c.provisional && !c.provisional.stable && !highRiskDm) {
        // spec_addendum_v2 §B-7: open のときは D_HIGH を条件付きにし、D_ADD は出さない
        const [a10, b10] = c.provisional.range10;
        recs.push({ id: 'D_HIGH', conditional: `複数のASCVD危険因子がある場合（PREVENT 暫定 10年 ${a10.toFixed(1)}〜${b10.toFixed(1)}%）` });
      } else if (highRiskDm || (c.ok && c.ascvd10 >= 10.0 && (!c.provisional || c.provisional.stable))) {
        recs.push('D_HIGH');
        goal = makeGoal(70, 100, '≥50%', 70, 'D_HIGH');
        if (c.ok && c.ascvd10 >= 10.0 && (!c.provisional || c.provisional.stable)) recs.push('D_ADD');
      } else {
        recs.push({ id: 'D_HIGH', conditional: '複数のASCVD危険因子がある場合' });
      }
      // spec_addendum_v2 §A-2（MOVE）: 「（参考: 一次予防区分 …）」は注記から判定ボックス2行目（sub）へ
      if (c.ok) {
        const lo = c.provisional ? c.provisional.range10[0] : c.ascvd10;
        const hi = c.provisional ? c.provisional.range10[1] : c.ascvd10;
        sub = `参考: 一次予防区分 ${catRangeLabel(lo, hi)}相当`;
      }
    } else {
      recs.push('D_DISC', 'D_75');
      prevent = { ok: false, reason: 'PREVENT_NA_AGE' };
      if (age <= 79) {
        // spec_addendum_v2 §B-6: 76〜79歳は kind=null（PREVENT は参考表示のみ、暫定でも常に stable）
        const c = computePrevent(null);
        if (c.ok) {
          prevent = c;
          if (c.provisional) { hasProvisional = true; provisionalStable = true; }
        }
      }
    }
    recs.push('D_SIDE');

    // CAC 併用（§6.4 は diabetes にも適用）
    let optionalGoal = null;
    if (cac !== null || incidCac !== 'none') {
      if (cac === 0) {
        // fix_round1 C6: §6.5 の糖尿病向け規定は「age>40」のみ（汎用 highRiskStateCac0() の
        // 他項目 ldlRoute≥190/hefh/喫煙/enh_fhx は primary 専用のため diabetes には使わない）
        if (age !== null && age > 40) localNotes.push(NOTES.NOTE_CAC0_HIGHRISK(['糖尿病かつ40歳超']));
        // spec_addendum_v2 §A-2: NOTE_CAROTID は primary の CAC_ZERO 併記時だけ（ここでは出さない）
        const cacRes0 = applyCac(null, true);
        cacRes0.extraRecs.forEach((id) => recs.push(id)); // fix_round2 R-A10: O_ELDER_CAC(76-79歳+CAC0)を拾う
        localNotes.push(...cacRes0.extraNotes);
      } else {
        const cacRes = applyCac(null, true);
        cacRes.extraRecs.forEach((id) => recs.push(id));
        localNotes.push(...cacRes.extraNotes);
        if (cacRes.candidateGoal) {
          goal = pickLowerGoal([goal, cacRes.candidateGoal]);
          if (cacRes.optionalGoal) optionalGoal = cacRes.optionalGoal;
        }
      }
    }

    // spec_addendum_v2 §B-7: 暫定かつ stable のときだけ title 末尾に「（暫定入力あり）」を付ける
    const titleSuffix = (hasProvisional && provisionalStable) ? '（暫定入力あり）' : '';
    const title = `糖尿病（ASCVDなし）${ageBandLabelForDiabetes(age)}${titleSuffix}`;
    return finalize({
      route: 'diabetes',
      title, sub, color: '#C62828',
      prevent,
      goal, optionalGoal,
      recs: recs.map((r) => (typeof r === 'string' ? { id: r } : r)),
      enhancers: null,
      notes: localNotes,
    });
  }

  /* ---------------- CKD（route: ckd） ---------------- */
  function buildCkd() {
    const c = computePrevent('primary');
    const ref = primaryReferenceForOther(c);
    const localNotes = [...ref.notes];
    const titleSuffix = (c.provisional && c.provisional.stable) ? '（暫定入力あり）' : '';
    return finalize({
      route: 'ckd',
      title: `CKD ${CKD_STAGE_LABEL[ckd]}（ASCVDなし）${titleSuffix}`,
      sub: '40〜75歳・LDL-C 70〜189 mg/dL',
      color: '#E65100',
      prevent: c,
      category: ref.category,
      goal: ref.goal,
      optionalGoal: ref.optionalGoal,
      recs: [{ id: 'K40' }, ...ref.recIds],
      enhancers: null,
      notes: localNotes,
    });
  }

  /**
   * fix_round1 A3/A9: CKD・HIV ルートの「一次予防区分による参考」。
   * 「開始するかどうか」に関わる推奨（P_LIFE/P_LOW_COUNSEL/P_BORDER_STATIN/CAC_UNCERTAIN）は
   * 出さず、強度・目標の参考のみとする。CAC/偶発的CAC は PREVENT が理由付きで適用外
   * （CAC≥300 など）でも目標を採る。HIV で LDL<70（outOfLdlRange）の場合は区分別推奨・目標を採用しない。
   * spec_addendum_v2 §B-7: open（判定が変わりうる暫定）のときも区分別推奨・目標を出さない。
   */
  function primaryReferenceForOther(c) {
    let category = null;
    let goal = null;
    let optionalGoal = null;
    const recIds = [];
    const notesOut = [];
    if (c.ok && !c.outOfLdlRange && (c.provisional === null || c.provisional.stable)) {
      category = categoryFromRisk(c.ascvd10);
      const built = primaryCategoryRecs(category, c);
      const filtered = built.recIds.filter((id) => !START_DECISION_RECS.includes(id));
      filtered.forEach((id, i) => recIds.push(i === 0 ? { id, conditional: '一次予防区分による参考' } : { id }));
      goal = built.goal;
    }
    // fix_round2 R-C6: CKD・HIV で CAC 0 のとき applyCac の注記（NOTE_CAC_AGE・偶発的 CAC 無視、
    // および R-A10 の O_ELDER_CAC）を捨てない。spec_addendum_v2 §A-2: NOTE_CAROTID はここでは出さない
    // （primary の CAC_ZERO 併記時だけに限定）
    if (cac === 0) {
      const cacRes0 = applyCac(category, true);
      cacRes0.extraRecs.forEach((id) => recIds.push({ id }));
      notesOut.push(...cacRes0.extraNotes);
    } else if (cac !== null) {
      const cacRes = applyCac(category, true);
      cacRes.extraRecs.forEach((id) => recIds.push({ id }));
      notesOut.push(...cacRes.extraNotes);
      if (cacRes.candidateGoal) {
        goal = pickLowerGoal([goal, cacRes.candidateGoal]);
        if (cacRes.optionalGoal) optionalGoal = cacRes.optionalGoal;
      }
    } else if (incidCac !== 'none') {
      const cacRes = applyCac(category, true);
      cacRes.extraRecs.forEach((id) => recIds.push({ id }));
      notesOut.push(...cacRes.extraNotes);
      if (cacRes.candidateGoal) goal = pickLowerGoal([goal, cacRes.candidateGoal]);
    }
    return { category, goal, optionalGoal, recIds, notes: notesOut };
  }

  /* ---------------- 維持透析（route: dialysis） ---------------- */
  function buildDialysis() {
    return finalize({
      route: 'dialysis',
      title: '維持透析（ASCVDなし）', sub: 'PREVENT-ASCVD は用いない', color: '#546E7A',
      prevent: { ok: false, reason: 'PREVENT_NA_ESKD' },
      goal: null,
      recs: [{ id: 'KHD' }],
      enhancers: null,
      notes: [NOTES.NOTE_HD_START],
    });
  }

  /* ---------------- HIV（route: hiv） ---------------- */
  function buildHiv() {
    const c = computePrevent('primary');
    const ref = primaryReferenceForOther(c);
    const titleSuffix = (c.provisional && c.provisional.stable) ? '（暫定入力あり）' : '';
    return finalize({
      route: 'hiv',
      title: `HIV 感染症（安定したART中）40〜75歳${titleSuffix}`, sub: '', color: '#E65100',
      prevent: c,
      category: ref.category,
      goal: ref.goal,
      optionalGoal: ref.optionalGoal,
      recs: [{ id: 'H40' }, ...ref.recIds],
      enhancers: null,
      // spec_addendum_v2 §A-2: NOTE_HIV_REPRIEVE は削除（出典の説明のみ）
      notes: [NOTES.NOTE_HIV_DDI, ...ref.notes],
    });
  }

  /* ---------------- 20〜29歳（route: young） ---------------- */
  function buildYoung() {
    const recs = ['Y_LIFE'];
    // spec_addendum_v2 §A-2: NOTE_YOUNG_LLT は削除（行動に効く部分は NOTE_TAKEHOME1 が担う）
    const localNotes = [];
    if ((ldlRoute !== null && ldlRoute >= 160) || enhancerFlags.enh_fhx) localNotes.push(NOTES.NOTE_TAKEHOME1);
    let goal = null;
    if (cac !== null || incidCac !== 'none') {
      if (cac === 0) {
        // spec_addendum_v2 §A-2: NOTE_CAROTID はここでは出さない（primary の CAC_ZERO 併記時だけ）
        localNotes.push(...applyCac(null, true).extraNotes);
      } else {
        const cacRes = applyCac(null, true);
        cacRes.extraRecs.forEach((id) => recs.push(id));
        localNotes.push(...cacRes.extraNotes);
        goal = cacRes.candidateGoal;
      }
    }
    return finalize({
      route: 'young',
      title: '若年成人（20〜29歳）', sub: 'PREVENT-ASCVD の適用年齢外（30〜79歳）', color: '#546E7A',
      prevent: { ok: false, reason: 'PREVENT_NA_AGE' },
      goal,
      recs: recs.map((id) => ({ id })),
      enhancers: null,
      notes: localNotes,
    });
  }

  /* ---------------- 80歳以上（route: elderly） ---------------- */
  function buildElderly() {
    // fix_round2 R-A10: 80歳以上は常に age>75 のため applyCac 側の elderLowCac が CAC 0〜10 を
    // 一括処理する（O_ELDER_CAC は finalize() の dedupeById でベースの列挙と重複排除される）。
    const recs = ['O_ELDER_DISC', 'O_ELDER_START', 'O_ELDER_CAC', 'O_LIFE1'];
    const localNotes = [];
    let goal = null;
    // spec_addendum_v2 §A-2: NOTE_CAROTID はここでは出さない（primary の CAC_ZERO 併記時だけ）
    if (cac !== null || incidCac !== 'none') {
      const cacRes = applyCac(null, true);
      cacRes.extraRecs.forEach((id) => recs.push(id));
      localNotes.push(...cacRes.extraNotes);
      if (cacRes.candidateGoal) goal = cacRes.candidateGoal;
      // >75歳の新規開始は 2b の注記は、測定 CAC>10 による新規開始だけでなく
      // 偶発的CAC（軽度／中等度〜高度）による新規開始でも出す（cac=0〜10 の elderLowCac は R-A10 により対象外）
      if ((cac !== null && cac > 10) || (cac === null && (incidCac === 'mild' || incidCac === 'modsev'))) {
        localNotes.push(NOTES.NOTE_ELDER_CAC_POS);
      }
    }
    return finalize({
      route: 'elderly',
      title: '80歳以上（ASCVDなし）', sub: 'PREVENT-ASCVD の適用年齢外（30〜79歳）', color: '#546E7A',
      prevent: { ok: false, reason: 'PREVENT_NA_AGE' },
      goal,
      recs: recs.map((id) => ({ id })),
      enhancers: null,
      notes: localNotes,
    });
  }

  /* ---------------- 無症候性冠動脈硬化（route: subclinical） ---------------- */
  function buildSubclinical() {
    const cacRes = applyCac(null, true);
    const extensive = cac >= 1000;
    return finalize({
      route: 'subclinical',
      title: extensive ? '無症候性冠動脈硬化（CAC ≥1000: extensive）' : '無症候性冠動脈硬化（CAC 300〜999: severe）',
      sub: 'PREVENT-ASCVD は用いない（AHA: CAC ≥300 は適用外）',
      color: '#C62828',
      prevent: { ok: false, reason: 'PREVENT_NA_CAC300' },
      goal: cacRes.candidateGoal,
      optionalGoal: cacRes.optionalGoal,
      recs: cacRes.extraRecs.map((id) => ({ id })),
      enhancers: null,
      notes: cacRes.extraNotes,
    });
  }

  /* ---------------- LDL-C <70（route: ldl_lt70） ---------------- */
  function buildLdlLt70() {
    const recs = [];
    const localNotes = [];
    // fix_v2_round1 M1: スタチン内服の有無が未入力なら required で確認を求め、
    // P_LDL70_NB（未治療前提の推奨）には「スタチン未内服の場合」の条件を付ける
    const extraRequired = [];
    if (statin === null) extraRequired.push('スタチン内服の有無');
    if (nonHdl !== null && nonHdl < 100) {
      const cond = statin === null
        ? 'スタチン未内服の場合・追加のASCVD危険因子が無い場合'
        : '追加のASCVD危険因子が無い場合';
      recs.push({ id: 'P_LDL70_NB', conditional: cond });
    } else {
      localNotes.push(NOTES.NOTE_LDL70_NONHDL);
    }
    const c = computePrevent(null); // spec_addendum_v2 §B-6: ldl_lt70 は kind=null（常に stable）
    // fix_round1 A3: CAC 再分類・「低い方の目標を採る」を ldl_lt70 にも適用する
    let goal = null;
    let optionalGoal = null;
    if (cac !== null && cac !== 0) {
      const cacRes = applyCac(null, true);
      cacRes.extraRecs.forEach((id) => recs.push({ id }));
      localNotes.push(...cacRes.extraNotes);
      goal = cacRes.candidateGoal;
      optionalGoal = cacRes.optionalGoal;
    } else if (cac === null && incidCac !== 'none') {
      const cacRes = applyCac(null, true);
      cacRes.extraRecs.forEach((id) => recs.push({ id }));
      localNotes.push(...cacRes.extraNotes);
      goal = cacRes.candidateGoal;
    } else if (cac === 0) {
      // spec_addendum_v2 §A-2: NOTE_CAROTID はここでは出さない（primary の CAC_ZERO 併記時だけ）
      const cacRes0 = applyCac(null, true);
      cacRes0.extraRecs.forEach((id) => recs.push({ id })); // fix_round2 R-A10: O_ELDER_CAC(76-79歳)
      localNotes.push(...cacRes0.extraNotes);
    }
    return finalize({
      route: 'ldl_lt70',
      title: '一次予防 LDL-C <70 mg/dL',
      sub: 'PREVENT-ASCVD の区分推奨の適用範囲外（LDL-C 70〜189）',
      color: '#546E7A',
      prevent: c,
      goal,
      optionalGoal,
      recs,
      enhancers,
      notes: localNotes,
      _extraRequired: extraRequired,
    });
  }

  /* ---------------- LDL-C 未入力（route: provisional、spec_addendum_v2 §B-9） ---------------- */
  function buildProvisional() {
    let kind;
    if (dm) {
      if (age >= 30 && age <= 39) kind = 'dm3039';
      else if (age >= 40 && age <= 75) kind = 'dm4075';
      else kind = null;
    } else if (age >= 30 && age <= 79) {
      kind = 'primary';
    } else {
      kind = null;
    }
    const c = computePrevent(kind);
    let sub;
    if (c.ok) {
      const lo = c.provisional ? c.provisional.range10[0] : c.ascvd10;
      const hi = c.provisional ? c.provisional.range10[1] : c.ascvd10;
      sub = `LDL-C 70〜189 の場合: ${catRangeLabel(lo, hi)}`;
    } else if (c.reason) {
      sub = `PREVENT-ASCVD 適用外（${PREVENT_NA[c.reason]}）`;
    } else {
      sub = 'PREVENT 未計算';
    }
    return finalize({
      route: 'provisional',
      title: '暫定評価（LDL-C 未入力）',
      sub,
      color: '#546E7A',
      prevent: c,
      category: null,
      goal: null,
      recs: [],
      enhancers: null,
      notes: [],
    });
  }

  /* ---------------- 一次予防（route: primary） ---------------- */
  function buildPrimary() {
    const kindForPrimary = (ldlRoute !== null && ldlRoute < 70) ? null : 'primary';
    const c = computePrevent(kindForPrimary);
    // fix_v2_round1 M1: スタチン内服の有無が未入力（LDL 70〜189 経路）なら required で確認を求める
    const statinRequired = statin === null ? ['スタチン内服の有無（内服中なら治療前 LDL-C）'] : [];
    if (!c.ok && c.missing) {
      return incompleteResult(c.missing);
    }
    // spec_addendum_v2 §B-7: 暫定表示の共通書式（10年・30年の範囲つき）
    function provisionalSuffix(prefix) {
      if (!c.provisional) return '';
      let s = `${prefix} 暫定 10年 ${c.ascvd10.toFixed(1)}%（範囲 ${c.provisional.range10[0].toFixed(1)}〜${c.provisional.range10[1].toFixed(1)}%）`;
      if (c.provisional.range30) {
        s += ` / 30年 ${c.ascvd30.toFixed(1)}%（範囲 ${c.provisional.range30[0].toFixed(1)}〜${c.provisional.range30[1].toFixed(1)}%）`;
      }
      return s;
    }
    if (!c.ok && c.reason) {
      // fix_round1 A2: PREVENT が理由付きで適用外（eGFR<15・CKD G5 など、40〜75歳の CKD/HIV
      // ルートにも 30〜79歳の一般ルートにも該当しない年齢・入力の組み合わせ）。
      // カテゴリ・目標は計算できないため、健康行動の推奨と非適用理由のみ表示する。
      // fix_round2 R-C6: それでも CAC が入力されていれば CAC 由来の推奨・目標は出す
      // （例: 末期腎不全で PREVENT 非適用でも CAC ≥1 なら CAC の推奨を表示）。
      const recIds0 = ['P_LIFE'];
      let goal0 = null;
      let optionalGoal0 = null;
      const localNotes0 = [];
      if (cac === 0) {
        // spec_addendum_v2 §A-2: NOTE_CAROTID は primary の CAC_ZERO 併記時だけ（この分岐では
        // category が無いため CAC_ZERO は付かない＝出さない）
        const cacRes0 = applyCac(null, true);
        recIds0.push(...cacRes0.extraRecs);
        localNotes0.push(...cacRes0.extraNotes);
      } else if (cac !== null || incidCac !== 'none') {
        const cacRes = applyCac(null, true);
        recIds0.push(...cacRes.extraRecs);
        localNotes0.push(...cacRes.extraNotes);
        if (cacRes.candidateGoal) { goal0 = cacRes.candidateGoal; optionalGoal0 = cacRes.optionalGoal; }
      }
      return finalize({
        route: 'primary',
        title: '一次予防（30〜79歳・LDL-C 70〜189）',
        sub: 'PREVENT-ASCVD は計算できません',
        color: '#546E7A',
        category: null,
        prevent: c,
        goal: goal0,
        optionalGoal: optionalGoal0,
        recs: recIds0.map((id) => ({ id })),
        enhancers,
        notes: localNotes0,
        _extraRequired: statinRequired,
      });
    }
    // fix_round1 A13: statin 内服中・治療前値なし・ldlRoute<70 で primary に入るケース（§4.6）。
    // PREVENT は参考値、区分別の「開始」推奨は出さず継続を基本とする。
    if (c.outOfLdlRange) {
      const category = categoryFromRisk(c.ascvd10);
      const title = c.provisional
        ? `一次予防 ${CATEGORY_LABEL[category]}（参考値・暫定入力あり）`
        : `一次予防 ${CATEGORY_LABEL[category]}（参考値）`;
      const sub = c.provisional
        ? `${provisionalSuffix('PREVENT-ASCVD')}（LDL-C <70 のため参考値。区分適用範囲 70〜189 外）`
        : `PREVENT-ASCVD 10年 ${c.ascvd10.toFixed(1)}%（LDL-C <70 のため参考値。区分適用範囲 70〜189 外）`;
      return finalize({
        route: 'primary',
        title,
        sub,
        color: CATEGORY_COLOR[category],
        category,
        prevent: c,
        goal: null,
        recs: [{ id: 'P_LIFE' }],
        enhancers,
        notes: [NOTES.NOTE_PRIMARY_LDL_LOW_CONTINUE],
        // spec_addendum_v2 §A-2 NOTE_STATIN_BASELINE: A13 では NOTE_PRIMARY_LDL_LOW_CONTINUE と
        // 重複するため出さない
        _excludeSharedNotes: [NOTES.NOTE_STATIN_BASELINE],
        _extraRequired: statinRequired,
      });
    }

    // spec_addendum_v2 §B-7: open（判定が変わりうる）のときは「PREVENT が理由付きで適用外」と
    // 同じ中身（P_LIFE のみ・CAC 入力があれば CAC 由来の推奨/目標）にする。区分別の推奨・目標は出さない。
    const open = c.provisional && !c.provisional.stable;
    if (open) {
      const recIdsO = ['P_LIFE'];
      let goalO = null;
      let optionalGoalO = null;
      const localNotesO = [];
      if (cac === 0) {
        const cacRes0 = applyCac(null, true);
        recIdsO.push(...cacRes0.extraRecs);
        localNotesO.push(...cacRes0.extraNotes);
      } else if (cac !== null || incidCac !== 'none') {
        const cacRes = applyCac(null, true);
        recIdsO.push(...cacRes.extraRecs);
        localNotesO.push(...cacRes.extraNotes);
        if (cacRes.candidateGoal) { goalO = cacRes.candidateGoal; optionalGoalO = cacRes.optionalGoal; }
      }
      const [lo10, hi10] = c.provisional.range10;
      const catLo = categoryFromRisk(lo10);
      const catHi = categoryFromRisk(hi10);
      const title = catLo !== catHi
        ? `一次予防 リスク区分未確定（${catRangeLabel(lo10, hi10)}）`
        : `一次予防 ${CATEGORY_LABEL[catLo]}（30年リスク未確定）`;
      return finalize({
        route: 'primary',
        title,
        sub: provisionalSuffix('PREVENT-ASCVD'),
        color: '#546E7A',
        category: null,
        prevent: c,
        goal: goalO,
        optionalGoal: optionalGoalO,
        recs: recIdsO.map((id) => ({ id })),
        enhancers,
        notes: localNotesO,
        _extraRequired: statinRequired,
      });
    }

    const category = categoryFromRisk(c.ascvd10);
    const built = primaryCategoryRecs(category, c, true);
    const localNotes = [...built.notes];

    let goal = built.goal;
    let optionalGoal = null;
    let recIds = built.recIds;

    // CAC 再分類（§6.4〜6.6）
    if (cac !== null || incidCac !== 'none') {
      if (cac === 0) {
        const hi = highRiskStateCac0();
        if (category === 'borderline' || category === 'intermediate') {
          if (hi.length === 0) {
            recIds = recIds.filter((id) => id !== 'CAC_UNCERTAIN');
            recIds.push('CAC_ZERO');
            // spec_addendum_v2 §A-2: NOTE_CAROTID は CAC_ZERO を実際に付けたときだけ出す（1か所限定）
            localNotes.push(NOTES.NOTE_CAROTID);
          } else {
            localNotes.push(NOTES.NOTE_CAC0_HIGHRISK(hi));
          }
        }
        // spec_addendum_v2 §A-2: NOTE_CAC0_OTHER は削除（low/high 区分での CAC=0 の定型説明）
        const cacRes0 = applyCac(category, true);
        recIds.push(...cacRes0.extraRecs); // fix_round2 R-A10: O_ELDER_CAC（76-79歳）
        localNotes.push(...cacRes0.extraNotes);
      } else {
        const cacRes = applyCac(category, true);
        recIds = recIds.filter((id) => !(cac >= 1 && id === 'CAC_UNCERTAIN'));
        recIds.push(...cacRes.extraRecs);
        localNotes.push(...cacRes.extraNotes);
        if (cacRes.candidateGoal) {
          goal = pickLowerGoal([goal, cacRes.candidateGoal]);
          if (cacRes.optionalGoal) optionalGoal = cacRes.optionalGoal;
        }
      }
    }

    if (age >= 76 && age <= 79) localNotes.push(NOTES.NOTE_7679);
    // fix_round1 B7: NOTE_LOW_ENH は low 区分だけに出す（本文 p40 は低リスクの文脈）
    if (category === 'low' && (enhancerFlags.enh_fhx || enhancerFlags.enh_lpa)) localNotes.push(NOTES.NOTE_LOW_ENH);

    const title = c.provisional ? `一次予防 ${CATEGORY_LABEL[category]}（暫定入力あり）` : `一次予防 ${CATEGORY_LABEL[category]}`;
    const sub = c.provisional ? provisionalSuffix('PREVENT-ASCVD') : `PREVENT-ASCVD 10年 ${c.ascvd10.toFixed(1)}%`;

    return finalize({
      route: 'primary',
      title,
      sub,
      color: CATEGORY_COLOR[category],
      category,
      prevent: c,
      goal, optionalGoal,
      recs: recIds.map((id) => ({ id })),
      enhancers,
      notes: localNotes,
      _extraRequired: statinRequired,
    });
  }

  /** primary のリスク区分別 推奨・目標（primary 本体、CKD/HIV 併記、糖尿病参考表示で共有） */
  function primaryCategoryRecs(category, c, isPrimaryRoute) {
    const recIds = ['P_LIFE'];
    let goal = null;
    const localNotes = [];
    const age3059 = age >= 30 && age <= 59;
    if (category === 'low') {
      const ldl160to189 = ldlRoute >= 160 && ldlRoute <= 189;
      const risk30High = c.ascvd30 !== null && c.ascvd30 >= 10.0;
      if (age3059 && (ldl160to189 || risk30High)) {
        recIds.push('P_LOW_STATIN');
        goal = makeGoal(100, 130, '≥30%', null, 'P_LOW_STATIN', 'スタチン開始時');
        goal.citeOverride = { cor: '2a', loe: '図6' };
        const reasons = [];
        if (ldl160to189) reasons.push('LDL-C 160〜189 mg/dL');
        if (risk30High) reasons.push('30年リスク ≥10%');
        goal.subReason = reasons.join(' / ');
      } else if (age3059) {
        recIds.push('P_LOW_COUNSEL');
      }
      // spec_addendum_v2 §A-2: 60〜79歳の低リスクは NOTE_LOW_60PLUS／NOTE_LOW_60PLUS_COUNSEL を削除
      // （P_LIFE のみで行動は変わらない・P_LIFE と重複するため）
    } else if (category === 'borderline') {
      recIds.push('P_BORDER_STATIN', 'P_BORDER_ENH', 'P_BI_GOAL');
      if (enhancerFlags.enh_crp) recIds.push('P_BORDER_CRP');
      if (cac === null && incidCac === 'none') recIds.push('CAC_UNCERTAIN');
      goal = makeGoal(100, 130, '30〜49%', tgApoBOptional(c), 'P_BI_GOAL', 'スタチン開始時');
    } else if (category === 'intermediate') {
      recIds.push('P_INTER_STATIN', 'P_BI_GOAL');
      if (cac === null && incidCac === 'none') recIds.push('CAC_UNCERTAIN');
      // fix_round1 B7: qualifier「スタチン開始時」は low・borderline だけ（intermediate には付けない）
      goal = makeGoal(100, 130, '≥30%', tgApoBOptional(c), 'P_BI_GOAL', null);
    } else if (category === 'high') {
      recIds.push('P_HIGH_STATIN', 'P_HIGH_GOAL', 'P_HIGH_EZE', 'P_HIGH_PCSK9');
      if (cac === null && incidCac === 'none') recIds.push('CAC_INTENS');
      goal = makeGoal(70, 100, '≥50%', tgApoBOptional(c), 'P_HIGH_GOAL', null);
    }
    return { recIds, goal, notes: localNotes };
  }

  function tgApoBOptional(c) {
    if (tg === null || tg < 150 || tg > 499) return null;
    return c.ascvd10 < 10.0 ? 90 : 70;
  }
}

/* ============================================================
   9. primary リスク区分・ラベル（§6.2）
   ============================================================ */

export const CATEGORY_LABEL = { low: '低リスク', borderline: '境界リスク', intermediate: '中間リスク', high: '高リスク' };
export const CATEGORY_COLOR = { low: '#2E7D32', borderline: '#F57C00', intermediate: '#E65100', high: '#C62828' };

export function categoryFromRisk(r) {
  if (r === null || r === undefined) return null;
  if (r < 3.0) return 'low';
  if (r < 5.0) return 'borderline';
  if (r < 10.0) return 'intermediate';
  return 'high';
}

const CATEGORY_SHORT = { low: '低', borderline: '境界', intermediate: '中間', high: '高' };
/** spec_addendum_v2 §B-6: 区分範囲ラベル（区分が1つに決まらないときの表示） */
export function catRangeLabel(min10, max10) {
  const lo = categoryFromRisk(min10);
  const hi = categoryFromRisk(max10);
  if (lo === hi) return CATEGORY_LABEL[lo];
  return `${CATEGORY_SHORT[lo]}〜${CATEGORY_LABEL[hi]}`;
}

function ageBandLabelForDiabetes(age) {
  if (age <= 29) return '（20〜29歳）';
  if (age <= 39) return '（30〜39歳）';
  if (age <= 75) return '（40〜75歳）';
  return '（76歳以上）';
}

export const FIG11_STEPS = [
  '1. 高強度（または最大耐容量）スタチン: ≥50%低下、LDL-C <55・non-HDL-C <85（1/A）',
  '2. 未達 → エゼチミブ および/または PCSK9 抗体（1/A）',
  '3. PCSK9 抗体が忍容・入手・継続できない → インクリシラン（2a/B-R）',
  '4. なお未達 → ベムペド酸（2a/B-R）',
];
export const FIG12_STEPS = [
  '1. 高強度（または最大耐容量）スタチン: ≥50%低下、LDL-C <70・non-HDL-C <100（1/A）',
  '2. 未達 → エゼチミブ、PCSK9 抗体 および/または ベムペド酸（2a/B-R）',
  '3. PCSK9 抗体が忍容・入手・継続できない → インクリシラン（2a、図12）',
  '4. 任意目標 LDL-C <55・non-HDL-C <85（2a/B-R）',
];

/* ============================================================
   10. 目標の COR/LOE 表示・コピー用テキスト（§10.5, §11）
   ============================================================ */

/** goal.source の COR/LOE 表示。citeOverride があればそれを使う（§6.2 low の図6 特例） */
export function goalCite(goal) {
  if (!goal || !goal.source) return '';
  if (goal.citeOverride) return corLoeBracket(goal.citeOverride.cor, goal.citeOverride.loe);
  const r = RECS[goal.source];
  return r ? corLoeBracket(r.cor, r.loe) : '';
}

function yesNo(v) { return v === true ? 'あり' : (v === false ? 'なし' : '未入力'); }

/** 1行要約（§11.2） */
/** fix_round1 C1 / fix_round2 R-C1: §11.2 の推奨の短縮語。
 * 条件付き（conditional あり）の推奨は短縮語の判定から除く。HIV・CKD は H40・K40 を P_* より優先。 */
function summaryShort(recs) {
  // fix_round3 item7: conditional が「妊娠中は表20に従う」だけの推奨（＝妊娠の注記のみが
  // 前置されていて、その他の条件は無い＝推奨自体は成立している）は除外しない。
  const ids = (recs || [])
    .filter((r) => !r.conditional || r.conditional === '妊娠中は表20に従う')
    .map((r) => r.id);
  if (ids.includes('K40') || ids.includes('H40')) return 'スタチン推奨';
  if (ids.includes('P_LOW_STATIN')) return '中強度スタチン考慮';
  if (ids.includes('P_BORDER_STATIN')) return '中強度スタチン（開始時）';
  if (ids.includes('P_INTER_STATIN')) return '中強度以上スタチン';
  if (ids.includes('P_HIGH_STATIN')) return '高強度スタチン';
  if (ids.includes('P_LOW_COUNSEL')) return '健康行動カウンセリング';
  if (ids.includes('D_HIGH')) return '高強度スタチン';
  if (ids.includes('D_40')) return '中強度スタチン';
  if (ids.includes('S_CAC100') || ids.includes('S_CAC300') || ids.includes('S_CAC1000')) return 'LDL低下療法 ≥50%';
  return '';
}

function buildSummaryCore(result) {
  const r = result;
  const cur = r.ldlCurrent;
  const prov = r.prevent.provisional;
  const curLine = (goal) => (cur !== null && goal ? ` / 現LDL-C ${cur}（${attain(cur, goal.ldl)}）` : '');
  if (r.route === 'provisional') {
    // spec_addendum_v2 §B-11
    let s = '暫定評価（LDL-C 未入力）';
    if (r.prevent.ok) {
      if (prov) {
        const [a10, b10] = prov.range10;
        s += ` PREVENT-ASCVD 暫定10年 ${r.prevent.ascvd10.toFixed(1)}%（${a10.toFixed(1)}〜${b10.toFixed(1)}%）`;
        if (prov.range30) s += ` 30年 ${r.prevent.ascvd30.toFixed(1)}%（${prov.range30[0].toFixed(1)}〜${prov.range30[1].toFixed(1)}%）`;
      } else {
        s += ` PREVENT-ASCVD 10年 ${r.prevent.ascvd10.toFixed(1)}%`;
      }
    }
    return s;
  }
  if (r.route === 'primary') {
    let s;
    if (!r.prevent.ok) {
      // fix_round1 A2: PREVENT が理由付きで適用外の primary（category===null）でもクラッシュしない
      // spec_addendum_v2 §A-3: 「適用外（…）」／未計算の表示に統一
      const inner = r.prevent.reason ? `適用外（${PREVENT_NA[r.prevent.reason]}）`
        : (r.prevent.missing ? preventNaMissingText(r.prevent.missing) : '未計算');
      let s0 = `一次予防: PREVENT-ASCVD ${inner}`;
      // fix_v2_round1 N1: PREVENT 適用外でも CAC 由来の推奨短縮語・目標があれば要約に出す（画面と一致）。
      // この分岐の recs/goal は CAC 由来のもの（S_CAC* / candidateGoal）以外に発生しないため安全に出せる。
      const shortNa = summaryShort(r.recs);
      if (shortNa) s0 += ` ${shortNa}`;
      if (r.goal) s0 += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
      s0 += curLine(r.goal);
      return s0;
    }
    if (prov && !prov.stable) {
      // spec_addendum_v2 §B-7/§B-11: open は区分別の目標・推奨短縮は出さない。
      // fix_v2_round1 N1: ただし CAC 由来の推奨短縮語・目標（この分岐でも candidateGoal 以外は
      // goal に入らない）は画面と一致させて出す。
      const [a10, b10] = prov.range10;
      const catLo = categoryFromRisk(a10);
      const catHi = categoryFromRisk(b10);
      const paren = catLo !== catHi ? catRangeLabel(a10, b10) : `${CATEGORY_LABEL[catLo]}・30年未確定`;
      s = `PREVENT-ASCVD 暫定10年 ${r.prevent.ascvd10.toFixed(1)}%（${a10.toFixed(1)}〜${b10.toFixed(1)}%）（${paren}）`;
      if (prov.range30) s += ` 30年 ${r.prevent.ascvd30.toFixed(1)}%（${prov.range30[0].toFixed(1)}〜${prov.range30[1].toFixed(1)}%）`;
      const shortOpen = summaryShort(r.recs);
      if (shortOpen) s += ` ${shortOpen}`;
      if (r.goal) s += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
      s += curLine(r.goal);
      return s;
    }
    if (prov) {
      const [a10, b10] = prov.range10;
      s = `PREVENT-ASCVD 暫定10年 ${r.prevent.ascvd10.toFixed(1)}%（${a10.toFixed(1)}〜${b10.toFixed(1)}%）（${r.category ? CATEGORY_LABEL[r.category] : ''}）`;
      if (prov.range30) s += ` 30年 ${r.prevent.ascvd30.toFixed(1)}%（${prov.range30[0].toFixed(1)}〜${prov.range30[1].toFixed(1)}%）`;
    } else {
      s = `PREVENT-ASCVD 10年 ${r.prevent.ascvd10.toFixed(1)}%${r.category ? `（${CATEGORY_LABEL[r.category]}）` : ''}`;
      if (r.prevent.ascvd30 !== null && r.prevent.ascvd30 !== undefined) s += ` 30年 ${r.prevent.ascvd30.toFixed(1)}%`;
    }
    // fix_round2 R-C1: A13（参考値）のときは「参考値」を付ける
    if (r.prevent.outOfLdlRange) s += '（参考値）';
    const short = summaryShort(r.recs);
    if (short) s += ` ${short}`;
    if (r.goal) s += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
    s += curLine(r.goal);
    return s;
  }
  if (r.route === 'secondary') {
    const kindLabel = { vhr: '超高リスク', nvh: '非超高リスク', ckd: 'CKD合併', severe: '重症高コレステロール血症合併' }[r.vhr.kind];
    let s = `二次予防 ${kindLabel}（主要イベント${r.vhr.majorCount}・高リスク状態${r.vhr.hrCount}）`;
    if (r.goal) s += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
    s += curLine(r.goal);
    return s;
  }
  if (r.route === 'severe') {
    let s = `${r.title.includes('HeFH') ? 'HeFH' : '重症高コレステロール血症 LDL-C≥190'} 最大耐容量スタチン`;
    if (r.goal) s += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
    s += curLine(r.goal);
    return s;
  }
  if (r.route === 'diabetes') {
    // fix_round2 R-C1: 糖尿病は {年齢}歳（年齢帯ではなく実年齢）
    let s = `糖尿病 ${r.age}歳`;
    const short = summaryShort(r.recs);
    if (short) s += ` ${short}`;
    if (r.goal) s += ` LDL<${r.goal.ldl}/non-HDL<${r.goal.nonHdl}`;
    if (r.prevent && r.prevent.ok) {
      // spec_addendum_v2 §B-11: 暫定なら「PREVENT 暫定10年 {x}%（{a}〜{b}%）」
      if (prov) {
        const [a10, b10] = prov.range10;
        s += ` PREVENT 暫定10年 ${r.prevent.ascvd10.toFixed(1)}%（${a10.toFixed(1)}〜${b10.toFixed(1)}%）`;
      } else {
        s += ` PREVENT 10年 ${r.prevent.ascvd10.toFixed(1)}%`;
      }
    }
    s += curLine(r.goal);
    return s;
  }
  if (r.route === 'young') {
    // fix_round3 item5: r.title が既に「若年成人（20〜29歳）」を含むため、Y_LIFE 等の
    // RECS テキスト先頭の「若年成人（>18〜39歳）:」をそのまま連結すると見出しが重複する。
    // 先頭の「見出し:」部分を取り除いてから連結する。
    const short = summaryShort(r.recs);
    const first = r.recs[0] && RECS[r.recs[0].id] && RECS[r.recs[0].id].text;
    const content = short || (first ? first.replace(/^[^:：]*[:：]\s*/, '') : '');
    return content ? `${r.title}: ${content}` : r.title;
  }
  const short = summaryShort(r.recs) || (r.recs[0] && RECS[r.recs[0].id] && RECS[r.recs[0].id].text) || '';
  return `${r.title}: ${short}`;
}

export function buildSummary(result) {
  if (!result || result.route === 'incomplete') return '';
  let s = buildSummaryCore(result);
  // spec_addendum_v2 §B-11: 全経路共通 — required があれば「 要追加: …」、その後に「・HFrEF」
  if (result.required && result.required.length) s += ` 要追加: ${result.required.join('・')}`;
  // fix_round2 R-A8: 1行要約に「LLT開始は推奨されない」を出さない。他の経路の要約に「・HFrEF」だけ付ける
  return result.hfref ? `${s}・HFrEF` : s;
}

/** 全文コピー用テキスト（§11.1） */
/** spec_addendum_v2 §A-3: PREVENT 行を出す経路の限定
 *  fix_v2_round1 N2: UI 側と二重管理しないよう、この判定関数をデータ層から export する */
export function showsPreventLine(r) {
  return r.prevent.ok === true || !!r.prevent.missing || r.route === 'primary' || r.route === 'provisional';
}

/** fix_v2_round1 C1: non-HDL-C の出所を表す括弧書き（画面・コピー共通表記）。
 *  nonHdlSrc が null（nonHdl 自体が未算出）のときは LDL+30 の仮定として表示する。 */
export function nonHdlSrcSuffix(nonHdlSrc) {
  if (nonHdlSrc === 'lab') return '（検査報告値）';
  if (nonHdlSrc === 'est') return '（推定: LDL-C・HDL-C・TG から逆算）';
  if (nonHdlSrc === 'calc') return '（TC − HDL-C）';
  return '（仮定: LDL-C＋30）';
}

/** fix_v2_round1 L3: required（最低限追加すべき評価項目）が5項目以上のときだけ、
 *  画面とコピーの「表示」を5つの束にまとめる。内部の required 配列そのものは変えない。
 *  束にできない項目（年齢・LDL-C・高リスク状態の確認 など）はそのまま残す。 */
export function bundleRequiredForDisplay(required) {
  if (!required || required.length < 5) return required || [];
  const BLOOD = ['HDL-C', 'TG（または総コレステロール）', '総コレステロール（または non-HDL-C）'];
  const BP = ['収縮期血圧'];
  const SMK = ['喫煙'];
  const MED = ['降圧薬', 'スタチン内服', 'スタチン内服の有無', 'スタチン内服の有無（内服中なら治療前 LDL-C）'];
  const EGFR = ['eGFR（またはクレアチニン）'];
  let hasBlood = false;
  let hasBp = false;
  let hasSmk = false;
  let hasMed = false;
  let hasEgfr = false;
  const rest = [];
  required.forEach((item) => {
    if (BLOOD.includes(item)) hasBlood = true;
    else if (BP.includes(item)) hasBp = true;
    else if (SMK.includes(item)) hasSmk = true;
    else if (MED.includes(item)) hasMed = true;
    else if (EGFR.includes(item)) hasEgfr = true;
    else rest.push(item);
  });
  const out = [];
  if (hasBlood) out.push('採血（HDL-C・総コレステロールまたは non-HDL-C・TG）');
  if (hasBp) out.push('血圧');
  if (hasSmk) out.push('喫煙');
  if (hasMed) out.push('内服（降圧薬・スタチン）');
  if (hasEgfr) out.push('eGFR（またはクレアチニン）');
  return [...out, ...rest];
}

export function buildText(result, raw, dateLabel) {
  if (!result || result.route === 'incomplete') return '';
  const r = result;
  const prov = r.prevent.provisional;
  const L = [];
  L.push('【2026 ACC/AHA 脂質異常症GL（PREVENT-ASCVD） __DATE__】');
  L.push('');
  L.push('■ 判定');
  // fix_round1 C5: sub が空文字なら括弧を出さない（HIV route など）
  // spec_addendum_v2 §A-7: primary は sub を出さない（次の PREVENT 行と重複するため）
  if (r.route === 'primary') {
    L.push(`  ${r.title}`);
  } else {
    L.push(r.sub ? `  ${r.title}（${r.sub}）` : `  ${r.title}`);
  }
  if (showsPreventLine(r)) {
    if (r.prevent.ok) {
      let line;
      if (prov) {
        line = `  PREVENT-ASCVD 暫定 10年 ${r.prevent.ascvd10.toFixed(1)}%（範囲 ${prov.range10[0].toFixed(1)}〜${prov.range10[1].toFixed(1)}%）`;
        if (prov.range30) line += ` / 30年 ${r.prevent.ascvd30.toFixed(1)}%（範囲 ${prov.range30[0].toFixed(1)}〜${prov.range30[1].toFixed(1)}%）`;
      } else {
        line = `  PREVENT-ASCVD 10年 ${r.prevent.ascvd10.toFixed(1)}%`;
        if (r.prevent.ascvd30 !== null && r.prevent.ascvd30 !== undefined) line += ` / 30年 ${r.prevent.ascvd30.toFixed(1)}%`;
      }
      // fix_round2 R-C3: 参考値の印（outOfLdlRange）を画面と一致させてコピーにも出す
      // spec_addendum_v2 §A-5/§B-11: ldlUnknown の印は削除
      if (r.prevent.outOfLdlRange) line += '（参考値: LDL-C <70）';
      L.push(line);
    } else if (r.prevent.reason) {
      L.push(`  PREVENT-ASCVD: 適用外（${PREVENT_NA[r.prevent.reason]}）`);
    } else if (r.prevent.missing) {
      L.push(`  PREVENT-ASCVD: ${preventNaMissingText(r.prevent.missing)}`);
    }
  }
  (r.prevent.clampNotes || []).forEach((n) => L.push(`  ※ ${n}`));
  // spec_addendum_v2 §B-10/§B-11: 仮定値・最低限追加すべき評価項目
  if (r.assumed && r.assumed.length) L.push(`  未入力（仮定値で計算）: ${r.assumed.join('、')}`);
  // fix_v2_round1 L3: 5項目以上なら表示を束ねる（内部の r.required は変えない）
  if (r.required && r.required.length) L.push(`  最低限追加すべき評価項目: ${bundleRequiredForDisplay(r.required).join('・')}`);
  // fix_round2 R-C3: 高齢者の CAC 強調行を画面と一致させてコピーにも出す
  if (r.elderCacEmphasis) {
    L.push(`  CAC ${r.cacValue !== null && r.cacValue !== undefined ? r.cacValue : ''}: LLT を避ける再分類の対象（0 または 1〜10）`);
  }

  if (r.route === 'secondary' && r.vhr) {
    L.push('');
    L.push('■ 超高リスク判定（図10）');
    L.push(`  主要ASCVDイベント: ${r.vhr.majorItems.length ? r.vhr.majorItems.join('、') : 'なし'}`);
    L.push(`  高リスク状態: ${r.vhr.hrItems.length ? r.vhr.hrItems.join('、') : 'なし'}`);
    L.push(`  → ${r.vhr.vhr ? '超高リスク' : '超高リスクではない'}`);
  }

  if (r.goal) {
    L.push('');
    L.push('■ 管理目標');
    let gl = `  LDL-C <${r.goal.ldl} / non-HDL-C <${r.goal.nonHdl} mg/dL`;
    if (r.goal.reduction) gl += `（低下率 ${r.goal.reduction}）`;
    gl += goalCite(r.goal);
    L.push(gl);
    if (r.goal.qualifier) L.push(`  ${r.goal.qualifier}`);
    if (r.goal.apoB) L.push(`  任意: apoB <${r.goal.apoB} mg/dL`);
    if (r.optionalGoal) {
      L.push(`  任意目標: LDL-C <${r.optionalGoal.ldl} / non-HDL-C <${r.optionalGoal.nonHdl} mg/dL${goalCite(r.optionalGoal)}`);
    }
    if (r.ldlCurrent !== null) {
      const srcLabel = r.ldlSource === 'lab' ? '検査報告値' : 'Sampson/NIH式';
      let cl = `  現在のLDL-C（${srcLabel}）: ${r.ldlCurrent} mg/dL — <${r.goal.ldl} ${attain(r.ldlCurrent, r.goal.ldl)}`;
      if (r.optionalGoal) cl += ` / <${r.optionalGoal.ldl} ${attain(r.ldlCurrent, r.optionalGoal.ldl)}`;
      L.push(cl);
    }
    if (r.nonHdl !== null) {
      let nl = `  現在のnon-HDL-C: ${r.nonHdl} mg/dL — <${r.goal.nonHdl} ${attain(r.nonHdl, r.goal.nonHdl)}`;
      if (r.optionalGoal) nl += ` / <${r.optionalGoal.nonHdl} ${attain(r.nonHdl, r.optionalGoal.nonHdl)}`;
      L.push(nl);
    }
    if (raw.apob !== null && raw.apob !== undefined && r.goal.apoB) {
      L.push(`  現在のapoB: ${raw.apob} mg/dL — <${r.goal.apoB} ${attain(raw.apob, r.goal.apoB)}`);
    }
    // fix_round1 C2: 目標の低下率が無い（reduction===null）ときは「目標 null 達成」を出さない
    if (r.reductionPct !== null && r.goal.reduction) {
      const achieved = reductionAchieved(r.reductionPct, r.goal.reduction);
      L.push(`  LDL-C 低下率（治療前比）: ${r.reductionPct}% — 目標 ${r.goal.reduction} ${achieved ? '達成' : '未達'}`);
    }
  } else {
    L.push('');
    L.push('■ 管理目標');
    // spec_addendum_v2 §A-7: 目標が無いときの文言を場合分けする
    if (r.route === 'provisional') {
      L.push('  LDL-C 入力後に表示');
    } else if (prov && !prov.stable) {
      L.push('  リスク区分の確定後に表示');
    } else {
      L.push('  GL に数値目標の記載なし');
    }
  }

  // spec_addendum_v2 §A-7: recs と alsoApplies が両方空なら「■ 推奨」見出しごと出さない
  if ((r.recs && r.recs.length) || (r.alsoApplies && r.alsoApplies.length)) {
    L.push('');
    L.push('■ 推奨');
    r.recs.forEach((rec) => L.push(`  ・${recText(rec.id, rec.conditional)}`));
    if (r.addOnSteps) {
      L.push('  （目標未達時の追加）');
      r.addOnSteps.forEach((s) => L.push(`  ${s}`));
    }
    if (r.alsoApplies && r.alsoApplies.length) {
      L.push('  （他に該当）');
      // fix_round2 R-TG: 他に該当する推奨の conditional をコピーにも表示する
      r.alsoApplies.forEach((a) => L.push(`  ・${recText(a.id, a.conditional)}`));
    }
  }

  L.push('');
  L.push('■ 入力');
  L.push(`  年齢: ${raw.age !== null && raw.age !== undefined ? raw.age + '歳' : '未入力'} / 性別: ${raw.sex === 'male' ? '男性' : raw.sex === 'female' ? '女性' : '未入力'}`);
  // spec_addendum_v2 §A-7: 臨床的ASCVD・HeFH/HoFH/糖尿病・CKD/HIV/HFrEF の3行を「背景: …」1行にまとめる
  const ascvdLabels = { acs: '急性冠症候群（ACS）の既往', mi: '心筋梗塞の既往', angina: '安定狭心症・不安定狭心症', revasc: '血行再建術の既往', stroke: '脳卒中の既往', tia: '一過性脳虚血発作（TIA）の既往', pad: '末梢動脈疾患（PAD）' };
  const bgItems = Object.keys(ascvdLabels).filter((k) => raw[k]).map((k) => ascvdLabels[k]);
  if (raw.hefh) bgItems.push('HeFH');
  if (raw.hofh) bgItems.push('HoFH');
  if (raw.dm === true) {
    bgItems.push((r.dmEnhLabels && r.dmEnhLabels.length) ? `糖尿病（Table 17: ${r.dmEnhLabels.join('、')}）` : '糖尿病');
  }
  if (raw.ckd && raw.ckd !== 'none' && CKD_STAGE_LABEL[raw.ckd]) bgItems.push(`CKD ${CKD_STAGE_LABEL[raw.ckd]}`);
  if (raw.hiv) bgItems.push('HIV');
  if (raw.hfref) bgItems.push('HFrEF');
  if (raw.preg) bgItems.push('妊娠・授乳関連');
  L.push(`  背景: ${bgItems.length ? bgItems.join('、') : 'なし'}`);
  L.push(`  収縮期血圧: ${raw.sbp ?? '未入力'} mmHg / 降圧薬: ${yesNo(raw.bptx)} / 現在喫煙: ${yesNo(raw.smoking)} / スタチン: ${yesNo(raw.statin)}`);
  L.push(`  採血: ${raw.fasting === 'fasting' ? '空腹時' : raw.fasting === 'casual' ? '随時' : '未選択'} / TC ${raw.tc ?? '未入力'} / HDL-C ${raw.hdl ?? '未入力'} / TG ${raw.tg ?? '未入力'} mg/dL`);
  if (r.ldlCurrent !== null) {
    const srcLabel = r.ldlSource === 'lab' ? '検査報告値' : 'Sampson/NIH式';
    let ll = `  LDL-C: ${r.ldlCurrent} mg/dL（${srcLabel}）`;
    if (raw.statin === true && r.ldlBaseline !== null) ll += ` / 治療前 ${r.ldlBaseline} mg/dL`;
    L.push(ll);
  }
  if (r.nonHdl !== null) {
    // spec_addendum_v2 §A-7 / fix_v2_round1 C1: 出所の表示。画面（PreventAscvdCalculator.js）と
    // 同じ nonHdlSrcSuffix() を使い、表記を一致させる
    L.push(`  non-HDL-C: ${r.nonHdl} mg/dL${nonHdlSrcSuffix(r.nonHdlSrc)}`);
  }
  if (r.egfrUsed !== null) {
    L.push(`  eGFR: ${r.egfrUsed}（${r.egfrSource === 'ckdepi' ? `CKD-EPI 2021（Cr ${r.cr} mg/dL）` : '検査報告値'}）`);
  }
  if (raw.apob !== null && raw.apob !== undefined) L.push(`  apoB: ${raw.apob} mg/dL`);
  // fix_round1 B6: Lp(a) は単位が無ければ「未入力」扱いなのでコピーにも単位なしで出さない
  if (raw.lpa !== null && raw.lpa !== undefined && raw.lpaUnit) L.push(`  Lp(a): ${raw.lpa} ${raw.lpaUnit}`);
  if (raw.cac !== null && raw.cac !== undefined) {
    let cl = `  CAC: ${raw.cac} AU`;
    if (raw.cac75) cl += '（≥75パーセンタイル）';
    L.push(cl);
  }
  if (raw.incidCac && raw.incidCac !== 'none') {
    L.push(`  偶発的CAC: ${raw.incidCac === 'mild' ? '軽度' : '中等度〜高度'}`);
  }
  if (r.enhancers) {
    L.push(`  リスク増強因子: ${r.enhancers.count ? r.enhancers.items.join('、') : 'なし'}`);
  }

  // spec_addendum_v2 §A-7: notes が空なら「■ 注記」見出しごと出さない
  if (r.notes && r.notes.length) {
    L.push('');
    L.push('■ 注記');
    r.notes.forEach((n) => L.push(`  ※ ${n}`));
  }
  return L.join('\n');
}
