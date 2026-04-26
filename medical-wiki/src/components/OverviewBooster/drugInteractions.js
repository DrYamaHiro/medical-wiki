/**
 * 飲み合わせ・同効薬重複の検出
 *
 * 検出対象:
 * 1. 横断 sharedClass: 連動 OFF 状態でも各疾患で同効薬が独立して選択されているケース
 *    (例: 別クリニックで重ね飲みしている血液サラサラ系の重複検出)
 * 2. 主要相互作用パターン (スタチン+クラリスロマイシン等)
 */

// ============================================================
// 同効薬重複検出 — 連動 OFF 時に複数疾患で同じ sharedClass が選択されているケース
// ============================================================
// 警戒すべき重複クラス (重ね飲みで重大事故になりうるもの)
const OVERLAP_DANGER_CLASSES = {
  'Antiplatelet': '抗血小板薬: 重複は出血リスク倍増。複数クリニックで別々に処方されることが多い (脳神経内科+循環器+整形)',
  'DOAC': '直接経口抗凝固薬 (DOAC): 重複は致命的出血リスク',
  'SGLT2i': 'SGLT2阻害薬: 重複は脱水・DKAリスク',
  'ARB': 'ARB: ACEi/ARNI と二重ブロックは禁忌級',
  'ACEi': 'ACEi: ARB/ARNI と二重ブロックは禁忌級',
  'ARNI': 'ARNI: ACEi/ARB と二重ブロックは禁忌級',
  'β遮断薬': 'β遮断薬: 重複は徐脈・伝導障害',
  'MRA': 'MRA: 重複は高K血症',
  'Statin': 'スタチン: 重複は横紋筋融解症リスク',
  'Fibrate': 'フィブラート: スタチンとの相互作用注意',
  'GLP-1RA': 'GLP-1受容体作動薬: 重複は消化器症状増悪',
  'DPP-4i': 'DPP-4阻害薬: GLP-1RAとの併用は推奨されない',
  'CCB': 'Ca拮抗薬: 重複は低血圧・末梢浮腫',
  'Diuretic': '利尿薬: ループ+サイアザイドの過剰利尿',
  'BB': 'β遮断薬',
  'ICS-LABA': 'ICS-LABA: 別吸入器との重複に注意 (ICS overdose)',
  'LAMA': 'LAMA: 重複は抗コリン副作用 (口渇・尿閉・緑内障)',
  'ICS-LABA-LAMA': 'Triple吸入: 単剤吸入との重複は ICS/LABA/LAMA いずれも overdose',
};

export function detectOverlap(state, allDiseases) {
  const overlaps = [];
  const map = {}; // sharedClass → [{ disease, classId }]
  for (const dk of state.selectedDiseases || []) {
    const meta = allDiseases.find((d) => d.key === dk);
    if (!meta) continue;
    const sel = state.selectionsByDisease?.[dk] || {};
    for (const cid of Object.keys(sel.classDetails || {})) {
      const klass = meta.drugClasses.find((c) => c.id === cid);
      if (!klass?.sharedClass) continue;
      if (!map[klass.sharedClass]) map[klass.sharedClass] = [];
      map[klass.sharedClass].push({ disease: dk, classId: cid, drugClass: klass });
    }
  }
  for (const [sc, list] of Object.entries(map)) {
    if (list.length < 2) continue;
    if (!OVERLAP_DANGER_CLASSES[sc]) continue;
    overlaps.push({
      sharedClass: sc,
      diseases: list.map((x) => x.disease),
      message: `${sc} が ${list.length}疾患で独立に選択されています — ${OVERLAP_DANGER_CLASSES[sc]}`,
      severity: ['Antiplatelet', 'DOAC', 'ARB', 'ACEi', 'ARNI', 'Statin', 'ICS-LABA-LAMA'].includes(sc) ? 'critical' : 'warning',
    });
  }
  return overlaps;
}

// ============================================================
// 主要な飲み合わせ警告 — 内服薬の組合わせで臨床上問題になるパターン
// ============================================================
// ルール: { matches: 各クラスID/sharedClass配列 (全 hit で発火), patientFlag?, severity, message, hint }

const INTERACTION_RULES = [
  // スタチン × CYP3A4阻害
  { matches: ['Statin'], extraDrugMatch: ['クラリスロマイシン', 'エリスロマイシン', 'イトラコナゾール'],
    severity: 'critical',
    message: 'スタチン + マクロライド/アゾール系 → 横紋筋融解リスク',
    hint: 'クラリスロマイシン処方中はアトルバスタチン/シンバスタチン中止 or 切替 (ロスバスタチン/プラバスタチンへ)',
  },
  // ARB/ACEi/ARNI 二重ブロック
  { matches: ['ARB', 'ACEi'], severity: 'critical',
    message: 'ARB + ACEi 併用は二重ブロック禁忌級',
    hint: '副作用 (高K・AKI・低血圧) リスク増。どちらか1剤に統一',
  },
  { matches: ['ARB', 'ARNI'], severity: 'critical',
    message: 'ARB + ARNI 併用は禁忌',
    hint: 'ARNI (エンレスト) は ARB/ACEi と36時間 washout 必須',
  },
  { matches: ['ACEi', 'ARNI'], severity: 'critical',
    message: 'ACEi + ARNI 併用は禁忌 (血管浮腫リスク)',
    hint: 'ARNI 開始前に ACEi 中止 + 36時間以上空ける',
  },
  // ARB/ACEi + MRA + K上昇
  { matches: ['ARB', 'MRA'], extraK: '5.1+', severity: 'warning',
    message: 'ARB/ACEi + MRA で K上昇',
    hint: '血清K 5.5未満を目標に monitor。5.5以上で K吸着薬追加',
  },
  // NSAIDs + ARB/ACEi + 利尿薬 = triple whammy
  { matches: ['ARB', 'Diuretic'], requireNsaid: true, severity: 'warning',
    message: 'NSAID + ARB/ACEi + 利尿薬 = "triple whammy" → AKI リスク',
    hint: '高齢者・脱水時に特に危険。NSAID 短期使用に限定し、腎機能 monitor',
  },
  { matches: ['ACEi', 'Diuretic'], requireNsaid: true, severity: 'warning',
    message: 'NSAID + ACEi + 利尿薬 = "triple whammy" → AKI リスク',
    hint: '高齢者・脱水時に特に危険',
  },
  // SU + ジゴキシン (実際は SU+インスリン 等の低血糖)
  { matches: ['SU', 'BB'], severity: 'warning',
    message: 'SU + β遮断薬 → 低血糖無自覚 (発汗・動悸が masked)',
    hint: '高齢者・自動車運転者で特に危険。SU 減量 or DPP-4i 切替検討',
  },
  // β遮断薬 + 非DHP系CCB = 徐脈/伝導障害
  { matches: ['BB', 'CCB'], severity: 'warning',
    message: 'β遮断薬 + 非DHP系CCB (ベラパミル/ジルチアゼム) → 徐脈・房室ブロック',
    hint: 'DHP系 (アムロジピン等) なら問題ないが、ベラパミル/ジルチアゼムは併用注意',
  },
  // DOAC + 抗血小板薬
  { matches: ['DOAC', 'Antiplatelet'], severity: 'warning',
    message: 'DOAC + 抗血小板薬併用 → 出血リスク増',
    hint: 'PCI後は期間限定 (1-12ヶ月) で許容、それ以外は単剤化を検討',
  },
  // SGLT2i + 利尿薬 = 脱水
  { matches: ['SGLT2i', 'Diuretic'], severity: 'warning',
    message: 'SGLT2i + 利尿薬 → 脱水・低血圧リスク',
    hint: '夏場・嘔吐下痢時はsick day rule で SGLT2i 一時中止',
  },
  // SGLT2i + フレイル
  { matches: ['SGLT2i'], patientFlag: 'co_frail', severity: 'warning',
    message: 'SGLT2i + フレイル → 脱水・低血圧・サルコペニア悪化リスク',
    hint: '体重減少・脱水・尿路感染を monitor',
  },
];

// 全選択疾患の薬剤を集約 (sharedClass + drug name)
function collectAllDrugs(state, allDiseases) {
  const out = {
    sharedClasses: new Set(),
    drugNames: [],
  };
  for (const dk of state.selectedDiseases || []) {
    const meta = allDiseases.find((d) => d.key === dk);
    if (!meta) continue;
    const sel = state.selectionsByDisease?.[dk] || {};
    for (const [cid, det] of Object.entries(sel.classDetails || {})) {
      const klass = meta.drugClasses.find((c) => c.id === cid);
      if (!klass) continue;
      if (klass.sharedClass) out.sharedClasses.add(klass.sharedClass);
      const drug = klass.drugs.find((d) => d.id === det.drugId);
      if (drug) out.drugNames.push(drug.name);
    }
  }
  return out;
}

export function detectInteractions(state, allDiseases) {
  const warnings = [];
  const collected = collectAllDrugs(state, allDiseases);
  const ph = state.patientHeader || {};
  const ch = state.commonHistory || {};
  const cl = state.commonLabs || {};

  for (const rule of INTERACTION_RULES) {
    const allMatched = rule.matches.every((sc) => collected.sharedClasses.has(sc));
    if (!allMatched) continue;
    if (rule.extraDrugMatch) {
      // この機能は将来用 (現状は extra drug は managed リストにないので skip)
      // 看護師さん向けに「他院処方で X が出ていたら注意」のような hint として残す
    }
    if (rule.requireNsaid && !ch.nsaid_use) continue;
    if (rule.patientFlag && !ph[rule.patientFlag]) continue;
    if (rule.extraK && cl.k_range !== '5.1-5.4' && cl.k_range !== '5.5+') continue;
    warnings.push({ severity: rule.severity, message: rule.message, hint: rule.hint });
  }
  return warnings;
}

// ============================================================
// トグル交互押し検出 — 短時間に同一 sharedClass の異なる drugId を交互に切替えていれば連動 OFF を提案
// ============================================================
export function detectToggleThrash(toggleHistory) {
  if (!toggleHistory || toggleHistory.length < 4) return null;
  const recent = toggleHistory.slice(-6);
  // 同一 sharedClass で 2 種類以上の drugId が交互に登場し、最近 60秒以内
  const now = Date.now();
  const within = recent.filter((h) => now - h.t < 60000);
  const bySc = {};
  for (const h of within) {
    if (!h.sharedClass) continue;
    if (!bySc[h.sharedClass]) bySc[h.sharedClass] = new Set();
    bySc[h.sharedClass].add(h.drugId);
  }
  for (const [sc, set] of Object.entries(bySc)) {
    if (set.size >= 2) {
      const count = within.filter((h) => h.sharedClass === sc).length;
      if (count >= 4) return { sharedClass: sc, count };
    }
  }
  return null;
}
