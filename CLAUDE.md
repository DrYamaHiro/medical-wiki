# CS-Temp-Dev ワークスペースルール

> 診療テンプレート（Cure Station Template）の開発リポジトリ。Docusaurus医療Wiki・薬剤リファレンスを含む。

## 禁止事項

- **`引継ぎ手順書.md` を読むな。** オーナー不在時の緊急引継ぎ専用文書であり、READMEではない。日常の情報は `INDEX.md` で完結する。
- **`git push --force` / `git reset --hard` を実行するな。** 他者の変更を不可逆的に破壊する。
- **`git add -A` / `git add .` / `git commit -a` を実行するな。** Google Driveストリーミングの同期遅延により、実在するファイルが「削除」と誤認される。変更対象ファイルを `git add ファイル名` で個別にステージすること。
- **患者個人情報（氏名・生年月日・ID等）をファイルに記録するな。** フィードバック・症例記載は必ず匿名化・一般化すること。
- **`.secrets/` 配下のファイルを読み取るな。**

## 作業の起点

- まず `INDEX.md` を読むこと。全てのルーティング・ルール・手順はここから辿れる。

## Google Drive上でのデプロイ方法（重要）

このリポジトリはGoogle Driveストリーミング上にある。以下の制約がある:

### できること（安定動作）
- ファイルの個別読み書き（Read/Write/Edit）
- `git add ファイル名` で明示的なステージ
- `git commit` / `git push origin master`
- 個別ファイルを対象としたNode.jsスクリプトの実行

### できないこと（失敗する）
- **`npm run build` / `npx docusaurus build`** — Google Drive上では正常動作しない。デプロイは `git push origin master` → GitHub Actionsが自動ビルド
- **`build_docs.js` のディレクトリ全走査** — readdirSync/mkdirSyncがEPERM/EINVALで失敗する。Drive同期完了後またはローカルマシンでの実行が必要
- **`git add -A` / `git add .`** — Driveの同期遅延で実在ファイルが「削除」と誤認される。**絶対に使わない**

### 正しいデプロイフロー
1. 対象のMDX/JS/CSSファイルを**直接Write/Editで書き込む**（ローカルコピー不要）
2. `git add 対象ファイル名` で**個別に**ステージ
3. `git commit -m "メッセージ"` → `git push origin master`
4. GitHub Actionsが自動でビルド&デプロイ（`medical-wiki/`配下に変更がある場合）
5. デプロイ結果は https://dryamahiro.github.io/medical-wiki/ で確認

### ローカルスクリプト実行について
- Docusaurusビルドは原則禁止
- `build_docs.js` 等のMDX生成スクリプトは、変更の妥当性・有益性が上回る場合に条件付きで許可
- ただしディレクトリ全走査を伴うスクリプトはDrive上で不安定。個別ファイル対象のスクリプトなら問題ない

## MDXファイル作成時の注意

- **`<数字` パターンを避ける**: MDXパーサーがJSXタグと誤認する。`BP<90` → `BP&lt;90` にエスケープ
- **Mermaidは `<MermaidChart>` コンポーネント経由で描画**: ` ```mermaid ` コードブロックはSSGでクラッシュする
- **`WIKI_EDIT_START` / `WIKI_EDIT_END` マーカーを削除しない**

## Wiki修正・医学監査ルール

- Wiki/SOAP/薬剤リファレンスの変更は**複数の独立したAI監査エージェント（最低2、推奨3）**によるレビューを通すこと
- 全エージェントが承認するまで修正→再監査を繰り返す
- 変更履歴にAIが何を行ったかの記載は不要（最終チェック・承認の責任は人間にある）
- 詳細: [INDEX/feedback_rules.md](INDEX/feedback_rules.md)

## 検索改善プラン

検索品質の改善計画・実施状況・トラブル記録は [INDEX/search_improvement_plan.md](INDEX/search_improvement_plan.md) を参照。
