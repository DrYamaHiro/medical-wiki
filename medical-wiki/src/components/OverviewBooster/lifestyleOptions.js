/**
 * Overview Booster — 食事/運動 3択 + (c) 制限考慮 7サブ理由
 */

export const LIFESTYLE_OPTIONS = [
  { id: 'lifestyle_diet',                     label: '食事療法',                   description: '運動療法は実施せず食事療法のみ。整形外科疾患による運動困難・心不全代償破綻・運動絶対禁忌の場合' },
  { id: 'lifestyle_diet_exercise',            label: '食事+運動療法',              description: '通常 (default)' },
  { id: 'lifestyle_diet_exercise_restricted', label: '食事+運動療法 [制限考慮]',   description: '整形/心血管/呼吸器/腎/フレイル等で運動内容に制限あり' },
];

// (c) を選択した場合のサブ理由 (radio排他、必須選択)
export const LIFESTYLE_RESTRICTION_REASONS = [
  { id: 'orthopedic',    label: '整形外科疾患',     description: '膝/腰/股関節OA・腰椎症・脊柱管狭窄' },
  { id: 'cardiac',       label: '心血管制限',        description: 'NYHA III以上・運動誘発虚血・大動脈弁狭窄重症' },
  { id: 'respiratory',   label: '呼吸器制限',        description: '酸素必要・mMRC 4 (息切れで安静時困難)' },
  { id: 'renal_rehab',   label: '腎リハ適応',        description: 'CKD G3-G4 (運動可能、心リハ類似プログラム)' },
  { id: 'renal_restrict',label: '腎制限',            description: 'CKD G5 / 透析周術期 / 血行動態不安定' },
  { id: 'frailty',       label: 'フレイル',          description: 'Cat III / 転倒既往3回以上 / サルコペニア' },
  { id: 'other',         label: 'その他',            description: '自由記載' },
];
