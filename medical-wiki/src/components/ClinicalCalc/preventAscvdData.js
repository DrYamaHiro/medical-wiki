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

function clampNote(label, value, unit, lo, hi, endpoint) {
  return `${label} ${value} ${unit} は PREVENT の入力範囲（${lo}〜${hi}）外のため ${endpoint} で計算しました。過大評価または過小評価の可能性があります。`;
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

export const PREVENT_NA = {
  PREVENT_NA_ASCVD: '臨床的ASCVDがあるため PREVENT-ASCVD は用いません（二次予防）',
  PREVENT_NA_FH: 'HeFH／HoFH では一般集団用のリスク式で10年・30年リスクを計算しない（3: Harm / C-EO）',
  PREVENT_NA_LDL190: 'LDL-C ≥190 mg/dL は PREVENT-ASCVD の適用範囲外（重症高コレステロール血症の経路）',
  PREVENT_NA_AGE: 'PREVENT-ASCVD の適用年齢は30〜79歳です',
  PREVENT_NA_CAC300: 'CAC ≥300 は PREVENT の適用外（無症候性冠動脈硬化の経路）',
  // fix_round3 item2: 元仕様どおり復活（fix_round2 R-A8 で誤って削除されたが、それは
  // HF_NB／NOTE_HFREF_CAVEAT を経路非依存の add-on にする話であり、PREVENT の計算式そのものが
  // HFrEF を除外対象としている事実とは別。HFrEF にチェックがある一次予防相当の人はこの理由で
  // 「PREVENT は計算できません」に入るが、CAC 再分類・糖尿病・CKD・HIV・重症・二次予防の判定は
  // PREVENT に依存しないためそのまま機能する。
  PREVENT_NA_HFREF: 'PREVENT は心不全の既往が無い成人で作られた式のため HFrEF では適用外（AHA）。LLT の判断は二次予防・高リスク一次予防の必要性と余命で行う（p78 本文）',
  PREVENT_NA_ESKD: '末期腎不全（CKD G5・透析・eGFR <15）は PREVENT の適用外（AHA PREVENT 計算機の入力範囲 eGFR 15〜140）',
};

export function preventNaMissingText(missing) {
  return `PREVENT 未計算: ${missing.join('・')}`;
}

/* ============================================================
   4. 注記文言（§10.3、定数名と逐語）
   ============================================================ */

export const NOTES = {
  NOTE_LDL_DISCORDANT: (lab, sampson) => `LDL-C の検査報告値（${lab}）と Sampson/NIH 式（${sampson}）で判定区分が変わりうる差があります。判定には検査報告値を使っています（GL は直接法より Martin/Hopkins 式または Sampson/NIH 式を推奨: 1/B-NR）`,
  NOTE_STATIN_BASELINE: 'スタチン内服中で治療前 LDL-C が未入力のため、現在の LDL-C で経路を判定しています。LDL-C 70〜189／≥190 の区分は治療前値で確認してください',
  NOTE_EGFR_JSN: 'eGFR は検査報告値を使用。日本の検査報告値は通常 日本腎臓学会の推算式で、PREVENT の導出（CKD-EPI 2021 式）とは異なります。クレアチニンを入力すると CKD-EPI 2021 式で計算します',
  NOTE_EGFR_LT60_NO_CKD: 'eGFR <60 です。CKD ステージを選択してください（3か月以上持続で CKD と診断、KDIGO の CKD 定義）',
  NOTE_LOW_60PLUS: '60〜79歳の低リスクでは30年リスクを用いない。LDL-C 160〜189 での中強度スタチン（2a/C-LD）は GL 上30〜59歳が対象',
  NOTE_LOW_60PLUS_COUNSEL: '健康行動のカウンセリングを継続（GL の低リスク推奨 1/A は30〜59歳が対象）',
  NOTE_LOW_ENH: '低リスク（<3%）でも、強い早発CVD家族歴や非常に高い Lp(a) では LLT の検討が妥当な場合がある（本文 p40）',
  NOTE_7679: '76〜79歳: PREVENT の適用年齢内だが、>75歳の新規開始は 2b（推定余命2.5年以上、利益・リスクの話し合い後）。機能状態・フレイル・多剤併用・余命も考慮（1/C-EO）',
  NOTE_CAC_AGE: 'CAC 評価は一般に男性 ≥40歳・女性 ≥45歳が対象（p42）。30〜45歳のパーセンタイルは MESA ではなく専用ツールを用いる（p43）',
  NOTE_CAC0_HIGHRISK: (list) => `CAC=0 でも治療延期の根拠にしない（高リスク状態あり: ${list.join('、')}）`,
  NOTE_CAC0_OTHER: 'CAC=0 による治療延期の推奨（2a）は中間リスクおよび選択した境界リスクが対象',
  NOTE_CAC0_FH: 'FH・重症高コレステロール血症では CAC=0 をリスク低減評価や治療延期の根拠にしない（p42–43）',
  NOTE_CAROTID: '頸動脈プラークがあれば CAC=0 でも LLT 開始が勧められる（本文 p43）',
  NOTE_FIG13_INCID: '図13 は偶発的CAC 中等度〜高度で「中〜高強度スタチン」と記載。本ツールは推奨本文（高強度）に従う',
  NOTE_VHR_BOUNDARY: (footnoteJudge) => `超高リスク判定は図10の定義（年齢 ≥65歳、LDL-C ≥100 mg/dL）に従っています。推奨表脚注・本文（p62）の定義（>65歳、>100 mg/dL）では判定が「${footnoteJudge}」になります`,
  NOTE_VHR_AGE_MISSING: '年齢未入力のため「年齢 ≥65歳」は非該当として判定しています',
  NOTE_VHR_LDL_MISSING: 'LDL-C 未入力のため「最大耐容量スタチン＋エゼチミブ下で LDL-C ≥100」は非該当として判定しています',
  NOTE_EZE_NOT_REQUIRED: 'PCSK9 抗体の開始前にエゼチミブ追加を必須としない（p63）',
  NOTE_FIG11_ORDER: '追加順序は図11に従う（推奨本文では 4.2.6 推奨6・7 の順で、ベムペド酸がインクリシランより先に記載）',
  NOTE_SEVERE_RF: '「追加のASCVD危険因子」は GL で個別に列挙されていないため、ツールは自動判定しません',
  NOTE_FH_CONSIDER: '二次性原因が無ければ FH の可能性を考慮（パネル遺伝学的検査 2a/B-NR）',
  NOTE_CKD_STAGE34: 'Top Take-Home Message 8 は「CKD stage 3 or 4」、推奨本文は「stage 3 or higher」。本ツールは推奨本文に従う',
  NOTE_HD_START: '維持透析でのスタチン新規開始の利益は RCT で示されていない（本文）',
  NOTE_HIV_REPRIEVE: '根拠の REPRIEVE 試験はピタバスタチン 4 mg。LDL-C・リスクの下限を設けていない（p80）',
  NOTE_HIV_DDI: '抗レトロウイルス薬とスタチンの相互作用を確認（Table 22）',
  NOTE_HFREF_CAVEAT: 'HF 自体は LLT の適応にならない。重度 CAC・危険因子・二次予防など他の適応で判断する（p78 本文）',
  NOTE_YOUNG_LLT: '18〜29歳の LLT は RCT が無く、高い脂質負荷と多くのリスク増強因子がある場合の臨床判断と患者の希望による（本文 p73）',
  NOTE_TAKEHOME1: '若年成人期に LDL-C ≥160 mg/dL または強い早発ASCVD家族歴がある場合は薬物療法の早期検討（Top Take-Home Message 1）',
  NOTE_ELDER_CAC_POS: '>75歳の新規開始は 2b（推定余命2.5年以上、利益・リスクの話し合い後）',
  NOTE_LDL70_NONHDL: 'LDL-C <70 だが non-HDL-C ≥100（または不明）: GL に該当する一次予防の区分推奨はありません。個別に判断',
  NOTE_LPA_REFER: 'Lp(a) ≥200 nmol/L（≥75 mg/dL）は脂質専門医紹介の考慮事項（Table 9）',
  NOTE_INTENSITY: 'スタチン強度: 高強度＝LDL-C ≥50%低下、中強度＝30〜49%低下（Table 6）。国内の承認用量は添付文書を確認',
  NOTE_GOAL_BOTH: '効果判定はベースラインからの%低下と LDL-C／non-HDL-C の目標到達の両方で行う（p19–20）',
  NOTE_MONITOR: 'LLT 開始・用量調整の4〜12週後に脂質検査、以後6〜12か月ごと（1/A）',
  NOTE_CAC_INCID_IGNORED: '偶発的CACの入力は CAC スコアがあるため判定に使っていません。',
  NOTE_PREG_TABLE20: '妊娠中・授乳中は表20に従う（エゼチミブ・PCSK9 抗体・ベムペド酸・インクリシランは回避、スタチンは多くの場合中止）',
  NOTE_PRIMARY_LDL_LOW_CONTINUE: 'スタチン内服中で治療前の LDL-C が不明のため、PREVENT は参考値。現行治療の継続を基本とする',
  PRE_CORRECTION_NOTE: '本ツールは 2026 ACC/AHA 脂質異常症ガイドライン（2026年3月13日オンライン公開）の推奨・図表に基づきます。2026年6月と9月の訂正（Circulation 2026;153:e1447、154:e393）は、Take-Home Message の apoB の記載（TG >200 → ≥150）、高TG血症の推奨5・6の図番号、表5の胆汁酸吸着薬の用量・投与回数、査読委員名の修正で、本ツールの判定内容には影響しません。',
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
  const dm = p.dm === true ? true : (p.dm === false ? false : null);
  const statin = p.statin === true ? true : (p.statin === false ? false : null);
  const bptx = p.bptx === true ? true : (p.bptx === false ? false : null);
  const smoking = p.smoking === true ? true : (p.smoking === false ? false : null);
  const sbp = ok(p.sbp) ? p.sbp : null;
  const tc = ok(p.tc) ? p.tc : null;
  const hdl = ok(p.hdl) ? p.hdl : null;
  const tg = ok(p.tg) ? p.tg : null;
  const fasting = (p.fasting === 'fasting' || p.fasting === 'casual') ? p.fasting : null;
  const ldlLab = ok(p.ldlLab) ? p.ldlLab : null;
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

  /* ---- 派生値: LDL-C・non-HDL-C（§3.1, §3.2） ---- */
  const nonHdl = (tc !== null && hdl !== null) ? Math.round(tc - hdl) : null;
  let ldlSampson = null;
  let tgOver800 = false;
  if (tc !== null && hdl !== null && tg !== null) {
    if (tg > 800) { tgOver800 = true; }
    else {
      const raw = sampsonLdl(tc, hdl, tg);
      ldlSampson = raw > 0 ? Math.round(raw) : null;
    }
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
    if ([55, 70, 100, 160, 190].some((t) => lo < t && t <= hi)) {
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
    notes.push(NOTES.NOTE_EGFR_JSN);
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

  if (age === null && (ev.acs12 || ev.mi || ev.isch || ev.pad || hasAscvdDef)) notes.push(NOTES.NOTE_VHR_AGE_MISSING);
  if (maxStatinEze && ldlCurrent === null) notes.push(NOTES.NOTE_VHR_LDL_MISSING);
  if (hasAscvd && vhr !== vhrFootnote) notes.push(NOTES.NOTE_VHR_BOUNDARY(vhrFootnote ? '超高リスク' : '超高リスクではない'));

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
    const missing = [];
    if (sex === null) missing.push('性別');
    if (sbp === null) missing.push('収縮期血圧');
    if (bptx === null) missing.push('降圧薬');
    if (tc === null) missing.push('総コレステロール');
    if (hdl === null) missing.push('HDL-C');
    if (smoking === null) missing.push('喫煙');
    if (statin === null) missing.push('スタチン');
    if (egfrUsed === null) missing.push('eGFR（またはクレアチニン）');
    if (missing.length) return { ok: false, missing };
    return { ok: true };
  }

  function computePrevent() {
    const st = preventStatus(ldlRoute);
    if (!st.ok) return { ...st, clampNotes: [] };
    const clamped = clampForPrevent({ sbp, tc, hdl, egfr: egfrUsed });
    const r = preventRisk(sex, age, clamped.sbp, bptx, clamped.tc, clamped.hdl, statin, dm === true, smoking === true, clamped.egfr);
    return {
      ok: true, ascvd10: r.risk10, ascvd30: r.risk30, clampNotes: clamped.clampNotes,
      outOfLdlRange: ldlRoute !== null && ldlRoute < 70,
      ldlUnknown: ldlRoute === null,
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
    if (cac !== null && incidCac !== 'none') {
      extraNotes.push(NOTES.NOTE_CAC_INCID_IGNORED);
    }
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
      if (!elderLowCac && age !== null && ((sex === 'male' && age < 40) || (sex === 'female' && age < 45))) {
        extraNotes.push(NOTES.NOTE_CAC_AGE);
      }
    } else if (incidCac === 'mild') {
      extraRecs.push('S_INCID_MILD', 'CAC_INCID');
      candidateGoal = makeGoal(100, 130, '≥30%', null, 'S_INCID_MILD');
    } else if (incidCac === 'modsev') {
      extraRecs.push('S_INCID_MODSEV', 'CAC_INCID');
      extraNotes.push(NOTES.NOTE_FIG13_INCID);
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
  // 4. ldlRoute 未確定 → incomplete（仕様書 §5 の順序どおり。fix_round1 A1: LDL-C 未確定のまま
  //    HFrEF・HIV・糖尿病・若年・高齢などの確定的な推奨や目標を出さない）
  if (ldlRoute === null) {
    // fix_round2 R-UI3: missing には項目名だけを入れる（「未入力: 」との二重文にしない）
    return incompleteResult(['LDL-C（測定値、または TC・HDL-C・TG）']);
  }
  // 5. ldlRoute >= 190
  if (ldlRoute >= 190) return buildSevere(false);
  // 6. dm===null
  if (dm === null) {
    return incompleteResult(['糖尿病']);
  }
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
      ldlCurrent, ldlSource, nonHdl, ldlBaseline, ldlRoute, egfrUsed, egfrSource, cr, egfrLabValue: egfrLab,
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
  // fix_round3 item3: ただし route==='secondary' では HF_NB を出さない（臨床的ASCVDがある時点で
  // conditional「臨床的ASCVDも他のLLT適応も無い場合」は成立し得ないため）。NOTE_HFREF_CAVEAT は出す。
  function hfrefAlso(route) {
    return (hfref && route !== 'incomplete' && route !== 'secondary')
      ? [{ id: 'HF_NB', conditional: '臨床的ASCVDも他のLLT適応も無い場合' }] : [];
  }
  function hfrefNotes(route) {
    return (hfref && route !== 'incomplete') ? [NOTES.NOTE_HFREF_CAVEAT] : [];
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
    // §10.3: NOTE_INTENSITY・NOTE_GOAL_BOTH・NOTE_MONITOR は「目標を表示する全経路」で結果の最後に出す
    const goalNotes = base.goal ? [NOTES.NOTE_INTENSITY, NOTES.NOTE_GOAL_BOTH, NOTES.NOTE_MONITOR] : [];
    return {
      route,
      missing: base.missing || [],
      title: base.title, sub: base.sub, color: base.color,
      category: base.category || null,
      prevent: base.prevent || { ok: false },
      vhr: base.vhr || null,
      goal: base.goal || null,
      optionalGoal: base.optionalGoal || null,
      recs,
      alsoApplies: also,
      addOnSteps: base.addOnSteps || null,
      enhancers: base.enhancers !== undefined ? base.enhancers : null,
      notes: [...notes, ...(base.notes || []), ...extraNotes, ...goalNotes],
      ldlCurrent, ldlSource, nonHdl, ldlBaseline, ldlRoute, egfrUsed, egfrSource, cr, egfrLabValue: egfrLab,
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
      localNotes.push(NOTES.NOTE_EZE_NOT_REQUIRED, NOTES.NOTE_FIG11_ORDER);
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
      localNotes.push(NOTES.NOTE_EZE_NOT_REQUIRED, NOTES.NOTE_FIG11_ORDER);
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
      localNotes.push(NOTES.NOTE_EZE_NOT_REQUIRED);
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
    if (age >= 76) mainRecs.push('O_ELDER_DISC');

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
      localNotes.push(NOTES.NOTE_SEVERE_RF);
    }
    recs.push({ id: 'F_INCL' });
    if (isHefh) recs.push({ id: 'F_NOPREVENT' });

    if (cac !== null && cac === 0) localNotes.push(NOTES.NOTE_CAC0_FH);
    // fix_round2 R-A4: HeFH 確定（hefh チェック）のときは NOTE_FH_CONSIDER を出さない
    if (!isHefh && ldlRoute !== null && ldlRoute >= 190) localNotes.push(NOTES.NOTE_FH_CONSIDER);

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
    let referenceCategory = null;

    const computePreventIfNeeded = () => {
      const c = computePrevent();
      return c;
    };

    if (age <= 29) {
      if (dmEnhAny) recs.push('D_20'); else recs.push('D_COUNSEL');
      prevent = { ok: false, reason: 'PREVENT_NA_AGE' };
    } else if (age <= 39) {
      const c = computePreventIfNeeded();
      prevent = c;
      const highRisk10 = c.ok && c.ascvd10 >= 3.0;
      const highRisk30 = c.ok && c.ascvd30 !== null && c.ascvd30 >= 10.0;
      // fix_round1 A6: D_20 と D_30PREVENT は排他にしない（両方の条件を満たせば両方表示）
      let anyShown = false;
      if (dmEnhAny) { recs.push('D_20'); anyShown = true; }
      if (c.ok && (highRisk10 || highRisk30)) {
        recs.push('D_30PREVENT');
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
      const c = computePreventIfNeeded();
      prevent = c;
      // fix_round1 A5: 糖尿病特異的リスク増強因子（Table 17）があるときも D_HIGH（2a/B-R）を適用する。
      // PREVENT が計算できて 10%未満でも、§8.3 どおり D_HIGH を条件付きで表示する（元実装では
      // c.ok && ascvd10<10 のケースで D_HIGH が一切出ない不具合があった）。
      const highRiskDm = dmEnhAny;
      if (highRiskDm || (c.ok && c.ascvd10 >= 10.0)) {
        recs.push('D_HIGH');
        goal = makeGoal(70, 100, '≥50%', 70, 'D_HIGH');
        if (c.ok && c.ascvd10 >= 10.0) recs.push('D_ADD');
      } else {
        recs.push({ id: 'D_HIGH', conditional: '複数のASCVD危険因子がある場合' });
      }
      if (c.ok) {
        referenceCategory = categoryFromRisk(c.ascvd10);
        localNotes.push(`（参考: 一次予防区分 ${CATEGORY_LABEL[referenceCategory]}）`);
      }
    } else {
      recs.push('D_DISC', 'D_75');
      prevent = { ok: false, reason: 'PREVENT_NA_AGE' };
      if (age <= 79) {
        const c = computePreventIfNeeded();
        if (c.ok) { prevent = c; }
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
        localNotes.push(NOTES.NOTE_CAROTID);
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

    const title = `糖尿病（ASCVDなし）${ageBandLabelForDiabetes(age)}`;
    return finalize({
      route: 'diabetes',
      // fix_round2 R-C6: 仕様外の sub 文言を削除（§8.3 は判定ボックス1行目のみ規定）
      title, sub: '', color: '#C62828',
      prevent,
      goal, optionalGoal,
      recs: recs.map((r) => (typeof r === 'string' ? { id: r } : r)),
      enhancers: null,
      notes: localNotes,
    });
  }

  /* ---------------- CKD（route: ckd） ---------------- */
  function buildCkd() {
    const c = computePrevent();
    const ref = primaryReferenceForOther(c);
    const localNotes = [NOTES.NOTE_CKD_STAGE34, ...ref.notes];
    return finalize({
      route: 'ckd',
      title: `CKD ${CKD_STAGE_LABEL[ckd]}（ASCVDなし）`,
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
   */
  function primaryReferenceForOther(c) {
    let category = null;
    let goal = null;
    let optionalGoal = null;
    const recIds = [];
    const notesOut = [];
    if (c.ok && !c.outOfLdlRange) {
      category = categoryFromRisk(c.ascvd10);
      const built = primaryCategoryRecs(category, c);
      const filtered = built.recIds.filter((id) => !START_DECISION_RECS.includes(id));
      filtered.forEach((id, i) => recIds.push(i === 0 ? { id, conditional: '一次予防区分による参考' } : { id }));
      goal = built.goal;
    }
    // fix_round2 R-C6: CKD・HIV で CAC 0 のとき NOTE_CAROTID と applyCac の注記
    // （NOTE_CAC_AGE・偶発的 CAC 無視、および R-A10 の O_ELDER_CAC）を捨てない
    if (cac === 0) {
      notesOut.push(NOTES.NOTE_CAROTID);
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
    const c = computePrevent();
    const ref = primaryReferenceForOther(c);
    return finalize({
      route: 'hiv',
      title: 'HIV 感染症（安定したART中）40〜75歳', sub: '', color: '#E65100',
      prevent: c,
      category: ref.category,
      goal: ref.goal,
      optionalGoal: ref.optionalGoal,
      recs: [{ id: 'H40' }, ...ref.recIds],
      enhancers: null,
      notes: [NOTES.NOTE_HIV_REPRIEVE, NOTES.NOTE_HIV_DDI, ...ref.notes],
    });
  }

  /* ---------------- 20〜29歳（route: young） ---------------- */
  function buildYoung() {
    const recs = ['Y_LIFE'];
    const localNotes = [NOTES.NOTE_YOUNG_LLT];
    if ((ldlRoute !== null && ldlRoute >= 160) || enhancerFlags.enh_fhx) localNotes.push(NOTES.NOTE_TAKEHOME1);
    let goal = null;
    if (cac !== null || incidCac !== 'none') {
      if (cac === 0) {
        localNotes.push(NOTES.NOTE_CAROTID);
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
    if (cac === 0) {
      localNotes.push(NOTES.NOTE_CAROTID);
    }
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
    if (nonHdl !== null && nonHdl < 100) {
      recs.push({ id: 'P_LDL70_NB', conditional: '追加のASCVD危険因子が無い場合' });
    } else {
      localNotes.push(NOTES.NOTE_LDL70_NONHDL);
    }
    const c = computePrevent();
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
      localNotes.push(NOTES.NOTE_CAROTID);
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
    });
  }

  /* ---------------- 一次予防（route: primary） ---------------- */
  function buildPrimary() {
    const c = computePrevent();
    if (!c.ok && c.missing) {
      return incompleteResult(c.missing);
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
        localNotes0.push(NOTES.NOTE_CAROTID);
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
      });
    }
    // fix_round1 A13: statin 内服中・治療前値なし・ldlRoute<70 で primary に入るケース（§4.6）。
    // PREVENT は参考値、区分別の「開始」推奨は出さず継続を基本とする。
    if (c.outOfLdlRange) {
      const category = categoryFromRisk(c.ascvd10);
      return finalize({
        route: 'primary',
        title: `一次予防 ${CATEGORY_LABEL[category]}（参考値）`,
        sub: `PREVENT-ASCVD 10年 ${c.ascvd10.toFixed(1)}%（LDL-C <70 のため参考値。区分適用範囲 70〜189 外）`,
        color: CATEGORY_COLOR[category],
        category,
        prevent: c,
        goal: null,
        recs: [{ id: 'P_LIFE' }],
        enhancers,
        notes: [NOTES.NOTE_PRIMARY_LDL_LOW_CONTINUE],
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
          } else {
            localNotes.push(NOTES.NOTE_CAC0_HIGHRISK(hi));
          }
        } else if (!(age !== null && age >= 76)) {
          // fix_round3 item4: 76歳以上では NOTE_CAC0_OTHER を出さない（O_ELDER_CAC 側の
          // 説明と重複・矛盾するため。76〜79歳は applyCac の elderLowCac 分岐が優先する）
          localNotes.push(NOTES.NOTE_CAC0_OTHER);
        }
        localNotes.push(NOTES.NOTE_CAROTID);
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

    return finalize({
      route: 'primary',
      title: `一次予防 ${CATEGORY_LABEL[category]}`,
      sub: `PREVENT-ASCVD 10年 ${c.ascvd10.toFixed(1)}%`,
      color: CATEGORY_COLOR[category],
      category,
      prevent: c,
      goal, optionalGoal,
      recs: recIds.map((id) => ({ id })),
      enhancers,
      notes: localNotes,
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
      } else if (ldlRoute >= 160 && ldlRoute <= 189) {
        localNotes.push(NOTES.NOTE_LOW_60PLUS);
      } else {
        localNotes.push(NOTES.NOTE_LOW_60PLUS_COUNSEL);
      }
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
  const curLine = (goal) => (cur !== null && goal ? ` / 現LDL-C ${cur}（${attain(cur, goal.ldl)}）` : '');
  if (r.route === 'primary') {
    // fix_round1 A2: PREVENT が理由付きで適用外の primary（category===null）でもクラッシュしない
    let s = r.prevent.ok
      ? `PREVENT-ASCVD 10年 ${r.prevent.ascvd10.toFixed(1)}%${r.category ? `（${CATEGORY_LABEL[r.category]}）` : ''}`
      : `一次予防: PREVENT-ASCVD ${r.prevent.reason ? PREVENT_NA[r.prevent.reason] : '未計算'}`;
    if (r.prevent.ok && r.prevent.ascvd30 !== null && r.prevent.ascvd30 !== undefined) s += ` 30年 ${r.prevent.ascvd30.toFixed(1)}%`;
    // fix_round2 R-C1: A13（参考値）のときは「参考値」を付ける
    if (r.prevent.ok && r.prevent.outOfLdlRange) s += '（参考値）';
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
    if (r.prevent && r.prevent.ok) s += ` PREVENT 10年 ${r.prevent.ascvd10.toFixed(1)}%`;
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
  const s = buildSummaryCore(result);
  // fix_round2 R-A8: 1行要約に「LLT開始は推奨されない」を出さない。他の経路の要約に「・HFrEF」だけ付ける
  return result.hfref ? `${s}・HFrEF` : s;
}

/** 全文コピー用テキスト（§11.1） */
export function buildText(result, raw, dateLabel) {
  if (!result || result.route === 'incomplete') return '';
  const r = result;
  const L = [];
  L.push('【2026 ACC/AHA 脂質異常症GL（PREVENT-ASCVD） __DATE__】');
  L.push('');
  L.push('■ 判定');
  // fix_round1 C5: sub が空文字なら括弧を出さない（HIV route など）
  L.push(r.sub ? `  ${r.title}（${r.sub}）` : `  ${r.title}`);
  if (r.prevent.ok) {
    let line = `  PREVENT-ASCVD 10年 ${r.prevent.ascvd10.toFixed(1)}%`;
    if (r.prevent.ascvd30 !== null && r.prevent.ascvd30 !== undefined) line += ` / 30年 ${r.prevent.ascvd30.toFixed(1)}%`;
    // fix_round2 R-C3: 参考値の印（outOfLdlRange / ldlUnknown / A13）を画面と一致させてコピーにも出す
    if (r.prevent.outOfLdlRange) line += '（参考値: GL の区分適用範囲 LDL-C 70〜189 外）';
    if (r.prevent.ldlUnknown) line += '（LDL-C 未確定: 適用範囲 70〜189 の確認が必要）';
    L.push(line);
  } else if (r.prevent.reason) {
    L.push(`  PREVENT-ASCVD: ${PREVENT_NA[r.prevent.reason]}`);
  } else if (r.prevent.missing) {
    L.push(`  PREVENT-ASCVD: ${preventNaMissingText(r.prevent.missing)}`);
  }
  (r.prevent.clampNotes || []).forEach((n) => L.push(`  ※ ${n}`));
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
    L.push('  GL に数値目標の記載なし');
  }

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

  L.push('');
  L.push('■ 入力');
  L.push(`  年齢: ${raw.age !== null && raw.age !== undefined ? raw.age + '歳' : '未入力'} / 性別: ${raw.sex === 'male' ? '男性' : raw.sex === 'female' ? '女性' : '未入力'}`);
  const ascvdLabels = { acs: '急性冠症候群（ACS）の既往', mi: '心筋梗塞の既往', angina: '安定狭心症・不安定狭心症', revasc: '血行再建術の既往', stroke: '脳卒中の既往', tia: '一過性脳虚血発作（TIA）の既往', pad: '末梢動脈疾患（PAD）' };
  const ascvdItems = Object.keys(ascvdLabels).filter((k) => raw[k]).map((k) => ascvdLabels[k]);
  L.push(`  臨床的ASCVD: ${ascvdItems.length ? ascvdItems.join('、') : 'なし'}`);
  let dmLine = `  HeFH: ${yesNo(!!raw.hefh)} / HoFH: ${yesNo(!!raw.hofh)} / 糖尿病: ${yesNo(raw.dm)}`;
  if (raw.dm === true && r.dmEnhLabels && r.dmEnhLabels.length) dmLine += `（Table 17: ${r.dmEnhLabels.join('、')}）`;
  L.push(dmLine);
  L.push(`  CKD: ${raw.ckd && CKD_STAGE_LABEL[raw.ckd] ? CKD_STAGE_LABEL[raw.ckd] : '未選択'} / HIV: ${yesNo(!!raw.hiv)} / HFrEF: ${yesNo(!!raw.hfref)}`);
  L.push(`  収縮期血圧: ${raw.sbp ?? '未入力'} mmHg / 降圧薬: ${yesNo(raw.bptx)} / 現在喫煙: ${yesNo(raw.smoking)} / スタチン: ${yesNo(raw.statin)}`);
  L.push(`  採血: ${raw.fasting === 'fasting' ? '空腹時' : raw.fasting === 'casual' ? '随時' : '未選択'} / TC ${raw.tc ?? '未入力'} / HDL-C ${raw.hdl ?? '未入力'} / TG ${raw.tg ?? '未入力'} mg/dL`);
  if (r.ldlCurrent !== null) {
    const srcLabel = r.ldlSource === 'lab' ? '検査報告値' : 'Sampson/NIH式';
    let ll = `  LDL-C: ${r.ldlCurrent} mg/dL（${srcLabel}）`;
    if (raw.statin === true && r.ldlBaseline !== null) ll += ` / 治療前 ${r.ldlBaseline} mg/dL`;
    L.push(ll);
  }
  if (r.nonHdl !== null) L.push(`  non-HDL-C: ${r.nonHdl} mg/dL`);
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

  // fix_round1 C5: 注記が無い経路でも見出しの扱いを揃える（PRE_CORRECTION_NOTE を見出し無しで
  // 孤立させない）。常に「■ 注記」見出しの下にまとめる。
  L.push('');
  L.push('■ 注記');
  (r.notes || []).forEach((n) => L.push(`  ※ ${n}`));
  // fix_round2 R-C5 / 仕様書 §11.1: コピー末尾は短縮形
  L.push('  ※ 2026年3月オンライン公開版に基づく（2026年6月・9月の訂正を確認済み、判定への影響なし）');
  return L.join('\n');
}
