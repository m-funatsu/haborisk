"use client";

import dynamic from "next/dynamic";

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <div className="animate-pulse bg-gray-100 rounded-lg w-full h-full" />
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-pulse bg-gray-100 rounded-full w-[240px] h-[140px]" />
    </div>
  );
}

export const DynamicRiskRadarChart = dynamic(
  () => import("./RiskRadarChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const DynamicDepartmentRiskChart = dynamic(
  () => import("./DepartmentRiskChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const DynamicRiskGauge = dynamic(
  () => import("./RiskGauge"),
  { ssr: false, loading: () => <GaugeSkeleton /> }
);

export const DynamicForecastChart = dynamic(
  () => import("./ForecastChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
