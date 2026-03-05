import type { IndustryBenchmark } from "@/types";

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    industryCode: "construction",
    industryName: "建設業",
    avgTurnoverRate: 9.5,
    avgEmployeeAge: 44.2,
    shortageRate: 63.0,
    bankruptcyRiskIndex: 72,
  },
  {
    industryCode: "manufacturing",
    industryName: "製造業",
    avgTurnoverRate: 10.2,
    avgEmployeeAge: 42.8,
    shortageRate: 48.0,
    bankruptcyRiskIndex: 55,
  },
  {
    industryCode: "transport",
    industryName: "運輸業",
    avgTurnoverRate: 12.3,
    avgEmployeeAge: 46.5,
    shortageRate: 68.0,
    bankruptcyRiskIndex: 78,
  },
  {
    industryCode: "food_service",
    industryName: "飲食サービス業",
    avgTurnoverRate: 26.9,
    avgEmployeeAge: 38.5,
    shortageRate: 80.0,
    bankruptcyRiskIndex: 85,
  },
  {
    industryCode: "retail",
    industryName: "小売業",
    avgTurnoverRate: 14.6,
    avgEmployeeAge: 40.1,
    shortageRate: 52.0,
    bankruptcyRiskIndex: 60,
  },
  {
    industryCode: "it",
    industryName: "IT・情報通信業",
    avgTurnoverRate: 11.8,
    avgEmployeeAge: 38.2,
    shortageRate: 71.0,
    bankruptcyRiskIndex: 45,
  },
  {
    industryCode: "healthcare",
    industryName: "医療・福祉",
    avgTurnoverRate: 14.4,
    avgEmployeeAge: 41.3,
    shortageRate: 75.0,
    bankruptcyRiskIndex: 68,
  },
  {
    industryCode: "education",
    industryName: "教育",
    avgTurnoverRate: 11.0,
    avgEmployeeAge: 43.5,
    shortageRate: 45.0,
    bankruptcyRiskIndex: 40,
  },
  {
    industryCode: "real_estate",
    industryName: "不動産業",
    avgTurnoverRate: 15.1,
    avgEmployeeAge: 42.0,
    shortageRate: 38.0,
    bankruptcyRiskIndex: 50,
  },
  {
    industryCode: "other",
    industryName: "その他",
    avgTurnoverRate: 12.0,
    avgEmployeeAge: 42.0,
    shortageRate: 50.0,
    bankruptcyRiskIndex: 55,
  },
];

export function getBenchmarkByCode(
  industryCode: string
): IndustryBenchmark | undefined {
  return INDUSTRY_BENCHMARKS.find((b) => b.industryCode === industryCode);
}
