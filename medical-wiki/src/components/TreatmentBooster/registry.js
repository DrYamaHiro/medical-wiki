/**
 * Treatment Booster — 疾患別データのレジストリ
 *
 * 新しい疾患を追加する手順:
 * 1. `{disease}TreatmentData.js` を作成（DRUGS, MODIFIERS, CONTROL_METRIC, RECOMMENDATIONS, DO_NOT_RULES を export）
 * 2. 下のimportとregistryに追加
 * 3. MDX側で `<TreatmentBooster disease="{disease-key}" />` と書くだけで使える
 */

import * as htTreatmentData from './htTreatmentData';
import * as dmTreatmentData from './dmTreatmentData';
import * as dlpTreatmentData from './dlpTreatmentData';
import * as asthmaTreatmentData from './asthmaTreatmentData';

export const TREATMENT_DATA = {
  hypertension: {
    data: htTreatmentData,
    subtitle: '高血圧の治療修正支援（JSH2025準拠）',
  },
  t2dm: {
    data: dmTreatmentData,
    subtitle: '2型糖尿病の治療修正支援（JDS2024 + JGS/JDS高齢者GL2023準拠）',
  },
  dyslipidemia: {
    data: dlpTreatmentData,
    subtitle: '脂質異常症の治療修正支援（JAS動脈硬化性疾患予防GL2022準拠）',
  },
  asthma: {
    data: asthmaTreatmentData,
    subtitle: '気管支喘息の治療修正支援（JGL2024 + GINA 2024準拠）',
  },
};
