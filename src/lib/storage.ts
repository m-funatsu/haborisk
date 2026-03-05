import type {
  Organization,
  Employee,
  Skill,
  EmployeeSkill,
  RiskAssessment,
} from "@/types";

const KEYS = {
  org: "haborisk_v1_org",
  employees: "haborisk_v1_employees",
  skills: "haborisk_v1_skills",
  employeeSkills: "haborisk_v1_employee_skills",
  assessments: "haborisk_v1_assessments",
} as const;

// Module-level cache
let orgCache: Organization | null | undefined = undefined;
let employeesCache: Employee[] | undefined = undefined;
let skillsCache: Skill[] | undefined = undefined;
let employeeSkillsCache: EmployeeSkill[] | undefined = undefined;
let assessmentsCache: RiskAssessment[] | undefined = undefined;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string): T | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Organization
export function getOrganization(): Organization | null {
  if (orgCache !== undefined) return orgCache;
  orgCache = readJSON<Organization>(KEYS.org);
  return orgCache;
}

export function saveOrganization(org: Organization): void {
  writeJSON(KEYS.org, org);
  orgCache = org;
}

// Employees
export function getEmployees(): Employee[] {
  if (employeesCache !== undefined) return employeesCache;
  employeesCache = readJSON<Employee[]>(KEYS.employees) ?? [];
  return employeesCache;
}

export function saveEmployees(employees: Employee[]): void {
  writeJSON(KEYS.employees, employees);
  employeesCache = employees;
}

export function addEmployee(employee: Employee): void {
  const current = getEmployees();
  const updated = [...current, employee];
  saveEmployees(updated);
}

export function updateEmployee(employee: Employee): void {
  const current = getEmployees();
  const updated = current.map((e) => (e.id === employee.id ? employee : e));
  saveEmployees(updated);
}

export function deleteEmployee(id: string): void {
  const current = getEmployees();
  const updated = current.filter((e) => e.id !== id);
  saveEmployees(updated);
  // Also remove employee skills
  const currentSkills = getEmployeeSkills();
  const updatedSkills = currentSkills.filter((es) => es.employeeId !== id);
  saveEmployeeSkills(updatedSkills);
}

// Skills
export function getSkills(): Skill[] {
  if (skillsCache !== undefined) return skillsCache;
  skillsCache = readJSON<Skill[]>(KEYS.skills) ?? [];
  return skillsCache;
}

export function saveSkills(skills: Skill[]): void {
  writeJSON(KEYS.skills, skills);
  skillsCache = skills;
}

export function addSkill(skill: Skill): void {
  const current = getSkills();
  const updated = [...current, skill];
  saveSkills(updated);
}

export function deleteSkill(id: string): void {
  const current = getSkills();
  const updated = current.filter((s) => s.id !== id);
  saveSkills(updated);
  // Also remove employee skills
  const currentES = getEmployeeSkills();
  const updatedES = currentES.filter((es) => es.skillId !== id);
  saveEmployeeSkills(updatedES);
}

// Employee Skills
export function getEmployeeSkills(): EmployeeSkill[] {
  if (employeeSkillsCache !== undefined) return employeeSkillsCache;
  employeeSkillsCache = readJSON<EmployeeSkill[]>(KEYS.employeeSkills) ?? [];
  return employeeSkillsCache;
}

export function saveEmployeeSkills(employeeSkills: EmployeeSkill[]): void {
  writeJSON(KEYS.employeeSkills, employeeSkills);
  employeeSkillsCache = employeeSkills;
}

export function setEmployeeSkill(es: EmployeeSkill): void {
  const current = getEmployeeSkills();
  const idx = current.findIndex(
    (x) => x.employeeId === es.employeeId && x.skillId === es.skillId
  );
  const updated = idx >= 0
    ? current.map((x, i) => (i === idx ? es : x))
    : [...current, es];
  saveEmployeeSkills(updated);
}

// Assessments
export function getAssessments(): RiskAssessment[] {
  if (assessmentsCache !== undefined) return assessmentsCache;
  assessmentsCache = readJSON<RiskAssessment[]>(KEYS.assessments) ?? [];
  return assessmentsCache;
}

export function saveAssessments(assessments: RiskAssessment[]): void {
  writeJSON(KEYS.assessments, assessments);
  assessmentsCache = assessments;
}

export function addAssessment(assessment: RiskAssessment): void {
  const current = getAssessments();
  const updated = [...current, assessment];
  saveAssessments(updated);
}

// Data export/import
export function exportAllData(): string {
  return JSON.stringify({
    version: "1.0",
    exportedAt: new Date().toISOString(),
    org: getOrganization(),
    employees: getEmployees(),
    skills: getSkills(),
    employeeSkills: getEmployeeSkills(),
    assessments: getAssessments(),
  });
}

export function importAllData(jsonString: string): void {
  const data = JSON.parse(jsonString);
  if (data.org) saveOrganization(data.org);
  if (data.employees) saveEmployees(data.employees);
  if (data.skills) saveSkills(data.skills);
  if (data.employeeSkills) saveEmployeeSkills(data.employeeSkills);
  if (data.assessments) saveAssessments(data.assessments);
}

export function clearAllData(): void {
  if (!isClient()) return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  orgCache = undefined;
  employeesCache = undefined;
  skillsCache = undefined;
  employeeSkillsCache = undefined;
  assessmentsCache = undefined;
}
