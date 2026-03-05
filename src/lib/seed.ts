import type { Organization, Employee, EmployeeSkill, Skill } from "@/types";
import {
  saveOrganization,
  saveEmployees,
  saveSkills,
  saveEmployeeSkills,
  getEmployees,
} from "@/lib/storage";

const DEPARTMENTS = ["営業部", "製造部", "管理部", "技術部"];
const POSITIONS_BY_DEPT: Record<string, string[]> = {
  営業部: ["部長", "課長", "主任", "一般"],
  製造部: ["部長", "課長", "班長", "作業員"],
  管理部: ["部長", "課長", "主任", "一般"],
  技術部: ["部長", "課長", "エンジニア", "テクニシャン"],
};

const LAST_NAMES = [
  "田中", "山田", "佐藤", "鈴木", "高橋", "渡辺", "伊藤", "中村",
  "小林", "加藤", "吉田", "山本", "松本", "井上", "木村",
  "林", "斎藤", "清水", "山崎", "森",
];
const FIRST_NAMES = [
  "太郎", "花子", "一郎", "美咲", "健太", "裕子", "翔", "直美",
  "大輔", "恵子", "浩二", "由美", "誠", "真紀", "洋平",
  "亮", "智子", "拓也", "さくら", "博",
];

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBirthYear(minAge: number, maxAge: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - minAge - Math.floor(Math.random() * (maxAge - minAge));
}

function randomHireDate(minYearsAgo: number, maxYearsAgo: number): string {
  const now = new Date();
  const yearsAgo = minYearsAgo + Math.random() * (maxYearsAgo - minYearsAgo);
  const hireDate = new Date(now);
  hireDate.setFullYear(hireDate.getFullYear() - Math.floor(yearsAgo));
  hireDate.setMonth(Math.floor(Math.random() * 12));
  hireDate.setDate(1 + Math.floor(Math.random() * 28));
  return hireDate.toISOString().split("T")[0];
}

const SKILLS_DATA: Array<{ name: string; category: Skill["category"]; criticality: Skill["criticality"] }> = [
  { name: "品質管理", category: "technical", criticality: "critical" },
  { name: "設備メンテナンス", category: "technical", criticality: "critical" },
  { name: "顧客対応", category: "customer", criticality: "important" },
  { name: "経理処理", category: "management", criticality: "important" },
  { name: "生産計画", category: "technical", criticality: "critical" },
  { name: "安全管理", category: "compliance", criticality: "critical" },
  { name: "CAD/CAM操作", category: "technical", criticality: "important" },
  { name: "営業企画", category: "customer", criticality: "important" },
  { name: "在庫管理", category: "management", criticality: "nice_to_have" },
  { name: "新人教育", category: "management", criticality: "nice_to_have" },
];

export function seedDemoData(): void {
  const existing = getEmployees();
  if (existing.length > 0) return;

  const org: Organization = {
    id: crypto.randomUUID(),
    name: "株式会社サンプル製造",
    industryCode: "manufacturing",
    industryName: "製造業",
    prefecture: "愛知県",
    foundedYear: 1985,
    ceoAge: 62,
    hasSuccessor: false,
    createdAt: new Date().toISOString(),
  };

  const employees: Employee[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 20; i++) {
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const positions = POSITIONS_BY_DEPT[dept];
    const positionIdx = Math.min(Math.floor(i / DEPARTMENTS.length), positions.length - 1);

    let name: string;
    do {
      name = `${randomElement(LAST_NAMES)} ${randomElement(FIRST_NAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const isManager = positionIdx <= 1;
    const isSenior = i < 8;
    const employmentTypes: Employee["employmentType"][] = ["full_time", "part_time", "contract", "dispatch"];
    const empType = i < 14 ? "full_time" : randomElement(employmentTypes.slice(1));

    const resignationDate =
      i === 17 ? "2025-08-15" : i === 19 ? "2025-11-01" : null;

    employees.push({
      id: crypto.randomUUID(),
      employeeCode: `EMP${String(i + 1).padStart(3, "0")}`,
      name,
      department: dept,
      position: positions[positionIdx],
      employmentType: empType,
      birthYear: isSenior ? randomBirthYear(50, 65) : randomBirthYear(25, 49),
      hireDate: isSenior ? randomHireDate(10, 30) : randomHireDate(1, 9),
      isKeyPerson: isManager || i === 8,
      resignationDate,
      createdAt: new Date().toISOString(),
    });
  }

  const skills: Skill[] = SKILLS_DATA.map((s) => ({
    id: crypto.randomUUID(),
    ...s,
    createdAt: new Date().toISOString(),
  }));

  const employeeSkills: EmployeeSkill[] = [];
  for (const employee of employees) {
    if (employee.resignationDate) continue;
    const skillCount = 2 + Math.floor(Math.random() * 3);
    const shuffled = skills.toSorted(() => Math.random() - 0.5).slice(0, skillCount);
    for (const skill of shuffled) {
      employeeSkills.push({
        employeeId: employee.id,
        skillId: skill.id,
        proficiency: 1 + Math.floor(Math.random() * 5),
        isPrimaryOwner: employee.isKeyPerson && Math.random() > 0.3,
      });
    }
  }

  saveOrganization(org);
  saveEmployees(employees);
  saveSkills(skills);
  saveEmployeeSkills(employeeSkills);
}
