// Echo Booster データ定義
// 各部位の臓器・チェック項目を定義
// type: choice (排他選択), multichoice (複数選択), numeric (数値+単位), text (自由入力)
// normalRange: { min, max, note } — 数値項目の正常範囲。範囲外は入力欄が赤枠になる
// normalRange.byGender: { male: {min,max}, female: {min,max} } — 性差ある項目用
// askGender: region に付与すると性別選択 UI が出る

export const ECHO_REGIONS = {
  abdominal: {
    label: '腹部エコー',
    sections: [
      {
        organ: '肝臓',
        items: [
          { id: 'liver_size', label: 'サイズ (右葉)', type: 'numeric', unit: 'cm', placeholder: '12-15', hint: '正常 12-15cm' },
          { id: 'liver_echo', label: 'エコー輝度', type: 'choice', options: ['正常', '上昇 (脂肪肝示唆)', '不均一', '低下'] },
          { id: 'liver_surface', label: '表面', type: 'choice', options: ['平滑', '凹凸 (慢性肝障害示唆)'] },
          { id: 'liver_mass', label: '腫瘤性病変', type: 'choice', options: ['なし', '嚢胞', '充実性病変 (要精査)', '血管腫様'] },
          { id: 'liver_pv', label: '門脈', type: 'choice', options: ['正常', '拡張 (>13mm)'] },
        ],
      },
      {
        organ: '胆嚢',
        items: [
          { id: 'gb_visualize', label: '描出', type: 'choice', options: ['良好', '不良 (腸管ガス等)'] },
          { id: 'gb_stone', label: '結石', type: 'choice', options: ['なし', 'あり (単発)', 'あり (多発)', 'デブリ・スラッジ'] },
          { id: 'gb_wall', label: '壁厚', type: 'choice', options: ['正常 (≤3mm)', '肥厚 (>3mm)'] },
          { id: 'gb_polyp', label: 'ポリープ', type: 'choice', options: ['なし', 'あり (≤10mm)', 'あり (>10mm、要精査)'] },
        ],
      },
      {
        organ: '膵臓',
        items: [
          { id: 'pan_visualize', label: '描出', type: 'choice', options: ['良好', '不良 (腸管ガス等)'] },
          { id: 'pan_size', label: '腫大', type: 'choice', options: ['なし', '局所性', 'びまん性'] },
          { id: 'pan_duct', label: '主膵管', type: 'choice', options: ['正常 (≤3mm)', '拡張 (>3mm、要精査)'] },
          { id: 'pan_mass', label: '腫瘤・嚢胞', type: 'choice', options: ['なし', '嚢胞性病変', '充実性病変 (要精査)'] },
        ],
      },
      {
        organ: '脾臓',
        items: [
          { id: 'spl_size', label: 'サイズ (長径)', type: 'numeric', unit: 'cm', placeholder: '8-12', hint: '正常 ≤12cm' },
          { id: 'spl_finding', label: '所見', type: 'choice', options: ['異常なし', '腫大', '腫瘤性病変'] },
        ],
      },
      {
        organ: '腎臓',
        items: [
          { id: 'kid_size_r', label: '右腎サイズ', type: 'numeric', unit: 'cm', placeholder: '10-12', hint: '正常 10-12cm' },
          { id: 'kid_size_l', label: '左腎サイズ', type: 'numeric', unit: 'cm', placeholder: '10-12', hint: '正常 10-12cm' },
          { id: 'kid_atrophy', label: '腎萎縮', type: 'choice', options: ['なし', '片側', '両側'] },
          { id: 'kid_stone', label: '結石', type: 'choice', options: ['なし', '右', '左', '両側'] },
          { id: 'kid_hydro', label: '水腎症', type: 'choice', options: ['なし', '軽度', '中等度', '高度'] },
          { id: 'kid_cyst', label: '嚢胞', type: 'choice', options: ['なし', '単純性嚢胞 (Bosniak I)', '複雑性 (要精査)'] },
          { id: 'kid_mass', label: '腫瘤', type: 'choice', options: ['なし', 'あり (要精査)'] },
        ],
      },
      {
        organ: '腹部大動脈',
        items: [
          { id: 'aorta_size', label: '最大径', type: 'numeric', unit: 'mm', placeholder: '15-25', hint: '正常 ≤25mm、瘤 ≥30mm' },
          { id: 'aorta_finding', label: '所見', type: 'choice', options: ['異常なし', '動脈瘤疑い (≥30mm)', '解離疑い'] },
        ],
      },
      {
        organ: '膀胱',
        items: [
          { id: 'bla_status', label: '充満度', type: 'choice', options: ['良好', '不十分'] },
          { id: 'bla_wall', label: '壁肥厚', type: 'choice', options: ['なし', 'あり'] },
          { id: 'bla_mass', label: '腫瘤', type: 'choice', options: ['なし', 'あり (要精査)'] },
          { id: 'bla_residual', label: '残尿', type: 'numeric', unit: 'mL', placeholder: '0', hint: '<50mL 正常' },
        ],
      },
    ],
    assessmentRules: [
      { when: (f) => f.liver_echo === '上昇 (脂肪肝示唆)', text: '脂肪肝の所見あり。生活習慣指導と肝機能フォロー推奨。' },
      { when: (f) => f.gb_stone && f.gb_stone.startsWith('あり'), text: '胆嚢結石を認める。症状時の早期受診指導、肝胆道系酵素フォロー。' },
      { when: (f) => f.gb_wall === '肥厚 (>3mm)', text: '胆嚢壁肥厚あり。胆嚢炎・腺筋腫症等の鑑別、症状確認推奨。' },
      { when: (f) => f.kid_hydro && f.kid_hydro !== 'なし', text: '水腎症を認める。閉塞機転の精査が必要。' },
      { when: (f) => f.kid_stone && f.kid_stone !== 'なし', text: '腎結石を認める。尿管結石への移動・症状監視。' },
      { when: (f) => f.aorta_finding === '動脈瘤疑い (≥30mm)', text: '腹部大動脈瘤疑い。血管外科紹介推奨。' },
      { when: (f) => f.bla_residual && parseInt(f.bla_residual) >= 50, text: '残尿あり。下部尿路症状の評価推奨。' },
      { when: (f) => f.pan_duct === '拡張 (>3mm、要精査)', text: '主膵管拡張あり。膵腫瘍除外のため造影CT or MRCP推奨。' },
    ],
  },

  carotid: {
    label: '頸動脈エコー',
    sections: [
      {
        organ: '評価方法',
        items: [
          { id: 'stenosis_method', label: '狭窄度評価法', type: 'choice', options: ['NASCET', 'ECST', 'エコー径狭窄率', '面積狭窄率'], hint: '施設・機器の運用に応じて選択' },
        ],
      },
      {
        organ: '右総頸動脈',
        items: [
          { id: 'r_cca_imt', label: 'max IMT', type: 'numeric', unit: 'mm', placeholder: '0.8', normalRange: { min: 0, max: 1.1, note: '正常 <1.1mm' } },
          { id: 'r_cca_plaque', label: 'プラーク', type: 'choice', options: ['なし', 'あり (低エコー)', 'あり (高エコー)', 'あり (混合)'] },
        ],
      },
      {
        organ: '右頸動脈洞・内頸動脈',
        items: [
          { id: 'r_ica_stenosis', label: '狭窄度', type: 'choice', options: ['なし', '軽度 (<50%)', '中等度 (50-69%)', '高度 (≥70%)', '閉塞'] },
          { id: 'r_ica_psv', label: 'PSV', type: 'numeric', unit: 'cm/s', placeholder: '70', normalRange: { min: 0, max: 125, note: '<125 正常、≥230 高度狭窄示唆' } },
        ],
      },
      {
        organ: '左総頸動脈',
        items: [
          { id: 'l_cca_imt', label: 'max IMT', type: 'numeric', unit: 'mm', placeholder: '0.8', normalRange: { min: 0, max: 1.1, note: '正常 <1.1mm' } },
          { id: 'l_cca_plaque', label: 'プラーク', type: 'choice', options: ['なし', 'あり (低エコー)', 'あり (高エコー)', 'あり (混合)'] },
        ],
      },
      {
        organ: '左頸動脈洞・内頸動脈',
        items: [
          { id: 'l_ica_stenosis', label: '狭窄度', type: 'choice', options: ['なし', '軽度 (<50%)', '中等度 (50-69%)', '高度 (≥70%)', '閉塞'] },
          { id: 'l_ica_psv', label: 'PSV', type: 'numeric', unit: 'cm/s', placeholder: '70', normalRange: { min: 0, max: 125, note: '<125 正常、≥230 高度狭窄示唆' } },
        ],
      },
      {
        organ: '椎骨動脈',
        items: [
          { id: 'va_flow', label: '血流方向', type: 'choice', options: ['順方向', '逆方向 (盗血疑い)', '描出不良'] },
        ],
      },
    ],
    assessmentRules: [
      { when: (f) => {
          const r = parseFloat(f.r_cca_imt || 0); const l = parseFloat(f.l_cca_imt || 0);
          return r >= 1.1 || l >= 1.1;
        }, text: 'IMT肥厚あり。動脈硬化進行を示唆。脂質・血圧・耐糖能の評価と一次予防強化。' },
      { when: (f) => f.r_ica_stenosis === '中等度 (50-69%)' || f.l_ica_stenosis === '中等度 (50-69%)',
        text: '中等度狭窄あり。症候性なら脳血管専門医紹介、無症候性は厳格な内科治療と定期フォロー。' },
      { when: (f) => f.r_ica_stenosis === '高度 (≥70%)' || f.l_ica_stenosis === '高度 (≥70%)',
        text: '高度狭窄あり。脳血管専門医へ紹介推奨 (CEA/CAS の適応評価)。' },
      { when: (f) => f.r_ica_stenosis === '閉塞' || f.l_ica_stenosis === '閉塞',
        text: '内頸動脈閉塞あり。脳血管専門医紹介、対側狭窄評価必須。' },
      { when: (f) => (f.r_cca_plaque && f.r_cca_plaque.startsWith('あり')) || (f.l_cca_plaque && f.l_cca_plaque.startsWith('あり')),
        text: 'プラークを認める。心血管リスク評価と LDL-C・血圧の厳格管理。' },
    ],
  },

  thyroid: {
    label: '甲状腺エコー',
    sections: [
      {
        organ: '甲状腺 全体',
        items: [
          { id: 'thy_size', label: 'サイズ', type: 'choice', options: ['正常', 'びまん性腫大', '萎縮'] },
          { id: 'thy_echo', label: '実質エコー', type: 'choice', options: ['正常', '不均一・低エコー (橋本病示唆)', '高エコー'] },
          { id: 'thy_flow', label: '血流', type: 'choice', options: ['正常', '増加 (Basedow病示唆)', '低下'] },
        ],
      },
      {
        organ: '右葉',
        items: [
          { id: 'r_lobe_size', label: 'サイズ (長径×幅×厚さ)', type: 'text', placeholder: '例: 4.5×1.5×1.2cm' },
          { id: 'r_nodule', label: '結節', type: 'choice', options: ['なし', 'あり (単発)', 'あり (多発)'] },
          { id: 'r_nodule_size', label: '最大結節径', type: 'numeric', unit: 'mm', placeholder: '0' },
          { id: 'r_nodule_char', label: '結節性状 (TI-RADS)', type: 'choice', options: ['未評価', 'TR1-2 (良性〜低疑い)', 'TR3 (軽度疑い)', 'TR4 (中等度疑い)', 'TR5 (高疑い)'] },
        ],
      },
      {
        organ: '左葉',
        items: [
          { id: 'l_lobe_size', label: 'サイズ (長径×幅×厚さ)', type: 'text', placeholder: '例: 4.5×1.5×1.2cm' },
          { id: 'l_nodule', label: '結節', type: 'choice', options: ['なし', 'あり (単発)', 'あり (多発)'] },
          { id: 'l_nodule_size', label: '最大結節径', type: 'numeric', unit: 'mm', placeholder: '0' },
          { id: 'l_nodule_char', label: '結節性状 (TI-RADS)', type: 'choice', options: ['未評価', 'TR1-2 (良性〜低疑い)', 'TR3 (軽度疑い)', 'TR4 (中等度疑い)', 'TR5 (高疑い)'] },
        ],
      },
      {
        organ: '頸部リンパ節',
        items: [
          { id: 'lymph', label: '所見', type: 'choice', options: ['異常なし', '反応性腫大', '異常リンパ節 (要精査)'] },
        ],
      },
    ],
    assessmentRules: [
      { when: (f) => f.thy_echo && f.thy_echo.includes('橋本病'),
        text: '橋本病を示唆するエコー所見。TSH/FT4/抗TPO抗体・抗Tg抗体の評価推奨。' },
      { when: (f) => f.thy_flow && f.thy_flow.includes('Basedow'),
        text: 'Basedow病を示唆する血流増加。TSH/FT4/TRAb の評価必須。' },
      { when: (f) => f.r_nodule_char === 'TR4 (中等度疑い)' || f.l_nodule_char === 'TR4 (中等度疑い)',
        text: 'TR4 結節あり。10mm 以上で穿刺吸引細胞診 (FNAC) 推奨。' },
      { when: (f) => f.r_nodule_char === 'TR5 (高疑い)' || f.l_nodule_char === 'TR5 (高疑い)',
        text: 'TR5 結節あり。5mm 以上で FNAC 推奨。専門医紹介検討。' },
      { when: (f) => {
          const r = parseFloat(f.r_nodule_size || 0); const l = parseFloat(f.l_nodule_size || 0);
          return r >= 10 || l >= 10;
        }, text: '10mm 以上の結節あり。性状に応じて FNAC 適応評価。' },
    ],
  },

  cardiac: {
    label: '心エコー',
    askGender: true,
    sections: [
      {
        organ: '左室形態 (M モード計測)',
        items: [
          { id: 'ivs', label: 'IVS (心室中隔厚)', type: 'numeric', unit: 'mm', placeholder: '9', normalRange: { byGender: { male: { min: 6, max: 10 }, female: { min: 6, max: 9 } }, note: '男 6-10mm、女 6-9mm' } },
          { id: 'pw', label: 'PW (後壁厚)', type: 'numeric', unit: 'mm', placeholder: '9', normalRange: { byGender: { male: { min: 6, max: 10 }, female: { min: 6, max: 9 } }, note: '男 6-10mm、女 6-9mm' } },
          { id: 'lvdd', label: 'LVDd (拡張末期径)', type: 'numeric', unit: 'mm', placeholder: '48', normalRange: { byGender: { male: { min: 42, max: 58 }, female: { min: 38, max: 52 } }, note: '男 42-58mm、女 38-52mm' } },
          { id: 'lvds', label: 'LVDs (収縮末期径)', type: 'numeric', unit: 'mm', placeholder: '30', normalRange: { byGender: { male: { min: 25, max: 40 }, female: { min: 22, max: 35 } }, note: '男 25-40mm、女 22-35mm' } },
          { id: 'ao_d', label: '上行大動脈径 (AoD)', type: 'numeric', unit: 'mm', placeholder: '30', normalRange: { min: 20, max: 37, note: '正常 <37mm' } },
          { id: 'lad', label: 'LAD (左房前後径)', type: 'numeric', unit: 'mm', placeholder: '35', normalRange: { byGender: { male: { min: 30, max: 40 }, female: { min: 27, max: 38 } }, note: '男 ≤40mm、女 ≤38mm' } },
        ],
      },
      {
        organ: '左室収縮能',
        items: [
          { id: 'lvef_teich', label: 'LVEF (Teichholz)', type: 'numeric', unit: '%', placeholder: '60', normalRange: { min: 55, max: 80, note: 'Teich 法 ≥55% 正常' } },
          { id: 'lvfs', label: 'LV%FS', type: 'numeric', unit: '%', placeholder: '35', normalRange: { min: 25, max: 45, note: '正常 25-45%' } },
          { id: 'lvef_simpson', label: 'LVEF (Simpson biplane)', type: 'numeric', unit: '%', placeholder: '60', normalRange: { min: 52, max: 74, note: '男 ≥52%、女 ≥54% (Simpson)' } },
          { id: 'lvedv', label: 'LVEDV', type: 'numeric', unit: 'mL', placeholder: '100', normalRange: { byGender: { male: { min: 60, max: 150 }, female: { min: 50, max: 106 } }, note: '男 62-150mL、女 46-106mL' } },
          { id: 'lvesv', label: 'LVESV', type: 'numeric', unit: 'mL', placeholder: '40', normalRange: { byGender: { male: { min: 20, max: 60 }, female: { min: 14, max: 42 } }, note: '男 21-61mL、女 14-42mL' } },
          { id: 'lv_motion', label: '局所壁運動', type: 'choice', options: ['正常', '低下あり (虚血示唆)', 'びまん性低下'] },
        ],
      },
      {
        organ: '左室拡張機能',
        items: [
          { id: 'mv_e', label: 'E 波高', type: 'numeric', unit: 'cm/s', placeholder: '70', normalRange: { min: 50, max: 100, note: '参考 50-100cm/s' } },
          { id: 'mv_a', label: 'A 波高', type: 'numeric', unit: 'cm/s', placeholder: '60', normalRange: { min: 40, max: 90, note: '参考 40-90cm/s' } },
          { id: 'e_a_ratio', label: 'E/A 比', type: 'numeric', placeholder: '1.2', normalRange: { min: 0.8, max: 2.0, note: '正常 0.8-2.0、<0.8 弛緩障害、>2.0 拘束型示唆' } },
          { id: 'dct', label: 'DcT', type: 'numeric', unit: 'ms', placeholder: '180', normalRange: { min: 160, max: 240, note: '正常 160-240ms' } },
          { id: 'e_prime', label: "e' (septal)", type: 'numeric', unit: 'cm/s', placeholder: '9', normalRange: { min: 8, max: 20, note: 'septal e\' ≥8cm/s 正常、<8 拡張障害示唆' } },
          { id: 'e_over_e_prime', label: "E/e' 比", type: 'numeric', placeholder: '8', normalRange: { min: 0, max: 8, note: '≤8 正常、9-14 灰色域、≥15 LVEDP 上昇示唆' } },
          { id: 'lv_diastolic', label: '拡張機能グレード', type: 'choice', options: ['正常', 'グレードI (緩徐弛緩)', 'グレードII (偽正常)', 'グレードIII (拘束型)', '判定困難'] },
        ],
      },
      {
        organ: '弁膜',
        items: [
          { id: 'av', label: '大動脈弁', type: 'choice', options: ['正常', 'AR 軽度', 'AR 中等度〜高度', 'AS 軽度', 'AS 中等度〜高度', 'AR+AS', '二尖弁'] },
          { id: 'av_vmax', label: 'AV Vmax', type: 'numeric', unit: 'm/s', placeholder: '1.2', normalRange: { min: 0, max: 2.5, note: '<2.5 正常、≥4.0 高度 AS 示唆' } },
          { id: 'mv', label: '僧帽弁', type: 'choice', options: ['正常', 'MR 軽度', 'MR 中等度〜高度', 'MS', '逸脱 (MVP)'] },
          { id: 'tv', label: '三尖弁', type: 'choice', options: ['正常', 'TR 軽度', 'TR 中等度〜高度'] },
          { id: 'pv', label: '肺動脈弁', type: 'choice', options: ['正常', 'PR 軽度', 'PR 中等度〜高度', 'PS'] },
          { id: 'trpg', label: '推定肺動脈圧 (TRPG)', type: 'numeric', unit: 'mmHg', placeholder: '20', normalRange: { min: 0, max: 30, note: '<30mmHg 正常、≥40 中等度以上 PH 示唆' } },
        ],
      },
      {
        organ: '右心系',
        items: [
          { id: 'rv_basal', label: 'RV 基部径 (RVD1)', type: 'numeric', unit: 'mm', placeholder: '35', normalRange: { min: 25, max: 41, note: '正常 25-41mm、>42 拡大' } },
          { id: 'rv_wall', label: 'RV 壁厚', type: 'numeric', unit: 'mm', placeholder: '4', normalRange: { min: 0, max: 5, note: '正常 ≤5mm' } },
          { id: 'tapse', label: 'TAPSE', type: 'numeric', unit: 'mm', placeholder: '20', normalRange: { min: 17, max: 30, note: '≥17mm 正常、<17 RV 収縮低下' } },
          { id: 's_prime_rv', label: "S' (RV free wall)", type: 'numeric', unit: 'cm/s', placeholder: '12', normalRange: { min: 10, max: 20, note: '≥10cm/s 正常' } },
          { id: 'ra_size', label: '右房', type: 'choice', options: ['正常', '拡大'] },
        ],
      },
      {
        organ: '下大静脈・心嚢液',
        items: [
          { id: 'ivc_size', label: 'IVC 径', type: 'numeric', unit: 'mm', placeholder: '15', normalRange: { min: 0, max: 21, note: '正常 ≤21mm、>21 かつ変動<50% → RAP上昇' } },
          { id: 'ivc_resp', label: 'IVC 呼吸性変動', type: 'choice', options: ['>50% (正常)', '<50% (右房圧上昇)'] },
          { id: 'pericardium', label: '心嚢液', type: 'choice', options: ['なし', '少量', '中等量〜多量'] },
        ],
      },
    ],
    assessmentRules: [
      // 収縮能
      { when: (f) => {
          const ef = parseFloat(f.lvef_simpson || f.lvef_teich || 0);
          return ef > 0 && ef < 40;
        }, text: 'LVEF <40% (HFrEF)。ACEi/ARB/ARNI・β遮断薬・MRA・SGLT2i の標準治療、循環器紹介推奨。' },
      { when: (f) => {
          const ef = parseFloat(f.lvef_simpson || f.lvef_teich || 0);
          return ef >= 40 && ef < 50;
        }, text: 'LVEF 40-49% (HFmrEF)。HFrEF に準じた治療、SGLT2i 推奨。' },
      { when: (f) => f.lv_motion === '低下あり (虚血示唆)',
        text: '局所壁運動低下あり。虚血性心疾患の精査 (CAG or 冠動脈 CT) 推奨。' },

      // 肥大 (性差反映)
      { when: (f) => {
          const ivs = parseFloat(f.ivs || 0); const pw = parseFloat(f.pw || 0);
          const cutoff = f.__gender === 'female' ? 9 : 10;
          return (ivs > 0 && ivs > cutoff) || (pw > 0 && pw > cutoff);
        }, text: '心室壁肥厚あり。高血圧性心疾患・肥大型心筋症・浸潤性心筋症等の鑑別。' },

      // 左房拡大
      { when: (f) => {
          const lad = parseFloat(f.lad || 0);
          const cutoff = f.__gender === 'female' ? 38 : 40;
          return lad > cutoff;
        }, text: '左房拡大あり。慢性的な圧・容量負荷示唆、心房細動リスク上昇。' },

      // 拡張機能 (単指標)
      { when: (f) => {
          const ratio = parseFloat(f.e_over_e_prime || 0);
          return ratio >= 15;
        }, text: "E/e' ≥15、左室充満圧上昇 (LVEDP 上昇) 示唆。うっ血・拡張機能障害を疑う。" },
      { when: (f) => {
          const ratio = parseFloat(f.e_over_e_prime || 0);
          return ratio >= 9 && ratio < 15;
        }, text: "E/e' 灰色域 (9-14)。他のパラメータ (LAVI・TR 速度) と合わせて総合判断。" },
      { when: (f) => {
          const ep = parseFloat(f.e_prime || 0);
          return ep > 0 && ep < 8;
        }, text: "septal e' <8cm/s、左室弛緩障害を示唆。" },

      // 拡張機能グレード自動候補 (E/A + DcT + E/e' の複合判定、ASE/EACVI 2016 準拠)
      // ユーザーがグレード欄未入力の場合のみ候補として提示
      { when: (f) => {
          if (f.lv_diastolic) return false;
          const ea = parseFloat(f.e_a_ratio || 0);
          const dct = parseFloat(f.dct || 0);
          const ratio = parseFloat(f.e_over_e_prime || 0);
          return ea > 0 && ea < 0.8 && (dct === 0 || dct > 200) && (ratio === 0 || ratio < 15);
        }, text: '【グレード候補】E/A <0.8 かつ DcT 延長傾向、E/e\' 正常 → グレード I (緩徐弛緩) を示唆。' },
      { when: (f) => {
          if (f.lv_diastolic) return false;
          const ea = parseFloat(f.e_a_ratio || 0);
          const ratio = parseFloat(f.e_over_e_prime || 0);
          return ea >= 0.8 && ea < 2.0 && ratio >= 15;
        }, text: "【グレード候補】E/A 0.8-2.0 かつ E/e' ≥15 → グレード II (偽正常化) を示唆。左房拡大・TR速度も併せて確認。" },
      { when: (f) => {
          if (f.lv_diastolic) return false;
          const ea = parseFloat(f.e_a_ratio || 0);
          const dct = parseFloat(f.dct || 0);
          const ratio = parseFloat(f.e_over_e_prime || 0);
          return ea >= 2.0 && (dct > 0 && dct < 160) && (ratio === 0 || ratio >= 15);
        }, text: '【グレード候補】E/A ≥2.0 かつ DcT 短縮 → グレード III (拘束型) を示唆。心不全兆候の評価を推奨。' },
      { when: (f) => {
          if (f.lv_diastolic) return false;
          const ea = parseFloat(f.e_a_ratio || 0);
          return ea > 0 && ea < 0.8;
        }, text: '【グレード候補】E/A <0.8 → グレード I 寄りの可能性。DcT・E/e\' で総合判断。' },
      { when: (f) => {
          if (f.lv_diastolic) return false;
          const ea = parseFloat(f.e_a_ratio || 0);
          return ea >= 2.0;
        }, text: '【グレード候補】E/A ≥2.0 → グレード III 寄りの可能性。DcT で確認。' },

      // 弁膜症
      { when: (f) => f.av === 'AS 中等度〜高度' || f.mv === 'MS' || f.mv === 'MR 中等度〜高度' || f.av === 'AR 中等度〜高度' || f.pv === 'PS',
        text: '中等度以上の弁膜症あり。循環器紹介、定期フォロー。' },
      { when: (f) => {
          const v = parseFloat(f.av_vmax || 0);
          return v >= 4.0;
        }, text: 'AV Vmax ≥4.0m/s、高度 AS の可能性。TAVI 適応評価含め循環器紹介。' },

      // 肺高血圧
      { when: (f) => { const trpg = parseFloat(f.trpg || 0); return trpg >= 30 && trpg < 40; },
        text: 'TRPG 30-40mmHg、軽度肺高血圧の可能性。原因検索 (左心疾患・肺疾患・肺塞栓等)。' },
      { when: (f) => { const trpg = parseFloat(f.trpg || 0); return trpg >= 40; },
        text: 'TRPG ≥40mmHg、中等度以上の肺高血圧疑い。専門医紹介。' },

      // 右心系
      { when: (f) => { const t = parseFloat(f.tapse || 0); return t > 0 && t < 17; },
        text: 'TAPSE <17mm、右室収縮能低下を示唆。' },
      { when: (f) => { const rv = parseFloat(f.rv_basal || 0); return rv > 42; },
        text: 'RV 基部径拡大 (>42mm)、右室拡大あり。原因精査。' },

      // うっ血
      { when: (f) => f.pericardium && f.pericardium !== 'なし',
        text: '心嚢液貯留あり。原因精査と心タンポナーデ徴候確認。' },
      { when: (f) => f.ivc_resp === '<50% (右房圧上昇)',
        text: 'IVC 呼吸性変動低下、右房圧上昇示唆。容量評価と利尿調整検討。' },
    ],
  },

  dvt: {
    label: '下肢静脈エコー (DVT)',
    sections: [
      {
        organ: '右下肢',
        items: [
          { id: 'r_cfv', label: '総大腿静脈 (CFV)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'r_sfv', label: '浅大腿静脈 (SFV)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'r_pop', label: '膝窩静脈 (Pop V)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'r_calf', label: '下腿静脈', type: 'choice', options: ['異常なし', '血栓疑い', '描出不良'] },
        ],
      },
      {
        organ: '左下肢',
        items: [
          { id: 'l_cfv', label: '総大腿静脈 (CFV)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'l_sfv', label: '浅大腿静脈 (SFV)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'l_pop', label: '膝窩静脈 (Pop V)', type: 'choice', options: ['圧迫可・血栓なし', '圧迫不可 (血栓あり)', '描出不良'] },
          { id: 'l_calf', label: '下腿静脈', type: 'choice', options: ['異常なし', '血栓疑い', '描出不良'] },
        ],
      },
      {
        organ: '付加所見',
        items: [
          { id: 'edema', label: '皮下浮腫', type: 'choice', options: ['なし', '右', '左', '両側'] },
          { id: 'wells', label: 'Wells スコア', type: 'numeric', unit: '点', placeholder: '0', hint: '0-1 低、2-6 中、≥3 高確率' },
        ],
      },
    ],
    assessmentRules: [
      { when: (f) => {
          const hasClot = [f.r_cfv, f.r_sfv, f.r_pop, f.l_cfv, f.l_sfv, f.l_pop].some(v => v === '圧迫不可 (血栓あり)');
          return hasClot;
        }, text: '近位 DVT を認める。血栓塞栓症評価と抗凝固療法開始、入院・専門医紹介推奨。' },
      { when: (f) => f.r_calf === '血栓疑い' || f.l_calf === '血栓疑い',
        text: '下腿型 DVT 疑い。症状・リスク評価により抗凝固療法 or 経過観察、1-2週後再検。' },
      { when: (f) => parseInt(f.wells || 0) >= 3,
        text: 'Wells 高確率。D-dimer 上昇例ではエコー陰性でも CT・MRI 追加検討。' },
      { when: (f) => {
          const allNeg = [f.r_cfv, f.r_sfv, f.r_pop, f.l_cfv, f.l_sfv, f.l_pop].every(v => v === '圧迫可・血栓なし' || !v);
          const lowWells = parseInt(f.wells || 0) <= 1;
          return allNeg && lowWells && (f.r_cfv || f.l_cfv);
        }, text: '近位エコーで明らかな血栓所見なし、Wells 低確率。D-dimer 陰性なら DVT 除外可。' },
    ],
  },
};
