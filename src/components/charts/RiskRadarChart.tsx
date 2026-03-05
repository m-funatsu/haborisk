"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RiskAssessment } from "@/types";
import { DIMENSION_LABELS, getRiskColor } from "@/lib/risk";

interface Props {
  dimensionScores: RiskAssessment["dimensionScores"];
}

const DIMENSION_KEYS = ["age", "keyPerson", "turnover", "seasonal", "succession"] as const;

export default function RiskRadarChart({ dimensionScores }: Props) {
  const data = DIMENSION_KEYS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    score: dimensionScores[key],
    fullMark: 100,
  }));

  const avgScore =
    DIMENSION_KEYS.reduce((sum, k) => sum + dimensionScores[k], 0) /
    DIMENSION_KEYS.length;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#4b5563", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => [`${value}点`, "リスクスコア"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Radar
            name="リスクスコア"
            dataKey="score"
            stroke={getRiskColor(avgScore)}
            fill={getRiskColor(avgScore)}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
