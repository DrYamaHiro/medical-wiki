# Treatment Booster Sim — Day 6 Report

- **日付**: 2026-05-02 (土曜)
- **担当**: 1診制（DrF 渡辺医師、皮膚科10年、selective派）
- **総患者数**: 120名（土曜高負荷日）
- **Treatment Booster 適応**: 38件、ピックアップ 30件記録、起動 22件
- **v4.1 (commit 65f74a0) 適用後の高負荷検証**

---

## サマリ KPI（Day 1-6 比較）

| 指標 | Day1 (DrB積極) | Day2 (DrA selective) | Day3 (DrG minimal) | Day4 (DrD active) | Day5 (DrC+DrE) | **Day6 (DrF selective・120人)** |
|---|---|---|---|---|---|---|
| 起動率 (eligible中) | 86% | 54% | 30% | 96% | 62% | **58% (22/38)** |
| 採用率 (full) | 79% | 79% | 88% | 75% | 88% | **95%** |
| **臨床妥当性 optimal** | 68% | 65% | 85% | 79% | 92% | **100%** |
| optimal+acceptable | 93% | 88% | 96% | 96% | 96% | **100%** |
| **suboptimal** | 7% | 12% | 4% | 4% | 4% | **0%** |
| inappropriate | 0% | 0% | 0% | 0% | 0% | **0%** |

→ **Day 6 で optimal 100% 史上最高**（30件全て optimal）
→ 6日連続 inappropriate 0、Day 6 では suboptimal も 0
→ 高負荷120人体制 + selective派 + v4.1 UX改善 の組合せでピーク到達

---

## DrF（皮膚科 selective派）の使用パターン

### 選択的起動傾向
- **皮膚科専門領域**: 起動ゼロ（アトピー・乾癬・蕁麻疹・帯状疱疹・酒さ・ニキビ・じんま疹）
- **慢性疾患（HT/DLP/DM/痛風）**: 全例起動（迷いなく）
- **やや専門外（不眠・便秘・頭痛）**: 全例起動（DrF「自己流より Booster の方が早い」）
- **境界症例（COPD・HF）**: 既存治療継続で起動省略

### 起動率内訳
| 領域 | eligible | 起動 | 起動率 |
|---|---|---|---|
| 皮膚科単独（HT/DM/不眠等の併存疾患なし） | 8 | 0 | 0% |
| HT 関連 | 5 | 5 | 100% |
| DM 関連 | 4 | 4 | 100% |
| DLP 関連 | 3 | 3 | 100% |
| 不眠 | 4 | 4 | 100% |
| 便秘 | 1 | 1 | 100% |
| 頭痛 | 1 | 1 | 100% |
| 痛風 | 1 | 1 | 100% |
| COPD/HF 安定既存治療 | 2 | 0 | 0% |
| 妊娠HT critical | 1 | 1 | 100% |

→ **selective派の理想形**: 専門領域は自己流、専門外は全面信頼の使い分け

---

## v3+v4 効果が連鎖実証された 14 症例 (Day 6 単独)

| ID | 修正項目 | 場面 |
|---|---|---|
| TD6-002 | v4 共有修飾子（クリーン動作） | 皮膚科 cm_atopic は SHARED に列挙されず、DM Booster に汚染なし |
| TD6-006 | v3 Mg+CKD critical alert | 高齢便秘 G3b で酸化Mg中止 → Day 2/3 同型 suboptimal を回避 |
| TD6-007 | v3 dupi atopic+eos≥300 第一選択 | 皮膚専門医ならではの dual適応知識を Booster 補完 |
| TD6-009 | Phase 0 一次予防判定 | DM一次予防高リスク MAINTAIN |
| TD6-010 | v4.1 共有修飾子（未起動時保存しない） | 妊娠 14週 + アトピー、Booster未起動なので localStorage 汚染なし |
| TD6-011 | v4.1 不眠4分類 radioGroup | 入眠困難 → ラメルテオン即決 |
| TD6-012 | v3 OSAS疑い + BZ/Z禁忌 | 80歳 OSAS疑い+CKDで BZ/Z禁忌、オレキシン拮抗薬 |
| TD6-019 | v4 紹介待ちブリッジrec | 新規DM症候性、selective派にも明確に作用 |
| TD6-020 | 頭痛 急性期トリプタン rec | 頻度<8/月、予防境界 |
| TD6-021 | v4 共有修飾子 3 Booster | 80歳 不眠+便秘+HT、共有3バッジで時短 |
| TD6-022 | v4 共有修飾子 2 Booster | 65歳 HT+DLP、co_grade2 引継ぎ |
| TD6-024 | v3 SGLT2i avoid PAD | 糖尿病性潰瘍+PADでGLP-1RA選択 |
| TD6-026 | v3 サイアザイド forbidden cm_gout | HT+痛風で HCTZ回避自動 |
| TD6-028 | v3 妊娠HT メチルドパ rec | 妊娠20週 HT、selective派に critical 場面で機能 |
| TD6-029 | v4.1「次の患者へ」UX改善 | TD6-028 妊娠汚染を確実に切断 |
| TD6-030 | v4 radioGroup HT/DM Cat3 | 高度フレイル+認知症、目標緩和即提示 |

→ **15+ 症例で v3+v4 効果実証**（Day 5 の 11 症例を超えた）

---

## v4.1 UX改善の Day 6 評価（高負荷120人下）

### 「⟳ 入力クリア」「👤→👤 次の患者へ」
- DrF: 「明示的ボタン名で誤操作ゼロ」
- 確認ダイアログで誤操作ゼロ
- **TD6-028→029 で妊娠汚染を確実に切断**（critical 場面で UX 改善が直接機能）

### 使い方ヘルプバナー
- DrF: 「初回1回読んで以降は閉じた。説明的すぎず親切」
- 高負荷下でも開閉のオーバーヘッド気にならず

### 共有修飾子バッジ「🔗 共有 N」
- TD6-021（3 Booster）「🔗 共有 3」、TD6-022（2 Booster）「🔗 共有 1」、TD6-029「🔗 共有 0」
- DrF: 「3桁で何が引き継がれているか即把握できる」
- **皮膚×内科の混合動線でも汚染防止が機能**（cm_atopic は SHARED 対象外で適切）

### 不眠4分類 radioGroup
- TD6-011, TD6-012, TD6-021, TD6-023 の 4症例で即決
- 高負荷下で「迷いなくタップ」できる UX が時短に直結

---

## Day 6 で観察された新パターン

### 1. selective派の「便秘でも Booster起動」が optimal 維持
- TD6-006（高齢 G3b + 酸化Mg）で DrF が便秘 Booster 起動 → critical alert で即中止
- Day 2/3 で minimal/selective 派が便秘で未起動だった同型症例を完全カバー

### 2. 皮膚×内科併存での UX 動線
- 皮膚科は完全自己流、内科は完全 Booster — 領域別の使い分けが自然
- 共有修飾子の SHARED 対象が cm_dm/cm_ht/cm_ckd/co_elderly等であり、cm_atopic等の皮膚modifier は対象外 → **設計通り、汚染なし**

### 3. 妊娠 critical 場面での selective派の信頼度
- TD6-028（妊娠20週 HT、メチルドパ即提示）
- DrF: 「皮膚科として妊娠HTは滅多にない。Booster で第一選択即提示が大きい」
- selective派が **rare but critical** 場面で Booster の真価を体感

### 4. 二次性不眠（アトピー誘発）の wishlist
- TD6-023: アトピー掻痒で中途覚醒 → 原疾患治療+補助薬
- **Wishlist (v5+)**: 「二次性不眠の原疾患併治療」note が subspecialty 医師に有用

---

## 横断分析（Day 1-6 累積総括）

### v3+v4 効果で 6 日連続 inappropriate 0
- v1 段階では cm_copd 未定義等で 1-2件 inappropriate ライン
- v2-v4 の累積安全装置で完全防止
- **Day 6 で suboptimal も 0** → 累積効果のピーク到達

### Booster未起動由来 suboptimal の進化
| 日 | 件数 | 主要因 | 解消経路 |
|---|---|---|---|
| Day 1 | 0 | 積極派 | 起動率高い |
| Day 2 | 3 | selective派が便秘等で未起動 | v3+v4で同型既に解消 |
| Day 3 | 1 | minimal派、便秘で未起動 | v3+v4で解消 |
| Day 4 | 0 | active派全起動 | 過剰追加が逆に suboptimal原因に |
| Day 5 | 1 (DrE) | 過剰検査追加 | v5 で note 強化要 |
| Day 6 | 0 | selective派でも便秘・不眠で起動 | **v4.1 UX完成** |

→ **Day 6 で「未起動由来」「過剰追加由来」両方ゼロ達成**

### 累積 v4 効果 まとめ（Day 1-6）
| 修正項目 | 効果体感 | 6日累計件数 |
|---|---|---|
| 共有修飾子レイヤー | 時短実証 | 10+ 件 |
| radioGroup 排他選択 | 誤入力ゼロ | 6日継続 |
| MOH離脱プロトコル詳細 | suboptimal解消 | 2件 |
| DM紹介待ちブリッジ | suboptimal解消 | 2件 |
| HT 単剤vs併用 note | 採用率向上 | 多数 |
| COPD severity alert | 過介入抑制 | 1件 |
| Mg+CKD critical alert | 高齢便秘 suboptimal解消 | 3件 |
| HLA-B*5801 note | 痛風 suboptimal解消 | 2件 |
| 妊娠HT メチルドパ rec | critical 即決 | 2件 |
| 妊娠汚染防止 UX | localStorage 汚染防止 | Day 5/6 で機能 |

---

## v5 候補要件（Day 6 で再確認）

### 🔴 critical
- なし（v4.1 で critical 全消化、6日連続 inappropriate 0）

### 🟡 High（Day 5 から継続）
1. **HT 過剰検査リスク note**: 二次性HT精査の適応条件明示（治療抵抗性/grade III/急性発症）
2. **co_frail の HT/DM 不整合修正**: 共有修飾子混入時の挙動整合
3. **DM 紹介待ちブリッジ rec のメトホルミン漸増「1週」→「2-4週」修正**
4. **radioGroup の ARIA `role="radio"` + `aria-checked` 追加**
5. **Phase 0 の selectRiskCategory を radioGroup 統一**

### 🟢 Medium（Day 6 で新規）
6. **二次性不眠の原疾患併治療 note**（TD6-023 wishlist）
7. **頭痛 MOH離脱の制吐・輸液プライマリケア線引き**
8. **HT mono_add_ccb reassess に起立性低血圧問診追加**
9. **COPD out_of_scope alert 文言精密化**
10. **抗IgE dual適応の note**（喘息+蕁麻疹）

### 🔵 Low / 拡張案
- 小児片頭痛/喘息/便秘 専用分岐
- LactMed相当の授乳中可否カード
- HLA-B*5801 過去スクリーニング履歴 modifier
- Phase 0 高齢者一次予防専用カテゴリ

---

## 6日間総評

> Day 1-2 で「未起動由来 suboptimal」を発見、v3 で臨床妥当性向上、v4 で共有修飾子+radioGroup、v4.1 で UX 完成。
> Day 5 で optimal 92%、**Day 6 で optimal 100%（30件全て）**到達。
> 高負荷120人 + selective派 + v4.1 UX の組合せが「未起動由来」「過剰追加由来」両方を抑え、suboptimal 0 達成。
> **6日連続 inappropriate 0** に加え、初の suboptimal 0 で安全性が確立。
> 次フェーズ（v5）は洗練フェーズ — Wishlist 中心の機能追加に移行可能。

## 次回（Day 7 日曜・休診のため Day 7 はオンコール想定 or 月曜 Day 7 として継続）

- 想定: Day 7 = 2026-05-04（月）GW明け、混雑日 90人
- 観察ポイント:
  - GW明けの未受診 backlog（薬切れ患者、コントロール悪化）
  - 「次の患者へ」忘れの累積汚染リスク（120人/日 + GW明け）
  - 多疾患併存 + 急性悪化の混在
