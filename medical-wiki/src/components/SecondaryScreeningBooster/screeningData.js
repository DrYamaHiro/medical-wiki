// ============================================================
// 二次健診 Booster データ定義（労災二次健康診断 診察支援）
//
// 出典: 検診チーム作成「労災二次健康診断 医師用マニュアル」(2026-09 受領)
//   - 心エコー / 頸部エコー 紹介状作成チャート（所見 x 既知/未知 → 対応）
//   - 技師の判断基準（エコー検査実施後）: 病院紹介候補は保健師へ「運動指導しない」と申し送り
//   - 紹介状発行対象者・注意事項（紹介先は土曜AM診療、宛先検索依頼ラベル等）
//   - 医師用トークスクリプト（導入・結果説明 1〜4・締め）
//   - 保健指導の運動制限基準
//   - 結果表 医師所見テンプレート（5種）、採血の判定基準（人間ドック協会）
// 血圧分類: 高血圧管理・治療ガイドライン 2025 (JSH2025) の診察室血圧分類（降圧目標 130/80 未満）
//
// チャート外の所見（心嚢液・上行大動脈径・TRPG・甲状腺など）の閾値は本ツール独自の「目安」で、
// マニュアルの基準ではない。備考に「目安」と明記し、最終判断は医師が行う。
// 対応レベル: 既知（かつ通院中）の所見は「通院継続」に落とす。未知の所見はチャート通り。
// ============================================================

export const ACTION = { NONE: 0, CONTINUE: 1, INDIVIDUAL: 2, CLINIC: 3, HOSPITAL: 4 };
export const ACTION_LABEL = {
  0: '問題なし',
  1: '通院継続（既知）',
  2: '個別判断',
  3: 'クリニック紹介',
  4: '病院紹介',
};

// ------------------------------------------------------------
// 受診者背景
// ------------------------------------------------------------
export const SYMPTOMS = [
  { id: 'chest_pain', label: '胸痛・胸部圧迫感', urgent: true },
  { id: 'dyspnea_rest', label: '安静時の息切れ', urgent: true },
  { id: 'dyspnea_exert', label: '労作時の息切れ' },
  { id: 'palpitation', label: '動悸' },
  { id: 'syncope', label: '失神・前失神', urgent: true },
  { id: 'tia', label: '一過性の脱力・しびれ・言語障害', urgent: true },
  { id: 'headache_visual', label: '強い頭痛・視覚障害', urgent: true },
  { id: 'edema', label: '下腿浮腫' },
];

export const TREATMENTS = [
  { id: 'ht', label: '高血圧' },
  { id: 'dm', label: '糖尿病' },
  { id: 'dl', label: '脂質異常症' },
  { id: 'heart', label: '心疾患' },
  { id: 'stroke', label: '脳血管疾患' },
  { id: 'thyroid', label: '甲状腺疾患' },
  { id: 'other', label: 'その他' },
];

export const DEPTS = [
  '循環器内科',
  '脳神経外科',
  '脳神経内科',
  '血管外科',
  '内科（生活習慣病）',
  '内分泌内科・甲状腺外科',
];

// ------------------------------------------------------------
// 心エコー（技師伝達）: チャート準拠 + チャート外の所見（目安）
//  action: 未知の場合の対応。lay: 患者説明用の平易な表現。dx: 紹介状用の所見名。
//  note: チャート備考または本ツールの目安。hs: 保健師への申し送り。patient: 患者への追加説明。
// ------------------------------------------------------------
export const CARDIAC_ITEMS = [
  {
    id: 'wm', label: '壁運動',
    options: [
      { v: '異常なし', action: 0 },
      { v: '異常あり', action: 4, lay: '心臓の壁の動きが一部弱くなっている部分がありました', dept: '循環器内科', dx: '左室壁運動異常' },
    ],
  },
  {
    id: 'lvdd', label: '左室拡大 (LVDd)',
    numeric: { unit: 'mm', placeholder: '48', hint: '数値入力で自動分類', classify: (n) => (n >= 65 ? 2 : n >= 57 ? 1 : 0) },
    options: [
      { v: 'なし (57mm未満)', action: 0 },
      { v: 'あり (57mm以上65mm未満)', action: 3, lay: '心臓（左心室）がやや大きくなっていました', dept: '循環器内科', dx: '左室拡大 (LVDd 57-64mm)', note: 'チャートは性別共通の基準。女性は正常上限が低い（ASE: 男性 58mm / 女性 52mm）ため過小評価に注意' },
      { v: 'あり (65mm以上)', action: 4, lay: '心臓（左心室）が大きくなっていました', dept: '循環器内科', dx: '左室拡大 (LVDd 65mm以上)', note: '拡張型心筋症・拡張相肥大型心筋症など鑑別必要' },
    ],
  },
  {
    id: 'wall', label: '壁厚 (IVS/PW 最大)',
    numeric: { unit: 'mm', placeholder: '10', hint: '数値入力で自動分類', classify: (n) => (n >= 16 ? 2 : n >= 13 ? 1 : 0) },
    options: [
      { v: '肥厚なし (13mm未満)', action: 0 },
      { v: '肥厚あり (13mm以上16mm未満)', action: 3, lay: '心臓の壁がやや厚くなっていました。長年の血圧の影響も考えられます', dept: '循環器内科', dx: '左室壁肥厚 (13-15mm)', note: '長期的な血圧高値の影響も考えられる。基礎疾患により血圧が高い状態もまれにあるため、血圧管理についての説明を依頼', hs: '壁肥厚あり: 血圧管理についての説明を依頼', patient: '血圧による影響かもしれませんが、他の可能性もありフォローが必要なのでクリニックの受診に紹介します' },
      { v: '肥厚あり (16mm以上)', action: 4, lay: '心臓の壁が厚くなっていました', dept: '循環器内科', dx: '左室壁肥厚 (16mm以上)', note: '高血圧性心筋症・肥大型心筋症・アミロイド心筋症・スポーツ心臓など鑑別必要' },
    ],
  },
  {
    id: 'ef', label: '収縮力 (LVEF)',
    numeric: { unit: '%', placeholder: '60', hint: '数値入力で自動分類', classify: (n) => (n < 50 ? 1 : 0) },
    options: [
      { v: 'EF 50%以上', action: 0 },
      { v: 'EF 50%未満', action: 4, lay: '心臓のポンプの力が低下していました', dept: '循環器内科', dx: '左室収縮能低下 (LVEF 50%未満)' },
    ],
  },
  {
    id: 'arr', label: '不整脈',
    options: [
      { v: 'なし', action: 0 },
      { v: '心房細動あり', action: 4, lay: '心房細動という不整脈がありました', dept: '循環器内科', dx: '心房細動', note: '概ね75歳未満の場合はアブレーションの可能性があるため病院紹介を検討' },
      { v: 'その他 (期外収縮など)', action: 2, lay: '脈の乱れ（期外収縮など）がみられました', dept: '循環器内科', dx: '不整脈 (期外収縮など)', note: '心房細動以外の不整脈は、自覚症状を踏まえて紹介検討（個別判断。最新版マニュアルの備考、検診チーム回答 2026-09-14）。頻度・形態（多形性・連発）によっては精査が必要' },
    ],
  },
  {
    id: 'valve', label: '弁膜症',
    sub: { id: 'valve_type', label: '弁', options: ['AS', 'AR', 'MS', 'MR', 'TR', 'PR'] },
    options: [
      { v: 'なし (軽症を含む)', action: 0 },
      { v: 'あり (中等症)', action: 3, lay: '心臓の弁に中等度の異常（逆流や狭窄）がありました', dept: '循環器内科', dx: '弁膜症 (中等症)' },
      { v: 'あり (重症)', action: 4, lay: '心臓の弁に高度の異常（逆流や狭窄）がありました', dept: '循環器内科', dx: '弁膜症 (重症)' },
    ],
  },
  {
    id: 'chd', label: '先天性心疾患',
    options: [
      { v: 'なし', action: 0 },
      { v: 'あり・疑い', action: 4, lay: '生まれつきの心臓の構造の異常が疑われました', dept: '循環器内科', dx: '先天性心疾患 (疑い)' },
    ],
  },
  {
    id: 'pericardial', label: '心嚢液', hint: 'チャート外（目安）',
    options: [
      { v: 'なし', action: 0 },
      { v: '少量', action: 2, lay: '心臓の周りに少量の水がたまっていました', dept: '循環器内科', dx: '心嚢液貯留 (少量)', note: 'チャート外の所見: 個別判断（原因精査の要否）' },
      { v: '中等量以上', action: 4, lay: '心臓の周りに水がたまっていました', dept: '循環器内科', dx: '心嚢液貯留 (中等量以上)', note: '目安: 中等量以上は原因精査。頻脈・低血圧・呼吸困難などタンポナーデ徴候があれば当日対応' },
    ],
  },
  {
    id: 'aorta', label: '上行大動脈径', hint: 'チャート外（目安）',
    numeric: { unit: 'mm', placeholder: '32', hint: '数値入力で自動分類（目安）', classify: (n) => (n >= 45 ? 2 : n >= 40 ? 1 : 0) },
    options: [
      { v: '拡大なし (40mm未満)', action: 0 },
      { v: '拡大 (40mm以上45mm未満)', action: 2, lay: '心臓から出る太い血管（大動脈）がやや太くなっていました', dept: '循環器内科', dx: '上行大動脈拡大 (40-44mm)', note: '目安: 経過観察の間隔・紹介の要否は個別判断' },
      { v: '拡大 (45mm以上)', action: 4, lay: '心臓から出る太い血管（大動脈）が太くなっていました', dept: '循環器内科', dx: '上行大動脈拡大 (45mm以上)', note: '目安: 径が大きいほど緊急性が上がる。50mm以上や解離を疑う所見があれば当日対応を検討' },
    ],
  },
  {
    id: 'ph', label: '肺高血圧 (TRPG)', hint: 'チャート外（目安）',
    numeric: { unit: 'mmHg', placeholder: '20', hint: '数値入力で自動分類（目安）', classify: (n) => (n > 46 ? 2 : n >= 34 ? 1 : 0) },
    options: [
      { v: 'なし (TRPG 34mmHg未満)', action: 0 },
      { v: '中等度の可能性 (34-46mmHg)', action: 2, lay: '肺の血圧がやや高い可能性がありました', dept: '循環器内科', dx: '肺高血圧の可能性 (TRPG 34-46mmHg)', note: '目安: ESC/ERS 2022 の TRV 2.9-3.4 m/s 相当（中等度の可能性）。他の所見と合わせて判断' },
      { v: '高い可能性 (46mmHg超)', action: 4, lay: '肺の血圧が高い可能性が疑われました', dept: '循環器内科', dx: '肺高血圧疑い (TRPG 46mmHg超)', note: '目安: TRV 3.4 m/s 超相当（高い可能性）' },
    ],
  },
  {
    id: 'c_other', label: 'その他の所見', multi: true, hint: '複数選択可。チャート外の所見は個別判断',
    options: [
      { v: '大動脈弁石灰化', action: 2, lay: '心臓の弁に石灰化がありました（多くは加齢に伴う変化ですが、経過観察が望ましい場合があります）', dept: '循環器内科', dx: '大動脈弁石灰化', note: '二尖弁や大動脈弁狭窄症の初期像のこともある。弁通過血流速度を技師に確認' },
      { v: '左房拡大', action: 2, lay: '心臓の部屋（左心房）がやや大きくなっていました', dept: '循環器内科', dx: '左房拡大' },
    ],
  },
];

// ------------------------------------------------------------
// 頸部エコー（技師伝達）: チャート準拠 + 甲状腺の偶発所見
// ------------------------------------------------------------
export const CAROTID_ITEMS = [
  {
    id: 'cca_dia', label: '頸動脈径 (総頸動脈)',
    numeric: { unit: 'mm', placeholder: '7', hint: '数値入力で自動分類', classify: (n) => (n >= 10 ? 1 : 0) },
    options: [
      { v: '異常なし', action: 0 },
      { v: '拡大 (総頸動脈 10mm以上)', action: 3, lay: '首の血管（頸動脈）がやや太くなっていました', dept: '循環器内科', dx: '総頸動脈拡大 (10mm以上)', note: '拡大の基準値はないが、総頸動脈の基準値 7.0±0.9mm にマージンをつけて 10mm としている' },
    ],
  },
  {
    id: 'aneurysm', label: '動脈瘤',
    options: [
      { v: 'なし', action: 0 },
      { v: 'あり', action: 4, lay: '血管がこぶ状に膨らんでいる所見（動脈瘤）がありました', dept: '血管外科', dx: '頸動脈瘤' },
    ],
  },
  {
    id: 'imt', label: 'max IMT',
    numeric: { unit: 'mm', placeholder: '0.9', hint: '数値入力で自動分類', classify: (n) => (n >= 1.2 ? 2 : n >= 1.1 ? 1 : 0) },
    options: [
      { v: '1.1mm未満 (正常)', action: 0 },
      { v: '1.1mm以上1.2mm未満 (肥厚)', action: 0, warn: true, vascular: true, lay: '首の血管の壁がわずかに厚くなっていました（動脈硬化の初期変化）', dx: 'IMT肥厚 (1.1-1.19mm)', hs: 'IMT肥厚あり: 脂質・血圧についての説明を依頼', note: 'チャートの紹介行には該当しないが、備考「IMTの肥厚があった場合 … 未治療の場合は紹介」（検診チーム回答: 当院からかかりつけ等へ紹介）に従い、脂質・血圧が未治療なら後日紹介状（宛先候補: かかりつけ医または新規クリニック）' },
      { v: '1.2mm以上', action: 3, contact: true, lay: '首の血管の壁が厚くなっていました（動脈硬化の変化）', dept: '内科（生活習慣病）', dx: 'IMT肥厚 (1.2mm以上)', note: '採血結果と併せて判断', hs: 'IMT肥厚あり: 脂質・血圧についての説明を依頼' },
    ],
  },
  {
    id: 'plaque', label: 'プラーク',
    options: [
      { v: 'なし', action: 0 },
      { v: 'あり (安定: 等〜高輝度・均一・可動性なし)', action: 2, vascular: true, contact: true, lay: '血管の壁にプラーク（動脈硬化のこぶ）がありました', dept: '内科（生活習慣病）', dx: '頸動脈プラーク (安定)', note: 'チャートに単独の行はなく個別判断。プラークは IMT 1.1mm以上の限局性隆起性病変なので、max IMT が 1.2mm以上なら「1.2mm以上」の行（クリニック紹介）に該当する。備考「未治療の場合は紹介」（検診チーム回答: 当院からかかりつけ等へ紹介）に従い、脂質・血圧が未治療なら後日紹介状', hs: 'プラークあり: 脂質・血圧についての説明を依頼', patient: 'プラークがあると脳梗塞のリスクが高くなります。治療介入が必要になる場合があります' },
      { v: '潰瘍・可動性・不安定プラーク', action: 4, contact: true, lay: '不安定なプラーク（動脈硬化のこぶ）があり、脳梗塞のリスクが高い状態でした', dept: '脳神経外科', dx: '不安定プラーク (潰瘍・可動性・低輝度)', note: '不安定プラーク: Mobile / Floating plaque', hs: 'プラークあり: 脂質・血圧についての説明を依頼', patient: 'プラークがあると脳梗塞のリスクが高くなります。治療介入が必要になる場合があります' },
    ],
  },
  {
    id: 'stenosis', label: '狭窄率 (最大)',
    numeric: { unit: '%', placeholder: '0', hint: '数値入力で自動分類', classify: (n) => (n >= 70 ? 2 : n >= 50 ? 1 : 0) },
    options: [
      { v: 'なし・50%未満', action: 0 },
      { v: '50%以上70%未満', action: 3, contact: true, lay: '血管が細くなっている部分（狭窄）がありました', dept: '脳神経外科', dx: '頸動脈狭窄 (50-69%)' },
      { v: '70%以上', action: 4, contact: true, lay: '血管が強く細くなっている部分（高度狭窄）がありました', dept: '脳神経外科', dx: '頸動脈狭窄 (70%以上)' },
    ],
  },
  {
    id: 'va', label: '椎骨動脈',
    options: [
      { v: '順行性・異常なし', action: 0 },
      { v: '逆流 (完全/部分)', action: 2, lay: '首の後ろを通る血管の血流の向きに異常がありました', dept: '血管外科', dx: '椎骨動脈逆流', note: 'チャート外の所見: 個別判断。完全逆流か部分逆流かを技師に確認し、両上肢の血圧差を測定（鎖骨下動脈盗血の評価）' },
      { v: '描出不良', action: 0 },
    ],
  },
  {
    id: 'thyroid', label: '甲状腺 (偶発所見)',
    numeric: { unit: 'mm', placeholder: '最大径', hint: '結節の最大径。記録用（自動判定なし）', classify: null },
    options: [
      { v: '未評価', action: 0 },
      { v: '異常なし', action: 0 },
      { v: '結節あり', action: 2, lay: '頸動脈の隣にある甲状腺にしこりがみられました', dept: '内分泌内科・甲状腺外科', dx: '甲状腺結節', note: 'チャート外の所見: 個別判断。径や超音波性状（微細石灰化・境界不整・縦長など）により精査を検討' },
      { v: 'びまん性腫大・内部不均一', action: 2, lay: '頸動脈の隣にある甲状腺が腫れていました', dept: '内分泌内科・甲状腺外科', dx: '甲状腺びまん性腫大', note: 'チャート外の所見: 個別判断。甲状腺機能（TSH/FT4）の確認を検討' },
      { v: '嚢胞のみ', action: 0, lay: '甲状腺に小さな水ぶくれ（嚢胞）がありました', dx: '甲状腺嚢胞' },
    ],
  },
];

// ------------------------------------------------------------
// 一次健診（採血・血圧・体格）の分類
// ------------------------------------------------------------
export const BP_GRADES = ['正常血圧', '正常高値血圧', '高値血圧', 'I度高血圧', 'II度高血圧', 'III度高血圧'];

export function classifyBP(sbp, dbp) {
  if (sbp === null && dbp === null) return null;
  let gs = 0;
  let gd = 0;
  if (sbp !== null) gs = sbp >= 180 ? 5 : sbp >= 160 ? 4 : sbp >= 140 ? 3 : sbp >= 130 ? 2 : sbp >= 120 ? 1 : 0;
  if (dbp !== null) gd = dbp >= 110 ? 5 : dbp >= 100 ? 4 : dbp >= 90 ? 3 : dbp >= 80 ? 2 : 0;
  const grade = Math.max(gs, gd);
  return { grade, label: BP_GRADES[grade] };
}

// 人間ドック協会 判定基準（マニュアル記載）。小数入力でも隙間が出ないよう「未満」で区切る
export function classifyHDL(n) { if (n === null) return null; return n >= 40 ? 'A' : n >= 30 ? 'C' : 'D'; }
export function classifyLDL(n) { if (n === null) return null; if (n < 60 || n >= 180) return 'D'; if (n >= 140) return 'C'; if (n >= 120) return 'B'; return 'A'; }
export function classifyNonHDL(n) { if (n === null) return null; if (n < 90 || n >= 210) return 'D'; if (n >= 170) return 'C'; if (n >= 150) return 'B'; return 'A'; }
export function classifyTG(n) { if (n === null) return null; if (n < 30 || n >= 500) return 'D'; if (n >= 300) return 'C'; if (n >= 150) return 'B'; return 'A'; }
export function classifyUAlb(n) { if (n === null) return null; if (n >= 300) return 'D'; if (n >= 30) return 'C'; return 'A'; }

export function classifyGlucose(fpg, a1c) {
  if (fpg === null && a1c === null) return null;
  if (fpg !== null && a1c !== null) {
    if (fpg >= 126 && a1c >= 6.5) return 'D';
    if (fpg >= 110 || a1c >= 6.0) return 'C';
    if (fpg >= 100 || a1c >= 5.6) return 'B';
    return 'A';
  }
  if (fpg !== null) {
    if (fpg >= 110) return 'C';
    if (fpg >= 100) return 'B';
    return 'A';
  }
  if (a1c >= 6.0) return 'C';
  if (a1c >= 5.6) return 'B';
  return 'A';
}

export function classifyBMI(n) {
  if (n === null) return null;
  if (n < 18.5) return '低体重';
  if (n < 25) return '普通体重';
  if (n < 30) return '肥満 (1度)';
  if (n < 35) return '肥満 (2度)';
  if (n < 40) return '肥満 (3度)';
  return '肥満 (4度)';
}

export const CLASS_LABEL = { A: '異常なし', B: '軽度異常', C: '要再検査・生活改善', D: '要精密検査・治療' };

// ------------------------------------------------------------
// 判定（決定タイプ）
// ------------------------------------------------------------
export const DECISION = {
  same_day: { label: '当日紹介状（病院）', short: '当日紹介状', referral: true, sameDay: true, target: '病院', level: 'hospital' },
  later_hospital: { label: '後日紹介状（病院）', short: '後日紹介状', referral: true, sameDay: false, target: '病院', level: 'hospital' },
  later_clinic: { label: '後日紹介状（クリニック）', short: '後日紹介状', referral: true, sameDay: false, target: 'クリニック', level: 'clinic' },
  later_clinic_blood: { label: '後日紹介状（クリニック・採血/血圧が要治療水準）', short: '後日紹介状', referral: true, sameDay: false, target: 'クリニック', level: 'clinic' },
  individual: { label: '個別判断（チャート外の所見のみ。既定は紹介状なし）', short: '紹介状なし（個別判断）', referral: false, sameDay: false, target: '', level: 'individual' },
  pending_blood: { label: '採血結果次第（紹介先を決めてカルテに記載）', short: '採血結果次第', referral: false, sameDay: false, target: 'クリニック', level: 'pending' },
  none_kakaritsuke: { label: '紹介状なし（かかりつけ医で結果共有）', short: '紹介状なし', referral: false, sameDay: false, target: '', level: 'none' },
  none: { label: '紹介状なし（現時点でクリニック受診は不要。採血結果で再判断）', short: '紹介状なし', referral: false, sameDay: false, target: '', level: 'none' },
};

const num = (x) => {
  if (x === '' || x === null || x === undefined) return null;
  const v = parseFloat(x);
  return Number.isFinite(v) ? v : null;
};

// 三値論理: いずれか該当→true、全て非該当→false、未入力を含み該当なし→null
const tri = (vals) => {
  if (vals.some((v) => v === true)) return true;
  if (vals.length > 0 && vals.every((v) => v === false)) return false;
  return null;
};

function collectFindings(items, exam, examLabel, hasKakaritsuke) {
  const out = [];
  items.forEach((item) => {
    const st = exam[item.id] || {};
    let idxs = [];
    if (item.multi) idxs = st.multi || [];
    else if (st.v !== null && st.v !== undefined) idxs = [st.v];
    idxs.forEach((idx) => {
      const opt = item.options[idx];
      if (!opt) return;
      const known = hasKakaritsuke && st.known === 'known';
      let eff = opt.action;
      if (opt.action >= ACTION.INDIVIDUAL && known) eff = ACTION.CONTINUE;
      out.push({
        exam: examLabel, id: item.id, label: item.label, value: opt.v,
        num: st.num || '', numUnit: item.numeric ? item.numeric.unit : '',
        sub: st.sub || [],
        action: opt.action, known, eff,
        note: opt.note, lay: opt.lay, dept: opt.dept, dx: opt.dx, hs: opt.hs, patient: opt.patient,
        warn: !!opt.warn, vascular: !!opt.vascular, contact: !!opt.contact,
      });
    });
  });
  return out;
}

export function evaluate(s) {
  const { bg, labs, cardiac, carotid, override, timing, dest } = s;
  const hasKakaritsuke = bg.kakaritsuke === 'yes';
  const treatments = bg.treatments || [];

  // --- エコー所見 ---
  const findings = [
    ...collectFindings(CARDIAC_ITEMS, cardiac, '心エコー', hasKakaritsuke),
    ...collectFindings(CAROTID_ITEMS, carotid, '頸部エコー', hasKakaritsuke),
  ];
  const unknownHospital = findings.filter((f) => f.eff === ACTION.HOSPITAL);
  const unknownClinic = findings.filter((f) => f.eff === ACTION.CLINIC);
  const individual = findings.filter((f) => f.eff === ACTION.INDIVIDUAL);
  const knownList = findings.filter((f) => f.eff === ACTION.CONTINUE);
  const knownHospital = findings.filter((f) => f.action === ACTION.HOSPITAL && f.known);
  // チャート備考「IMTの肥厚やプラークがあった場合 … 未治療の場合は紹介」
  const vascularFindings = findings.filter((f) => f.vascular && !f.known);
  const untreatedVascular = vascularFindings.length > 0 && !treatments.includes('dl') && !treatments.includes('ht');

  // --- 一次健診（採血・血圧・体格）---
  const sbp = num(labs.sbp); const dbp = num(labs.dbp);
  const ldl = num(labs.ldl); const hdl = num(labs.hdl); const tg = num(labs.tg); const nonhdl = num(labs.nonhdl);
  const fpg = num(labs.fpg); const a1c = num(labs.a1c); const ualb = num(labs.ualb);
  const bmi = num(labs.bmi); const waist = num(labs.waist);
  const bp = classifyBP(sbp, dbp);
  const labClasses = [
    { key: 'LDL-C', val: ldl, unit: 'mg/dL', cls: classifyLDL(ldl) },
    { key: 'HDL-C', val: hdl, unit: 'mg/dL', cls: classifyHDL(hdl) },
    { key: 'TG', val: tg, unit: 'mg/dL', cls: classifyTG(tg) },
    { key: 'non-HDL-C', val: nonhdl, unit: 'mg/dL', cls: classifyNonHDL(nonhdl) },
    { key: 'アルブミン尿', val: ualb, unit: 'mg/gCr', cls: classifyUAlb(ualb) },
  ].filter((c) => c.val !== null);
  const glu = classifyGlucose(fpg, a1c);
  const bmiCls = classifyBMI(bmi);
  const anyLab = labClasses.length > 0 || glu !== null || bp !== null || bmiCls !== null || waist !== null;
  const hasD = labClasses.some((c) => c.cls === 'D') || glu === 'D';
  const hasC = labClasses.some((c) => c.cls === 'C') || glu === 'C';
  const bpGrade = bp ? bp.grade : 0;
  let bloodLevel = 'none';
  if (anyLab) {
    if (hasD || bpGrade >= 4) bloodLevel = 'high';
    else if (hasC || bpGrade === 3) bloodLevel = 'mid';
    else bloodLevel = 'low';
  }
  const bloodReasons = [];
  labClasses.forEach((c) => { if (c.cls === 'C' || c.cls === 'D') bloodReasons.push(`${c.key} ${c.val} (${c.cls}: ${CLASS_LABEL[c.cls]})`); });
  if (glu === 'C' || glu === 'D') bloodReasons.push(`血糖 FPG ${fpg ?? '-'} / HbA1c ${a1c ?? '-'} (${glu}: ${CLASS_LABEL[glu]})`);
  if (fpg !== null && fpg >= 126 && a1c === null) bloodReasons.push('FPG 126以上で HbA1c 未入力: HbA1c 6.5以上なら D（要精密検査・治療）相当');
  if (a1c !== null && a1c >= 6.5 && fpg === null) bloodReasons.push('HbA1c 6.5以上で FPG 未入力: FPG 126以上なら D（要精密検査・治療）相当');
  if (bpGrade >= 3) bloodReasons.push(`血圧 ${sbp ?? '-'}/${dbp ?? '-'} (${bp.label})`);

  // 労災二次健診 対象基準（一次健診 4項目すべて異常）。未入力を含む場合は「未入力」扱い
  const female = bg.gender === 'female';
  const genderSet = bg.gender === 'male' || bg.gender === 'female';
  const elig = {
    bp: tri([sbp !== null ? sbp >= 130 : null, dbp !== null ? dbp >= 85 : null]),
    lipid: tri([ldl !== null ? ldl >= 140 : null, hdl !== null ? hdl < 40 : null, tg !== null ? tg >= 150 : null]),
    glu: tri([fpg !== null ? fpg >= 100 : null, a1c !== null ? a1c >= 5.6 : null]),
    obesity: tri([bmi !== null ? bmi >= 25 : null, (waist !== null && genderSet) ? waist >= (female ? 90 : 85) : null]),
  };
  const eligCount = Object.values(elig).filter((v) => v === true).length;
  const eligUnknown = Object.values(elig).filter((v) => v === null).length;

  // --- 緊急症状 ---
  const urgentSymptoms = (bg.symptoms || []).map((id) => SYMPTOMS.find((x) => x.id === id)).filter((x) => x && x.urgent);
  const urgentLabel = urgentSymptoms.map((x) => x.label).join('・');
  const wantSameDay = timing === 'same_day' || (timing === 'auto' && urgentSymptoms.length > 0);

  // --- 判定 ---
  let type;
  const reasons = [];
  if (unknownHospital.length) {
    type = wantSameDay ? 'same_day' : 'later_hospital';
    unknownHospital.forEach((f) => reasons.push(`${f.exam} ${f.label}: ${f.value}（未知）→ 病院紹介`));
    if (timing === 'auto') {
      if (wantSameDay) reasons.push(`緊急性を示唆する症状（${urgentLabel}）→ 当日紹介を提案。後日に変更する場合は「発行タイミング」で指定`);
      else reasons.push('緊急性を示唆する症状なし → 後日紹介を提案。当日が必要なら「発行タイミング」で指定');
    }
  } else if (bpGrade >= 5 && wantSameDay) {
    type = 'same_day';
    reasons.push(`III度高血圧（${sbp ?? '-'}/${dbp ?? '-'}）${urgentSymptoms.length ? `+ 緊急性を示唆する症状（${urgentLabel}）` : ''}→ 高血圧緊急症・切迫症を考慮し当日受診を提案。安静後に再測定して判断`);
  } else if (unknownClinic.length) {
    type = 'later_clinic';
    unknownClinic.forEach((f) => reasons.push(`${f.exam} ${f.label}: ${f.value}（未知）→ クリニック紹介`));
    if (hasKakaritsuke) reasons.push('かかりつけ医あり: 異常を指摘されたことのない（未知の）中等症以上 → 紹介状は発行（宛先候補: かかりつけ医。受診者と相談のうえ決定）');
  } else if (untreatedVascular) {
    type = 'later_clinic';
    reasons.push(`${vascularFindings.map((f) => `${f.label}: ${f.value}`).join('、')} で脂質・血圧が未治療 → チャート備考「未治療の場合は紹介」（検診チーム回答 2026-09-14: 当院からかかりつけ等へ紹介）→ 後日紹介状（クリニック${hasKakaritsuke ? '。宛先候補: かかりつけ医' : ''}）`);
    if (bloodLevel === 'high' || bloodLevel === 'mid') bloodReasons.forEach((r) => reasons.push(r));
  } else if (bloodLevel === 'high' && !hasKakaritsuke) {
    type = 'later_clinic_blood';
    reasons.push('エコーに紹介対象の所見はないが、一次健診の採血/血圧が要治療水準 → 治療・フォローが必要でかかりつけ医なし → 紹介状を作成');
    bloodReasons.forEach((r) => reasons.push(r));
  } else if (bloodLevel === 'mid' && !hasKakaritsuke) {
    type = 'pending_blood';
    reasons.push('エコーに紹介対象の所見なし。一次健診で要再検査・生活改善の項目あり → 後日の採血結果で紹介状の要否を決める（紹介先を今決めてカルテに記載）');
    bloodReasons.forEach((r) => reasons.push(r));
  } else if (individual.length) {
    type = 'individual';
  } else if (hasKakaritsuke) {
    type = 'none_kakaritsuke';
    reasons.push(knownList.length ? '異常所見はすべて既知（通院中）→ 通院継続。かかりつけ医への報告目的の紹介状は省略' : 'エコーに紹介対象の所見なし → かかりつけ医で結果を共有');
    if (bloodLevel === 'high') reasons.push('一次健診の採血/血圧が要治療水準: かかりつけ医で共有。該当疾患が未治療なら「未知の中等症以上」として紹介状発行を検討');
    if (vascularFindings.length) reasons.push('プラーク/IMT肥厚あり（脂質・血圧は治療中）: かかりつけ医で管理状況を確認');
  } else {
    type = 'none';
    reasons.push(anyLab ? 'エコー・一次健診ともに紹介対象の所見なし' : 'エコーに紹介対象の所見なし（一次健診値は未入力）');
  }
  if (individual.length) {
    individual.filter((f) => !(untreatedVascular && f.vascular)).forEach((f) => reasons.push(`${f.exam} ${f.label}: ${f.value} → チャート外の所見。個別にクリニック判断（必要なら「最終判断」で紹介状を指定）`));
  }
  const knownContact = knownList.filter((f) => f.contact);
  if (knownContact.length) {
    reasons.push(`既知（通院中）の頸動脈所見（${knownContact.map((f) => `${f.label} ${f.value}`).join('、')}）: 必要に応じてかかりつけ医に連絡（チャート備考。報告目的の紹介状は省略だが、特別に報告・連絡が必要な場合は除く）`);
  }
  const afFinding = findings.find((f) => f.id === 'arr' && f.value === '心房細動あり' && !f.known);
  const age = num(bg.age);
  if (afFinding && age !== null) {
    reasons.push(age < 75
      ? `${age}歳（75歳未満）: 心房細動はアブレーションの可能性があるため病院紹介（チャート備考）`
      : `${age}歳（75歳以上）: チャート上は病院紹介。アブレーション適応は個別のため、紹介先・時期は医師判断`);
  }
  const autoType = type;

  if (override && override !== 'auto') {
    if (override === 'same_day') type = 'same_day';
    else if (override === 'later') type = unknownHospital.length ? 'later_hospital' : (unknownClinic.length || hasKakaritsuke || bloodLevel !== 'high') ? 'later_clinic' : 'later_clinic_blood';
    else if (override === 'none') type = hasKakaritsuke ? 'none_kakaritsuke' : 'none';
    else if (override === 'pending') type = 'pending_blood';
    reasons.unshift(`医師による最終判断で「${DECISION[type].label}」に変更（自動判定: ${DECISION[autoType].label}）`);
  }

  // 症状・III度高血圧の警告（判定の種別に関わらず先頭に出す）
  let alert = '';
  if (urgentSymptoms.length && type !== 'same_day') {
    alert = `緊急性を示唆する症状（${urgentLabel}）あり。エコー・採血が正常でも症状主体で当日受診（救急要請を含む）の要否を判断すること。当日にする場合は「発行タイミング」または「最終判断」で指定`;
  }
  if (bpGrade >= 5 && type !== 'same_day') {
    const bpMsg = `III度高血圧（${sbp ?? '-'}/${dbp ?? '-'}）: 安静後に再測定。頭痛・胸痛・視覚障害・神経症状があれば高血圧緊急症を考慮して当日受診。無症状でも数日以内の受診を勧奨${hasKakaritsuke ? '（本日中にかかりつけ医へ連絡・受診勧奨）' : ''}`;
    alert = alert ? `${alert} ／ ${bpMsg}` : bpMsg;
  }
  if (alert) reasons.unshift(alert);

  const decision = { type, ...DECISION[type], reasons, alert };
  if (decision.referral && decision.target === 'クリニック') {
    decision.targetDetail = hasKakaritsuke ? '宛先候補: かかりつけ医（受診者と相談のうえ決定）' : '新規クリニック（受診者と相談のうえ決定。土曜AM診療が条件。Google Map で通えるか確認）';
  } else if (decision.referral) {
    decision.targetDetail = '病院';
  } else if (type === 'pending_blood') {
    decision.targetDetail = '紹介先候補を決めてカルテに記載（今までに行ったことのあるクリニック）';
  } else {
    decision.targetDetail = '';
  }

  // 推奨診療科
  const deptSet = [];
  const pushDept = (d) => { if (d && !deptSet.includes(d)) deptSet.push(d); };
  if (type === 'same_day' || type === 'later_hospital') {
    unknownHospital.forEach((f) => pushDept(f.dept));
    if (deptSet.length === 0 && bpGrade >= 5) pushDept('内科（生活習慣病）');
  } else if (type === 'later_clinic') {
    unknownClinic.forEach((f) => pushDept(f.dept));
  } else if (type === 'later_clinic_blood' || type === 'pending_blood') {
    pushDept('内科（生活習慣病）');
  }
  individual.forEach((f) => pushDept(f.dept));
  if (deptSet.length === 0 && decision.referral) pushDept('内科（生活習慣病）');

  // --- ラベル ---
  const labels = [];
  if (type === 'same_day') labels.push('000: 【当日】紹介状');
  else if (decision.referral) labels.push('000: 【後日】紹介状');
  else if (type === 'pending_blood') labels.push('000: 紹介状無し（採血結果次第で後日作成の可能性あり。紹介先候補はカルテに記載。検診チーム回答: 特別なラベルは不要）');
  else labels.push('000: 紹介状無し');
  if (decision.referral && (dest.undecided || !dest.name)) {
    labels.push('000: 宛先検索依頼（受付に紹介先検索を依頼。カルテに紹介依頼する診療科を記載 → 一旦保存 → 宛名無しの紹介状を作成）');
  }
  labels.push('01: ③医師診察 のラベルを消す（診察終了時）');
  if (decision.referral) labels.push('混雑時: 紹介状の作成は後回しでも可。ラベルの実施と「診察終了」のステータス変更を先に行い、後から作成する（STEP5 ポイント）');
  if (knownContact.length) labels.push('既知の頸動脈所見あり: 必要に応じてかかりつけ医に連絡（チャート備考）');
  if (type === 'same_day') labels.push('当日受診が必要: 医師または看護師から病院へ連絡調整。受付で手続き・書類を渡し、移動手段と到着予定時刻を確認');
  if (alert && type !== 'same_day') labels.push('症状・血圧の警告あり: 当日対応に切り替える場合はラベルを【当日】紹介状に変更');

  // --- 保健師への申し送り（運動制限）---
  const nurse = [];
  if (unknownHospital.length || type === 'same_day' || type === 'later_hospital') nurse.push('病院紹介の可能性がある方なので、運動の指導はしないでください（オーバートリアージ許容）');
  else if (knownHospital.length) nurse.push(`既知（通院中）の病院紹介相当の所見あり（${knownHospital.map((f) => `${f.label} ${f.value}`).join('、')}）: 運動指導は主治医の指示の範囲内にとどめる`);
  if (urgentSymptoms.length) nurse.push(`緊急性を示唆する症状（${urgentLabel}）あり: 医師の判断が出るまで運動指導は保留`);
  if (bpGrade >= 5) nurse.push('III度高血圧（診察室 180/110、家庭血圧 160/110 以上）: 血圧コントロール必須。運動は降圧後に実施。運動前血圧が 180/110 以上の時は運動を控えて休養');
  else if (bpGrade === 4) nurse.push('II度高血圧（160-179/100-109）: 脳心血管病がなければ運動療法の対象。運動前血圧が 160/100 以上の時は散歩程度にとどめる');
  else if (bpGrade === 3) nurse.push('I度高血圧: 当日の運動前血圧を確認。160/100 以上なら散歩程度、180/110 以上なら運動を控える');
  if ((fpg !== null && fpg >= 180) || (a1c !== null && a1c >= 9) || labs.ketone) nurse.push('血糖: 空腹時血糖 180 以上 / HbA1c 9% 以上 / 尿ケトン中等度以上 → 運動禁忌。医師相談の上で実施');
  const cvd = treatments.includes('heart') || treatments.includes('stroke') || findings.some((f) => f.action >= ACTION.CLINIC);
  if (cvd) nurse.push('心血管疾患あり（骨関節疾患・低体力者も同様）: 3メッツ以下の強度の生活活動（掃除・洗車・こどもと遊ぶ・自転車で買い物）のなかで身体活動量を増やすことから始める');
  else if (bmi !== null && bmi >= 25 && !unknownHospital.length && bpGrade < 5) nurse.push('肥満: 初歩的なものから開始。3〜6メッツ程度（ウォーキング・自転車エルゴメーター・水中歩行）');
  findings.forEach((f) => { if (f.hs && !nurse.includes(f.hs)) nurse.push(f.hs); });

  // --- 結果表 医師所見テンプレート（後日）---
  let opinion;
  if (bg.work === 'leave') opinion = 1;
  else if (type === 'same_day' || type === 'later_hospital') opinion = 2;
  else if (decision.referral) opinion = 4;
  else if (hasKakaritsuke) opinion = 3;
  else opinion = 5;

  return {
    hasKakaritsuke, findings, unknownHospital, unknownClinic, individual, knownList, knownHospital,
    vascularReferral: untreatedVascular ? vascularFindings : [],
    labs: { sbp, dbp, bp, bpGrade, labClasses, glu, fpg, a1c, bmi, bmiCls, waist, anyLab, bloodLevel, bloodReasons },
    elig, eligCount, eligUnknown, genderSet,
    decision, autoType, depts: deptSet, labels, nurse, opinion, urgentSymptoms, alert,
  };
}

// ------------------------------------------------------------
// テキスト生成
// ------------------------------------------------------------
function findingLine(f) {
  let t = `${f.label}: ${f.value}`;
  if (f.num) t += ` (${f.num}${f.numUnit})`;
  if (f.sub && f.sub.length) t += ` [${f.sub.join('/')}]`;
  if (f.action > 0) t += f.known ? '【既知・通院中】' : '【未知】';
  return t;
}

export function echoSummary(ev, exam) {
  const list = ev.findings.filter((f) => f.exam === exam && (f.action > 0 || f.warn || f.dx));
  const normals = ev.findings.filter((f) => f.exam === exam && f.action === 0 && !f.warn && !f.dx);
  if (list.length === 0) return normals.length ? '特記すべき異常所見なし' : '（未入力）';
  return list.map(findingLine).join('、');
}

function treatmentText(bg) {
  const tr = (bg.treatments || []).map((id) => (TREATMENTS.find((t) => t.id === id) || {}).label).filter(Boolean);
  if (!tr.length) return '';
  return `${tr.join('・')}${bg.treatmentNote ? `（${bg.treatmentNote}）` : ''}`;
}

function symptomText(bg) {
  return (bg.symptoms || []).map((id) => (SYMPTOMS.find((x) => x.id === id) || {}).label).filter(Boolean);
}

function labSummary(ev, forReferral) {
  const L = ev.labs;
  const parts = [];
  if (L.bp) parts.push(forReferral ? `血圧 ${L.sbp ?? '-'}/${L.dbp ?? '-'} mmHg（${L.bp.label}）` : `BP ${L.sbp ?? '-'}/${L.dbp ?? '-'} (${L.bp.label})`);
  L.labClasses.forEach((c) => parts.push(forReferral ? `${c.key} ${c.val} ${c.unit}` : `${c.key} ${c.val} (${c.cls})`));
  if (forReferral) {
    if (L.fpg !== null) parts.push(`空腹時血糖 ${L.fpg} mg/dL`);
    if (L.a1c !== null) parts.push(`HbA1c ${L.a1c} %`);
  } else if (L.glu) {
    parts.push(`FPG ${L.fpg ?? '-'} / HbA1c ${L.a1c ?? '-'} (${L.glu})`);
  }
  if (L.bmi !== null) parts.push(forReferral ? `BMI ${L.bmi}` : `BMI ${L.bmi} (${L.bmiCls})`);
  if (L.waist !== null) parts.push(`腹囲 ${L.waist} cm`);
  return parts.join('、');
}

export function buildChartText(ev, s, opts = {}) {
  const { bg, dest, cFree, kFree, labs } = s;
  const d = ev.decision;
  const lines = [];
  if (d.referral) lines.push('●紹介状: 有り');
  else lines.push('●紹介状: 無し');
  if (d.referral || d.type === 'pending_blood') {
    const dept = dest.dept ? ` ${dest.dept}` : (ev.depts.length ? ` ${ev.depts[0]}` : '');
    const name = dest.name && !dest.undecided ? dest.name : (d.referral ? '（宛先未定: 宛先検索依頼）' : '（候補未記載）');
    lines.push(`●紹介先: ${d.sameDay ? '当日' : '後日'} ${name}${dept}${d.type === 'pending_blood' ? '（採血結果次第で後日作成。現時点では未作成）' : ''}`);
  }
  lines.push(`●かかりつけ: ${ev.hasKakaritsuke ? `有${bg.kakaritsukeName ? ' ' + bg.kakaritsukeName : ''}` : '無'}`);
  const core = (bg.treatments || []).filter((id) => ['ht', 'dm', 'dl'].includes(id)).map((id) => (TREATMENTS.find((t) => t.id === id) || {}).label).filter(Boolean);
  const others = (bg.treatments || []).filter((id) => !['ht', 'dm', 'dl'].includes(id)).map((id) => (TREATMENTS.find((t) => t.id === id) || {}).label).filter(Boolean);
  lines.push(`●HT・DM・HDLの治療: ${core.length ? `有 ${core.join('・')}${bg.treatmentNote ? ' ' + bg.treatmentNote : ''}` : '無'}`);
  if (others.length) lines.push(`●その他の治療: ${others.join('・')}${!core.length && bg.treatmentNote ? ' ' + bg.treatmentNote : ''}`);

  if (opts.includeEcho !== false) {
    lines.push(`【心エコー（技師伝達・要点）】${echoSummary(ev, '心エコー')}${cFree ? `。${cFree}` : ''}`);
    lines.push(`【頸部エコー（技師伝達・要点）】${echoSummary(ev, '頸部エコー')}${kFree ? `。${kFree}` : ''}`);
  }
  if (ev.labs.anyLab) {
    const src = labs.source === 'secondary' ? '二次健診採血' : '一次健診';
    let eligTxt = '';
    if (labs.source !== 'secondary') eligTxt = `。労災二次健診の対象基準 ${ev.eligCount}/4 該当${ev.eligUnknown ? `（${ev.eligUnknown}項目は未入力）` : ''}${bg.sangyoi ? '、産業医判定あり' : ''}`;
    lines.push(`【${src}】${labSummary(ev, false)}${eligTxt}`);
  }
  const sym = symptomText(bg);
  if (sym.length) lines.push(`【症状】${sym.join('・')}`);
  lines.push(`【判定】${d.label}`);
  d.reasons.forEach((r) => lines.push(`  - ${r}`));
  return lines.join('\n');
}

export function buildLabelText(ev) {
  return ev.labels.map((l) => `・${l}`).join('\n');
}

function layJoin(ev, exam) {
  const list = ev.findings.filter((f) => f.exam === exam && f.lay);
  if (list.length === 0) return '特に問題となる所見はありませんでした';
  return list.map((f) => f.lay).join('。また、');
}

export function buildScriptText(ev, s) {
  const { bg } = s;
  const d = ev.decision;
  const L = [];
  L.push('【導入】（医師用スライドを見ながら）');
  L.push('はじめまして。本日担当させていただく、医師の○○です。確認のためにお名前をおしえていただいてもいいですか？');
  L.push('エコー検査お疲れ様でした。本日は二次検査でいらっしゃっていただいたのですが、いま通院中や治療中の病気あるいは内服薬はありますか？');
  L.push('本日は、一次検査の結果で動脈硬化のリスクが高いと判断した方にお声がけさせていただき来ていただいているのですが、いままでに二次検査を受けられたことはありますか？');
  L.push('（スライド）動脈硬化が進むと、血管内はこのように変化し、脳梗塞や心筋梗塞につながり、生命に関わることもあるし、就労の継続が困難になることもあります。');
  L.push('');
  L.push('【結果説明】');
  L.push(`○○さんの今日のエコー検査の結果ですが、心エコーでは${layJoin(ev, '心エコー')}。頸動脈エコーでは${layJoin(ev, '頸部エコー')}。`);
  ev.findings.forEach((f) => { if (f.patient && f.eff >= ACTION.INDIVIDUAL) L.push(f.patient + '。'); });
  L.push('');
  const t = d.type;
  if (t === 'same_day') {
    L.push('【④ 当日紹介状】');
    L.push('本日、当日紹介状の手配が必要な状況ですね。緊急性を踏まえて、優先順位をつけて進めます。');
    L.push(`いまの所見から、${ev.depts[0] || '○○科'}での早急な評価が望ましいため、当日中の受診を前提に紹介状を作成します。`);
    L.push('紹介先には、症状の経過・本日の所見・実施した検査結果・懸念点を簡潔にまとめてお伝えします。');
    L.push('受診までの間に悪化した場合（例: 強い胸痛、呼吸困難、意識がぼんやりする等）は、迷わず救急要請してください。');
    L.push('このあと受付で手続きと書類をお渡しします。移動手段や到着予定時刻も確認し、必要なら先方へ連絡します。');
  } else if (d.referral && d.target === '病院' && !ev.hasKakaritsuke) {
    L.push('【マニュアル外・後日の病院紹介（②④を基に作成）】');
    L.push(`今回の所見は、病院（${ev.depts[0] || '専門の診療科'}）での精密検査が必要と考えますので、紹介状を作成します。通いやすい病院はありますか？（ここで紹介先を決めカルテに記載）`);
    L.push('本日の検査結果が1ヶ月後くらいにご自宅に送られてくるので、その封筒の中に紹介状を同封しておきます。ぜひ早めに受診してください。');
    L.push('また、年に一回の健診を受けるだけでは足りないので、精密検査の後はかかりつけ医の先生を作って診察・検査を受けてもらう必要があると思います。');
  } else if (d.referral && !ev.hasKakaritsuke) {
    L.push('【② かかりつけ医なし・紹介状あり】');
    L.push('採血の結果などから考えても、年に一回の健診を受けるだけでは足りないので、かかりつけ医の先生を作って医師の診察・検査を受けてもらう必要があると思います。');
    L.push('今までに行ったことのあるクリニックはありますか？（ここで紹介先を決めカルテに記載。土曜AM診療・通いやすさを Google Map で確認）');
    L.push('では、本日の検査結果が1ヶ月後くらいにご自宅に送られてくるので、その封筒の中に、いま決めたクリニックの先生宛の紹介状を同封しておきます。ぜひ早めに受診してください。');
  } else if (d.referral && ev.hasKakaritsuke) {
    L.push('【マニュアル外・かかりつけ医あり・紹介状あり（①②の組み合わせ）】');
    L.push(`今回の所見は、これまで指摘されたことのないもので、${ev.depts[0] || '専門の診療科'}での評価が必要と考えますので、紹介状を作成します。`);
    L.push('本日の検査結果が1ヶ月後くらいにご自宅に送られてくるので、その封筒の中に紹介状を同封しておきます。かかりつけの先生にも結果を共有してください。');
  } else if (ev.hasKakaritsuke && !d.referral && t !== 'pending_blood') {
    L.push('【① かかりつけ医あり・紹介状なし】');
    L.push('本日の検査結果をかかりつけ医の先生と共有することで、よりよい医療を受けることができると思います。');
    L.push('本日の検査結果が1ヶ月後くらいにご自宅に送られてくるので、次回受診時にかかりつけ医の先生に渡してください。');
  } else {
    L.push('【③ かかりつけ医なし・紹介状なし or 採血結果次第】');
    L.push(t === 'pending_blood'
      ? '今すぐのクリニック受診は必要ないと思いますが、後日判明する本日の採血検査結果で、やはりかかりつけ医による診察・検査が必要だと判断した場合は必ずクリニックを受診してもらう必要があります。'
      : '今すぐのクリニック受診は必要ないと思いますが（または: クリニック受診のご希望がないとのことでしたが）、後日判明する本日の採血検査結果で、やはりかかりつけ医による診察・検査が必要だと判断した場合は必ずクリニックを受診してもらう必要があります。');
    L.push('その時は1ヶ月後くらいにご自宅に郵送されてくる本日の検査結果の中に、紹介状を同封しておきます。');
    L.push('紹介状を作成する場合のために、紹介先を決めておきたいのですが、今までに行ったことのあるクリニックはありますか？（念のためここで紹介先を決めカルテに記載）');
  }
  if (ev.alert && t !== 'same_day') {
    L.push('');
    L.push(`【注意】${ev.alert}`);
  }
  L.push('');
  L.push('【締め】');
  L.push('本日の診察は以上になりますが、ご質問はございますか？');
  L.push(bg.remote
    ? '最後に、保健師より食事や生活についてのお話をしていただく時間がありますので、保健指導ブース○番へ移動してください。'
    : '最後に、保健師より食事や生活についてのお話をしていただく時間がありますので、場所を移動しましょう。');
  return L.join('\n');
}

export function buildNurseText(ev) {
  if (ev.nurse.length === 0) return '運動制限に該当する項目なし（保健指導の通常基準で実施）';
  return ev.nurse.map((n) => `・${n}`).join('\n');
}

export function buildReferralText(ev, s) {
  const { bg, dest, cFree, kFree, labs } = s;
  const d = ev.decision;
  if (!d.referral && d.type !== 'pending_blood') return '';
  let targets = [];
  if (d.type === 'same_day' || d.type === 'later_hospital') targets = ev.unknownHospital;
  else if (d.type === 'later_clinic') targets = [...ev.unknownClinic, ...ev.vascularReferral];
  targets = [...targets, ...ev.individual];
  const dxList = targets.map((f) => f.dx || `${f.label} ${f.value}`);
  const deptRaw = dest.dept || ev.depts[0] || '';
  const dept = deptRaw.replace('（生活習慣病）', '');
  const L = [];
  L.push(`【診療情報提供書 下書き】（雛形: カルテ【書類】→【文書雛形】→ ${d.sameDay ? '当日' : '後日'}診療情報提供書）`);
  L.push(`宛先: ${dest.name && !dest.undecided ? dest.name : '（宛先未定）'}${dept ? ` ${dept}` : ''} 御机下`);
  L.push('');
  const bloodTarget = d.type === 'later_clinic_blood' || d.type === 'pending_blood' || (d.type === 'same_day' && ev.unknownHospital.length === 0);
  if (dxList.length && !bloodTarget) L.push(`紹介目的: 労災二次健康診断で指摘された ${dxList.join('、')} の精査・加療のご相談`);
  else if (dxList.length) L.push(`紹介目的: 労災二次健康診断の結果（採血・血圧${ev.labs.bpGrade >= 5 ? '。III度高血圧' : ''}）に基づく生活習慣病の診療・フォロー、および ${dxList.join('、')} の評価のご相談`);
  else L.push(`紹介目的: 労災二次健康診断の結果（採血・血圧${ev.labs.bpGrade >= 5 ? '。III度高血圧' : ''}）に基づく生活習慣病の診療・フォローのご相談`);
  const sym = symptomText(bg);
  const trigger = ev.eligCount === 4
    ? '定期健康診断で血圧・脂質・血糖・肥満度の異常を指摘され'
    : '定期健康診断の結果から脳・心疾患の発症リスクが高いと判断され';
  L.push(`現病歴: ${trigger}、労災二次健康診断（採血・心エコー・頸動脈エコー・保健指導）を受診されました。${sym.length ? `自覚症状: ${sym.join('・')}。` : '自覚症状はありません。'}`);
  const tr = treatmentText(bg);
  L.push(`既往・治療: かかりつけ医 ${ev.hasKakaritsuke ? `あり${bg.kakaritsukeName ? `（${bg.kakaritsukeName}）` : ''}` : 'なし'}。治療中: ${tr || 'なし'}`);
  if (ev.labs.anyLab) L.push(`${labs.source === 'secondary' ? '二次健診採血' : '一次健診'}結果: ${labSummary(ev, true)}`);
  L.push(`本日のエコー所見（技師所見・医師確認）: 心エコー: ${echoSummary(ev, '心エコー')}${cFree ? `。${cFree}` : ''} ／ 頸動脈エコー: ${echoSummary(ev, '頸部エコー')}${kFree ? `。${kFree}` : ''}`);
  L.push('');
  const tail = labs.source === 'secondary' ? '' : '本日の採血結果は後日判明次第、受診者を通じて共有いたします。';
  L.push(`依頼事項: 上記につき、精査および治療方針のご検討をお願い申し上げます。${d.sameDay ? '当日中の受診を前提にご紹介いたします。' : ''}${tail}`);
  return L.join('\n');
}

export const OPINION_TEMPLATES = [
  { id: 1, label: '休職中', text: '就労については、引き続きかかりつけ医や産業医との面談を続けて決める必要があります。' },
  { id: 2, label: '就業制限の可能性あり（当日紹介状作成）', text: '就業制限がある可能性があるため、精密検査の上、就業上の制限等があるか再度指示を受けてください。' },
  { id: 3, label: '就業制限なし（かかりつけ有）かかりつけフォロー（紹介状なし）', text: '就業上の制限はありませんが、かかりつけ医を受診して結果を共有し、指示を受けてください。' },
  { id: 4, label: '就業制限なし（かかりつけ無）後日新規クリニック（紹介状あり）', text: '就業上の制限はありませんが、紹介状に記載された医療機関を予約して結果を共有し、指示を受けてください。' },
  { id: 5, label: '就業制限なし（かかりつけ無）紹介状なし', text: '就業制限なし。' },
];

export function buildOpinionText(ev) {
  const t = OPINION_TEMPLATES.find((o) => o.id === ev.opinion);
  const L = [];
  L.push(`テンプレート候補: ${t.id} ${t.label}`);
  L.push(`所見文（自動入力される内容）: ${t.text}`);
  if (ev.opinion === 2 && ev.decision.type === 'later_hospital') L.push('補足: 後日発行だが病院紹介レベルの所見あり。精密検査の結果が出るまでは「就業制限の可能性あり」を第一候補とし、軽微と判断すればテンプレート4に変更');
  if (ev.opinion === 4 && ev.hasKakaritsuke) L.push('補足: かかりつけ医ありで紹介状を作成した場合。テンプレート4の文面に「かかりつけ医にも結果を共有してください」を追記');
  if (ev.opinion === 2 && ev.decision.type === 'same_day') L.push('補足: 「就業制限の可能性あり」を選択した場合は、精密検査受診および就業可否の再評価が必要');
  L.push('（結果表の「二次健康診断等の結果における医師の所見」欄のプルダウンから選択。選択後も編集可。血液検査・エコー・特定保健指導の内容を確認して選択すること）');
  return L.join('\n');
}
