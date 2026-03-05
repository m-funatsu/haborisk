export interface Organization {
  id: string;
  name: string;
  industryCode: string;
  industryName: string;
  prefecture: string;
  foundedYear: number;
  ceoAge: number;
  hasSuccessor: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  employmentType: "full_time" | "part_time" | "contract" | "dispatch";
  birthYear: number;
  hireDate: string;
  isKeyPerson: boolean;
  resignationDate: string | null;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "technical" | "management" | "customer" | "compliance";
  criticality: "critical" | "important" | "nice_to_have";
  createdAt: string;
}

export interface EmployeeSkill {
  employeeId: string;
  skillId: string;
  proficiency: number; // 1-5
  isPrimaryOwner: boolean;
}

export interface RiskAssessment {
  id: string;
  overallScore: number; // 0-100
  dimensionScores: {
    age: number;
    keyPerson: number;
    turnover: number;
    seasonal: number;
    succession: number;
  };
  departmentScores: Record<string, number>;
  recommendations: ActionItem[];
  assessedAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: "hiring" | "dx" | "training" | "outsourcing" | "succession";
  priority: "urgent" | "high" | "medium" | "low";
  estimatedCost: string;
  estimatedTimeline: string;
  status: "proposed" | "in_progress" | "completed" | "dismissed";
}

export interface IndustryBenchmark {
  industryCode: string;
  industryName: string;
  avgTurnoverRate: number;
  avgEmployeeAge: number;
  shortageRate: number;
  bankruptcyRiskIndex: number;
}
