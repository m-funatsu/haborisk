"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
  getSkills,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import { getRiskColor } from "@/lib/risk";
import {
  assessLaborRisk,
  generateAdvisory,
  forecastHeadcount,
} from "@/lib/logic";
import type { CompanyData, Advisory, LaborRiskAssessment } from "@/lib/logic";
import type { Organization, Employee, EmployeeSkill, Skill } from "@/types";

const GRADE_COLORS: Record<string, string> = {
  S: "bg-red-600 text-white",
  A: "bg-orange-500 text-white",
  B: "bg-yellow-500 text-white",
  C: "bg-blue-500 text-white",
  D: "bg-green-500 text-white",
};

const SCORE_LABELS: Record<string, string> = {
  recruitmentDifficulty: "採用難度",
  attritionRisk: "離職リスク",
  agingRisk: "高齢化リスク",
  skillGapRisk: "スキルギャップ",
  costPressure: "コスト圧力",
};

function buildCompanyData(
  org: Organization | null,
  employees: Employee[],
  employeeSkills: EmployeeSkill[],
  skills: Skill[]
): CompanyData | null {
  if (!org) return null;
  return {
    organization: org,
    employees,
    employeeSkills,
    skills,
    monthlyHiringRate: 1,
    annualBudget: 500,
  };
}

export default function AdvisoryPage() {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [assessment, setAssessment] = useState<LaborRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const org = getOrganization();
    const employees = getEmployees();
    const employeeSkills = getEmployeeSkills();
    const skills = getSkills();
    const companyData = buildCompanyData(org, employees, employeeSkills, skills);
    if (companyData) {
      setAssessment(assessLaborRisk(companyData));
      setAdvisory(generateAdvisory(companyData));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">分析中...</div>
      </div>
    );
  }

  if (!advisory || !assessment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">組織データが登録されていません</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4" data-testid="advisory-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">総合アドバイザリー</h1>
        <p className="text-sm text-gray-500 mt-1">
          経営者向け総合リスク分析レポート
        </p>
      </div>

      {/* Grade Card */}
      <section className="px-6 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <div className="text-sm text-gray-500 mb-2">総合リスクグレード</div>
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl font-bold ${GRADE_COLORS[advisory.grade]}`}
          >
            {advisory.grade}
          </div>
          <p className="text-sm text-gray-600 mt-3">{advisory.gradeDescription}</p>
          <div className="mt-3 text-xs text-gray-400">
            総合スコア: {assessment.overallScore}点 / 100点
          </div>
        </div>
      </section>

      {/* Headline */}
      <section className="px-6 pb-4">
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
          <h2 className="text-sm font-bold text-red-800 mb-1">ヘッドライン</h2>
          <p className="text-sm text-red-700 leading-relaxed">{advisory.headline}</p>
        </div>
      </section>

      {/* 5-Axis Scores */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">5軸リスクスコア</h2>
        <div className="flex flex-col gap-2">
          {(Object.entries(assessment.scores) as [keyof typeof assessment.scores, number][]).map(
            ([key, score]) => (
              <div key={key} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {SCORE_LABELS[key]}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: getRiskColor(score) }}
                  >
                    {score}点
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getRiskColor(score),
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {assessment.details[key]}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Industry Comparison */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">業界平均との比較</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">離職率</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  自社 {advisory.industryComparison.companyTurnover.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">vs</span>
                <span className="text-xs text-gray-500">
                  業界 {advisory.industryComparison.avgTurnover.toFixed(1)}%
                </span>
                {advisory.industryComparison.companyTurnover > advisory.industryComparison.avgTurnover ? (
                  <span className="text-[10px] text-red-500 font-medium">高い</span>
                ) : (
                  <span className="text-[10px] text-green-500 font-medium">低い</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">平均年齢</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  自社 {advisory.industryComparison.companyAvgAge.toFixed(1)}歳
                </span>
                <span className="text-xs text-gray-400">vs</span>
                <span className="text-xs text-gray-500">
                  全国 {advisory.industryComparison.avgAge}歳
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">有効求人倍率</span>
              <span className="text-sm font-semibold text-gray-900">
                {advisory.industryComparison.jobOpeningRatio.toFixed(1)}倍
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Highest Risk Areas */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">最大リスク領域</h2>
        <div className="grid grid-cols-1 gap-2">
          {advisory.highestRiskDepartment ? (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-3">
              <div className="text-[10px] text-orange-500 mb-1">最もリスクの高い部門</div>
              <div className="text-sm font-bold text-orange-800">
                {advisory.highestRiskDepartment.name}
              </div>
              <div className="text-xs text-orange-600">
                リスクスコア: {advisory.highestRiskDepartment.score}点
              </div>
            </div>
          ) : null}
          {advisory.highestRiskPosition ? (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-3">
              <div className="text-[10px] text-orange-500 mb-1">最もリスクの高い職種</div>
              <div className="text-sm font-bold text-orange-800">
                {advisory.highestRiskPosition.name}
              </div>
              <div className="text-xs text-orange-600">
                {advisory.highestRiskPosition.reason}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Annual Cost Impact */}
      <section className="px-6 pb-4">
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-center">
          <div className="text-sm text-red-500 mb-1">年間離職コスト影響額</div>
          <div className="text-3xl font-bold text-red-600">
            {advisory.annualCostImpact.toLocaleString()}
            <span className="text-base font-medium">万円</span>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">推奨対策ロードマップ</h2>
        <div className="flex flex-col gap-2">
          {advisory.roadmap.map((action) => (
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
                      初期コスト: {action.intervention.initialCost.min}〜{action.intervention.initialCost.max}万円
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Text */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">経営者向けサマリー</h2>
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
            {advisory.summary}
          </pre>
        </div>
      </section>

      <div className="px-6 py-4">
        <button
          onClick={loadData}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          再分析する
        </button>
      </div>
    </div>
  );
}
