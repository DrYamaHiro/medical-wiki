---
description: "指定カテゴリの全疾患のフローチャート（診断・治療）を作成し、Cloudinaryにアップロードする"
---

# フローチャート作成スキル

対象カテゴリ: $ARGUMENTS

## 前提

- フローチャートの元データ（.mmd）は `flowcharts/{docId}/` に保存
- mermaid-cli (`mmdc`) でPNG変換
- Cloudinaryにアップロード（docIdタグ付き → 画像エリアに自動表示）
- MDXファイルにインラインのMermaidは埋め込まない（画像エリアで閲覧）

## 視認性ガイドライン（必須）

### レイアウト
- **flowchart TD（上から下）を必ず使用** — LR(横型)は禁止
- 表示エリアは右カラム(col--7, 約700px幅)、クリックで拡大可能

### ノードテキストルール
- **四角ノード: 最大8文字**（例: "緊急搬送", "対症療法開始"）
- **菱形ノード: 最大6文字+「?」**（例: "気道緊急?", "鑑別?"）
- **エッジラベル: 最大6文字**（例: "あり", "陽性", "改善なし"）
- 詳細情報はノード内に詰め込まず、テキストを削る
- `<br/>` による改行は極力避ける（菱形では絶対に使わない）
- **不自然な改行の完全排除**: レンダリング後にノード・エッジラベル内で単語が途中で折り返されていないか必ず目視確認する。「アレルギー」が「アレルギ/ー」、「SpO2低下」が「SpO2低/下」のように途切れるのは絶対にNG。発生した場合はテキストを短縮（例: 「鼻炎」「低酸素」等）して再レンダリング
- 英数字混在の用語（SpO2, AMPC等）は特に改行されやすいため、エッジラベルでは漢字表現に置換する（例: SpO2低下→低酸素）

### ノード数制限
- 1フローチャートあたり **最大14ノード**
- 判断分岐(菱形)は **最大4個**
- 情報量が多い場合は2つのフローチャートに分割する

### 色パレット（WCAG AA準拠）
```
開始ノード:     fill:#1565C0,stroke:#212121,color:#fff  (青)
緊急/危険:      fill:#C62828,stroke:#212121,color:#fff  (濃赤)
判断分岐:       fill:#F9A825,stroke:#212121,color:#000  (濃黄)
処置/検査:      fill:#E65100,stroke:#212121,color:#fff  (濃橙)
終端/安全:      fill:#2E7D32,stroke:#212121,color:#fff  (濃緑)
経過観察:       fill:#558B2F,stroke:#212121,color:#fff  (オリーブ)
```

### NG色（コントラスト不足）
```
#f44336 + #fff  -> NG (3.9:1)
#FFC107 + #333  -> NG (3.5:1)
#FF9800 + #fff  -> NG (2.9:1)
#4CAF50 + #fff  -> NG (3.0:1)
```

## 手順

### Step 0: 対象ファイルの特定

対象カテゴリの `medical-wiki/docs/{カテゴリ}/` 内の全MDXファイルからdocIdを取得する。
frontmatterの `id:` フィールドを読み取る。

### Step 1: 既存フローチャートの確認

`flowcharts/{docId}/` が既に存在する場合はスキップするか、ユーザーに上書き確認を行う。

### Step 2: フローチャート元データ作成（.mmd）

各疾患について、AgentツールでMermaidソースを生成する。

**各Agentへの指示テンプレート**:

```
あなたは[該当科]の専門医です。以下の疾患について、プライマリケア医が臨床で即座に参照可能な
Mermaidフローチャートを2つ作成してください。

疾患: [ICD] [疾患名]

1. 診断フローチャート（diagnosis.mmd）
   - 主訴から始まり、Red Flag確認→鑑別→確定診断まで
   - 分岐は臨床的に正確な判断基準を反映

2. 治療アルゴリズム（treatment.mmd）
   - 診断確定から治療開始→薬剤選択→効果判定→次のステップ
   - 具体的な薬剤名・用量を含める

Mermaid記法ルール:
- flowchart TD（上から下）を使用 ★LR禁止
- ノードIDはアルファベットのみ（A, B, C...）
- テキスト文字数制限:
  - 四角ノード: 最大8文字（例: "緊急搬送", "AMPC処方"）
  - 菱形ノード: 最大6文字+?（例: "気道緊急?", "鑑別?"）
  - エッジラベル: 最大6文字（例: "あり", "改善なし"）
- 菱形内で<br/>改行は禁止
- < > は使わない。代わりに「以上」「未満」「低下」等
- { } は菱形ノードの記法としてのみ使用
- 条件分岐は -->|条件| で記述
- 1フローチャート最大14ノード、菱形は最大4個
- 出力は純粋なMermaid記法のみ（```は不要）

色パレット（必ず以下を使用）:
  開始: fill:#1565C0,stroke:#212121,color:#fff
  緊急: fill:#C62828,stroke:#212121,color:#fff
  判断: fill:#F9A825,stroke:#212121,color:#000
  処置: fill:#E65100,stroke:#212121,color:#fff
  終端: fill:#2E7D32,stroke:#212121,color:#fff
  観察: fill:#558B2F,stroke:#212121,color:#fff
```

**並列度**: 6疾患ずつAgentを並列起動。

### Step 3: .mmdファイルの保存

生成されたMermaidソースを以下のパスに保存:
- `flowcharts/{docId}/diagnosis.mmd`
- `flowcharts/{docId}/treatment.mmd`

### Step 4: PNG変換

mermaid-cli で各.mmdファイルをPNGに変換:

```bash
cd flowcharts/{docId}
mmdc -i diagnosis.mmd -o diagnosis.png -s 2 -w 1600 -b transparent -c ../mermaid-config.json
mmdc -i treatment.mmd -o treatment.png -s 2 -w 1600 -b transparent -c ../mermaid-config.json
```

**オプション説明**:
- `-s 2`: Retina対応2倍解像度（論理800px -> 実1600px出力）
- `-w 1600`: 出力幅上限1600px
- `-b transparent`: 背景透明
- `-c ../mermaid-config.json`: 共通設定ファイル

**注意**: 変換エラーが出た場合は.mmdファイルの構文を修正して再試行。

### Step 5: Cloudinaryにアップロード

```bash
curl -s -X POST "https://api.cloudinary.com/v1_1/dpyh1wsn8/image/upload" \
  -F "file=@diagnosis.png" \
  -F "upload_preset=medical-wiki" \
  -F "folder=medical-wiki/{docId}" \
  -F "tags={docId}" \
  -F "public_id=medical-wiki/{docId}/diagnosis-flowchart"

curl -s -X POST "https://api.cloudinary.com/v1_1/dpyh1wsn8/image/upload" \
  -F "file=@treatment.png" \
  -F "upload_preset=medical-wiki" \
  -F "folder=medical-wiki/{docId}" \
  -F "tags={docId}" \
  -F "public_id=medical-wiki/{docId}/treatment-algorithm"
```

アップロード成功を確認（secure_urlが返ること）。

### Step 6: MDXからインラインMermaidを除去

もしMDXファイル内に `<MermaidChart` や ````mermaid` がある場合は削除する。
`import MermaidChart` や `import Mermaid` の行も削除する。

### Step 7: コミット＆プッシュ

```bash
cd "g:/マイドライブ/MedicalApp/CS-Temp-Dev_docusaurus"
git add flowcharts/{カテゴリ内の全docId}/ medical-wiki/docs/{カテゴリ}/
git commit -m "Add flowcharts for {カテゴリ名} ({N} diseases)

Diagnostic and treatment flowcharts as Cloudinary images.
Source: flowcharts/{docId}/*.mmd

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin master
```

### Step 8: 次カテゴリへ

完了を報告し、次のカテゴリの処理を続行。

## フローチャート修正時の運用

1. `flowcharts/{docId}/` 内の `.mmd` ファイルを編集
2. `mmdc -i {file}.mmd -o {file}.png -s 2 -w 1600 -b transparent -c ../mermaid-config.json` で再変換
3. 同じ `public_id` でCloudinaryに再アップロード（上書き）
4. コミット＆プッシュ
