# フィードバック(FB)処理ルール

> `feedbacks/` に蓄積される現場FBを Wiki / SOAPテンプレート / 薬剤リファレンス / 院内掲示物 に反映するための手順。
> 上位INDEX: [../INDEX.md](../INDEX.md)
> 関連: [template_rules.md](template_rules.md) / [op_ed_rules.md](op_ed_rules.md) / [../SOAP_ISSUES_MEMO.md](../SOAP_ISSUES_MEMO.md)

---

## フォルダ構造

```
feedbacks/
├── YYYY-MM-DD-HHMM.txt    # 日常FB（Slack・診療内会話など）
├── YYYY-MM-DD-MR.txt      # MR勉強会記録
└── applied/               # 反映済みFB（処理日でフォルダ化）
    └── YYYY-MM-DD_applied/
```

- **新規FB**: `feedbacks/` 直下に置かれた未処理のもの
- **反映済み**: `feedbacks/applied/YYYY-MM-DD_applied/` にアーカイブ（処理を完了した日付で命名）
- **保留**: `feedbacks/_pending/` に一時退避（論点未決・要追加調査）※必要時のみ作成

---

## 反映対象の優先順位

| 優先度 | 反映先 | 判断基準 |
|---|---|---|
| 高 | `SOAP_ISSUES_MEMO.md` | 処方用量・投与日数・禁忌など「間違えると患者に実害」 |
| 高 | `ver.X.X.X.X/output/NNN-AP-XX.txt` (SOAP) | 処方・検査・Dr.Advice に反映すべき内容 |
| 中 | `medical-wiki/docs/**.mdx` の `WIKI_EDIT_START ～ WIKI_EDIT_END` 内 | 病態・鑑別・エビデンス・ガイドラインの補強 |
| 中 | `aeon_ph/drugs/RX-XX_*.txt` | 新薬追加・用量補正・代替薬・併用注意 |
| 低 | `op-ed/inkwell/` | 啓発コラム・院内掲示のネタ |
| 低 | `MR-study-logs/YYYY-MM-DD.txt` | MR勉強会の記録（元資料として保存） |

---

## 標準フロー

### 1. トリアージ
- `feedbacks/` の未処理ファイルを日付順で確認
- ファイルごとに「反映先カテゴリ」「医学的重要度」「緊急度」を判定
- 1FBが複数カテゴリに跨る場合は分解して各カテゴリに割り振る
- トリアージ結果はユーザーへ提示し承認を得る **（無断で本体修正を始めない）**

### 2. 事前チェック（上書き事故の防止）
反映前に必ず以下を確認する:

```bash
git fetch origin
git status
git log --oneline HEAD..origin/master
git rev-list --left-right --count HEAD...origin/master
```

- **origin に新コミットがある** → 先に取り込み、コンフリクト解消後に作業
- **未コミット変更がある** → 誰かの作業途中の可能性。確認なしで消さない
- **WIKI_EDIT_START/END マーカー** は絶対に削除しない
- 対象ファイルの最終更新を `git log -- <path>` で確認

### 3. 医学監査（多段レビュー）
変更案を作成したら、独立した監査AIエージェントのレビューを通す。**承認が出るまで修正→再監査を繰り返す。**

**監査チェックリスト**
- [ ] 医学的整合性（病態・鑑別・検査・治療の論理破綻）
- [ ] ガイドライン準拠（該当学会ガイドライン最新版との一致）
- [ ] 処方用量・投与日数（添付文書照合、小児/成人区別）
- [ ] 抗菌薬適正使用（広域ルーチン回避、適切な投与期間、既知指摘の踏襲）
- [ ] 保険適用（病名整合・適応外注記・自費明示）
- [ ] 禁忌・相互作用（CYP3A4/P-gp、妊婦・腎障害・肝障害）
- [ ] エビデンスレベル（MR情報はCOI踏まえ原著で裏取り）
- [ ] 設備制約（当院の制限を踏まえた紹介基準）
- [ ] 既存フォーマット保護（SOAP形式・WIKI_EDITマーカー・sidebar_position）

### 4. 反映
- 監査パス後のみ実ファイルへ書き込む
- SOAP変更時は changelog に追記
- Wiki変更時は `WIKI_EDIT_START/END` 内のみ編集
- コミットメッセージにFBファイル名を含める

### 5. アーカイブ
- 反映完了したFBは `feedbacks/applied/YYYY-MM-DD_applied/` へ移動
- 簡易READMEで反映内容を記録

---

## FBの種類別ガイド

### MR勉強会 (`YYYY-MM-DD-MR.txt`)
- 会社名・演題・演者を `MR-study-logs/` へ転記（COI記録兼用）
- 薬剤情報 → `aeon_ph/drugs/`
- 疾患エビデンス → Wiki の `WIKI_EDIT_START/END` 内
- **P(処方)に薬剤追加OK**。ただし監査で保険適用・第一選択性を確認

### 診療Slack系 (`YYYY-MM-DD-HHMM.txt`)
- 症例の気付き → Wiki の Dr.Advice / 鑑別 / RedFlag 強化
- 運用課題（マスタ未整備等） → `SOAP_ISSUES_MEMO.md` に記録
- 院内掲示ネタ → `op-ed/inkwell/` に転記

---

## 禁止事項

- FBを無断で本体ファイルへ反映しない（必ずユーザー承認）
- 医学監査を通さずに wiki / SOAP / 薬剤リファレンスを変更しない
- `git fetch` せずに wiki を編集・push しない
- `WIKI_EDIT_START/END` マーカーを削除・移動しない
- MR資料をそのまま転記しない（ガイドライン・第三者エビデンスで裏取り必須）
- 適応外・自費項目を注記なしで記載しない
