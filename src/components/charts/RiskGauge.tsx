"use client";

import { getRiskColor, getRiskLabel } from "@/lib/risk";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export default function RiskGauge({ score, size = 240 }: RiskGaugeProps) {
  const color = getRiskColor(score);
  const label = getRiskLabel(score);
  const radius = 90;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const yCenter = center * 0.85;

  return (
    <div className="flex flex-col items-center" data-testid="risk-gauge">
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size * 0.6}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${center - radius} ${yCenter} A ${radius} ${radius} 0 0 1 ${center + radius} ${yCenter}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${center - radius} ${yCenter} A ${radius} ${radius} 0 0 1 ${center + radius} ${yCenter}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x={center}
          y={yCenter - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-4xl font-bold"
          fill={color}
        >
          {score}
        </text>
        <text
          x={center}
          y={yCenter + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm"
          fill="#9ca3af"
        >
          / 100
        </text>
      </svg>
      <p className="mt-1 text-lg font-bold" style={{ color }}>
        {label}
      </p>
      <p className="text-xs text-gray-500">人手不足リスクスコア</p>
    </div>
  );
}
