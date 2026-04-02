/**
 * ワクチン料金・自治体契約データ
 *
 * 【更新方法】
 * GitHubの「このページを編集」からブラウザ上で直接編集できます。
 *
 * 【フィールド説明】
 * - copay = 窓口で患者から受け取る金額
 * - claim = 自治体に請求する金額
 * - copayExempt / claimExempt = 生活保護・非課税世帯向け
 * - selfPay = 公費対象外の全額自費料金
 * - isReimbursement = true: 窓口全額自費→患者が後日自治体に助成金申請
 * - null = 未確認（「要確認」と表示）
 *
 * ソース: 各院事務スタッフ入力シート + Slack確認
 */

export const DATA_LAST_UPDATED = '2026-04-02';
export const DATA_FISCAL_YEAR = '2026年度（令和8年度）';

// ===== 拠点マスター =====
export const CLINICS = [
  { id: 'kasai',      name: 'イオン葛西',  municipality: '江戸川区' },
  { id: 'minamisuna', name: '南砂',        municipality: '江東区',
    notice: '現在、公費の個別契約が締結されていないため、全ワクチン自費のみです' },
  { id: 'kita-toda',  name: '北戸田',      municipality: '戸田市' },
  { id: 'ichikawa',   name: '市川',        municipality: '市川市' },
];

// ===== ワクチンマスター =====
export const VACCINE_LIST = [

  // ══════════════════════════════════════════
  // インフルエンザ
  // ══════════════════════════════════════════
  {
    name: 'インフルエンザ注射（一般・自費）',
    category: 'インフルエンザ',
    selfPay: null, // 未決定
    notes: '全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'インフルエンザ注射（高齢者 65-74歳・定期）',
    category: 'インフルエンザ',
    selfPay: null,
    notes: '65-74歳。窓口負担は未決定（シーズン前に確定）',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '65-74歳。23区内共通' },
      ],
      minamisuna: [],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '65-74歳' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '65-74歳' },
        { city: '川口市', copay: null, claim: null, conditions: '65-74歳' },
        { city: '蕨市', copay: null, claim: null, conditions: '65-74歳' },
      ],
      ichikawa: [
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },
  {
    name: 'インフルエンザ注射（高齢者 75歳以上・定期）',
    category: 'インフルエンザ',
    selfPay: null,
    notes: '75歳以上。江戸川区は独自助成あり？ 窓口負担は未決定',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '75歳以上。江戸川区独自助成？' },
      ],
      minamisuna: [],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '75歳以上' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '75歳以上' },
        { city: '川口市', copay: null, claim: null, conditions: '75歳以上' },
        { city: '蕨市', copay: null, claim: null, conditions: '75歳以上' },
      ],
      ichikawa: [], // 市川は65歳以上で一括（上の行に含む）
    },
  },
  {
    name: 'インフルエンザ注射（小児 0-12歳）',
    category: 'インフルエンザ',
    selfPay: null,
    notes: '市川院のみ記載あり。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'フルミスト（一般・自費）',
    category: 'インフルエンザ',
    selfPay: null, // 未決定
    notes: '2歳以上。経鼻投与・注射不要。生ワクチン。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'フルミスト（小児 2-18歳・公費）',
    category: 'インフルエンザ',
    selfPay: null,
    notes: '2-18歳。経鼻投与。窓口負担は未決定',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '2-18歳' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田シート: 公費○
        { city: '戸田市', copay: null, claim: null, conditions: '2-18歳' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '2-18歳' },
        { city: '川口市', copay: null, claim: null, conditions: '2-18歳' },
        { city: '蕨市', copay: null, claim: null, conditions: '2-18歳' },
      ],
      ichikawa: [], // 市川シート: フルミスト小児の公費記載なし
    },
  },
  {
    name: 'エフルエルダ（高用量インフルエンザ・65歳以上）',
    category: 'インフルエンザ',
    selfPay: null,
    notes: '65歳以上。2025/2026シーズンから。全院取扱い未定',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },

  // ══════════════════════════════════════════
  // 新型コロナ
  // ══════════════════════════════════════════
  {
    name: '新型コロナ（一般・自費）',
    category: '新型コロナ',
    selfPay: null,
    notes: '全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: '新型コロナ（高齢者 65-74歳・定期）',
    category: '新型コロナ',
    selfPay: null,
    notes: '65-74歳。シーズン近くに手引き届く予定',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '65-74歳' },
      ],
      minamisuna: [],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '65-74歳' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '65-74歳' },
        { city: '川口市', copay: null, claim: null, conditions: '65-74歳' },
        { city: '蕨市', copay: null, claim: null, conditions: '65-74歳' },
      ],
      ichikawa: [
        { city: '市川市', copay: null, claim: null, conditions: '65歳以上' },
      ],
    },
  },
  {
    name: '新型コロナ（高齢者 75歳以上・定期）',
    category: '新型コロナ',
    selfPay: null,
    notes: '75歳以上。シーズン近くに手引き届く予定',
    billing: {
      kasai: [
        { city: '江戸川区', copay: null, claim: null, conditions: '75歳以上' },
      ],
      minamisuna: [],
      'kita-toda': [
        { city: '戸田市', copay: null, claim: null, conditions: '75歳以上' },
        { city: 'さいたま市', copay: null, claim: null, conditions: '75歳以上' },
        { city: '川口市', copay: null, claim: null, conditions: '75歳以上' },
        { city: '蕨市', copay: null, claim: null, conditions: '75歳以上' },
      ],
      ichikawa: [], // 市川は65歳以上で一括
    },
  },

  // ══════════════════════════════════════════
  // 肺炎球菌
  // ══════════════════════════════════════════
  {
    name: '肺炎球菌（プレベナー20）R7年度予診票（定期）',
    category: '肺炎球菌',
    selfPay: null,
    notes: 'R7年度分の予診票で来院した場合',
    billing: {
      kasai: [
        // 葛西確定: 窓口4,000円。配布紙の費用が正（永見さん確認）
        { city: '江戸川区', copay: 4000, claim: null, conditions: 'R7予診票。配布紙の費用が正' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田: R8/4/1以降は全員新料金（玉川さん確認）→ R7予診票でもR8料金
        { city: '戸田市', copay: 7900, claim: null, conditions: 'R7予診票でもR8新料金で接種' },
        { city: 'さいたま市', copay: 7900, claim: null, conditions: 'R7予診票でもR8新料金で接種' },
        { city: '川口市', copay: 3000, claim: null, conditions: 'R7予診票でもR8新料金で接種' },
        { city: '蕨市', copay: 7900, claim: null, conditions: 'R7予診票でもR8新料金で接種' },
      ],
      ichikawa: [
        // 市川確定: 窓口3,500円。66歳以上で未接種者も対象
        { city: '市川市', copay: 3500, claim: null, conditions: 'R7予診票。66歳以上未接種者も対象' },
      ],
    },
  },
  {
    name: '肺炎球菌（プレベナー20）R8年度予診票（定期）',
    category: '肺炎球菌',
    selfPay: null,
    notes: 'R8年度分の予診票で来院した場合。ニューモバックス廃止→プレベナー20で',
    billing: {
      kasai: [
        // 葛西確定: 窓口5,500円
        { city: '江戸川区', copay: 5500, claim: null, conditions: 'R8予診票' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田シート確定
        { city: '戸田市', copay: 7900, claim: null, conditions: '定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: 'さいたま市', copay: 7900, claim: null, conditions: '定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '川口市', copay: 3000, claim: null, conditions: '定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '蕨市', copay: 7900, claim: null, conditions: '定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
      ],
      ichikawa: [
        { city: '市川市', copay: 3500, claim: null, conditions: 'R8予診票' },
      ],
    },
  },
  {
    name: '肺炎球菌（ニューモバックス）※廃止',
    category: '肺炎球菌',
    selfPay: 11000,
    notes: '※廃止。在庫限り。希望者に接種',
    billing: {
      kasai: [],
      minamisuna: [],
      'kita-toda': [
        // 北戸田PPSV23確定データ（須永さんチェック済み）
        { city: '戸田市', copay: 7900, claim: 3661, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11561, exemptNote: '生活保護・非課税' },
        { city: 'さいたま市', copay: 7900, claim: 3660, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11560, exemptNote: '生活保護・非課税' },
        { city: '川口市', copay: 3000, claim: 5649, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 8649, exemptNote: '生活保護・非課税' },
        { city: '蕨市', copay: 7900, claim: 3661, conditions: '65歳以上',
          copayExempt: 0, claimExempt: 11561, exemptNote: '生活保護・非課税' },
      ],
      ichikawa: [],
    },
  },
  {
    name: '肺炎球菌（プレベナー20）（自費）',
    category: '肺炎球菌',
    selfPay: 13000,
    notes: '定期対象外。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },

  // ══════════════════════════════════════════
  // 帯状疱疹
  // ══════════════════════════════════════════
  {
    name: '帯状疱疹（シングリックス）（定期・65歳以上）',
    category: '帯状疱疹',
    selfPay: null,
    notes: '65歳以上。定期接種。2回接種（0, 2ヶ月）。1回分の金額',
    billing: {
      kasai: [
        { city: '江戸川区', copay: 11000, claim: null, conditions: '65歳以上・定期' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田シート確定
        { city: '戸田市', copay: 12000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '蕨市', copay: 12000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '川口市', copay: 12000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: 'さいたま市', copay: 18200, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
      ],
      ichikawa: [
        // 市川確定: 窓口6,500円
        { city: '市川市', copay: 6500, claim: null, conditions: '65歳以上・定期' },
      ],
    },
  },
  {
    name: '帯状疱疹（シングリックス）（任意・50-64歳）',
    category: '帯状疱疹',
    selfPay: 22000,
    notes: '50-64歳。助成は自治体による。埼玉県は助成終了済み',
    billing: {
      kasai: [
        // 葛西事務: 50-64歳は任意接種公費適用延長
        { city: '江戸川区', copay: 11000, claim: null, conditions: '50-64歳・公費延長' },
      ],
      minamisuna: [],
      'kita-toda': [], // 埼玉県は助成終了済み（玉川さん確認）
      ichikawa: [
        // 市川シート: 公費適応できない→全額自費(22,000円)
        // ただし鈴木さん確認: 患者が後日市に助成金申請可能
        { city: '市川市', copay: 22000, claim: 0,
          conditions: '50歳以上。窓口全額自費→患者が領収書+明細書で市に助成金申請可',
          isReimbursement: true },
      ],
    },
  },
  {
    name: '帯状疱疹（シングリックス）（自費）',
    category: '帯状疱疹',
    selfPay: 22000,
    notes: '定期/公費対象外。全額自費。2回接種。1回分',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: '帯状疱疹（ビケン・生ワクチン）（定期・65歳以上）',
    category: '帯状疱疹',
    selfPay: null,
    notes: '65歳以上。定期接種。1回接種。生ワクチン',
    billing: {
      kasai: [
        { city: '江戸川区', copay: 4000, claim: null, conditions: '65歳以上・定期' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田シート確定
        { city: '戸田市', copay: 4000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '蕨市', copay: 4000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: '川口市', copay: 4000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
        { city: 'さいたま市', copay: 5000, claim: null, conditions: '65歳以上・定期',
          copayExempt: 0, claimExempt: null, exemptNote: '生活保護' },
      ],
      ichikawa: [
        // 市川確定: 窓口2,500円
        { city: '市川市', copay: 2500, claim: null, conditions: '65歳以上・定期' },
      ],
    },
  },
  {
    name: '帯状疱疹（ビケン・生ワクチン）（任意・50-64歳）',
    category: '帯状疱疹',
    selfPay: 9900,
    notes: '50-64歳。助成は自治体による。埼玉県は助成終了',
    billing: {
      kasai: [
        { city: '江戸川区', copay: 4000, claim: null, conditions: '50-64歳・公費延長' },
      ],
      minamisuna: [],
      'kita-toda': [], // 埼玉県は助成終了
      ichikawa: [], // 市川は公費適応できない
    },
  },
  {
    name: '帯状疱疹（ビケン・生ワクチン）（自費）',
    category: '帯状疱疹',
    selfPay: 9900,
    notes: '定期/公費対象外。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },

  // ══════════════════════════════════════════
  // HPV
  // ══════════════════════════════════════════
  {
    name: 'HPV（シルガード9）（定期・男性公費）',
    category: 'HPV',
    selfPay: null,
    notes: '定期（小6-高1女子）。キャッチアップは2026/3末で終了。江戸川区は男性HPVも公費対象',
    billing: {
      kasai: [
        { city: '江戸川区', copay: 0, claim: null, conditions: '定期＋男性HPV公費' },
      ],
      minamisuna: [],
      'kita-toda': [
        { city: '戸田市', copay: 0, claim: null, conditions: '定期対象。キャッチアップ終了' },
        { city: 'さいたま市', copay: 0, claim: null, conditions: '定期対象' },
        { city: '川口市', copay: 0, claim: null, conditions: '定期対象' },
        { city: '蕨市', copay: 0, claim: null, conditions: '定期対象' },
      ],
      ichikawa: [], // 市川: 個別契約では対応不可→公費接種できない
    },
  },
  {
    name: 'HPV（シルガード9）（自費）',
    category: 'HPV',
    selfPay: 32500,
    notes: '定期対象外。全額自費。1回分',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'HPV（ガーダシル）（男性公費）',
    category: 'HPV',
    selfPay: null,
    notes: '男性HPV。江戸川区・北戸田は公費対象。市川は対象外',
    billing: {
      kasai: [
        { city: '江戸川区', copay: 0, claim: null, conditions: '男性・公費' },
      ],
      minamisuna: [],
      'kita-toda': [
        // 北戸田シート確定: 男性公費○
        { city: '戸田市', copay: 0, claim: null, conditions: '男性・公費' },
        { city: 'さいたま市', copay: 0, claim: null, conditions: '男性・公費' },
        { city: '川口市', copay: 0, claim: null, conditions: '男性・公費' },
        { city: '蕨市', copay: 0, claim: null, conditions: '男性・公費' },
      ],
      ichikawa: [], // 市川: 対象外
    },
  },
  {
    name: 'HPV（ガーダシル）（自費）',
    category: 'HPV',
    selfPay: 18000,
    notes: '全額自費。1回分',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },

  // ══════════════════════════════════════════
  // RSV
  // ══════════════════════════════════════════
  {
    name: 'RSV（アレックスビー）（自費）',
    category: 'RSV',
    selfPay: 27000,
    notes: '60歳以上の成人、および重症化リスクの高い50-59歳の成人',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
  {
    name: 'RSV（アプリズボ）（自費）',
    category: 'RSV',
    selfPay: null,
    notes: '葛西・市川: 当院採用なし。価格未決定',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },

  // ══════════════════════════════════════════
  // その他
  // ══════════════════════════════════════════
  {
    name: 'B型肝炎（成人・自費）',
    category: 'その他',
    selfPay: null,
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
    notes: '全成人。10年ごと追加接種推奨。全額自費',
    billing: { kasai: [], minamisuna: [], 'kita-toda': [], ichikawa: [] },
  },
];
