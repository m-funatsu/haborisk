"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DynamicRiskGauge,
  DynamicRiskRadarChart,
  DynamicDepartmentRiskChart,
} from "@/components/charts";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
} from "@/lib/storage";
import { assessRisk, getRiskColor, getRiskLabel, DIMENSION_LABELS } from "@/lib/risk";
import { seedDemoData } from "@/lib/seed";
import type { RiskAssessment } from "@/types";
import { ExportButton } from "@/components/shared/ExportButton";

const EMPTY_DIMENSIONS = {
  age: 0,
  keyPerson: 0,
  turnover: 0,
  seasonal: 0,
  succession: 0,
};

export default function DashboardPage() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  const runAssessment = useCallback(() => {
    setLoading(true);
    seedDemoData();
    const org = getOrganization();
    const employees = getEmployees();
    const employeeSkills = getEmployeeSkills();
    const result = assessRisk(org, employees, employeeSkills);
    setAssessment(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    runAssessment();
  }, [runAssessment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">読み込み中...</div>
      </div>
    );
  }

  const dimensions = assessment?.dimensionScores ?? EMPTY_DIMENSIONS;
  const departmentScores = assessment?.departmentScores ?? {};
  const overallScore = assessment?.overallScore ?? 0;

  const exportData = useMemo(() => {
    if (!assessment) return [];
    return [{
      assessedAt: assessment.assessedAt,
      overallScore: assessment.overallScore,
      age: assessment.dimensionScores.age,
      keyPerson: assessment.dimensionScores.keyPerson,
      turnover: assessment.dimensionScores.turnover,
      seasonal: assessment.dimensionScores.seasonal,
      succession: assessment.dimensionScores.succession,
    }];
  }, [assessment]);

  const exportColumns = [
    { key: 'assessedAt', label: '診断日', format: (v: unknown) => new Date(String(v)).toLocaleDateString('ja-JP') },
    { key: 'overallScore', label: '総合リスクスコア' },
    { key: 'age', label: '年齢リスク' },
    { key: 'keyPerson', label: 'キーパーソンリスク' },
    { key: 'turnover', label: '離職リスク' },
    { key: 'seasonal', label: '季節変動リスク' },
    { key: 'succession', label: '後継者リスク' },
  ];

  const alerts = Object.entries(dimensions)
    .filter(([, score]) => score >= 60)
    .toSorted(([, a], [, b]) => b - a)
    .map(([key, score]) => ({
      dimension: DIMENSION_LABELS[key] ?? key,
      score,
    }));

  return (
    <div className="flex flex-col pb-4" data-testid="dashboard-page">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">リスクダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">
            総合的な人手不足リスクの評価
          </p>
        </div>
        <ExportButton
          data={exportData}
          columns={exportColumns}
          filename="haborisk_assessment"
        />
      </div>

      <section className="px-6 py-4" data-testid="overall-score-section">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-4 text-center">
            総合リスクスコア
          </h2>
          <DynamicRiskGauge score={overallScore} />
        </div>
      </section>

      {alerts.length > 0 ? (
        <section className="px-6 py-2" data-testid="alerts-section">
          <h2 className="text-sm font-medium text-gray-500 mb-3">アラート</h2>
          <div className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <div
                key={alert.dimension}
                className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getRiskColor(alert.score) }}
                />
                <span className="text-sm font-medium text-gray-800 flex-1">
                  {alert.dimension}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: getRiskColor(alert.score) }}
                >
                  {alert.score}点 ({getRiskLabel(alert.score)})
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-6 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            5軸リスク分析
          </h2>
          <DynamicRiskRadarChart dimensionScores={dimensions} />
        </div>
      </section>

      <section className="px-6 py-2">
        <h2 className="text-sm font-medium text-gray-500 mb-3">軸別スコア</h2>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(dimensions).map(([key, score]) => (
            <div
              key={key}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white"
            >
              <div
                className="w-1.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: getRiskColor(score) }}
              />
              <span className="text-sm text-gray-700 flex-1">
                {DIMENSION_LABELS[key] ?? key}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getRiskColor(score),
                    }}
                  />
                </div>
                <span
                  className="text-sm font-semibold w-8 text-right"
                  style={{ color: getRiskColor(score) }}
                >
                  {score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            部署別リスク
          </h2>
          <DynamicDepartmentRiskChart departmentScores={departmentScores} />
        </div>
      </section>

      <div className="px-6 py-4">
        <button
          onClick={runAssessment}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          data-testid="refresh-assessment"
        >
          再診断する
        </button>
      </div>
    </div>
  );
}
