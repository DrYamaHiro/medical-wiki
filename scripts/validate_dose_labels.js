#!/usr/bin/env node
/**
 * validate_dose_labels.js
 *
 * 同一マスタID (Rx-...) が複数AP テンプレで「異なる用量・期間」で使われているのに
 * 処方行に使い分けラベル「；〜」が付いていないケースを検出する。
 *
 * 使い方:
 *   node scripts/validate_dose_labels.js                 # ver.3.0.3.0/output を検査
 *   node scripts/validate_dose_labels.js <dir>           # 任意ディレクトリ
 *
 * Exit code:
 *   0 = OK (no issues)
 *   1 = issues found (CIで失敗扱い可)
 */

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || 'ver.3.0.3.0/output';
if (!fs.existsSync(targetDir)) {
  console.error(`✗ Directory not found: ${targetDir}`);
  process.exit(2);
}

const files = fs.readdirSync(targetDir).filter((f) => /^\d+-AP-\d+\.txt$/.test(f));
if (files.length === 0) {
  console.error(`✗ No AP template files found in ${targetDir}`);
  process.exit(2);
}

// id -> [{ file, lineStart, doses[], hasLabel, raw }]
const byId = new Map();

for (const f of files) {
  const fp = path.join(targetDir, f);
  const lines = fs.readFileSync(fp, 'utf-8').split(/\r?\n/);
  let currentId = null;
  let currentBlock = [];
  let blockStartLine = 0;

  const flushBlock = () => {
    if (!currentId || currentBlock.length === 0) return;
    const dose = currentBlock.map((l) => l.replace(/；.*$/, '').trim()).join(' | ');
    const hasLabel = currentBlock.some((l) => l.includes('；'));
    const raw = currentBlock.join('\n');
    if (!byId.has(currentId)) byId.set(currentId, []);
    byId.get(currentId).push({ file: f, lineStart: blockStartLine, dose, hasLabel, raw });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idMatch = line.match(/\[ID:\s*(Rx-[A-Za-z0-9_-]+)\]/);
    if (idMatch) {
      flushBlock();
      currentId = idMatch[1];
      currentBlock = [];
      blockStartLine = i + 1;
      continue;
    }
    if (currentId && line.trimStart().startsWith('・')) {
      currentBlock.push(line.trimStart());
      continue;
    }
    // Non-prescription line ends current block
    if (currentId && line.trim() !== '' && !line.trimStart().startsWith('・')) {
      flushBlock();
      currentId = null;
      currentBlock = [];
    }
  }
  flushBlock();
}

// Identify IDs with dose variation lacking labels
const issues = [];
for (const [id, entries] of byId) {
  if (entries.length < 2) continue;
  const uniqueDoses = new Set(entries.map((e) => e.dose));
  if (uniqueDoses.size === 1) continue;
  const unlabeled = entries.filter((e) => !e.hasLabel);
  if (unlabeled.length > 0) {
    issues.push({ id, entries, unlabeled });
  }
}

if (issues.length === 0) {
  console.log(`✓ ${files.length} AP files scanned. All prescription lines with dose variation have rationale labels.`);
  process.exit(0);
}

console.log(`⚠ ${issues.length} master ID(s) have dose/duration variation across templates without rationale labels:\n`);
for (const issue of issues) {
  console.log(`### ${issue.id}`);
  for (const e of issue.entries) {
    const marker = e.hasLabel ? '✓' : '⚠';
    const preview = e.raw.replace(/\n/g, ' / ').slice(0, 100);
    console.log(`  ${marker} ${e.file}:${e.lineStart}  ${preview}`);
  }
  console.log('');
}
console.log(`Add a "；rationale" label to the unlabeled (⚠) prescription lines to clarify why this dose/duration was chosen for the specific indication.`);
process.exit(1);
