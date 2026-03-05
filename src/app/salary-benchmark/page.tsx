"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrganization,
  getEmployees,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import { benchmarkSalary } from "@/lib/logic";
import type { PositionSalary, SalaryBenchmarkResult } from "@/lib/logic";
import {
  INDUSTRY_AVG_SALARIES,
  MINIMUM_WAGES,
  NATIONAL_AVG_MINIMUM_WAGE,
  getIndustryAvgSalary,
  getMinimumWage,
} from "@/data/master-data";
import type { Organization, Employee } from "@/types";

export default function SalaryBenchmarkPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [results, setResults] = useState<SalaryBenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [customPositions, setCustomPositions] = useState<PositionSalary[]>([]);
  const [newPosition, setNewPosition] = useState("");
  const [newSalary, setNewSalary] = useState(400);

  const loadData = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const orgData = getOrganization();
    const empData = getEmployees();
    setOrg(orgData);

    const active = empData.filter((e: Employee) => !e.resignationDate);
    const industryCode = orgData?.industryCode ?? "other";
    const region = orgData?.prefecture ?? "東京都";

    // Build position list from employee data
    const positionMap = new Map<string, number[]>();
    const salaryData = getIndustryAvgSalary(industryCode);
    const baseSalary = salaryData?.avgSalary ?? 460;

    for (const emp of active) {
      if (!positionMap.has(emp.position)) {
        positionMap.set(emp.position, []);
      }
      // Estimate salary based on years of experience and position
      const yearsEmployed = Math.max(1, new Date().getFullYear() - new Date(emp.hireDate).getFullYear());
      const estimatedSalary = Math.round(
        baseSalary * (0.7 + Math.min(yearsEmployed, 30) * 0.02) +
        (emp.isKeyPerson ? 50 : 0)
      );
      positionMap.get(emp.position)?.push(estimatedSalary);
    }

    const positions: PositionSalary[] = [];
    for (const [position, salaries] of positionMap) {
      const avg = Math.round(salaries.reduce((s, v) => s + v, 0) / salaries.length);
      positions.push({ position, currentAnnualSalary: avg });
    }

    setCustomPositions(positions);
    const benchmarkResults = benchmarkSalary(positions, industryCode, region);
    setResults(benchmarkResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addPosition = () => {
    if (!newPosition.trim()) return;
    const updated = [...customPositions, { position: newPosition, currentAnnualSalary: newSalary }];
    setCustomPositions(updated);
    const industryCode = org?.industryCode ?? "other";
    const region = org?.prefecture ?? "東京都";
    setResults(benchmarkSalary(updated, industryCode, region));
    setNewPosition("");
    setNewSalary(400);
  };

  const removePosition = (index: number) => {
    const updated = customPositions.filter((_, i) => i !== index);
    setCustomPositions(updated);
    const industryCode = org?.industryCode ?? "other";
    const region = org?.prefecture ?? "東京都";
    setResults(benchmarkSalary(updated, industryCode, region));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">分析中...</div>
      </div>
    );
  }

  const industryCode = org?.industryCode ?? "other";
  const currentIndustrySalary = getIndustryAvgSalary(industryCode);
  const currentMinWage = getMinimumWage(org?.prefecture ?? "東京都");
  const minWageAnnual = Math.round((currentMinWage * 2080) / 10000);

  // Stats
  const belowAvgCount = results.filter((r) => r.deviation < -10).length;
  const aboveAvgCount = results.filter((r) => r.deviation > 10).length;
  const avgDeviation = results.length > 0
    ? Math.round(results.reduce((s, r) => s + r.deviation, 0) / results.length * 10) / 10
    : 0;

  return (
    <div className="flex flex-col pb-4" data-testid="salary-benchmark-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">給与ベンチマーク</h1>
        <p className="text-sm text-gray-500 mt-1">
          業界平均との給与水準比較と競争力分析
        </p>
      </div>

      {/* Summary */}
      <section className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className={`rounded-xl border p-3 text-center ${belowAvgCount > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
            <div className={`text-2xl font-bold ${belowAvgCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {belowAvgCount}
            </div>
            <div className={`text-[10px] ${belowAvgCount > 0 ? "text-red-500" : "text-green-500"}`}>
              平均以下の職種
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{aboveAvgCount}</div>
            <div className="text-[10px] text-blue-500">平均以上の職種</div>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-center">
            <div className={`text-2xl font-bold ${avgDeviation < 0 ? "text-red-600" : "text-green-600"}`}>
              {avgDeviation > 0 ? "+" : ""}{avgDeviation}%
            </div>
            <div className="text-[10px] text-gray-500">平均乖離率</div>
          </div>
        </div>
      </section>

      {/* Industry Reference */}
      {currentIndustrySalary ? (
        <section className="px-6 pb-4">
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h2 className="text-sm font-bold text-blue-800 mb-3">
              {currentIndustrySalary.industryName}の給与水準
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {currentIndustrySalary.avgSalary}万円
                </div>
                <div className="text-[10px] text-blue-500">全体平均</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {currentIndustrySalary.managerSalary}万円
                </div>
                <div className="text-[10px] text-blue-500">管理職平均</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {currentIndustrySalary.nonRegularSalary}万円
                </div>
                <div className="text-[10px] text-blue-500">非正規平均</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 text-center">
              <div className="text-[10px] text-blue-500">
                {org?.prefecture ?? "全国"}の最低賃金: {currentMinWage}円/時 (年収換算: 約{minWageAnnual}万円)
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Benchmark Results */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          職種別ベンチマーク結果 ({results.length}件)
        </h2>
        <div className="flex flex-col gap-2">
          {results.map((result, index) => (
            <div
              key={`${result.position}-${index}`}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-bold text-gray-900">{result.position}</span>
                </div>
                <button
                  onClick={() => removePosition(index)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="削除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Comparison bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>自社: {result.currentSalary}万円</span>
                  <span>業界: {result.industryAvg}万円</span>
                </div>
                <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                  {/* Industry average marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-gray-400 z-10"
                    style={{ left: "50%" }}
                  />
                  {/* Company salary bar */}
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (result.currentSalary / (result.industryAvg * 2)) * 100,
                        100
                      )}%`,
                      backgroundColor: result.deviation < -10 ? "#ef4444" : result.deviation > 10 ? "#22c55e" : "#3b82f6",
                    }}
                  />
                </div>
                <div className="flex items-center justify-center mt-1">
                  <span className={`text-xs font-bold ${
                    result.deviation < -10 ? "text-red-600" :
                    result.deviation > 10 ? "text-green-600" : "text-blue-600"
                  }`}>
                    {result.deviation > 0 ? "+" : ""}{result.deviation}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                {result.recommendation}
              </p>

              <div className="mt-2 text-[10px] text-gray-400">
                最低賃金ベース年収: {result.minimumWageAnnual}万円
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Custom Position */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">職種を追加</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">職種名</label>
              <input
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="例: エンジニア、営業部長"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                現在の年収 (万円): {newSalary}
              </label>
              <input
                type="range"
                min={200}
                max={1200}
                step={10}
                value={newSalary}
                onChange={(e) => setNewSalary(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>200万円</span>
                <span>1,200万円</span>
              </div>
            </div>
            <button
              onClick={addPosition}
              disabled={!newPosition.trim()}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              追加して比較する
            </button>
          </div>
        </div>
      </section>

      {/* All Industry Salary Table */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">全業種平均年収一覧</h2>
        <div className="flex flex-col gap-1.5">
          {INDUSTRY_AVG_SALARIES
            .filter((s) => s.industryCode !== "other")
            .sort((a, b) => b.avgSalary - a.avgSalary)
            .map((item) => (
              <div
                key={item.industryCode}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  org?.industryCode === item.industryCode ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-100"
                }`}
              >
                <span className="text-xs text-gray-700">
                  {item.industryName}
                  {org?.industryCode === item.industryCode ? (
                    <span className="ml-1 text-[10px] text-blue-500 font-medium">(自社業種)</span>
                  ) : null}
                </span>
                <span className="text-xs font-bold text-gray-900">{item.avgSalary}万円</span>
              </div>
            ))}
        </div>
      </section>

      {/* Minimum Wage Reference */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">地域別最低賃金 (上位10)</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="text-center mb-3">
            <div className="text-[10px] text-gray-400">全国加重平均</div>
            <div className="text-lg font-bold text-gray-900">{NATIONAL_AVG_MINIMUM_WAGE}円/時</div>
          </div>
          <div className="flex flex-col gap-1">
            {MINIMUM_WAGES
              .sort((a, b) => b.wage - a.wage)
              .slice(0, 10)
              .map((item) => (
                <div
                  key={item.prefecture}
                  className={`flex items-center justify-between py-1.5 px-2 rounded ${
                    org?.prefecture === item.prefecture ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-xs text-gray-600">
                    {item.prefecture}
                    {org?.prefecture === item.prefecture ? (
                      <span className="ml-1 text-[10px] text-blue-500 font-medium">(自社)</span>
                    ) : null}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{item.wage}円</span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
