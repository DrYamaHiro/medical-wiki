/**
 * ワクチン料金・自治体契約データ
 *
 * 【更新方法】
 * このファイルを編集してワクチン料金や契約自治体を更新してください。
 * GitHubの「このページを編集」からブラウザ上で直接編集できます。
 *
 * 【データ構造】
 * - name: ワクチン名
 * - clinicPrice: クリニック接種料金（税込）
 * - notes: 備考（対象年齢等）
 * - contracts: 契約自治体の配列
 *   - city: 自治体名（「市川市」「船橋市」など）
 *   - subsidy: 助成額（円）
 *   - conditions: 助成条件（「65歳以上」など）
 *   - residentOnly: true の場合、その自治体の住民のみ助成対象
 *                   false の場合、他自治体住民でも助成あり（広域連携等）
 */

// データ最終更新日（ツール上に表示されます）
export const DATA_LAST_UPDATED = '2026-04-02';
export const DATA_FISCAL_YEAR = '2026年度';

// ワクチン料金・契約データ
export const VACCINE_DATA = [
  {
    name: 'インフルエンザ（65歳以上・定期）',
    clinicPrice: 4500,
    notes: '65歳以上、または60-64歳で基礎疾患あり。10-12月接種',
    contracts: [
      // ↓ サンプルデータ: 実際の契約自治体・助成額に差し替えてください
      { city: '市川市', subsidy: 2500, conditions: '65歳以上', residentOnly: true },
      { city: '船橋市', subsidy: 2000, conditions: '65歳以上', residentOnly: true },
      { city: '江戸川区', subsidy: 2500, conditions: '65歳以上', residentOnly: true },
      { city: '葛飾区', subsidy: 2500, conditions: '65歳以上', residentOnly: true },
    ],
  },
  {
    name: 'インフルエンザ（一般・任意）',
    clinicPrice: 3500,
    notes: '64歳以下（定期接種対象外）。任意接種・全額自費',
    contracts: [],
  },
  {
    name: 'エフルエルダ（高用量インフルエンザ・65歳以上）',
    clinicPrice: 8000,
    notes: '65歳以上対象。従来型の4倍量HA含有。任意接種',
    contracts: [
      // ↓ 定期接種対象として認められた自治体があれば追加
    ],
  },
  {
    name: 'フルミスト（経鼻インフルエンザ・2-18歳）',
    clinicPrice: 8500,
    notes: '2歳以上19歳未満対象。経鼻投与・注射不要。任意接種',
    contracts: [],
  },
  {
    name: '肺炎球菌（PPSV23・ニューモバックス）',
    clinicPrice: 8000,
    notes: '65歳の定期接種対象者',
    contracts: [
      { city: '市川市', subsidy: 4000, conditions: '65歳', residentOnly: true },
      { city: '船橋市', subsidy: 3000, conditions: '65歳', residentOnly: true },
      { city: '江戸川区', subsidy: 4000, conditions: '65歳', residentOnly: true },
    ],
  },
  {
    name: '肺炎球菌（PCV20・プレベナー20）',
    clinicPrice: 12000,
    notes: '65歳以上。任意接種',
    contracts: [],
  },
  {
    name: '帯状疱疹（シングリックス）1回分',
    clinicPrice: 22000,
    notes: '50歳以上。2回接種（0, 2ヶ月）。不活化ワクチン',
    contracts: [
      { city: '市川市', subsidy: 10000, conditions: '50歳以上', residentOnly: true },
      { city: '江戸川区', subsidy: 10000, conditions: '50歳以上', residentOnly: true },
    ],
  },
  {
    name: '帯状疱疹（ビケン・生ワクチン）',
    clinicPrice: 8000,
    notes: '50歳以上。1回接種。生ワクチン',
    contracts: [
      { city: '市川市', subsidy: 4000, conditions: '50歳以上', residentOnly: true },
    ],
  },
  {
    name: 'HPV（シルガード9）1回分',
    clinicPrice: 30000,
    notes: '定期接種対象は公費。対象外は全額自費',
    contracts: [
      { city: '市川市', subsidy: 30000, conditions: '定期接種対象（小6-高1女子）', residentOnly: true },
      { city: '船橋市', subsidy: 30000, conditions: '定期接種対象（小6-高1女子）', residentOnly: true },
      { city: '江戸川区', subsidy: 30000, conditions: '定期接種対象（小6-高1女子）', residentOnly: true },
    ],
  },
  {
    name: 'B型肝炎（成人・任意）',
    clinicPrice: 6000,
    notes: '1回分。3回接種（0, 1, 6ヶ月）',
    contracts: [],
  },
  {
    name: 'MR（麻疹風疹混合）',
    clinicPrice: 10000,
    notes: '抗体価不十分な成人。任意接種',
    contracts: [],
  },
  {
    name: '破傷風トキソイド',
    clinicPrice: 3500,
    notes: '全成人（10年ごと追加接種推奨）',
    contracts: [],
  },
];
