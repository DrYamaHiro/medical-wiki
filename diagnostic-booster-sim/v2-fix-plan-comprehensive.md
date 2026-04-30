# Diagnostic Booster v2 修正プラン - 全網羅型レポート

**監査日**: 2026-05-03
**監査体制**: 10名 AIテスター + 3名 独立医療監査AI (合計13名並列)
**対象**: medical-wiki/src/components/DiagnosticBooster/ (12 *Data.js + index.js)
**改修プランナー宛**: この修正レポートを基に v2 を設計してください

---

## エグゼクティブサマリー

ユーザー観察: 発熱診断ブースターで「咽頭痛・呼吸困難」入力時、Phase 3 で **#2 急性虫垂炎、#3 髄膜炎** という臨床的に不適切な順位が出現。

**根本原因 (確定)**: `calcScore` 関数 (lines 28-34) の floor=20 ロジックが **ANY Red Flag 発火時に severityWeight ≥ 4 の全疾患に無差別適用** されているため、関連性ゼロでも重症疾患が top-3 に強制浮上する。

**13並列監査の結論**:
- 全12 booster で同型バグを再現 (10/10 テスター一致)
- アルゴリズム設計に 8 の根本欠陥
- データインベントリに 11 の重要欠落 (主に GCA/PMR の cross-reference, 小児疾患, 妊娠合併症)
- UX/医療安全に 10 の追加課題

---

## 第1部: 重大バグ (CRITICAL — 即修正)

### Bug #1: floor=20 の無差別適用 (確定・全 booster で再現)

**問題コード**: `medical-wiki/src/components/DiagnosticBooster/index.js` line 28-34

```js
if (hasActiveRedFlags) {
  const floor = sev >= 4 ? 20 : 0;  // ← BUG: sev≥4 のすべてが floor=20
  s = Math.max(matchCount * (1 + sev * 0.4) + prev * 0.3, floor + matchCount);
}
```

**症状再現一覧** (10 テスター集計):

| Booster | 入力 | 上位に不当浮上した疾患 | スコア | 本来の順位 |
|---|---|---|---|---|
| fever | altered_mental + 関連 | 急性虫垂炎 | 20 | top外 |
| fever | dyspnea (Red Flag) | 肺塞栓症 #2 | 22 | top外 |
| fever | meningeal_signs | 感染性心内膜炎 #2 | 22 | top外 |
| abdomen | 腹膜刺激徴候 | AAA破裂・SMA閉塞 #3-4 | 20 | top外 |
| abdomen | 黄疸+発熱 | AAA破裂・SMA閉塞 #3-4 | 20 | top外 |
| chest | st_change | 大動脈解離 #2 | 20 | top外 |
| chest | hypoxia | 大動脈解離 #2-3 | 21-22 | top外 |
| chest | bp_asymmetry | ACS #2 | 20 | top外 |
| headache | temporal_artery | 脳血管障害 #2 | 20 | top外 |
| headache | meningeal_signs | SAH #2 | 22 | top外 |
| headache | papilledema | SAH+脳血管 #2-3 | 22 | top外 |
| dizziness | hit_negative+focal | 椎骨脳底動脈不全 #1 | 38.5 | top外 |
| fatigue | weight_loss | 副腎不全 (無関係) #2 | 30+ | top外 |
| fatigue | orthopnea | 副腎不全 #2 | 31 | top外 |
| lymph | weight_loss | HIV (無関係) #高位 | 25+ | top外 |
| palpit | chest_pain | WPW・Brugada・QT延長 #3-5 | 20 | top外 |
| palpit | dyspnea | WPW・Brugada #4 | 20 | top外 |
| syncope | no_prodrome | HOCM (無関係) #4 | 20 | top外 |

**修正案 (推奨)**:

Red Flag は「diff の redFlags 配列に含まれる症状/所見が選択された」場合のみ、その diff に floor を適用する。

```js
function calcScore(diff, selectedSymptoms, selectedFindings, hasActiveRedFlags, activeRedFlagConditions) {
  let matchCount = 0;
  const selS = new Set(selectedSymptoms);
  const selF = new Set(selectedFindings);
  for (const sym of diff.symptoms) if (selS.has(sym)) matchCount += 2;
  for (const f of diff.findings) if (selF.has(f)) matchCount += 3;

  const prev = diff.prevalenceWeight ?? 5;
  const sev = diff.severityWeight ?? 3;

  // この疾患に関連する Red Flag が選択されたかを判定
  const allSelected = new Set([...selectedSymptoms, ...selectedFindings]);
  const hasRelevantRedFlag = (diff.redFlags || []).some((c) => allSelected.has(c));

  if (hasActiveRedFlags) {
    // Red Flag が他疾患由来 → 通常の頻度ベーススコアに retreat
    if (!hasRelevantRedFlag) {
      // 他疾患の Red Flag が出ているので、本疾患は頻度+症状一致で評価
      return matchCount * (1 + prev * 0.10) + prev * 1.0;
    }
    // この疾患に直接関連する Red Flag → ブースト
    const relevanceFloor = sev >= 5 ? 25 : sev >= 4 ? 20 : 0;
    return Math.max(matchCount * (1 + sev * 0.4) + prev * 0.5, relevanceFloor + matchCount);
  }
  return matchCount * (1 + prev * 0.15) + prev * 1.5;
}
```

`activeRedFlagConditions` は `RED_FLAGS` の発火 conditions の和集合を渡す (またはこれを呼び出し側で計算)。

---

## 第2部: アルゴリズム設計欠陥 (Audit AI #1 + テスター)

### Defect #2: 症状重み付けの一律性
全症状が +2 で扱われるが、`thunderclap` `focal_deficit` `項部硬直` 等は単独でも疾患特異度が高い。

**修正案**: SYMPTOMS に `weight: 4` field を追加 (省略時 +2)。findings も同様 (省略時 +3)。

### Defect #3: 非Red Flag 時に severityWeight 無視
非 Red Flag 路で `s = matchCount * (1 + prev * 0.15) + prev * 1.5` は sev を使わない。**重症疾患の暗黙ペナルティ**になっている。

**修正案**: 非 Red Flag 時も sev を `+ sev * 0.3` 等で軽く加味、ただし prev を支配しない。

### Defect #4: 負の所見 (negative finding) 未対応
「呼吸困難 + SpO2正常 + 肺音清明」では肺炎確度が下がるが、現在反映なし。

**修正案**: 各 diff に `negativeFindings: [...]` field を追加。該当時 -1.5 (matchCount 下限 0)。

### Defect #5: パターン bonus 未対応
「右季肋部痛 + Murphy + 発熱」のような典型 cluster に bonus がない。

**修正案**: diff.patternBonus = `{ all: ['ruq','murphy_sign','fever'], bonus: 4 }` (任意)。

### Defect #6: alwaysShow=true の濫用境界曖昧
drug_fever は `alwaysShow: true` だが「症状ゼロ + 所見ゼロ」で #1 になる。

**修正案**: `alwaysShow` を廃止し、`minScoreThreshold` (例: prev 値以下なら表示しない) に置換。または `showWhen: (sym, fin) => bool` で条件付き常時表示にする。

### Defect #7: Red Flag 時の prev 重み (×0.3) が低すぎる
低頻度の重症疾患が常に高頻度の中重症疾患を上回る。

**修正案**: 上記 Bug #1 修正で `prev * 0.5` に上げた (本来 1.5 から段階的緩和)。

### Defect #8: severityWeight の閾値 4/5 区分根拠不明
floor 適用が sev≥4 で one-shot 切り替え。

**修正案**: 階段化 (sev=4 → floor 15, sev=5 → floor 25) で discrimination を持たせる。

---

## 第3部: データインベントリ問題 (Audit AI #2)

### 3-1. 主要疾患の cross-reference 不足

| 疾患 | 修正必要 booster |
|---|---|
| **GCA/PMR triangulation** | headacheData ↔ polyarthralgiaData ↔ fatigueData ↔ weightLossData の4方向相互参照 |
| **結核** | abdominalPainData に「腸結核」追加 (現状 fever/weightLoss のみ) |
| **二次梅毒** | feverData にも追加 (現状 lymph/rash のみ) |
| **IgA血管炎 (HSP)** | lymphadenopathyData に追加 |
| **脳幹梗塞 Wallenberg** | syncopeData の「焦点神経症状」red flag 強化 |

### 3-2. ブースター別欠落リスト

**abdominalPainData**:
- 肛門直腸膿瘍
- 腸結核
- 腎梗塞
- 卵巣捻転 (現状疑わしい)
- ectopic_pregnancy の「月経不規則」シンプトム不足

**chestPainData**:
- 肺高血圧症
- 心膜液貯留/タンポナーデ (pericarditis に付随する終末像)

**fatigueData**:
- 敗血症 sepsis (高齢者の非特異的不調 → 重大偽陰性原因)
- 不活動症候群

**feverData**:
- 二次梅毒 (システミック疾患として)
- 抗菌薬使用後 C. difficile colitis

**headacheData**:
- 副鼻腔炎 (一次性ではなく副鼻腔由来の頭痛)
- 緑内障発作 (急性閉塞隅角)

**lymphadenopathyData**:
- IgA血管炎 (頸部リンパ節 10-20%)
- リンゴ病 (Erythema infectiosum)

**polyarthralgiaData**:
- GCA-PMR 合併情報の逆参照
- SLE 筋炎 (CK上昇との鑑別)

**rashData**:
- Sweet症候群 (前駆 AML)

**syncopeData**:
- 慢性肺高血圧症からの失神
- 神経巣症状 red flag 強化 (脳底動脈不全)

**weightLossData**:
- Cancer cachexia と sarcopenia の区別
- GCA/PMR への明示

### 3-3. resolvedStillDangerous フラグ未設定 (要追加)

- headacheData: SAH, meningitis, GCA, 脳静脈血栓症
- rashData: SJS/TEN

### 3-4. nextStep の実行可能性

- abdominalPainData: 「消化器内科紹介」一辺倒 → 一次医療検査 (WBC/CRP/lactate) の明記
- 各 Booster で「当院不可」項目の統一 (syncopeData が良例)

---

## 第4部: UX/医療安全 (Audit AI #3)

### Issue #1【CRITICAL】Phase 進行制御
症状0個でも Phase 2 へ進める可能性 → 「最低1つ選択」hint + Phase 3 jump 廃止。

### Issue #2【CRITICAL】小児疾患 ほぼ全欠落
- feverData: 川崎病・腸重積・細気管支炎・突発性発疹・クループ なし
- abdominalPainData: 腸重積 なし
- rashData: 突発性発疹 なし

**修正案**: 各 Data に `cm_pediatric` modifier 想定で小児鑑別を追加、または小児ブースター (DiagnosticBoosterPediatric) を新設。

### Issue #3【CRITICAL】妊娠合併症 不足
- abdomen: HELLP, eclampsia, fatty liver of pregnancy なし
- chest: peripartum cardiomyopathy なし
- fatigue: 妊娠貧血・甲状腺炎 特記なし

**修正案**: PatientHeader に `pregnancy_status` flag、各 Booster の妊娠時鑑別を活性化。

### Issue #6【WARNING】top-3 のみ open
モバイルで画面切れ → #4 (例: 癌疑い) 見逃し。

**修正案**: severityWeight ≥ 4 は常時 open。または top-5 open。

### Issue #7【WARNING】Wiki リンクの患者前操作
「Wiki詳細ページへ」を医師サイドバーに移動、または「医師向け」タグ。

### Issue #8【WARNING】複数 Booster 統合モード
腎盂腎炎 (発熱+CVA+排尿時痛) のように複数主訴を統合する UI なし。

**修正案**: マルチ主訴 mode (Phase 1 で複数 booster の症状群を同時参照) — ただし大型改修なので v3 候補。

### Issue #10【WARNING】未対応主訴
- 排尿困難 (dysuria 単独)
- 嚥下困難
- 浮腫
- 咳嗽単独

**修正案**: 新規 Booster 追加 or 既存 fever/weightLoss data の symptom list 拡張。

---

## 第5部: 修正優先度 (改修プランナー向け推奨順)

### 🔴 Phase 1 (即修正、1-2日)
1. **Bug #1 修正** — floor を関連 Red Flag に限定 (calcScore 改修)
2. **Phase 進行制御** — 症状 0 個で進めない
3. **resolvedStillDangerous 追加** — SAH/meningitis/SJS-TEN
4. **top-5 open + sev≥4 常時 open**

### 🟡 Phase 2 (1週間)
5. **症状/所見 weight 個別化** — thunderclap/focal_deficit 等を +4 化
6. **negativeFindings 機構** — 「ない」ことの活用
7. **GCA/PMR 4方向 cross-reference** — headache/polyarthralgia/fatigue/weightLoss
8. **データ欠落補完** — sepsis (fatigue), 腸結核 (abdomen), 川崎病 (fever) 等
9. **alwaysShow → showWhen 条件付き化**

### 🟢 Phase 3 (2-3週間)
10. **小児ブースター新設 or modifier 拡張**
11. **妊娠 modifier 強制** — 妊娠可能年齢女性で必須選択
12. **未対応主訴 booster 追加** — 排尿困難/嚥下困難/浮腫
13. **patternBonus 機構**
14. **複数 Booster 統合 mode** (大型)

### 🔵 Phase 4 (継続)
15. nextStep 実行可能性の統一見直し (各 booster で「当院不可」明記)
16. Wiki リンクの医師向け化
17. リセット時の確認ダイアログ

---

## 第6部: 暫定対応 (済)

- Red Flag 警告を画面下部にも再掲表示 (commit `6593adb`) — 画面切れ対策

---

## 監査メソッド

- **AI テスター 10名** (各 booster 1-2人担当): 12-18 シナリオの calcScore 手計算によるランキング検証
- **医療監査 AI 3名** (独立検証): Algorithm/Data inventory/UX-safety
- **再現性**: 全テスターで Bug #1 を同一形式で再現確認 (10/10)
- **総検出件数**: アルゴリズム欠陥 8、データ欠落 11+、UX/安全 10

修正完了後、再度同じ監査 (10+3 並列) を回して合格まで反復することを推奨。
