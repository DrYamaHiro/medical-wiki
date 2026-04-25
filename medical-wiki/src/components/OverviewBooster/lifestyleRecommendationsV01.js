/**
 * Overview Booster — 病態別 食事・運動推奨内容 (v0.1)
 *
 * 各疾患 × 各 lifestyle ID で 2-3行のテキスト推奨を表示
 */

export const LIFESTYLE_RECOMMENDATIONS_V01 = {
  ht: {
    diet: '減塩 6g/日未満 (DASH食推奨: 野菜/果物/低脂肪乳製品/全粒穀物)。アルコール: 男20g/女10g/日以下。',
    diet_exercise: '上記減塩+DASH食 + 有酸素運動30分/日 週5回 (中等強度)。SBP -5〜7 mmHg期待。',
    diet_exercise_restricted: {
      orthopedic: '減塩+DASH食 + 水中歩行 / 座位レジスタンス / ストレッチ。膝OAではジョギング・スクワット回避。',
      cardiac:    '減塩+DASH食 + 心リハ管理下運動 (AT点-1 BPM以下)。NYHA III以上は心リハ施設で個別処方。',
      respiratory:'減塩+DASH食 + 呼吸リハ 5分×3セット/日。SpO2 90%以下になる強度回避。',
      renal_rehab:'減塩+蛋白制限 (CKDステージ別) + 腎リハ 週3回 15-20分中等度。eGFR低下抑制エビデンスあり。',
      renal_restrict:'減塩+蛋白制限 (G4-5 0.6-0.8g/kg/日) + ストレッチ・座位運動のみ。負荷運動・激運動回避。',
      frailty:    '減塩 (やや緩和) + 椅子立上り20回×2セット/日 + 10分歩行 + バランス訓練。栄養確保優先。',
      other:      '個別判断 (note参照)。',
    },
  },
  dlp: {
    diet: '飽和脂肪酸<7%E、トランス脂肪酸ゼロ。魚 週2回以上 (EPA/DHA)。植物ステロール 2g/日。食物繊維 25g/日。',
    diet_exercise: '上記+有酸素運動 週200-300分 (LDL低下・HDL上昇に強エビデンス)。',
    diet_exercise_restricted: {
      orthopedic: '飽和脂肪減+魚油 + 水中歩行・座位エルゴメーター。',
      cardiac:    '飽和脂肪減+魚油 + 心リハ管理下運動。スタチン継続でCV保護優先。',
      respiratory:'飽和脂肪減+魚油 + 呼吸リハ程度の軽運動。',
      renal_rehab:'飽和脂肪減+魚油+蛋白配慮 + 腎リハ。',
      renal_restrict:'飽和脂肪減+魚油+蛋白制限 + 軽ストレッチのみ。',
      frailty:    '飽和脂肪減 (極端でない) + 軽運動。栄養不足回避を優先。',
      other:      '個別判断。',
    },
  },
  t2dm: {
    diet: 'カロリー 25-30 kcal/標準体重kg/日。糖質制限 or カロリー制限 (同等)。低GI食品 (玄米/豆類)。食物繊維≥20g/日。',
    diet_exercise: '上記+有酸素運動 週150-200分 + レジスタンス週2-3回。食後1-2hに10-15分歩行で食後血糖↓。',
    diet_exercise_restricted: {
      orthopedic: 'カロリー制限+水中歩行・座位エルゴメーター。膝OAでジョギング回避。',
      cardiac:    'カロリー制限+心リハ。低血糖兆候 (動悸・冷汗) を運動中モニタ。',
      respiratory:'カロリー制限+呼吸リハ程度。',
      renal_rehab:'蛋白配慮 (CKD合併時 0.8g/kg/日) + 腎リハ。',
      renal_restrict:'蛋白制限+軽ストレッチ。SGLT2i のシックデイ注意。',
      frailty:    '低栄養回避優先 (BMI 22-25目標)。HbA1c目標も緩和 (Cat II <8.0%, Cat III <8.5%)。',
      other:      '個別判断。',
    },
  },
  ckd: {
    diet: 'G3a: 蛋白 0.8-1.0g/kg/日。G3b-4: 0.6-0.8g/kg/日。塩分<6g/日。K制限 (G3b≤2000mg, G4-5≤1500mg)。リン制限 (G4-5≤1000mg)。',
    diet_exercise: '上記+有酸素運動 週150分 (腎リハの一部、eGFR低下抑制)。',
    diet_exercise_restricted: {
      orthopedic: '蛋白・塩分制限+水中歩行 (関節負担少)。',
      cardiac:    '蛋白・塩分制限+心リハ管理下運動 (HFrEF併存で AT点-1)。',
      respiratory:'蛋白・塩分制限+呼吸リハ。',
      renal_rehab:'蛋白制限+腎リハ専用プログラム (週3回・15-20分中等度)。',
      renal_restrict:'G5・透析周術期は運動回避〜軽ストレッチのみ。栄養確保優先。',
      frailty:    '蛋白制限を緩和し低栄養回避優先。椅子立上り・歩行のみ。',
      other:      '個別判断。',
    },
  },
  af: {
    diet: 'カフェイン制限 (コーヒー≤2-3杯/日)、アルコール制限 (特にビール・蒸留酒、AF誘発)、塩分<6g/日 (HT併存時)。',
    diet_exercise: '上記+有酸素運動 週150分 (中等度)。激しいエンデュランス運動はparadoxicalにAF増加報告あり、避ける。',
    diet_exercise_restricted: {
      orthopedic: 'カフェイン・アルコール制限+水中歩行。',
      cardiac:    'HFrEF併存→心リハ管理下。レート制御確認後に運動。',
      respiratory:'呼吸リハ程度。',
      renal_rehab:'腎リハ。DOAC用量を eGFRで調整確認。',
      renal_restrict:'軽ストレッチ。DOAC用量確認 (eGFR 15-50で減量)。',
      frailty:    '転倒予防優先。出血リスク評価 (HAS-BLED)。',
      other:      '個別判断。',
    },
  },
  hfref: {
    diet: '塩分 <2-3g/日 (厳格)。水分制限: 重症で1.5-2L/日。アルコール禁止 (心筋障害悪化)。日々の体重測定 (+2kg=利尿薬trigger)。',
    diet_exercise: '上記+心リハ週90-150分 (軽〜中等強度)。心リハ施設で運動処方が原則。',
    diet_exercise_restricted: {
      orthopedic: '塩水分制限+心リハの中で水中歩行・座位レジスタンス。',
      cardiac:    'NYHA III以上は心リハ管理下のみ。NYHA IV・代償破綻時は運動禁忌。',
      respiratory:'塩水分制限+呼吸リハ。',
      renal_rehab:'塩水分制限+蛋白配慮+腎リハ・心リハ統合プログラム。',
      renal_restrict:'運動回避〜軽ストレッチ。利尿薬+SGLT2i+フィネレノンでK・Cr厳格モニタ。',
      frailty:    '塩水分制限 (緩和)。栄養確保。心リハ+リハビリ統合。',
      other:      '個別判断。',
    },
  },
  hfpef: {
    diet: '塩分 <6g/日。水分制限はHFrEFほど厳格でない。体重管理 (BMI 25-27目標)。',
    diet_exercise: '上記+有酸素運動 30分/日 週3-5回 (HFpEFで運動耐容能・QOL改善)。',
    diet_exercise_restricted: {
      orthopedic: '塩分制限+水中歩行。',
      cardiac:    '心リハ管理下。',
      respiratory:'呼吸リハ程度。',
      renal_rehab:'塩分・蛋白配慮+腎リハ。',
      renal_restrict:'軽運動のみ。',
      frailty:    '栄養確保優先+軽運動。',
      other:      '個別判断。',
    },
  },
  asthma: {
    diet: '体重管理 (BMI 25未満)。ビタミンD・抗酸化物質増加。アスピリン喘息 (AERD) はNSAID完全回避。',
    diet_exercise: '上記+運動誘発喘息ありなら 運動前 SABA吸入。水泳が推奨。',
    diet_exercise_restricted: {
      orthopedic: '減量+水中歩行 (温度管理されたプール)。',
      cardiac:    '心リハ。β遮断薬は喘息禁忌、循環器医と連携。',
      respiratory:'呼吸リハ・口すぼめ呼吸。重度発作中は安静。',
      renal_rehab:'減量+腎リハ。',
      renal_restrict:'軽運動のみ。',
      frailty:    '転倒予防。OCS長期で骨量低下注意。',
      other:      '個別判断。',
    },
  },
  copd: {
    diet: '禁煙が最優先。栄養 (BMI 21以上目標、低栄養回避)。低酸素時の高炭水化物食回避 (CO2産生↑)。',
    diet_exercise: '上記+肺リハ (mMRC≥2で強推奨)。週3回以上の中等度運動。',
    diet_exercise_restricted: {
      orthopedic: '減量+水中歩行 (関節負担少)。',
      cardiac:    '心リハ・肺リハ統合。',
      respiratory:'肺リハで段階的運動処方。SpO2≥88-92%維持 (CO2貯留型)。',
      renal_rehab:'肺リハ+腎リハ。',
      renal_restrict:'軽ストレッチ・呼吸リハのみ。',
      frailty:    '栄養確保+段階的肺リハ。',
      other:      '個別判断。',
    },
  },
  gout: {
    diet: 'プリン体食制限 (内臓・魚卵)、果糖控え (清涼飲料水)、アルコール≤エタノール25g/日 (ビール特に控)、水分≥2L/日。',
    diet_exercise: '上記+軽度有酸素運動 30分/日。急性発作中は安静。減量推奨だが急速減量 (月>2kg) は発作誘発。月1-2kg目安。',
    diet_exercise_restricted: {
      orthopedic: '飲水・プリン体制限+水中歩行 (関節炎部位の痛み軽減)。',
      cardiac:    '飲水・プリン体制限+心リハ。',
      respiratory:'飲水・プリン体制限+呼吸リハ程度。',
      renal_rehab:'飲水 (CKD 飲水量に注意)+蛋白制限+腎リハ。',
      renal_restrict:'飲水量制限と尿酸排泄のバランス専門医相談。軽運動のみ。',
      frailty:    '蛋白確保 + プリン体は厳しすぎず。転倒予防。',
      other:      '個別判断。',
    },
  },
  ascvd2: {
    diet: '地中海食 (オリーブ油・魚・全粒穀物・野菜・ナッツ)。飽和脂肪<7%E、トランス脂肪ゼロ。塩分<6g/日。完全禁煙。',
    diet_exercise: '上記+有酸素運動 週150-200分 (心リハ推奨)。レジスタンス週2-3回。',
    diet_exercise_restricted: {
      orthopedic: '地中海食+水中歩行・座位エルゴメーター。',
      cardiac:    '地中海食+心リハ管理下運動 (PCI後・MI後)。',
      respiratory:'地中海食+呼吸リハ。',
      renal_rehab:'地中海食 (蛋白配慮)+腎リハ・心リハ統合。',
      renal_restrict:'地中海食 (蛋白制限)+軽運動。',
      frailty:    '栄養確保+軽運動。',
      other:      '個別判断。',
    },
  },
};
