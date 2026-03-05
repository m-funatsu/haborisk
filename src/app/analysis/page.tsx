"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DynamicRiskRadarChart,
  DynamicForecastChart,
} from "@/components/charts";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
  getSkills,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import { assessRisk, getRiskColor, DIMENSION_LABELS } from "@/lib/risk";
import { generateWorkforceForecast } from "@/lib/forecast";
import { INDUSTRY_BENCHMARKS } from "@/data/benchmarks";
import type { Employee, RiskAssessment, Organization, Skill, EmployeeSkill } from "@/types";
import type { ForecastPoint } from "@/lib/forecast";

type AnalysisTab = "keyperson" | "forecast" | "benchmark";

const TAB_LABELS: Record<AnalysisTab, string> = {
  keyperson: "キーパーソン",
  forecast: "人員予測",
  benchmark: "業界比較",
};

export default function AnalysisPage() {
  const [tab, setTab] = useState<AnalysisTab>("keyperson");
  const [employees, setEmployees] = useState<Employee[]>(() => []);
  const [employeeSkills, setEmployeeSkillsState] = useState<EmployeeSkill[]>(() => []);
  const [skills, setSkillsState] = useState<Skill[]>(() => []);
  const [org, setOrg] = useState<Organization | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>(() => []);

  const loadData = useCallback(() => {
    seedDemoData();
    const orgData = getOrganization();
    const empData = getEmployees();
    const esData = getEmployeeSkills();
    const skillData = getSkills();
    setOrg(orgData);
    setEmployees(empData);
    setEmployeeSkillsState(esData);
    setSkillsState(skillData);
    setAssessment(assessRisk(orgData, empData, esData));
    setForecast(generateWorkforceForecast(empData));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeEmployees = employees.filter((e) => !e.resignationDate);

  // Key person analysis
  const keyPersons = activeEmployees.filter((e) => e.isKeyPerson);

  // Build skill dependency map
  const skillDependency = new Map<string, { skill: Skill; owners: Array<{ employee: Employee; es: EmployeeSkill }> }>();
  for (const skill of skills) {
    const owners = employeeSkills
      .filter((es) => es.skillId === skill.id && es.isPrimaryOwner)
      .map((es) => {
        const employee = activeEmployees.find((e) => e.id === es.employeeId);
        return employee ? { employee, es } : null;
      })
      .filter((x): x is { employee: Employee; es: EmployeeSkill } => x !== null);
    skillDependency.set(skill.id, { skill, owners });
  }

  const singleOwnerSkills = [...skillDependency.values()]
    .filter((entry) => entry.owners.length === 1)
    .toSorted((a, b) => {
      const critOrder = { critical: 0, important: 1, nice_to_have: 2 };
      return critOrder[a.skill.criticality] - critOrder[b.skill.criticality];
    });

  // Benchmark data
  const currentBenchmark = org
    ? INDUSTRY_BENCHMARKS.find((b) => b.industryCode === org.industryCode)
    : null;

  const companyAvgAge =
    activeEmployees.length > 0
      ? activeEmployees.reduce(
          (sum, e) => sum + (new Date().getFullYear() - e.birthYear),
          0
        ) / activeEmployees.length
      : 0;

  const resignedCount = employees.filter((e) => !!e.resignationDate).length;
  const turnoverRate =
    employees.length > 0 ? (resignedCount / employees.length) * 100 : 0;

  return (
    <div className="flex flex-col pb-4" data-testid="analysis-page">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">分析</h1>
        <p className="text-sm text-gray-500 mt-1">
          詳細なリスク分析と将来予測
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(Object.keys(TAB_LABELS) as AnalysisTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              data-testid={`tab-${t}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Key Person Tab */}
      {tab === "keyperson" ? (
        <div className="px-6" data-testid="keyperson-content">
          {/* Key Person Summary */}
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 mb-4">
            <h3 className="text-sm font-bold text-orange-800">
              キーパーソン依存度サマリー
            </h3>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {keyPersons.length}
                </div>
                <div className="text-[10px] text-orange-500">キーパーソン数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {singleOwnerSkills.length}
                </div>
                <div className="text-[10px] text-red-500">属人化スキル</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {assessment?.dimensionScores.keyPerson ?? 0}
                </div>
                <div className="text-[10px] text-orange-500">リスクスコア</div>
              </div>
            </div>
          </div>

          {/* Single Owner Skills (Risky) */}
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            属人化している業務・スキル
          </h3>
          {singleOwnerSkills.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              属人化リスクのあるスキルはありません
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              {singleOwnerSkills.map(({ skill, owners }) => (
                <div
                  key={skill.id}
                  className="bg-white rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">
                        {skill.name}
                      </span>
                      <span
                        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          skill.criticality === "critical"
                            ? "bg-red-100 text-red-600"
                            : skill.criticality === "important"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {skill.criticality === "critical"
                          ? "重要度:高"
                          : skill.criticality === "important"
                            ? "重要度:中"
                            : "重要度:低"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    担当者: {owners.map((o) => o.employee.name).join(", ")}
                    {owners.length === 1 ? (
                      <span className="ml-1 text-red-500 font-medium">
                        (1名のみ)
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Key Persons List */}
          <h3 className="text-sm font-medium text-gray-500 mb-2 mt-4">
            キーパーソン一覧
          </h3>
          <div className="flex flex-col gap-2">
            {keyPersons.map((person) => {
              const personSkills = employeeSkills
                .filter((es) => es.employeeId === person.id)
                .map((es) => skills.find((s) => s.id === es.skillId)?.name)
                .filter(Boolean);
              const age = new Date().getFullYear() - person.birthYear;

              return (
                <div
                  key={person.id}
                  className="bg-white rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {person.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {person.department} / {person.position}
                    </span>
                    <span className="text-xs text-gray-400">{age}歳</span>
                  </div>
                  {personSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {personSkills.map((s) => (
                        <span
                          key={s}
                          className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Forecast Tab */}
      {tab === "forecast" ? (
        <div className="px-6" data-testid="forecast-content">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              12ヶ月人員予測
            </h3>
            <DynamicForecastChart data={forecast} />
            <div className="flex gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-blue-500 rounded" />
                <span className="text-[10px] text-gray-500">予測人数</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-red-500 rounded" />
                <span className="text-[10px] text-gray-500">不足人数</span>
              </div>
            </div>
          </div>

          {/* Forecast Summary */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h3 className="text-sm font-bold text-blue-800 mb-3">予測サマリー</h3>
            {forecast.length > 1 ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-blue-500">現在の人員</div>
                  <div className="text-lg font-bold text-blue-700">
                    {forecast[0].headcount}名
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-500">6ヶ月後予測</div>
                  <div className="text-lg font-bold text-blue-700">
                    {forecast[6]?.predicted ?? "-"}名
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-blue-500">12ヶ月後予測</div>
                  <div className="text-lg font-bold text-blue-700">
                    {forecast[12]?.predicted ?? "-"}名
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-red-500">12ヶ月後不足</div>
                  <div className="text-lg font-bold text-red-600">
                    {forecast[12]?.shortage ?? 0}名
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">データが不足しています</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Benchmark Tab */}
      {tab === "benchmark" ? (
        <div className="px-6" data-testid="benchmark-content">
          {/* Current company vs industry */}
          {currentBenchmark ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                自社 vs 業界平均（{currentBenchmark.industryName}）
              </h3>
              <div className="flex flex-col gap-3">
                {/* Average Age */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">平均年齢</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {companyAvgAge.toFixed(1)}歳
                    </span>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-xs text-gray-500">
                      {currentBenchmark.avgEmployeeAge}歳
                    </span>
                    {companyAvgAge > currentBenchmark.avgEmployeeAge ? (
                      <span className="text-[10px] text-red-500 font-medium">
                        高い
                      </span>
                    ) : (
                      <span className="text-[10px] text-green-500 font-medium">
                        低い
                      </span>
                    )}
                  </div>
                </div>
                {/* Turnover Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">離職率</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {turnoverRate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-xs text-gray-500">
                      {currentBenchmark.avgTurnoverRate}%
                    </span>
                    {turnoverRate > currentBenchmark.avgTurnoverRate ? (
                      <span className="text-[10px] text-red-500 font-medium">
                        高い
                      </span>
                    ) : (
                      <span className="text-[10px] text-green-500 font-medium">
                        低い
                      </span>
                    )}
                  </div>
                </div>
                {/* Shortage Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">人手不足率</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {currentBenchmark.shortageRate}%
                    </span>
                    <span className="text-xs text-gray-400">(業界平均)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* All Industries */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            業界別ベンチマーク
          </h3>
          <div className="flex flex-col gap-2">
            {INDUSTRY_BENCHMARKS.filter(
              (b) => b.industryCode !== "other"
            ).toSorted((a, b) => b.bankruptcyRiskIndex - a.bankruptcyRiskIndex).map((bench) => (
              <div
                key={bench.industryCode}
                className={`bg-white rounded-xl border p-3 ${
                  org?.industryCode === bench.industryCode
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {bench.industryName}
                    {org?.industryCode === bench.industryCode ? (
                      <span className="ml-1.5 text-[10px] text-blue-500 font-medium">
                        (自社)
                      </span>
                    ) : null}
                  </span>
                  <div
                    className="flex items-center gap-1"
                    style={{ color: getRiskColor(bench.bankruptcyRiskIndex) }}
                  >
                    <span className="text-sm font-bold">
                      {bench.bankruptcyRiskIndex}
                    </span>
                    <span className="text-[10px]">pt</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-gray-500">
                  <div>
                    離職率: {bench.avgTurnoverRate}%
                  </div>
                  <div>
                    平均年齢: {bench.avgEmployeeAge}歳
                  </div>
                  <div>
                    不足率: {bench.shortageRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar of current assessment */}
          {assessment ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                自社リスクプロファイル
              </h3>
              <DynamicRiskRadarChart
                dimensionScores={assessment.dimensionScores}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
