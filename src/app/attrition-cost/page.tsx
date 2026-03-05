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
  calculateAttritionCost,
  forecastHeadcount,
} from "@/lib/logic";
import {
  RECRUITMENT_COSTS,
  ATTRITION_COST_MULTIPLIER,
  getIndustryAvgSalary,
} from "@/data/master-data";
import type { AttritionCostBreakdown, HeadcountPoint } from "@/lib/logic";
import type { Organization, Employee } from "@/types";

export default function AttritionCostPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<AttritionCostBreakdown | null>(null);
  const [forecast, setForecast] = useState<HeadcountPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // User-adjustable parameters
  const [avgSalary, setAvgSalary] = useState(460);
  const [replacementMonths, setReplacementMonths] = useState(3);
  const [keyPersonCount, setKeyPersonCount] = useState(0);

  const loadData = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const orgData = getOrganization();
    const empData = getEmployees();
    getEmployeeSkills();
    getSkills();
    setOrg(orgData);
    setEmployees(empData);

    const active = empData.filter((e) => !e.resignationDate);
    const industryCode = orgData?.industryCode ?? "other";
    const salaryData = getIndustryAvgSalary(industryCode);
    const salary = salaryData?.avgSalary ?? 460;
    setAvgSalary(salary);

    const keyCount = active.filter((e) => e.isKeyPerson).length;
    setKeyPersonCount(Math.min(keyCount, Math.ceil(active.length * 0.2)));

    // Calculate company turnover rate
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const totalAtStart = empData.filter((e) => new Date(e.hireDate) <= oneYearAgo).length;
    const resignedInPeriod = empData.filter((e) => {
      if (!e.resignationDate) return false;
      const resignDate = new Date(e.resignationDate);
      return resignDate >= oneYearAgo && resignDate <= now;
    }).length;
    const turnoverRate = totalAtStart > 0 ? (resignedInPeriod / totalAtStart) * 100 : 5.0;

    const annualDepartures = Math.round(active.length * (turnoverRate / 100));
    const keyDep = Math.round(annualDepartures * 0.2);

    setCostBreakdown(calculateAttritionCost(annualDepartures, salary, 3, keyDep));

    const fcPoints = forecastHeadcount(active.length, turnoverRate, 1, 12);
    setForecast(fcPoints);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recalculate = () => {
    const active = employees.filter((e) => !e.resignationDate);
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const totalAtStart = employees.filter((e) => new Date(e.hireDate) <= oneYearAgo).length;
    const resignedInPeriod = employees.filter((e) => {
      if (!e.resignationDate) return false;
      const resignDate = new Date(e.resignationDate);
      return resignDate >= oneYearAgo && resignDate <= now;
    }).length;
    const turnoverRate = totalAtStart > 0 ? (resignedInPeriod / totalAtStart) * 100 : 5.0;
    const annualDepartures = Math.round(active.length * (turnoverRate / 100));

    setCostBreakdown(
      calculateAttritionCost(annualDepartures, avgSalary, replacementMonths, keyPersonCount)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">計算中...</div>
      </div>
    );
  }

  const active = employees.filter((e) => !e.resignationDate);
  const midCareerCost = RECRUITMENT_COSTS.find((r) => r.type === "mid_career");
  const newGradCost = RECRUITMENT_COSTS.find((r) => r.type === "new_grad");

  return (
    <div className="flex flex-col pb-4" data-testid="attrition-cost-page">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">離職コスト分析</h1>
        <p className="text-sm text-gray-500 mt-1">
          離職による経済的影響をシミュレーション
        </p>
      </div>

      {/* Cost Summary Card */}
      {costBreakdown ? (
        <section className="px-6 pb-4">
          <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-center">
            <div className="text-sm text-red-500 mb-1">年間離職コスト推定額</div>
            <div className="text-4xl font-bold text-red-600">
              {costBreakdown.totalCost.toLocaleString()}
              <span className="text-lg font-medium">万円</span>
            </div>
            <div className="text-xs text-red-400 mt-2">
              1人あたり平均: {costBreakdown.perPersonCost.toLocaleString()}万円
            </div>
          </div>
        </section>
      ) : null}

      {/* Cost Breakdown */}
      {costBreakdown ? (
        <section className="px-6 pb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">コスト内訳</h2>
          <div className="flex flex-col gap-2">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">直接採用コスト</span>
                <span className="text-sm font-bold text-gray-900">
                  {costBreakdown.recruitmentCost.toLocaleString()}万円
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${costBreakdown.totalCost > 0
                      ? (costBreakdown.recruitmentCost / costBreakdown.totalCost) * 100
                      : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                求人広告、人材紹介手数料、面接工数など
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">生産性損失コスト</span>
                <span className="text-sm font-bold text-orange-600">
                  {costBreakdown.productivityLoss.toLocaleString()}万円
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${costBreakdown.totalCost > 0
                      ? (costBreakdown.productivityLoss / costBreakdown.totalCost) * 100
                      : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                退職前の生産性低下、引継ぎ期間、新人の立ち上がり期間
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">研修・育成コスト</span>
                <span className="text-sm font-bold text-green-600">
                  {costBreakdown.trainingCost.toLocaleString()}万円
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${costBreakdown.totalCost > 0
                      ? (costBreakdown.trainingCost / costBreakdown.totalCost) * 100
                      : 0}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                新入社員研修、OJT、マニュアル整備など
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Forecast Timeline */}
      {forecast.length > 0 ? (
        <section className="px-6 pb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">12ヶ月人員推移予測</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-col gap-1">
              {forecast.filter((_, i) => i % 3 === 0 || i === forecast.length - 1).map((point) => (
                <div key={point.month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                    {point.label}
                  </span>
                  <div className="flex-1 h-4 bg-gray-50 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all"
                      style={{
                        width: `${forecast[0].projected > 0
                          ? (point.projected / forecast[0].projected) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 w-10 text-right">
                    {point.projected}名
                  </span>
                </div>
              ))}
            </div>
            {forecast.length > 1 ? (
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-gray-400">累計入社</div>
                  <div className="text-sm font-bold text-green-600">
                    +{forecast.reduce((s, p) => s + p.hires, 0)}名
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">累計退社</div>
                  <div className="text-sm font-bold text-red-600">
                    -{forecast.reduce((s, p) => s + p.departures, 0)}名
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">純増減</div>
                  <div className="text-sm font-bold text-gray-900">
                    {forecast[forecast.length - 1].projected - forecast[0].projected}名
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Reference Data */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">採用コスト参考値</h2>
        <div className="grid grid-cols-2 gap-2">
          {midCareerCost ? (
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-[10px] text-gray-400">中途採用1人あたり</div>
              <div className="text-lg font-bold text-blue-600">{midCareerCost.costPerHire}万円</div>
              <div className="text-[10px] text-gray-400">平均{midCareerCost.avgTimeToFill}ヶ月</div>
            </div>
          ) : null}
          {newGradCost ? (
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-[10px] text-gray-400">新卒採用1人あたり</div>
              <div className="text-lg font-bold text-blue-600">{newGradCost.costPerHire}万円</div>
              <div className="text-[10px] text-gray-400">平均{newGradCost.avgTimeToFill}ヶ月</div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Multiplier Info */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">離職コスト係数</h2>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">年収に対する離職1人あたりの総コスト倍率</p>
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
      </section>

      {/* Adjustable Parameters */}
      <section className="px-6 pb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">パラメータ調整</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                平均年収 (万円): {avgSalary}
              </label>
              <input
                type="range"
                min={200}
                max={1000}
                step={10}
                value={avgSalary}
                onChange={(e) => setAvgSalary(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>200万円</span>
                <span>1,000万円</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                補充所要期間 (月): {replacementMonths}
              </label>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={replacementMonths}
                onChange={(e) => setReplacementMonths(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>1ヶ月</span>
                <span>12ヶ月</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                キーパーソン離職数: {keyPersonCount}名
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(active.filter((e) => e.isKeyPerson).length, 5)}
                step={1}
                value={keyPersonCount}
                onChange={(e) => setKeyPersonCount(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
          <button
            onClick={recalculate}
            className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            再計算する
          </button>
        </div>
      </section>

      {/* Industry context */}
      {org ? (
        <section className="px-6 pb-4">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
            <div className="text-[10px] text-gray-400">分析対象</div>
            <div className="text-sm font-bold text-gray-900">{org.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {org.industryName} / {org.prefecture} / 在籍{active.length}名
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
