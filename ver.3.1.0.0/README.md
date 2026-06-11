# CS-Temp ver.3.1.0.0

このフォルダは、GitHub 上の medical-wiki 関連データを Google Drive 上に保全・整理するための版です。

## Source

- Remote: https://github.com/DrYamaHiro/medical-wiki.git
- Branch: master
- Commit: c7d577403986e6fc601328c1490a7994793bd469 (短縮: c7d5774)
- Source commit message: `薬剤リファレンス (aeon_ph/drugs/RX-11_neuropsych.txt) にクービビック追加`
- Archived at: 2026-06-11 06:09:32 UTC
- Tracked file count: 3270
- medical-wiki snapshot file count: 536

## Directory Policy

- `_github_raw/` はGitHub原本の保全領域。**編集禁止**。
  - `github-raw-c7d5774.tar` (tarアーカイブ、30MB)
  - `extracted/` (展開済みコピー、3270ファイル)
- `medical-wiki-snapshot/` はwiki本体のスナップショット (536ファイル)。**初回作成後は原則編集しない**。
- `_manifests/` は検証用ファイル一覧・SHA256ハッシュ。
  - `github_source_commit.txt`
  - `github_remote_info.txt`
  - `github_tracked_files.txt`
  - `github_raw_sha256.tsv` (3270エントリ)
  - `migration_file_counts.txt`
- `review-notes/` は監査メモ・今後の対応事項。

## Important

医学内容の修正、診療報酬改定対応、薬剤適応更新は、この保全作業とは分離して実施する。
変更時はやまひろ先生の承認と複数AI監査を必須とする。

医学コンテンツの編集は `ver.3.0.3.0/output/` の SOAP テンプレ + `medical-wiki/docs/` の MDX を対象とし、本フォルダ (`ver.3.1.0.0/`) は触らない。

## 関連スクリプト・ルール (v2 追記)

- `scripts/validate_dose_labels.js`: 用量バリエーション検証 (期待: 0 issues)
- `INDEX/template_rules.md`: テンプレ作成・修正ルール (ルール#6で使い分けラベル必須)
- `CLAUDE.md` 「Git ステージ漏れ予防」セクション: Windows case-insensitive 対策
- 医学監査: 最低2、推奨3エージェント並列 (臨床妥当性 / AMS / 形式整合性)

## Git 管理方針 (やまひろ先生承認 2026-06-11)

- 本 README.md のみを git 管理対象とする
- `_github_raw/` の tar および展開済みコピー、`medical-wiki-snapshot/`、`_manifests/` 配下は **Drive 上のみ保持し、Git には commit しない**
- 理由: tar 30MB + 展開済み数百ファイル+ snapshot 536ファイルをGitに含めるとリポジトリが肥大化するため
- `_manifests/` は再生成可能 (GitHub原本 + tar 再展開 + SHA256再計算で復元可)
