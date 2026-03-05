import type { Employee, EmployeeSkill, Organization, RiskAssessment, ActionItem } from "@/types";
import { getBenchmarkByCode } from "@/data/benchmarks";
import { getRecommendationsForDimension } from "@/data/recommendations";

const CURRENT_YEAR = new Date().getFullYear();

const DIMENSION_WEIGHTS = {
  age: 0.25,
  keyPerson: 0.25,
  turnover: 0.2,
  seasonal: 0.15,
  succession: 0.15,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateAgeScore(employees: Employee[], industryCode: string): number {
  const active = employees.filter((e) => !e.resignationDate);
  if (active.length === 0) return 0;

  const ages = active.map((e) => CURRENT_YEAR - e.birthYear);
  const avgAge = ages.reduce((sum, a) => sum + a, 0) / ages.length;
  const over55Count = ages.filter((a) => a >= 55).length;
  const over55Pct = (over55Count / active.length) * 100;

  const benchmark = getBenchmarkByCode(industryCode);
  const industryAvgAge = benchmark?.avgEmployeeAge ?? 42;

  const over55Score = clamp((over55Pct / 50) * 50, 0, 50);
  const ageDiffScore = clamp(((avgAge - industryAvgAge) / 10) * 50, 0, 50);

  return clamp(Math.round(over55Score + ageDiffScore), 0, 100);
}

function calculateKeyPersonScore(
  employees: Employee[],
  employeeSkills: EmployeeSkill[]
): number {
  const active = employees.filter((e) => !e.resignationDate);
  if (active.length === 0) return 0;

  const activeIds = new Set(active.map((e) => e.id));
  const activeSkills = employeeSkills.filter((es) => activeIds.has(es.employeeId));

  const skillOwners = new Map<string, EmployeeSkill[]>();
  for (const es of activeSkills) {
    const existing = skillOwners.get(es.skillId) ?? [];
    existing.push(es);
    skillOwners.set(es.skillId, existing);
  }

  let singleOwnerCount = 0;
  let totalSkills = 0;

  for (const [, owners] of skillOwners) {
    const primaryOwners = owners.filter((o) => o.isPrimaryOwner);
    totalSkills++;
    if (primaryOwners.length <= 1) {
      singleOwnerCount++;
    }
  }

  if (totalSkills === 0) {
    const keyPersonCount = active.filter((e) => e.isKeyPerson).length;
    return keyPersonCount > 0
      ? clamp(Math.round((keyPersonCount / active.length) * 100 + 20), 0, 100)
      : 20;
  }

  const singleOwnerPct = (singleOwnerCount / totalSkills) * 100;
  return clamp(Math.round(singleOwnerPct), 0, 100);
}

function calculateTurnoverScore(employees: Employee[]): number {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const totalAtStart = employees.filter((e) => {
    const hireDate = new Date(e.hireDate);
    return hireDate <= oneYearAgo;
  }).length;

  if (totalAtStart === 0) return 0;

  const resignedInPeriod = employees.filter((e) => {
    if (!e.resignationDate) return false;
    const resignDate = new Date(e.resignationDate);
    return resignDate >= oneYearAgo && resignDate <= now;
  }).length;

  const turnoverRate = (resignedInPeriod / totalAtStart) * 100;
  return clamp(Math.round((turnoverRate / 30) * 100), 0, 100);
}

function calculateSeasonalScore(employees: Employee[]): number {
  const active = employees.filter((e) => !e.resignationDate);
  if (active.length === 0) return 0;

  const nonFullTime = active.filter(
    (e) => e.employmentType !== "full_time"
  ).length;
  const nonFullTimePct = (nonFullTime / active.length) * 100;

  return clamp(Math.round((nonFullTimePct / 60) * 100), 0, 100);
}

function calculateSuccessionScore(org: Organization | null, employees: Employee[]): number {
  if (!org) return 50;

  let score = 0;

  if (org.ceoAge >= 70) score += 40;
  else if (org.ceoAge >= 65) score += 30;
  else if (org.ceoAge >= 60) score += 20;
  else if (org.ceoAge >= 55) score += 10;

  if (!org.hasSuccessor) score += 40;

  const companyAge = CURRENT_YEAR - org.foundedYear;
  if (companyAge > 30 && !org.hasSuccessor) score += 20;
  else if (companyAge > 20 && !org.hasSuccessor) score += 10;

  return clamp(score, 0, 100);
}

function calculateDepartmentScores(
  employees: Employee[],
  employeeSkills: EmployeeSkill[],
  industryCode: string
): Record<string, number> {
  const active = employees.filter((e) => !e.resignationDate);
  const departments = [...new Set(active.map((e) => e.department))];
  const result: Record<string, number> = {};

  for (const dept of departments) {
    const deptEmployees = active.filter((e) => e.department === dept);
    const deptIds = new Set(deptEmployees.map((e) => e.id));
    const deptSkills = employeeSkills.filter((es) => deptIds.has(es.employeeId));

    const ageScore = calculateAgeScore(deptEmployees, industryCode);
    const keyPersonScore = calculateKeyPersonScore(deptEmployees, deptSkills);
    const turnoverScore = calculateTurnoverScore(
      employees.filter((e) => e.department === dept)
    );

    result[dept] = clamp(
      Math.round(ageScore * 0.35 + keyPersonScore * 0.35 + turnoverScore * 0.3),
      0,
      100
    );
  }

  return result;
}

function generateRecommendations(
  dimensionScores: RiskAssessment["dimensionScores"]
): ActionItem[] {
  const items: ActionItem[] = [];
  const dimensions = Object.entries(dimensionScores) as [
    keyof typeof dimensionScores,
    number
  ][];

  for (const [dimension, score] of dimensions) {
    const templates = getRecommendationsForDimension(dimension, score);
    for (const template of templates) {
      items.push({
        ...template,
        id: crypto.randomUUID(),
        status: "proposed",
      });
    }
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
  return items.toSorted(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

export function assessRisk(
  org: Organization | null,
  employees: Employee[],
  employeeSkills: EmployeeSkill[]
): RiskAssessment {
  const industryCode = org?.industryCode ?? "other";

  const dimensionScores = {
    age: calculateAgeScore(employees, industryCode),
    keyPerson: calculateKeyPersonScore(employees, employeeSkills),
    turnover: calculateTurnoverScore(employees),
    seasonal: calculateSeasonalScore(employees),
    succession: calculateSuccessionScore(org, employees),
  };

  const overallScore = clamp(
    Math.round(
      dimensionScores.age * DIMENSION_WEIGHTS.age +
        dimensionScores.keyPerson * DIMENSION_WEIGHTS.keyPerson +
        dimensionScores.turnover * DIMENSION_WEIGHTS.turnover +
        dimensionScores.seasonal * DIMENSION_WEIGHTS.seasonal +
        dimensionScores.succession * DIMENSION_WEIGHTS.succession
    ),
    0,
    100
  );

  const departmentScores = calculateDepartmentScores(
    employees,
    employeeSkills,
    industryCode
  );

  const recommendations = generateRecommendations(dimensionScores);

  return {
    id: crypto.randomUUID(),
    overallScore,
    dimensionScores,
    departmentScores,
    recommendations,
    assessedAt: new Date().toISOString(),
  };
}

export function getRiskColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 25) return "#eab308";
  return "#22c55e";
}

export function getRiskLabel(score: number): string {
  if (score >= 75) return "危険";
  if (score >= 50) return "警戒";
  if (score >= 25) return "注意";
  return "安全";
}

export const DIMENSION_LABELS: Record<string, string> = {
  age: "年齢構成",
  keyPerson: "キーパーソン",
  turnover: "離職率",
  seasonal: "季節変動",
  succession: "事業承継",
};
