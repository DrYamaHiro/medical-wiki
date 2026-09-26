/**
 * hisayamaData.js — 久山町スコアによるリスク区分と脂質管理目標
 *
 * 日本動脈硬化学会「動脈硬化性疾患予防ガイドライン2022年版」
 *   図3-1（リスク区分の判定手順）、図3-2（久山町研究によるスコア）、
 *   表3-2 / 表3-3（リスク区分別脂質管理目標値）、第4章（FH の管理目標）
 *
 * React に依存しない純粋なデータ + 関数のみ。node から直接テストできる。
 */

/* ============================================================
   1. 判定手順（図3-1）に使う既往・合併症
   ============================================================ */

export const CONDITION_ITEMS = [
  { id: 'fh', group: 'fh', label: '家族性高コレステロール血症 FH（成人ヘテロ接合体）' },
  { id: 'fh3', group: 'fh', label: '家族性III型高脂血症' },
  { id: 'cad', group: 'secondary', label: '冠動脈疾患の既往（心筋梗塞・狭心症・PCI/CABG後）' },
  { id: 'acs', group: 'secondary', label: '急性冠症候群（ACS）', hint: '冠動脈疾患として二次予防に判定' },
  {
    id: 'athero',
    group: 'secondary',
    label: 'アテローム血栓性脳梗塞の既往（明らかなアテローム＊を伴うその他の脳梗塞を含む）',
    hint: '＊頭蓋内外動脈の50%以上の狭窄、または弓部大動脈粥腫（最大肥厚4mm以上）',
  },
  { id: 'dm', group: 'high', label: '糖尿病（耐糖能異常は含まない）' },
  { id: 'micro', group: 'high', label: '細小血管症（網膜症・腎症・神経障害）', onlyWith: 'dm' },
  { id: 'ckd', group: 'high', label: '慢性腎臓病（CKD）', hint: 'eGFR<60 mL/min/1.73m² またはタンパク尿が3か月以上持続' },
  { id: 'pad', group: 'high', label: '末梢動脈疾患（PAD）' },
];

/* ============================================================
   2. 久山町スコア（図3-2）— 6 項目・0〜19 点。年齢は点数化しない
   ============================================================ */

export const IGT_OPTIONS = [
  { value: 'no', label: 'なし', pts: 0 },
  { value: 'yes', label: 'あり', pts: 1 },
  { value: 'unknown', label: '不明', pts: 0 },
];

export const IGT_DEFINITION = '参考：日本動脈硬化学会 公式Webアプリ「動脈硬化性疾患発症予測・脂質管理目標設定アプリ」の定義（空腹時血糖 110〜125 mg/dL または OGTT 2時間値 140〜199 mg/dL）。GL本文に数値基準の記載なし';

export const IGT_UNKNOWN_NOTE = '糖代謝異常は不明のため0点で計算（ありなら +1点）';

export function sbpPoints(sbp) {
  if (sbp >= 160) return 4;
  if (sbp >= 140) return 3;
  if (sbp >= 130) return 2;
  if (sbp >= 120) return 1;
  return 0;
}

export function ldlPoints(ldl) {
  if (ldl >= 160) return 3;
  if (ldl >= 140) return 2;
  if (ldl >= 120) return 1;
  return 0;
}

export function hdlPoints(hdl) {
  if (hdl < 40) return 2;
  if (hdl < 60) return 1;
  return 0;
}

const ok = (v) => typeof v === 'number' && isFinite(v) && v > 0;

/**
 * @param {{sex:'male'|'female', sbp:number, igt:'no'|'yes'|'unknown', ldl:number, hdl:number, smoking:boolean}} p
 * @returns {{total:number, items:Array<{label:string, value:string, pts:number}>} | null}
 */
export function calcScore(p) {
  if (p.sex !== 'male' && p.sex !== 'female') return null;
  if (!ok(p.sbp) || !ok(p.ldl) || !ok(p.hdl)) return null;
  if (typeof p.smoking !== 'boolean') return null;
  const igt = IGT_OPTIONS.find((o) => o.value === p.igt);
  if (!igt) return null;
  const items = [
    { label: '性別', value: p.sex === 'male' ? '男性' : '女性', pts: p.sex === 'male' ? 7 : 0 },
    { label: '収縮期血圧', value: `${p.sbp} mmHg`, pts: sbpPoints(p.sbp) },
    { label: '糖代謝異常（糖尿病は含まない）', value: igt.label, pts: igt.pts },
    { label: 'LDL-C', value: `${p.ldl} mg/dL`, pts: ldlPoints(p.ldl) },
    { label: 'HDL-C', value: `${p.hdl} mg/dL`, pts: hdlPoints(p.hdl) },
    { label: '喫煙', value: p.smoking ? 'あり' : 'なし', pts: p.smoking ? 2 : 0 },
  ];
  return { total: items.reduce((s, i) => s + i.pts, 0), items };
}

/* ============================================================
   3. 10年発症リスク（冠動脈疾患＋アテローム血栓性脳梗塞）%
      行 = 点数 0..19、列 = 40-49 / 50-59 / 60-69 / 70-79 歳
   ============================================================ */

export const AGE_BANDS = [
  { min: 40, max: 49, label: '40-49歳', short: '40代' },
  { min: 50, max: 59, label: '50-59歳', short: '50代' },
  { min: 60, max: 69, label: '60-69歳', short: '60代' },
  { min: 70, max: 79, label: '70-79歳', short: '70代' },
];

export const RISK_TABLE = [
  ['<1.0', '<1.0', 1.7, 3.4],
  ['<1.0', '<1.0', 1.9, 3.9],
  ['<1.0', '<1.0', 2.2, 4.5],
  ['<1.0', 1.1, 2.6, 5.2],
  ['<1.0', 1.3, 3.0, 6.0],
  ['<1.0', 1.4, 3.4, 6.9],
  ['<1.0', 1.7, 3.9, 7.9],
  ['<1.0', 1.9, 4.5, 9.1],
  [1.1, 2.2, 5.2, 10.4],
  [1.3, 2.6, 6.0, 11.9],
  [1.4, 3.0, 6.9, 13.6],
  [1.7, 3.4, 7.9, 15.5],
  [1.9, 3.9, 9.1, 17.7],
  [2.2, 4.5, 10.4, 20.2],
  [2.6, 5.2, 11.9, 22.9],
  [3.0, 6.0, 13.6, 25.9],
  [3.4, 6.9, 15.5, 29.3],
  [3.9, 7.9, 17.7, 33.0],
  [4.5, 9.1, 20.2, 37.0],
  [5.2, 10.4, 22.9, 41.1],
];

export function ageBandIndex(age) {
  return AGE_BANDS.findIndex((b) => age >= b.min && age <= b.max);
}

export function riskPercent(points, age) {
  const col = ageBandIndex(age);
  if (col < 0 || points < 0 || points >= RISK_TABLE.length) return null;
  return RISK_TABLE[points][col];
}

export function formatRisk(r) {
  return typeof r === 'string' ? r : r.toFixed(1);
}

/* ============================================================
   4. リスク区分と管理目標（表3-2 / 表3-3 / 第4章）
   ============================================================ */

export const CATEGORIES = {
  low: { key: 'low', text: '一次予防 低リスク', short: '低リスク', sub: '10年リスク 2%未満', color: '#2E7D32', ldl: 160, nonHdl: 190 },
  mid: { key: 'mid', text: '一次予防 中リスク', short: '中リスク', sub: '10年リスク 2%以上10%未満', color: '#E65100', ldl: 140, nonHdl: 170 },
  high: { key: 'high', text: '一次予防 高リスク', short: '高リスク', sub: '10年リスク 10%以上', color: '#C62828', ldl: 120, nonHdl: 150 },
};

export function categoryFromRisk(r) {
  if (r === '<1.0') return 'low';
  if (typeof r !== 'number' || !isFinite(r)) return null;
  if (r < 2) return 'low';
  if (r < 10) return 'mid';
  return 'high';
}

export const TG_HDL_TARGET_TEXT = 'TG <150 mg/dL（空腹時）/ <175 mg/dL（随時）、HDL-C ≥40 mg/dL';

/* ============================================================
   5. LDL-C / non-HDL-C の算出
      Friedewald 式（TC − HDL-C − TG/5）は空腹時採血かつ TG <400 mg/dL のときのみ
   ============================================================ */

/**
 * @param {{tc?:number, hdl?:number, tg?:number, ldlDirect?:number, fasting:'fasting'|'casual'|null}} p
 */
export function computeLipids(p) {
  const nonHdl = ok(p.tc) && ok(p.hdl) ? p.tc - p.hdl : null;
  if (ok(p.ldlDirect)) {
    return { ldl: p.ldlDirect, ldlSource: 'direct', nonHdl, friedewaldBlocked: null, friedewaldReason: null };
  }
  let friedewaldBlocked = null;
  let friedewaldReason = null;
  if (p.fasting === 'casual') {
    friedewaldBlocked = '随時採血のため Friedewald 式は使えません。直接法 LDL-C を入力してください。';
    friedewaldReason = '随時採血';
  } else if (p.fasting !== 'fasting') {
    friedewaldBlocked = 'Friedewald 式で LDL-C を求めるには採血条件（空腹時）の選択が必要です。随時採血なら直接法 LDL-C を入力してください。';
    friedewaldReason = '採血条件未選択';
  } else if (ok(p.tg) && p.tg >= 400) {
    friedewaldBlocked = 'TG ≥400 mg/dL のため Friedewald 式は使えません。直接法 LDL-C を入力してください。';
    friedewaldReason = 'TG≥400';
  }
  if (!friedewaldBlocked && ok(p.tc) && ok(p.hdl) && ok(p.tg)) {
    const ldl = Math.round(p.tc - p.hdl - p.tg / 5);
    if (ldl > 0) return { ldl, ldlSource: 'friedewald', nonHdl, friedewaldBlocked: null, friedewaldReason: null };
  }
  return { ldl: null, ldlSource: null, nonHdl, friedewaldBlocked, friedewaldReason };
}


/* ============================================================
   6. 判定（図3-1 の順）
   ============================================================ */

export const FH_LABEL = 'FH（成人ヘテロ接合体）';
export const NOTE_AGE80_TARGET = '管理目標値は基本的に80歳未満の成人に適用（80歳以上は個別に判断）';
export const NOTE_AGE40_TARGET = '40歳未満の脂質管理の是非は主治医の判断';
export const NOTE_FH3_SECONDARY = '冠動脈疾患等の既往がある場合の目標値は GL に明記なし（第5章：脂質代謝の専門家受診が望ましい）';
export const NOTE_SMOKING_MISSING = '喫煙未入力（喫煙ありなら LDL<100 / non-HDL<130 を考慮）';
export const NOTE_LDL180 = 'LDL-C ≥180 mg/dL が持続する場合は薬物療法を考慮し、FH の可能性を念頭に置く';

/** 満年齢（小数入力は切り捨て）。未入力・不正値は null */
export function wholeAge(age) {
  return ok(age) ? Math.floor(age) : null;
}

/** 二次予防 / 一次予防高リスク / FH の経路で付ける年齢の注記（年齢は任意） */
function ageTargetNotes(age) {
  const a = wholeAge(age);
  if (a === null) return [];
  if (a >= 80) return [NOTE_AGE80_TARGET];
  if (a < 40) return [NOTE_AGE40_TARGET];
  return [];
}

/**
 * @param {{cond:Object, age?:number, sex?:string, sbp?:number, igt?:string, smoking?:boolean|null, ldl?:number|null, hdl?:number}} inp
 * @returns {Object} route と管理目標
 *   route: 'fh' | 'fh3' | 'secondary' | 'primaryHigh' | 'score' | 'age80' | 'age40' | 'incomplete'
 *   notes: 画面・コピー用テキストに出す注記
 */
export function evaluate(inp) {
  const c = inp.cond || {};
  const cadAny = !!(c.cad || c.acs);
  const athero = !!c.athero;
  const dm = !!c.dm;

  // 0. FH / 家族性III型高脂血症 → このチャートは用いない
  if (c.fh) {
    const sec = cadAny || athero;
    return {
      route: 'fh',
      text: `${FH_LABEL} ${sec ? '二次予防' : '一次予防'}`,
      sub: 'FH は久山町スコアのチャート対象外（第4章の管理目標）',
      color: '#B71C1C',
      ldl: sec ? 70 : 100,
      nonHdl: sec ? 100 : null,
      consider: null,
      showTgHdl: false,
      notes: ageTargetNotes(inp.age),
    };
  }
  if (c.fh3) {
    return {
      route: 'fh3',
      text: '家族性III型高脂血症',
      sub: 'チャート対象外（第5章参照）',
      color: '#546E7A',
      ldl: null,
      nonHdl: null,
      consider: null,
      showTgHdl: false,
      notes: cadAny || athero ? [NOTE_FH3_SECONDARY] : [],
    };
  }

  // 1. 二次予防
  if (cadAny || athero) {
    const reasons = [];
    if (c.acs) reasons.push('急性冠症候群');
    if (dm) reasons.push('糖尿病');
    if (cadAny && athero) reasons.push('冠動脈疾患とアテローム血栓性脳梗塞の合併');
    return {
      route: 'secondary',
      text: '二次予防',
      sub: '冠動脈疾患またはアテローム血栓性脳梗塞の既往',
      color: '#C62828',
      ldl: 100,
      nonHdl: 130,
      consider: reasons.length ? { ldl: 70, nonHdl: 100, reasons } : null,
      showTgHdl: true,
      notes: ageTargetNotes(inp.age),
    };
  }

  // 2. 一次予防 高リスク（糖尿病・CKD・PAD）
  if (dm || c.ckd || c.pad) {
    const found = [dm && '糖尿病', c.ckd && 'CKD', c.pad && 'PAD'].filter(Boolean);
    let consider = null;
    const notes = [];
    if (dm) {
      const reasons = [];
      if (c.pad) reasons.push('PAD');
      if (c.micro) reasons.push('細小血管症');
      if (inp.smoking === true) reasons.push('喫煙');
      if (reasons.length) consider = { ldl: 100, nonHdl: 130, reasons: reasons.map((r) => `糖尿病＋${r}`) };
      if (!consider && typeof inp.smoking !== 'boolean') notes.push(NOTE_SMOKING_MISSING);
    }
    return {
      route: 'primaryHigh',
      text: '一次予防 高リスク',
      sub: `${found.join('・')}あり（久山町スコアは用いない）`,
      color: '#C62828',
      ldl: 120,
      nonHdl: 150,
      consider,
      showTgHdl: true,
      notes: notes.concat(ageTargetNotes(inp.age)),
    };
  }

  // 3. 久山町スコア（満40〜79 歳のみ）
  const age = wholeAge(inp.age);
  if (age === null) return { route: 'incomplete', missing: ['年齢'] };
  if (age >= 80) {
    return {
      route: 'age80',
      text: 'スコア適用外（80歳以上）',
      sub: '80歳以上の一次予防はスコアを管理目標に結びつけず個別に判断',
      color: '#546E7A',
      ldl: null, nonHdl: null, consider: null, showTgHdl: false, notes: [],
    };
  }
  if (age < 40) {
    return {
      route: 'age40',
      text: 'スコア適用外（40歳未満）',
      sub: '40歳未満は絶対リスクを算出できないため主治医の判断',
      color: '#546E7A',
      ldl: null, nonHdl: null, consider: null, showTgHdl: false, notes: [],
    };
  }

  const score = calcScore(inp);
  if (!score) {
    const missing = [];
    if (inp.sex !== 'male' && inp.sex !== 'female') missing.push('性別');
    if (!ok(inp.sbp)) missing.push('収縮期血圧');
    if (!IGT_OPTIONS.some((o) => o.value === inp.igt)) missing.push('糖代謝異常');
    if (!ok(inp.ldl)) missing.push('LDL-C');
    if (!ok(inp.hdl)) missing.push('HDL-C');
    if (typeof inp.smoking !== 'boolean') missing.push('喫煙');
    return { route: 'incomplete', missing };
  }
  const col = ageBandIndex(age);
  const risk = riskPercent(score.total, age);
  const catKey = categoryFromRisk(risk);
  if (col < 0 || !catKey) return { route: 'incomplete', missing: ['年齢（40〜79歳）'] };
  const band = AGE_BANDS[col];
  const cat = CATEGORIES[catKey];
  return {
    route: 'score',
    text: cat.text,
    sub: cat.sub,
    color: cat.color,
    category: cat.key,
    categoryShort: cat.short,
    score,
    age,
    band,
    risk,
    ldl: cat.ldl,
    nonHdl: cat.nonHdl,
    consider: null,
    showTgHdl: true,
    notes: inp.igt === 'unknown' ? [IGT_UNKNOWN_NOTE] : [],
  };
}

/* ============================================================
   7. 目標との比較・コピー用テキスト
   ============================================================ */

export function attain(value, target) {
  if (value === null || value === undefined || target === null || target === undefined) return null;
  return value < target ? '達成' : '未達';
}

export function targetLine(r) {
  if (r.ldl === null || r.ldl === undefined) return '';
  return r.nonHdl ? `LDL<${r.ldl} / non-HDL<${r.nonHdl}` : `LDL<${r.ldl}`;
}

export function considerLine(r) {
  if (!r.consider) return '';
  return `LDL<${r.consider.ldl} / non-HDL<${r.consider.nonHdl} を考慮: ${r.consider.reasons.join('、')}`;
}

/** LDL-C ≥180 の注記は一次予防の経路（スコア / 高リスク / 40歳未満 / 80歳以上）のみ */
const PRIMARY_ROUTES = ['score', 'primaryHigh', 'age40', 'age80'];
export function showLdl180(r, lip) {
  return !!(r && lip && lip.ldl !== null && lip.ldl >= 180 && PRIMARY_ROUTES.includes(r.route));
}

/** LDL-C が未算出の理由（画面の赤字メッセージと同じ条件で出す） */
export function ldlMissingLine(lip, raw) {
  if (!lip || lip.ldl !== null || !lip.friedewaldReason) return '';
  if (!ok(raw.tc) && !ok(raw.tg)) return '';
  return `LDL-C 未算出（理由: ${lip.friedewaldReason}）`;
}

const LDL_SOURCE_LABEL = { direct: '直接法', friedewald: 'Friedewald式' };

/** 1 行要約 */
export function buildSummary(r, lip) {
  if (!r || r.route === 'incomplete') return '';
  let s;
  if (r.route === 'score') {
    s = `久山町スコア ${r.score.total}点・${r.band.short} 10年リスク${formatRisk(r.risk)}%（${r.categoryShort}） ${targetLine(r)}`;
  } else if (r.route === 'fh3' || r.route === 'age80' || r.route === 'age40') {
    s = `${r.text}: ${r.sub}`;
  } else {
    s = `${r.text} ${targetLine(r)}`;
    if (r.consider) s += `（${considerLine(r)}）`;
  }
  if (lip && lip.ldl !== null && r.ldl) {
    s += ` / 現LDL-C ${lip.ldl}（${attain(lip.ldl, r.ldl)}`;
    if (r.consider) s += `、考慮目標${attain(lip.ldl, r.consider.ldl)}`;
    s += '）';
  }
  return s;
}

/** 全文（PsychCopyBox 用。__DATE__ は日付に置換される） */
export function buildText(r, lip, inp, raw) {
  if (!r || r.route === 'incomplete') return '';
  const c = inp.cond || {};
  const L = [];
  L.push('【久山町スコア（動脈硬化性疾患予防ガイドライン2022） __DATE__】');
  L.push('');
  L.push('■ 判定');
  L.push(`  ${r.text}（${r.sub}）`);
  if (r.route === 'score') {
    L.push(`  久山町スコア ${r.score.total}点 / ${r.band.label} → 10年発症リスク ${formatRisk(r.risk)}%（冠動脈疾患＋アテローム血栓性脳梗塞）`);
  }
  (r.notes || []).forEach((n) => L.push(`  ※ ${n}`));
  if (r.ldl) {
    L.push('');
    L.push('■ 脂質管理目標');
    L.push(`  ${targetLine(r)} mg/dL`);
    if (r.consider) L.push(`  ${considerLine(r)}`);
    if (r.showTgHdl) L.push(`  ${TG_HDL_TARGET_TEXT}`);
    if (lip.ldl !== null) {
      let t = `  現在のLDL-C（${LDL_SOURCE_LABEL[lip.ldlSource]}）: ${lip.ldl} mg/dL — <${r.ldl} ${attain(lip.ldl, r.ldl)}`;
      if (r.consider) t += ` / <${r.consider.ldl} ${attain(lip.ldl, r.consider.ldl)}`;
      L.push(t);
    }
    if (lip.nonHdl !== null && r.nonHdl) {
      let t = `  現在のnon-HDL-C: ${lip.nonHdl} mg/dL — <${r.nonHdl} ${attain(lip.nonHdl, r.nonHdl)}`;
      if (r.consider) t += ` / <${r.consider.nonHdl} ${attain(lip.nonHdl, r.consider.nonHdl)}`;
      L.push(t);
    }
    L.push('  ※ 目標値は到達努力目標');
  }
  L.push('');
  L.push('■ 既往・合併症');
  CONDITION_ITEMS.forEach((it) => {
    if (it.onlyWith && !c[it.onlyWith]) return;
    L.push(`  ${it.label}: ${c[it.id] ? 'あり' : 'なし'}`);
  });
  const a = wholeAge(inp.age);
  if (r.route === 'score') {
    L.push('');
    L.push('■ 久山町スコア内訳');
    L.push(`  年齢: ${r.age}歳（${r.band.label}、点数化しない）`);
    r.score.items.forEach((it) => L.push(`  ${it.label}: ${it.value} → ${it.pts}点`));
    L.push(`  合計: ${r.score.total}点`);
  } else if (a !== null) {
    L.push(`  年齢: ${a}歳`);
  }
  if (r.route === 'primaryHigh' && c.dm) {
    L.push(`  喫煙: ${typeof inp.smoking === 'boolean' ? (inp.smoking ? 'あり' : 'なし') : '未入力'}`);
  }
  const labs = [];
  if (raw.fasting) labs.push(`  採血: ${raw.fasting === 'fasting' ? '空腹時' : '随時'}`);
  if (ok(raw.tc)) labs.push(`  総コレステロール: ${raw.tc} mg/dL`);
  if (ok(raw.hdl)) labs.push(`  HDL-C: ${raw.hdl} mg/dL`);
  if (ok(raw.tg)) labs.push(`  TG: ${raw.tg} mg/dL`);
  if (lip.ldl !== null) labs.push(`  LDL-C: ${lip.ldl} mg/dL（${LDL_SOURCE_LABEL[lip.ldlSource]}）`);
  const miss = ldlMissingLine(lip, raw);
  if (miss) labs.push(`  ${miss}`);
  if (lip.nonHdl !== null) labs.push(`  non-HDL-C（TC − HDL-C）: ${lip.nonHdl} mg/dL`);
  if (labs.length) {
    L.push('');
    L.push('■ 検査値');
    labs.forEach((x) => L.push(x));
  }
  if (showLdl180(r, lip)) {
    L.push('');
    L.push(`※ ${NOTE_LDL180}`);
  }
  return L.join('\n');
}
