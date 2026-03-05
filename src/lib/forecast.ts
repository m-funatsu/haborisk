import type { Employee } from "@/types";
import { format, addMonths } from "date-fns";
import { ja } from "date-fns/locale";

export interface ForecastPoint {
  month: string;
  label: string;
  headcount: number;
  predicted: number;
  shortage: number;
}

export function generateWorkforceForecast(
  employees: Employee[],
  months: number = 12
): ForecastPoint[] {
  const active = employees.filter((e) => !e.resignationDate);
  const currentHeadcount = active.length;
  if (currentHeadcount === 0) return [];

  const now = new Date();

  const totalEmployees = employees.length;
  const resigned = employees.filter((e) => e.resignationDate).length;
  const baseAttritionRate = totalEmployees > 0 ? resigned / totalEmployees : 0.05;
  const monthlyAttritionRate = Math.max(baseAttritionRate / 12, 0.005);

  const ages = active.map((e) => new Date().getFullYear() - e.birthYear);
  const nearRetirement = ages.filter((a) => a >= 60).length;
  const retirementAdjustment = (nearRetirement / currentHeadcount) * 0.01;

  const points: ForecastPoint[] = [];

  for (let i = 0; i <= months; i++) {
    const monthDate = addMonths(now, i);
    const monthStr = format(monthDate, "yyyy-MM");
    const label = format(monthDate, "M月", { locale: ja });

    const predicted = Math.round(
      currentHeadcount *
        Math.pow(1 - monthlyAttritionRate - retirementAdjustment, i)
    );

    const shortage = currentHeadcount - predicted;

    points.push({
      month: monthStr,
      label: i === 0 ? "現在" : label,
      headcount: currentHeadcount,
      predicted: Math.max(predicted, 0),
      shortage: Math.max(shortage, 0),
    });
  }

  return points;
}
