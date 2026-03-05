"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
  getSkills,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import { assessSkillGap } from "@/lib/logic";
import type { SkillGapItem } from "@/lib/logic";
import type { Organization, Employee } from "@/types";

const CRITICALITY_LABELS: Record<SkillGapItem["criticality"], string> = {
  critical: "最重要",
  important: "重要",
  nice_to_have: "推奨",
};

const CRITICALITY_COLORS: Record<SkillGapItem["criticality"], string> = {
  critical: "bg-red-100 text-red-600",
  important: "bg-yellow-100 text-yellow-600",
  nice_to_have: "bg-gray-100 text-gray-500",
};

type FilterCriticality = "all" | SkillGapItem["criticality"];

export default function SkillGapPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [skillGapItems, setSkillGapItems] = useState<SkillGapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCriticality>("all");

  const loadData = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const orgData = getOrganization();
    const empData = getEmployees();
    const esData = getEmployeeSkills();
    const skillData = getSkills();
    setOrg(orgData);

    const active = empData.filter((e: Employee) => !e.resignationDate);
    setActiveCount(active.length);
    const activeIds = new Set(active.map((e: Employee) => e.id));

    const gaps = assessSkillGap(skillData, esData, activeIds);
    setSkillGapItems(gaps);

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

  const filteredItems = filter === "all"
    ? skillGapItems
    : skillGapItems.filter((item) => item.criticality === filter);

  const criticalGaps = skillGapItems.filter((i) => i.criticality === "critical" && i.gap > 0);
  const importantGaps = skillGapItems.filter((i) => i.criticality === "important" && i.gap > 0);
  const totalGapCount = skillGapItems.filter((i) => i.gap > 0).length;
  const avgRiskScore = skillGapItems.length > 0
    ? Math.round(skillGapItems.reduce((s, i) => s + i.riskScore, 0) / skillGapItems.length)
    : 0;

  // Group by category
  const categories = [...new Set(skillGapItems.map((i) => i.skillCategory))];

  return (
    <div className="flex flex-col pb-4" data-testid="skill-gap-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">スキルギャップ分析</h1>
        <p className="text-sm text-gray-500 mt-1">
          組織のスキル充足状況と不足領域の可視化
        </p>
      </div>

      {/* Summary Cards */}
      <section className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-50 rounded-xl border border-red-100 p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{criticalGaps.length}</div>
            <div className="text-[10px] text-red-500">最重要スキル不足</div>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{importantGaps.length}</div>
            <div className="text-[10px] text-yellow-600">重要スキル不足</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalGapCount}</div>
            <div className="text-[10px] text-blue-500">全不足スキル数</div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{avgRiskScore}</div>
            <div className="text-[10px] text-gray-500">平均リスクスコア</div>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">カテゴリ別概要</h2>
        <div className="flex flex-col gap-2">
          {categories.map((category) => {
            const catItems = skillGapItems.filter((i) => i.skillCategory === category);
            const catGaps = catItems.filter((i) => i.gap > 0);
            const catAvgRisk = catItems.length > 0
              ? Math.round(catItems.reduce((s, i) => s + i.riskScore, 0) / catItems.length)
              : 0;
            const categoryLabels: Record<string, string> = {
              technical: "技術スキル",
              management: "マネジメント",
              customer: "顧客対応",
              compliance: "コンプライアンス",
            };
            return (
              <div key={category} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {categoryLabels[category] ?? category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${catAvgRisk >= 50 ? "text-red-600" : catAvgRisk >= 25 ? "text-yellow-600" : "text-green-600"}`}>
                      リスク{catAvgRisk}点
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${catAvgRisk}%`,
                      backgroundColor: catAvgRisk >= 50 ? "#ef4444" : catAvgRisk >= 25 ? "#eab308" : "#22c55e",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
                  <span>全{catItems.length}スキル</span>
                  <span>不足{catGaps.length}件</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter */}
      <div className="px-6 pb-4">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            すべて ({skillGapItems.length})
          </button>
          {(["critical", "important", "nice_to_have"] as const).map((crit) => (
            <button
              key={crit}
              onClick={() => setFilter(crit)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === crit
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {CRITICALITY_LABELS[crit]} ({skillGapItems.filter((i) => i.criticality === crit).length})
            </button>
          ))}
        </div>
      </div>

      {/* Skill Gap List */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          スキル一覧 ({filteredItems.length}件)
        </h2>
        <div className="flex flex-col gap-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              該当するスキルがありません
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.skillName}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{item.skillName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CRITICALITY_COLORS[item.criticality]}`}>
                      {CRITICALITY_LABELS[item.criticality]}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${item.riskScore >= 50 ? "text-red-600" : item.riskScore >= 25 ? "text-yellow-600" : "text-green-600"}`}>
                    {item.riskScore}点
                  </span>
                </div>

                {/* Coverage bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>充足状況</span>
                    <span>{item.currentCoverage} / {item.requiredCoverage}名</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.requiredCoverage > 0
                          ? Math.min((item.currentCoverage / item.requiredCoverage) * 100, 100)
                          : 0}%`,
                        backgroundColor: item.gap > 0 ? "#ef4444" : "#22c55e",
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-4 text-[11px] text-gray-400">
                  <span>
                    カテゴリ: {
                      item.skillCategory === "technical" ? "技術" :
                      item.skillCategory === "management" ? "管理" :
                      item.skillCategory === "customer" ? "顧客" : "規制"
                    }
                  </span>
                  {item.gap > 0 ? (
                    <span className="text-red-500 font-medium">
                      {item.gap}名不足
                    </span>
                  ) : (
                    <span className="text-green-500 font-medium">充足</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Organization context */}
      {org ? (
        <section className="px-6 pb-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
            <div className="text-[10px] text-gray-400">分析対象</div>
            <div className="text-sm font-bold text-gray-900">{org.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {org.industryName} / 在籍{activeCount}名 / {skillGapItems.length}スキル評価済
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
