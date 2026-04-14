# 検索改善プラン

> Wiki・テンプレート・薬剤リファレンスの検索品質向上のための改善計画。
> 上位INDEX: [../INDEX.md](../INDEX.md)
> 関連: [feedback_rules.md](feedback_rules.md) / [template_rules.md](template_rules.md)

---

## 背景

2026-04-14に5人以上のAIによる多角的評価を実施。総合スコア **5.2/10** と判定され、改善プランを策定。改善プランはさらに5人以上の監査AIで評価し、5件のブロッカーを解消した上で実施に移行した。

### 評価結果サマリー（改善前）

| 評価項目 | スコア |
|---|---|
| 検索精度（Precision） | 5/10 |
| ランキング品質 | 4/10 |
| 検索網羅性（Recall） | 6/10 |
| 検索速度 | 8/10 |
| 日本語処理 | 6/10 |
| UX・効率性 | 4/10 |
| エラー回復 | 3/10 |
| 薬剤検索 | 5/10 |
| 緊急度重み付け | 3/10 |

### 最重要課題（全AI一致）

1. **keyword-dictionary.json が完全に孤立** — 342疾患のエイリアスが検索インデックスに一切反映されていなかった
2. **N-gram爆発** — 2-3文字N-gramがfrontmatter keywordsに大量に入り精度低下
3. **薬剤の個別名で検索不可** — 商品名/一般名がkeywordsに未登録

---

## 実施状況

### Phase 1: 即効施策 — 完了（2026-04-14）

| # | 施策 | 変更ファイル | ステータス | 適用状況 |
|---|---|---|---|---|
| **1-1** | 2文字N-gram除去（3文字は維持） | `build_docs.js` L82-88 | 完了 | **次回MDX再生成時に適用**（build_docs.js再実行が必要） |
| **1-1b** | keyword-dictionary.json統合（342疾患エイリアス） | `build_docs.js` 冒頭+buildKeywords() | 完了 | 同上 |
| **1-2** | urgencyフィールド追加（critical 3/urgent 6） | `keyword-dictionary.json` | 完了 | 同上 |
| **1-2b** | urgency分類基準ドキュメント | `INDEX/template_rules.md` | 完了 | 即時参照可能 |

**注意**: build_docs.jsの変更はmedical-wiki/配下ではないためGitHub Actionsでは自動適用されない。次回のテンプレート更新（ver.3.0.3.0以降）でbuild_docs.jsを再実行する際に全MDXのキーワードが改善される。

### Phase 2: 中コスト施策 — 部分完了（2026-04-14）

| # | 施策 | 変更ファイル | ステータス | 適用状況 |
|---|---|---|---|---|
| **2-2** | 薬剤名キーワード追加（1,522語） | `medical-wiki/docs/800-Drug-Reference/rx-*.mdx` 17ファイル | **完了・デプロイ済み** | 即時反映済み（GitHub Actionsでビルド） |
| **2-3** | 医療略語辞書（14略語） | `keyword-dictionary.json` | 完了 | 次回MDX再生成時に適用 |
| **2-1** | content_typeフィールド+バッジ表示 | 未着手 | 未実施 | — |
| **2-4** | 緊急度視覚マーカー | 未着手 | 未実施 | — |

### Phase 3: 高コスト施策 — 未着手

| # | 施策 | ステータス | 着手条件 |
|---|---|---|---|
| **3-1** | QuickSearchオートコンプリート | 未実施 | Phase 2効果測定後 |
| **3-2** | 緊急度ベースランキング | 未実施 | QuickSearch内で実装 |
| **3-3** | 検索プラグイン移行検討 | 未実施 | Phase 1-2で不十分な場合のみ |

---

## 技術的な注意事項

### build_docs.jsの変更適用方法

build_docs.jsの改善（N-gram修正+辞書統合+略語）を全MDXに適用するには:

```bash
cd g:/マイドライブ/MedicalApp/CS-Temp-Dev
node build_docs.js
```

ただし:
- Google Driveストリーミング環境ではEPERM/EINVALエラーが発生しうる（ディレクトリアクセス制限）
- Drive同期完了後、またはローカルマシンでの直接実行を推奨
- 実行後、生成されたMDXをgit add → commit → pushでデプロイ

### keyword-dictionary.jsonの構造

```json
{
  "term": "急性上気道炎",
  "aliases": ["上気道炎", "かぜ", "風邪", "感冒", "URI", "common cold"],
  "urgency": "routine",
  "target_docId": "j00-common-cold"
}
```

- `aliases`: build_docs.jsがbuildKeywords()内でdocIdマッチして frontmatter keywordsにマージ
- `urgency`: critical / urgent / routine の3段階（分類基準は template_rules.md 参照）
- 新疾患追加時は必ずエントリを追加すること

### 薬剤キーワードの更新方法

rx-*.mdxの薬剤キーワードは手動追加スクリプト（上記Phase 2-2で使用したインラインスクリプト）で更新。`<summary><strong>`タグ内の薬剤名を自動抽出してfrontmatter keywordsに追加する。

---

## 未解決の改善候補（将来の参照用）

### 評価で指摘されたが未対応の項目

1. **オートコンプリート/サジェスト機能**（Phase 3-1）: 検索バーに2文字入力で候補表示。UX改善効果が最も大きい
2. **コンテンツタイプ区別**（Phase 2-1）: frontmatterに content_type を追加し、検索結果で「テンプレート」「薬剤」「計算ツール」「Booster」をバッジ表示
3. **緊急度視覚マーカー**（Phase 2-4）: 致死的疾患に赤ドットを表示
4. **表記揺れの体系的対応**: 漢字↔ひらがな↔カタカナの3way変換、旧字体/新字体、ヴ行の揺れ
5. **0件ヒット時のガイダンス**: 「もしかして:○○」表示、カテゴリナビゲーション提示
6. **検索プラグイン移行**: @easyops-cn/docusaurus-search-local → Pagefind or Algolia DocSearch
7. **症状→疾患の逆引き検索**: Diagnostic Boosterとの連携
8. **ICD-11対応**: 2028年移行予定への準備

### 監査で出た安全策

- N-gram除去のロールバック: git revert 1コミットで即復旧可能
- urgency分類は医師レビュー必須
- 新規ページ追加時のkeyword-dictionary更新チェックリスト（feedback_rules.md参照）

---

---

## トラブル記録と回避策

### T1: Google Driveストリーミング上でのbuild_docs.js実行失敗

**発生**: 2026-04-14 Phase 1実装時
**症状**: `EINVAL: invalid argument, mkdir` および `EPERM: operation not permitted, scandir` がランダムなディレクトリで発生
**原因**: Google Driveのストリーミングモードでは、未同期のディレクトリに対するfs操作（mkdir/readdir/stat）が失敗する。全ディレクトリを走査するbuild_docs.jsは特に影響を受ける
**対策**:
- `fs.mkdirSync` の前に `fs.existsSync` ガードを追加（済み）
- build_docs.jsの全実行が必要な場合はDrive同期完了後 or ローカルマシンで実行
- 個別ファイルの読み書き（rx-*.mdxの18ファイル等）は問題なく動作する

**やってはいけないこと**: Google Driveストリーミング上でbuild_docs.jsを無条件に実行すること

### T2: git statusが大量の「削除」を誤検知

**発生**: 2026-04-14 Phase 1実装時
**症状**: `git status` が医療Wiki docs配下の300+ファイルを「deleted」と表示。実際にはファイルは存在するがDriveの同期遅延で見えない
**原因**: Google Driveストリーミングが一部ディレクトリの内容をキャッシュから返せない場合、OSレベルで「存在しない」と応答する
**対策**:
- **絶対に `git add -A` や `git add .` で全ファイルをステージしないこと** — 実在するファイルが削除コミットされる
- 変更対象のファイルを明示的に `git add ファイル名` で個別ステージ
- `git stash` もPermission denied で失敗することがある（Driveが一部ディレクトリをロック）
- 大量の削除が表示された場合は、Driveの同期状態を確認し、時間を置いてから再度 `git status` を実行

**やってはいけないこと**: `git add -A` / `git add .` / `git commit -a` を実行すること（Driveの同期問題でファイル削除を引き起こす）

### T3: npm run build のローカル実行不可

**発生**: Docusaurus本体のビルド（`npm run build`/`npx docusaurus build`/`npx docusaurus deploy`）はGoogle Drive上では正常動作しない
**対策**: デプロイは `git push origin master` → GitHub Actionsに任せる。ローカルでDocusaurusビルドを実行する必要はない
**例外**: `build_docs.js` 等のNode.jsスクリプト（MDX生成・キーワード更新）は条件付きで許可（CLAUDE.md参照）

**やってはいけないこと**: Google Drive上で `npm run build` / `npx docusaurus build` / `npx docusaurus deploy` を実行すること

### T4: MDXファイル内の `<` 記号によるビルドエラー

**発生**: 2026-04-13 失神ページデプロイ時
**症状**: `Unexpected character '9' before name` — MDX内の `BP<90` がJSXタグとして解釈される
**原因**: MDXパーサー（micromark-extension-mdx-jsx）が `<` の後に数字が来るとJSXタグの開始と判断しエラー
**対策**:
- MDXファイル（.mdx）内のテキストでは `<数字` のパターンを `&lt;数字` にエスケープする（例: `BP&lt;90`）
- JSファイル（.js）内の文字列リテラルでは生の `<` で問題ない（Reactがテキストとしてレンダリングする）
- 全角 `＜` を使う方法もあるが、MDXでは `&lt;` が安全

**やってはいけないこと**: MDXファイル内で `BP<90` `Hb<7` `eGFR<30` 等を生で書くこと

### T5: Mermaidコードブロックによるビルドエラー

**発生**: 2026-04-12 Diagnostic Boosterプロトタイプデプロイ時
**症状**: `ReactContextError: Hook useColorMode is called outside the <ColorModeProvider>` — SSG（静的サイト生成）でMermaidレンダラーが落ちる
**原因**: ` ```mermaid ` コードブロックはDocusaurus 3.7のSSGでColorModeProviderの外で呼ばれてクラッシュする
**対策**: Mermaidブロックは `<MermaidChart chart={...} />` コンポーネント経由で描画する（クライアントサイドのみ描画、SSG安全）

**やってはいけないこと**: MDXファイル内で ` ```mermaid ` コードブロックを直接使うこと。必ず `<MermaidChart>` コンポーネントを使用

### T6: keyword-dictionary.jsonの孤立

**発生**: 評価時に発見（2026-04-14）。dictionary自体は以前から存在していたが、build_docs.jsから一度も参照されていなかった
**症状**: 342疾患分の手動エイリアス（「かぜ」「風邪」「コロナ」等）が検索に一切反映されていなかった
**原因**: build_docs.jsのbuildKeywords()がicdCode/nameJa/nameEnのみを入力に取り、keyword-dictionary.jsonを読み込むコードがなかった
**対策**: Phase 1-1でbuild_docs.jsにALIAS_MAP読み込みコードを追加し、buildKeywords()にdocIdパラメータを追加してエイリアスをマージする修正を実施（済み）
**教訓**: 辞書ファイルを作成したら、必ず参照するコードとの接続を確認すること。データの存在≠データの活用

---

*作成: 2026-04-14*
*次回見直し: Phase 1のMDX再生成適用後、または検索に関する新たな要望時*
