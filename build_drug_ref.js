const fs = require('fs');
const path = require('path');

const DRUGS_DIR = path.join(__dirname, 'aeon_ph', 'drugs');
const OUTPUT_DIR = path.join(__dirname, 'medical-wiki', 'docs', '800-Drug-Reference');

const categories = [
  { file: 'RX-01_infection.txt', id: 'rx-01-infection', title: '感染症治療薬', label: 'RX-01 感染症治療薬', position: 1, icon: '🦠' },
  { file: 'RX-02_analgesics.txt', id: 'rx-02-analgesics', title: '解熱鎮痛薬・抗炎症薬', label: 'RX-02 解熱鎮痛薬', position: 2, icon: '💊' },
  { file: 'RX-03_allergy.txt', id: 'rx-03-allergy', title: 'アレルギー・免疫', label: 'RX-03 アレルギー', position: 3, icon: '🤧' },
  { file: 'RX-04_respiratory.txt', id: 'rx-04-respiratory', title: '呼吸器系', label: 'RX-04 呼吸器系', position: 4, icon: '🫁' },
  { file: 'RX-05_gastrointestinal.txt', id: 'rx-05-gastrointestinal', title: '消化器系', label: 'RX-05 消化器系', position: 5, icon: '🫃' },
  { file: 'RX-06_cardiovascular.txt', id: 'rx-06-cardiovascular', title: '循環器系', label: 'RX-06 循環器系', position: 6, icon: '❤️' },
  { file: 'RX-07_antithrombotic.txt', id: 'rx-07-antithrombotic', title: '抗血栓薬', label: 'RX-07 抗血栓薬', position: 7, icon: '🩸' },
  { file: 'RX-08_metabolic.txt', id: 'rx-08-metabolic', title: '脂質異常症・代謝', label: 'RX-08 脂質・代謝', position: 8, icon: '🧪' },
  { file: 'RX-09_diabetes.txt', id: 'rx-09-diabetes', title: '糖尿病治療薬', label: 'RX-09 糖尿病', position: 9, icon: '🩺' },
  { file: 'RX-10_endocrine.txt', id: 'rx-10-endocrine', title: '内分泌・甲状腺・骨粗鬆症', label: 'RX-10 内分泌', position: 10, icon: '🦴' },
  { file: 'RX-11_neuropsych.txt', id: 'rx-11-neuropsych', title: '神経・精神科', label: 'RX-11 神経・精神', position: 11, icon: '🧠' },
  { file: 'RX-12_urology.txt', id: 'rx-12-urology', title: '泌尿器・腎臓', label: 'RX-12 泌尿器', position: 12, icon: '🫘' },
  { file: 'RX-13_dermatology.txt', id: 'rx-13-dermatology', title: '皮膚科', label: 'RX-13 皮膚科', position: 13, icon: '🧴' },
  { file: 'RX-14_ent_ophth.txt', id: 'rx-14-ent-ophth', title: '眼科・耳鼻科', label: 'RX-14 眼科・耳鼻科', position: 14, icon: '👁️' },
  { file: 'RX-15_kampo.txt', id: 'rx-15-kampo', title: '漢方薬', label: 'RX-15 漢方薬', position: 15, icon: '🌿' },
  { file: 'RX-16_vitamins.txt', id: 'rx-16-vitamins', title: 'ビタミン・栄養素', label: 'RX-16 ビタミン', position: 16, icon: '🍊' },
  { file: 'RX-17_vaccines.txt', id: 'rx-17-vaccines', title: 'ワクチン・生物学的製剤', label: 'RX-17 ワクチン', position: 17, icon: '💉' },
  { file: 'RX-18_others.txt', id: 'rx-18-others', title: 'その他', label: 'RX-18 その他', position: 18, icon: '📦' },
];

function escapeMdx(text) {
  // Escape JSX-problematic characters in content
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function convertToMdx(content, category) {
  const lines = content.split('\n');
  let mdxLines = [];
  let inDrugEntry = false;
  let drugCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip the file header (first few lines with ===)
    if (i < 10 && trimmed.startsWith('CS Drug Reference')) continue;
    if (i < 10 && trimmed.startsWith('カテゴリ:')) continue;
    if (i < 10 && trimmed.startsWith('作成日:')) continue;
    if (i < 10 && trimmed.startsWith('薬剤数:')) continue;

    // Drug entry separator
    if (trimmed === '================================================================') {
      if (inDrugEntry) {
        mdxLines.push('</details>\n');
        inDrugEntry = false;
      }
      // Check if next line is a drug name
      const nextLine = (lines[i + 1] || '').trim();
      if (nextLine && !nextLine.startsWith('CS Drug') && !nextLine.startsWith('表記ルール') && nextLine !== '') {
        // This is a drug entry header
        const drugName = escapeMdx(nextLine);
        drugCount++;
        mdxLines.push(`\n<details>`);
        mdxLines.push(`<summary><strong>${drugName}</strong></summary>\n`);
        inDrugEntry = true;
        i++; // skip the drug name line
      }
      continue;
    }

    // Skip trailing rules section
    if (trimmed.startsWith('表記ルール')) {
      if (inDrugEntry) {
        mdxLines.push('</details>\n');
        inDrugEntry = false;
      }
      break;
    }

    if (!inDrugEntry && trimmed === '') continue;
    if (!inDrugEntry && !trimmed.startsWith('【')) {
      // Could be a preamble like the kampo glycyrrhiza table
      mdxLines.push(escapeMdx(line));
      continue;
    }

    // Section headers within drug entry
    if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
      const header = trimmed.replace('【', '').replace('】', '');
      mdxLines.push(`\n**${escapeMdx(header)}**\n`);
      continue;
    }

    // Subsection lines (商品名:, カテゴリ:, etc.)
    if (trimmed.match(/^(商品名|カテゴリ|剤型|薬価|後発品|薬品区分|構成生薬):/)) {
      // Skip separator line
      if (trimmed === '----------------------------------------------------------------') continue;
      mdxLines.push(escapeMdx(line));
      continue;
    }

    if (trimmed === '----------------------------------------------------------------') continue;

    // Regular content
    mdxLines.push(escapeMdx(line));
  }

  if (inDrugEntry) {
    mdxLines.push('</details>\n');
  }

  return { content: mdxLines.join('\n'), drugCount };
}

// Main
let totalDrugs = 0;
let totalFiles = 0;

for (const cat of categories) {
  const srcPath = path.join(DRUGS_DIR, cat.file);
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠ Skip: ${cat.file} not found`);
    continue;
  }

  const rawContent = fs.readFileSync(srcPath, 'utf-8');
  const { content: mdxBody, drugCount } = convertToMdx(rawContent, cat);

  const keywords = [cat.title, 'CS Drug Reference', '薬剤', '処方'];

  const mdx = `---
id: ${cat.id}
title: "${cat.icon} ${cat.title}"
sidebar_label: "${cat.label}"
sidebar_position: ${cat.position}
hide_table_of_contents: false
description: "CS Drug Reference - ${cat.title}"
keywords: ${JSON.stringify(keywords)}
---

# ${cat.icon} ${cat.title}

:::info CS Drug Reference
各薬剤の薬理・適応・用法用量・禁忌・処方のポイント・調剤薬局での採用状況を収録しています。
:::

${mdxBody}
`;

  const outPath = path.join(OUTPUT_DIR, `${cat.id}.mdx`);
  fs.writeFileSync(outPath, mdx, 'utf-8');
  totalDrugs += drugCount;
  totalFiles++;
  console.log(`✅ ${cat.file} → ${cat.id}.mdx (${drugCount} drugs)`);
}

console.log(`\n✨ 完了: ${totalFiles} ファイル生成、${totalDrugs} 薬剤エントリ`);
