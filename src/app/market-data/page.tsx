"use client";

import { useState } from "react";
import {
  JOB_OPENING_RATIOS,
  TURNOVER_BENCHMARKS,
  NEW_GRAD_TURNOVER,
  AGE_TURNOVER_MULTIPLIER,
  RECRUITMENT_COSTS,
  ATTRITION_COST_MULTIPLIER,
  MINIMUM_WAGES,
  NATIONAL_AVG_MINIMUM_WAGE,
  INDUSTRY_AVG_SALARIES,
  LABOR_FORCE_PROJECTIONS,
  AGE_COMPOSITION_PROJECTIONS,
  FOREIGN_WORKER_TRENDS,
  INTERVENTIONS,
} from "@/data/master-data";
import type { InterventionCategory } from "@/data/master-data";

type TabId =
  | "job_opening"
  | "turnover"
  | "salary"
  | "labor_force"
  | "interventions"
  | "costs";

const TAB_LABELS: Record<TabId, string> = {
  job_opening: "求人倍率",
  turnover: "離職率",
  salary: "年収・賃金",
  labor_force: "労働力人口",
  interventions: "対策メニュー",
  costs: "採用コスト",
};

const CATEGORY_LABELS: Record<InterventionCategory, string> = {
  dx_automation: "DX・自動化",
  flexible_employment: "多様な雇用形態",
  wage_increase: "賃上げ",
  benefits: "福利厚生",
  recruitment_channels: "採用チャネル",
  foreign_recruitment: "外国人採用",
  reskilling: "リスキリング",
};

export default function MarketDataPage() {
  const [tab, setTab] = useState<TabId>("job_opening");
  const [interventionFilter, setInterventionFilter] = useState<"all" | InterventionCategory>("all");

  const filteredInterventions =
    interventionFilter === "all"
      ? INTERVENTIONS
      : INTERVENTIONS.filter((i) => i.category === interventionFilter);

  return (
    <div className="flex flex-col pb-4" data-testid="market-data-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">労働市場データ</h1>
        <p className="text-sm text-gray-500 mt-1">
          日本の労働市場マスターデータ一覧
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pb-4 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {(Object.entries(TAB_LABELS) as [TabId, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Opening Ratios */}
      {tab === "job_opening" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">業種別有効求人倍率 (2024年参考)</h2>
          <div className="flex flex-col gap-2">
            {JOB_OPENING_RATIOS.toSorted((a, b) => b.ratio - a.ratio).map((item) => (
              <div key={item.industryCode} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.industryName}
                  </span>
                  <span className={`text-sm font-bold ${item.ratio >= 3.0 ? "text-red-600" : item.ratio >= 2.0 ? "text-orange-600" : "text-green-600"}`}>
                    {item.ratio}倍
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((item.ratio / 6) * 100, 100)}%`,
                      backgroundColor: item.ratio >= 3.0 ? "#ef4444" : item.ratio >= 2.0 ? "#f97316" : "#22c55e",
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-1.5 text-[10px] text-gray-400">
                  <span>正社員: {item.fullTimeRatio}倍</span>
                  <span>前年比: {item.yoyChange > 0 ? "+" : ""}{item.yoyChange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Turnover Benchmarks */}
      {tab === "turnover" ? (
        <div className="px-6">
          {/* Industry Turnover */}
          <h2 className="text-sm font-medium text-gray-500 mb-3">業種別離職率ベンチマーク</h2>
          <div className="flex flex-col gap-2 mb-6">
            {TURNOVER_BENCHMARKS.toSorted((a, b) => b.avgTurnoverRate - a.avgTurnoverRate).map((item) => (
              <div key={item.industryCode} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{item.industryName}</span>
                  <span className={`text-sm font-bold ${item.avgTurnoverRate >= 20 ? "text-red-600" : item.avgTurnoverRate >= 15 ? "text-orange-600" : "text-green-600"}`}>
                    {item.avgTurnoverRate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1 text-[10px] text-gray-500">
                  <div>3年以内: {item.threeYearTurnoverRate}%</div>
                  <div>1年以内: {item.firstYearTurnoverRate}%</div>
                  <div>非正規: {item.partTimeTurnoverRate}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* New Grad Turnover */}
          <h2 className="text-sm font-medium text-gray-500 mb-3">新卒3年以内離職率</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(NEW_GRAD_TURNOVER) as [string, number][]).map(([key, rate]) => {
                const labels: Record<string, string> = {
                  university: "大卒",
                  highSchool: "高卒",
                  juniorCollege: "短大等",
                  middleSchool: "中卒",
                };
                return (
                  <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{rate}%</div>
                    <div className="text-[10px] text-gray-500">{labels[key] ?? key}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Age Turnover Multiplier */}
          <h2 className="text-sm font-medium text-gray-500 mb-3">年代別離職傾向倍率</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              {Object.entries(AGE_TURNOVER_MULTIPLIER).map(([ageRange, multiplier]) => (
                <div key={ageRange} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{ageRange}歳</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(multiplier / 2) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 w-8 text-right">
                      x{multiplier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Salary & Minimum Wage */}
      {tab === "salary" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">業種別平均年収 (2024年参考)</h2>
          <div className="flex flex-col gap-2 mb-6">
            {INDUSTRY_AVG_SALARIES.toSorted((a, b) => b.avgSalary - a.avgSalary).map((item) => (
              <div key={item.industryCode} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{item.industryName}</span>
                  <span className="text-sm font-bold text-gray-900">{item.avgSalary}万円</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] text-gray-500">
                  <div>管理職: {item.managerSalary}万円</div>
                  <div>非正規: {item.nonRegularSalary}万円</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-gray-500 mb-3">地域別最低賃金 (2024年度)</h2>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 mb-3">
            <div className="text-center">
              <div className="text-[10px] text-blue-500">全国加重平均</div>
              <div className="text-xl font-bold text-blue-700">{NATIONAL_AVG_MINIMUM_WAGE}円/時間</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MINIMUM_WAGES.toSorted((a, b) => b.wage - a.wage).map((item) => (
              <div key={item.prefecture} className="bg-white rounded-lg border border-gray-100 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700">{item.prefecture}</span>
                  <span className="text-xs font-bold text-gray-900">{item.wage}円</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Labor Force Projections */}
      {tab === "labor_force" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">労働力人口推計</h2>
          <div className="flex flex-col gap-2 mb-6">
            {LABOR_FORCE_PROJECTIONS.map((item) => (
              <div key={item.year} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{item.year}年</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {item.laborForce.toLocaleString()}万人
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
                  <div>生産年齢: {item.workingAge.toLocaleString()}万人</div>
                  <div>高齢就業者: {item.elderlyWorkers}万人</div>
                  <div>外国人: {item.foreignWorkers}万人</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-gray-500 mb-3">年齢構成比の変化予測</h2>
          <div className="flex flex-col gap-2 mb-6">
            {AGE_COMPOSITION_PROJECTIONS.map((item) => (
              <div key={item.year} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="text-sm font-bold text-gray-900 mb-2">{item.year}年</div>
                <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                  <div className="bg-green-400 flex items-center justify-center" style={{ width: `${item.young}%` }}>
                    <span className="text-[8px] text-white font-bold">{item.young}%</span>
                  </div>
                  <div className="bg-blue-400 flex items-center justify-center" style={{ width: `${item.prime}%` }}>
                    <span className="text-[8px] text-white font-bold">{item.prime}%</span>
                  </div>
                  <div className="bg-orange-400 flex items-center justify-center" style={{ width: `${item.senior}%` }}>
                    <span className="text-[8px] text-white font-bold">{item.senior}%</span>
                  </div>
                  <div className="bg-red-400 flex items-center justify-center" style={{ width: `${item.elderly}%` }}>
                    <span className="text-[8px] text-white font-bold">{item.elderly}%</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />15-29歳
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />30-49歳
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />50-64歳
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />65歳以上
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-gray-500 mb-3">外国人労働者の推移</h2>
          <div className="flex flex-col gap-2">
            {FOREIGN_WORKER_TRENDS.map((item) => (
              <div key={item.year} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{item.year}年</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {item.total}万人
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                  <div>技能実習: {item.technicalIntern}万人</div>
                  <div>特定技能: {item.specifiedSkilled}万人</div>
                  <div>専門的: {item.professional}万人</div>
                  <div>その他: {item.other}万人</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Interventions Catalog */}
      {tab === "interventions" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">人手不足対策メニュー ({INTERVENTIONS.length}件)</h2>
          <div className="flex gap-1.5 flex-wrap mb-4">
            <button
              onClick={() => setInterventionFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                interventionFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              すべて
            </button>
            {(Object.entries(CATEGORY_LABELS) as [InterventionCategory, string][]).map(([cat, label]) => (
              <button
                key={cat}
                onClick={() => setInterventionFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  interventionFilter === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {filteredInterventions.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                    {item.categoryLabel}
                  </span>
                  <div className="flex gap-1">
                    {item.suitableSize.map((size) => (
                      <span key={size} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {size === "small" ? "小" : size === "medium" ? "中" : "大"}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-gray-400">
                  <div>初期コスト: {item.initialCost.min}〜{item.initialCost.max}万円</div>
                  <div>月額コスト: {item.monthlyCost.min}〜{item.monthlyCost.max}万円</div>
                  <div>効果発現: {item.timeToEffect.min}〜{item.timeToEffect.max}ヶ月</div>
                </div>
                <div className="flex gap-4 mt-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">離職率改善:</span>
                    <span className="font-bold text-green-600">{item.turnoverReductionEffect}pt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">採用力:</span>
                    <span className="font-bold text-blue-600">{item.recruitmentEffect}pt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">生産性:</span>
                    <span className="font-bold text-purple-600">{item.productivityEffect}pt</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recruitment Costs */}
      {tab === "costs" ? (
        <div className="px-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">採用コスト目安</h2>
          <div className="flex flex-col gap-2 mb-6">
            {RECRUITMENT_COSTS.map((item) => (
              <div key={item.type} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-900">{item.label}</span>
                  <span className="text-lg font-bold text-blue-600">{item.costPerHire}万円</span>
                </div>
                <div className="text-xs text-gray-500">
                  平均採用期間: {item.avgTimeToFill}ヶ月
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-medium text-gray-500 mb-3">離職コスト係数</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-3">
              離職1人あたりのコスト = 年収 x 係数
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">一般社員</span>
                <span className="text-sm font-bold text-gray-900">
                  {ATTRITION_COST_MULTIPLIER.staffMin}〜{ATTRITION_COST_MULTIPLIER.staffMax}倍
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">管理職</span>
                <span className="text-sm font-bold text-orange-600">
                  {ATTRITION_COST_MULTIPLIER.managerMin}〜{ATTRITION_COST_MULTIPLIER.managerMax}倍
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">キーパーソン</span>
                <span className="text-sm font-bold text-red-600">
                  {ATTRITION_COST_MULTIPLIER.keyPerson}倍
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
