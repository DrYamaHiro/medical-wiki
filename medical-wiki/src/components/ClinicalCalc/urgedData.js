/**
 * urgedData.js — レストレスレッグス症候群（RLS / Willis-Ekbom 病）
 * URGED 基準チェックリストのデータと判定ロジック。
 *
 * React に依存しない純粋なデータ + 関数のみ。node から直接テストできる。
 * 用量の具体的数値はここに書かない（RLS 診療ページ / Drug Reference に委ねる）。
 */

/* ============================================================
   1. 必須診断基準（IRLSSG 2012 改訂 / ICSD-3 が採用）
   ============================================================ */

export const CRITERION_ANSWERS = [
  { value: 'yes', label: '該当', short: '該当' },
  { value: 'no', label: '非該当', short: '非該当' },
  { value: 'unclear', label: '不明', short: '不明' },
];

export const URGED_CRITERIA = [
  {
    key: 'U',
    word: 'Urge',
    title: '脚を動かしたいという欲求（衝動）',
    question: '脚を動かしたいという欲求がありますか。多くは脚の不快な感覚（むずむず、ほてり、虫が這う感じ、痛みなど）を伴います。',
    hint: '多くは脚の不快な感覚を伴うか、その感覚が原因と本人が感じる。感覚を伴わない例もある。まれに腕など他の部位にも生じる。',
  },
  {
    key: 'R',
    word: 'Rest',
    title: '安静時に始まる、または悪化する',
    question: '座っているとき、横になっているときなど、じっとしているときに症状が始まる、または強くなりますか。',
    hint: '安静・不動の状態が続くほど症状が出やすくなる。',
  },
  {
    key: 'G',
    word: 'Gets better with movement',
    title: '運動により軽快する',
    question: '歩く、脚を伸ばす、さするなど、体を動かすと症状が楽になりますか。',
    hint: '少なくとも動かしている間は、部分的または完全に軽快する。重症例では軽快が目立たなくなることがあるが、以前は軽快していた経過を確認する。',
  },
  {
    key: 'E',
    word: 'Evening / night worsening',
    title: '夕方から夜間に出現・増悪する',
    question: '症状は日中よりも夕方から夜にかけて強くなりますか。あるいは夕方から夜にだけ起こりますか。',
    hint: '概日リズム性の増悪。重症化すると日中にも出現するが、その場合も以前は夕方・夜間優位であったことを確認する。',
  },
  {
    key: 'D',
    word: 'Differential / not solely explained by another condition',
    title: '他の疾患・行動上の状態だけでは説明できない',
    question: '症状は、こむら返り、体位による不快感、筋肉痛、静脈うっ滞、下肢浮腫、関節炎、習慣的な足踏みなど、他の原因だけでは説明しきれませんか（RLS として独立した症状がありますか）。',
    hint: '鑑別: 下肢のこむら返り、体位による不快感、筋肉痛、静脈うっ滞、下肢浮腫、関節炎、習慣的な足踏み、末梢神経障害、アカシジア。RLS とこれらが併存することもあるため、RLS の症状が他だけで説明し切れるかを判断する。',
  },
];

/* ============================================================
   2. 経過の特定（頻度）と臨床的意義（ICSD-3 の診断要件）
   ============================================================ */

export const ICSD3_NOTE =
  'ICSD-3 は IRLSSG 2012 の 5 基準を採用し、臨床的意義（症状が心配〈concern〉・苦痛・睡眠障害、または精神・身体・社会・職業・教育・行動面の機能障害を引き起こすこと）を診断要件として加えている。';

export const COURSE = {
  frequency: {
    label: '頻度（経過の特定）',
    options: [
      {
        value: 'chronic',
        label: '週2回以上（過去1年・未治療なら）',
        short: '慢性持続型（週2回以上）',
        hint: '未治療の状態で、過去1年間に週2回以上症状があった場合。',
      },
      {
        value: 'intermittent',
        label: '週2回未満（過去1年）かつ 生涯5回以上のエピソード',
        short: '間欠型（週2回未満・生涯5回以上）',
        hint: '未治療の状態で、過去1年間は週2回未満だが、生涯で5回以上のエピソードがある場合。',
      },
      {
        value: 'none',
        label: 'いずれにも該当しない（生涯 5 回未満）',
        short: '経過型に該当せず',
        hint: '生涯のエピソードが 5 回未満で、慢性持続型・間欠型のいずれにも当てはまらない場合。',
      },
    ],
  },
  significance: {
    label: '臨床的意義（ICSD-3 の診断要件）',
    options: [
      {
        value: 'yes',
        label: '睡眠障害・苦痛・日中の機能障害あり',
        short: '臨床的意義あり',
      },
      {
        value: 'no',
        label: 'いずれもなし',
        short: '臨床的意義なし',
      },
    ],
  },
  significanceDetails: {
    label: '内訳（臨床的意義ありの場合）',
    options: [
      { value: 'onset', label: '入眠困難' },
      { value: 'maintenance', label: '中途覚醒' },
      { value: 'daytime', label: '日中の眠気・倦怠' },
      { value: 'distress', label: '苦痛・いらだち' },
      { value: 'function', label: '仕事・家事・社会生活への支障' },
    ],
  },
};

export const PATIENT_FLAGS = [
  {
    key: 'childbearing',
    label: '妊娠可能年齢',
    hint: '妊娠の有無を確認する（妊娠、特に第3三半期は RLS の増悪因子）。',
  },
];

/* ============================================================
   3. 診断を支持する所見（IRLSSG 2012 の supportive features）
   ============================================================ */

export const SUPPORTIVE = [
  { key: 'plms', label: '睡眠時周期性四肢運動（PLMS）の指摘', short: 'PLMS の指摘' },
  { key: 'family', label: '第1度近親者の家族歴', short: '家族歴' },
  { key: 'dopa_response', label: 'ドパミン作動薬への反応歴', short: 'ドパミン作動薬への反応歴' },
  { key: 'no_hypersomnolence', label: '著明な日中の眠気を欠く', short: '著明な日中の眠気なし' },
];

/* ============================================================
   4. 二次性・増悪因子
   ============================================================ */

export const SECONDARY = [
  {
    key: 'iron_deficiency',
    label: '鉄補充の適応域（RLS 基準: フェリチン 75 ng/mL 以下 または TSAT 20% 未満）',
    short: '鉄補充適応域',
    group: 'iron',
  },
  { key: 'ida', label: '鉄欠乏性貧血', short: '鉄欠乏性貧血', group: 'iron' },
  {
    key: 'gi_blood_loss',
    label: '胃切除後・慢性消化管出血（鉄欠乏の原因）',
    short: '胃切除後・慢性消化管出血',
    group: 'iron',
  },
  { key: 'ckd', label: '慢性腎臓病・透析', short: '慢性腎臓病・透析', group: 'disease' },
  { key: 'pregnancy', label: '妊娠（特に第3三半期）', short: '妊娠', group: 'disease' },
  { key: 'dm_neuropathy', label: '糖尿病・末梢神経障害', short: '糖尿病・末梢神経障害', group: 'disease' },
  { key: 'parkinson', label: 'パーキンソン病', short: 'パーキンソン病', group: 'disease' },
  { key: 'spinal', label: '脊髄疾患', short: '脊髄疾患', group: 'disease' },
  { key: 'ms', label: '多発性硬化症', short: '多発性硬化症', group: 'disease' },
  { key: 'osa', label: '未治療の閉塞性睡眠時無呼吸', short: '未治療の閉塞性睡眠時無呼吸', group: 'disease' },
  {
    key: 'drug_antihistamine',
    label: '第1世代抗ヒスタミン薬',
    short: '第1世代抗ヒスタミン薬',
    group: 'drug',
  },
  {
    key: 'drug_antidepressant',
    label: '抗うつ薬（SSRI・SNRI・三環系・ミルタザピン）',
    short: '抗うつ薬（SSRI・SNRI 等）',
    group: 'drug',
  },
  {
    key: 'drug_dopamine_antagonist',
    label: 'ドパミン拮抗薬（抗精神病薬・メトクロプラミド・スルピリド・プロクロルペラジン）',
    short: 'ドパミン拮抗薬',
    group: 'drug',
  },
  { key: 'drug_lithium', label: 'リチウム', short: 'リチウム', group: 'drug' },
  {
    key: 'stimulants',
    label: 'カフェイン・アルコール・ニコチン',
    short: 'カフェイン・アルコール・ニコチン',
    group: 'lifestyle',
  },
  { key: 'sleep_deprivation', label: '睡眠不足', short: '睡眠不足', group: 'lifestyle' },
];

/* ============================================================
   5. IRLS（IRLSSG 重症度評価尺度）
   本ツールの項目文は要点を簡潔に言い換えた表記。
   公式版は IRLSSG（MAPI Research Trust）のライセンス版を用いること。
   ============================================================ */

const IRLS_GENERIC = [
  { value: 0, label: '0:なし' },
  { value: 1, label: '1:軽度' },
  { value: 2, label: '2:中等度' },
  { value: 3, label: '3:重度' },
  { value: 4, label: '4:非常に重度' },
];

export const IRLS_ITEMS = [
  {
    no: 1,
    text: '脚（または腕）の RLS の不快感の全体的な強さ',
    options: IRLS_GENERIC,
  },
  {
    no: 2,
    text: '症状による「動きたい」欲求の強さ',
    options: IRLS_GENERIC,
  },
  {
    no: 3,
    text: '体を動かしたときの症状の軽快の程度',
    options: [
      { value: 0, label: '0:症状がない' },
      { value: 1, label: '1:ほぼ完全に軽快' },
      { value: 2, label: '2:中等度に軽快' },
      { value: 3, label: '3:わずかに軽快' },
      { value: 4, label: '4:軽快しない' },
    ],
  },
  {
    no: 4,
    text: '症状による睡眠障害の程度',
    options: IRLS_GENERIC,
  },
  {
    no: 5,
    text: '症状による日中の疲労感・眠気の程度',
    options: IRLS_GENERIC,
  },
  {
    no: 6,
    text: 'RLS 全体としての重症度',
    options: IRLS_GENERIC,
  },
  {
    no: 7,
    text: '症状が起こる頻度',
    options: [
      { value: 0, label: '0:なし' },
      { value: 1, label: '1:週1日以下' },
      { value: 2, label: '2:週2-3日' },
      { value: 3, label: '3:週4-5日' },
      { value: 4, label: '4:週6-7日' },
    ],
  },
  {
    no: 8,
    text: '平均的な 1 日あたりの症状の持続時間',
    options: [
      { value: 0, label: '0:なし' },
      { value: 1, label: '1:1時間未満' },
      { value: 2, label: '2:1-3時間' },
      { value: 3, label: '3:3-8時間' },
      { value: 4, label: '4:8時間以上' },
    ],
  },
  {
    no: 9,
    text: '日常生活（家庭・仕事・学業・社会生活）への支障の程度',
    options: IRLS_GENERIC,
  },
  {
    no: 10,
    text: '症状による気分の障害（いらだち・抑うつ・不安・怒りっぽさ）の程度',
    options: IRLS_GENERIC,
  },
];

export const IRLS_LICENSE_NOTE =
  '本ツールの IRLS 項目は各設問の要点を簡潔に言い換えた表記です。研究・公式評価には IRLSSG（MAPI Research Trust）のライセンス版を用いてください。';

export const IRLS_USE_NOTE =
  '診断成立後の重症度評価・治療効果判定に用いる。直近 1 週間について患者本人が回答する自己記入尺度であり、医師は理解の確認に留める。';

export const IRLS_SEVERITY = [
  { min: 0, max: 0, label: 'なし', color: '#2E7D32' },
  { min: 1, max: 10, label: '軽症', color: '#558B2F' },
  { min: 11, max: 20, label: '中等症', color: '#F9A825' },
  { min: 21, max: 30, label: '重症', color: '#E65100' },
  { min: 31, max: 40, label: '最重症', color: '#C62828' },
];

export function getIrlsSeverity(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return IRLS_SEVERITY.find((s) => score >= s.min && score <= s.max) || null;
}

/* ============================================================
   6. 出典
   ============================================================ */

export const URGED_SOURCES = [
  {
    key: 'irlssg2012',
    label: 'IRLSSG 2012 改訂診断基準（必須5基準の原典）',
    citation:
      'Allen RP, Picchietti DL, Garcia-Borreguero D, et al. Restless legs syndrome/Willis-Ekbom disease diagnostic criteria: updated International Restless Legs Syndrome Study Group (IRLSSG) consensus criteria. Sleep Med. 2014;15(8):860-873.',
    note: '2012 年の改訂コンセンサスを 2014 年に報告したもの。臨床的意義は specifier として扱う。',
  },
  {
    key: 'icsd3',
    label: 'ICSD-3（睡眠障害国際分類 第3版）',
    citation:
      'American Academy of Sleep Medicine. International Classification of Sleep Disorders, 3rd ed. Darien, IL: AASM; 2014.',
    note: `${ICSD3_NOTE}現行版は ICSD-3-TR（2023）。`,
  },
  {
    key: 'irls',
    label: 'IRLS（IRLSSG 重症度評価尺度）',
    citation:
      'Walters AS, LeBrocq C, Dhar A, et al. Validation of the International Restless Legs Syndrome Study Group rating scale for restless legs syndrome. Sleep Med. 2003;4(2):121-132.',
    note: '10 項目・各 0-4 点・合計 0-40 点。',
  },
  {
    key: 'iron2018',
    label: 'IRLSSG 鉄治療ガイドライン',
    citation:
      'Allen RP, Picchietti DL, Auerbach M, et al. Evidence-based and consensus clinical practice guidelines for the iron treatment of restless legs syndrome/Willis-Ekbom disease in adults and children: an IRLSSG task force report. Sleep Med. 2018;41:27-44.',
    note: '鉄補充の適応域と安全上限（TSAT 45% 以上では補充しない）の典拠。',
  },
  {
    key: 'aasm2025',
    label: 'AASM 臨床診療ガイドライン 2025（治療）',
    citation:
      'Winkelman JW, Berkowski JA, DelRosso LM, et al. Treatment of restless legs syndrome and periodic limb movement disorder: an American Academy of Sleep Medicine clinical practice guideline. J Clin Sleep Med. 2025;21(1):137-152.',
    note: 'α2δ リガンドおよび静注カルボキシマルトース第二鉄を強い推奨（他の静注鉄製剤は条件付き推奨）、ドパミン作動薬は条件付き非推奨。本ツールの治療方針文の典拠。',
  },
  {
    key: 'longterm2013',
    label: 'IRLSSG 長期治療コンセンサス',
    citation:
      'Garcia-Borreguero D, Kohnen R, Silber MH, et al. The long-term treatment of restless legs syndrome/Willis-Ekbom disease: evidence-based guidelines and clinical consensus best practice guidance: a report from the International Restless Legs Syndrome Study Group. Sleep Med. 2013;14(7):675-684.',
    note: '長期治療における評価と管理。',
  },
  {
    key: 'augmentation2016',
    label: 'IRLSSG / EURLSSG / RLS-Foundation 合同タスクフォース',
    citation:
      'Garcia-Borreguero D, Silber MH, Winkelman JW, et al. Guidelines for the first-line treatment of restless legs syndrome/Willis-Ekbom disease, prevention and treatment of dopaminergic augmentation: a combined task force of the IRLSSG, EURLSSG, and the RLS-foundation. Sleep Med. 2016;21:1-11.',
    note: 'augmentation の予防・対処の典拠。',
  },
];

/* ============================================================
   7. 判定ロジック
   ============================================================ */

export function createInitialState() {
  const criteria = {};
  URGED_CRITERIA.forEach((c) => {
    criteria[c.key] = null;
  });
  return {
    criteria,
    frequency: null,
    significance: null,
    significanceDetails: [],
    flags: [],
    supportive: [],
    secondary: [],
    irls: IRLS_ITEMS.map(() => null),
  };
}

const FREQUENCY_VALUES = COURSE.frequency.options.map((o) => o.value);

function normalizeState(state) {
  const base = createInitialState();
  if (!state || typeof state !== 'object') return base;
  const criteria = { ...base.criteria };
  if (state.criteria && typeof state.criteria === 'object') {
    URGED_CRITERIA.forEach((c) => {
      const v = state.criteria[c.key];
      criteria[c.key] = v === 'yes' || v === 'no' || v === 'unclear' ? v : null;
    });
  }
  const irlsRaw = Array.isArray(state.irls) ? state.irls : [];
  const irls = IRLS_ITEMS.map((_, i) => {
    const v = irlsRaw[i];
    return Number.isInteger(v) && v >= 0 && v <= 4 ? v : null;
  });
  const toArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
  return {
    criteria,
    frequency: FREQUENCY_VALUES.includes(state.frequency) ? state.frequency : null,
    significance: state.significance === 'yes' || state.significance === 'no' ? state.significance : null,
    significanceDetails: toArray(state.significanceDetails),
    flags: toArray(state.flags),
    supportive: toArray(state.supportive),
    secondary: toArray(state.secondary),
    irls,
  };
}

const ESSENTIAL_STATUS = {
  met: { label: '必須基準 5/5 該当', tone: 'ok', color: '#2E7D32' },
  not_met: { label: '必須基準を満たさない', tone: 'ng', color: '#C62828' },
  incomplete: { label: '再聴取が必要', tone: 'warn', color: '#F9A825' },
  in_progress: { label: '入力中', tone: 'none', color: '#78909C' },
  unanswered: { label: '未評価', tone: 'none', color: '#78909C' },
};

/*
  鉄補充の閾値（IRLSSG 2018 / AASM 2025）
  - 補充の検討: 血清フェリチン 75 ng/mL 以下、または TSAT 20% 未満
  - フェリチン 75〜100 では静注鉄（カルボキシマルトース第二鉄）を考慮
  - TSAT 45% 以上は鉄過剰のリスクがあるため補充しない（安全上限）
*/
export const IRON_ACTION =
  '血清フェリチン 75 ng/mL 以下（または TSAT 20% 未満）で鉄補充を検討（IRLSSG 2018 / AASM 2025）。フェリチン 75〜100 では静注鉄を考慮（AASM 2025）。TSAT 45% 以上は鉄過剰のリスクがあるため補充しない（IRLSSG 2018）。';

export const PHARMACOTHERAPY_ACTION =
  'α2δ リガンド（ガバペンチンエナカルビル。ガバペンチン・プレガバリンは RLS 適応外）、または鉄指標が適応域にある場合の静注カルボキシマルトース第二鉄（日本では鉄欠乏性貧血が適応で、貧血を伴わない RLS には適応外）を優先（AASM 2025 強い推奨）。ドパミン作動薬（プラミペキソール・ロチゴチン・ロピニロール・レボドパ）は augmentation のため標準的な使用は推奨されない（AASM 2025 条件付き非推奨）。短期・限定的な使用に留める。用量は RLS ページ / Drug Reference 参照。';

export const IRON_WORKUP_NOTE =
  '鉄検査は可能なら朝、鉄含有サプリ・食品を 24 時間以上避けて採血。フェリチンは炎症で偽高値になるため CRP の併検を考慮。';

function buildJudgment(status, significance, counts) {
  if (status === 'met') {
    if (significance === 'yes') {
      return {
        level: 'icsd3_met',
        label: '必須 5 基準 + 臨床的意義を満たす（ICSD-3 診断要件充足）',
        color: '#2E7D32',
      };
    }
    if (significance === 'no') {
      return {
        level: 'significance_absent',
        label: '必須 5 基準は充足。臨床的意義なし（ICSD-3 の診断要件は未充足）',
        color: '#F9A825',
      };
    }
    return {
      level: 'significance_unknown',
      label: '必須 5 基準は充足。臨床的意義を確認してください',
      color: '#F9A825',
    };
  }
  if (status === 'in_progress') {
    return {
      level: 'in_progress',
      label: `必須基準: 入力中（${counts.answered}/${counts.total} 回答）`,
      color: ESSENTIAL_STATUS.in_progress.color,
    };
  }
  return {
    level: status,
    label: ESSENTIAL_STATUS[status].label,
    color: ESSENTIAL_STATUS[status].color,
  };
}

/**
 * 状態を評価して、必須基準・経過・IRLS・推奨検査・対応の要点を返す。
 */
export function evaluateUrged(state) {
  const s = normalizeState(state);

  /* --- 必須基準 --- */
  const answers = URGED_CRITERIA.map((c) => ({ key: c.key, title: c.title, value: s.criteria[c.key] }));
  const total = URGED_CRITERIA.length;
  const yesCount = answers.filter((a) => a.value === 'yes').length;
  const noCount = answers.filter((a) => a.value === 'no').length;
  const unclearCount = answers.filter((a) => a.value === 'unclear').length;
  const unansweredCount = answers.filter((a) => a.value === null).length;
  const answeredCount = total - unansweredCount;

  let status;
  if (noCount > 0) status = 'not_met';
  else if (yesCount === total) status = 'met';
  else if (unclearCount > 0) status = 'incomplete';
  else if (unansweredCount === total) status = 'unanswered';
  else status = 'in_progress';

  const essential = {
    answers,
    yesCount,
    noCount,
    unclearCount,
    unansweredCount,
    answeredCount,
    total,
    status,
    statusLabel: ESSENTIAL_STATUS[status].label,
    tone: ESSENTIAL_STATUS[status].tone,
    color: ESSENTIAL_STATUS[status].color,
  };

  /* --- 経過 --- */
  const freqOpt = COURSE.frequency.options.find((o) => o.value === s.frequency) || null;
  const sigOpt = COURSE.significance.options.find((o) => o.value === s.significance) || null;
  const sigDetails = COURSE.significanceDetails.options.filter((o) => s.significanceDetails.includes(o.value));
  const courseParts = [];
  if (freqOpt) courseParts.push(freqOpt.short);
  if (sigOpt) {
    if (sigOpt.value === 'yes' && sigDetails.length > 0) {
      courseParts.push(`${sigOpt.short}（${sigDetails.map((d) => d.label).join('・')}）`);
    } else {
      courseParts.push(sigOpt.short);
    }
  }
  const course = {
    frequency: s.frequency,
    frequencyLabel: freqOpt ? freqOpt.short : null,
    significance: s.significance,
    significanceLabel: sigOpt ? sigOpt.short : null,
    details: sigDetails,
    summary: courseParts.length > 0 ? courseParts.join('、') : null,
  };

  const judgment = buildJudgment(status, s.significance, { answered: answeredCount, total });

  /* --- 支持所見・二次性因子 --- */
  const supportive = SUPPORTIVE.filter((x) => s.supportive.includes(x.key));
  const secondary = SECONDARY.filter((x) => s.secondary.includes(x.key));
  const hasIronIndication = secondary.some((x) => x.key === 'iron_deficiency' || x.key === 'ida');
  const hasGiBloodLoss = secondary.some((x) => x.key === 'gi_blood_loss');
  const hasDrug = secondary.some((x) => x.group === 'drug');
  const hasLifestyle = secondary.some((x) => x.key === 'stimulants');
  const hasSleepDeprivation = secondary.some((x) => x.key === 'sleep_deprivation');
  const hasPregnancy = secondary.some((x) => x.key === 'pregnancy');
  const hasCkd = secondary.some((x) => x.key === 'ckd');
  const hasOsa = secondary.some((x) => x.key === 'osa');
  const childbearing = s.flags.includes('childbearing');

  /* --- IRLS --- */
  const answeredIrls = s.irls.filter((v) => typeof v === 'number');
  const irlsComplete = answeredIrls.length === IRLS_ITEMS.length;
  const irlsScore = irlsComplete ? answeredIrls.reduce((a, b) => a + b, 0) : null;
  const irlsSeverity = irlsComplete ? getIrlsSeverity(irlsScore) : null;
  const irls = {
    values: s.irls,
    answered: answeredIrls.length,
    total: IRLS_ITEMS.length,
    max: IRLS_ITEMS.length * 4,
    score: irlsScore,
    severity: irlsSeverity,
    severityLabel: irlsSeverity ? irlsSeverity.label : null,
  };

  /* --- 推奨検査 --- */
  const workup = ['血清フェリチン', 'TSAT（トランスフェリン飽和度）', '血算', '腎機能', '血糖・HbA1c'];
  if (childbearing) workup.push('妊娠の有無の確認');
  const workupOptional = ['必要に応じてビタミンB12・葉酸'];
  const workupNotes = [IRON_WORKUP_NOTE];

  /* --- 対応の要点 ---
     薬物療法（および非薬物療法での経過観察）の提案は、
     「必須 5 基準を満たす」かつ「臨床的意義あり（ICSD-3 の診断要件を満たす）」かつ
     「妊娠していない」場合のみ。 */
  const canProposePharmacotherapy = status === 'met' && s.significance === 'yes' && !hasPregnancy;
  const actions = [];

  if (status === 'not_met') {
    actions.push(
      '必須基準を満たさない。鑑別（こむら返り・末梢神経障害・アカシジア・静脈うっ滞など）を優先。鉄と原因薬剤の見直しは可。'
    );
  } else if (status === 'incomplete') {
    actions.push('不明の項目があるため、再聴取のうえで診断を確定する。');
  } else if (status === 'in_progress') {
    actions.push('必須基準の入力が未完了。残りの項目を確認する。');
  } else if (status === 'met') {
    if (s.significance === 'no') {
      actions.push('臨床的意義を認めないため ICSD-3 の診断要件は未充足。経過観察とし、誘因の是正に留める。');
    } else if (s.significance === null) {
      actions.push('臨床的意義を確認のうえ治療強度を判断する。');
    }
  }

  actions.push('フェリチン・TSAT・血算・腎機能を確認。');
  actions.push(hasIronIndication ? `鉄補充の適応域に該当。${IRON_ACTION}` : IRON_ACTION);
  if (hasGiBloodLoss) {
    actions.push('鉄欠乏の原因検索（消化管出血・吸収障害など）を並行して行う。');
  }
  actions.push(
    hasDrug ? '原因薬剤（抗うつ薬・抗ヒスタミン薬・ドパミン拮抗薬など）の見直しを検討。' : '原因薬剤の見直し。'
  );

  const lifestyle = [];
  lifestyle.push(hasLifestyle ? 'カフェイン・アルコール・ニコチンの制限' : 'カフェイン・アルコール制限');
  if (hasSleepDeprivation) lifestyle.push('睡眠時間の確保');
  lifestyle.push('睡眠衛生');
  actions.push(`${lifestyle.join('、')}。`);

  if (hasOsa) {
    actions.push('未治療の閉塞性睡眠時無呼吸があれば、その治療を先行・併行する。');
  }
  if (hasPregnancy) {
    actions.push('妊娠中は鉄の評価と非薬物療法を優先。薬物療法は妊娠特異的な安全性を個別に検討。');
  }
  if (hasCkd) {
    actions.push('腎機能に応じた薬剤選択・用量調整が必要。');
  }

  const severeEnough =
    irlsSeverity && ['中等症', '重症', '最重症'].includes(irlsSeverity.label);
  if (canProposePharmacotherapy) {
    if (severeEnough) {
      actions.push(`中等症以上。${PHARMACOTHERAPY_ACTION}`);
    } else if (irlsSeverity) {
      actions.push('軽症のため、まず誘因の是正と非薬物療法で経過を見る。');
    } else {
      actions.push('重症度（IRLS）を評価したうえで治療強度を判断する。');
    }
    if (course.frequency === 'intermittent') {
      actions.push('間欠型では定時内服ではなく、誘因是正と頓用的な対応を優先する。');
    }
  }

  return {
    essential,
    judgment,
    course,
    supportive,
    secondary,
    flags: { childbearing },
    guards: {
      pregnancy: hasPregnancy,
      ckd: hasCkd,
      osa: hasOsa,
      ironIndication: hasIronIndication,
      canProposePharmacotherapy,
    },
    irls,
    workup,
    workupOptional,
    workupNotes,
    actions,
    hasInput:
      status !== 'unanswered' ||
      course.summary !== null ||
      supportive.length > 0 ||
      secondary.length > 0 ||
      childbearing ||
      answeredIrls.length > 0,
  };
}

/* ============================================================
   8. カルテ貼付用テキスト
   ============================================================ */

const ANSWER_SHORT = {
  yes: '該当',
  no: '非該当',
  unclear: '不明',
};

/**
 * カルテ貼付用テキストを生成する。result を渡さない場合は内部で評価する。
 */
export function buildUrgedText(state, result) {
  const r = result || evaluateUrged(state);
  if (!r.hasInput) return '';

  const lines = [];
  lines.push('【RLS URGED 基準 __DATE__】');

  const answerText = r.essential.answers
    .map((a) => `${a.key} ${a.value ? ANSWER_SHORT[a.value] : '未評価'}`)
    .join(' / ');

  if (r.essential.status === 'met') {
    lines.push(`${answerText} → ${r.judgment.label}。`);
  } else if (r.essential.status === 'not_met') {
    lines.push(`${answerText} → 必須基準を満たさない（非該当 ${r.essential.noCount} 項目）。`);
  } else if (r.essential.status === 'incomplete') {
    lines.push(
      `${answerText} → 該当 ${r.essential.yesCount}/${r.essential.total}、不明 ${r.essential.unclearCount} 項目。再聴取が必要。`
    );
  } else if (r.essential.status === 'in_progress') {
    lines.push(`${answerText} → 必須基準: 入力中（${r.essential.answeredCount}/${r.essential.total} 回答）。`);
  } else {
    lines.push(`${answerText} → 必須基準は未評価。`);
  }

  if (r.course.summary) {
    lines.push(`経過: ${r.course.summary}。`);
  }
  if (r.supportive.length > 0) {
    lines.push(`支持所見: ${r.supportive.map((x) => x.short).join('、')}。`);
  }
  if (r.secondary.length > 0) {
    lines.push(`二次性・増悪因子: ${r.secondary.map((x) => x.short).join('、')}。`);
  }
  if (r.flags.childbearing) {
    lines.push('妊娠可能年齢（妊娠の有無を確認）。');
  }
  if (r.irls.score !== null && r.irls.severityLabel) {
    const caveat = r.essential.status === 'met' ? '' : '。診断未確定のため参考値';
    lines.push(`IRLS ${r.irls.score}/${r.irls.max}（${r.irls.severityLabel}${caveat}）。`);
  } else if (r.irls.answered > 0) {
    lines.push(`IRLS 未完了（${r.irls.answered}/${r.irls.total} 項目回答）。`);
  }

  lines.push('方針:');
  r.actions.forEach((a) => lines.push(`  ${a}`));
  lines.push('');
  lines.push('※ 診断の確定は医師の臨床判断による。本チェックリストは IRLSSG 2012 改訂必須診断基準に基づく補助ツール。');
  lines.push(`※ ${ICSD3_NOTE}`);
  lines.push(`※ ${IRLS_LICENSE_NOTE}`);

  return lines.join('\n');
}
