// Holter Booster データ定義 (Philips DigiTrak XT / Zymed 等 汎用フォーマット準拠)
// type: choice, multichoice, numeric, text
// normalRange: { min, max, note } または { byGender: {...} }

export const HOLTER_SECTIONS = [
  {
    id: 'context',
    title: '患者背景・依頼理由',
    items: [
      { id: 'age', label: '年齢', type: 'numeric', unit: '歳', placeholder: '65' },
      { id: 'sex', label: '性別', type: 'choice', options: ['男性', '女性'] },
      { id: 'symptom', label: '主訴・依頼理由', type: 'multichoice', options: ['動悸', '失神・前失神', 'めまい・ふらつき', '胸痛・胸部不快', '不整脈フォロー', 'AF検出目的', 'ペースメーカー機能評価', '無症候性 (定期評価)'] },
      { id: 'diary_correlation', label: '症状日誌との相関', type: 'choice', options: ['未評価・日誌なし', '症状時に不整脈あり (相関)', '症状時に不整脈なし', '一部相関'] },
      { id: 'underlying', label: '基礎疾患', type: 'multichoice', options: ['心不全 (HFrEF/HFmrEF/HFpEF)', '虚血性心疾患', '弁膜症', '心筋症', '甲状腺機能異常', '高血圧', '糖尿病', 'CKD', 'なし・不明'] },
      { id: 'meds', label: '関連薬剤', type: 'multichoice', options: ['β遮断薬', 'Ca拮抗薬 (非DHP)', 'Ic群 (フレカイニド等)', 'III群 (アミオダロン等)', 'ジゴキシン', 'DOAC', 'ワルファリン', 'なし・不明'] },
      { id: 'device', label: 'デバイス', type: 'choice', options: ['なし', 'ペースメーカー (PPM)', 'ICD', 'CRT-P/D'] },
    ],
  },
  {
    id: 'basic',
    title: '基本情報 (記録時間・心拍数)',
    items: [
      { id: 'analyze_hours', label: '有効解析時間', type: 'numeric', unit: '時間', placeholder: '24', normalRange: { min: 20, max: 48, note: '通常 24時間、20時間未満は解釈注意' } },
      { id: 'total_beats', label: '総心拍数', type: 'numeric', unit: '拍', placeholder: '105000', normalRange: { min: 80000, max: 130000, note: '24時間で 8〜13万拍が目安' } },
      { id: 'hr_mean', label: '平均心拍数', type: 'numeric', unit: 'bpm', placeholder: '72', normalRange: { min: 60, max: 90, note: '安静時目安 60-90' } },
      { id: 'hr_max', label: '最大心拍数', type: 'numeric', unit: 'bpm', placeholder: '130', normalRange: { min: 90, max: 180, note: '年齢別 (220-年齢) を目安に評価' } },
      { id: 'hr_min', label: '最小心拍数', type: 'numeric', unit: 'bpm', placeholder: '48', normalRange: { min: 40, max: 70, note: '40未満は洞不全示唆' } },
      { id: 'hr_max_time', label: '最大心拍数の時刻', type: 'text', placeholder: '例: 14:32' },
      { id: 'hr_min_time', label: '最小心拍数の時刻', type: 'text', placeholder: '例: 03:15' },
    ],
  },
  {
    id: 'pvc',
    title: '心室性不整脈 (PVC / VT)',
    items: [
      { id: 'pvc_total', label: 'PVC 総数', type: 'numeric', unit: '個/24h', placeholder: '150' },
      { id: 'pvc_percent', label: 'PVC 出現率', type: 'numeric', unit: '%', placeholder: '0.2', normalRange: { min: 0, max: 1, note: '<1%正常域、10%以上でPVC心筋症リスク' } },
      { id: 'pvc_form', label: 'PVC 形態', type: 'choice', options: ['単形性', '多形性 (2種以上)', '未評価'] },
      { id: 'pvc_couplet', label: 'PVC couplet (2連発)', type: 'numeric', unit: '回', placeholder: '5' },
      { id: 'nsvt_runs', label: '3連発以上 (NSVT)', type: 'numeric', unit: '回', placeholder: '0' },
      { id: 'nsvt_max_beats', label: 'NSVT 最長連発数', type: 'numeric', unit: '拍', placeholder: '3' },
      { id: 'nsvt_max_rate', label: 'NSVT 最高レート', type: 'numeric', unit: 'bpm', placeholder: '150' },
      { id: 'pvc_bigeminy', label: 'Bigeminy 総時間', type: 'text', placeholder: '例: 30分' },
      { id: 'sustained_vt', label: '持続性VT (>30秒 or 血行動態不安定)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'r_on_t', label: 'R on T 現象', type: 'choice', options: ['なし', 'あり'] },
    ],
  },
  {
    id: 'svt',
    title: '上室性不整脈 (SVPC / AF / AFL / SVT)',
    items: [
      { id: 'spvc_total', label: 'SVPC 総数', type: 'numeric', unit: '個/24h', placeholder: '80' },
      { id: 'svt_runs', label: 'SVT ラン数 (3連発以上)', type: 'numeric', unit: '回', placeholder: '0' },
      { id: 'svt_max_beats', label: 'SVT 最長連発数', type: 'numeric', unit: '拍', placeholder: '5' },
      { id: 'svt_max_rate', label: 'SVT 最高レート', type: 'numeric', unit: 'bpm', placeholder: '160' },
      { id: 'af_present', label: '心房細動 (AF)', type: 'choice', options: ['なし', '発作性 (記録内)', '持続性 (全時間)', '記録前既知'] },
      { id: 'af_burden', label: 'AF burden', type: 'numeric', unit: '%', placeholder: '0', normalRange: { min: 0, max: 0, note: '検出されれば CHA2DS2-VASc に基づき抗凝固検討' } },
      { id: 'af_episodes', label: 'AF エピソード数', type: 'numeric', unit: '回', placeholder: '0' },
      { id: 'af_max_duration', label: 'AF 最長持続', type: 'text', placeholder: '例: 12分' },
      { id: 'aflutter', label: '心房粗動 (AFL)', type: 'choice', options: ['なし', 'あり'] },
    ],
  },
  {
    id: 'brady',
    title: '徐脈・伝導障害・ポーズ',
    items: [
      { id: 'pause_2sec_plus', label: '2秒以上のポーズ', type: 'numeric', unit: '回', placeholder: '0' },
      { id: 'pause_max', label: '最長ポーズ', type: 'numeric', unit: '秒', placeholder: '1.2', normalRange: { min: 0, max: 2.0, note: '3秒以上 (覚醒時) or 症状伴えばペースメーカー検討' } },
      { id: 'pause_max_time', label: '最長ポーズの時刻', type: 'text', placeholder: '例: 04:12 (睡眠中)' },
      { id: 'av_block_1', label: '1度AVブロック (PR延長)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'av_block_2_1', label: '2度AVブロック モビッツI型 (Wenckebach)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'av_block_2_2', label: '2度AVブロック モビッツII型', type: 'choice', options: ['なし', 'あり'] },
      { id: 'av_block_3', label: '3度AVブロック (完全房室ブロック)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'sss', label: '洞不全症候群 (SSS) 疑い', type: 'choice', options: ['なし', 'あり (洞停止・徐脈頻脈症候群)'] },
    ],
  },
  {
    id: 'st',
    title: 'ST 変化 (虚血評価)',
    items: [
      { id: 'st_depression_max', label: 'ST 低下 最大値', type: 'numeric', unit: 'mm', placeholder: '0', normalRange: { min: 0, max: 1.0, note: '≥1mm水平・下降型の持続低下は虚血示唆' } },
      { id: 'st_depression_duration', label: 'ST 低下 総持続時間', type: 'numeric', unit: '分', placeholder: '0' },
      { id: 'st_elevation_max', label: 'ST 上昇 最大値', type: 'numeric', unit: 'mm', placeholder: '0', normalRange: { min: 0, max: 1.0, note: '安静時 ST 上昇は冠攣縮・心外膜炎等鑑別' } },
      { id: 'st_symptom_correlation', label: 'ST変化と症状の相関', type: 'choice', options: ['未評価', '相関あり', '相関なし', '一部相関', 'ST変化なし'] },
    ],
  },
  {
    id: 'hrv',
    title: '心拍変動 (HRV) — 該当報告時',
    items: [
      { id: 'sdnn', label: 'SDNN', type: 'numeric', unit: 'ms', placeholder: '141', normalRange: { min: 100, max: 200, note: '<50ms 予後不良指標 (心不全・DM 神経障害)' } },
      { id: 'sdann', label: 'SDANN', type: 'numeric', unit: 'ms', placeholder: '127' },
      { id: 'rmssd', label: 'RMSSD', type: 'numeric', unit: 'ms', placeholder: '27', normalRange: { min: 20, max: 100, note: '副交感神経活動指標' } },
      { id: 'pnn50', label: 'pNN50', type: 'numeric', unit: '%', placeholder: '9' },
      { id: 'lf_hf', label: 'LF/HF 比', type: 'numeric', placeholder: '1.5', normalRange: { min: 1.0, max: 2.0, note: '交感/副交感バランス指標、参考値' } },
    ],
  },
  {
    id: 'qt',
    title: 'QT / QTc',
    items: [
      { id: 'qt_max', label: 'QT 最大値', type: 'numeric', unit: 'ms', placeholder: '400' },
      { id: 'qtc_max', label: 'QTc 最大値 (Bazett)', type: 'numeric', unit: 'ms', placeholder: '440', normalRange: { byGender: { male: { min: 0, max: 450 }, female: { min: 0, max: 470 } }, note: '男 ≤450ms、女 ≤470ms 目安。>500ms で torsades リスク' } },
      { id: 'qtc_prolongation', label: 'QTc 500ms超のエピソード', type: 'choice', options: ['なし', 'あり (torsades リスク)'] },
    ],
  },
  {
    id: 'pacemaker_func',
    title: 'ペースメーカー機能評価 (デバイス植込例のみ)',
    items: [
      { id: 'pacing_percent_a', label: '心房 (A) ペーシング率', type: 'numeric', unit: '%', placeholder: '30' },
      { id: 'pacing_percent_v', label: '心室 (V) ペーシング率', type: 'numeric', unit: '%', placeholder: '5', normalRange: { min: 0, max: 40, note: 'CRT 以外で V ペーシング >40% は心機能悪化リスク検討' } },
      { id: 'undersensing', label: 'アンダーセンシング', type: 'choice', options: ['なし', 'あり'] },
      { id: 'oversensing', label: 'オーバーセンシング', type: 'choice', options: ['なし', 'あり'] },
      { id: 'failure_to_capture', label: 'キャプチャー不全', type: 'choice', options: ['なし', 'あり'] },
      { id: 'icd_therapy', label: 'ICD 作動 (該当時)', type: 'choice', options: ['なし', 'ATP のみ', 'ショック実施', '不適切作動疑い'] },
    ],
  },
];

// アセスメント自動生成ルール
export const HOLTER_ASSESSMENT_RULES = [
  // 心拍数系
  { when: (f) => { const v = parseFloat(f.hr_mean || 0); return v > 0 && v < 60; },
    text: '平均心拍数 <60 bpm。洞徐脈傾向、症状・薬剤 (β遮断薬等) との関連を評価。' },
  { when: (f) => { const v = parseFloat(f.hr_mean || 0); return v >= 100; },
    text: '平均心拍数 ≥100 bpm。持続性頻脈、原因検索 (甲状腺・貧血・感染・脱水・心不全等)。' },
  { when: (f) => { const v = parseFloat(f.hr_min || 0); return v > 0 && v < 40; },
    text: '最小心拍数 <40 bpm。時刻・症状との相関確認、洞機能不全 (SSS) 疑い。' },
  { when: (f) => { const v = parseFloat(f.hr_min || 0); return v > 0 && v < 30; },
    text: '最小心拍数 <30 bpm。覚醒時なら重度徐脈、ペースメーカー適応評価推奨。' },

  // PVC 系
  { when: (f) => { const v = parseFloat(f.pvc_percent || 0); return v >= 10 && v < 20; },
    text: 'PVC 出現率 10-19%。PVC 誘発性心筋症のリスクあり、心エコーで LV 機能評価推奨。' },
  { when: (f) => { const v = parseFloat(f.pvc_percent || 0); return v >= 20; },
    text: 'PVC 出現率 ≥20%。PVC 誘発性心筋症を強く疑う、循環器紹介・アブレーション検討。' },
  { when: (f) => f.pvc_form === '多形性 (2種以上)',
    text: 'PVC 多形性あり。器質的心疾患・電解質異常・虚血の除外評価推奨。' },
  { when: (f) => { const v = parseFloat(f.nsvt_runs || 0); return v > 0; },
    text: 'NSVT (3連発以上) を認める。心筋症・虚血の精査、器質的心疾患ある場合は循環器紹介。' },
  { when: (f) => { const b = parseFloat(f.nsvt_max_beats || 0); return b >= 15; },
    text: 'NSVT 長連発 (≥15拍)。突然死リスク層別化・電気生理学的検査/ICD 適応評価検討。' },
  { when: (f) => f.sustained_vt === 'あり',
    text: '持続性 VT あり。緊急循環器コンサルト、ICD 適応・原因精査 (虚血・心筋症) 必須。' },
  { when: (f) => f.r_on_t === 'あり',
    text: 'R on T 現象あり。torsades / VF リスク、QT・電解質・薬剤の確認。' },

  // AF/AFL 系
  { when: (f) => f.af_present && f.af_present !== 'なし',
    text: '心房細動を認める。CHA2DS2-VASc スコアで抗凝固適応評価、心拍数コントロール検討。新規発見なら心エコー・甲状腺評価。' },
  { when: (f) => { const b = parseFloat(f.af_burden || 0); return b >= 0.1 && b < 5; },
    text: 'AF burden <5% (低頻度)。抗凝固の必要性は CHA2DS2-VASc に基づき個別判断。' },
  { when: (f) => { const b = parseFloat(f.af_burden || 0); return b >= 5; },
    text: 'AF burden ≥5%。臨床的 AF に相当し、抗凝固適応をより積極的に検討。' },
  { when: (f) => f.aflutter === 'あり',
    text: '心房粗動を認める。抗凝固方針は AF に準ずる、カテーテルアブレーション適応検討。' },

  // 徐脈・ポーズ・ブロック
  { when: (f) => { const v = parseFloat(f.pause_max || 0); return v >= 2.0 && v < 3.0; },
    text: 'ポーズ 2-3秒あり。時間帯 (夜間 vs 覚醒) と症状相関を確認、単独では即時介入不要例が多い。' },
  { when: (f) => { const v = parseFloat(f.pause_max || 0); return v >= 3.0; },
    text: 'ポーズ ≥3秒あり。覚醒時 or 症状伴えばペースメーカー適応 (JCS ガイドライン クラス I)。' },
  { when: (f) => f.av_block_2_2 === 'あり',
    text: '2度AVブロック モビッツII型あり。ペースメーカー適応 (症状問わずクラス I)、循環器紹介。' },
  { when: (f) => f.av_block_3 === 'あり',
    text: '3度AVブロック (完全房室ブロック) あり。ペースメーカー適応 (クラス I)、緊急対応要否評価。' },
  { when: (f) => f.sss === 'あり (洞停止・徐脈頻脈症候群)',
    text: '洞不全症候群 (SSS) 疑い。症候性ならペースメーカー適応、DDD/AAI モード検討。' },
  { when: (f) => f.av_block_2_1 === 'あり' && f.sustained_vt !== 'あり',
    text: 'Wenckebach 型 2度AVブロック単独では通常良性 (特に夜間・迷走神経性)。症状・器質的心疾患合併があれば精査。' },

  // ST 変化
  { when: (f) => { const v = parseFloat(f.st_depression_max || 0); return v >= 1 && v < 2; },
    text: 'ST 低下 1-2mm あり。虚血の可能性、症状相関・負荷試験検討。' },
  { when: (f) => { const v = parseFloat(f.st_depression_max || 0); return v >= 2; },
    text: 'ST 低下 ≥2mm あり。虚血性心疾患を強く疑う、冠動脈評価 (CTA / CAG) 推奨。' },
  { when: (f) => f.st_symptom_correlation === '相関あり',
    text: 'ST変化と症状の相関あり。労作性/安静時狭心症の可能性、循環器紹介。' },

  // HRV
  { when: (f) => { const v = parseFloat(f.sdnn || 0); return v > 0 && v < 50; },
    text: 'SDNN <50 ms。自律神経障害・予後不良指標 (心不全・DM 心血管神経障害等)、基礎疾患精査。' },
  { when: (f) => { const v = parseFloat(f.sdnn || 0); return v >= 50 && v < 100; },
    text: 'SDNN 50-100 ms。中間域、他リスク因子と併せ判断。' },

  // QT
  { when: (f) => { const v = parseFloat(f.qtc_max || 0); return v > 0 && v > 480 && v <= 500; },
    text: 'QTc 480-500 ms。境界域延長、薬剤 (向精神薬・抗生剤・抗不整脈薬) と電解質 (K・Mg) 確認。' },
  { when: (f) => { const v = parseFloat(f.qtc_max || 0); return v > 500; },
    text: 'QTc >500 ms。torsades de pointes リスク、原因薬剤の中止・K/Mg 補正・循環器コンサルト。' },
  { when: (f) => f.qtc_prolongation === 'あり (torsades リスク)',
    text: 'QTc 500ms 超のエピソードあり。緊急に原因評価と対応。' },

  // ペースメーカー
  { when: (f) => { const v = parseFloat(f.pacing_percent_v || 0); return v > 40 && f.device === 'ペースメーカー (PPM)'; },
    text: 'V ペーシング率 >40%。ペーシング誘発性心機能低下 (Pacing-induced Cardiomyopathy) リスク、CRT アップグレードや設定変更検討。' },
  { when: (f) => f.undersensing === 'あり' || f.oversensing === 'あり' || f.failure_to_capture === 'あり',
    text: 'デバイスセンシング/キャプチャー異常あり。デバイスチェック (植込み施設) を速やかに実施。' },
  { when: (f) => f.icd_therapy === 'ショック実施' || f.icd_therapy === '不適切作動疑い',
    text: 'ICD ショック作動あり。適切/不適切の判別、原因評価、設定調整のため植込み施設へ紹介。' },

  // 診断的意義
  { when: (f) => f.diary_correlation === '症状時に不整脈なし' && (f.symptom || []).length > 0,
    text: '症状時に有意な不整脈記録なし。不整脈以外の原因 (起立性低血圧・血糖・過換気・精神症状等) を鑑別。' },
  { when: (f) => f.diary_correlation === '症状時に不整脈あり (相関)',
    text: '症状と不整脈の相関あり。病態を裏付ける所見、治療介入 (薬剤/アブレーション/デバイス) を検討。' },
];
