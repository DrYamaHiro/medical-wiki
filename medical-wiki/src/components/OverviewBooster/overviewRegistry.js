/**
 * 慢性疾患管理ブースター — 11疾患メタデータ
 *
 * 各疾患の drugClasses はクラス代表 + 具体薬剤 (drugs) + 用量 (doses) の3階層構造。
 * UI は 「クラス chip → 展開で具体薬剤 chip → 各薬剤に用量 select」 のフロー。
 *
 * 1単位刻みで処方が変わる薬剤は存在しないため、用量も GL のステップ通りの discrete 値を列挙。
 */

import { TREATMENT_DATA } from '../TreatmentBooster/registry';

// 疾患カテゴリ色 (色覚配慮: 太い左ボーダー + テキストカテゴリ名併記)
export const DISEASE_CATEGORIES = {
  cardiovascular: { label: '循環器',   color: '#c62828' },
  metabolic:      { label: '代謝',     color: '#ef6c00' },
  renal:          { label: '腎',       color: '#6a1b9a' },
  respiratory:    { label: '呼吸器',   color: '#0097a7' },
  mental:         { label: '精神/神経', color: '#2e7d32' },
  musculoskeletal:{ label: '骨/関節',   color: '#5d4037' },
};

// ============================================================
// 11疾患マスタ — drugClasses の中に drugs (具体薬剤) と doses (用量)
// ============================================================
export const OVERVIEW_DISEASES = [
  // ---------------- 高血圧 ----------------
  {
    key: 'ht', label: '高血圧', icd: 'I10',
    category: 'cardiovascular',
    boosterKey: 'hypertension',
    deepLink: '/docs/002-Chronic-Treatment/i10-hypertension-treatment',
    scoreKind: 'jsh2025_risk',
    controlIndicator: true,
    drugClasses: [
      { id: 'ht_arb', label: 'ARB', tooltip: 'アジルバ / ロサルタン / テルミサルタン / バルサルタン', sharedClass: 'ARB',
        drugs: [
          { id: 'arb_azl', name: 'アジルサルタン (アジルバ)', doses: [
            { value: '10', label: '10mg/日' }, { value: '20', label: '20mg/日 (標準)', isDefault: true }, { value: '40', label: '40mg/日 (上限)', isMax: true },
          ]},
          { id: 'arb_los', name: 'ロサルタン (ニューロタン)', doses: [
            { value: '25', label: '25mg/日' }, { value: '50', label: '50mg/日 (標準)', isDefault: true }, { value: '100', label: '100mg/日 (上限)', isMax: true },
          ]},
          { id: 'arb_tel', name: 'テルミサルタン (ミカルディス)', doses: [
            { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日 (標準)', isDefault: true }, { value: '80', label: '80mg/日 (上限)', isMax: true },
          ]},
          { id: 'arb_val', name: 'バルサルタン (ディオバン)', doses: [
            { value: '40', label: '40mg/日' }, { value: '80', label: '80mg/日 (標準)', isDefault: true }, { value: '160', label: '160mg/日 (上限)', isMax: true },
          ]},
          { id: 'arb_olm', name: 'オルメサルタン (オルメテック)', doses: [
            { value: '10', label: '10mg/日' }, { value: '20', label: '20mg/日 (標準)', isDefault: true }, { value: '40', label: '40mg/日 (上限)', isMax: true },
          ]},
          { id: 'arb_can', name: 'カンデサルタン (ブロプレス)', doses: [
            { value: '4', label: '4mg/日' }, { value: '8', label: '8mg/日 (標準)', isDefault: true }, { value: '12', label: '12mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'ht_acei', label: 'ACE阻害薬', tooltip: 'イミダプリル / エナラプリル',
        drugs: [
          { id: 'acei_imi', name: 'イミダプリル (タナトリル)', doses: [
            { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日 (上限)', isMax: true },
          ]},
          { id: 'acei_ena', name: 'エナラプリル (レニベース)', doses: [
            { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日 (上限)', isMax: true },
          ]},
          { id: 'acei_per', name: 'ペリンドプリル (コバシル)', doses: [
            { value: '2', label: '2mg/日' }, { value: '4', label: '4mg/日 (標準)', isDefault: true }, { value: '8', label: '8mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'ht_ccb', label: 'Ca拮抗薬 (DHP)', tooltip: 'アムロジピン / ニフェジピン徐放',
        drugs: [
          { id: 'ccb_amlo', name: 'アムロジピン (ノルバスク)', doses: [
            { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日 (上限)', isMax: true },
          ]},
          { id: 'ccb_nife', name: 'ニフェジピン徐放 (アダラートCR)', doses: [
            { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日 (標準)', isDefault: true }, { value: '80', label: '80mg/日 (上限)', isMax: true },
          ]},
          { id: 'ccb_cilni', name: 'シルニジピン (アテレック)', doses: [
            { value: '5', label: '5mg/日' }, { value: '10', label: '10mg/日 (標準)', isDefault: true }, { value: '20', label: '20mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'ht_thiazide', label: 'サイアザイド利尿薬', tooltip: 'トリクロルメチアジド / インダパミド',
        drugs: [
          { id: 'thz_tri', name: 'トリクロルメチアジド (フルイトラン)', doses: [
            { value: '0.5', label: '0.5mg/日 (低用量、JSH2025推奨)', isDefault: true }, { value: '1', label: '1mg/日' }, { value: '2', label: '2mg/日' },
          ]},
          { id: 'thz_ind', name: 'インダパミド (ナトリックス)', doses: [
            { value: '0.5', label: '0.5mg/日' }, { value: '1', label: '1mg/日 (標準)', isDefault: true }, { value: '2', label: '2mg/日' },
          ]},
        ],
      },
      { id: 'ht_mra', label: 'MRA', tooltip: 'スピロノラクトン / エプレレノン / エサキセレノン',
        drugs: [
          { id: 'mra_spi', name: 'スピロノラクトン (アルダクトンA)', doses: [
            { value: '12.5', label: '12.5mg/日' }, { value: '25', label: '25mg/日 (標準)', isDefault: true }, { value: '50', label: '50mg/日 (上限)', isMax: true },
          ]},
          { id: 'mra_epl', name: 'エプレレノン (セララ)', doses: [
            { value: '25', label: '25mg/日 (標準)', isDefault: true }, { value: '50', label: '50mg/日 (上限)', isMax: true },
          ]},
          { id: 'mra_esa', name: 'エサキセレノン (ミネブロ)', doses: [
            { value: '1.25', label: '1.25mg/日 (CKD)' }, { value: '2.5', label: '2.5mg/日 (標準)', isDefault: true }, { value: '5', label: '5mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'ht_arni', label: 'ARNI', tooltip: 'サクビトリル/バルサルタン (エンレスト)',
        drugs: [
          { id: 'arni_sac', name: 'サクビトリル/バルサルタン (エンレスト)', doses: [
            { value: '50', label: '50mg×2/日 (低用量、低BPで開始)' }, { value: '100', label: '100mg×2/日 (中用量)', isDefault: true }, { value: '200', label: '200mg×2/日 (目標)', isMax: true },
          ]},
        ],
      },
      { id: 'ht_bb', label: 'β遮断薬', tooltip: 'ビソプロロール / カルベジロール / ニビボロール', sharedClass: 'β遮断薬',
        drugs: [
          { id: 'bb_bis', name: 'ビソプロロール (メインテート)', doses: [
            { value: '0.625', label: '0.625mg/日 (HF開始量)' }, { value: '1.25', label: '1.25mg/日' }, { value: '2.5', label: '2.5mg/日 (標準)', isDefault: true }, { value: '5', label: '5mg/日 (上限HT)', isMax: true },
          ]},
          { id: 'bb_car', name: 'カルベジロール (アーチスト)', doses: [
            { value: '1.25', label: '1.25mg×2 (HF開始)' }, { value: '2.5', label: '2.5mg×2' }, { value: '5', label: '5mg×2 (HT標準)', isDefault: true }, { value: '10', label: '10mg×2 (HF目標)', isMax: true },
          ]},
        ],
      },
    ],
  },

  // ---------------- DLP ----------------
  {
    key: 'dlp', label: '脂質異常症', icd: 'E78',
    category: 'metabolic',
    boosterKey: 'dyslipidemia',
    deepLink: '/docs/002-Chronic-Treatment/e78-dyslipidemia-treatment',
    scoreKind: 'hisayama',
    controlIndicator: true,
    drugClasses: [
      { id: 'dlp_statin_low', label: 'スタチン (低強度)', tooltip: 'プラバスタチン / シンバスタチン',
        drugs: [
          { id: 'sta_pra', name: 'プラバスタチン (メバロチン)', doses: [
            { value: '5', label: '5mg/日' }, { value: '10', label: '10mg/日 (標準)', isDefault: true }, { value: '20', label: '20mg/日 (上限)', isMax: true },
          ]},
          { id: 'sta_sim', name: 'シンバスタチン (リポバス)', doses: [
            { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日' }, { value: '20', label: '20mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dlp_statin_mid', label: 'スタチン (中強度)', tooltip: 'ピタバスタチン / アトルバスタチン',
        drugs: [
          { id: 'sta_pita', name: 'ピタバスタチン (リバロ)', doses: [
            { value: '1', label: '1mg/日' }, { value: '2', label: '2mg/日 (標準)', isDefault: true }, { value: '4', label: '4mg/日 (上限)', isMax: true },
          ]},
          { id: 'sta_ato', name: 'アトルバスタチン (リピトール)', doses: [
            { value: '5', label: '5mg/日' }, { value: '10', label: '10mg/日 (標準)', isDefault: true }, { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日 (高強度)', isMax: true },
          ]},
        ],
      },
      { id: 'dlp_statin_high', label: 'スタチン (高強度)', tooltip: 'ロスバスタチン / アトルバスタチン高用量',
        drugs: [
          { id: 'sta_rosu', name: 'ロスバスタチン (クレストール)', doses: [
            { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日' }, { value: '20', label: '20mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dlp_eze', label: 'エゼチミブ', tooltip: 'ゼチーア (コレステロール吸収阻害)',
        drugs: [
          { id: 'eze', name: 'エゼチミブ (ゼチーア)', doses: [
            { value: '10', label: '10mg/日 (固定)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'dlp_fibrate', label: 'フィブラート', tooltip: 'ペマフィブラート / ベザフィブラート',
        drugs: [
          { id: 'fib_pema', name: 'ペマフィブラート (パルモディア)', doses: [
            { value: '0.1', label: '0.1mg×2/日 (低用量)' }, { value: '0.2', label: '0.2mg×2/日 (標準)', isDefault: true }, { value: '0.4', label: '0.4mg×2/日 (上限)', isMax: true },
          ]},
          { id: 'fib_bez', name: 'ベザフィブラート (ベザトールSR)', doses: [
            { value: '200', label: '200mg×2/日 (CKD配慮)' }, { value: '400', label: '400mg/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'dlp_pcsk9', label: 'PCSK9阻害薬', tooltip: 'エボロクマブ / アリロクマブ',
        drugs: [
          { id: 'pcsk_evo', name: 'エボロクマブ (レパーサ)', doses: [
            { value: '140_2w', label: '140mg SC 2週毎', isDefault: true }, { value: '420_4w', label: '420mg SC 4週毎' },
          ]},
          { id: 'pcsk_ali', name: 'アリロクマブ (プラルエント)', doses: [
            { value: '75_2w', label: '75mg SC 2週毎', isDefault: true }, { value: '150_2w', label: '150mg SC 2週毎', isMax: true },
          ]},
        ],
      },
      { id: 'dlp_omega3', label: 'オメガ-3', tooltip: 'EPA / EPA+DHA',
        drugs: [
          { id: 'om_epa', name: 'イコサペント酸 (エパデール)', doses: [
            { value: '900', label: '900mg×2/日 (標準)', isDefault: true }, { value: '1800', label: '1800mg×2/日 (高TG)', isMax: true },
          ]},
          { id: 'om_lot', name: 'オメガ-3-酸エチル (ロトリガ)', doses: [
            { value: '2', label: '2g/日 (標準)', isDefault: true }, { value: '4', label: '4g/日 (高TG)', isMax: true },
          ]},
        ],
      },
    ],
  },

  // ---------------- 2型糖尿病 ----------------
  {
    key: 't2dm', label: '2型糖尿病', icd: 'E11',
    category: 'metabolic',
    boosterKey: 't2dm',
    deepLink: '/docs/002-Chronic-Treatment/e11-t2dm-treatment',
    scoreKind: null,
    controlIndicator: true,
    drugClasses: [
      { id: 'dm_met', label: 'メトホルミン', tooltip: 'メトグルコ',
        drugs: [
          { id: 'met', name: 'メトホルミン (メトグルコ)', doses: [
            { value: '500', label: '500mg/日 (250mg×2)' }, { value: '750', label: '750mg/日 (250mg×3)', isDefault: true }, { value: '1500', label: '1500mg/日 (500mg×3)' }, { value: '2250', label: '2250mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dm_sglt2', label: 'SGLT2阻害薬', tooltip: 'エンパ / ダパ', sharedClass: 'SGLT2i',
        drugs: [
          { id: 'sglt_emp', name: 'エンパグリフロジン (ジャディアンス)', doses: [
            { value: '10', label: '10mg/日 (標準)', isDefault: true }, { value: '25', label: '25mg/日', isMax: true },
          ]},
          { id: 'sglt_dap', name: 'ダパグリフロジン (フォシーガ)', doses: [
            { value: '5', label: '5mg/日' }, { value: '10', label: '10mg/日 (標準)', isDefault: true, isMax: true },
          ]},
          { id: 'sglt_can', name: 'カナグリフロジン (カナグル)', doses: [
            { value: '100', label: '100mg/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'dm_glp1', label: 'GLP-1RA', tooltip: 'セマグルチド / デュラグルチド',
        drugs: [
          { id: 'glp_sem_inj', name: 'セマグルチド注 (オゼンピック)', doses: [
            { value: '0.25_w', label: '0.25mg/週 (導入)' }, { value: '0.5_w', label: '0.5mg/週 (標準)', isDefault: true }, { value: '1_w', label: '1.0mg/週', isMax: true },
          ]},
          { id: 'glp_sem_po', name: 'セマグルチド経口 (リベルサス)', doses: [
            { value: '3', label: '3mg/日 (導入)' }, { value: '7', label: '7mg/日 (標準)', isDefault: true }, { value: '14', label: '14mg/日 (上限)', isMax: true },
          ]},
          { id: 'glp_dula', name: 'デュラグルチド (トルリシティ)', doses: [
            { value: '0.75_w', label: '0.75mg/週 (固定)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'dm_dpp4', label: 'DPP-4阻害薬', tooltip: 'シタ / リナ (CKD) / テネリ',
        drugs: [
          { id: 'dpp_sita', name: 'シタグリプチン (ジャヌビア)', doses: [
            { value: '25', label: '25mg/日 (CKD G3-4)' }, { value: '50', label: '50mg/日 (標準)', isDefault: true }, { value: '100', label: '100mg/日 (上限)', isMax: true },
          ]},
          { id: 'dpp_lina', name: 'リナグリプチン (トラゼンタ)', doses: [
            { value: '5', label: '5mg/日 (CKDで用量調整不要)', isDefault: true, isMax: true },
          ]},
          { id: 'dpp_tene', name: 'テネリグリプチン (テネリア)', doses: [
            { value: '20', label: '20mg/日 (標準)', isDefault: true }, { value: '40', label: '40mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dm_su', label: 'SU (慎重)', tooltip: 'グリメピリド (低用量推奨)',
        drugs: [
          { id: 'su_glim', name: 'グリメピリド (アマリール)', doses: [
            { value: '0.5', label: '0.5mg/日 (高齢/CKD)' }, { value: '1', label: '1mg/日 (標準)', isDefault: true }, { value: '2', label: '2mg/日' }, { value: '4', label: '4mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dm_alphagi', label: 'α-GI', tooltip: 'ボグリボース / ミグリトール',
        drugs: [
          { id: 'agi_vog', name: 'ボグリボース (ベイスン)', doses: [
            { value: '0.2', label: '0.2mg×3/日 (標準)', isDefault: true }, { value: '0.3', label: '0.3mg×3/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'dm_insulin', label: 'インスリン (basal)', tooltip: 'デグルデク / グラルギンU300',
        drugs: [
          { id: 'ins_deg', name: 'デグルデク (トレシーバ)', doses: [
            { value: '4u', label: '4U就寝前 (導入0.1U/kg)' }, { value: '10u', label: '10U就寝前', isDefault: true }, { value: 'titrate', label: '漸増 (空腹時血糖100-130目標)' },
          ]},
          { id: 'ins_glaru300', name: 'グラルギンU300 (ランタスXR)', doses: [
            { value: '4u', label: '4U就寝前 (導入0.1U/kg)' }, { value: '10u', label: '10U就寝前', isDefault: true }, { value: 'titrate', label: '漸増' },
          ]},
        ],
      },
    ],
  },

  // ---------------- CKD ----------------
  {
    key: 'ckd', label: '慢性腎臓病 (CKD)', icd: 'N18',
    category: 'renal',
    boosterKey: null, deepLink: null,
    scoreKind: 'kdigo_heatmap',
    drugClasses: [
      { id: 'ckd_arb', label: 'ARB/ACEi (腎保護)', tooltip: 'ロサルタン / イミダプリル / アジルバ', sharedClass: 'ARB',
        drugs: [
          { id: 'ckd_arb_los', name: 'ロサルタン (ニューロタン)', doses: [
            { value: '25', label: '25mg/日 (CKD導入)' }, { value: '50', label: '50mg/日 (標準)', isDefault: true }, { value: '100', label: '100mg/日 (上限)', isMax: true },
          ]},
          { id: 'ckd_arb_azl', name: 'アジルサルタン (アジルバ)', doses: [
            { value: '10', label: '10mg/日' }, { value: '20', label: '20mg/日 (標準)', isDefault: true }, { value: '40', label: '40mg/日', isMax: true },
          ]},
          { id: 'ckd_acei_imi', name: 'イミダプリル (タナトリル)', doses: [
            { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (標準)', isDefault: true }, { value: '10', label: '10mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_sglt2', label: 'SGLT2阻害薬', tooltip: 'ダパ / エンパ — KDIGO 2024 強推奨', sharedClass: 'SGLT2i',
        drugs: [
          { id: 'ckd_sglt_dap', name: 'ダパグリフロジン (フォシーガ)', doses: [
            { value: '10', label: '10mg/日 (CKDで eGFR制限なし)', isDefault: true, isMax: true },
          ]},
          { id: 'ckd_sglt_emp', name: 'エンパグリフロジン (ジャディアンス)', doses: [
            { value: '10', label: '10mg/日 (CKD)', isDefault: true }, { value: '25', label: '25mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_finerenone', label: 'フィネレノン (非ステロイドMRA)', tooltip: 'ケレンディア — DM併存CKD',
        drugs: [
          { id: 'finer', name: 'フィネレノン (ケレンディア)', doses: [
            { value: '10', label: '10mg/日 (eGFR 25-60で開始)', isDefault: true }, { value: '20', label: '20mg/日 (目標)', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_loop', label: 'ループ利尿薬', tooltip: 'フロセミド / トラセミド',
        drugs: [
          { id: 'loop_fur', name: 'フロセミド (ラシックス)', doses: [
            { value: '20', label: '20mg/日 (標準)', isDefault: true }, { value: '40', label: '40mg/日' }, { value: '80', label: '80mg/日 (上限)', isMax: true },
          ]},
          { id: 'loop_tor', name: 'トラセミド (ルプラック)', doses: [
            { value: '4', label: '4mg/日 (標準)', isDefault: true }, { value: '8', label: '8mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_kbinder', label: 'K吸着薬', tooltip: 'ロケルマ / ポリスチレンスルホン酸',
        drugs: [
          { id: 'kb_zir', name: 'ロケルマ (ジルコニウム)', doses: [
            { value: '5', label: '5g×3/日 (急性) or 5g/日 (維持)' }, { value: '10', label: '10g×3/日 (急性最大)', isDefault: true },
          ]},
          { id: 'kb_pol', name: 'ポリスチレンスルホン酸Ca (カリメート)', doses: [
            { value: '5', label: '5g×2-3/日 (標準)', isDefault: true }, { value: '15', label: '15g/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_pbinder', label: 'リン吸着薬', tooltip: '炭酸Ca / セベラマー',
        drugs: [
          { id: 'pb_caco3', name: '炭酸カルシウム (カルタン)', doses: [
            { value: '500', label: '500mg×3/日 (食直後)', isDefault: true }, { value: '1000', label: '1000mg×3/日', isMax: true },
          ]},
          { id: 'pb_seve', name: 'セベラマー (フォスブロック)', doses: [
            { value: '750', label: '750mg×3/日 (食直前)', isDefault: true }, { value: '1500', label: '1500mg×3/日', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_bicarb', label: '重曹', tooltip: '炭酸水素ナトリウム (代謝性アシドーシス)',
        drugs: [
          { id: 'bic', name: '炭酸水素ナトリウム', doses: [
            { value: '1500', label: '1500mg/日 (3包分3)', isDefault: true }, { value: '3000', label: '3000mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'ckd_hifphd', label: 'HIF-PHD阻害薬 / ESA', tooltip: 'ロキサデュスタット / ダルベポエチン',
        drugs: [
          { id: 'hif_rox', name: 'ロキサデュスタット (エベレンゾ)', doses: [
            { value: '70', label: '70mg×3/週 (透析前)' }, { value: '100', label: '100mg×3/週 (透析)', isDefault: true },
          ]},
          { id: 'esa_darb', name: 'ダルベポエチン (ネスプ)', doses: [
            { value: '30_2w', label: '30μg SC 2週毎', isDefault: true }, { value: '60_2w', label: '60μg SC 2週毎' },
          ]},
        ],
      },
    ],
  },

  // ---------------- 心房細動 ----------------
  {
    key: 'af', label: '心房細動', icd: 'I48',
    category: 'cardiovascular',
    boosterKey: null, deepLink: null,
    scoreKind: 'cha2ds2vasc_hasbled',
    drugClasses: [
      { id: 'af_doac_apix', label: 'DOAC: アピキサバン', tooltip: 'エリキュース',
        drugs: [
          { id: 'doac_apix', name: 'アピキサバン (エリキュース)', doses: [
            { value: '2.5x2', label: '2.5mg×2/日 (高齢≥80/低体重≤60kg/Cr≥1.5の2項目該当で減量)' }, { value: '5x2', label: '5mg×2/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'af_doac_riva', label: 'DOAC: リバーロキサバン', tooltip: 'イグザレルト',
        drugs: [
          { id: 'doac_riva', name: 'リバーロキサバン (イグザレルト)', doses: [
            { value: '10', label: '10mg/日 (CrCl 30-49)' }, { value: '15', label: '15mg/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'af_doac_edox', label: 'DOAC: エドキサバン', tooltip: 'リクシアナ',
        drugs: [
          { id: 'doac_edox', name: 'エドキサバン (リクシアナ)', doses: [
            { value: '30', label: '30mg/日 (CrCl 15-50/低体重≤60kg)' }, { value: '60', label: '60mg/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'af_doac_dabi', label: 'DOAC: ダビガトラン', tooltip: 'プラザキサ',
        drugs: [
          { id: 'doac_dabi', name: 'ダビガトラン (プラザキサ)', doses: [
            { value: '110x2', label: '110mg×2/日 (高齢/CrCl低下)' }, { value: '150x2', label: '150mg×2/日 (標準)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'af_warfarin', label: 'ワルファリン (弁膜症性AF)', tooltip: 'PT-INR 2-3 (高齢1.6-2.6)',
        drugs: [
          { id: 'warf', name: 'ワルファリン (ワーファリン)', doses: [
            { value: 'titrate', label: 'PT-INR 2-3 で用量調整 (高齢1.6-2.6)', isDefault: true },
          ]},
        ],
      },
      { id: 'af_bb', label: 'β遮断薬 (レート制御)', tooltip: 'ビソプロロール / カルベジロール', sharedClass: 'β遮断薬',
        drugs: [
          { id: 'af_bis', name: 'ビソプロロール (メインテート)', doses: [
            { value: '2.5', label: '2.5mg/日 (標準)', isDefault: true }, { value: '5', label: '5mg/日', isMax: true },
          ]},
          { id: 'af_car', name: 'カルベジロール (アーチスト)', doses: [
            { value: '2.5x2', label: '2.5mg×2/日 (標準)', isDefault: true }, { value: '5x2', label: '5mg×2/日' },
          ]},
        ],
      },
      { id: 'af_cvb_nondhp', label: '非DHP系CCB (HFrEF禁)', tooltip: 'ベラパミル / ジルチアゼム',
        drugs: [
          { id: 'cvb_ver', name: 'ベラパミル (ワソラン)', doses: [
            { value: '120', label: '120mg/日 (分2-3)', isDefault: true }, { value: '240', label: '240mg/日', isMax: true },
          ]},
          { id: 'cvb_dil', name: 'ジルチアゼム (ヘルベッサー)', doses: [
            { value: '90', label: '90mg/日 (分3)', isDefault: true }, { value: '180', label: '180mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'af_amio', label: 'アミオダロン (リズム制御、専門医)', tooltip: 'アンカロン',
        drugs: [
          { id: 'amio', name: 'アミオダロン (アンカロン)', doses: [
            { value: '400_load', label: '400mg/日 ×1-2W (初期)' }, { value: '200_maint', label: '200mg/日 (維持)', isDefault: true },
          ]},
        ],
      },
    ],
  },

  // ---------------- 心不全 (HF統合 — EF入力で HFrEF/HFmrEF/HFpEF を内部判別) ----------------
  {
    key: 'hf', label: '心不全', icd: 'I50',
    category: 'cardiovascular',
    boosterKey: null, deepLink: null,
    scoreKind: 'hf_ef',
    controlIndicator: true,
    drugClasses: [
      { id: 'hf_arni', label: 'ARNI (4本柱)', tooltip: 'エンレスト',
        drugs: [
          { id: 'hf_arni_sac', name: 'サクビトリル/バルサルタン (エンレスト)', doses: [
            { value: '50x2', label: '50mg×2/日 (低BPで開始)' }, { value: '100x2', label: '100mg×2/日 (中)', isDefault: true }, { value: '200x2', label: '200mg×2/日 (目標)', isMax: true },
          ]},
        ],
      },
      { id: 'hf_bb', label: 'β遮断薬 (4本柱)', tooltip: 'カルベジロール / ビソプロロール', sharedClass: 'β遮断薬',
        drugs: [
          { id: 'hf_car', name: 'カルベジロール (アーチスト)', doses: [
            { value: '1.25x2', label: '1.25mg×2/日 (HF開始量)', isDefault: true }, { value: '2.5x2', label: '2.5mg×2/日' }, { value: '5x2', label: '5mg×2/日' }, { value: '10x2', label: '10mg×2/日 (HF目標)', isMax: true },
          ]},
          { id: 'hf_bis', name: 'ビソプロロール (メインテート)', doses: [
            { value: '0.625', label: '0.625mg/日 (HF開始)', isDefault: true }, { value: '1.25', label: '1.25mg/日' }, { value: '2.5', label: '2.5mg/日' }, { value: '5', label: '5mg/日 (HF目標)', isMax: true },
          ]},
        ],
      },
      { id: 'hf_mra', label: 'MRA (4本柱)', tooltip: 'スピロノラクトン / エサキセレノン',
        drugs: [
          { id: 'hf_spi', name: 'スピロノラクトン (アルダクトンA)', doses: [
            { value: '12.5', label: '12.5mg/日 (HF開始)' }, { value: '25', label: '25mg/日 (標準)', isDefault: true }, { value: '50', label: '50mg/日 (上限)', isMax: true },
          ]},
          { id: 'hf_esa', name: 'エサキセレノン (ミネブロ)', doses: [
            { value: '2.5', label: '2.5mg/日 (標準)', isDefault: true }, { value: '5', label: '5mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'hf_sglt2', label: 'SGLT2阻害薬 (4本柱)', tooltip: 'フォシーガ / ジャディアンス', sharedClass: 'SGLT2i',
        drugs: [
          { id: 'hf_dap', name: 'ダパグリフロジン (フォシーガ)', doses: [
            { value: '10', label: '10mg/日 (固定)', isDefault: true, isMax: true },
          ]},
          { id: 'hf_emp', name: 'エンパグリフロジン (ジャディアンス)', doses: [
            { value: '10', label: '10mg/日 (固定)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'hf_loop', label: 'ループ利尿薬 (うっ血対症)', tooltip: 'フロセミド / トラセミド',
        drugs: [
          { id: 'hf_fur', name: 'フロセミド (ラシックス)', doses: [
            { value: '20', label: '20mg/日 (軽度うっ血)', isDefault: true }, { value: '40', label: '40mg/日' }, { value: '80', label: '80mg/日 (上限)', isMax: true },
          ]},
          { id: 'hf_tor', name: 'トラセミド (ルプラック)', doses: [
            { value: '4', label: '4mg/日 (標準)', isDefault: true }, { value: '8', label: '8mg/日', isMax: true },
          ]},
        ],
      },
      { id: 'hf_ivab', label: 'イバブラジン (HFrEF限定)', tooltip: 'コララン (HR≥75かつβ遮断max)',
        drugs: [
          { id: 'iva', name: 'イバブラジン (コララン)', doses: [
            { value: '2.5x2', label: '2.5mg×2/日 (導入)' }, { value: '5x2', label: '5mg×2/日 (標準)', isDefault: true }, { value: '7.5x2', label: '7.5mg×2/日 (上限)', isMax: true },
          ]},
        ],
      },
    ],
  },

  // ---------------- 喘息 ----------------
  {
    key: 'asthma', label: '気管支喘息', icd: 'J45',
    category: 'respiratory',
    boosterKey: 'asthma',
    deepLink: '/docs/002-Chronic-Treatment/j45-asthma-treatment',
    scoreKind: null,
    hideLifestyle: true,  // 喘息は食事療法/運動療法ではなく吸入手技・併存症介入が主
    controlIndicator: true,  // コントロール不良時に吸入手技/アドヒアランス/併存症介入を上位提案
    drugClasses: [
      { id: 'as_ics_laba_mart', label: 'ICS-LABA SMART (Track 1)', tooltip: 'シムビコート — 維持+リリーバー兼用', sharedClass: 'ICS-LABA',
        drugs: [
          { id: 'as_sym', name: 'ブデソニド/ホルモテロール (シムビコート)', doses: [
            { value: '160_1x2', label: '160/4.5 1吸入×2/日 + 症状時' }, { value: '160_2x2', label: '160/4.5 2吸入×2/日 + 症状時', isDefault: true }, { value: '320_2x2', label: '320/9 2吸入×2/日', isMax: true },
          ]},
        ],
      },
      { id: 'as_ics', label: 'ICS単剤', tooltip: 'フルチカゾン / ブデソニド',
        drugs: [
          { id: 'as_flu', name: 'フルチカゾン (フルタイド)', doses: [
            { value: '50_2x2', label: '50μg 2吸入×2/日 (低用量)' }, { value: '100_2x2', label: '100μg 2吸入×2/日 (中)', isDefault: true }, { value: '200_2x2', label: '200μg 2吸入×2/日 (高)', isMax: true },
          ]},
          { id: 'as_bud', name: 'ブデソニド (パルミコート)', doses: [
            { value: '200_1x2', label: '200μg 1吸入×2/日 (低)' }, { value: '200_2x2', label: '200μg 2吸入×2/日 (中)', isDefault: true }, { value: '400_2x2', label: '400μg 2吸入×2/日 (高)', isMax: true },
          ]},
        ],
      },
      { id: 'as_lama', label: 'LAMA (Step 4-5)', tooltip: 'スピリーバ', sharedClass: 'LAMA',
        drugs: [
          { id: 'as_tio', name: 'チオトロピウム (スピリーバ レスピマット)', doses: [
            { value: '2.5_2', label: '2.5μg 2吸入/日 (固定)', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'as_triple', label: 'Triple (Step 5)', tooltip: 'テリルジー / エナジア', sharedClass: 'ICS-LABA-LAMA',
        drugs: [
          { id: 'as_tri', name: 'テリルジー 100エリプタ (FF/UMEC/VI)', doses: [
            { value: '100', label: '1吸入/日 (標準)', isDefault: true }, { value: '200', label: 'テリルジー200 1吸入/日 (高)', isMax: true },
          ]},
          { id: 'as_ena', name: 'エナジア (MF/IND/GLY)', doses: [
            { value: 'mid', label: '中用量 1吸入/日 (標準)', isDefault: true }, { value: 'high', label: '高用量 1吸入/日', isMax: true },
          ]},
        ],
      },
      { id: 'as_ltra', label: 'LTRA', tooltip: 'モンテルカスト',
        drugs: [
          { id: 'as_mon', name: 'モンテルカスト (キプレス/シングレア)', doses: [
            { value: '10', label: '10mg/日 夜', isDefault: true, isMax: true },
          ]},
        ],
      },
      { id: 'as_biologic', label: '生物学的製剤 (Step 5、専門医)', tooltip: 'ヌーカラ/ファセンラ/デュピクセント',
        drugs: [
          { id: 'as_mep', name: 'メポリズマブ (ヌーカラ)', doses: [{ value: '100_4w', label: '100mg SC 4週毎', isDefault: true, isMax: true }] },
          { id: 'as_ben', name: 'ベンラリズマブ (ファセンラ)', doses: [{ value: '30_8w', label: '30mg SC 8週毎', isDefault: true, isMax: true }] },
          { id: 'as_dup', name: 'デュピルマブ (デュピクセント)', doses: [{ value: '300_2w', label: '300mg SC 2週毎', isDefault: true, isMax: true }] },
        ],
      },
      { id: 'as_saba', label: 'SABA (頓用)', tooltip: 'メプチン / サルタノール',
        drugs: [
          { id: 'as_pro', name: 'プロカテロール (メプチン)', doses: [{ value: 'prn', label: '1-2吸入 頓用 (発作時)', isDefault: true }] },
          { id: 'as_sal', name: 'サルブタモール (サルタノール)', doses: [{ value: 'prn', label: '1-2吸入 頓用 (発作時)', isDefault: true }] },
        ],
      },
      { id: 'as_ocs', label: 'OCS (増悪burst)', tooltip: 'プレドニン',
        drugs: [
          { id: 'as_psl', name: 'プレドニゾロン (プレドニン)', doses: [
            { value: '30_5d', label: '30mg/日 ×5日 (短期burst)', isDefault: true }, { value: '40_7d', label: '40mg/日 ×7日 (重度)' },
          ]},
        ],
      },
    ],
  },

  // ---------------- COPD ----------------
  {
    key: 'copd', label: 'COPD', icd: 'J44',
    category: 'respiratory',
    boosterKey: 'copd',
    deepLink: '/docs/002-Chronic-Treatment/j44-copd-treatment',
    scoreKind: 'gold_abe',
    controlIndicator: true,  // 増悪/症状コントロール不良時に吸入手技・併存症介入を優先
    drugClasses: [
      { id: 'copd_lama', label: 'LAMA (Group A)', tooltip: 'スピリーバ / シーブリ', sharedClass: 'LAMA',
        drugs: [
          { id: 'copd_tio', name: 'チオトロピウム (スピリーバ レスピマット)', doses: [{ value: '2.5_2', label: '2.5μg 2吸入/日', isDefault: true, isMax: true }] },
          { id: 'copd_gly', name: 'グリコピロニウム (シーブリ)', doses: [{ value: '50', label: '50μg 1吸入/日', isDefault: true, isMax: true }] },
        ],
      },
      { id: 'copd_lama_laba', label: 'LAMA/LABA合剤 (Group B)', tooltip: 'アノーロ / スピオルト / ウルティブロ',
        drugs: [
          { id: 'copd_ano', name: 'アノーロエリプタ (UMEC/VI)', doses: [{ value: '1', label: '1吸入/日', isDefault: true, isMax: true }] },
          { id: 'copd_spio', name: 'スピオルト レスピマット (TIO/OLO)', doses: [{ value: '2', label: '2吸入/日', isDefault: true, isMax: true }] },
          { id: 'copd_ult', name: 'ウルティブロ (IND/GLY)', doses: [{ value: '1', label: '1カプセル/日 吸入', isDefault: true, isMax: true }] },
        ],
      },
      { id: 'copd_triple', label: 'Triple (Group E + eos≥300/ACO)', tooltip: 'テリルジー / ビレーズトリ', sharedClass: 'ICS-LABA-LAMA',
        drugs: [
          { id: 'copd_tri', name: 'テリルジー 100エリプタ', doses: [{ value: '1', label: '1吸入/日', isDefault: true, isMax: true }] },
          { id: 'copd_bil', name: 'ビレーズトリ エアロスフィア', doses: [{ value: '2x2', label: '2吸入×2/日', isDefault: true, isMax: true }] },
        ],
      },
      { id: 'copd_ics_laba', label: 'ICS/LABA (ACO限定)', tooltip: 'シムビコート / レルベア', sharedClass: 'ICS-LABA',
        drugs: [
          { id: 'copd_sym', name: 'シムビコート', doses: [{ value: '2x2', label: '2吸入×2/日', isDefault: true }] },
          { id: 'copd_rel', name: 'レルベア (FF/VI)', doses: [{ value: '100', label: 'レルベア100 1吸入/日', isDefault: true }, { value: '200', label: 'レルベア200 1吸入/日', isMax: true }] },
        ],
      },
      { id: 'copd_saba', label: 'SABA/SAMA (頓用)', tooltip: 'サルタノール / アトロベント',
        drugs: [
          { id: 'copd_sal', name: 'サルブタモール (サルタノール)', doses: [{ value: 'prn', label: '1-2吸入 頓用', isDefault: true }] },
          { id: 'copd_ipra', name: 'イプラトロピウム (アトロベント)', doses: [{ value: 'prn', label: '2吸入 頓用', isDefault: true }] },
        ],
      },
      { id: 'copd_ocs', label: 'OCS (増悪)', tooltip: 'プレドニン',
        drugs: [
          { id: 'copd_psl', name: 'プレドニゾロン (プレドニン)', doses: [{ value: '30_5d', label: '30mg/日 ×5日', isDefault: true }, { value: '40_7d', label: '40mg/日 ×7日 (重度)' }] },
        ],
      },
      { id: 'copd_macrolide', label: 'マクロライド少量長期', tooltip: 'アジスロマイシン (頻回増悪)',
        drugs: [
          { id: 'copd_azm', name: 'アジスロマイシン (ジスロマック)', doses: [{ value: '250_3w', label: '250mg ×3回/週 (長期)', isDefault: true }] },
        ],
      },
    ],
  },

  // ---------------- 痛風 ----------------
  {
    key: 'gout', label: '痛風・高尿酸血症', icd: 'M10',
    category: 'metabolic',
    boosterKey: 'gout',
    deepLink: '/docs/002-Chronic-Treatment/m10-gout-treatment',
    scoreKind: null,
    drugClasses: [
      { id: 'gout_allopurinol', label: 'アロプリノール', tooltip: 'eGFR別開始量 (HLA-B*5801確認)',
        drugs: [
          { id: 'allo', name: 'アロプリノール (ザイロリック)', doses: [
            { value: '50_alt', label: '50mg 隔日 (eGFR<30、専門医併診)' }, { value: '50', label: '50mg/日 (eGFR 30-59)' }, { value: '100', label: '100mg/日 (eGFR≥60、開始)', isDefault: true }, { value: '200', label: '200mg/日' }, { value: '300', label: '300mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'gout_febuxostat', label: 'フェブキソスタット', tooltip: 'フェブリク (eGFR<30/HLA-B*5801陽性)',
        drugs: [
          { id: 'feb', name: 'フェブキソスタット (フェブリク)', doses: [
            { value: '10', label: '10mg/日 (開始)', isDefault: true }, { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日' }, { value: '60', label: '60mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'gout_topiroxostat', label: 'トピロキソスタット', tooltip: 'ウリアデック',
        drugs: [
          { id: 'topi', name: 'トピロキソスタット (ウリアデック)', doses: [
            { value: '40_2', label: '40mg×2/日 (開始)', isDefault: true }, { value: '80_2', label: '80mg×2/日' }, { value: '160_2', label: '160mg×2/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'gout_benzbromarone', label: 'ベンズブロマロン (CKD G4-5禁忌)', tooltip: 'ユリノーム',
        drugs: [
          { id: 'benz', name: 'ベンズブロマロン (ユリノーム)', doses: [
            { value: '25', label: '25mg/日 (開始)', isDefault: true }, { value: '50_2', label: '50mg×2/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'gout_colchicine', label: 'コルヒチン (急性/予防)', tooltip: 'CKD G4-5禁忌級',
        drugs: [
          { id: 'col', name: 'コルヒチン', doses: [
            { value: '0.5_attack', label: '0.5mg/日 (発作予防、ULT開始期)', isDefault: true }, { value: '1.0_acute', label: '1.0mg 即時+0.5mg 1h後 (急性発作)' }, { value: '0.5_alt_ckd', label: '0.5mg 隔日 (eGFR 30-60)' },
          ]},
        ],
      },
      { id: 'gout_nsaid', label: 'NSAID (急性発作、CKDで慎重)', tooltip: 'ナイキサン / ロキソニン',
        drugs: [
          { id: 'g_nap', name: 'ナプロキセン (ナイキサン)', doses: [{ value: '300_2_7d', label: '300mg×2/日 ×7日', isDefault: true }] },
          { id: 'g_loxo', name: 'ロキソプロフェン (ロキソニン)', doses: [{ value: '60_3_7d', label: '60mg×3/日 ×7日', isDefault: true }] },
        ],
      },
      { id: 'gout_psl', label: 'PSL (急性発作、NSAID不可時)', tooltip: 'プレドニン',
        drugs: [
          { id: 'g_psl', name: 'プレドニゾロン (プレドニン)', doses: [{ value: '30_5d', label: '30mg/日 ×5日 (短期burst)', isDefault: true }] },
        ],
      },
    ],
  },

  // ---------------- 動脈硬化二次予防 ----------------
  {
    key: 'ascvd2', label: '動脈硬化 二次予防 (ASCVD)', icd: 'I25',
    category: 'cardiovascular',
    boosterKey: null, deepLink: null,
    scoreKind: null,
    drugClasses: [
      { id: 'asc_aspirin', label: '抗血小板薬: アスピリン', tooltip: 'バイアスピリン',
        drugs: [
          { id: 'asp', name: 'アスピリン (バイアスピリン)', doses: [{ value: '100', label: '100mg/日 (標準)', isDefault: true }] },
        ],
      },
      { id: 'asc_clopi', label: '抗血小板薬: クロピドグレル', tooltip: 'プラビックス (DAPT or 単独)',
        drugs: [
          { id: 'clo', name: 'クロピドグレル (プラビックス)', doses: [{ value: '75', label: '75mg/日', isDefault: true }] },
        ],
      },
      { id: 'asc_statin_high', label: 'スタチン高強度 (LDL<70)', tooltip: 'ロスバスタチン / アトルバスタチン高用量',
        drugs: [
          { id: 'asc_rosu', name: 'ロスバスタチン (クレストール)', doses: [
            { value: '10', label: '10mg/日 (標準)', isDefault: true }, { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日 (上限)', isMax: true },
          ]},
          { id: 'asc_ato', name: 'アトルバスタチン (リピトール)', doses: [
            { value: '20', label: '20mg/日' }, { value: '40', label: '40mg/日 (標準)', isDefault: true }, { value: '80', label: '80mg/日 (上限)', isMax: true },
          ]},
        ],
      },
      { id: 'asc_eze', label: 'エゼチミブ追加', tooltip: 'スタチン+ゼチーア',
        drugs: [
          { id: 'asc_eze1', name: 'エゼチミブ (ゼチーア)', doses: [{ value: '10', label: '10mg/日 (固定)', isDefault: true }] },
        ],
      },
      { id: 'asc_pcsk9', label: 'PCSK9阻害薬', tooltip: 'スタチン最大量+ゼチーアでLDL未達時',
        drugs: [
          { id: 'asc_evo', name: 'エボロクマブ (レパーサ)', doses: [{ value: '140_2w', label: '140mg SC 2週毎', isDefault: true }] },
        ],
      },
      { id: 'asc_arb', label: 'ARB/ACEi (心保護)', tooltip: 'PCI後/MI後', sharedClass: 'ARB',
        drugs: [
          { id: 'asc_los', name: 'ロサルタン (ニューロタン)', doses: [{ value: '50', label: '50mg/日', isDefault: true }, { value: '100', label: '100mg/日', isMax: true }] },
        ],
      },
      { id: 'asc_bb', label: 'β遮断薬 (心保護)', tooltip: 'MI後/低EF', sharedClass: 'β遮断薬',
        drugs: [
          { id: 'asc_bis', name: 'ビソプロロール (メインテート)', doses: [{ value: '2.5', label: '2.5mg/日', isDefault: true }, { value: '5', label: '5mg/日', isMax: true }] },
        ],
      },
    ],
  },
];

// ============================================================
// 痛風 ULT 用閾値 (v0.1)
// ============================================================
export const GOUT_ULT_THRESHOLDS = {
  start: {
    asymptomatic_no_comorbidity: 9.0,
    asymptomatic_with_comorbidity: 8.0,
    attack_history_or_tophus: 'always',
  },
  target: {
    tophus_present: 5.0,
    attack_history: 6.0,
    asymptomatic_with_comorbidity: 7.0,
    overcontrol_floor: 3.0,
  },
  allopurinol_starting: {
    eGFR_ge_60: '100mg/日',
    eGFR_30_59: '50mg/日',
    eGFR_lt_30: '50mg/日 隔日 (専門医併診)',
  },
  febuxostat_preferred: ['eGFR_lt_30', 'cm_hla_b5801_positive'],
  cares_warning: 'CV高リスク (MI/脳卒中既往) でアロプリノール優先 (CARES試験シグナル)',
};

export const HFPEF_SGLT2_EVIDENCE = 'EMPEROR-Preserved (NEJM 2021) と DELIVER (NEJM 2022) で HFpEF の心不全入院・CV死を有意低下 (HR ~0.79)。EF >40% の HFpEF 全例で第一選択。DM 有無を問わず適応';

// ============================================================
// 既存 booster の DRUGS を取得 (deep link で薬剤 pre-fill)
// ============================================================
export function getTreatmentBoosterDrugs(diseaseKey) {
  const meta = OVERVIEW_DISEASES.find((d) => d.key === diseaseKey);
  if (!meta?.boosterKey) return [];
  return TREATMENT_DATA[meta.boosterKey]?.data?.DRUGS || [];
}

export function getAllTreatmentBoosterDrugs() {
  const all = [];
  for (const [boosterKey, entry] of Object.entries(TREATMENT_DATA)) {
    const drugs = entry?.data?.DRUGS || [];
    drugs.forEach((d) => {
      all.push({ ...d, boosterKey, displayLabel: `${d.label} [${entry.subtitle?.split('（')[0] || boosterKey}]` });
    });
  }
  return all;
}
