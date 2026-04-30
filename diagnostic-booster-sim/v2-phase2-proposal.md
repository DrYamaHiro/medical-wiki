# Diagnostic Booster Phase 2 提案

**前提**: Phase 1 (commit `5e53b8c`) でデプロイ完了
- floor=20 バグ修正 (関連 redFlag 発火時のみ floor 適用)
- Phase 進行制御 (症状0個で進めない)
- top-5 + sev≥4 常時展開 + 全件展開トグル
- resolvedStillDangerous: 16→37 件に拡充
- 監査: Planner×3 + Evaluator×3 全項目 PASS

---

## Phase 2 提案項目 (1週間想定)

### 🟡 #5 症状/所見 weight 個別化
**現状**: 全 SYMPTOMS は +2、findings は +3 の一律配点。

**問題**: thunderclap, focal_deficit, peritoneal_signs 等は単独で疾患特異度が圧倒的に高いが、+2 では他の症状と同等。

**修正案**:
- SYMPTOMS の各項目に optional `weight: 4` field 追加 (省略時 +2)
- FINDINGS も同様 (省略時 +3)
- 高 weight (+4) を付ける候補:
  - thunderclap (SAH ほぼ確定)
  - focal_deficit (脳血管 / 神経救急)
  - peritoneal_signs (腹腔内緊急)
  - meningeal_signs (髄膜炎)
  - tearing pain + back radiation (大動脈解離)
  - pain_out_of_proportion (SMA閉塞)
  - bp_asymmetry (大動脈解離)
  - new_murmur (IE)
- calcScore は変更不要 (matchCount += sym.weight ?? 2 に変更)

### 🟡 #6 negativeFindings 機構
**現状**: 「ない」ことで疾患を下げるロジック皆無。

**修正案**:
- 各 differential に optional `negativeFindings: ['normal_o2sat', 'normal_lung_sound']` 追加
- 該当時 matchCount -= 1.5 (下限 0)
- まず低リスクスクリーニングのみで導入 (例: pneumonia の `normal_o2sat`)

### 🟢 #7 GCA/PMR 4方向 cross-reference
**現状**: headacheData にのみ GCA、polyarthralgiaData にのみ PMR、fatigue/weightLoss では両者への注意なし。

**修正案**:
- fatigueData の高齢倦怠感に GCA/PMR を differential として追加 (prev=2, sev=3)
- weightLossData にも同様
- headacheData の GCA に「PMR を併発した場合は polyarthralgia booster も参照」note
- polyarthralgiaData の PMR に「side temporal headache あれば GCA 共発を疑い headache booster へ」note

### 🟢 #8 主要データ欠落補完
**追加するべき differential**:
- **fatigueData**: sepsis (高齢者非特異的不調の最大盲点)
- **abdominalPainData**: 腸結核, 肛門直腸膿瘍, 腎梗塞
- **feverData**: 二次梅毒, 抗菌薬後 CDI
- **chestPainData**: 肺高血圧症, 心タンポナーデ
- **lymphadenopathyData**: IgA血管炎 (HSP), リンゴ病
- **rashData**: Sweet症候群

### 🟢 #9 alwaysShow → showWhen 条件付き化
**現状**: drug_fever などが alwaysShow=true で「症状ゼロでも #1」の不自然挙動。

**修正案**:
- alwaysShow フィールドを廃止
- 代わりに optional `showWhen: { anyOf: ['relative_bradycardia', 'rash', 'new_drug'] }` を追加
- 該当条件が選ばれた時のみ scope 内に入る

---

## 想定スケジュール

| 日 | 作業 |
|---|---|
| Day 1 | #5 weight 個別化 (Planner→実装→Evaluator) |
| Day 2 | #6 negativeFindings (smaller scope) |
| Day 3-4 | #7 GCA/PMR cross-ref + #8 データ欠落補完 |
| Day 5 | #9 showWhen 化 |
| Day 6 | 統合 Evaluator (10シナリオで再現テスト) |
| Day 7 | デプロイ |

---

## 想定リスク

1. **weight 個別化** で既存スコアが不自然にシフト → Phase 1 で発見されなかった隠れバグが浮上する可能性。Phase 2 開始時に既存テストケースで baseline ranking を記録しておく。

2. **negativeFindings** 導入で「症状を選ばないと点が下がる」UXの誤誘導 → Phase 1 段階では低リスクスクリーニングに限定。

3. **データ追加** (sepsis 等) は新規の score interactions を生むので Evaluator パスが必要。

---

## Phase 3 候補 (参考、本提案には含めない)

- 小児ブースター新設 or modifier 拡張
- 妊娠 modifier 強制
- 未対応主訴 booster 追加 (排尿困難/嚥下困難/浮腫)
- patternBonus 機構
- 複数 Booster 統合 mode

---

**承認待ち**: Phase 2 着手の OK が出れば、Phase 1 と同じ Planner×3 + Evaluator×3 並列体制で進めます。
