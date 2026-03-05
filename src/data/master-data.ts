/**
 * master-data.ts
 * 日本の労働市場マスターデータ
 *
 * データソース参考: 厚生労働省「一般職業紹介状況」、総務省「労働力調査」、
 * 帝国データバンク「人手不足倒産動向調査」、リクルートワークス研究所、
 * 厚生労働省「雇用動向調査」、各種政府統計 (2024年参考値)
 */

// ---------------------------------------------------------------------------
// 1. 業種別有効求人倍率 (2024参考)
// ---------------------------------------------------------------------------

export interface JobOpeningRatio {
  industryCode: string;
  industryName: string;
  /** 有効求人倍率 */
  ratio: number;
  /** 前年比増減 */
  yoyChange: number;
  /** 正社員求人倍率 */
  fullTimeRatio: number;
}

export const JOB_OPENING_RATIOS: JobOpeningRatio[] = [
  { industryCode: "construction", industryName: "建設業", ratio: 5.5, yoyChange: 0.3, fullTimeRatio: 4.8 },
  { industryCode: "healthcare", industryName: "介護・福祉", ratio: 3.8, yoyChange: 0.2, fullTimeRatio: 3.5 },
  { industryCode: "food_service", industryName: "飲食サービス業", ratio: 3.0, yoyChange: 0.1, fullTimeRatio: 2.4 },
  { industryCode: "transport", industryName: "運輸業", ratio: 2.8, yoyChange: 0.4, fullTimeRatio: 2.5 },
  { industryCode: "it", industryName: "IT・情報通信業", ratio: 2.5, yoyChange: 0.2, fullTimeRatio: 2.3 },
  { industryCode: "medical", industryName: "医療", ratio: 2.2, yoyChange: 0.1, fullTimeRatio: 2.0 },
  { industryCode: "manufacturing", industryName: "製造業", ratio: 1.8, yoyChange: -0.1, fullTimeRatio: 1.5 },
  { industryCode: "retail", industryName: "小売業", ratio: 1.6, yoyChange: 0.0, fullTimeRatio: 1.2 },
  { industryCode: "education", industryName: "教育", ratio: 1.4, yoyChange: 0.0, fullTimeRatio: 1.1 },
  { industryCode: "real_estate", industryName: "不動産業", ratio: 1.2, yoyChange: -0.1, fullTimeRatio: 1.0 },
  { industryCode: "office", industryName: "事務職", ratio: 0.5, yoyChange: 0.0, fullTimeRatio: 0.4 },
  { industryCode: "other", industryName: "全業種平均", ratio: 1.3, yoyChange: 0.1, fullTimeRatio: 1.0 },
];

/** 業種コードから求人倍率を取得 */
export function getJobOpeningRatio(industryCode: string): JobOpeningRatio | undefined {
  return JOB_OPENING_RATIOS.find((r) => r.industryCode === industryCode);
}

/** 全業種平均の求人倍率 */
export const NATIONAL_AVG_RATIO = 1.3;

// ---------------------------------------------------------------------------
// 2. 離職率ベンチマーク (業種別・年代別)
// ---------------------------------------------------------------------------

export interface TurnoverBenchmark {
  industryCode: string;
  industryName: string;
  /** 年間平均離職率 (%) */
  avgTurnoverRate: number;
  /** 入社3年以内離職率 (%) */
  threeYearTurnoverRate: number;
  /** 入社1年以内離職率 (%) */
  firstYearTurnoverRate: number;
  /** パート・有期の離職率 (%) */
  partTimeTurnoverRate: number;
}

export const TURNOVER_BENCHMARKS: TurnoverBenchmark[] = [
  { industryCode: "construction", industryName: "建設業", avgTurnoverRate: 9.5, threeYearTurnoverRate: 30.0, firstYearTurnoverRate: 12.0, partTimeTurnoverRate: 18.0 },
  { industryCode: "manufacturing", industryName: "製造業", avgTurnoverRate: 10.2, threeYearTurnoverRate: 28.0, firstYearTurnoverRate: 10.5, partTimeTurnoverRate: 22.0 },
  { industryCode: "transport", industryName: "運輸業", avgTurnoverRate: 12.3, threeYearTurnoverRate: 33.0, firstYearTurnoverRate: 14.0, partTimeTurnoverRate: 25.0 },
  { industryCode: "food_service", industryName: "飲食サービス業", avgTurnoverRate: 26.9, threeYearTurnoverRate: 51.5, firstYearTurnoverRate: 25.0, partTimeTurnoverRate: 45.0 },
  { industryCode: "retail", industryName: "小売業", avgTurnoverRate: 14.6, threeYearTurnoverRate: 37.0, firstYearTurnoverRate: 15.0, partTimeTurnoverRate: 30.0 },
  { industryCode: "it", industryName: "IT・情報通信業", avgTurnoverRate: 11.8, threeYearTurnoverRate: 30.0, firstYearTurnoverRate: 12.5, partTimeTurnoverRate: 20.0 },
  { industryCode: "healthcare", industryName: "医療・福祉", avgTurnoverRate: 14.4, threeYearTurnoverRate: 38.0, firstYearTurnoverRate: 16.0, partTimeTurnoverRate: 28.0 },
  { industryCode: "education", industryName: "教育", avgTurnoverRate: 11.0, threeYearTurnoverRate: 25.0, firstYearTurnoverRate: 10.0, partTimeTurnoverRate: 20.0 },
  { industryCode: "real_estate", industryName: "不動産業", avgTurnoverRate: 15.1, threeYearTurnoverRate: 35.0, firstYearTurnoverRate: 14.5, partTimeTurnoverRate: 25.0 },
  { industryCode: "other", industryName: "全業種平均", avgTurnoverRate: 15.0, threeYearTurnoverRate: 32.0, firstYearTurnoverRate: 12.0, partTimeTurnoverRate: 25.0 },
];

/** 新卒3年以内離職率 */
export const NEW_GRAD_TURNOVER = {
  /** 大卒3年以内離職率 (%) */
  university: 32.0,
  /** 高卒3年以内離職率 (%) */
  highSchool: 37.0,
  /** 短大等3年以内離職率 (%) */
  juniorCollege: 42.0,
  /** 中卒3年以内離職率 (%) */
  middleSchool: 55.0,
} as const;

/** 年代別離職傾向 (ベース離職率に対する倍率) */
export const AGE_TURNOVER_MULTIPLIER: Record<string, number> = {
  "20-24": 1.8,
  "25-29": 1.4,
  "30-34": 1.0,
  "35-39": 0.8,
  "40-44": 0.7,
  "45-49": 0.6,
  "50-54": 0.5,
  "55-59": 0.6,
  "60+": 0.9,
};

export function getTurnoverBenchmark(industryCode: string): TurnoverBenchmark | undefined {
  return TURNOVER_BENCHMARKS.find((b) => b.industryCode === industryCode);
}

// ---------------------------------------------------------------------------
// 3. 人件費データ
// ---------------------------------------------------------------------------

export interface RecruitmentCost {
  type: "new_grad" | "mid_career";
  label: string;
  /** 1人あたり採用コスト (万円) */
  costPerHire: number;
  /** 採用活動期間目安 (月) */
  avgTimeToFill: number;
}

export const RECRUITMENT_COSTS: RecruitmentCost[] = [
  { type: "new_grad", label: "新卒採用", costPerHire: 93, avgTimeToFill: 6 },
  { type: "mid_career", label: "中途採用", costPerHire: 84, avgTimeToFill: 3 },
];

/**
 * 離職コスト係数
 * 離職1人あたりのコスト = 年収 x 係数
 * 職位・業種で変動: 一般社員50-100%, 管理職100-200%
 */
export const ATTRITION_COST_MULTIPLIER = {
  /** 一般社員の離職コスト倍率 (最小) */
  staffMin: 0.5,
  /** 一般社員の離職コスト倍率 (最大) */
  staffMax: 1.0,
  /** 管理職の離職コスト倍率 (最小) */
  managerMin: 1.0,
  /** 管理職の離職コスト倍率 (最大) */
  managerMax: 2.0,
  /** キーパーソンの離職コスト倍率 */
  keyPerson: 2.0,
} as const;

/** 地域別最低賃金 (2024年度, 円/時間, 主要地域) */
export interface MinimumWage {
  prefecture: string;
  wage: number;
}

export const MINIMUM_WAGES: MinimumWage[] = [
  { prefecture: "東京都", wage: 1163 },
  { prefecture: "神奈川県", wage: 1162 },
  { prefecture: "大阪府", wage: 1114 },
  { prefecture: "愛知県", wage: 1077 },
  { prefecture: "埼玉県", wage: 1078 },
  { prefecture: "千葉県", wage: 1076 },
  { prefecture: "京都府", wage: 1058 },
  { prefecture: "兵庫県", wage: 1052 },
  { prefecture: "福岡県", wage: 992 },
  { prefecture: "北海道", wage: 1010 },
  { prefecture: "宮城県", wage: 973 },
  { prefecture: "広島県", wage: 1020 },
  { prefecture: "静岡県", wage: 1034 },
  { prefecture: "新潟県", wage: 985 },
  { prefecture: "長野県", wage: 998 },
  { prefecture: "茨城県", wage: 1005 },
  { prefecture: "岐阜県", wage: 1001 },
  { prefecture: "群馬県", wage: 985 },
  { prefecture: "栃木県", wage: 1004 },
  { prefecture: "三重県", wage: 1023 },
  { prefecture: "熊本県", wage: 952 },
  { prefecture: "鹿児島県", wage: 947 },
  { prefecture: "沖縄県", wage: 952 },
  { prefecture: "岩手県", wage: 952 },
  { prefecture: "秋田県", wage: 951 },
];

/** 全国加重平均最低賃金 (2024年度) */
export const NATIONAL_AVG_MINIMUM_WAGE = 1055;

export function getMinimumWage(prefecture: string): number {
  const found = MINIMUM_WAGES.find((w) => w.prefecture === prefecture);
  return found?.wage ?? NATIONAL_AVG_MINIMUM_WAGE;
}

/** 業種別平均年収 (万円, 2024参考) */
export interface IndustryAvgSalary {
  industryCode: string;
  industryName: string;
  /** 全体平均年収 (万円) */
  avgSalary: number;
  /** 管理職平均年収 (万円) */
  managerSalary: number;
  /** 非正規平均年収 (万円) */
  nonRegularSalary: number;
}

export const INDUSTRY_AVG_SALARIES: IndustryAvgSalary[] = [
  { industryCode: "construction", industryName: "建設業", avgSalary: 510, managerSalary: 720, nonRegularSalary: 280 },
  { industryCode: "manufacturing", industryName: "製造業", avgSalary: 500, managerSalary: 700, nonRegularSalary: 260 },
  { industryCode: "transport", industryName: "運輸業", avgSalary: 440, managerSalary: 620, nonRegularSalary: 250 },
  { industryCode: "food_service", industryName: "飲食サービス業", avgSalary: 310, managerSalary: 450, nonRegularSalary: 180 },
  { industryCode: "retail", industryName: "小売業", avgSalary: 370, managerSalary: 530, nonRegularSalary: 200 },
  { industryCode: "it", industryName: "IT・情報通信業", avgSalary: 620, managerSalary: 850, nonRegularSalary: 350 },
  { industryCode: "healthcare", industryName: "医療・福祉", avgSalary: 400, managerSalary: 580, nonRegularSalary: 230 },
  { industryCode: "education", industryName: "教育", avgSalary: 450, managerSalary: 650, nonRegularSalary: 250 },
  { industryCode: "real_estate", industryName: "不動産業", avgSalary: 530, managerSalary: 740, nonRegularSalary: 270 },
  { industryCode: "other", industryName: "全業種平均", avgSalary: 460, managerSalary: 650, nonRegularSalary: 250 },
];

export function getIndustryAvgSalary(industryCode: string): IndustryAvgSalary | undefined {
  return INDUSTRY_AVG_SALARIES.find((s) => s.industryCode === industryCode);
}

// ---------------------------------------------------------------------------
// 4. 労働力人口推計
// ---------------------------------------------------------------------------

export interface LaborForceProjection {
  year: number;
  /** 労働力人口 (万人) */
  laborForce: number;
  /** 生産年齢人口 15-64歳 (万人) */
  workingAge: number;
  /** 65歳以上の就業者 (万人) */
  elderlyWorkers: number;
  /** 外国人労働者 (万人) */
  foreignWorkers: number;
}

export const LABOR_FORCE_PROJECTIONS: LaborForceProjection[] = [
  { year: 2024, laborForce: 6900, workingAge: 7400, elderlyWorkers: 920, foreignWorkers: 205 },
  { year: 2025, laborForce: 6860, workingAge: 7330, elderlyWorkers: 930, foreignWorkers: 220 },
  { year: 2030, laborForce: 6560, workingAge: 6950, elderlyWorkers: 960, foreignWorkers: 280 },
  { year: 2035, laborForce: 6220, workingAge: 6500, elderlyWorkers: 940, foreignWorkers: 340 },
  { year: 2040, laborForce: 5870, workingAge: 5980, elderlyWorkers: 890, foreignWorkers: 400 },
];

/** 年齢構成比の変化予測 (%) */
export interface AgeCompositionProjection {
  year: number;
  /** 15-29歳の割合 (%) */
  young: number;
  /** 30-49歳の割合 (%) */
  prime: number;
  /** 50-64歳の割合 (%) */
  senior: number;
  /** 65歳以上の割合 (%) */
  elderly: number;
}

export const AGE_COMPOSITION_PROJECTIONS: AgeCompositionProjection[] = [
  { year: 2024, young: 17.5, prime: 35.0, senior: 30.5, elderly: 17.0 },
  { year: 2025, young: 17.2, prime: 34.5, senior: 30.8, elderly: 17.5 },
  { year: 2030, young: 15.8, prime: 33.0, senior: 31.5, elderly: 19.7 },
  { year: 2035, young: 14.5, prime: 31.5, senior: 32.0, elderly: 22.0 },
  { year: 2040, young: 13.2, prime: 30.0, senior: 32.5, elderly: 24.3 },
];

/** 外国人労働者の推移と国籍別構成 */
export interface ForeignWorkerTrend {
  year: number;
  /** 総数 (万人) */
  total: number;
  /** 技能実習 (万人) */
  technicalIntern: number;
  /** 特定技能 (万人) */
  specifiedSkilled: number;
  /** 専門的・技術的分野 (万人) */
  professional: number;
  /** その他 (万人) */
  other: number;
}

export const FOREIGN_WORKER_TRENDS: ForeignWorkerTrend[] = [
  { year: 2020, total: 172, technicalIntern: 40, specifiedSkilled: 2, professional: 36, other: 94 },
  { year: 2021, total: 173, technicalIntern: 35, specifiedSkilled: 5, professional: 39, other: 94 },
  { year: 2022, total: 182, technicalIntern: 34, specifiedSkilled: 13, professional: 48, other: 87 },
  { year: 2023, total: 205, technicalIntern: 41, specifiedSkilled: 23, professional: 60, other: 81 },
  { year: 2024, total: 230, technicalIntern: 38, specifiedSkilled: 35, professional: 70, other: 87 },
];

// ---------------------------------------------------------------------------
// 5. 人手不足対策メニュー
// ---------------------------------------------------------------------------

export type InterventionCategory =
  | "dx_automation"
  | "flexible_employment"
  | "wage_increase"
  | "benefits"
  | "recruitment_channels"
  | "foreign_recruitment"
  | "reskilling";

export interface Intervention {
  id: string;
  category: InterventionCategory;
  categoryLabel: string;
  title: string;
  description: string;
  /** 初期導入コスト目安 (万円) */
  initialCost: { min: number; max: number };
  /** 月額ランニングコスト目安 (万円) */
  monthlyCost: { min: number; max: number };
  /** 効果が出るまでの期間 (月) */
  timeToEffect: { min: number; max: number };
  /** 期待される離職率低減効果 (ポイント, 0-10) */
  turnoverReductionEffect: number;
  /** 期待される採用力向上効果 (ポイント, 0-10) */
  recruitmentEffect: number;
  /** 期待される生産性向上効果 (ポイント, 0-10) */
  productivityEffect: number;
  /** 適用しやすい企業規模 */
  suitableSize: ("small" | "medium" | "large")[];
  /** 関連する業種コード (空配列なら全業種) */
  suitableIndustries: string[];
}

export const INTERVENTIONS: Intervention[] = [
  {
    id: "dx_rpa",
    category: "dx_automation",
    categoryLabel: "DX・自動化",
    title: "RPA導入による定型業務自動化",
    description: "経理処理、データ入力、レポート作成などの定型業務をRPAで自動化し、人手依存を削減します。",
    initialCost: { min: 100, max: 500 },
    monthlyCost: { min: 5, max: 30 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 2,
    recruitmentEffect: 1,
    productivityEffect: 8,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "dx_ai",
    category: "dx_automation",
    categoryLabel: "DX・自動化",
    title: "AI・チャットボット導入",
    description: "顧客対応やFAQ応答をAIチャットボットで自動化し、対人業務の負荷を軽減します。",
    initialCost: { min: 50, max: 300 },
    monthlyCost: { min: 3, max: 20 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 1,
    recruitmentEffect: 1,
    productivityEffect: 6,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: ["retail", "food_service", "healthcare", "it"],
  },
  {
    id: "dx_iot",
    category: "dx_automation",
    categoryLabel: "DX・自動化",
    title: "IoT・設備監視の自動化",
    description: "製造設備や施設のIoT監視を導入し、点検・巡回業務を自動化します。",
    initialCost: { min: 200, max: 1000 },
    monthlyCost: { min: 10, max: 50 },
    timeToEffect: { min: 6, max: 12 },
    turnoverReductionEffect: 1,
    recruitmentEffect: 0,
    productivityEffect: 7,
    suitableSize: ["medium", "large"],
    suitableIndustries: ["manufacturing", "construction"],
  },
  {
    id: "flex_remote",
    category: "flexible_employment",
    categoryLabel: "多様な雇用形態",
    title: "テレワーク・リモートワーク制度",
    description: "在宅勤務やハイブリッドワークを制度化し、柔軟な働き方を実現します。採用エリアの拡大にも寄与します。",
    initialCost: { min: 30, max: 100 },
    monthlyCost: { min: 2, max: 10 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 5,
    recruitmentEffect: 6,
    productivityEffect: 3,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: ["it", "office", "real_estate"],
  },
  {
    id: "flex_short_hours",
    category: "flexible_employment",
    categoryLabel: "多様な雇用形態",
    title: "短時間正社員・フレックスタイム制",
    description: "育児・介護との両立を支援する短時間正社員制度やフレックスタイム制を導入します。",
    initialCost: { min: 20, max: 50 },
    monthlyCost: { min: 0, max: 5 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 6,
    recruitmentEffect: 5,
    productivityEffect: 2,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "flex_side_job",
    category: "flexible_employment",
    categoryLabel: "多様な雇用形態",
    title: "副業・兼業許可制度",
    description: "副業・兼業を許可することで、社員の多様なキャリア形成を支援し、定着率を向上させます。",
    initialCost: { min: 10, max: 30 },
    monthlyCost: { min: 0, max: 0 },
    timeToEffect: { min: 1, max: 2 },
    turnoverReductionEffect: 3,
    recruitmentEffect: 4,
    productivityEffect: 1,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "wage_base_up",
    category: "wage_increase",
    categoryLabel: "賃上げ",
    title: "ベースアップ (定期昇給強化)",
    description: "基本給の底上げにより、給与水準の競争力を向上させます。業界平均との乖離を解消します。",
    initialCost: { min: 0, max: 0 },
    monthlyCost: { min: 50, max: 300 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 7,
    recruitmentEffect: 7,
    productivityEffect: 2,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "wage_incentive",
    category: "wage_increase",
    categoryLabel: "賃上げ",
    title: "成果連動型インセンティブ制度",
    description: "業績や個人成果に連動したボーナス・インセンティブ制度を導入し、モチベーションと定着を促進します。",
    initialCost: { min: 20, max: 50 },
    monthlyCost: { min: 20, max: 100 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 5,
    recruitmentEffect: 4,
    productivityEffect: 5,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "benefit_housing",
    category: "benefits",
    categoryLabel: "福利厚生",
    title: "住宅手当・社宅制度",
    description: "住宅手当の支給や社宅の提供により、実質的な可処分所得を向上させ、定着率を改善します。",
    initialCost: { min: 50, max: 200 },
    monthlyCost: { min: 30, max: 150 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 5,
    recruitmentEffect: 6,
    productivityEffect: 1,
    suitableSize: ["medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "benefit_health",
    category: "benefits",
    categoryLabel: "福利厚生",
    title: "健康経営・メンタルヘルス支援",
    description: "健康診断の充実、ストレスチェック、EAP (従業員支援プログラム) の導入により離職を予防します。",
    initialCost: { min: 20, max: 80 },
    monthlyCost: { min: 5, max: 20 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 4,
    recruitmentEffect: 3,
    productivityEffect: 3,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "recruit_referral",
    category: "recruitment_channels",
    categoryLabel: "採用チャネル多様化",
    title: "リファラル (社員紹介) 採用制度",
    description: "社員紹介による採用制度を整備し、インセンティブを設定します。定着率が高く、採用コストも低い傾向があります。",
    initialCost: { min: 10, max: 30 },
    monthlyCost: { min: 5, max: 20 },
    timeToEffect: { min: 1, max: 3 },
    turnoverReductionEffect: 3,
    recruitmentEffect: 7,
    productivityEffect: 1,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "recruit_sns",
    category: "recruitment_channels",
    categoryLabel: "採用チャネル多様化",
    title: "SNS・ダイレクトリクルーティング",
    description: "LinkedIn、X (Twitter)、InstagramなどのSNSを活用した採用広報と、ダイレクトスカウトを実施します。",
    initialCost: { min: 10, max: 50 },
    monthlyCost: { min: 5, max: 30 },
    timeToEffect: { min: 2, max: 6 },
    turnoverReductionEffect: 1,
    recruitmentEffect: 6,
    productivityEffect: 0,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "recruit_intern",
    category: "recruitment_channels",
    categoryLabel: "採用チャネル多様化",
    title: "インターンシップ制度",
    description: "大学生・高校生向けのインターンシップを実施し、早期接点を通じてミスマッチを防ぎ、応募者パイプラインを構築します。",
    initialCost: { min: 20, max: 80 },
    monthlyCost: { min: 5, max: 15 },
    timeToEffect: { min: 6, max: 12 },
    turnoverReductionEffect: 2,
    recruitmentEffect: 5,
    productivityEffect: 0,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "foreign_specified",
    category: "foreign_recruitment",
    categoryLabel: "外国人採用",
    title: "特定技能外国人の採用",
    description: "特定技能1号・2号制度を活用し、即戦力の外国人材を採用します。登録支援機関との連携が必要です。",
    initialCost: { min: 50, max: 200 },
    monthlyCost: { min: 3, max: 10 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 0,
    recruitmentEffect: 6,
    productivityEffect: 3,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: ["construction", "manufacturing", "food_service", "healthcare", "transport"],
  },
  {
    id: "foreign_engineer",
    category: "foreign_recruitment",
    categoryLabel: "外国人採用",
    title: "高度外国人材 (技術・人文知識) 採用",
    description: "技術・人文知識・国際業務の在留資格で高度外国人材を採用します。ITエンジニアや通訳など専門職向けです。",
    initialCost: { min: 80, max: 300 },
    monthlyCost: { min: 5, max: 15 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 0,
    recruitmentEffect: 5,
    productivityEffect: 4,
    suitableSize: ["medium", "large"],
    suitableIndustries: ["it", "manufacturing"],
  },
  {
    id: "reskill_digital",
    category: "reskilling",
    categoryLabel: "リスキリング",
    title: "デジタルスキル研修",
    description: "既存社員へのDXリテラシー教育、プログラミング研修、データ分析スキルの習得を支援します。",
    initialCost: { min: 30, max: 100 },
    monthlyCost: { min: 5, max: 20 },
    timeToEffect: { min: 3, max: 6 },
    turnoverReductionEffect: 3,
    recruitmentEffect: 2,
    productivityEffect: 6,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
  {
    id: "reskill_multi",
    category: "reskilling",
    categoryLabel: "リスキリング",
    title: "多能工化・クロストレーニング",
    description: "1人が複数業務をこなせるように計画的なジョブローテーションとOJTを実施し、属人性を低減します。",
    initialCost: { min: 10, max: 50 },
    monthlyCost: { min: 5, max: 15 },
    timeToEffect: { min: 3, max: 12 },
    turnoverReductionEffect: 2,
    recruitmentEffect: 1,
    productivityEffect: 5,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: ["manufacturing", "construction", "transport"],
  },
  {
    id: "reskill_certification",
    category: "reskilling",
    categoryLabel: "リスキリング",
    title: "資格取得支援制度",
    description: "業務に関連する資格の取得費用を補助し、合格時のインセンティブを支給します。スキルアップと定着の両方に寄与します。",
    initialCost: { min: 10, max: 30 },
    monthlyCost: { min: 5, max: 15 },
    timeToEffect: { min: 6, max: 12 },
    turnoverReductionEffect: 3,
    recruitmentEffect: 3,
    productivityEffect: 4,
    suitableSize: ["small", "medium", "large"],
    suitableIndustries: [],
  },
];

export function getInterventionsByCategory(category: InterventionCategory): Intervention[] {
  return INTERVENTIONS.filter((i) => i.category === category);
}

export function getInterventionsForIndustry(industryCode: string): Intervention[] {
  return INTERVENTIONS.filter(
    (i) => i.suitableIndustries.length === 0 || i.suitableIndustries.includes(industryCode)
  );
}

export function getInterventionsForSize(size: "small" | "medium" | "large"): Intervention[] {
  return INTERVENTIONS.filter((i) => i.suitableSize.includes(size));
}
