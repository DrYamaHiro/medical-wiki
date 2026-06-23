// Echo Booster データ定義
// 各部位の臓器・チェック項目を定義
// type: choice (排他選択), multichoice (複数選択), numeric (数値+単位), text (自由入力)

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
          { id: 'liver_note', label: '特記事項', type: 'text', placeholder: '例: 嚢胞径 15mm 右葉 S6 等' },
        ],
      },
      {
        organ: '胆嚢',
        items: [
          { id: 'gb_visualize', label: '描出', type: 'choice', options: ['良好', '不良 (腸管ガス等)'] },
          { id: 'gb_stone', label: '結石', type: 'choice', options: ['なし', 'あり (単発)', 'あり (多発)', 'デブリ・スラッジ'] },
          { id: 'gb_wall', label: '壁厚', type: 'choice', options: ['正常 (≤3mm)', '肥厚 (>3mm)'] },
          { id: 'gb_polyp', label: 'ポリープ', type: 'choice', options: ['なし', 'あり (≤10mm)', 'あり (>10mm、要精査)'] },
          { id: 'gb_note', label: '特記事項', type: 'text', placeholder: '例: 結石径 8mm 等' },
        ],
      },
      {
        organ: '膵臓',
        items: [
          { id: 'pan_visualize', label: '描出', type: 'choice', options: ['良好', '不良 (腸管ガス等)'] },
          { id: 'pan_size', label: '腫大', type: 'choice', options: ['なし', '局所性', 'びまん性'] },
          { id: 'pan_duct', label: '主膵管', type: 'choice', options: ['正常 (≤3mm)', '拡張 (>3mm、要精査)'] },
          { id: 'pan_mass', label: '腫瘤・嚢胞', type: 'choice', options: ['なし', '嚢胞性病変', '充実性病変 (要精査)'] },
          { id: 'pan_note', label: '特記事項', type: 'text', placeholder: '' },
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
          { id: 'kid_note', label: '特記事項', type: 'text', placeholder: '' },
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
        organ: '右総頸動脈',
        items: [
          { id: 'r_cca_imt', label: 'max IMT', type: 'numeric', unit: 'mm', placeholder: '0.8', hint: '正常 <1.1mm' },
          { id: 'r_cca_plaque', label: 'プラーク', type: 'choice', options: ['なし', 'あり (低エコー)', 'あり (高エコー)', 'あり (混合)'] },
        ],
      },
      {
        organ: '右頸動脈洞・内頸動脈',
        items: [
          { id: 'r_ica_stenosis', label: '狭窄度 (NASCET)', type: 'choice', options: ['なし', '軽度 (<50%)', '中等度 (50-69%)', '高度 (≥70%)', '閉塞'] },
          { id: 'r_ica_psv', label: 'PSV', type: 'numeric', unit: 'cm/s', placeholder: '70', hint: '<125 正常、≥230 高度狭窄示唆' },
        ],
      },
      {
        organ: '左総頸動脈',
        items: [
          { id: 'l_cca_imt', label: 'max IMT', type: 'numeric', unit: 'mm', placeholder: '0.8', hint: '正常 <1.1mm' },
          { id: 'l_cca_plaque', label: 'プラーク', type: 'choice', options: ['なし', 'あり (低エコー)', 'あり (高エコー)', 'あり (混合)'] },
        ],
      },
      {
        organ: '左頸動脈洞・内頸動脈',
        items: [
          { id: 'l_ica_stenosis', label: '狭窄度 (NASCET)', type: 'choice', options: ['なし', '軽度 (<50%)', '中等度 (50-69%)', '高度 (≥70%)', '閉塞'] },
          { id: 'l_ica_psv', label: 'PSV', type: 'numeric', unit: 'cm/s', placeholder: '70', hint: '<125 正常、≥230 高度狭窄示唆' },
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
    label: '心エコー (基本)',
    sections: [
      {
        organ: '左室',
        items: [
          { id: 'lv_ef', label: 'LVEF', type: 'numeric', unit: '%', placeholder: '60', hint: '正常 ≥50%' },
          { id: 'lv_size', label: 'LVDd', type: 'numeric', unit: 'mm', placeholder: '45', hint: '正常 ≤55mm' },
          { id: 'lv_wall', label: '壁厚 (IVS/PW)', type: 'text', placeholder: '例: 11/11mm', hint: '正常 ≤11mm' },
          { id: 'lv_motion', label: '局所壁運動', type: 'choice', options: ['正常', '低下あり (虚血示唆)', 'びまん性低下'] },
          { id: 'lv_diastolic', label: '拡張機能', type: 'choice', options: ['正常', 'グレードI (緩徐弛緩)', 'グレードII (偽正常)', 'グレードIII (拘束型)'] },
        ],
      },
      {
        organ: '弁膜',
        items: [
          { id: 'av', label: '大動脈弁', type: 'choice', options: ['正常', 'AR 軽度', 'AR 中等度〜高度', 'AS 軽度', 'AS 中等度〜高度', 'AR+AS'] },
          { id: 'mv', label: '僧帽弁', type: 'choice', options: ['正常', 'MR 軽度', 'MR 中等度〜高度', 'MS', '逸脱 (MVP)'] },
          { id: 'tv', label: '三尖弁', type: 'choice', options: ['正常', 'TR 軽度', 'TR 中等度〜高度'] },
          { id: 'pa_pressure', label: '推定肺動脈圧 (TRPG)', type: 'numeric', unit: 'mmHg', placeholder: '20', hint: '正常 <30mmHg' },
        ],
      },
      {
        organ: '左房・右心',
        items: [
          { id: 'la_size', label: 'LAD', type: 'numeric', unit: 'mm', placeholder: '35', hint: '正常 ≤40mm' },
          { id: 'rv_size', label: '右室', type: 'choice', options: ['正常', '拡大'] },
          { id: 'ra_size', label: '右房', type: 'choice', options: ['正常', '拡大'] },
        ],
      },
      {
        organ: '下大静脈・心嚢液',
        items: [
          { id: 'ivc_size', label: 'IVC 径', type: 'numeric', unit: 'mm', placeholder: '15', hint: '正常 ≤21mm' },
          { id: 'ivc_resp', label: 'IVC 呼吸性変動', type: 'choice', options: ['>50% (正常)', '<50% (右房圧上昇)'] },
          { id: 'pericardium', label: '心嚢液', type: 'choice', options: ['なし', '少量', '中等量〜多量'] },
        ],
      },
    ],
    assessmentRules: [
      { when: (f) => { const ef = parseFloat(f.lv_ef || 0); return ef > 0 && ef < 40; },
        text: 'LVEF 40%未満 (HFrEF)。ACEi/ARB/ARNI・β遮断薬・MRA・SGLT2i の標準治療検討。循環器紹介推奨。' },
      { when: (f) => { const ef = parseFloat(f.lv_ef || 0); return ef >= 40 && ef < 50; },
        text: 'LVEF 40-49% (HFmrEF)。HFrEF に準じた治療を検討、SGLT2i 推奨。' },
      { when: (f) => f.lv_motion === '低下あり (虚血示唆)',
        text: '局所壁運動低下あり。虚血性心疾患の精査推奨 (CAG or CTA)。' },
      { when: (f) => f.av === 'AS 中等度〜高度' || f.mv === 'MS' || f.mv === 'MR 中等度〜高度' || f.av === 'AR 中等度〜高度',
        text: '中等度以上の弁膜症あり。循環器専門医紹介、定期フォロー。' },
      { when: (f) => { const trpg = parseFloat(f.pa_pressure || 0); return trpg >= 30; },
        text: '推定肺動脈圧上昇。肺高血圧症の精査推奨。' },
      { when: (f) => f.pericardium && f.pericardium !== 'なし',
        text: '心嚢液貯留あり。原因精査と心タンポナーデ徴候の確認。' },
      { when: (f) => f.ivc_resp === '<50% (右房圧上昇)',
        text: 'IVC 呼吸性変動低下。右心系うっ血を示唆、容量評価と利尿薬調整検討。' },
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
          { id: 'note', label: '特記事項', type: 'text', placeholder: '例: 中枢進展なし、急性血栓像 等' },
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
