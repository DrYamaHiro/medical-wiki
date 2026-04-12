# CS-Temp-Dev INDEX

> 診療テンプレート（Cure Station Template）の開発リポジトリ。Gitリポジトリ。
> 上位INDEX: [../INDEX.md](../INDEX.md) | マイドライブ全体: [../../INDEX.md](../../INDEX.md)

---

## クイックルーティング

| やりたいこと | 参照先 |
|---|---|
| 最新テンプレートを見る | `ver.3.0.2.2/output/` （`00-INDEX.txt` から開始） |
| テンプレートの変更点を確認 | 各バージョンの `.txt` ファイル（例: `ver.3.0.2.0.txt`） |
| フィードバックを確認 | `feedbacks/` （日付ベース） |
| テンプレート修正の既知課題 | `SOAP_ISSUES_MEMO.md` |
| コラム・掲示物を作る | `op-ed/` → [INDEX/op_ed_rules.md](INDEX/op_ed_rules.md) |
| 薬剤を調べる | `aeon_ph/drugs/` （RX-01〜15カテゴリ別） |
| Wiki更新 | `medical-wiki/` → `引継ぎ手順書.md` |
| 伊藤先生のテンプレート・提案 | `CS_Temp_Ito/` |
| MR勉強会の記録 | `MR-study-logs/` |
| フローチャート | `flowcharts/` |

---

## バージョン管理

**最新版: `ver.3.0.2.2/output/`**

各バージョンフォルダの `output/` 内に番号付きテンプレートファイル群が格納。
- `00-INDEX.txt` — テンプレート全体の目次（**テンプレート内のINDEX。このファイルとは別物**）
- `01-MASTER-CONTAINER-CLASSIFICATION.txt` — マスターコンテナ分類
- `02-DIAGNOSTIC-PROTOCOL-ROS-MAP.txt` — 診断プロトコル・ROSマップ
- `03-DOCTOR-ADVICE-COLLECTION.txt` — Dr.Adviceコレクション
- `NNN-AP-XX.txt` — Assessment/Plan（評価・方針）
- `NNN-SO-XX.txt` — Subjective/Objective（主訴・所見）

バージョン系譜: `2.0.1.0` → `2.0.1.1` → `3.0.0.0` → `3.0.1.0`〜`3.0.1.4` → `3.0.2.0` → `3.0.2.1` → **`3.0.2.2`**

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
- `drugs/` — カテゴリ別薬剤データ（`RX-01_infection` 〜 `RX-15_kampo`）
- `aeon_pharmacy_log.tsv` / `aeon_pharmacy_substitution.tsv` — 薬局ログ・代替薬

### medical-wiki/（Docusaurus医療Wiki）
- Node.jsプロジェクト（Docusaurus v3）
- 公開URL: https://dryamahiro.github.io/medical-wiki/
- セットアップ・デプロイ手順: `引継ぎ手順書.md`

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

---

## 関連プロジェクト

- OTOMO（疾患リスト・ROS） → [../../OTOMO/INDEX.md](../../OTOMO/INDEX.md)
- DirectorTeam（クリニック運営） → [../../DirectorTeam/INDEX.md](../../DirectorTeam/INDEX.md)
