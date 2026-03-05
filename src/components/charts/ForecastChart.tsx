"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ForecastPoint } from "@/lib/forecast";

interface Props {
  data: ForecastPoint[];
}

export default function ForecastChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        予測データがありません
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value, name) => {
              const label =
                name === "headcount"
                  ? "必要人数"
                  : name === "predicted"
                    ? "予測人数"
                    : "不足人数";
              return [`${value}人`, label];
            }}
          />
          <ReferenceLine
            y={data[0]?.headcount ?? 0}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: "現在", position: "insideTopRight", fill: "#9ca3af", fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
            name="predicted"
          />
          <Area
            type="monotone"
            dataKey="shortage"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.1}
            strokeWidth={2}
            name="shortage"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
