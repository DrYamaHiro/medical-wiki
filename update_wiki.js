#!/usr/bin/env node
/**
 * update_wiki.js — Wiki更新スクリプト
 *
 * 使い方:
 *   node update_wiki.js ver.2.0.1.2
 *
 * 処理の流れ:
 *   1. git pull で最新のWiki編集を取得
 *   2. 既存MDXファイルからユーザー編集部分を退避
 *   3. build_docs.js のバージョンを更新
 *   4. node build_docs.js で再生成
 *   5. 退避した編集内容を復元
 *   6. git add/commit/push
 */

const fs     = require('fs');
const path   = require('path');
const { execSync } = require('child_process');

const BASE_DIR  = path.join(__dirname);
const DOCS_DIR  = path.join(BASE_DIR, 'medical-wiki', 'docs');
const BUILD_JS  = path.join(BASE_DIR, 'build_docs.js');

const MARKER_START = '{/* WIKI_EDIT_START */}';
const MARKER_END   = '{/* WIKI_EDIT_END */}';

// =========================================================
// 引数チェック
// =========================================================
const newVersion = process.argv[2];
if (!newVersion) {
  console.error('❌ バージョンを引数で指定してください。例: node update_wiki.js ver.2.0.1.2');
  process.exit(1);
}

const newOutputDir = path.join(BASE_DIR, newVersion, 'output');
if (!fs.existsSync(newOutputDir)) {
  console.error(`❌ バージョンディレクトリが見つかりません: ${newOutputDir}`);
  process.exit(1);
}

// =========================================================
// ユーティリティ
// =========================================================

function run(cmd, label) {
  console.log(`\n▶ ${label}`);
  console.log(`  $ ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: BASE_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (out.trim()) console.log(out.trim().split('\n').map(l => '  ' + l).join('\n'));
    return out;
  } catch (err) {
    console.error(`  ⚠ ${err.message}`);
    return '';
  }
}

/** MDXファイルからWiki編集部分（マーカー間）を抽出 */
function extractWikiEdit(content) {
  const startIdx = content.indexOf(MARKER_START);
  const endIdx   = content.indexOf(MARKER_END);
  if (startIdx === -1 || endIdx === -1) return null;
  return content.slice(startIdx + MARKER_START.length, endIdx).trim();
}

/** MDXファイルのWiki編集部分を置換 */
function injectWikiEdit(content, savedEdit) {
  const startIdx = content.indexOf(MARKER_START);
  const endIdx   = content.indexOf(MARKER_END);
  if (startIdx === -1 || endIdx === -1) return content;
  return (
    content.slice(0, startIdx + MARKER_START.length) +
    '\n' + savedEdit + '\n' +
    content.slice(endIdx)
  );
}

// =========================================================
// Step 1: git pull で最新編集を取得
// =========================================================
console.log('='.repeat(60));
console.log('🔄 Wiki更新スクリプト');
console.log(`📦 新バージョン: ${newVersion}`);
console.log('='.repeat(60));

run('git pull origin master', 'GitHub から最新のWiki編集を取得');

// =========================================================
// Step 2: 既存MDXのWiki編集内容を退避
// =========================================================
console.log('\n▶ 既存MDXからWiki編集部分を退避');

const savedEdits = {}; // { 'カテゴリ/ファイル名.mdx': '編集内容' }
let savedCount = 0;
let defaultCount = 0;

const DEFAULT_EDIT_PATTERN = '## 📖 教科書的詳細解説\n\n*最新のガイドライン';

if (fs.existsSync(DOCS_DIR)) {
  for (const catEntry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
    if (!catEntry.isDirectory()) continue;
    const catDir = path.join(DOCS_DIR, catEntry.name);
    for (const fileEntry of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (!fileEntry.name.endsWith('.mdx')) continue;
      const filePath  = path.join(catDir, fileEntry.name);
      const content   = fs.readFileSync(filePath, 'utf8');
      const wikiEdit  = extractWikiEdit(content);
      if (wikiEdit === null) continue;

      const key = `${catEntry.name}/${fileEntry.name}`;
      // デフォルト内容と同じなら保存しない（ユーザー編集なし）
      if (wikiEdit.startsWith(DEFAULT_EDIT_PATTERN)) {
        defaultCount++;
      } else {
        savedEdits[key] = wikiEdit;
        savedCount++;
        console.log(`  💾 編集保存: ${key}`);
      }
    }
  }
}

console.log(`  → ${savedCount} 件の編集を保存、${defaultCount} 件はデフォルト（スキップ）`);

// =========================================================
// Step 3: build_docs.js のバージョンを更新
// =========================================================
console.log(`\n▶ build_docs.js のバージョンを ${newVersion} に更新`);

let buildContent = fs.readFileSync(BUILD_JS, 'utf8');
buildContent = buildContent.replace(
  /const OUTPUT_DIR = path\.join\(BASE_DIR, '([^']+)', 'output'\);/,
  `const OUTPUT_DIR = path.join(BASE_DIR, '${newVersion}', 'output');`
);
fs.writeFileSync(BUILD_JS, buildContent, 'utf8');
console.log('  ✅ 更新完了');

// =========================================================
// Step 4: MDX再生成
// =========================================================
run('node build_docs.js', 'MDX再生成');

// =========================================================
// Step 5: 退避した編集内容を復元
// =========================================================
if (savedCount > 0) {
  console.log('\n▶ Wiki編集内容を復元');
  let restored = 0;
  let notFound = 0;

  for (const [key, savedEdit] of Object.entries(savedEdits)) {
    const filePath = path.join(DOCS_DIR, key);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ ファイルが見つかりません（疾患名変更？）: ${key}`);
      notFound++;
      continue;
    }
    const content    = fs.readFileSync(filePath, 'utf8');
    const newContent = injectWikiEdit(content, savedEdit);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  ✅ 復元: ${key}`);
    restored++;
  }
  console.log(`  → ${restored} 件復元、${notFound} 件未マッチ`);
} else {
  console.log('\n▶ 保存された編集なし（復元スキップ）');
}

// =========================================================
// Step 6: git add / commit / push
// =========================================================
run(`git add medical-wiki/docs/ build_docs.js ${newVersion}/`, 'git add');
run(`git commit -m "Update wiki to ${newVersion}"`, 'git commit');
run('git push origin HEAD:master', 'git push → GitHub Actions が自動デプロイ');

console.log('\n' + '='.repeat(60));
console.log('✨ 完了！GitHub Actions のビルドが完了すれば反映されます（約2〜3分）');
console.log('   https://dryamahiro.github.io/medical-wiki/');
console.log('='.repeat(60));
