/**
 * 略語 → 正式名称マップ
 * コメディカル (看護師・薬剤師・栄養士・事務) も使う想定で、医学略語をホバーで展開可能に。
 */

export const ABBREVIATIONS = {
  // 疾患
  HT: '高血圧 (Hypertension)',
  DM: '糖尿病 (Diabetes Mellitus)',
  T1DM: '1型糖尿病',
  T2DM: '2型糖尿病',
  GDM: '妊娠糖尿病 (Gestational Diabetes Mellitus)',
  DLP: '脂質異常症 (Dyslipidemia)',
  FH: '家族性高コレステロール血症 (Familial Hypercholesterolemia)',
  HoFH: 'ホモ接合体FH',
  HeFH: 'ヘテロ接合体FH',
  CKD: '慢性腎臓病 (Chronic Kidney Disease)',
  HF: '心不全 (Heart Failure)',
  HFrEF: '駆出率低下心不全 (HF with reduced EF, EF≤40%、4本柱: ARNI/ACEi+βB+MRA+SGLT2i)',
  HFpEF: '駆出率保持心不全 (HF with preserved EF, EF≥50%、第一選択: SGLT2i)',
  HFmrEF: '中間範囲駆出率心不全 (HF with mid-range EF, EF 41-49%)',
  AF: '心房細動 (Atrial Fibrillation)',
  ACS: '急性冠症候群 (Acute Coronary Syndrome)',
  ASCVD: '動脈硬化性心血管疾患 (Atherosclerotic Cardiovascular Disease)',
  CAD: '冠動脈疾患 (Coronary Artery Disease)',
  MI: '心筋梗塞 (Myocardial Infarction)',
  PCI: '経皮的冠動脈インターベンション (Percutaneous Coronary Intervention)',
  CABG: '冠動脈バイパス術 (Coronary Artery Bypass Grafting)',
  PAD: '末梢動脈疾患 (Peripheral Artery Disease)',
  TIA: '一過性脳虚血発作 (Transient Ischemic Attack)',
  COPD: '慢性閉塞性肺疾患 (Chronic Obstructive Pulmonary Disease)',
  ACO: '喘息-COPDオーバーラップ (Asthma-COPD Overlap)',
  AERD: 'アスピリン誘発呼吸器疾患 (Aspirin-Exacerbated Respiratory Disease、Samter triad: 喘息+鼻茸+NSAID不耐)',
  OSAS: '閉塞性睡眠時無呼吸症候群 (Obstructive Sleep Apnea Syndrome)',
  MOH: '薬物乱用頭痛 (Medication Overuse Headache)',
  IBS: '過敏性腸症候群 (Irritable Bowel Syndrome)',
  OIC: 'オピオイド誘発便秘 (Opioid-Induced Constipation)',
  CIC: '慢性特発性便秘 (Chronic Idiopathic Constipation)',

  // 薬剤クラス
  ARB: 'アンジオテンシンII受容体拮抗薬 (Angiotensin II Receptor Blocker)',
  ACEi: 'アンジオテンシン変換酵素阻害薬 (ACE Inhibitor)',
  CCB: 'カルシウム拮抗薬 (Calcium Channel Blocker)',
  DHP: 'ジヒドロピリジン系 (Dihydropyridine)',
  MRA: 'ミネラルコルチコイド受容体拮抗薬 (Mineralocorticoid Receptor Antagonist)',
  ARNI: 'アンジオテンシン受容体ネプリライシン阻害薬 (サクビトリル + バルサルタン、エンレスト)',
  SGLT2i: 'ナトリウム/グルコース共役輸送体2阻害薬 (Sodium-Glucose Cotransporter 2 Inhibitor)',
  'GLP-1RA': 'グルカゴン様ペプチド-1受容体作動薬 (Glucagon-Like Peptide-1 Receptor Agonist)',
  'DPP-4i': 'ジペプチジルペプチダーゼ-4阻害薬',
  SU: 'スルホニル尿素薬 (Sulfonylurea)',
  TZD: 'チアゾリジン薬 (Thiazolidinedione)',
  'α-GI': 'α-グルコシダーゼ阻害薬',
  PCSK9i: 'PCSK9阻害薬 (Proprotein Convertase Subtilisin/Kexin 9 Inhibitor)',
  ICS: '吸入ステロイド (Inhaled Corticosteroid)',
  LABA: '長時間作動性β2刺激薬 (Long-Acting β2 Agonist)',
  LAMA: '長時間作動性抗コリン薬 (Long-Acting Muscarinic Antagonist)',
  SABA: '短時間作動性β2刺激薬 (Short-Acting β2 Agonist)',
  SAMA: '短時間作動性抗コリン薬',
  LTRA: 'ロイコトリエン受容体拮抗薬 (Leukotriene Receptor Antagonist)',
  OCS: '経口ステロイド (Oral Corticosteroid)',
  PSL: 'プレドニゾロン',
  DOAC: '直接経口抗凝固薬 (Direct Oral Anticoagulant)',
  NSAID: '非ステロイド性抗炎症薬 (Non-Steroidal Anti-Inflammatory Drug)',
  PPI: 'プロトンポンプ阻害薬',
  TCA: '三環系抗うつ薬 (Tricyclic Antidepressant)',
  BZ: 'ベンゾジアゼピン (Benzodiazepine)',
  XOI: 'キサンチンオキシダーゼ阻害薬 (Xanthine Oxidase Inhibitor)',
  CGRP: 'カルシトニン遺伝子関連ペプチド (Calcitonin Gene-Related Peptide)',
  MART: '維持療法+リリーバー兼用治療 (Maintenance and Reliever Therapy)',
  ULT: '尿酸降下療法 (Urate-Lowering Therapy)',
  HOT: '在宅酸素療法 (Home Oxygen Therapy)',
  CPAP: '持続陽圧呼吸療法',
  ESA: '赤血球造血刺激因子製剤 (Erythropoiesis-Stimulating Agent)',
  'HIF-PHD': 'HIFプロリン水酸化酵素阻害薬',

  // 検査値・指標
  SBP: '収縮期血圧 (Systolic Blood Pressure)',
  DBP: '拡張期血圧 (Diastolic Blood Pressure)',
  BP: '血圧 (Blood Pressure)',
  LDL: 'LDLコレステロール (Low-Density Lipoprotein Cholesterol)',
  'LDL-C': 'LDLコレステロール',
  HDL: 'HDLコレステロール (High-Density Lipoprotein Cholesterol)',
  'HDL-C': 'HDLコレステロール',
  TG: 'トリグリセリド (Triglyceride、中性脂肪)',
  'non-HDL': '非HDLコレステロール',
  HbA1c: 'ヘモグロビンA1c (糖化ヘモグロビン)',
  FPG: '空腹時血糖 (Fasting Plasma Glucose)',
  PPG: '食後血糖',
  eGFR: '推算糸球体濾過量 (estimated Glomerular Filtration Rate, mL/min/1.73m²)',
  UACR: '尿アルブミン/クレアチニン比 (Urinary Albumin-to-Creatinine Ratio)',
  Cr: 'クレアチニン (Creatinine)',
  BUN: '尿素窒素 (Blood Urea Nitrogen)',
  BMI: '体格指数 (Body Mass Index, kg/m²)',
  SUA: '血清尿酸値 (Serum Uric Acid)',
  EF: '左室駆出率 (Ejection Fraction)',
  LVEF: '左室駆出率',
  BNP: '脳性ナトリウム利尿ペプチド',
  'NT-proBNP': 'N末端プロBNP',
  'PT-INR': 'プロトロンビン時間-国際標準比 (Prothrombin Time-International Normalized Ratio)',
  CK: 'クレアチンキナーゼ',
  ALT: 'アラニンアミノ転移酵素 (GPT)',
  AST: 'アスパラギン酸アミノ転移酵素 (GOT)',
  CrCl: 'クレアチニンクリアランス',
  IgE: '免疫グロブリンE',
  eos: '末梢血好酸球数 (eosinophil count, /μL)',
  FeNO: '呼気一酸化窒素濃度',
  ACT: '喘息コントロールテスト (Asthma Control Test)',
  CAT: 'COPD評価テスト (COPD Assessment Test)',
  mMRC: '修正MRC息切れスケール (modified Medical Research Council Dyspnea Scale)',
  NYHA: 'NYHA心機能分類 (New York Heart Association)',
  MIDAS: '片頭痛障害評価スコア',
  'PHQ-9': '患者健康質問票9項目 (Patient Health Questionnaire-9、うつ評価)',
  ISI: '不眠重症度指数 (Insomnia Severity Index)',
  MMSE: 'ミニメンタルステート検査 (Mini-Mental State Examination)',
  'HDS-R': '改訂長谷川式簡易知能評価スケール',
  GAGS: 'ニキビ重症度評価スケール (Global Acne Grading System)',
  EASI: '湿疹面積・重症度指数',
  PASI: '乾癬面積・重症度指数',
  UAS7: '蕁麻疹活動性スコア (週版)',
  'CHA₂DS₂-VASc': '脳卒中リスクスコア (心不全/HT/年齢/糖尿病/脳卒中既往/血管病/性別)',
  'HAS-BLED': '出血リスクスコア (HT/腎肝機能/脳卒中/出血歴/INR不安定/年齢/薬剤・アルコール)',

  // ガイドライン
  JSH2025: '日本高血圧学会 高血圧治療ガイドライン2025',
  JSH2019: '日本高血圧学会 高血圧治療ガイドライン2019',
  JDS2024: '日本糖尿病学会 糖尿病診療ガイドライン2024',
  JAS2022: '日本動脈硬化学会 動脈硬化性疾患予防ガイドライン2022',
  JCS2024: '日本循環器学会 ガイドライン2024',
  'JCS2020-AF': '日本循環器学会 不整脈非薬物治療ガイドライン2020',
  'JGS/JDS2023': '日本老年医学会・日本糖尿病学会 高齢者糖尿病診療ガイドライン2023',
  KDIGO: '国際腎臓病ガイドライン機構 (Kidney Disease: Improving Global Outcomes)',
  'KDIGO 2024': 'KDIGO CKD ガイドライン2024',
  GOLD: 'COPDガイドライン (Global Initiative for Chronic Obstructive Lung Disease)',
  'GOLD 2024': 'GOLD COPDガイドライン2024',
  GINA: '喘息ガイドライン (Global Initiative for Asthma)',
  'GINA 2024': 'GINA 喘息ガイドライン2024',
  JGL2024: '日本アレルギー学会 喘息予防・管理ガイドライン2024',
  'ICHD-3': '国際頭痛分類第3版 (International Classification of Headache Disorders)',
  ESC: '欧州心臓病学会 (European Society of Cardiology)',
  AHA: '米国心臓協会',
  ACC: '米国心臓病学会',
  ADA: '米国糖尿病学会',

  // 副作用・有害事象
  'SJS/TEN': 'スティーブンス・ジョンソン症候群 / 中毒性表皮壊死症 (重症皮膚障害)',
  DIHS: '薬剤性過敏症症候群',
  AKI: '急性腎障害',
  DKA: '糖尿病性ケトアシドーシス',
  HHS: '高浸透圧高血糖状態',
  SAMS: 'スタチン関連筋症状',
  SSI: '手術部位感染',
  VTE: '静脈血栓塞栓症',
  DVT: '深部静脈血栓症',
  PE: '肺塞栓症',
  HIT: 'ヘパリン起因性血小板減少症',

  // 遺伝子・分子
  'HLA-B*5801': 'ヒト白血球抗原 B*5801 (アロプリノールSJS/TENリスク遺伝子、アジア人約20%陽性)',
  'CYP3A4': 'シトクロムP450 3A4 (薬物代謝酵素)',

  // 予防・治療概念
  CBT: '認知行動療法 (Cognitive Behavioral Therapy)',
  'CBT-I': '不眠認知行動療法',
  RAS: 'レニン・アンジオテンシン系',
  'TG≥500': 'トリグリセリド 500mg/dL以上 (膵炎リスク)',
  'eGFR<30': 'eGFR 30未満 (高度CKD/G4-5)',

  // 追加 (誤解しやすい略語・ローカル略語)
  LVH: '左室肥大 (Left Ventricular Hypertrophy)',
  RV: '右室 (Right Ventricle) ※「Residual Volume 残気量」と区別',
  LV: '左室 (Left Ventricle)',
  IGT: '耐糖能異常 (Impaired Glucose Tolerance、糖尿病予備群)',
  IFG: '空腹時血糖異常 (Impaired Fasting Glucose)',
  IHD: '虚血性心疾患 (Ischemic Heart Disease)',
  HR: '心拍数 (Heart Rate) ※「ハザード比 Hazard Ratio」と文脈で区別',
  GERD: '胃食道逆流症 (Gastroesophageal Reflux Disease)',
  CS: '※多義語: Colonoscopy(消化管)/Cesarean Section(産科)/Cardiogenic Shock(循環器)/Coronary Spasm。文脈確認',
  RA: '関節リウマチ (Rheumatoid Arthritis) ※「Right Atrium 右房」「Renin Activity」と区別',
  RR: '呼吸数 (Respiratory Rate) または リスク比 (Risk Ratio)',
  CR: 'クレアチニン (Creatinine) または完全寛解 (Complete Response)',
  AS: '大動脈弁狭窄 (Aortic Stenosis) ※「強直性脊椎炎 Ankylosing Spondylitis」と文脈で区別',
  MR: '僧帽弁逆流 (Mitral Regurgitation) ※「Modified Release」「Magnetic Resonance」と文脈で区別',
  PR: '肺動脈弁逆流 / PR間隔 / Partial Response 文脈で区別',
  EM: 'エパキサS / 緊急 / 外来 — 文脈で異なる略称',
  SMART: '喘息 SMART療法 (シムビコート維持リリーバー) ※「SMART目標 Specific/Measurable...」とは無関係',
  Triple: 'Triple = ICS+LABA+LAMA 3剤合剤 (吸入)',
  GL: 'ガイドライン (Guideline)',
  PRN: '頓用 (pro re nata、必要時)',
  prn: '頓用 (pro re nata、必要時)',
  basal: '基礎インスリン (持効型)',
  bolus: '追加インスリン (超速効型)',
  burst: '短期高用量ステロイド (例: PSL 30mg/日 ×5日)',
  taper: '漸減 (急に止めず段階的に減量)',
  'as-needed': '頓用 (症状時のみ)',
  'Teach-back': 'ティーチバック法 (患者に説明内容を自分の言葉で再現させる確認手法)',
  MPR: '服薬遵守率 (Medication Possession Ratio、80%以上が良好の目安)',
  DAS: '疾患活動性スコア (Disease Activity Score)',
  DASH: 'DASH食 (野菜・果物・低脂肪乳製品中心、降圧食事療法)',
  DAPT: '抗血小板薬2剤併用療法 (Dual Antiplatelet Therapy、PCI後の標準)',
  SAPT: '抗血小板薬単剤療法 (Single Antiplatelet Therapy)',
  AIR: 'GINA Track 1 reliever-only ICS-formoterol (Anti-Inflammatory Reliever)',
  'CHA₂DS₂': 'CHA₂DS₂-VAScの省略形',
  NAFLD: '非アルコール性脂肪性肝疾患',
  MASLD: '代謝関連脂肪性肝疾患 (NAFLD改称)',
  HD: '血液透析 (Hemodialysis)',
  PD: '腹膜透析 (Peritoneal Dialysis) ※「パーキンソン病 (Parkinson Disease)」と文脈で区別',
  KT: '腎移植 (Kidney Transplantation)',
  ECG: '心電図 (Electrocardiogram)',
  EKG: '心電図 (独語 Elektrokardiogramm 由来)',
  CHO: '炭水化物 (Carbohydrate)',
  Cl: 'クロール (Chloride) または クリアランス (Clearance)',
  K: 'カリウム (Potassium、血清K)',
  Na: 'ナトリウム (Sodium)',
  Ca: 'カルシウム (Calcium)',
  P: 'リン (Phosphorus)',
  iPTH: '副甲状腺ホルモン (intact Parathyroid Hormone)',
  HCO3: '重炭酸イオン (代謝性アシドーシスの指標)',
  IDDM: 'インスリン依存型糖尿病 (旧称、現在はT1DM)',
  NIDDM: 'インスリン非依存型糖尿病 (旧称、現在はT2DM)',
  CVD: '心血管疾患 (Cardiovascular Disease)',
  CV: '心血管 (Cardiovascular)',
  ACE: 'アンジオテンシン変換酵素 (Angiotensin Converting Enzyme)',
  ARI: 'アンジオテンシン受容体阻害 (上位概念)',
  RAS阻害: 'レニン・アンジオテンシン系阻害 (ARB/ACEiの総称)',
  // 心不全関連の追加
  βB: 'β遮断薬 (Beta-Blocker)',
  βblocker: 'β遮断薬',
  // GINA Step 関連
  'Track 1': 'GINA 2024 推奨経路: ICS-formoterol を維持・症状時兼用 (SMART/AIR)',
  'Track 2': 'GINA 2024 代替経路: ICS+SABA頓用 (Track 1困難時)',
  'Step 1': 'GINA Step 1 — 症状月2回未満の軽症',
  'Step 2': 'GINA Step 2 — 症状月2回以上 < 毎日',
  'Step 3': 'GINA Step 3 — 毎日症状あり',
  'Step 4': 'GINA Step 4 — 中等症 (中用量ICS-LABA + LAMA考慮)',
  'Step 5': 'GINA Step 5 — 重症 (高用量・生物学的製剤検討)',
  'Group A': 'GOLD 2024 — 軽症COPD (mMRC 0-1, CAT<10, 増悪≤1/年)',
  'Group B': 'GOLD 2024 — 症状あり、増悪少 (mMRC≥2 or CAT≥10, 増悪≤1)',
  'Group E': 'GOLD 2024 — 増悪多発 (≥2/年 or 入院)',
};

/**
 * 略語を含むテキストから略語を検出して、それぞれの正式名称をtitle属性で示すための
 * 補助関数。React Component で `<AbbreviationTooltip term="ARB" />` のように使う。
 */
export function getFullName(term) {
  return ABBREVIATIONS[term] || null;
}

// マッチさせる略語のリスト (長いキーから順に)。短いキーが長いキーの一部にあると誤検出するため要ソート。
const ABBR_KEYS_SORTED = Object.keys(ABBREVIATIONS).sort((a, b) => b.length - a.length);

/**
 * 文字列を React 要素配列に変換。略語を <abbr title> に置き換える。
 * 全略語の自動ハイライトを行うことで、コメディカルが「これ何？」を流さない動線を作る。
 *
 * 戻り値は React.Fragment 内に並べる前提の配列。
 */
export function annotateAbbreviations(text, React) {
  if (!text || typeof text !== 'string') return text;
  // 正規表現用に長いキーから順に escape して連結
  const pattern = ABBR_KEYS_SORTED
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!pattern) return text;
  const re = new RegExp('(' + pattern + ')', 'g');
  const parts = [];
  let lastIndex = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    const abbr = m[0];
    const full = ABBREVIATIONS[abbr];
    parts.push(
      React.createElement(
        'abbr',
        {
          key: `abbr-${key++}`,
          title: full,
          style: { borderBottom: '1px dotted currentColor', cursor: 'help', textDecoration: 'none' },
        },
        abbr
      )
    );
    lastIndex = m.index + abbr.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
