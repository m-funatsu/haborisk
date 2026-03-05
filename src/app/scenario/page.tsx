"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
  getSkills,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import {
  assessLaborRisk,
  simulateScenarios,
  prioritizeActions,
  calculateROI,
} from "@/lib/logic";
import { INTERVENTIONS, getIndustryAvgSalary } from "@/data/master-data";
import type {
  CompanyData,
  LaborRiskAssessment,
  ScenarioInput,
  ScenarioResult,
  PrioritizedAction,
  ROIResult,
} from "@/lib/logic";
import type { Intervention } from "@/data/master-data";
import type { Organization, Employee } from "@/types";

type TabId = "scenarios" | "priority" | "roi";

const TAB_LABELS: Record<TabId, string> = {
  scenarios: "シナリオ比較",
  priority: "優先順位",
  roi: "ROI分析",
};

function buildCompanyData(
  org: Organization,
  employees: Employee[],
  employeeSkills: { employeeId: string; skillId: string; proficiency: number; isPrimaryOwner: boolean }[],
  skills: { id: string; name: string; category: "technical" | "management" | "customer" | "compliance"; criticality: "critical" | "important" | "nice_to_have"; createdAt: string }[]
): CompanyData {
  return {
    organization: org,
    employees,
    employeeSkills,
    skills,
    monthlyHiringRate: 1,
    annualBudget: 500,
  };
}

const PRESET_SCENARIOS: ScenarioInput[] = [
  {
    name: "DX推進プラン",
    interventionIds: ["dx_rpa", "dx_ai", "reskill_digital"],
  },
  {
    name: "待遇改善プラン",
    interventionIds: ["wage_base_up", "benefit_housing", "benefit_health"],
  },
  {
    name: "採用強化プラン",
    interventionIds: ["recruit_referral", "recruit_sns", "recruit_intern"],
  },
  {
    name: "柔軟な働き方プラン",
    interventionIds: ["flex_remote", "flex_short_hours", "flex_side_job"],
  },
];

export default function ScenarioPage() {
  const [tab, setTab] = useState<TabId>("scenarios");
  const [org, setOrg] = useState<Organization | null>(null);
  const [assessment, setAssessment] = useState<LaborRiskAssessment | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [prioritizedActions, setPrioritizedActions] = useState<PrioritizedAction[]>([]);
  const [roiResults, setRoiResults] = useState<ROIResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [budget, setBudget] = useState(500);

  const loadData = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const orgData = getOrganization();
    const empData = getEmployees();
    const esData = getEmployeeSkills();
    const skillData = getSkills();
    setOrg(orgData);

    if (!orgData) {
      setLoading(false);
      return;
    }

    const companyData = buildCompanyData(orgData, empData, esData, skillData);
    const riskAssessment = assessLaborRisk(companyData);
    setAssessment(riskAssessment);

    const active = empData.filter((e: Employee) => !e.resignationDate);
    const industryCode = orgData.industryCode;

    // Calculate turnover rate
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const totalAtStart = empData.filter((e: Employee) => new Date(e.hireDate) <= oneYearAgo).length;
    const resignedInPeriod = empData.filter((e: Employee) => {
      if (!e.resignationDate) return false;
      const resignDate = new Date(e.resignationDate);
      return resignDate >= oneYearAgo && resignDate <= now;
    }).length;
    const turnoverRate = totalAtStart > 0 ? (resignedInPeriod / totalAtStart) * 100 : 5.0;

    // Run scenario simulations
    const results = simulateScenarios(
      active.length,
      turnoverRate,
      1,
      PRESET_SCENARIOS
    );
    setScenarioResults(results);

    // Run prioritization
    const companySize = active.length >= 100 ? "large" as const :
      active.length >= 30 ? "medium" as const : "small" as const;
    const actions = prioritizeActions(riskAssessment, industryCode, companySize, 500);
    setPrioritizedActions(actions);

    // Run ROI for top interventions
    const salaryData = getIndustryAvgSalary(industryCode);
    const avgSalary = salaryData?.avgSalary ?? 460;
    const roiCalcs: ROIResult[] = actions.slice(0, 8).map((action) => {
      const annualCostReduction = Math.round(
        avgSalary * (action.intervention.turnoverReductionEffect / 100) * active.length * 0.1
      );
      const annualProductivityGain = Math.round(
        avgSalary * (action.intervention.productivityEffect / 100) * active.length * 0.05
      );
      return calculateROI(action.intervention.id, annualCostReduction, annualProductivityGain);
    });
    setRoiResults(roiCalcs);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recalculatePriority = () => {
    if (!assessment || !org) return;
    const empData = getEmployees();
    const active = empData.filter((e: Employee) => !e.resignationDate);
    const companySize = active.length >= 100 ? "large" as const :
      active.length >= 30 ? "medium" as const : "small" as const;
    const actions = prioritizeActions(assessment, org.industryCode, companySize, budget);
    setPrioritizedActions(actions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">シミュレーション中...</div>
      </div>
    );
  }

  if (!org || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">組織データが登録されていません</div>
      </div>
    );
  }

  const toggleScenario = (index: number) => {
    const next = new Set(selectedScenarios);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedScenarios(next);
  };

  return (
    <div className="flex flex-col pb-4" data-testid="scenario-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">対策シミュレーション</h1>
        <p className="text-sm text-gray-500 mt-1">
          施策シナリオの比較・優先順位・ROI分析
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(TAB_LABELS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Comparison Tab */}
      {tab === "scenarios" ? (
        <div className="px-6">
          {/* Scenario toggle */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {PRESET_SCENARIOS.map((scenario, idx) => (
              <button
                key={scenario.name}
                onClick={() => toggleScenario(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedScenarios.has(idx)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>

          {/* Scenario cards */}
          <div className="flex flex-col gap-3">
            {scenarioResults
              .filter((_, i) => selectedScenarios.has(i))
              .map((result) => {
                const scenarioInterventions = result.interventionIds
                  .map((id) => INTERVENTIONS.find((i) => i.id === id))
                  .filter((i): i is Intervention => i !== undefined);

                return (
                  <div
                    key={result.name}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                  >
                    <h3 className="text-sm font-bold text-gray-900 mb-3">{result.name}</h3>

                    {/* Key metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {result.projectedHeadcount}名
                        </div>
                        <div className="text-[10px] text-blue-500">12ヶ月後人員</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-red-600">
                          {result.totalAnnualCost.toLocaleString()}万円
                        </div>
                        <div className="text-[10px] text-red-500">年間コスト</div>
                      </div>
                    </div>

                    {/* Effect bars */}
                    <div className="flex flex-col gap-2 mb-3">
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>離職率低減</span>
                          <span>{result.turnoverReduction}pt</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${Math.min(result.turnoverReduction * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>採用力向上</span>
                          <span>{result.recruitmentImprovement}pt</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${Math.min(result.recruitmentImprovement * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>生産性向上</span>
                          <span>{result.productivityImprovement}pt</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${Math.min(result.productivityImprovement * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Included interventions */}
                    <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400 mb-1">含まれる施策:</div>
                      {scenarioInterventions.map((intervention) => (
                        <div key={intervention.id} className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                            {intervention.categoryLabel}
                          </span>
                          <span className="text-xs text-gray-700">{intervention.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-3 text-[11px] text-gray-400">
                      <span>初期コスト: {result.totalInitialCost.toLocaleString()}万円</span>
                      <span>月額: {result.totalMonthlyCost.toLocaleString()}万円</span>
                      <span>効果発現: {result.timeToEffect}ヶ月</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}

      {/* Priority Tab */}
      {tab === "priority" ? (
        <div className="px-6">
          {/* Budget control */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              年間予算上限 (万円): {budget.toLocaleString()}
            </label>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>100万円</span>
              <span>3,000万円</span>
            </div>
            <button
              onClick={recalculatePriority}
              className="w-full mt-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              予算内で再計算
            </button>
          </div>

          {/* Prioritized actions */}
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            投資対効果順の推奨施策 ({prioritizedActions.length}件)
          </h2>
          <div className="flex flex-col gap-2">
            {prioritizedActions.map((action) => (
              <div
                key={action.intervention.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {action.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">
                      {action.intervention.title}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                      {action.intervention.categoryLabel}
                    </span>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {action.rationale}
                    </p>
                    <div className="flex gap-4 mt-2 text-[11px] text-gray-400">
                      <div>
                        ROIスコア: <span className="font-medium text-gray-600">{action.roiScore}</span>
                      </div>
                      <div>
                        コスト: {action.intervention.initialCost.min}〜{action.intervention.initialCost.max}万円
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1.5 text-[10px]">
                      <span className="text-green-600">離職改善: {action.intervention.turnoverReductionEffect}pt</span>
                      <span className="text-blue-600">採用力: {action.intervention.recruitmentEffect}pt</span>
                      <span className="text-purple-600">生産性: {action.intervention.productivityEffect}pt</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ROI Tab */}
      {tab === "roi" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">対策別ROI分析</h2>
          <div className="flex flex-col gap-3">
            {roiResults.map((roi) => {
              const isPositive = roi.roiPercent > 0;
              return (
                <div
                  key={roi.interventionId}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    {roi.interventionTitle}
                  </h3>

                  {/* ROI highlight */}
                  <div className={`rounded-xl p-3 text-center mb-3 ${isPositive ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
                    <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {roi.roiPercent > 0 ? "+" : ""}{roi.roiPercent}%
                    </div>
                    <div className={`text-[10px] ${isPositive ? "text-green-500" : "text-red-500"}`}>
                      投資利益率 (ROI)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-sm font-bold text-gray-900">
                        {roi.firstYearInvestment.toLocaleString()}万円
                      </div>
                      <div className="text-[10px] text-gray-500">初年度投資額</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className={`text-sm font-bold ${roi.annualNetBenefit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {roi.annualNetBenefit >= 0 ? "+" : ""}{roi.annualNetBenefit.toLocaleString()}万円
                      </div>
                      <div className="text-[10px] text-gray-500">年間純利益</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>見込みコスト削減額</span>
                      <span className="font-medium text-gray-700">{roi.annualCostReduction.toLocaleString()}万円/年</span>
                    </div>
                    <div className="flex justify-between">
                      <span>見込み生産性向上額</span>
                      <span className="font-medium text-gray-700">{roi.annualProductivityGain.toLocaleString()}万円/年</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span>投資回収期間</span>
                      <span className="font-bold text-gray-900">
                        {roi.paybackMonths >= 999 ? "回収困難" : `${roi.paybackMonths}ヶ月`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Context */}
      <section className="px-6 py-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-[10px] text-gray-400">分析対象</div>
          <div className="text-sm font-bold text-gray-900">{org.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            総合リスクスコア: {assessment.overallScore}点 / {org.industryName}
          </div>
        </div>
      </section>
    </div>
  );
}
