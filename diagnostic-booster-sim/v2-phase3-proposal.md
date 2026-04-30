# Diagnostic Booster Phase 3 提案

**前提**: Phase 1 (commit `5e53b8c`) + Phase 2 (commits `aa4e6e1` + `4e61de5`) デプロイ済み
- floor=20 関連性チェック、Phase 進行制御、resolvedStillDangerous 37件
- weight 個別化 (24箇所)、negativeFindings 機構、alwaysShow→showWhen 完全移行
- 監査: Planner×3 + Evaluator×3 (全項目 PASS)

---

## Phase 3 提案項目

### 🟡 #7-#8 残: GCA/PMR 4方向 cross-reference + 主要差分追加 (Phase 2 で comment update のみ)

Phase 2 では headacheData の GCA comment に cross-reference 追記のみ。残作業:
- **fatigueData / weightLossData に GCA/PMR を新規 differential 追加** (Planner #2 設計済み、symptoms/findings/redFlags 完全一式)
- **abdominalPainData**: 腸結核, 肛門直腸膿瘍, 腎梗塞
- **feverData**: 二次梅毒, CDI
- **chestPainData**: 肺高血圧症, 心タンポナーデ
- **lymphadenopathyData**: IgA血管炎, リンゴ病
- **rashData**: Sweet症候群

→ 新規 differentials は新しい SYMPTOMS/FINDINGS ID も追加する必要があり、慎重に進める (1日工数)

### 🟢 #10 小児ブースター新設 or modifier 拡張
**目的**: 小児疾患 (川崎病/腸重積/突発性発疹/クループ/細気管支炎) の見落とし防止

**選択肢A**: 既存 booster に `cm_pediatric` modifier を追加し、当該疾患を pediatric 専用カテゴリで隠す/表示
**選択肢B**: 完全独立の `DiagnosticBoosterPediatric` を新設

→ A の方が低コスト。患者ヘッダーで小児選択 → 各 data の小児疾患 entry が出現。

### 🟢 #11 妊娠 modifier 強制
**目的**: 妊娠合併症 (HELLP, eclampsia, peripartum CM, 急性脂肪肝) の見落とし防止

- 患者ヘッダーに「妊娠の可能性あり (女性 < 50歳)」必須選択
- 該当時 abdomen/chest/fatigue Booster で妊娠合併症 entries を活性化

### 🔵 #12 未対応主訴 booster 追加
- 排尿困難 (dysuria 単独)
- 嚥下困難 (dysphagia)
- 浮腫 (edema)
- 咳嗽単独 (cough without fever)

→ 各々 *Data.js 1ファイル新設、index.js の registry に追加

### 🔵 #13 patternBonus 機構
**目的**: 「右季肋部痛+Murphy陽性+発熱」のような典型 cluster に bonus 加点

```js
// each diff:
patternBonus: { all: ['ruq', 'murphy_sign', 'fever'], bonus: 4 }
```

calcScore で diff.patternBonus を読み、all 条件全て満たす時に bonus 加算。

### 🔵 #14 複数 Booster 統合 mode (大型)
**目的**: 「腹痛+発熱+CVA叩打痛+排尿時痛」のような multi-symptom クラスター対応

- ナビゲーター: 「症状を選んでください」→ 複数 booster が同時参照される
- 大型 UI 改修なので工数大、Phase 4+ 候補

---

## 想定スケジュール (Phase 3)

| 日 | 作業 |
|---|---|
| Day 1 | #7 #8 GCA/PMR + sepsis + 主要差分追加 (Planner→実装→Evaluator) |
| Day 2 | #10 小児 modifier 拡張 |
| Day 3 | #11 妊娠 modifier |
| Day 4 | #12 新規 booster 1-2個 (排尿困難, 浮腫) |
| Day 5 | #13 patternBonus + 統合 Evaluator |
| Day 6 | デプロイ |

---

## 想定リスク

1. **新規 differential 追加** で baseline ranking が大きく shift する可能性 → Phase 2.5 で baseline snapshot 取得後に進める
2. **小児 modifier** で「成人疾患が小児に表示されてしまう」逆汚染リスク → modifier 必須化で防御
3. **妊娠 modifier** が UI を煩雑にしないか → 50歳未満女性のみで条件付き表示

---

## Phase 4+ 候補 (参考)

- nextStep の実行可能性統一見直し (各 booster で「当院不可」明記)
- Wiki リンクの医師向け化
- リセット時の確認ダイアログ
- 複数 Booster 統合 mode

---

**承認待ち**: Phase 3 着手の OK が出れば、同じ Planner×3 + Evaluator×3 並列体制で進めます。
