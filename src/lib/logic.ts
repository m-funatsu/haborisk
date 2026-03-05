/**
 * logic.ts
 * 人手不足リスク分析エンジン
 *
 * assessLaborRisk() を起点に、5軸リスクスコア算出、人員推移予測、
 * 離職コスト算出、スキルギャップ分析、給与ベンチマーク、
 * シナリオ比較、対策優先順位、ROI算出、総合アドバイザリーを提供します。
 */

import {
  JOB_OPENING_RATIOS,
  NATIONAL_AVG_RATIO,
  TURNOVER_BENCHMARKS,
  AGE_TURNOVER_MULTIPLIER,
  RECRUITMENT_COSTS,
  ATTRITION_COST_MULTIPLIER,
  INDUSTRY_AVG_SALARIES,
  LABOR_FORCE_PROJECTIONS,
  INTERVENTIONS,
  getJobOpeningRatio,
  getTurnoverBenchmark,
  getIndustryAvgSalary,
  getMinimumWage,
  getInterventionsForIndustry,
  getInterventionsForSize,
  type Intervention,
} from "@/data/master-data";

import type { Employee, Organization, EmployeeSkill, Skill } from "@/types";

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

const CURRENT_YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** 企業データ入力 (assessLaborRisk の引数) */
export interface CompanyData {
  organization: Organization;
  employees: Employee[];
  employeeSkills: EmployeeSkill[];
  skills: Skill[];
  /** 月額の平均採用人数 (任意) */
  monthlyHiringRate?: number;
  /** 年間予算上限 (万円, 任意) */
  annualBudget?: number;
}

/** 5軸リスクスコア */
export interface LaborRiskScores {
  /** 採用難度 (0-100) */
  recruitmentDifficulty: number;
  /** 離職リスク (0-100) */
  attritionRisk: number;
  /** 高齢化リスク (0-100) */
  agingRisk: number;
  /** スキルギャップ (0-100) */
  skillGapRisk: number;
  /** コスト圧力 (0-100) */
  costPressure: number;
}

export interface LaborRiskAssessment {
  scores: LaborRiskScores;
  /** 加重平均の総合スコア (0-100) */
  overallScore: number;
  /** 各軸の詳細説明 */
  details: Record<keyof LaborRiskScores, string>;
}

/** 月別人員予測ポイント */
export interface HeadcountPoint {
  month: number;
  label: string;
  projected: number;
  hires: number;
  departures: number;
  net: number;
}

/** 離職コスト内訳 */
export interface AttritionCostBreakdown {
  /** 直接採用コスト (万円) */
  recruitmentCost: number;
  /** 生産性損失コスト (万円) */
  productivityLoss: number;
  /** 研修・育成コスト (万円) */
  trainingCost: number;
  /** 合計 (万円) */
  totalCost: number;
  /** 1人あたり平均 (万円) */
  perPersonCost: number;
}

/** スキルギャップ項目 */
export interface SkillGapItem {
  skillName: string;
  skillCategory: string;
  /** 現在の充足人数 */
  currentCoverage: number;
  /** 必要人数 (推定) */
  requiredCoverage: number;
  /** ギャップ (正=不足, 負=余剰) */
  gap: number;
  /** 重要度 */
  criticality: "critical" | "important" | "nice_to_have";
  /** リスクレベル (0-100) */
  riskScore: number;
}

/** 給与ベンチマーク結果 */
export interface SalaryBenchmarkResult {
  position: string;
  currentSalary: number;
  industryAvg: number;
  /** 乖離率 (%) マイナス=業界平均より低い */
  deviation: number;
  /** 最低賃金ベースの年収換算 */
  minimumWageAnnual: number;
  recommendation: string;
}

/** シナリオ比較結果 */
export interface ScenarioResult {
  name: string;
  interventionIds: string[];
  /** 初期コスト合計 (万円) */
  totalInitialCost: number;
  /** 月額コスト合計 (万円) */
  totalMonthlyCost: number;
  /** 年間コスト合計 (万円) */
  totalAnnualCost: number;
  /** 12ヶ月後の予測人員 */
  projectedHeadcount: number;
  /** 予想離職率低減 (ポイント) */
  turnoverReduction: number;
  /** 予想採用力向上 (ポイント) */
  recruitmentImprovement: number;
  /** 予想生産性向上 (ポイント) */
  productivityImprovement: number;
  /** 対策効果が出るまでの期間 (月) */
  timeToEffect: number;
}

/** 対策優先順位 */
export interface PrioritizedAction {
  intervention: Intervention;
  /** 投資対効果スコア (高い=優先) */
  roiScore: number;
  /** 推奨理由 */
  rationale: string;
  /** 優先度ランク (1が最優先) */
  rank: number;
}

/** ROI算出結果 */
export interface ROIResult {
  interventionId: string;
  interventionTitle: string;
  /** 初年度投資額 (万円) */
  firstYearInvestment: number;
  /** 見込みコスト削減額 (万円/年) */
  annualCostReduction: number;
  /** 見込み生産性向上額 (万円/年) */
  annualProductivityGain: number;
  /** 年間純利益 (万円) */
  annualNetBenefit: number;
  /** ROI (%) */
  roiPercent: number;
  /** 回収期間 (月) */
  paybackMonths: number;
}

/** 総合リスクグレード */
export type RiskGrade = "S" | "A" | "B" | "C" | "D";

/** 総合アドバイザリー */
export interface Advisory {
  /** 総合リスクグレード */
  grade: RiskGrade;
  /** グレード説明 */
  gradeDescription: string;
  /** ヘッドライン: 「現在のペースだと○ヶ月後に○人不足」 */
  headline: string;
  /** 最もリスクの高い部門 */
  highestRiskDepartment: { name: string; score: number } | null;
  /** 最もリスクの高い職種 */
  highestRiskPosition: { name: string; reason: string } | null;
  /** コスト影響額 (年間○○万円の損失リスク) */
  annualCostImpact: number;
  /** 業界平均との比較 */
  industryComparison: {
    avgTurnover: number;
    companyTurnover: number;
    avgAge: number;
    companyAvgAge: number;
    jobOpeningRatio: number;
  };
  /** 優先度付き対策ロードマップ */
  roadmap: PrioritizedAction[];
  /** サマリーテキスト (経営者向け) */
  summary: string;
}

// ---------------------------------------------------------------------------
// 1. assessLaborRisk - 5軸リスクスコア算出
// ---------------------------------------------------------------------------

export function assessLaborRisk(data: CompanyData): LaborRiskAssessment {
  const { organization, employees, employeeSkills, skills } = data;
  const active = employees.filter((e) => !e.resignationDate);
  const industryCode = organization.industryCode;

  // -- 採用難度 --
  const jobRatio = getJobOpeningRatio(industryCode);
  const ratio = jobRatio?.ratio ?? NATIONAL_AVG_RATIO;
  // 求人倍率が高いほど採用が困難: 1.0以下=安全, 5.0以上=極めて困難
  const recruitmentDifficulty = clamp(Math.round(((ratio - 0.5) / 5.0) * 100), 0, 100);

  // -- 離職リスク --
  const turnoverBench = getTurnoverBenchmark(industryCode);
  const companyTurnoverRate = calculateCompanyTurnoverRate(employees);
  const industryAvgTurnover = turnoverBench?.avgTurnoverRate ?? 15.0;
  // 自社離職率が業界平均を超えるほど高リスク
  const turnoverExcess = companyTurnoverRate - industryAvgTurnover;
  const youngRatio = active.length > 0
    ? active.filter((e) => CURRENT_YEAR - e.birthYear < 30).length / active.length
    : 0;
  // 若手比率が高いと離職リスク加算
  const attritionRisk = clamp(
    Math.round(
      50 + (turnoverExcess / industryAvgTurnover) * 30 + youngRatio * 20
    ),
    0,
    100
  );

  // -- 高齢化リスク --
  const ages = active.map((e) => CURRENT_YEAR - e.birthYear);
  const avgAge = mean(ages);
  const over55Pct = active.length > 0
    ? (ages.filter((a) => a >= 55).length / active.length) * 100
    : 0;
  const over60Pct = active.length > 0
    ? (ages.filter((a) => a >= 60).length / active.length) * 100
    : 0;
  const agingRisk = clamp(
    Math.round(over55Pct * 0.8 + over60Pct * 0.6 + Math.max(avgAge - 42, 0) * 2),
    0,
    100
  );

  // -- スキルギャップ --
  const criticalSkills = skills.filter((s) => s.criticality === "critical");
  const activeIds = new Set(active.map((e) => e.id));
  const activeSkillLinks = employeeSkills.filter((es) => activeIds.has(es.employeeId));

  let singleOwnerCritical = 0;
  let totalCritical = criticalSkills.length;
  for (const skill of criticalSkills) {
    const owners = activeSkillLinks.filter(
      (es) => es.skillId === skill.id && es.proficiency >= 3
    );
    if (owners.length <= 1) singleOwnerCritical++;
  }
  const skillGapRisk = totalCritical > 0
    ? clamp(Math.round((singleOwnerCritical / totalCritical) * 100), 0, 100)
    : 30; // スキルデータなしの場合はデフォルトの中リスク

  // -- コスト圧力 --
  const salaryData = getIndustryAvgSalary(industryCode);
  const avgSalary = salaryData?.avgSalary ?? 460;
  const minWage = getMinimumWage(organization.prefecture);
  // 最低賃金の年収換算 (2080時間) との距離
  const minWageAnnual = Math.round((minWage * 2080) / 10000);
  const salaryPressure = clamp(
    Math.round(((minWageAnnual / avgSalary) * 60) + (ratio > 2.0 ? 20 : 0)),
    0,
    100
  );
  const costPressure = clamp(
    Math.round(salaryPressure * 0.6 + recruitmentDifficulty * 0.4),
    0,
    100
  );

  const scores: LaborRiskScores = {
    recruitmentDifficulty,
    attritionRisk,
    agingRisk,
    skillGapRisk,
    costPressure,
  };

  const weights = {
    recruitmentDifficulty: 0.25,
    attritionRisk: 0.25,
    agingRisk: 0.20,
    skillGapRisk: 0.15,
    costPressure: 0.15,
  };

  const overallScore = clamp(
    Math.round(
      scores.recruitmentDifficulty * weights.recruitmentDifficulty +
      scores.attritionRisk * weights.attritionRisk +
      scores.agingRisk * weights.agingRisk +
      scores.skillGapRisk * weights.skillGapRisk +
      scores.costPressure * weights.costPressure
    ),
    0,
    100
  );

  const details: Record<keyof LaborRiskScores, string> = {
    recruitmentDifficulty: `業種の有効求人倍率は${ratio.toFixed(1)}倍（全国平均${NATIONAL_AVG_RATIO}倍）。${ratio >= 3.0 ? "極めて採用が困難な状況です。" : ratio >= 2.0 ? "採用競争が激しい状況です。" : "比較的安定しています。"}`,
    attritionRisk: `自社離職率は${companyTurnoverRate.toFixed(1)}%（業界平均${industryAvgTurnover.toFixed(1)}%）。${companyTurnoverRate > industryAvgTurnover ? "業界平均を上回っており、対策が必要です。" : "業界平均を下回っています。"}`,
    agingRisk: `従業員の平均年齢${avgAge.toFixed(1)}歳、55歳以上の割合${over55Pct.toFixed(1)}%。${over55Pct > 30 ? "高齢化が深刻で、早期の若手採用と知識移転が急務です。" : over55Pct > 15 ? "中程度の高齢化が進行中です。" : "年齢構成は比較的バランスが取れています。"}`,
    skillGapRisk: `重要スキル${totalCritical}件のうち${singleOwnerCritical}件が担当者1名以下。${singleOwnerCritical > 0 ? "属人化が進んでおり、クロストレーニングが必要です。" : "スキルの分散は良好です。"}`,
    costPressure: `業界平均年収${avgSalary}万円、最低賃金ベース年収${minWageAnnual}万円。${costPressure >= 60 ? "人件費の上昇圧力が高く、収益を圧迫するリスクがあります。" : "現時点ではコスト圧力は管理可能な水準です。"}`,
  };

  return { scores, overallScore, details };
}

// ---------------------------------------------------------------------------
// 2. forecastHeadcount - 12ヶ月人員推移予測
// ---------------------------------------------------------------------------

export function forecastHeadcount(
  currentHeadcount: number,
  annualAttritionRate: number,
  monthlyHiringRate: number,
  months: number = 12
): HeadcountPoint[] {
  const monthlyAttritionRate = annualAttritionRate / 100 / 12;
  const points: HeadcountPoint[] = [];
  let projected = currentHeadcount;

  for (let m = 0; m <= months; m++) {
    const departures = m === 0 ? 0 : Math.round(projected * monthlyAttritionRate);
    const hires = m === 0 ? 0 : monthlyHiringRate;
    const net = hires - departures;

    if (m > 0) {
      projected = Math.max(projected + net, 0);
    }

    points.push({
      month: m,
      label: m === 0 ? "現在" : `${m}ヶ月後`,
      projected: Math.round(projected),
      hires,
      departures,
      net,
    });
  }

  return points;
}

// ---------------------------------------------------------------------------
// 3. calculateAttritionCost - 離職コスト算出
// ---------------------------------------------------------------------------

export function calculateAttritionCost(
  departures: number,
  avgSalaryManYen: number,
  replacementTimeMonths: number = 3,
  keyPersonCount: number = 0
): AttritionCostBreakdown {
  const midCareerCost = RECRUITMENT_COSTS.find((r) => r.type === "mid_career");
  const perPersonRecruitment = midCareerCost?.costPerHire ?? 84;

  const regularDepartures = departures - keyPersonCount;
  const avgMultiplier = (ATTRITION_COST_MULTIPLIER.staffMin + ATTRITION_COST_MULTIPLIER.staffMax) / 2;
  const keyMultiplier = ATTRITION_COST_MULTIPLIER.keyPerson;

  const recruitmentCost = departures * perPersonRecruitment;
  const productivityLoss = Math.round(
    (regularDepartures * avgSalaryManYen * avgMultiplier * (replacementTimeMonths / 12)) +
    (keyPersonCount * avgSalaryManYen * keyMultiplier * (replacementTimeMonths / 12))
  );
  const trainingCost = Math.round(departures * avgSalaryManYen * 0.15);
  const totalCost = recruitmentCost + productivityLoss + trainingCost;
  const perPersonCost = departures > 0 ? Math.round(totalCost / departures) : 0;

  return {
    recruitmentCost,
    productivityLoss,
    trainingCost,
    totalCost,
    perPersonCost,
  };
}

// ---------------------------------------------------------------------------
// 4. assessSkillGap - スキルギャップ分析
// ---------------------------------------------------------------------------

export function assessSkillGap(
  skills: Skill[],
  employeeSkills: EmployeeSkill[],
  activeEmployeeIds: Set<string>
): SkillGapItem[] {
  const activeLinks = employeeSkills.filter((es) => activeEmployeeIds.has(es.employeeId));
  const results: SkillGapItem[] = [];

  for (const skill of skills) {
    const owners = activeLinks.filter((es) => es.skillId === skill.id);
    const proficientOwners = owners.filter((es) => es.proficiency >= 3);

    // 必要人数は重要度に応じて設定
    const requiredCoverage =
      skill.criticality === "critical" ? 3 :
      skill.criticality === "important" ? 2 : 1;

    const currentCoverage = proficientOwners.length;
    const gap = requiredCoverage - currentCoverage;

    // リスクスコア: 重要スキルで担当者不足ほど高い
    const criticalityWeight =
      skill.criticality === "critical" ? 1.0 :
      skill.criticality === "important" ? 0.6 : 0.3;

    const coverageRatio = requiredCoverage > 0
      ? Math.max(1 - currentCoverage / requiredCoverage, 0)
      : 0;

    const riskScore = clamp(Math.round(coverageRatio * criticalityWeight * 100), 0, 100);

    results.push({
      skillName: skill.name,
      skillCategory: skill.category,
      currentCoverage,
      requiredCoverage,
      gap: Math.max(gap, 0),
      criticality: skill.criticality,
      riskScore,
    });
  }

  return results.sort((a, b) => b.riskScore - a.riskScore);
}

// ---------------------------------------------------------------------------
// 5. benchmarkSalary - 給与水準ベンチマーク
// ---------------------------------------------------------------------------

export interface PositionSalary {
  position: string;
  currentAnnualSalary: number; // 万円
}

export function benchmarkSalary(
  positions: PositionSalary[],
  industryCode: string,
  region: string
): SalaryBenchmarkResult[] {
  const industryData = getIndustryAvgSalary(industryCode);
  const avgSalary = industryData?.avgSalary ?? 460;
  const managerSalary = industryData?.managerSalary ?? 650;
  const minWage = getMinimumWage(region);
  const minimumWageAnnual = Math.round((minWage * 2080) / 10000);

  const managerKeywords = ["部長", "課長", "マネージャー", "リーダー", "GM", "取締役"];

  return positions.map((p) => {
    const isManager = managerKeywords.some((k) => p.position.includes(k));
    const benchmark = isManager ? managerSalary : avgSalary;
    const deviation = ((p.currentAnnualSalary - benchmark) / benchmark) * 100;

    let recommendation: string;
    if (deviation < -20) {
      recommendation = `業界平均を大幅に下回っています（${Math.abs(deviation).toFixed(1)}%低）。採用競争力と定着率に深刻な影響があります。早急な見直しを推奨します。`;
    } else if (deviation < -10) {
      recommendation = `業界平均をやや下回っています（${Math.abs(deviation).toFixed(1)}%低）。段階的な引き上げを検討してください。`;
    } else if (deviation < 10) {
      recommendation = `業界平均水準です。現状維持で問題ありません。`;
    } else {
      recommendation = `業界平均を上回っています（${deviation.toFixed(1)}%高）。人材獲得で優位性があります。`;
    }

    return {
      position: p.position,
      currentSalary: p.currentAnnualSalary,
      industryAvg: benchmark,
      deviation: Math.round(deviation * 10) / 10,
      minimumWageAnnual,
      recommendation,
    };
  });
}

// ---------------------------------------------------------------------------
// 6. simulateScenarios - 対策シナリオ比較
// ---------------------------------------------------------------------------

export interface ScenarioInput {
  name: string;
  interventionIds: string[];
}

export function simulateScenarios(
  baseHeadcount: number,
  baseAttritionRate: number,
  baseHiringRate: number,
  scenarios: ScenarioInput[]
): ScenarioResult[] {
  return scenarios.map((scenario) => {
    const interventions = scenario.interventionIds
      .map((id) => INTERVENTIONS.find((i) => i.id === id))
      .filter((i): i is Intervention => i !== undefined);

    const totalInitialCost = interventions.reduce(
      (sum, i) => sum + (i.initialCost.min + i.initialCost.max) / 2,
      0
    );
    const totalMonthlyCost = interventions.reduce(
      (sum, i) => sum + (i.monthlyCost.min + i.monthlyCost.max) / 2,
      0
    );
    const totalAnnualCost = Math.round(totalInitialCost + totalMonthlyCost * 12);

    // 離職率低減の複合効果 (逓減あり: 効果は累積するが上限あり)
    const turnoverReduction = clamp(
      interventions.reduce((sum, i) => sum + i.turnoverReductionEffect, 0) * 0.7,
      0,
      baseAttritionRate * 0.5 // 最大50%改善
    );
    const recruitmentImprovement = clamp(
      interventions.reduce((sum, i) => sum + i.recruitmentEffect, 0) * 0.7,
      0,
      30
    );
    const productivityImprovement = clamp(
      interventions.reduce((sum, i) => sum + i.productivityEffect, 0) * 0.7,
      0,
      40
    );

    const adjustedAttritionRate = Math.max(baseAttritionRate - turnoverReduction, 1);
    const adjustedHiringRate = baseHiringRate * (1 + recruitmentImprovement / 100);

    const forecast = forecastHeadcount(baseHeadcount, adjustedAttritionRate, adjustedHiringRate, 12);
    const projectedHeadcount = forecast[forecast.length - 1]?.projected ?? baseHeadcount;

    const maxTimeToEffect = interventions.length > 0
      ? Math.max(...interventions.map((i) => (i.timeToEffect.min + i.timeToEffect.max) / 2))
      : 0;

    return {
      name: scenario.name,
      interventionIds: scenario.interventionIds,
      totalInitialCost: Math.round(totalInitialCost),
      totalMonthlyCost: Math.round(totalMonthlyCost),
      totalAnnualCost,
      projectedHeadcount,
      turnoverReduction: Math.round(turnoverReduction * 10) / 10,
      recruitmentImprovement: Math.round(recruitmentImprovement * 10) / 10,
      productivityImprovement: Math.round(productivityImprovement * 10) / 10,
      timeToEffect: Math.round(maxTimeToEffect),
    };
  });
}

// ---------------------------------------------------------------------------
// 7. prioritizeActions - 投資対効果順の対策優先順位
// ---------------------------------------------------------------------------

export function prioritizeActions(
  riskAssessment: LaborRiskAssessment,
  industryCode: string,
  companySize: "small" | "medium" | "large",
  budgetManYen?: number
): PrioritizedAction[] {
  const scores = riskAssessment.scores;

  // 業種・規模に合った対策を取得
  const industryInterventions = getInterventionsForIndustry(industryCode);
  const sizeInterventions = getInterventionsForSize(companySize);
  const candidateIds = new Set(sizeInterventions.map((i) => i.id));
  const candidates = industryInterventions.filter((i) => candidateIds.has(i.id));

  // 各対策にROIスコアを付与
  const scored = candidates.map((intervention) => {
    const avgCost = (intervention.initialCost.min + intervention.initialCost.max) / 2 +
      ((intervention.monthlyCost.min + intervention.monthlyCost.max) / 2) * 12;
    const costFactor = avgCost > 0 ? 1 / Math.log2(avgCost + 1) : 1;

    // リスクスコアとの関連度で効果を加重
    const relevance =
      (intervention.turnoverReductionEffect * (scores.attritionRisk / 100)) +
      (intervention.recruitmentEffect * (scores.recruitmentDifficulty / 100)) +
      (intervention.productivityEffect * (scores.skillGapRisk / 100));

    const speedFactor = 1 / ((intervention.timeToEffect.min + intervention.timeToEffect.max) / 2);

    const roiScore = Math.round((relevance * costFactor * speedFactor) * 1000) / 10;

    // 推奨理由を生成
    let rationale = "";
    if (scores.attritionRisk >= 60 && intervention.turnoverReductionEffect >= 5) {
      rationale = `離職リスクが高い(${scores.attritionRisk}点)ため、離職率改善に直結する施策です。`;
    } else if (scores.recruitmentDifficulty >= 60 && intervention.recruitmentEffect >= 5) {
      rationale = `採用難度が高い(${scores.recruitmentDifficulty}点)ため、採用力向上に効果的です。`;
    } else if (scores.skillGapRisk >= 60 && intervention.productivityEffect >= 5) {
      rationale = `スキルギャップリスクが高い(${scores.skillGapRisk}点)ため、生産性改善に寄与します。`;
    } else if (scores.costPressure >= 60) {
      rationale = `コスト圧力が高い(${scores.costPressure}点)中、費用対効果の高い施策です。`;
    } else {
      rationale = `総合的なリスク低減に寄与し、投資効率の良い施策です。`;
    }

    return { intervention, roiScore, rationale, rank: 0 };
  });

  // ROIスコア順にソートしてランク付与
  scored.sort((a, b) => b.roiScore - a.roiScore);
  scored.forEach((item, idx) => { item.rank = idx + 1; });

  // 予算制約がある場合、累計コストでフィルタ
  if (budgetManYen !== undefined) {
    let cumulative = 0;
    const filtered: PrioritizedAction[] = [];
    for (const item of scored) {
      const cost = (item.intervention.initialCost.min + item.intervention.initialCost.max) / 2 +
        ((item.intervention.monthlyCost.min + item.intervention.monthlyCost.max) / 2) * 12;
      if (cumulative + cost <= budgetManYen) {
        cumulative += cost;
        filtered.push(item);
      }
    }
    return filtered;
  }

  return scored;
}

// ---------------------------------------------------------------------------
// 8. calculateROI - 対策ROI算出
// ---------------------------------------------------------------------------

export function calculateROI(
  interventionId: string,
  annualCostReductionManYen: number,
  annualProductivityGainManYen: number
): ROIResult {
  const intervention = INTERVENTIONS.find((i) => i.id === interventionId);
  if (!intervention) {
    return {
      interventionId,
      interventionTitle: "不明",
      firstYearInvestment: 0,
      annualCostReduction: annualCostReductionManYen,
      annualProductivityGain: annualProductivityGainManYen,
      annualNetBenefit: annualCostReductionManYen + annualProductivityGainManYen,
      roiPercent: 0,
      paybackMonths: 0,
    };
  }

  const initialCost = (intervention.initialCost.min + intervention.initialCost.max) / 2;
  const monthlyCost = (intervention.monthlyCost.min + intervention.monthlyCost.max) / 2;
  const firstYearInvestment = Math.round(initialCost + monthlyCost * 12);

  const annualBenefit = annualCostReductionManYen + annualProductivityGainManYen;
  const annualNetBenefit = annualBenefit - monthlyCost * 12;
  const roiPercent = firstYearInvestment > 0
    ? Math.round((annualNetBenefit / firstYearInvestment) * 100)
    : 0;

  const monthlyBenefit = annualBenefit / 12;
  const paybackMonths = monthlyBenefit > monthlyCost
    ? Math.ceil(initialCost / (monthlyBenefit - monthlyCost))
    : 999;

  return {
    interventionId,
    interventionTitle: intervention.title,
    firstYearInvestment,
    annualCostReduction: annualCostReductionManYen,
    annualProductivityGain: annualProductivityGainManYen,
    annualNetBenefit: Math.round(annualNetBenefit),
    roiPercent,
    paybackMonths: Math.min(paybackMonths, 999),
  };
}

// ---------------------------------------------------------------------------
// 9. generateAdvisory - "So What?" 総合アドバイザリー
// ---------------------------------------------------------------------------

export function generateAdvisory(data: CompanyData): Advisory {
  const { organization, employees, employeeSkills, skills } = data;
  const active = employees.filter((e) => !e.resignationDate);
  const industryCode = organization.industryCode;

  // リスク評価
  const assessment = assessLaborRisk(data);
  const { scores, overallScore } = assessment;

  // グレード判定
  const grade = scoreToGrade(overallScore);
  const gradeDescriptions: Record<RiskGrade, string> = {
    S: "極めて深刻 - 事業継続に関わるリスク水準です。即座に対策を開始してください。",
    A: "深刻 - 複数の領域で高リスク状態です。3ヶ月以内に主要施策を着手してください。",
    B: "要注意 - リスクが顕在化しつつあります。半年以内に計画的な対策を講じてください。",
    C: "軽度 - 現時点では大きな問題はありませんが、予防的な取り組みを推奨します。",
    D: "安全 - リスクは低い水準です。現状の取り組みを維持してください。",
  };

  // 人員予測
  const companyTurnoverRate = calculateCompanyTurnoverRate(employees);
  const monthlyHiring = data.monthlyHiringRate ?? 0;
  const forecast = forecastHeadcount(active.length, companyTurnoverRate, monthlyHiring, 12);
  const shortageMonth = forecast.find((p) => p.projected < active.length * 0.9);
  const finalShortage = active.length - (forecast[forecast.length - 1]?.projected ?? active.length);

  const headline = shortageMonth
    ? `現在のペースだと${shortageMonth.month}ヶ月後に${Math.abs(shortageMonth.projected - active.length)}人不足が発生します。12ヶ月後には${finalShortage}人不足の見込みです。`
    : `現在のペースだと12ヶ月後に${finalShortage}人の不足が見込まれます。`;

  // 部門別リスク
  const departments = [...new Set(active.map((e) => e.department))];
  let highestRiskDept: { name: string; score: number } | null = null;

  for (const dept of departments) {
    const deptEmployees = active.filter((e) => e.department === dept);
    const deptAges = deptEmployees.map((e) => CURRENT_YEAR - e.birthYear);
    const over55 = deptAges.filter((a) => a >= 55).length;
    const deptScore = clamp(
      Math.round((over55 / Math.max(deptEmployees.length, 1)) * 60 +
        (deptEmployees.filter((e) => e.isKeyPerson).length / Math.max(deptEmployees.length, 1)) * 40),
      0,
      100
    );
    if (!highestRiskDept || deptScore > highestRiskDept.score) {
      highestRiskDept = { name: dept, score: deptScore };
    }
  }

  // 最もリスクの高い職種
  const positionGroups = new Map<string, Employee[]>();
  for (const e of active) {
    const group = positionGroups.get(e.position) ?? [];
    group.push(e);
    positionGroups.set(e.position, group);
  }
  let highestRiskPosition: { name: string; reason: string } | null = null;
  let maxPositionRisk = 0;
  for (const [position, emps] of positionGroups) {
    const avgAge = mean(emps.map((e) => CURRENT_YEAR - e.birthYear));
    const keyCount = emps.filter((e) => e.isKeyPerson).length;
    const risk = avgAge * 0.5 + (keyCount / Math.max(emps.length, 1)) * 50 + (emps.length === 1 ? 20 : 0);
    if (risk > maxPositionRisk) {
      maxPositionRisk = risk;
      const reasons: string[] = [];
      if (avgAge > 55) reasons.push(`平均年齢${avgAge.toFixed(0)}歳`);
      if (emps.length === 1) reasons.push("担当者1名のみ");
      if (keyCount > 0) reasons.push(`キーパーソン${keyCount}名在籍`);
      highestRiskPosition = {
        name: position,
        reason: reasons.length > 0 ? reasons.join("、") : "総合的なリスクが高い",
      };
    }
  }

  // コスト影響額
  const salaryData = getIndustryAvgSalary(industryCode);
  const avgSalary = salaryData?.avgSalary ?? 460;
  const estimatedAnnualDepartures = Math.round(active.length * (companyTurnoverRate / 100));
  const keyPersonDepartures = Math.round(estimatedAnnualDepartures * 0.2);
  const costResult = calculateAttritionCost(
    estimatedAnnualDepartures,
    avgSalary,
    3,
    keyPersonDepartures
  );
  const annualCostImpact = costResult.totalCost;

  // 業界比較
  const turnoverBench = getTurnoverBenchmark(industryCode);
  const jobRatio = getJobOpeningRatio(industryCode);
  const ages = active.map((e) => CURRENT_YEAR - e.birthYear);
  const industryComparison = {
    avgTurnover: turnoverBench?.avgTurnoverRate ?? 15.0,
    companyTurnover: companyTurnoverRate,
    avgAge: 42,
    companyAvgAge: mean(ages),
    jobOpeningRatio: jobRatio?.ratio ?? NATIONAL_AVG_RATIO,
  };

  // 対策ロードマップ
  const companySize = active.length >= 100 ? "large" as const :
    active.length >= 30 ? "medium" as const : "small" as const;
  const roadmap = prioritizeActions(
    assessment,
    industryCode,
    companySize,
    data.annualBudget
  ).slice(0, 5);

  // サマリー
  const summary = buildSummaryText(
    grade,
    headline,
    highestRiskDept,
    annualCostImpact,
    roadmap,
    industryComparison
  );

  return {
    grade,
    gradeDescription: gradeDescriptions[grade],
    headline,
    highestRiskDepartment: highestRiskDept,
    highestRiskPosition,
    annualCostImpact,
    industryComparison,
    roadmap,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function calculateCompanyTurnoverRate(employees: Employee[]): number {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const totalAtStart = employees.filter((e) => {
    const hireDate = new Date(e.hireDate);
    return hireDate <= oneYearAgo;
  }).length;

  if (totalAtStart === 0) return 5.0; // デフォルト

  const resignedInPeriod = employees.filter((e) => {
    if (!e.resignationDate) return false;
    const resignDate = new Date(e.resignationDate);
    return resignDate >= oneYearAgo && resignDate <= now;
  }).length;

  return (resignedInPeriod / totalAtStart) * 100;
}

function scoreToGrade(score: number): RiskGrade {
  if (score >= 80) return "S";
  if (score >= 60) return "A";
  if (score >= 40) return "B";
  if (score >= 20) return "C";
  return "D";
}

function buildSummaryText(
  grade: RiskGrade,
  headline: string,
  highestRiskDept: { name: string; score: number } | null,
  annualCostImpact: number,
  roadmap: PrioritizedAction[],
  industryComparison: Advisory["industryComparison"]
): string {
  const lines: string[] = [];

  lines.push(`【総合リスクグレード: ${grade}】`);
  lines.push(headline);
  lines.push("");

  if (highestRiskDept) {
    lines.push(`最もリスクの高い部門: ${highestRiskDept.name}（リスクスコア${highestRiskDept.score}点）`);
  }

  lines.push(`年間の離職関連コスト影響: 約${annualCostImpact}万円`);
  lines.push("");

  // 業界比較
  lines.push("【業界平均との比較】");
  lines.push(`・離職率: 自社${industryComparison.companyTurnover.toFixed(1)}% vs 業界平均${industryComparison.avgTurnover.toFixed(1)}%`);
  lines.push(`・平均年齢: 自社${industryComparison.companyAvgAge.toFixed(1)}歳 vs 全国平均42歳`);
  lines.push(`・有効求人倍率: ${industryComparison.jobOpeningRatio.toFixed(1)}倍`);
  lines.push("");

  if (roadmap.length > 0) {
    lines.push("【推奨対策トップ3】");
    for (const action of roadmap.slice(0, 3)) {
      lines.push(`${action.rank}. ${action.intervention.title}`);
      lines.push(`   ${action.rationale}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export type { Intervention } from "@/data/master-data";

export {
  LABOR_FORCE_PROJECTIONS,
  INTERVENTIONS,
  RECRUITMENT_COSTS,
  JOB_OPENING_RATIOS,
  TURNOVER_BENCHMARKS,
} from "@/data/master-data";

export type { LaborForceProjection } from "@/data/master-data";
