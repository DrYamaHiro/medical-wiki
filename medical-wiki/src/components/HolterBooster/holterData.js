// Holter Booster データ定義 (Philips ePatch レポート完全準拠、Phase 4)
// セクション順序を ePatch レポート紙面順に完全整列
// type: choice, multichoice, numeric, text
// normalRange: { min, max, note } または { byGender }
// defaultCollapsed: true — デフォルト折りたたみ (全セクションで有効化する場合は index 側で一括設定)

export const HOLTER_SECTIONS = [
  // ============================================================
  // 1. 患者情報 (ePatch: 患者情報 / 臨床医サマリー相当、最小限)
  // ============================================================
  {
    id: 'patient_info',
    title: '1. 患者情報 (ePatch: 患者情報 / 臨床医サマリー)',
    items: [
      { id: 'sex', label: '性別 (QTc正常値用)', type: 'choice', options: ['男性', '女性'] },
      { id: 'symptom', label: '主訴・依頼理由', type: 'multichoice', options: ['動悸', '失神・前失神', 'めまい・ふらつき', '胸痛・胸部不快', '不整脈フォロー', 'AF検出目的', 'ペースメーカー機能評価', '無症候性 (定期評価)'] },
      { id: 'diary_correlation', label: '症状記録シート/患者イベントとの相関', type: 'choice', options: ['未評価・記録なし', '症状時に不整脈あり (相関)', '症状時に不整脈なし', '一部相関'], hint: 'ePatch 用語: 「症状記録シート」= 紙の症状記入、「患者イベント」= 患者ボタン タップ回数' },
      { id: 'correlated_arrhythmias', label: '相関した不整脈 (相関ありの場合)', type: 'multichoice', options: ['PVC', 'SVPC', '洞頻脈', '洞徐脈', 'AF/AFL', 'SVT', 'VT', 'ポーズ', 'その他'] },
    ],
  },

  // ============================================================
  // 2. レポートサマリー (ePatch: 記録期間・解析時間・ノイズ割合・レポート作成日)
  // ============================================================
  {
    id: 'report_summary',
    title: '2. レポートサマリー (ePatch: 記録期間・解析時間・ノイズ・作成日)',
    items: [
      { id: 'record_start_date', label: '記録開始日', type: 'date', hint: 'カレンダーから選択' },
      { id: 'record_end_date', label: '記録終了日', type: 'date' },
      { id: 'record_duration', label: '記録時間 (日:時:分:秒)', type: 'duration', hint: 'ePatch レポートの「記録時間」欄をそのまま入力 (例: 5日 0時間 0分 0秒)' },
      { id: 'analyze_duration', label: '解析時間 (日:時:分:秒)', type: 'duration', hint: 'ePatch レポートの「解析時間」欄 (例: 4日 23時間 53分)' },
      { id: 'noise_percent', label: 'ノイズ割合', type: 'numeric', unit: '%', placeholder: '0.03', allowsTrace: true, normalRange: { min: 0, max: 30, note: '>30% で解析信頼性低下、微小所見は控えめに解釈' } },
      { id: 'report_date', label: 'レポート作成日 (解析日)', type: 'date', hint: '出力テキストの日付として使用' },
    ],
  },

  // ============================================================
  // 3. 心拍数 (ePatch: 最大 / 最小 / 平均 / 総心拍数) — 4項目 + 最大/最小の日時
  // ============================================================
  {
    id: 'heart_rate',
    title: '3. 心拍数 (ePatch: 最大 / 最小 / 平均 / 総心拍数)',
    items: [
      { id: 'hr_max', label: '最大心拍数', type: 'numeric', unit: 'bpm', placeholder: '157', normalRange: { min: 90, max: 190, note: '≥190bpm は緊急項目 (30秒以上持続で該当)' } },
      { id: 'hr_max_datetime', label: '　最大心拍数の日時', type: 'datetime', hint: 'ePatch: 代表ストリップは右カラム最上部に添付。カレンダー+時計から選択で「日X」自動表示' },
      { id: 'hr_min', label: '最小心拍数', type: 'numeric', unit: 'bpm', placeholder: '43', normalRange: { min: 35, max: 70, note: '<35bpm は緊急項目 (30秒以上持続で該当)' } },
      { id: 'hr_min_datetime', label: '　最小心拍数の日時', type: 'datetime', hint: 'ePatch: 代表ストリップは右カラムに添付' },
      { id: 'hr_mean', label: '平均心拍数', type: 'numeric', unit: 'bpm', placeholder: '73', normalRange: { min: 60, max: 90 } },
      { id: 'total_beats', label: '総心拍数', type: 'numeric', unit: '拍', placeholder: '529697' },
    ],
  },

  // ============================================================
  // 4a. 上室性期外収縮 (ePatch: 異所性 - 上室性期外収縮)
  // ============================================================
  {
    id: 'ectopic_spvc',
    title: '4a. 上室性期外収縮 (ePatch: 異所性)',
    items: [
      { id: 'spvc_total', label: '上室性期外収縮 総数', type: 'numeric', unit: '個', placeholder: '4665' },
      { id: 'spvc_percent', label: '上室性期外収縮 出現率', type: 'numeric', unit: '%', placeholder: '0.88', allowsTrace: true },
      { id: 'spvc_single', label: '　内 単発', type: 'numeric', unit: '個', placeholder: '4321' },
      { id: 'spvc_couplet', label: '　内 二連発', type: 'numeric', unit: '個', placeholder: '79' },
    ],
  },

  // ============================================================
  // 4b. 心室性期外収縮 (ePatch: 異所性 - 心室性期外収縮)
  // ============================================================
  {
    id: 'ectopic_pvc',
    title: '4b. 心室性期外収縮 (ePatch: 異所性)',
    items: [
      { id: 'pvc_total', label: '心室性期外収縮 総数', type: 'numeric', unit: '個', placeholder: '22182' },
      { id: 'pvc_percent', label: '心室性期外収縮 出現率', type: 'numeric', unit: '%', placeholder: '4.19', allowsTrace: true, normalRange: { min: 0, max: 1, note: '<1%正常域、10%以上でPVC心筋症リスク' } },
      { id: 'pvc_single', label: '　内 単発', type: 'numeric', unit: '個', placeholder: '19828' },
      { id: 'pvc_forms', label: '　形態数', type: 'numeric', unit: '種', placeholder: '9', normalRange: { min: 0, max: 1, note: '2以上で多形性 → 器質性疾患精査検討' } },
      { id: 'pvc_couplet', label: '　内 二連発', type: 'numeric', unit: '個', placeholder: '1084' },
      { id: 'pvc_bigeminy', label: '　内 二段脈', type: 'numeric', unit: '個', placeholder: '776' },
      { id: 'pvc_trigeminy', label: '　内 三段脈', type: 'numeric', unit: '個', placeholder: '347' },
    ],
  },

  // ============================================================
  // 5a. 患者イベント (ePatch: 患者イベント)
  // ============================================================
  {
    id: 'patient_events',
    title: '5a. 患者イベント (ePatch: 症状時タップ回数)',
    items: [
      { id: 'patient_events_count', label: '患者イベント数 (タップ回数)', type: 'numeric', unit: '回', placeholder: '3', hint: 'ePatch: 症状時タップ数、症状記録シート記載のみは含まず' },
    ],
  },

  // ============================================================
  // 5b. ペーシングによる拍動 (ePatch: ペーシングされた拍動)
  // ============================================================
  {
    id: 'pacing_events',
    title: '5b. ペーシングによる拍動 (ePatch: PM 拍動数)',
    items: [
      { id: 'pacing_beats_count', label: 'ペーシング拍動数', type: 'numeric', unit: '拍', placeholder: '', hint: 'ePatch は現在非表示扱い (機能不全評価は 22. PM 機能セクション参照)' },
    ],
  },

  // ============================================================
  // 6. CVHRI (ePatch: 睡眠時周期性心拍変動指数 — 上位配置)
  // ============================================================
  {
    id: 'cvhri',
    title: '6. CVHRI (ePatch: 睡眠時周期性心拍変動指数)',
    items: [
      { id: 'cvhri_mean', label: 'CVHRI 平均 (夜間 23-6時)', type: 'numeric', placeholder: '26', normalRange: { min: 0, max: 15, note: 'ePatch 明示: ≥15 で OSA 疑い → 簡易 PSG 早期実施推奨' } },
      { id: 'cvhri_max', label: 'CVHRI 最大', type: 'numeric', placeholder: '41' },
      { id: 'cvhri_max_date', label: 'CVHRI 最大の日付', type: 'date' },
    ],
  },

  // ============================================================
  // 7. 心房細動/粗動 (ePatch: エピソード枠1)
  // ============================================================
  {
    id: 'episode_af',
    title: '7. 心房細動/粗動 (ePatch: 右カラム上部・代表ストリップ付き)',
    sectionGate: { itemId: 'af_present', absentValues: ['なし'] },
    items: [
      { id: 'af_present', label: 'AF/AFL', type: 'choice', options: ['なし', 'あり (発作性)', 'あり (持続性)'], hint: '「なし」で下記詳細は入力不要' },
      { id: 'af_burden_percent', label: 'AF/AFL 割合', type: 'numeric', unit: '%', placeholder: '8.75', allowsTrace: true },
      { id: 'af_longest_duration', label: '最長エピソード持続', type: 'text', placeholder: '例: 10時間29分' },
      { id: 'af_longest_time', label: '最長エピソード発生日時', type: 'datetime' },
      { id: 'af_max_hr', label: '最大心拍数 (AF/AFL中)', type: 'numeric', unit: 'bpm', placeholder: '157' },
      { id: 'aflutter_present', label: '心房粗動 (AFL) 単独確認', type: 'choice', options: ['なし', 'あり'] },
    ],
  },

  // ============================================================
  // 8. その他の上室性頻拍 (ePatch: エピソード枠2)
  // ============================================================
  {
    id: 'episode_svt_other',
    title: '8. その他の上室性頻拍 (ePatch: 右カラム・代表ストリップ付き)',
    sectionGate: { itemId: 'svt_other_present', absentValues: ['なし'] },
    items: [
      { id: 'svt_other_present', label: 'その他の上室性頻拍', type: 'choice', options: ['なし', 'あり'], hint: '「なし」で下記詳細は入力不要' },
      { id: 'svt_other_episodes', label: 'エピソード数 (3連発以上)', type: 'numeric', unit: '回', placeholder: '38' },
      { id: 'svt_max_beats', label: '最長連発数', type: 'numeric', unit: '拍', placeholder: '16', normalRange: { min: 0, max: 14, note: '15拍以上は臨床的意義あり、QRS 幅で AT/SVT vs Wide QRS 鑑別' } },
      { id: 'svt_max_hr', label: '最大心拍数', type: 'numeric', unit: 'bpm', placeholder: '159' },
      { id: 'svt_longest_time', label: '最長エピソード発生日時', type: 'datetime' },
    ],
  },

  // ============================================================
  // 9. ポーズ (ePatch: エピソード枠3)
  // ============================================================
  {
    id: 'episode_pause',
    title: '9. ポーズ (ePatch: 右カラム・代表ストリップ付き)',
    sectionGate: { itemId: 'pause_present', absentValues: ['なし'] },
    items: [
      { id: 'pause_present', label: 'ポーズ (2.5秒以上)', type: 'choice', options: ['なし', 'あり'], hint: '「なし」で下記詳細は入力不要' },
      { id: 'pause_count', label: 'ポーズ回数 (2.5秒以上)', type: 'numeric', unit: '回', placeholder: '1' },
      { id: 'pause_max_sec', label: '最長R-R間隔', type: 'numeric', unit: '秒', placeholder: '2.538', normalRange: { min: 0, max: 3.0, note: '≥3秒はメール連絡項目 (覚醒 or 症状伴えば PM 検討)' } },
      { id: 'pause_max_time', label: '最長発生日時', type: 'datetime' },
    ],
  },

  // ============================================================
  // 10. 房室ブロック (ePatch: エピソード枠4) — avb_type 自体が「なし」オプション込み
  // ============================================================
  {
    id: 'episode_avb',
    title: '10. 房室ブロック (ePatch: 右カラム・代表ストリップ付き、最重症を1件)',
    items: [
      { id: 'avb_type', label: 'AVブロック 最重症種類', type: 'choice', options: ['なし', '1度', '2度 Mobitz I (Wenckebach)', '2:1', '2度 Mobitz II', '高度', '完全 (3度)'] },
    ],
  },

  // ============================================================
  // 11. 心室調律 (ePatch: エピソード枠5)
  // ============================================================
  {
    id: 'episode_vent_rhythm',
    title: '11. 心室調律 (ePatch: 右カラム下部・代表ストリップ付き、VT + AIVR)',
    sectionGate: { itemId: 'vent_rhythm_present', absentValues: ['なし'] },
    items: [
      { id: 'vent_rhythm_present', label: '心室調律 (VT+AIVR)', type: 'choice', options: ['なし', 'あり'], hint: '「なし」で下記詳細は入力不要' },
      { id: 'vent_rhythm_episodes', label: '総エピソード数 (VT+AIVR)', type: 'numeric', unit: '回', placeholder: '56', hint: '平均HR40以上・3連発以上' },
      { id: 'vt_episodes', label: '　内 VT (平均HR≥100)', type: 'numeric', unit: '回', placeholder: '50' },
      { id: 'vt_longest_beats', label: '　VT 最長連発数', type: 'numeric', unit: '拍', placeholder: '10' },
      { id: 'vt_fastest_hr', label: '　VT 最速レート', type: 'numeric', unit: 'bpm', placeholder: '158' },
      { id: 'aivr_episodes', label: '　内 AIVR (平均HR<100)', type: 'numeric', unit: '回', placeholder: '6' },
      { id: 'aivr_longest_beats', label: '　AIVR 最長連発数', type: 'numeric', unit: '拍', placeholder: '6' },
      { id: 'aivr_fastest_hr', label: '　AIVR 最速レート', type: 'numeric', unit: 'bpm', placeholder: '98' },
    ],
  },

  // ============================================================
  // 12. 所見 (ePatch: エピソード5枠の下の所見欄) — 基本調律・陽性所見15・詳細所見17 を統合
  // sub_header 型の item で内部を 3 ブロックに視覚区切り
  // ============================================================
  {
    id: 'findings',
    title: '12. 所見 (ePatch: エピソード5枠の下・所見欄) — 基本調律 + 陽性所見15 + 詳細所見17',
    items: [
      { id: 'sub_basic_rhythm', type: 'sub_header', label: '(1) 基本調律' },
      { id: 'find_sinus_rhythm', label: '洞調律 (Sinus rhythm)', type: 'choice', options: ['なし', 'あり'], hint: 'ePatch (+) 相当' },
      { id: 'find_sinus_tachycardia', label: '洞頻脈 (Sinus tachycardia)', type: 'choice', options: ['なし', 'あり'], hint: 'ePatch (+) 相当、最大HR + 時刻を要記載' },
      { id: 'find_sinus_bradycardia', label: '洞徐脈 (Sinus bradycardia)', type: 'choice', options: ['なし', 'あり'], hint: 'ePatch (+) 相当、最小HR + 時刻を要記載' },

      { id: 'sub_common15', type: 'sub_header', label: '(2) 陽性所見 — よく使う15項目 (ePatch: 緊急項目/該当項目 (+))' },
      { id: 'find_af', label: '心房細動/粗動 Paroxysmal AF/AFL', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_svt_other', label: 'その他の上室性頻拍 SVT', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_pause', label: 'ポーズ Pause (2.5秒以上)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_avb1', label: '1度房室ブロック', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_avb2_mobitz1', label: '2度AVブロック Mobitz I (Wenckebach)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_avb2_mobitz2', label: '2度AVブロック Mobitz II', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_avb3', label: '完全房室ブロック (3度)', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_vt', label: '心室頻拍 VT (PVC 4連発以上)', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_pvc', label: '心室性期外収縮 PVC', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_pvc_couplet', label: '心室性二連発 PVC Couplet', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_ront', label: 'R on T', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_st_variation', label: 'ST 変動', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_pm_failure', label: 'ペースメーカー機能不全', type: 'choice', options: ['該当なし (デバイスなし)', 'なし', 'あり'], emergency: true },
      { id: 'find_tachy_190', label: '頻脈 190bpm 以上が 30秒以上持続', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_brady_35', label: '徐脈 35bpm 未満が 30秒以上持続', type: 'choice', options: ['なし', 'あり'], emergency: true },

      { id: 'sub_detail17', type: 'sub_header', label: '(3) 詳細所見 — 追加17項目 (ePatch: その他解析項目 (+))' },
      { id: 'find_non_conducted_spvc', label: '非伝導性上室性期外収縮', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_aberrant', label: '変行伝導', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_wandering_pm', label: '移動性ペースメーカー', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_sa_block', label: '洞房ブロック', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_avb_2_1', label: '2:1房室ブロック', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_avb_high', label: '高度房室ブロック', type: 'choice', options: ['なし', 'あり'], emergency: true },
      { id: 'find_delta', label: 'Δ波 (WPW 症候群)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_delta_intermittent', label: '間歇性 Δ波', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_t_inversion', label: 'T 波陰転化', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_junctional', label: '接合部調律', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_junctional_escape', label: '接合部補充収縮', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_junctional_escape_rhythm', label: '接合部補充調律', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_junctional_accelerated', label: '促進性接合部調律', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_atrial_escape', label: '心房補充収縮', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_atrial_escape_rhythm', label: '心房補充調律', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_aivr_positive', label: '促進性心室固有調律 (AIVR)', type: 'choice', options: ['なし', 'あり'] },
      { id: 'find_ivcd', label: '心室内伝導遅延', type: 'choice', options: ['なし', 'あり'] },
    ],
  },

  // ============================================================
  // 15. ST 変動詳細 (ePatch: 所見欄 ST variation)
  // ============================================================
  {
    id: 'st',
    title: '13. ST 変動詳細 (ePatch: 所見の続き - ST variation)',
    sectionGate: { itemId: 'st_present', absentValues: ['なし'] },
    items: [
      { id: 'st_present', label: 'ST 変動の有無', type: 'choice', options: ['なし', 'あり (下記に詳細)', '未評価'], hint: '「なし」で下記詳細は入力不要' },
      { id: 'st_depression_max', label: 'ST 低下 最大値', type: 'numeric', unit: 'mm', placeholder: '0', normalRange: { min: 0, max: 1.0, note: 'ePatch: ≥1mm 30秒以上 (upslope 型は2mm以上) で有意' } },
      { id: 'st_depression_duration', label: 'ST 低下 総持続時間', type: 'numeric', unit: '分', placeholder: '0' },
      { id: 'st_elevation_max', label: 'ST 上昇 最大値', type: 'numeric', unit: 'mm', placeholder: '0', normalRange: { min: 0, max: 2.0, note: 'ePatch: ≥2mm 30秒以上で有意 (冠攣縮・心外膜炎鑑別)' } },
      { id: 'st_symptom_correlation', label: 'ST変化と症状の相関', type: 'choice', options: ['未評価', '相関あり', '相関なし', '一部相関', 'ST変化なし'] },
      { id: 'st_max_time', label: '最大 ST 変動の日時', type: 'datetime' },
    ],
  },

  // ============================================================
  // 16. 日次負荷サマリー (ePatch: 日次心拍数 + 日次負荷サマリー)
  // ============================================================
  // ※ 動的行数のため、UI 側の dailyBurden state を使用。
  //   ここでは placeholder として空の items 配列を持つカードとして扱う。
  {
    id: 'daily_burden',
    title: '15. 日次負荷サマリー (ePatch: 日次心拍数 + 日次負荷)',
    items: [
      // 動的テーブルは index.jsx 側で描画。この配列は空でよいが、
      // renderer が items.map するので何か少なくとも 1 個ダミーは不要 (0件でOK)。
    ],
  },

  // ============================================================
  // 17. 心拍数の傾向 (ePatch: 心拍数トレンド — 徐脈/頻脈エピソード + 昼夜HR)
  // ============================================================
  {
    id: 'heart_rate_trend',
    title: '14. 心拍数の傾向 (ePatch: 徐脈/頻脈エピソード + 昼夜HR、トレンドチャート要旨)',
    items: [
      { id: 'brady_episodes', label: '徐脈エピソード数', type: 'numeric', unit: '回', placeholder: '0', hint: 'ePatch: 50bpm未満が10拍連続 (小児は年齢別閾値)' },
      { id: 'tachy_episodes', label: '頻脈エピソード数', type: 'numeric', unit: '回', placeholder: '0', hint: 'ePatch: 100bpm超が10拍連続' },
      { id: 'hr_day_mean', label: '昼間平均HR (6-22時)', type: 'numeric', unit: 'bpm', placeholder: '80', hint: '任意、昼夜較差評価に使用' },
      { id: 'hr_night_mean', label: '夜間平均HR (22-6時)', type: 'numeric', unit: 'bpm', placeholder: '60', hint: '任意、昼夜較差評価に使用' },
    ],
  },

  // ============================================================
  // 18. 心拍数変動 HRV (ePatch: 心拍数変動 時間/周波数領域解析)
  // ============================================================
  {
    id: 'hrv',
    title: '18. 心拍数変動 HRV (ePatch: 心拍数変動 時間/周波数領域解析)',
    items: [
      { id: 'sdnn', label: 'SDNN', type: 'numeric', unit: 'ms', placeholder: '204', normalRange: { min: 100, max: 300, note: '<50ms 予後不良指標' } },
      { id: 'sdann', label: 'SDANN', type: 'numeric', unit: 'ms', placeholder: '184' },
      { id: 'asdnn', label: 'ASDNN (5分間 SDNN の平均)', type: 'numeric', unit: 'ms', placeholder: '87' },
      { id: 'nn50', label: 'NN50 (>50ms 変化した NN 数)', type: 'numeric', unit: '回', placeholder: '51626' },
      { id: 'pnn50', label: 'pNN50', type: 'numeric', unit: '%', placeholder: '12.37' },
      { id: 'rmssd', label: 'RMSSD', type: 'numeric', unit: 'ms', placeholder: '74' },
      { id: 'vlf', label: 'VLF', type: 'numeric', unit: 'ms²', placeholder: '6463' },
      { id: 'lf', label: 'LF', type: 'numeric', unit: 'ms²', placeholder: '3646' },
      { id: 'hf', label: 'HF', type: 'numeric', unit: 'ms²', placeholder: '857' },
    ],
  },

  // ============================================================
  // 18. QT / QTc (ePatch: QT間隔解析 Bazett 補正 男450/女460)
  // ============================================================
  {
    id: 'qt',
    title: '19. QT / QTc (ePatch: QT間隔解析 Bazett 男450 / 女460ms)',
    items: [
      { id: 'qt_min', label: '最小 QT間隔', type: 'numeric', unit: 'ms', placeholder: '330' },
      { id: 'qt_mean', label: '平均 QT間隔', type: 'numeric', unit: 'ms', placeholder: '388' },
      { id: 'qt_max', label: '最大 QT間隔', type: 'numeric', unit: 'ms', placeholder: '459' },
      { id: 'qtc_min', label: '最小補正QT間隔 (Bazett)', type: 'numeric', unit: 'ms', placeholder: '392' },
      { id: 'qtc_mean', label: '平均補正QT間隔 (Bazett)', type: 'numeric', unit: 'ms', placeholder: '423' },
      { id: 'qtc_max', label: '最大補正QT間隔 (Bazett)', type: 'numeric', unit: 'ms', placeholder: '467', normalRange: { byGender: { male: { min: 0, max: 450 }, female: { min: 0, max: 460 } }, note: 'ePatch: 男450/女460ms、>500ms で torsades リスク' } },
      { id: 'qtc_over450_percent', label: '補正QT間隔 >450ms 割合', type: 'numeric', unit: '%', placeholder: '13.70', normalRange: { min: 0, max: 10, note: '>10% で時間依存性 QT 延長の可能性' } },
      { id: 'qtc_day_mean', label: '昼間 (6-22時) 平均 QTc', type: 'numeric', unit: 'ms', placeholder: '415', hint: '任意、時間帯別評価用' },
      { id: 'qtc_night_mean', label: '夜間 (22-6時) 平均 QTc', type: 'numeric', unit: 'ms', placeholder: '440', hint: '任意、時間帯別評価用' },
      { id: 'qtc_night_max', label: '夜間 最大 QTc', type: 'numeric', unit: 'ms', placeholder: '467', hint: '夜間 QT 延長・torsades ハイリスク時間帯評価' },
      { id: 'qtc_over500_time', label: 'QTc >500ms 発生時間帯', type: 'text', placeholder: '例: 03:00-04:30 (夜間)' },
    ],
  },

  // ============================================================
  // 19. 心室形態解析 (ePatch: 心室形態解析)
  // ============================================================
  {
    id: 'pvc_morphology',
    title: '16. 心室形態解析 (ePatch: PVC 形態解析、主要形態1-9)',
    items: [
      { id: 'pvc_morph1_beats', label: '形態1 拍動数', type: 'numeric', unit: '個', placeholder: '12796' },
      { id: 'pvc_morph1_percent', label: '形態1 割合', type: 'numeric', unit: '%', placeholder: '57.63', hint: '≥80% で単一起源優位、アブレーション適応検討材料' },
      { id: 'pvc_morph2_beats', label: '形態2 拍動数', type: 'numeric', unit: '個', placeholder: '4551' },
      { id: 'pvc_morph2_percent', label: '形態2 割合', type: 'numeric', unit: '%', placeholder: '20.50' },
      { id: 'pvc_morph3_beats', label: '形態3 拍動数', type: 'numeric', unit: '個', placeholder: '1487' },
      { id: 'pvc_morph3_percent', label: '形態3 割合', type: 'numeric', unit: '%', placeholder: '6.70' },
      { id: 'pvc_morph4_beats', label: '形態4 拍動数', type: 'numeric', unit: '個', placeholder: '1318' },
      { id: 'pvc_morph4_percent', label: '形態4 割合', type: 'numeric', unit: '%', placeholder: '5.94' },
      { id: 'pvc_morph5_beats', label: '形態5 拍動数', type: 'numeric', unit: '個', placeholder: '821' },
      { id: 'pvc_morph5_percent', label: '形態5 割合', type: 'numeric', unit: '%', placeholder: '3.70' },
      { id: 'pvc_morph6_beats', label: '形態6 拍動数', type: 'numeric', unit: '個', placeholder: '725' },
      { id: 'pvc_morph6_percent', label: '形態6 割合', type: 'numeric', unit: '%', placeholder: '3.27' },
      { id: 'pvc_morph7_beats', label: '形態7 拍動数', type: 'numeric', unit: '個', placeholder: '464' },
      { id: 'pvc_morph7_percent', label: '形態7 割合', type: 'numeric', unit: '%', placeholder: '2.09' },
      { id: 'pvc_morph8_beats', label: '形態8 拍動数', type: 'numeric', unit: '個', placeholder: '38' },
      { id: 'pvc_morph8_percent', label: '形態8 割合', type: 'numeric', unit: '%', placeholder: '0.17' },
      { id: 'pvc_morph9_beats', label: '形態9 拍動数', type: 'numeric', unit: '個', placeholder: '2' },
      { id: 'pvc_morph9_percent', label: '形態9 割合', type: 'numeric', unit: '%', placeholder: '<0.01' },
      { id: 'pvc_morph_ecg_channel', label: '記載チャンネル・その他所見', type: 'text', placeholder: '例: ECG1/2 で右室流出路型示唆' },
    ],
  },

  // ============================================================
  // 20. 症状 × 不整脈 クロス集計 (ePatch: 患者の症状 バーグラフ)
  // ============================================================
  // ※ 特殊 UI (マトリクス)、items は空、UI 側 symptomMatrix state で管理
  {
    id: 'symptom_matrix',
    title: '17. 症状 × 不整脈 クロス集計 (ePatch: 患者の症状)',
    items: [],
  },

  // ============================================================
  // 21. ペースメーカー機能評価 (ePatch: PM 機能不全評価)
  // ============================================================
  {
    id: 'pacemaker_func',
    title: '20. ペースメーカー機能評価 (植込例のみ)',
    items: [
      { id: 'device_type', label: 'デバイス種別', type: 'choice', options: ['なし', 'PPM', 'ICD', 'CRT-P/D'] },
      { id: 'pacing_percent_a', label: '心房 (A) ペーシング率', type: 'numeric', unit: '%', placeholder: '30' },
      { id: 'pacing_percent_v', label: '心室 (V) ペーシング率', type: 'numeric', unit: '%', placeholder: '5', normalRange: { min: 0, max: 40, note: 'CRT 以外で >40% は Pacing-induced Cardiomyopathy リスク' } },
      { id: 'icd_therapy', label: 'ICD 作動 (該当時)', type: 'choice', options: ['なし', 'ATP のみ', 'ショック実施', '不適切作動疑い'] },
    ],
  },
];

// アセスメント自動生成ルール (3段階分類: emergency / workup / reference)
// sectionId: クリック時にスクロール/展開する対象セクション (Phase 4 新セクションIDに更新)
export const HOLTER_ASSESSMENT_RULES = [
  // 【緊急】ePatch メール連絡項目相当
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_avb2_mobitz2 === 'あり',
    text: '2度AVブロック Mobitz II 型あり (メール連絡項目)。PM 適応 (JCS クラス I)、循環器紹介。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_avb_high === 'あり' || f.avb_type === '高度',
    text: '高度房室ブロックあり (メール連絡項目)。PM 適応、循環器紹介。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_avb3 === 'あり' || f.avb_type === '完全 (3度)',
    text: '完全房室ブロック (3度) あり (メール連絡項目)。PM 適応 (クラス I)、緊急対応要否評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_vt === 'あり' || parseFloat(f.vt_longest_beats || 0) >= 4,
    text: '心室頻拍 (VT / PVC 4連発以上) あり (メール連絡項目)。循環器紹介、原因精査 (虚血・心筋症)、ICD 適応評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_ront === 'あり',
    text: 'R on T 現象あり (メール連絡項目)。torsades / VF リスク、QT・電解質 (K/Mg)・薬剤確認。' },
  { level: 'emergency', sectionId: 'episode_pause', when: (f) => { const v = parseFloat(f.pause_max_sec || 0); return v >= 3.0; },
    text: 'ポーズ ≥3秒あり (メール連絡項目)。覚醒帯 or 症状伴えば PM 適応 (JCS クラス I)、無症候・睡眠中は迷走神経性か個別評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_pause === 'あり' && f.diary_correlation === '症状時に不整脈あり (相関)',
    text: 'ポーズと症状の相関あり。無症候であっても再検・PM 適応を積極評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_af === 'あり' && f.af_present !== 'あり (発作性)' && f.af_present !== 'あり (持続性)' && !f.af_present,
    text: '新規 AF 検出の可能性 (メール連絡項目)。CHA₂DS₂-VASc に基づく抗凝固検討、心エコー・甲状腺評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_pm_failure === 'あり',
    text: 'ペースメーカー機能不全 (メール連絡項目)。植込み施設へ速やかにコンサルト。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_tachy_190 === 'あり',
    text: '190bpm 以上の頻脈が 30秒以上持続 (メール連絡項目)。原因検索 (SVT/VT/AF fast) と緊急対応要否評価。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => f.find_brady_35 === 'あり',
    text: '35bpm 未満の徐脈が 30秒以上持続 (メール連絡項目)。SSS・薬剤性徐脈評価、PM 適応検討。' },
  { level: 'emergency', sectionId: 'patient_info', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('失神・前失神'),
    text: '主訴に失神あり (メール連絡項目対象)。有意所見なくても長時間モニタリング / ILR / チルト試験等の追加検討。' },
  { level: 'emergency', sectionId: 'qt', when: (f) => { const v = parseFloat(f.qtc_max || 0); return v > 500; },
    text: 'QTc >500ms。torsades リスク、原因薬剤中止・K/Mg 補正・循環器コンサルト。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('失神・前失神') && (f.find_pause === 'あり' || f.find_avb3 === 'あり' || f.find_avb2_mobitz2 === 'あり' || f.find_avb_high === 'あり' || parseFloat(f.pause_max_sec || 0) >= 2.0),
    text: '失神主訴 + 徐脈系不整脈 (ポーズ/高度AVB) あり。症候性徐脈として即時 PM 適応評価、緊急循環器コンサルト。' },
  { level: 'emergency', sectionId: 'findings', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('失神・前失神') && (f.find_vt === 'あり' || f.find_ront === 'あり' || parseFloat(f.vt_longest_beats || 0) >= 4),
    text: '失神主訴 + 心室性不整脈 (VT/RonT) あり。症候性 VT として ICD 適応評価、緊急循環器コンサルト。' },
  { level: 'emergency', sectionId: 'symptom_matrix', when: (f) => f.diary_correlation === '症状時に不整脈あり (相関)' && Array.isArray(f.correlated_arrhythmias) && (f.correlated_arrhythmias.includes('VT') || f.correlated_arrhythmias.includes('ポーズ') || f.correlated_arrhythmias.includes('AF/AFL')),
    text: '症状と重篤不整脈 (VT/ポーズ/AF) の直接相関あり。原因治療を優先的に検討 (抗不整脈薬・アブレーション・PM/ICD)。' },

  // 【要精査】追加評価・治療介入検討
  { level: 'workup', sectionId: 'cvhri', when: (f) => { const v = parseFloat(f.cvhri_mean || 0); return v >= 15; },
    text: 'CVHRI 平均 ≥15 (ePatch 明示的推奨)。閉塞性睡眠時無呼吸 (OSA) 疑い、簡易 PSG 早期実施 or STOP-BANG 併用推奨。' },
  { level: 'workup', sectionId: 'cvhri', when: (f) => { const v = parseFloat(f.cvhri_mean || 0); return v >= 10 && v < 15; },
    text: 'CVHRI 平均 10-14 (境界域)。OSA 疑い症状 (いびき・日中眠気・肥満) あれば STOP-BANG / 簡易 PSG 併用検討。' },
  { level: 'workup', sectionId: 'ectopic_pvc', when: (f) => { const v = parseFloat(f.pvc_percent || 0); return v >= 10 && v < 20; },
    text: 'PVC 出現率 10-19%。PVC 誘発性心筋症リスクあり、心エコー LV 機能評価推奨。' },
  { level: 'workup', sectionId: 'ectopic_pvc', when: (f) => { const v = parseFloat(f.pvc_percent || 0); return v >= 20; },
    text: 'PVC 出現率 ≥20%。PVC 誘発性心筋症を強く疑う、循環器紹介・アブレーション検討。' },
  { level: 'workup', sectionId: 'ectopic_pvc', when: (f) => { const v = parseFloat(f.pvc_forms || 0); return v >= 2; },
    text: 'PVC 多形性 (2形態以上)。器質的心疾患・電解質異常・虚血の除外評価推奨。' },
  { level: 'workup', sectionId: 'episode_af', when: (f) => f.find_af === 'あり' || (f.af_present && f.af_present !== 'なし'),
    text: '心房細動を認める。CHA₂DS₂-VASc に基づく抗凝固検討、心拍数コントロール、原因精査 (心エコー・甲状腺)。' },
  { level: 'workup', sectionId: 'episode_af', when: (f) => { const v = parseFloat(f.af_burden_percent || 0); return v >= 5; },
    text: 'AF burden ≥5%。臨床的 AF に相当、抗凝固適応をより積極的に検討。' },
  { level: 'workup', sectionId: 'st', when: (f) => { const v = parseFloat(f.st_depression_max || 0); return v >= 1 && v < 2; },
    text: 'ST 低下 1-2mm あり。虚血の可能性、症状相関確認・負荷試験検討。' },
  { level: 'workup', sectionId: 'st', when: (f) => { const v = parseFloat(f.st_depression_max || 0); return v >= 2; },
    text: 'ST 低下 ≥2mm あり。虚血性心疾患を疑う、冠動脈評価 (CTA / CAG) 推奨。' },
  { level: 'workup', sectionId: 'st', when: (f) => f.find_st_variation === 'あり' && f.st_symptom_correlation === '相関あり',
    text: 'ST変動と症状の相関あり。労作性/安静時狭心症の可能性、循環器紹介。' },
  { level: 'workup', sectionId: 'st', when: (f) => { const dur = parseFloat(f.st_depression_duration || 0); return dur >= 60; },
    text: 'ST 低下 総持続時間 ≥60分。慢性心筋虚血・多発発作の可能性、冠動脈評価と抗虚血薬強化検討。' },
  { level: 'workup', sectionId: 'episode_svt_other', when: (f) => { const v = parseFloat(f.svt_max_beats || 0); return v >= 15; },
    text: '上室性頻拍 15拍以上の連発。持続時間・QRS 幅による AT / SVT / Wide QRS 鑑別、頻脈原疾患精査。' },
  { level: 'workup', sectionId: 'heart_rate', when: (f) => { const v = parseFloat(f.hr_min || 0); return v > 0 && v < 40; },
    text: '最小心拍数 <40 bpm。時刻 (睡眠中 or 覚醒) と症状相関を確認、洞機能不全 (SSS) 疑い評価。' },
  { level: 'workup', sectionId: 'qt', when: (f) => { const v = parseFloat(f.qtc_max || 0); return v > 480 && v <= 500; },
    text: 'QTc 480-500ms。境界域延長、薬剤 (向精神薬・抗生剤・抗不整脈薬)・電解質 (K/Mg) 確認。' },
  { level: 'workup', sectionId: 'qt', when: (f) => { const v = parseFloat(f.qtc_over450_percent || 0); return v > 10; },
    text: 'QTc >450ms 割合 >10%。時間依存性 QT 延長、薬剤・自律神経・虚血影響評価。' },
  { level: 'workup', sectionId: 'qt', when: (f) => {
      const day = parseFloat(f.qtc_day_mean || 0); const night = parseFloat(f.qtc_night_mean || 0);
      return day > 0 && night > 0 && (night - day) >= 30;
    },
    text: '夜間 QTc が昼間より 30ms以上延長。夜間依存性 QT 延長 (迷走神経性 / 徐脈依存性)、torsades ハイリスク時間帯。' },
  { level: 'workup', sectionId: 'qt', when: (f) => {
      const nightMax = parseFloat(f.qtc_night_max || 0); const day = parseFloat(f.qtc_day_mean || 0);
      return nightMax >= 480 && day > 0 && day < 450;
    },
    text: '夜間最大 QTc ≥480ms かつ昼間 <450ms。昼間正常・夜間延長パターン、薬剤 (夜服用) と徐脈時 QT 動態を確認。' },
  { level: 'workup', sectionId: 'findings', when: (f) => f.find_delta === 'あり' || f.find_delta_intermittent === 'あり',
    text: 'Δ波あり (WPW 症候群疑い)。頻脈発作歴・QRS 幅・偽性 VT との鑑別評価、循環器紹介検討。' },
  { level: 'workup', sectionId: 'episode_avb', when: (f) => f.avb_type === '2:1',
    text: '2:1 房室ブロックあり。Mobitz I / II の判別必要 (PR 進行観察)、症候性なら PM 適応検討。' },
  { level: 'workup', sectionId: 'findings', when: (f) => f.find_sa_block === 'あり',
    text: '洞房ブロックあり。SSS スペクトラム内、症状相関で PM 適応評価。' },
  { level: 'workup', sectionId: 'ectopic_spvc', when: (f) => { const v = parseFloat(f.spvc_total || 0); return v >= 300 && v < 1000; },
    text: 'SVPC ≥300個/日。AF 発症予測因子、定期フォロー (年 1-2回) と生活習慣・血圧・甲状腺評価。' },
  { level: 'workup', sectionId: 'ectopic_spvc', when: (f) => { const v = parseFloat(f.spvc_total || 0); return v >= 1000; },
    text: 'SVPC ≥1000個/日 (frequent SVPC)。AF 発症高リスク、抗凝固の必要性は CHA2DS2-VASc と個別判断。' },
  { level: 'workup', sectionId: 'ectopic_spvc', when: (f) => { const v = parseFloat(f.spvc_couplet || 0); return v >= 10; },
    text: 'SVPC 二連発 ≥10 回。AF 発症予測因子、経過フォロー強化。' },
  { level: 'workup', sectionId: 'episode_vent_rhythm', when: (f) => { const v = parseFloat(f.vent_rhythm_episodes || 0); return v >= 10; },
    text: '心室調律 (VT+AIVR) 総エピソード ≥10 回。頻回 NSVT、器質的心疾患精査 (心エコー・冠動脈評価) を積極検討。' },
  { level: 'workup', sectionId: 'ectopic_pvc', when: (f) => { const bg = parseFloat(f.pvc_bigeminy || 0); const tg = parseFloat(f.pvc_trigeminy || 0); return (bg + tg) >= 500; },
    text: 'PVC 二段脈+三段脈 合計 ≥500。PVC 負荷高値、LV 機能フォロー (心エコー) 推奨。' },
  { level: 'workup', sectionId: 'pvc_morphology', when: (f) => { const p1 = parseFloat(f.pvc_morph1_percent || 0); const total = parseFloat(f.pvc_total || 0); return p1 >= 80 && total >= 5000; },
    text: 'PVC 主要形態1 が ≥80% を占める + PVC 総数多い。単一起源 PVC の可能性、アブレーション適応検討材料。' },
  { level: 'workup', sectionId: 'ectopic_pvc', when: (f) => { const forms = parseFloat(f.pvc_forms || 0); return forms >= 5; },
    text: 'PVC 形態数 ≥5 種。多形性顕著、器質的心疾患・電解質異常・虚血の除外精査を強化。' },
  { level: 'workup', sectionId: 'heart_rate', when: (f) => {
      const day = parseFloat(f.hr_day_mean || 0); const night = parseFloat(f.hr_night_mean || 0);
      return day > 0 && night > 0 && (day - night) < 10;
    },
    text: '昼夜 HR 較差 <10 bpm (自律神経障害示唆)。DM 心血管神経障害・重症心不全・薬剤性 (β遮断薬過剰) 評価。' },
  { level: 'workup', sectionId: 'patient_info', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('AF検出目的') && f.find_af !== 'あり' && (!f.af_present || f.af_present === 'なし'),
    text: 'AF 検出目的の依頼で今回 AF 未検出。症状時記録の欠落・発作性 AF の可能性、長期モニタリング (ILR / 再ホルター) 検討。' },
  { level: 'workup', sectionId: 'symptom_matrix', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('動悸') && f.diary_correlation === '症状時に不整脈あり (相関)' && Array.isArray(f.correlated_arrhythmias) && f.correlated_arrhythmias.length > 0,
    text: '動悸と不整脈の相関あり (相関した不整脈欄参照)。頻回・持続例では治療介入 (β遮断薬・アブレーション等) 検討。' },
  { level: 'workup', sectionId: 'symptom_matrix', when: (f) => {
      if (!f.symptom_matrix || typeof f.symptom_matrix !== 'object') return false;
      const criticalCorrelations = ['失神・前失神→ポーズ', '失神・前失神→AVブロック', '失神・前失神→VT'];
      return criticalCorrelations.some((k) => f.symptom_matrix[k]);
    },
    text: '症状マトリクスで失神と重篤不整脈 (ポーズ/AVB/VT) の直接対応あり。原因不整脈と失神が結び付いており、即時介入 (PM/ICD/アブレーション) を検討。' },
  { level: 'workup', sectionId: 'daily_burden', when: (f) => {
      const rows = Array.isArray(f.daily_burden) ? f.daily_burden : [];
      if (rows.length < 2) return false;
      const afVals = rows.map((r) => parseFloat(r.af_percent || 0)).filter((v) => !isNaN(v));
      if (afVals.length < 2) return false;
      const spread = Math.max(...afVals) - Math.min(...afVals);
      return spread >= 20;
    },
    text: '日次 AF 割合の変動 ≥20% (発作性 AF パターン)。症状日と重ねて AF 発生と誘因を評価。' },
  { level: 'workup', sectionId: 'daily_burden', when: (f) => {
      const rows = Array.isArray(f.daily_burden) ? f.daily_burden : [];
      if (rows.length < 2) return false;
      const pvcVals = rows.map((r) => parseFloat(r.pvc_percent || 0)).filter((v) => !isNaN(v));
      if (pvcVals.length < 2) return false;
      const spread = Math.max(...pvcVals) - Math.min(...pvcVals);
      return spread >= 5;
    },
    text: '日次 PVC 割合の変動 ≥5% (発作性/日内変動大)。症状日・活動レベル・薬剤服用時間と重ねて評価。' },

  // Phase 4: 基本調律ルール
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_sinus_tachycardia === 'あり',
    text: '洞頻脈あり (ePatch 基本調律 +)。発熱・貧血・脱水・甲状腺機能亢進・不安・カフェイン等の誘因評価。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_sinus_bradycardia === 'あり',
    text: '洞徐脈あり (ePatch 基本調律 +)。薬剤 (β遮断薬・CCB・ジゴキシン)・甲状腺機能低下・アスリート心・OSA 等を鑑別。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_sinus_rhythm === 'なし' && (f.find_af === 'あり' || f.avb_type === '完全 (3度)' || f.find_junctional_escape_rhythm === 'あり'),
    text: '洞調律 (+) が付いていない — 主調律が AF / 補充調律 / 完全AVB 等の可能性。基本調律の評価を再確認。' },

  // 【参考】臨床背景として意識
  { level: 'reference', sectionId: 'report_summary', when: (f) => { const v = parseFloat(f.noise_percent || 0); return v > 30; },
    text: 'ノイズ割合 >30%。解析信頼性やや低下、微小所見・PVC 数の絶対値は控えめに解釈。' },
  { level: 'reference', sectionId: 'report_summary', when: (f) => { const v = parseFloat(f.analyze_hours || 0); return v > 0 && v < 20; },
    text: '解析時間 <20時間。夜間 / 覚醒帯のカバー範囲確認、必要なら再検討。' },
  { level: 'reference', sectionId: 'heart_rate', when: (f) => { const v = parseFloat(f.hr_mean || 0); return v > 0 && v < 60; },
    text: '平均心拍数 <60 bpm。洞徐脈傾向、β遮断薬・甲状腺機能低下等の関連を評価。' },
  { level: 'reference', sectionId: 'heart_rate', when: (f) => { const v = parseFloat(f.hr_mean || 0); return v >= 100; },
    text: '平均心拍数 ≥100 bpm。持続性頻脈、原因検索 (甲状腺・貧血・感染・脱水・心不全)。' },
  { level: 'reference', sectionId: 'hrv', when: (f) => { const v = parseFloat(f.sdnn || 0); return v > 0 && v < 50; },
    text: 'SDNN <50 ms。自律神経障害・予後不良指標 (心不全・DM 心血管神経障害)。' },
  { level: 'reference', sectionId: 'pacemaker_func', when: (f) => { const v = parseFloat(f.pacing_percent_v || 0); return v > 40 && f.device_type && f.device_type !== 'CRT-P/D'; },
    text: 'V ペーシング率 >40% (CRT 以外)。Pacing-induced Cardiomyopathy リスク、CRT アップグレードや設定変更検討。' },
  { level: 'reference', sectionId: 'patient_info', when: (f) => f.diary_correlation === '症状時に不整脈なし' && Array.isArray(f.symptom) && f.symptom.length > 0 && !f.symptom.every((s) => s === '無症候性 (定期評価)'),
    text: '症状時に有意な不整脈記録なし。不整脈以外の原因 (起立性低血圧・血糖・過換気・精神症状等) を鑑別。' },
  { level: 'reference', sectionId: 'patient_info', when: (f) => f.diary_correlation === '症状時に不整脈あり (相関)',
    text: '症状と不整脈の相関あり。治療介入 (薬剤/アブレーション/デバイス) を検討。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_t_inversion === 'あり',
    text: 'T波陰転化あり。虚血・心筋炎・心尖部肥大型心筋症・脳血管障害等の鑑別、12誘導心電図・心エコー確認。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_ivcd === 'あり',
    text: '心室内伝導遅延あり。基礎心疾患 (心筋症・虚血・電解質) の評価、CRT 適応関連の指標。' },
  { level: 'reference', sectionId: 'ectopic_spvc', when: (f) => { const v = parseFloat(f.spvc_total || 0); return v >= 100 && v < 300; },
    text: 'SVPC 100-299個/日。加齢・ストレス・カフェイン等でも見られる範囲、症状なければ経過観察でよい。' },
  { level: 'reference', sectionId: 'heart_rate', when: (f) => {
      const day = parseFloat(f.hr_day_mean || 0); const night = parseFloat(f.hr_night_mean || 0);
      return day > 0 && night > 0 && (day - night) >= 10 && (day - night) < 20;
    },
    text: '昼夜 HR 較差 10-19 bpm。若干低め、加齢や薬剤の影響を意識して評価。' },
  { level: 'reference', sectionId: 'findings', when: (f) => Array.isArray(f.symptom) && f.symptom.includes('動悸') && (f.find_pvc === 'あり' || f.find_pvc_couplet === 'あり') && f.find_af !== 'あり' && f.find_vt !== 'あり',
    text: '動悸主訴で PVC/PVC二連発のみ (VT/AF なし)。PVC 由来の動悸の可能性、頻回なら生活指導・β遮断薬検討。' },
  { level: 'reference', sectionId: 'hrv', when: (f) => { const lf = parseFloat(f.lf || 0); const hf = parseFloat(f.hf || 0); return lf > 0 && hf > 0 && (lf / hf) > 3; },
    text: 'LF/HF > 3。交感神経優位、ストレス・不安・心不全・DM 神経障害等の背景を意識。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_junctional === 'あり' || f.find_junctional_escape_rhythm === 'あり',
    text: '接合部調律あり。徐脈時の補充調律として現れることが多い、洞機能不全 (SSS) 評価も検討。' },
  { level: 'reference', sectionId: 'findings', when: (f) => f.find_wandering_pm === 'あり',
    text: '移動性ペースメーカーあり。健康な人でも見られる、若年者・高迷走神経緊張・徐脈時に多い、通常経過観察。' },
  { level: 'reference', sectionId: 'episode_avb', when: (f) => {
      if (f.avb_type !== '2度 Mobitz I (Wenckebach)') return false;
      const hasSyncope = Array.isArray(f.symptom) && f.symptom.includes('失神・前失神');
      return !hasSyncope;
    },
    text: 'Wenckebach 型 2度AVブロックあり (失神主訴なし)。夜間・迷走神経性なら通常経過観察、日中出現・症状伴えば精査。' },
  { level: 'reference', sectionId: 'pvc_morphology', when: (f) => {
      const p1 = parseFloat(f.pvc_morph1_percent || 0); const p2 = parseFloat(f.pvc_morph2_percent || 0);
      const forms = parseFloat(f.pvc_forms || 0);
      return forms >= 3 && (p1 + p2) >= 90;
    },
    text: 'PVC 主要2形態で ≥90% を占める。優位形態が明確、focal origin 主体で 3形態目以降は少数派。' },
  { level: 'reference', sectionId: 'daily_burden', when: (f) => {
      const rows = Array.isArray(f.daily_burden) ? f.daily_burden : [];
      return rows.length >= 2;
    },
    text: '日次負荷データ入力あり。日ごとのばらつきと症状記録シート/患者イベント・活動記録を照合し、発作誘因の同定を試みる。' },
  { level: 'reference', sectionId: 'patient_events', when: (f) => { const v = parseFloat(f.patient_events_count || 0); return v >= 5; },
    text: '患者イベント数 ≥5回。頻回の自覚症状、症状記録シートとの詳細照合と原因特定を優先。' },
];

// 「洞調律・有意所見なし」プリセット - find_* を全て「なし」、AF/AVB/心室調律を「なし」に設定
// Phase 4: 基本調律の「洞調律あり」を追加設定
export function buildNormalPreset() {
  const preset = {};
  HOLTER_SECTIONS.forEach((section) => {
    section.items.forEach((item) => {
      if (item.type === 'choice' && item.options.includes('なし')) {
        preset[item.id] = 'なし';
      }
    });
  });
  preset.find_pm_failure = '該当なし (デバイスなし)';
  // 基本調律: 洞調律のみ「あり」に (正常パターン)
  preset.find_sinus_rhythm = 'あり';
  preset.find_sinus_tachycardia = 'なし';
  preset.find_sinus_bradycardia = 'なし';
  return preset;
}

export const PRESET_NOTE = '※プリセット「洞調律・有意所見なし」適用済み — 個別項目 (数値・ST・CVHRI・QTc等) を実レポートと照合してから最終判断してください。';

// 症状×不整脈マトリクス定義 (Phase 3)
export const SYMPTOM_MATRIX_SYMPTOMS = ['動悸', '失神・前失神', 'めまい・ふらつき', '胸痛・胸部不快', '息切れ・倦怠感'];
export const SYMPTOM_MATRIX_ARRHYTHMIAS = ['PVC', 'SVPC', '洞頻脈', '洞徐脈', 'AF/AFL', 'SVT', 'VT', 'ポーズ', 'AVブロック', 'ST変化'];

// 日次負荷サマリーの列定義 (Phase 8: date/datetime/duration picker 対応)
export const DAILY_BURDEN_COLUMNS = [
  { key: 'date', label: '日付', type: 'date', width: '140px' },
  { key: 'analyze_hours', label: '解析可能時間', type: 'duration', width: '260px' },
  { key: 'af_percent', label: 'AF %', type: 'numeric', placeholder: '0', width: '70px' },
  { key: 'af_duration', label: 'AF 継続時間', type: 'duration', width: '260px' },
  { key: 'spvc_beats', label: 'SVPC 数', type: 'numeric', placeholder: '325', width: '75px' },
  { key: 'spvc_percent', label: 'SVPC %', type: 'numeric', placeholder: '0.52', width: '65px' },
  { key: 'pvc_beats', label: 'PVC 数', type: 'numeric', placeholder: '2335', width: '75px' },
  { key: 'pvc_percent', label: 'PVC %', type: 'numeric', placeholder: '3.73', width: '65px' },
  { key: 'svt_episodes', label: 'SVT 回', type: 'numeric', placeholder: '5', width: '55px' },
  { key: 'avb_episodes', label: 'AVB 回', type: 'numeric', placeholder: '0', width: '55px' },
  { key: 'vent_episodes', label: '心室調律 回', type: 'numeric', placeholder: '3', width: '80px' },
  { key: 'peak_event_datetime', label: 'イベント日時', type: 'datetime', width: '210px' },
  { key: 'note', label: 'メモ (症状等)', type: 'text', placeholder: '', width: '150px' },
];

// シナリオ別プリセット定義
export const SCENARIO_PRESETS = [
  {
    id: 'af_screening_negative',
    label: 'AF検出目的で今回未検出',
    description: '症状/リスク因子で AF 検出を依頼、今回のホルターでは AF 未検出のパターン',
    apply: () => {
      const preset = buildNormalPreset();
      preset.symptom = ['AF検出目的'];
      preset.diary_correlation = '症状時に不整脈なし';
      preset.find_pm_failure = '該当なし (デバイスなし)';
      return preset;
    },
    note: '※AF検出目的プリセット適用済み — 今回未検出でも発作性 AF は否定できないため、症状時心電図・ILR・再ホルター検討。',
  },
  {
    id: 'palpitation_pvc_only',
    label: '動悸精査で PVC/SVPC のみ',
    description: '動悸主訴、有意な VT/AF/AVブロックなく PVC・SVPC のみ検出パターン',
    apply: () => {
      const preset = buildNormalPreset();
      preset.symptom = ['動悸'];
      preset.find_pvc = 'あり';
      preset.find_pvc_couplet = 'なし';
      preset.find_af = 'なし';
      preset.find_vt = 'なし';
      preset.find_pm_failure = '該当なし (デバイスなし)';
      return preset;
    },
    note: '※動悸+PVC のみプリセット適用済み — PVC 総数・出現率・形態数を実レポート値で入力し、心筋症リスク評価してください。',
  },
  {
    id: 'pm_routine_normal',
    label: 'PM 定期評価で機能正常',
    description: 'PM 植込例、定期評価でセンシング/キャプチャー異常なし',
    apply: () => {
      const preset = buildNormalPreset();
      preset.symptom = ['ペースメーカー機能評価'];
      preset.device_type = 'PPM';
      preset.find_pm_failure = 'なし';
      return preset;
    },
    note: '※PM 定期評価プリセット適用済み — A/V ペーシング率と ICD 作動 (該当時) を実レポート値で入力してください。',
  },
];

// ============================================================
// ヘルパー関数 (Phase 5: 時刻・日付・duration 型の値変換)
// ============================================================

// duration オブジェクト { d, h, m, s } → 総時間 (小数)
export function durationToHours(v) {
  if (!v || typeof v !== 'object') return 0;
  const d = parseFloat(v.d || 0);
  const h = parseFloat(v.h || 0);
  const m = parseFloat(v.m || 0);
  const s = parseFloat(v.s || 0);
  return d * 24 + h + m / 60 + s / 3600;
}

// duration オブジェクト → 表示文字列 "5日 23時間 53分 15秒"
export function formatDuration(v) {
  if (!v || typeof v !== 'object') return '';
  const d = parseInt(v.d || 0, 10);
  const h = parseInt(v.h || 0, 10);
  const m = parseInt(v.m || 0, 10);
  const s = parseInt(v.s || 0, 10);
  if (d === 0 && h === 0 && m === 0 && s === 0) return '';
  const parts = [];
  if (d > 0) parts.push(`${d}日`);
  if (h > 0) parts.push(`${h}時間`);
  if (m > 0) parts.push(`${m}分`);
  if (s > 0) parts.push(`${s}秒`);
  return parts.join(' ');
}

// datetime-local "YYYY-MM-DDTHH:mm" → 記録開始日基準で「日X HH:mm」形式に整形
// 記録開始日がなければ "YYYY-MM-DD HH:mm" のまま返す
export function formatDateTimeWithDay(dtStr, startDateStr) {
  if (!dtStr) return '';
  const [datePart, timePart] = String(dtStr).split('T');
  if (!datePart || !timePart) return dtStr;
  if (!startDateStr) return `${datePart} ${timePart}`;
  const start = new Date(startDateStr + 'T00:00:00');
  const target = new Date(datePart + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(target.getTime())) return `${datePart} ${timePart}`;
  const diffDays = Math.floor((target - start) / (24 * 3600 * 1000)) + 1;
  if (diffDays < 1 || diffDays > 30) return `${datePart} ${timePart}`;
  return `日${diffDays} ${timePart} (${datePart})`;
}

// date "YYYY-MM-DD" → 記録開始日基準で「日X (MM/DD)」形式
export function formatDateWithDay(dStr, startDateStr) {
  if (!dStr) return '';
  if (!startDateStr) return dStr;
  const start = new Date(startDateStr + 'T00:00:00');
  const target = new Date(dStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(target.getTime())) return dStr;
  const diffDays = Math.floor((target - start) / (24 * 3600 * 1000)) + 1;
  if (diffDays < 1 || diffDays > 30) return dStr;
  const [, mm, dd] = dStr.split('-');
  return `日${diffDays} (${mm}/${dd})`;
}

// 2つの date "YYYY-MM-DD" 間の日数 (両端含む)
export function daysBetweenInclusive(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const s = new Date(startStr + 'T00:00:00');
  const e = new Date(endStr + 'T00:00:00');
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  return Math.floor((e - s) / (24 * 3600 * 1000)) + 1;
}

// numeric 値が「<0.01」等の trace 特殊値かチェック
export function isTraceValue(v) {
  return typeof v === 'string' && v.startsWith('<');
}

// ============================================================
// 大区分グループ (Phase 6: セクションを 3 グループにまとめた入れ子アコーディオン)
// ePatch レポート紙面の 2 カラム構造 + 下部所見・詳細解析に対応
// ============================================================
export const HOLTER_GROUPS = [
  {
    id: 'group_basic',
    title: 'A. レポート基本情報 (ePatch 左カラム相当)',
    subtitle: '患者情報 → サマリー → 心拍数 → 異所性 → イベント/ペーシング → CVHRI',
    sectionIds: ['patient_info', 'report_summary', 'heart_rate', 'ectopic_spvc', 'ectopic_pvc', 'patient_events', 'pacing_events', 'cvhri'],
  },
  {
    id: 'group_episodes_findings',
    title: 'B. エピソード5枠と所見 (ePatch 右カラム + 所見欄)',
    subtitle: 'AF → 上室頻拍 → ポーズ → AVブロック → 心室調律 → 所見 (基本調律+陽性所見15+詳細17) → ST 変動',
    sectionIds: ['episode_af', 'episode_svt_other', 'episode_pause', 'episode_avb', 'episode_vent_rhythm', 'findings', 'st'],
  },
  {
    id: 'group_detailed_analysis',
    title: 'C. 詳細解析・追加項目 (ePatch 後半ページ)',
    subtitle: 'トレンド → 日次負荷 → PVC形態解析 → 症状マトリクス → HRV → QT → PM機能',
    sectionIds: ['heart_rate_trend', 'daily_burden', 'pvc_morphology', 'symptom_matrix', 'hrv', 'qt', 'pacemaker_func'],
  },
];

// section id → group id の逆引きマップ (スクロール時に親グループを開くため)
export function sectionIdToGroupId(sectionId) {
  for (const g of HOLTER_GROUPS) {
    if (g.sectionIds.includes(sectionId)) return g.id;
  }
  return null;
}

