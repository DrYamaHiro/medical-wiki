import os
import re
import shutil

# --- Configuration ---
SOURCE_FILE = 'ver.2.0.1.0/ver.2.0.1.0.txt'
DOCS_DIR = 'medical-wiki/docs'
CATEGORY_PATTERN = r'={64}\n【(No\.\d+)】(.*?)\n={64}'
DISEASE_PATTERN = r'-{32}'

def slugify(text):
    """Simple kebab-case converter for directory/filenames."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_medical_data():
    if not os.path.exists(SOURCE_FILE):
        print(f"Error: {SOURCE_FILE} not found.")
        return

    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into categories
    # Finding matches for Categories
    categories = re.split(CATEGORY_PATTERN, content)
    # re.split with groups returns [prefix, group1, group2, content_after, ...]
    
    # Clean up docs dir (optional, but requested in spec Step 4)
    # We'll just append for now and let user decide if they want a wipe.
    # Spec says "削除せよ" for default docs, so we'll do that later.

    # Skip first element if it's junk
    idx = 1
    while idx < len(categories):
        cat_id = categories[idx]
        cat_name = categories[idx+1]
        cat_content = categories[idx+2]
        idx += 3

        cat_dir_name = f"{cat_id.replace('No.', '')}-{slugify(cat_name)}"
        cat_path = os.path.join(DOCS_DIR, cat_dir_name)
        os.makedirs(cat_path, exist_ok=True)

        # Split category content into diseases
        diseases = re.split(DISEASE_PATTERN, cat_content)
        
        disease_count = 0
        for disease_block in diseases:
            disease_block = disease_block.strip()
            if not disease_block:
                continue

            # Parse Disease Info
            # Look for [ICD] Name
            title_match = re.search(r'\[(.*?)\] (.*?)\n', disease_block)
            if not title_match:
                continue
            
            icd_code = title_match.group(1)
            disease_name = title_match.group(2)
            disease_count += 1

            # Extract sections
            s_text = extract_section(disease_block, '<S:', ['<O:', '<Ns:', '<A:', '<P:', '▶ Dr.Advice'])
            o_text = extract_section(disease_block, '<O:', ['<S:', '<Ns:', '<A:', '<P:', '▶ Dr.Advice'])
            ns_text = extract_section(disease_block, '<Ns:', ['<S:', '<O:', '<A:', '<P:', '▶ Dr.Advice'])
            a_text = extract_section(disease_block, '<A:', ['<S:', '<O:', '<Ns:', '<P:', '▶ Dr.Advice'])
            p_text = extract_section(disease_block, '<P:', ['<S:', '<O:', '<Ns:', '<A:', '▶ Dr.Advice'])
            
            # Dr.Advice (multiple items possible)
            advices = re.findall(r'▶ Dr\.Advice (.*?)\n', disease_block)
            advice_html = ""
            if advices:
                advice_html = ":::tip Dr.Advice\n" + "\n".join([f"- {a.strip()}" for a in advices]) + "\n:::"

            # Prepare Filename
            safe_name = slugify(f"{icd_code}-{disease_name}")
            file_path = os.path.join(cat_path, f"{safe_name}.mdx")

            # Generate MDX Content
            mdx_content = f"""---
id: {safe_name}
title: "[{icd_code}] {disease_name}"
sidebar_position: {disease_count}
---

<div className="row">
  <div className="col col--7">
    ## 📝 診療テンプレート
    
    ### <S: 主訴・ROS>
    {s_text.strip()}

    ### <O: 所見・検査>
    {o_text.strip()}

    ### <Ns: 診察前対応>
    {ns_text.strip()}

    ### <A: 評価>
    {a_text.strip()}

    ### <P: 方針>
    {p_text.strip()}

    {advice_html}
  </div>
  
  <div className="col col--5">
    ## 📖 教科書的詳細解説
    :::info Wiki編集エリア
    この右側のエリアは、最新のガイドラインや病態生理、エビデンスを追記するためのスペースです。
    ページ下部の「このページを編集」から追記・修正を行ってください。
    :::
    
    ### 🔗 関連リンク・文献
    - [国内ガイドライン検索](https://www.google.com/search?q={disease_name}+ガイドライン)
  </div>
</div>
"""
            with open(file_path, 'w', encoding='utf-8') as f_out:
                f_out.write(mdx_content)

    print("Parsing completed.")

def extract_section(text, start_marker, next_markers):
    start_idx = text.find(start_marker)
    if start_idx == -1:
        return ""
    
    # Move start_idx to after the marker
    # Wait, the spec shows markers like <S: 主訴・ROS>
    # The actual text might have trailing colon or space
    content_start = text.find('\n', start_idx)
    if content_start == -1:
        content_start = start_idx + len(start_marker)
    
    # Find the nearest next marker
    end_idx = len(text)
    for marker in next_markers:
        pos = text.find(marker, content_start)
        if pos != -1 and pos < end_idx:
            end_idx = pos
            
    return text[content_start:end_idx].strip()

if __name__ == "__main__":
    parse_medical_data()
