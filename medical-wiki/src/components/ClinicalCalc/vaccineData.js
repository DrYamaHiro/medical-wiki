/**
 * ワクチン料金・自治体契約データ
 *
 * 【更新方法】
 * GitHubの「このページを編集」からブラウザ上で直接編集できます。
 * - 料金変更: copay（窓口負担）/ claim（請求金額）を修正
 * - 契約追加: contracts配列に { city, copay, claim, conditions } を追加
 * - ワクチン追加: VACCINE_LIST配列に新エントリを追加
 * - 拠点追加: CLINICS配列に追加、各ワクチンのbillingに拠点IDのキーを追加
 *
 * 【注意】
 * - copay = 窓口で患者から受け取る金額
 * - claim = 自治体に請求する金額
 * - copayExempt = 生活保護・非課税世帯の窓口負担（通常0）
 * - claimExempt = 生活保護・非課税世帯への請求金額
 * - selfPay = 公費対象外（全額自費）時のクリニック設定価格
 */

// データ最終更新
export const DATA_LAST_UPDATED = '2026-04-02';
export const DATA_FISCAL_YEAR = '2026年度（令和8年度）';

// ===== 拠点マスター =====
export const CLINICS = [
  { id: 'kasai',      name: 'イオン葛西',  municipality: '江戸川区' },
  { id: 'minamisuna', name: '南砂',        municipality: '江東区' },
  { id: 'kita-toda',  name: '北戸田',      municipality: '戸田市' },
  { id: 'ichikawa',   name: '市川',        municipality: '市川市' },
];

// ===== ワクチンマスター =====
// billing: 拠点IDをキーに、契約自治体ごとの窓口負担・請求金額を記載
// selfPay: 公費対象外の場合の全額自費料金
//
// ★ 「要確認」のコメントがある箇所は実データ未入力です

export const VACCINE_LIST = [
  // ──────────────────────────────────────────
  // インフルエンザ
  // ──────────────────────────────────────────
  {
    name: '高齢者インフルエンザ（定期）',
    category: 'インフルエンザ',
    selfPay: null, // 定期のみ
    notes: '65歳以上、または60-64歳で心臓・腎臓・呼吸器・免疫機能障害1級。10-12月接種',
    billing: {
      kasai: [
        // ★要確認: 江戸川区の窓口負担・請求金額
        { city: '江戸川区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      minamisuna: [
        // ★要確認: 江東区の窓口負担・請求金額
        { city: '江東区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      'kita-toda': [
        // ★要確認: 各自治体の窓口負担・請求金額
        { city: '戸田市', copay: null, claim: null, conditions: '65歳以上' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '川口市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '蕨市', copay: null, claim: null, conditions: '65歳以上' },
      ],
      ichikawa: [
        // 山本先生メモ: 市川市・浦安市は1,500円。ただし市川院は乗り入れ不可→市川市のみ
        { city: '市川市', copay: 1500, claim: null, conditions: '65歳以上' },
      ],
    },
  },
  {
    name: 'インフルエンザ（一般・任意）',
    category: 'インフルエンザ',
    selfPay: null, // ★要確認: クリニック設定価格
    notes: '64歳以下。任意接種・全額自費',
    billing: {
      kasai: [],
      minamisuna: [],
      'kita-toda': [],
      ichikawa: [],
    },
  },
  {
    name: 'エフルエルダ（高用量インフルエンザ・65歳以上）',
    category: 'インフルエンザ',
    selfPay: null, // ★要確認: クリニック設定価格
    notes: '65歳以上対象。各株HA 60μg（従来型4倍量）。任意接種',
    billing: {
      kasai: [],
      minamisuna: [],
      'kita-toda': [],
      ichikawa: [],
    },
  },
  {
    name: 'フルミスト（経鼻インフルエンザ・2-18歳）',
    category: 'インフルエンザ',
    selfPay: null, // ★要確認: クリニック設定価格（原価設定間違い指摘あり→修正必要）
    notes: '2歳以上19歳未満。経鼻投与・注射不要。任意接種。生ワクチン',
    billing: {
      kasai: [],
      minamisuna: [],
      'kita-toda': [],
      ichikawa: [],
    },
  },

  // ──────────────────────────────────────────
  // 肺炎球菌
  // ──────────────────────────────────────────
  {
    name: '高齢者肺炎球菌（PPSV23・ニューモバックス）（定期）',
    category: '肺炎球菌',
    selfPay: null, // ★要確認
    notes: '65歳の定期接種。経過措置で70,75,80,...歳も対象（段階的終了）',
    billing: {
      kasai: [
        // ★要確認: 江戸川区データ
        { city: '江戸川区', copay: null, claim: null, conditions: '65歳' },
      ],
      minamisuna: [
        // ★要確認
        { city: '江東区', copay: null, claim: null, conditions: '65歳' },
      ],
      'kita-toda': [
        // 確定データ（北戸田事務確認済み・須永さんチェック済み）
        { city: '戸田市', copay: 7900, claim: 3661, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11561, exemptNote: '生活保護・非課税' },
        { city: 'さいたま市', copay: 7900, claim: 3660, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11560, exemptNote: '生活保護・非課税' },
        { city: '川口市', copay: 3000, claim: 5649, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 8649, exemptNote: '生活保護・非課税' },
        { city: '蕨市', copay: 7900, claim: 3661, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11561, exemptNote: '生活保護・非課税' },
      ],
      ichikawa: [
        // 鈴木さん確認済み: 公費対応可（市川市住民のみ）
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },
  {
    name: '肺炎球菌（PCV20・プレベナー20）（定期）',
    category: '肺炎球菌',
    selfPay: null,
    notes: '65歳以上。R8年度は新料金。旧予診票の患者もR8/4/1以降は新料金で接種（北戸田）。江戸川区は配布紙の費用が正',
    billing: {
      kasai: [
        // 江戸川区: 配布された紙の費用が正（永見さん確認済み）
        { city: '江戸川区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      minamisuna: [
        { city: '江東区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      'kita-toda': [
        // 北戸田: 全員R8年度新料金（玉川さん確認済み）
        { city: '戸田市', copay: null, claim: null, conditions: '65歳以上' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '川口市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '蕨市', copay: null, claim: null, conditions: '65歳以上' },
      ],
      ichikawa: [
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },

  // ──────────────────────────────────────────
  // 帯状疱疹
  // ──────────────────────────────────────────
  {
    name: '帯状疱疹（シングリックス）（定期・65歳以上）',
    category: '帯状疱疹',
    selfPay: null,
    notes: '65歳以上。定期接種。2回接種（0, 2ヶ月）。不活化ワクチン。1回分の金額',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      minamisuna: [
        { city: '江東区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '65歳以上' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '川口市', copay: null, claim: null, conditions: '65歳以上' },
        { city: '蕨市', copay: null, claim: null, conditions: '65歳以上' },
      ],
      ichikawa: [
        // 鈴木さん確認済み: 帯状疱疹（定期）は公費対応可
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },
  {
    name: '帯状疱疹（シングリックス）（任意・50-64歳）',
    category: '帯状疱疹',
    selfPay: null, // ★要確認: クリニック設定価格
    notes: '50歳以上65歳未満。任意接種。2回接種（0, 2ヶ月）。1回分の金額',
    billing: {
      kasai: [
        // 葛西事務確認: 50-64歳は任意接種公費適用延長
        { city: '江戸川区', copay: null, claim: null, conditions: '50-64歳・公費延長' },
      ],
      minamisuna: [
        { city: '江東区', copay: null, claim: null, conditions: '50-64歳' },
      ],
      'kita-toda': [
        // 北戸田事務（玉川さん）確認: 戸田市の50-64歳補助金は2026/3/31で終了
        // → 2026年度は公費助成なし
      ],
      ichikawa: [
        // 鈴木さん確認: 窓口全額自費→患者が後日市に助成金申請可能
        // ※窓口では公費処理なし。領収書+明細書セットで患者が市に請求するフロー
        { city: '市川市', copay: null, claim: 0, conditions: '50歳以上。窓口は全額自費。患者が市に助成金申請可（領収書+明細書必要）',
          isReimbursement: true },
      ],
    },
  },
  {
    name: '帯状疱疹（ビケン・生ワクチン）',
    category: '帯状疱疹',
    selfPay: null,
    notes: '50歳以上。1回接種。生ワクチン',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '50歳以上' },
      ],
      minamisuna: [],
      'kita-toda': [],
      ichikawa: [],
    },
  },

  // ──────────────────────────────────────────
  // HPV
  // ──────────────────────────────────────────
  {
    name: 'HPV（シルガード9）（定期）',
    category: 'HPV',
    selfPay: null,
    notes: '定期接種（小6-高1女子）。キャッチアップは2026/3末で終了。1回分の金額',
    billing: {
      kasai: [
        // 葛西事務確認: 男性HPVも公費対象に追加（江戸川区）
        { city: '江戸川区', copay: 0, claim: null, conditions: '定期対象（小6-高1女子）＋男性HPV公費対象' },
      ],
      minamisuna: [
        { city: '江東区', copay: 0, claim: null, conditions: '定期対象（小6-高1女子）' },
      ],
      'kita-toda': [
        // 北戸田事務（玉川さん）確認: HPV定期は対応可。キャッチアップは終了
        { city: '戸田市', copay: 0, claim: null, conditions: '定期対象' },
        { city: 'さいたま市', copay: 0, claim: null, conditions: '定期対象' },
        { city: '川口市', copay: 0, claim: null, conditions: '定期対象' },
        { city: '蕨市', copay: 0, claim: null, conditions: '定期対象' },
      ],
      ichikawa: [
        // 鈴木さん確認: 個別契約では対応不可→完全自費
        // ※市川院ではHPV定期の公費接種はできない
      ],
    },
  },
  {
    name: 'HPV（シルガード9）（任意・自費）',
    category: 'HPV',
    selfPay: null, // ★要確認: クリニック設定価格
    notes: '定期対象外の方。全額自費。1回分の金額',
    billing: {
      kasai: [],
      minamisuna: [],
      'kita-toda': [],
      ichikawa: [],
    },
  },

  // ──────────────────────────────────────────
  // コロナ
  // ──────────────────────────────────────────
  {
    name: 'コロナワクチン（定期）',
    category: 'コロナ',
    selfPay: null,
    notes: '65歳以上。シーズン近くに手引き届く予定。詳細は未定',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      minamisuna: [
        { city: '江東区', copay: null, claim: null, conditions: '65歳以上' },
      ],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '65歳以上' },
      ],
      ichikawa: [
        // 鈴木さん確認: 公費対応可。シーズン近くに手引き届く
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },

  // ──────────────────────────────────────────
  // その他
  // ──────────────────────────────────────────
  {
    name: 'B型肝炎（成人・任意）',
    category: 'その他',
    selfPay: null, // ★要確認
    notes: '1回分。3回接種（0, 1, 6ヶ月）。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'MR（麻疹風疹混合）',
    category: 'その他',
    selfPay: null,
    notes: '抗体価不十分な成人。任意接種',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: '破傷風トキソイド',
    category: 'その他',
    selfPay: null,
    notes: '全成人（10年ごと追加接種推奨）。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
];
