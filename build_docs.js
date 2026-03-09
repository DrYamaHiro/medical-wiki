#!/usr/bin/env node
/**
 * build_docs.js v2 — Medical Knowledge Wiki Document Parser
 *
 * ver.2.0.1.0/output/ の分割済みファイルを読み込み、
 * SOAP色分けブロック付きの見やすい MDX を medical-wiki/docs/ に生成します。
 */

const fs   = require('fs');
const path = require('path');

const BASE_DIR   = path.join(__dirname);
const OUTPUT_DIR = path.join(BASE_DIR, 'ver.2.0.1.1', 'output');
const DOCS_DIR   = path.join(BASE_DIR, 'medical-wiki', 'docs');

// =========================================================
// ユーティリティ
// =========================================================

/** 英語文字列をケバブケースに変換 (フォルダ名・ID用) */
function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[()\/\\,]/g, ' ')
    .replace(/[^a-z0-9\s\-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * カタカナ → ひらがな変換
 * 「クラミジア」→「くらみじあ」のように変換して検索キーワードに追加
 */
function kataToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * 疾患名・ICD・英語名から検索キーワード配列を生成
 * カタカナ語のひらがな読み / ICD番号 / 英語略称 を含める
 */
function buildKeywords(icdCode, nameJa, nameEn) {
  const kw = new Set();

  // カタカナ語をひらがなに変換（「くらみじあ」で検索できるように）
  const hira = kataToHira(nameJa);
  if (hira !== nameJa) kw.add(hira);

  // カタカナ単語を個別に抽出してひらがな化（部分一致のため）
  const kataWords = nameJa.match(/[\u30a1-\u30f6ー]+/g) || [];
  for (const w of kataWords) {
    if (w.length >= 2) kw.add(kataToHira(w));
  }

  // ICD コード（括弧なし: A56.0, J00 など）
  kw.add(icdCode);

  // 英語名の各単語（2文字以上）
  const enWords = nameEn.split(/[\s\/\-().,]+/).filter(w => w.length >= 2);
  for (const w of enWords) kw.add(w.toLowerCase());

  return [...kw].filter(Boolean);
}

/** ICD コードを安全なファイル名用識別子に変換 */
function icdToId(icdCode) {
  return icdCode
    .replace(/[\[\]]/g, '')
    .replace(/[\/\\]/g, '-')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * MDX 内で特殊文字をエスケープ
 * JSX コンテキストでは & < > { } が特殊文字
 */
function esc(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

// =========================================================
// テキスト整形
// =========================================================

/**
 * 選択肢形式 "( A / B / C )" の両端括弧を除去して読みやすくする
 * 例: "主訴: ( 発熱 / 咳嗽 )" → "主訴: 発熱 / 咳嗽"
 */
function cleanChoices(text) {
  return text.replace(/\(\s+([^()]+?)\s+\)/g, (_, inner) => inner.trim());
}

/**
 * [ID: XXX] タグの分類:
 *   - Lab / Img / Phy → 検査・画像 → 名称のみ表示
 *   - Rx / Div / Inj / Doc / その他 → 処方・書類 → スキップ
 */
function classifyId(idCode) {
  if (/^(Lab|Img|Phy)-/.test(idCode)) return 'show';
  return 'skip';
}

/**
 * セクション本文をクリーンな Markdown に整形
 *
 * 処理ルール:
 *  1. [ID: Lab/Img]  → "- 検査名" として表示
 *  2. [ID: Rx/Div/Inj/Doc] → 完全スキップ
 *  3. ▼ ... ▼       → #### サブ見出し
 *  4. 【...】         → **サブ見出し**
 *  5. ・薬名…；目的  → "- 薬名 *— 目的*"
 *  6. ・Key: Value   → "- **Key:** Value"
 *  7. ・その他        → "- 内容"
 *  8. ※ 注記         → "> 注記"
 *  9. 通常行          → そのまま (エスケープのみ)
 */
function formatContent(rawText) {
  if (!rawText) return '';

  const lines  = rawText.split('\n').map(l => l.trimEnd());
  const result = [];

  for (const line of lines) {
    const t = line.trim();

    // 空行
    if (!t) { result.push(''); continue; }

    // ── [ID: ...] 行 ──
    const idMatch = t.match(/^\[ID:\s*([\w\-]+)\]\s*(.*)/);
    if (idMatch) {
      const code = idMatch[1];
      const desc = idMatch[2].trim();
      if (classifyId(code) === 'show' && desc) {
        result.push(`- ${esc(desc)}`);
      }
      // skip の場合は何も出力しない
      continue;
    }

    // ── ▼ 処方・アクション ▼ など ──
    const triangleMatch = t.match(/^▼\s*(.+?)\s*▼$/);
    if (triangleMatch) {
      const heading = triangleMatch[1].replace(/[・アクション指導計画処方]/g, '').trim()
                     || triangleMatch[1].trim();
      result.push('');
      result.push(`#### ${esc(triangleMatch[1].trim())}`);
      result.push('');
      continue;
    }

    // ── 【...】 サブ見出し ──
    if (/^【.+】$/.test(t)) {
      const heading = t.replace(/^【/, '').replace(/】$/, '').trim();
      result.push('');
      result.push(`**${esc(heading)}**`);
      result.push('');
      continue;
    }

    // ── ・ から始まる項目 ──
    if (t.startsWith('・')) {
      const content = t.slice(1).trim();
      const cleanedContent = cleanChoices(content);

      // 処方アイテム判定: "1回" "1日" "週X回" "注" などを含む
      const isPrescription = /1回|1日|週\d|連日|皮下注|静注|点滴|点眼|塗布|貼付/.test(content);

      if (isPrescription) {
        // 薬名 ；目的 → "薬名 *— 目的*"
        const parts = content.split(/[；;]/);
        if (parts.length >= 2) {
          const drug    = esc(parts[0].trim());
          const purpose = esc(parts.slice(1).join('').trim());
          result.push(`- ${drug} *— ${purpose}*`);
        } else {
          result.push(`- ${esc(content)}`);
        }
        continue;
      }

      // Key: Value パターン (診断根拠: 〜, 重症度: 〜 など)
      const kvMatch = cleanedContent.match(/^([^:：。]{1,15})[：:]\s+([\s\S]+)/);
      if (kvMatch) {
        result.push(`- **${esc(kvMatch[1])}:** ${esc(kvMatch[2])}`);
        continue;
      }

      // 通常箇条書き
      result.push(`- ${esc(cleanedContent)}`);
      continue;
    }

    // ── ※ / ＊ 注記 ──
    if (t.startsWith('※') || t.startsWith('＊')) {
      result.push(`> ${esc(t)}`);
      continue;
    }

    // ── 通常行 ──
    result.push(esc(cleanChoices(t)));
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// =========================================================
// ファイル解析
// =========================================================

/**
 * AP / SO ファイルを解析してメタデータ・セクション・Dr.Advice を返す
 */
function parseFile(content) {
  const lines  = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result = { metadata: {}, sections: {}, drAdvice: [] };

  let inHeader    = false;
  let headerDone  = false;
  let currentSec  = null;
  let currentLines = [];

  const saveSection = () => {
    if (currentSec && currentLines.length > 0) {
      result.sections[currentSec] = currentLines.join('\n').trim();
    }
    currentSec   = null;
    currentLines = [];
  };

  for (const line of lines) {
    // ── ヘッダー区切り
    if (line.startsWith('================================================================')) {
      if (!headerDone) {
        if (inHeader) { headerDone = true; inHeader = false; }
        else          { inHeader = true; }
      }
      continue;
    }

    // ── ヘッダー内メタデータ
    if (inHeader) {
      const m = line.match(/^([^:：]+)[：:]\s*(.+)$/);
      if (m) result.metadata[m[1].trim()] = m[2].trim();
      continue;
    }

    // ── 終端
    if (line.startsWith('----------------------------------------------------------------')) {
      saveSection();
      break;
    }

    // ── セクションヘッダー <X: 名前>:
    const secMatch = line.match(/^<([^>]+)>:\s*$/);
    if (secMatch) { saveSection(); currentSec = secMatch[1].trim(); continue; }

    // ── Dr.Advice
    const advMatch = line.match(/^▶ Dr\.Advice \[(.+?)\]:\s*(.*)/);
    if (advMatch) {
      saveSection();
      const advContent = advMatch[2].trim();
      if (advContent) {
        result.drAdvice.push({ tag: advMatch[1].trim(), content: advContent });
      }
      continue;
    }

    if (currentSec) currentLines.push(line);
  }
  saveSection();

  return result;
}

// =========================================================
// MDX 生成
// =========================================================

function generateMdx({ apData, soData, sidebarPosition, relatedLinks }) {
  const meta   = apData.metadata;
  const icdRaw = (meta['疾患コード'] || '[???]');
  const icdCode = icdRaw.replace(/[\[\]]/g, '').trim();
  const nameJa  = (meta['疾患名（日本語）'] || '').trim();
  const nameEn  = (meta['疾患名（英語）']   || '').trim();

  const title        = `[${icdCode}] ${nameJa}${nameEn ? ' / ' + nameEn : ''}`;
  const sidebarLabel = `[${icdCode}] ${nameJa}`;

  // YAML フロントマター用: バックスラッシュ・ダブルクォートのみエスケープ
  const titleYaml = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const labelYaml = sidebarLabel.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  // カテゴリインデックスに表示する description
  // 優先順: Dr.Advice[疾患概要] → A:評価の診断根拠 → 英語名
  const descAdvice = [...(soData ? soData.drAdvice : []), ...apData.drAdvice]
    .find(a => a.tag === '疾患概要');
  let description = '';
  if (descAdvice) {
    description = descAdvice.content.trim();
  } else {
    const aText = apData.sections['A: 評価'] || '';
    const diagMatch = aText.match(/診断根拠[：:]\s*(.+)/);
    description = diagMatch ? diagMatch[1].trim() : nameEn;
  }
  const descYaml = description
    ? `description: "${description.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    : '';

  // 検索キーワード（ひらがな読み・ICD・英語名）
  const keywords = buildKeywords(icdCode, nameJa, nameEn);
  const keywordsYaml = keywords.length > 0
    ? `keywords: [${keywords.map(k => `"${k.replace(/"/g, '\\"')}"`).join(', ')}]`
    : '';

  const icdId  = icdToId(icdRaw);
  const enId   = toKebabCase(nameEn || nameJa || 'unknown');
  const docId  = `${icdId}-${enId}`.replace(/-+/g, '-').replace(/^-|-$/g, '');

  // セクション整形
  const secS  = soData ? formatContent(soData.sections['S: 主訴・ROS']    || '') : '';
  const secO  = soData ? formatContent(soData.sections['O: 所見・検査']   || '') : '';
  const secNs = soData ? formatContent(soData.sections['Ns: 診察前対応']  || '') : '';
  const secA  = formatContent(apData.sections['A: 評価']  || '');
  const secP  = formatContent(apData.sections['P: 方針']  || '');

  // Dr.Advice 統合 (SO + AP) — 純粋 Markdown blockquote 形式 (JSX 不使用)
  const allAdvice = [
    ...(soData ? soData.drAdvice : []),
    ...apData.drAdvice,
  ];

  const adviceMd = allAdvice.length > 0
    ? '> 💡 **Dr.Advice**\n>\n'
      + allAdvice.map(a => `> **[${esc(a.tag)}]** ${esc(a.content)}`).join('\n>\n')
      + '\n'
    : '';

  // 関連リンク
  const linksBlock = (relatedLinks || []).map(l => `- [${l.label}](${l.url})`).join('\n')
    || '- [日本内科学会](https://www.naika.or.jp/)';

  // ── MDX テンプレート (フラット構造: JSX ネスト最小化) ──────────────
  // ※ 2 レベル以上の JSX ネスト内で ::: admonition を使うと MDX v3 が
  //   クラッシュして白画面になる → wrapper div を廃止し h3.soap-* を使用
  const mdx = `---
id: ${docId}
title: "${titleYaml}"
sidebar_label: "${labelYaml}"
sidebar_position: ${sidebarPosition}
${descYaml}
${keywordsYaml}
---

<div className="row">
<div className="col col--7">

<h3 className="soap-s">主訴・ROS</h3>

${secS || '*（データなし）*'}

<h3 className="soap-o">所見・検査</h3>

${secO || '*（データなし）*'}

<h3 className="soap-ns">診察前対応</h3>

${secNs || '*（データなし）*'}

<h3 className="soap-a">評価</h3>

${secA || '*（データなし）*'}

<h3 className="soap-p">方針・処方</h3>

${secP || '*（データなし）*'}

${adviceMd}
</div>
<div className="col col--5">

{/* WIKI_EDIT_START */}
## 📖 詳細解説

*最新のガイドラインや病態生理、エビデンスをここに追記できます。ページ下部の「このページを編集」からGitHubで直接編集できます。*

### 病態生理

*（病態生理を記述）*

### 診断基準・鑑別疾患

*（診断基準・鑑別疾患を記述）*

### エビデンス・ガイドライン推奨

*（エビデンス・推奨グレードを記述）*

### 🔗 関連ガイドライン

${linksBlock}
{/* WIKI_EDIT_END */}

</div>
</div>
`;

  return { docId, mdx };
}

// =========================================================
// カテゴリ別関連ガイドラインリンク
// =========================================================
const CATEGORY_LINKS = {
  '010': [{ label: '日本感染症学会', url: 'https://www.kansensho.or.jp/' }],
  '020': [{ label: '日本呼吸器学会 肺炎診療ガイドライン', url: 'https://www.jrs.or.jp/' }],
  '030': [{ label: '日本アレルギー学会 喘息ガイドライン', url: 'https://www.jsaweb.jp/' }],
  '035': [{ label: '日本禁煙学会', url: 'http://www.jstc.or.jp/' }],
  '040': [{ label: '日本耳鼻咽喉科頭頸部外科学会', url: 'https://www.jibika.or.jp/' }],
  '050': [{ label: '日本消化器病学会', url: 'https://www.jsge.or.jp/' }],
  '060': [{ label: '日本消化器病学会 便秘ガイドライン', url: 'https://www.jsge.or.jp/' }],
  '070': [{ label: '日本肝臓学会', url: 'https://www.jsh.or.jp/' }],
  '080': [{ label: '日本高血圧学会 高血圧治療ガイドライン', url: 'https://www.jpnsh.jp/' }],
  '090': [{ label: '日本循環器学会', url: 'https://www.j-circ.or.jp/' }],
  '100': [{ label: '日本脳卒中学会', url: 'https://www.jsts.gr.jp/' }],
  '110': [{ label: '日本糖尿病学会 糖尿病治療ガイド', url: 'https://www.jds.or.jp/' }],
  '120': [{ label: '日本動脈硬化学会 脂質異常症ガイドライン', url: 'https://www.j-athero.org/' }],
  '130': [{ label: '日本甲状腺学会', url: 'https://www.japanthyroid.jp/' }],
  '140': [{ label: '日本頭痛学会 頭痛診療ガイドライン', url: 'https://www.jhsnet.net/' }],
  '150': [{ label: '日本めまい平衡医学会', url: 'https://www.memai.jp/' }],
  '160': [{ label: '日本睡眠学会', url: 'https://jssr.jp/' }],
  '170': [{ label: '日本精神神経学会', url: 'https://www.jspn.or.jp/' }],
  '180': [{ label: '日本認知症学会', url: 'https://www.j-alzheimer.jp/' }],
  '190': [{ label: '日本産科婦人科学会', url: 'https://www.jsog.or.jp/' }],
  '200': [{ label: '日本皮膚科学会', url: 'https://www.dermatol.or.jp/' }],
  '210': [{ label: '日本皮膚科学会', url: 'https://www.dermatol.or.jp/' }],
  '220': [{ label: '日本リウマチ学会', url: 'https://www.ryumachi-jp.com/' }],
  '230': [{ label: '日本整形外科学会', url: 'https://www.joa.or.jp/' }],
  '240': [{ label: '日本骨粗鬆症学会', url: 'https://www.josteo.com/' }],
  '250': [{ label: '日本泌尿器科学会', url: 'https://www.urol.or.jp/' }],
  '260': [{ label: '日本泌尿器科学会', url: 'https://www.urol.or.jp/' }],
  '270': [{ label: '日本腎臓学会 CKD診療ガイドライン', url: 'https://www.jsn.or.jp/' }],
  '280': [{ label: '日本眼科学会', url: 'https://www.nichigan.or.jp/' }],
  '290': [{ label: '日本内科学会', url: 'https://www.naika.or.jp/' }],
  '300': [{ label: '日本救急医学会', url: 'https://www.jaam.jp/' }],
  '310': [{ label: '日本外傷学会', url: 'https://www.jtrauma.or.jp/' }],
  '320': [{ label: '日本血液学会', url: 'https://www.jshem.or.jp/' }],
  '330': [{ label: '日本小児科学会', url: 'https://www.jpeds.or.jp/' }],
  '340': [{ label: '日本小児皮膚科学会', url: 'https://www.pedsderm.jp/' }],
  '350': [{ label: '日本小児科学会', url: 'https://www.jpeds.or.jp/' }],
  '360': [{ label: '日本小児科学会', url: 'https://www.jpeds.or.jp/' }],
  '400': [{ label: '日本在宅医療連合学会', url: 'https://www.jahcm.org/' }],
  '510': [{ label: '厚生労働省 特定健康診査', url: 'https://www.mhlw.go.jp/' }],
  '600': [{ label: '日本救急医学会 ACLS', url: 'https://www.jaam.jp/' }],
  '700': [{ label: '日本美容医療協会', url: 'https://www.jaam.jp/' }],
};

// =========================================================
// メイン処理
// =========================================================

function main() {
  console.log('🏥 Medical Knowledge Wiki — Document Builder v2');
  console.log(`📂 入力: ${OUTPUT_DIR}`);
  console.log(`📂 出力: ${DOCS_DIR}`);
  console.log('');

  // intro.md を退避
  const introPath    = path.join(DOCS_DIR, 'intro.md');
  const introContent = fs.existsSync(introPath) ? fs.readFileSync(introPath, 'utf8') : null;

  // カテゴリフォルダを再生成
  if (fs.existsSync(DOCS_DIR)) {
    for (const entry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        fs.rmSync(path.join(DOCS_DIR, entry.name), { recursive: true, force: true });
      }
    }
  } else {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }
  if (introContent) fs.writeFileSync(introPath, introContent, 'utf8');

  // ── ファイル分類
  const allFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.txt'));
  const apFiles  = allFiles.filter(f => /^\d{3}-AP-\d{2}\.txt$/.test(f)).sort();
  const soFiles  = allFiles.filter(f => /^\d{3}-SO-\d{2}\.txt$/.test(f)).sort();

  console.log(`📋 AP ファイル: ${apFiles.length} 件`);
  console.log(`📋 SO ファイル: ${soFiles.length} 件`);
  console.log('');

  // ── カテゴリ番号でグループ化
  const categoryMap = {};
  for (const f of apFiles) {
    const cat = f.slice(0, 3);
    if (!categoryMap[cat]) categoryMap[cat] = { apFiles: [], soFile: null };
    categoryMap[cat].apFiles.push(f);
  }
  for (const f of soFiles) {
    const cat = f.slice(0, 3);
    if (categoryMap[cat] && (!categoryMap[cat].soFile || f.includes('-SO-01'))) {
      categoryMap[cat].soFile = f;
    }
  }

  let generated = 0;
  let errors    = 0;

  for (const catNum of Object.keys(categoryMap).sort()) {
    const { apFiles: catAPs, soFile } = categoryMap[catNum];

    // カテゴリ情報をAP-01から取得
    const firstContent = fs.readFileSync(path.join(OUTPUT_DIR, catAPs[0]), 'utf8');
    const firstData    = parseFile(firstContent);
    const container    = firstData.metadata['コンテナ'] || '';
    const cmatch       = container.match(/No\.\d+ - ([\w\-]+) \(([^)]+)\)/);
    const catEng       = cmatch ? cmatch[1] : `Cat${catNum}`;
    const catJa        = cmatch ? cmatch[2] : '';

    const catDir = path.join(DOCS_DIR, `${catNum}-${catEng}`);
    fs.mkdirSync(catDir, { recursive: true });

    // _category_.json
    fs.writeFileSync(
      path.join(catDir, '_category_.json'),
      JSON.stringify({
        label:    `${catNum}: ${catEng}（${catJa}）`,
        position: parseInt(catNum, 10),
        link: { type: 'generated-index', description: `${catJa}の診療テンプレート一覧` },
      }, null, 2),
      'utf8',
    );

    // SO-01 解析
    let soData = null;
    if (soFile) {
      soData = parseFile(fs.readFileSync(path.join(OUTPUT_DIR, soFile), 'utf8'));
    }

    const relatedLinks = CATEGORY_LINKS[catNum]
      || [{ label: '日本内科学会', url: 'https://www.naika.or.jp/' }];

    for (const apFile of catAPs) {
      const numMatch = apFile.match(/-AP-(\d+)\.txt$/);
      const apNum    = numMatch ? parseInt(numMatch[1], 10) : 99;

      try {
        const apData = parseFile(fs.readFileSync(path.join(OUTPUT_DIR, apFile), 'utf8'));
        const { docId, mdx } = generateMdx({ apData, soData, sidebarPosition: apNum, relatedLinks });

        fs.writeFileSync(path.join(catDir, `${docId}.mdx`), mdx, 'utf8');
        generated++;

        const icd  = apData.metadata['疾患コード'] || '?';
        const name = apData.metadata['疾患名（日本語）'] || '?';
        console.log(`  ✅ ${catNum}-${catEng}/${docId}.mdx  (${icd} ${name})`);
      } catch (err) {
        console.error(`  ❌ ${apFile}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log('');
  console.log(`✨ 完了: ${generated} ファイル生成、${errors} エラー`);
  console.log(`📁 出力先: ${DOCS_DIR}`);
}

main();
