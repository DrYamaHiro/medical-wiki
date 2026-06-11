# CS-Temp-Dev INDEX

> 診療テンプレート（Cure Station Template）の開発リポジトリ。Gitリポジトリ。
> 上位INDEX: [../INDEX.md](../INDEX.md) | マイドライブ全体: [../../INDEX.md](../../INDEX.md)

---

## クイックルーティング

| やりたいこと | 参照先 |
|---|---|
| 最新テンプレート編集版を見る | `ver.3.0.3.0/output/` （`00-INDEX.txt` から開始） |
| GitHub原本のDrive保全を確認 | `ver.3.1.0.0/` （README.md から開始、編集禁止） |
| テンプレートの変更点を確認 | 各バージョンの `.txt` ファイル（例: `ver.3.1.0.0.txt`） |
| フィードバックを確認 | `feedbacks/` （日付ベース）→ [INDEX/feedback_rules.md](INDEX/feedback_rules.md) |
| テンプレート修正の既知課題 | `SOAP_ISSUES_MEMO.md` |
| Wiki更新 | `medical-wiki/` → 下記「Wiki更新ルール」参照 |
| コラム・掲示物を作る | `op-ed/` → [INDEX/op_ed_rules.md](INDEX/op_ed_rules.md) |
| 薬剤を調べる | `aeon_ph/drugs/` （RX-01〜18カテゴリ別） |
| 伊藤先生のテンプレート・提案 | `CS_Temp_Ito/` |
| MR勉強会の記録 | `MR-study-logs/` |
| フローチャート | `flowcharts/` |

---

## バージョン管理

**最新編集版: `ver.3.0.3.0/output/`**（テンプレートの編集対象）
**最新保全版: `ver.3.1.0.0/`**（GitHub 原本の Drive 保全、編集禁止）

各バージョンフォルダの `output/` 内に番号付きテンプレートファイル群が格納。

**マスターファイル（ver.3.0.3.0）:**
- `00-INDEX.txt` — テンプレート全体の目次（**テンプレート内のINDEX。このファイルとは別物**）
- `01-MASTER-CONTAINER-CLASSIFICATION.txt` — マスターコンテナ分類
- `02-DIAGNOSTIC-PROTOCOL-ROS-MAP.txt` — 診断プロトコル・ROSマップ
- `03-DOCTOR-ADVICE-COLLECTION.txt` — Dr.Adviceコレクション
- `04-MASTER-THERAPEUTIC-ITEMS.txt` — マスター治療項目一覧
- `05-MASTER-CATEGORY1-MEDICATIONS.txt` — カテゴリ1: 処方薬
- `06-MASTER-CATEGORY2-TESTS.txt` — カテゴリ2: 検査
- `07-MASTER-CATEGORY3-PROCEDURES.txt` — カテゴリ3: 処置
- `08-MASTER-CATEGORY4-DOCUMENTS.txt` — カテゴリ4: 文書
- `NNN-AP-XX.txt` — Assessment/Plan（評価・方針）
- `NNN-SO-XX.txt` — Subjective/Objective（主訴・所見）

バージョン系譜: `2.0.1.0` → `2.0.1.1` → `3.0.0.0` → `3.0.1.0`〜`3.0.1.4` → `3.0.2.0`〜`3.0.2.2` → `3.0.3.0` → `3.0.4.0` → `3.0.5.0` → **`3.1.0.0`**（保全版、編集は `3.0.3.0` を継続）

---

## Wiki更新ルール（重要）

### 公開URL
https://dryamahiro.github.io/medical-wiki/

### 他者変更の上書き防止

Wiki修正をデプロイする前に、**必ず以下のチェックを実施**すること:

```bash
git fetch origin
git log --oneline HEAD..origin/master   # 他者の新コミットがないか確認
```

- **origin に自分が把握していないコミットがある場合** → wikiの修正を一旦保留し報告。他者による修正内容を確認した上で、追記する形で統合するか、改めて書き直すかを検討する。
- `WIKI_EDIT_START` / `WIKI_EDIT_END` マーカーの外（SOAP部分）は `update_wiki.js` が保護する領域。マーカーを削除・移動しないこと。
- 対象ファイルの最終更新を `git log -- <path>` で確認し、自分が把握していないタイミングでの更新がないかチェック。

### 医学監査の義務

Wiki・SOAPテンプレート・薬剤リファレンスの変更は、**必ず複数の独立したAI監査エージェントによるレビュー**を通すこと。単一エージェントの監査では指摘漏れが発生することが確認されている。

- **推奨**: 3エージェント並列（臨床妥当性 / 薬理学・AMS / 医療安全・フォーマット）
- **最低**: 2エージェント（統合監査を2つ独立して実施）
- **合格基準**: 全エージェントが "APPROVED" を返すまで修正→再監査を繰り返す
- **記載ルール**: 変更履歴・更新情報に「AIが何を行ったか」の記載は不要。最終チェック・承認の責任は人間にある
- 詳細: [INDEX/feedback_rules.md](INDEX/feedback_rules.md) の「3. 医学監査（多段レビュー）」参照

### デプロイフロー

1. `git fetch origin` で他者変更を確認
2. コンフリクトがあれば解消（他者変更を優先）
3. 変更案を作成 → 複数AI監査（全APPROVED まで繰り返し）
4. `WIKI_EDIT_START/END` 内のみ編集（SOAP側は触らない）
5. コミット → push → GitHub Actions が自動デプロイ

---

## テンプレート作成・修正ルール

**詳細は [INDEX/template_rules.md](INDEX/template_rules.md) を参照。**

要点:
- SOAPフォーマットを厳守（S/O/Ns/A/P + Dr.Advice）
- `WIKI_EDIT_START` / `WIKI_EDIT_END` マーカーを削除しない
- 既存テンプレートのフォーマットを壊さない
- 変更後は `ver.X.X.X.X-changelog.txt` に記録
- SOAP_ISSUES_MEMO.md の既知課題を確認してから修正

---

## サブフォルダ詳細

### op-ed/（医療コラム・院内掲示物）
- `GUIDELINES.md` — 制作ガイドライン（**必読**）
- `inkwell/` — 下書き・テーマアイデア
- `published/` — 公開済み（命名規則: `{日付}_{通番}_{カテゴリ}_{テーマ}`）
- `archive/` — 掲示終了分
- 詳細: [INDEX/op_ed_rules.md](INDEX/op_ed_rules.md)

### aeon_ph/（薬剤リファレンス）
- `CS-Drug-Reference_FRAMEWORK.md` — フレームワーク設計書
- `drugs/` — カテゴリ別薬剤データ（`RX-01_infection` 〜 `RX-18_others`）
- `aeon_pharmacy_log.tsv` / `aeon_pharmacy_substitution.tsv` — 薬局ログ・代替薬

### medical-wiki/（Docusaurus医療Wiki）
- Node.jsプロジェクト（Docusaurus v3.7）
- 公開URL: https://dryamahiro.github.io/medical-wiki/
- セットアップ・デプロイ手順: `引継ぎ手順書.md`
- **Diagnostic Booster**: 001-Undifferentiated コンテナに搭載された診断思考支援ツール
  - Reactコンポーネント: `src/components/DiagnosticBooster/`
  - 症状・所見データ: `feverData.js`, `abdominalPainData.js`, `chestPainData.js`, `headacheData.js`, `dizzinessData.js`
  - 3エージェント並列監査で医学的品質を担保

### feedbacks/（フィードバック）
- 未処理FB: `feedbacks/` 直下
- 反映済み: `feedbacks/applied/YYYY-MM-DD_applied/`
- 処理ルール: [INDEX/feedback_rules.md](INDEX/feedback_rules.md)

---

## ビルドスクリプト

| ファイル | 用途 |
|---|---|
| `create_v3.js` | v3テンプレート生成 |
| `build_docs.js` | MDXファイル自動生成 |
| `update_wiki.js` | Wikiバージョンアップ（マーカー保護付き） |
| `build_drug_ref.js` | 薬剤リファレンス生成 |
| `keyword-dictionary.json` | キーワード辞書 |

---

## 詳細ガイド（INDEX/ フォルダ内）

| ファイル | 内容 |
|---|---|
| [INDEX/template_rules.md](INDEX/template_rules.md) | テンプレートフォーマット・修正ルール・禁止事項 |
| [INDEX/op_ed_rules.md](INDEX/op_ed_rules.md) | コラム・掲示物の制作ルール・デザイン仕様 |
| [INDEX/feedback_rules.md](INDEX/feedback_rules.md) | フィードバック処理ルール・医学監査フロー |
| [INDEX/search_improvement_plan.md](INDEX/search_improvement_plan.md) | 検索改善プラン・実施状況・トラブル記録 |

---

## 関連プロジェクト

- OTOMO（疾患リスト・ROS） → [../../OTOMO/INDEX.md](../../OTOMO/INDEX.md)
- DirectorTeam（クリニック運営） → [../../DirectorTeam/INDEX.md](../../DirectorTeam/INDEX.md)
