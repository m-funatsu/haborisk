"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getRiskColor } from "@/lib/risk";

interface Props {
  departmentScores: Record<string, number>;
}

export default function DepartmentRiskChart({ departmentScores }: Props) {
  const data = Object.entries(departmentScores)
    .map(([name, score]) => ({ name, score }))
    .toSorted((a, b) => b.score - a.score);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        部署データがありません
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#374151" }}
            width={80}
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
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={28}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={getRiskColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
