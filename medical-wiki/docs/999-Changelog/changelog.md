---
id: changelog
title: "変更履歴"
sidebar_label: "変更履歴"
sidebar_position: 1
---

# 変更履歴

## ver.3.0.1.0（2026-03-24）

### 新規疾患テンプレート（14件追加）

旧テンプレート（templates_all.txt）との差分分析に基づき、不足していた疾患を追加。3回の専門家レビューサイクル（医学的精度・保険算定・AMR対策・フォーマット統一・運用実用性の5軸）を経てAPPROVED。

| コンテナ | ICD | 疾患名 |
|---------|-----|--------|
| 030 喘息・COPD | J45.9 | 運動誘発性喘息 |
| 040 鼻炎 | J30.1 | スギ花粉症 / ゾレア導入 |
| 090 循環器 | I48 | 心房細動 / ワーファリン管理 |
| 090 循環器 | Z92.1 | 抗凝固薬長期使用管理 |
| 200 皮膚炎 | R61 | 多汗症 |
| 200 皮膚炎 | L74.0 | 汗疹（あせも） |
| 200 皮膚炎 | L63.9 | 円形脱毛症 |
| 210 皮膚感染 | L84 | 鶏眼・胼胝 |
| 210 皮膚感染 | L03.0 | 爪囲炎 |
| 260 泌尿器 | R33/N31.2 | 尿閉・弛緩性神経因性膀胱 |
| 280 感覚器 | R43.2 | 味覚障害 |
| 320 血液内科 | E60 | 亜鉛欠乏症 |
| 330 小児感染 | M30.3 | 川崎病 |
| 510 健診 | Z00.0 | ヘルスメンテナンス |

### 臨床計算ツール（9件）

サイドバー「🧮 臨床計算ツール」からアクセス可能。各疾患Wikiからもハイパーリンクで直接アクセスできます。

| ツール | 用途 | リンク先Wiki |
|--------|------|-------------|
| [CPI](/medical-wiki/docs/Calculators/calc-cpi) | インスリン分泌能評価 | DKD |
| [久山町スコア](/medical-wiki/docs/Calculators/calc-hisayama) | 心血管リスク | 脂質異常症 |
| [eGFR](/medical-wiki/docs/Calculators/calc-egfr) | 腎機能評価 | CKD |
| [BMI](/medical-wiki/docs/Calculators/calc-bmi) | 肥満度判定 | 肥満症 |
| [Ccr](/medical-wiki/docs/Calculators/calc-ccr) | 薬剤量調整 | CKD |
| [FIB-4](/medical-wiki/docs/Calculators/calc-fib4) | 肝線維化評価 | 脂肪肝 |
| [Friedewald式](/medical-wiki/docs/Calculators/calc-friedewald) | LDL-C推算 | 脂質異常症 |
| [CHA₂DS₂-VASc](/medical-wiki/docs/Calculators/calc-chads) | AF脳卒中リスク | 心房細動 |
| [A-DROP](/medical-wiki/docs/Calculators/calc-adrop) | 肺炎重症度 | 細菌性肺炎 |

### 画像アップロード機能

- Cloudinaryベースの画像アップロード（認証不要）
- ドラッグ&ドロップ / クリップボード貼り付け対応
- サムネイル選択・並び替え・非表示機能

### 検索機能強化

- 日本語部分一致検索対応（「梅毒」で「第1期梅毒」がヒット）
- 疾患名・ICD・キーワードの複合検索

---

## ver.3.0.0.0（2026-03-23）

### Wikiコンテンツ追加

全258疾患に専門医AIが執筆したWikiコンテンツを追加。病態生理・診断基準・エビデンス・ガイドライン推奨の4セクション構成。複数回の専門家レビューを経て品質保証。

---

## ver.2.0.1.1（2026-02-17）

### 基盤バージョン

- 258疾患の診療テンプレート（SOAP形式）
- 41カテゴリの疾患分類
- Dr.Advice（臨床パール）
- マスターデータ（薬剤・検査・処置・文書）
