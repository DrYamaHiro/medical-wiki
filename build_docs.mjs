import fs from 'fs';
import path from 'path';

// --- Configuration ---
const SOURCE_FILE = 'ver.2.0.1.0/ver.2.0.1.0.txt';
const DOCS_DIR = 'medical-wiki/docs';
const CATEGORY_PATTERN = /={64}\n【(No\.\d+)】(.*?)\n={64}/g;
const DISEASE_PATTERN = /-{32}/;

function slugify(text) {
    if (!text) return "";
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function escapeJS(text) {
    if (!text) return "";
    return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function extractSection(text, startMarker, nextMarkers) {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return "";

    let contentStart = text.indexOf('\n', startIdx);
    if (contentStart === -1) contentStart = startIdx + startMarker.length;

    let endIdx = text.length;
    for (const marker of nextMarkers) {
        const pos = text.indexOf(marker, contentStart);
        if (pos !== -1 && pos < endIdx) {
            endIdx = pos;
        }
    }
    return text.substring(contentStart, endIdx).trim();
}

function parse() {
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`Error: ${SOURCE_FILE} not found.`);
        return;
    }

    // Clear previous build to remove stale files (like old template-only pages)
    if (fs.existsSync(DOCS_DIR)) {
        fs.rmSync(DOCS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DOCS_DIR, { recursive: true });

    const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
    const matches = [...content.matchAll(CATEGORY_PATTERN)];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const catId = match[1];
        const catName = match[2];
        const startPos = match.index + match[0].length;
        const endPos = (i + 1 < matches.length) ? matches[i + 1].index : content.length;

        const catContent = content.substring(startPos, endPos);
        const catNo = catId.replace('No.', '');
        const catDirName = `${catNo}-${slugify(catName)}`;
        const catPath = path.join(DOCS_DIR, catDirName);

        if (!fs.existsSync(catPath)) {
            fs.mkdirSync(catPath, { recursive: true });
        }

        // Create _category_.json for sidebar label
        const categoryMetadata = {
            label: `${catNo} ${catName}`,
            position: i + 1
        };
        fs.writeFileSync(path.join(catPath, '_category_.json'), JSON.stringify(categoryMetadata, null, 2));

        const blocks = catContent.split(DISEASE_PATTERN);

        let initialVisitTemplate = null;
        let followupVisitTemplate = null;
        const diseaseBlocks = [];

        // First pass: extract visit templates
        for (let block of blocks) {
            block = block.trim();
            if (!block) continue;

            if (block.includes('(初診)')) {
                initialVisitTemplate = {
                    sText: extractSection(block, '<S:', ['<O:', '<Ns:', '▶ Dr.Advice']),
                    oText: extractSection(block, '<O:', ['<Ns:', '▶ Dr.Advice']),
                    nsText: extractSection(block, '<Ns:', ['▶ Dr.Advice']),
                    advice: [...block.matchAll(/▶ Dr\.Advice (.*?)\n/g)].map(m => m[1].trim()).join('\n')
                };
            } else if (block.includes('(再診)')) {
                followupVisitTemplate = {
                    sText: extractSection(block, '<S:', ['<O:', '▶ Dr.Advice']),
                    oText: extractSection(block, '<O:', ['▶ Dr.Advice']),
                    advice: [...block.matchAll(/▶ Dr\.Advice (.*?)\n/g)].map(m => m[1].trim()).join('\n')
                };
            } else {
                diseaseBlocks.push(block);
            }
        }

        let diseaseCount = 0;
        for (let block of diseaseBlocks) {
            const titleMatch = block.match(/\[(.*?)\] (.*?)\n/);
            if (!titleMatch) continue;

            const icdCode = titleMatch[1];
            const diseaseName = titleMatch[2];
            diseaseCount++;

            // Local S/O extraction for blocks without (初診)/(再診) markers
            const localS = extractSection(block, '<S:', ['<O:', '<Ns:', '<A:', '<P:', '▶ Dr.Advice']);
            const localO = extractSection(block, '<O:', ['<Ns:', '<A:', '<P:', '▶ Dr.Advice']);
            const localNs = extractSection(block, '<Ns:', ['<A:', '<P:', '▶ Dr.Advice']);
            const localAdvice = [...block.matchAll(/▶ Dr\.Advice (.*?)(?:\n|$)/g)].map(m => m[1].trim()).join('\n');

            const assessment = extractSection(block, '<A:', ['<P:', '▶ Dr.Advice']);
            const plan = extractSection(block, '<P:', ['▶ Dr.Advice']);

            // Fallback logic
            const initialS = localS || initialVisitTemplate?.sText || "";
            const initialO = localO || initialVisitTemplate?.oText || "";
            const initialNs = localNs || initialVisitTemplate?.nsText || "";
            const initialAdv = localAdvice || initialVisitTemplate?.advice || "";

            const safeName = slugify(`${icdCode}-${diseaseName}`);
            const filePath = path.join(catPath, `${safeName}.mdx`);

            const mdxContent = `---
title: "[${icdCode}] ${diseaseName}"
sidebar_position: ${diseaseCount}
---

import MedicalEntry from '@site/src/components/MedicalEntry';

<MedicalEntry
  diseaseName="${escapeJS(diseaseName)}"
  icdCode="${escapeJS(icdCode)}"
  initialVisit={{
    sText: \`${escapeJS(initialS)}\`,
    oText: \`${escapeJS(initialO)}\`,
    nsText: \`${escapeJS(initialNs)}\`,
    advice: \`${escapeJS(initialAdv)}\`
  }}
  followupVisit={{
    sText: \`${escapeJS(followupVisitTemplate?.sText || "")}\`,
    oText: \`${escapeJS(followupVisitTemplate?.oText || "")}\`,
    advice: \`${escapeJS(followupVisitTemplate?.advice || "")}\`
  }}
  assessment={\`${escapeJS(assessment)}\`}
  plan={\`${escapeJS(plan)}\`}
  drAdvice={\`${escapeJS(localAdvice)}\`}
>
  :::info Wiki編集エリア
  この右側のエリアは、最新のガイドラインや病態生理、エビデンスを追記するためのスペースです。
  ファイルを直接編集して追記・修正を行ってください。
  :::
  
  ### 🔗 関連リンク・文献
  - [国内ガイドライン検索](https://www.google.com/search?q=${encodeURIComponent(diseaseName)}+ガイドライン)
</MedicalEntry>
`;
            fs.writeFileSync(filePath, mdxContent);
        }
    }
    console.log("Parsing completed with improved sidebar labels and fallback S/O logic.");
}

parse();
