# Diagnostic Booster Phase 4 提案

**前提**: Phase 1-3 完走デプロイ済
- Phase 1 (`5e53b8c`): floor バグ修正・Phase制御・resolvedStillDangerous 37件
- Phase 2 (`aa4e6e1` `4e61de5` `affdc43`): weight個別化・negativeFindings・showWhen移行・GCA/PMR cross-ref・12新規 differential
- Phase 3 (`168cd3c`): 患者ヘッダー (年齢層+妊娠) + requiresPatient + patternBonus

監査体制: Planner×3 + Evaluator×3 全段階 PASS

---

## Phase 4 提案項目

### 🟡 #12 未対応主訴 booster 追加 (4 項目)

現状13ブースターでカバー外の頻出主訴を順次追加:

#### 4-1. 排尿困難 booster (dysuriaData.js)
- **典型 differentials**: 尿路感染症、前立腺肥大、前立腺癌、膀胱癌、過活動膀胱、神経因性膀胱、薬剤性 (抗コリン薬)
- **Red Flag**: 急性尿閉、血尿、敗血症兆候、神経学的症状

#### 4-2. 嚥下困難 booster (dysphagiaData.js)
- **典型**: 食道癌、胃食道逆流症、好酸球性食道炎、Achalasia、薬剤性 (NSAIDs/カルシウム拮抗薬)、神経変性疾患 (PD/ALS)
- **Red Flag**: 体重減少、嘔吐持続、新規発症高齢者、神経症状

#### 4-3. 浮腫 booster (edemaData.js)
- **典型**: 心不全、ネフローゼ症候群、CKD、肝硬変、深部静脈血栓症、リンパ浮腫、薬剤性 (CCB/NSAIDs)
- **Red Flag**: 片側性 (DVT)、全身性+呼吸困難 (HF)、急速進行

#### 4-4. 咳嗽単独 booster (coughData.js)
- **典型**: 急性気管支炎、肺炎、咳喘息、副鼻腔後鼻漏、ACEi副作用、結核、肺癌
- **Red Flag**: 喀血、3週間以上、夜間咳・労作時呼吸困難・体重減少

### 🟡 #14 複数 Booster 統合 mode (大型)
**目的**: 「腹痛+発熱+排尿時痛」のような multi-symptom クラスター対応

実装案:
- 入口画面で「複数主訴」モード選択
- 統合 SYMPTOMS pool から選択 → 各 booster の rankedDiffs を集約 → 統合スコアで再ソート
- 重複 differential は最高スコアを採用
- 工数: 3-5日 (大型)

### 🟢 #15 nextStep 実行可能性の統一見直し
**目的**: 各 booster で「当院不可」検査・処方薬を統一表記

- syncopeData は「心エコー当院不可」と明記済 — 良例
- 他 booster でもこの形式に揃える
- 「即日紹介」「翌日紹介」「数日内紹介」「外来予約」の4階層を nextStep で標準化

### 🟢 #16 Wiki リンクの医師向けタグ化
- 「Wiki詳細ページへ」リンクを医師サイドバー専用にして患者の前で表示しない
- または `audience: 'clinician_only'` フラグで条件表示

### 🔵 #17 リセット時の確認ダイアログ
- 前患者データ持ち越し防止
- 「次の患者へ」ボタンで明示的にリセット (Treatment Booster と同じ動線)

### 🔵 #18 高齢者・小児 modifier の活用拡張
Phase 3 で導入した patient header を活用:
- 川崎病 (5歳未満限定)、突発性発疹 (乳児限定) などを feverData に追加し pediatric 限定
- 帯状疱疹 (高齢者で重症化しやすい) などに soft-bonus

---

## 想定スケジュール (Phase 4)

| 日 | 作業 |
|---|---|
| Day 1-2 | #12-1 dysuria + #12-2 dysphagia booster (新規ファイル) |
| Day 3 | #12-3 edema + #12-4 cough booster |
| Day 4 | #15 nextStep 統一・#16 Wiki リンク医師向け化 |
| Day 5 | #17 リセット確認ダイアログ・#18 小児/高齢者 modifier 拡張 |
| Day 6 | #14 統合 mode (大型、ストレッチゴール) |
| Day 7 | 統合 Evaluator + デプロイ |

---

## 想定リスク

1. **新規 booster** で SYMPTOMS/FINDINGS の命名衝突が発生する可能性 → 各ファイル独立 scope なので runtime には影響なし、ただし semantic 整合性は確保
2. **#14 統合モード** は UI が大きく変わる → 既存 UX に影響しないよう新規メニュー項目で隠蔽
3. **小児/妊娠 modifier 拡張** で誤って一般疾患を制限 → 慎重に `requiresPatient` のみ使い `excludePatient` は避ける

---

## 統合監査計画 (Phase 4 完了時)

- 13 booster 横断シミュレーション (10 シナリオ)
- 患者ヘッダー (小児/成人/高齢/妊娠) × 各 booster で動作確認
- patternBonus 効果測定
- showWhen 全展開 (drug系疾患の表示制御確認)

---

**承認待ち**: Phase 4 着手の OK が出れば、同じ Planner×3 + Evaluator×3 並列体制で進めます。
