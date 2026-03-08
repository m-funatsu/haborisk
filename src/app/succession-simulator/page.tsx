'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  position: string;
  employmentType: string;
  birthYear: number;
  hireDate: string;
  isKeyPerson: boolean;
  resignationDate: string | null;
  createdAt: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  criticality: string;
  createdAt: string;
}

interface EmployeeSkill {
  employeeId: string;
  skillId: string;
  proficiency: number;
  isPrimaryOwner: boolean;
}

interface ImpactNode {
  employee: Employee;
  impactLevel: number; // 1=direct, 2=secondary, etc.
  impactScore: number; // 0-100
  affectedSkills: { skill: Skill; dependencyStrength: number }[];
  canCover: boolean;
}

interface SimulationResult {
  departedEmployee: Employee;
  chain: ImpactNode[];
  totalRiskScore: number;
  businessStopRisk: number;
  criticalSkillsLost: Skill[];
  affectedDepartments: string[];
}

function calculateDependencyStrength(
  depEmployeeSkills: EmployeeSkill[],
  targetSkillId: string,
  departedIsPrimary: boolean,
  departedProficiency: number
): number {
  const depSkill = depEmployeeSkills.find(es => es.skillId === targetSkillId);
  if (!depSkill) return 0;

  let strength = 0;
  if (departedIsPrimary) strength += 40;
  strength += (departedProficiency / 5) * 30;
  const depProf = depSkill.proficiency;
  strength += ((5 - depProf) / 5) * 30;
  return Math.min(Math.round(strength), 100);
}

export default function SuccessionSimulatorPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [maxChainDepth, setMaxChainDepth] = useState(3);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const empRaw = localStorage.getItem('haborisk_v1_employees');
      const skillRaw = localStorage.getItem('haborisk_v1_skills');
      const esRaw = localStorage.getItem('haborisk_v1_employee_skills');
      if (empRaw) setEmployees(JSON.parse(empRaw));
      if (skillRaw) setSkills(JSON.parse(skillRaw));
      if (esRaw) setEmployeeSkills(JSON.parse(esRaw));
    } catch {
      // ignore
    }
  }, []);

  const activeEmployees = useMemo(
    () => employees.filter(e => !e.resignationDate),
    [employees]
  );

  const runSimulation = useCallback(() => {
    if (!selectedEmployeeId) return;

    const departed = activeEmployees.find(e => e.id === selectedEmployeeId);
    if (!departed) return;

    const departedSkills = employeeSkills.filter(es => es.employeeId === departed.id);
    const departedSkillIds = new Set(departedSkills.map(es => es.skillId));

    const chain: ImpactNode[] = [];
    const visited = new Set<string>([departed.id]);
    let currentDeparted: { id: string; skillIds: Set<string>; skills: EmployeeSkill[] }[] = [
      { id: departed.id, skillIds: departedSkillIds, skills: departedSkills },
    ];

    for (let level = 1; level <= maxChainDepth; level++) {
      const nextLevel: ImpactNode[] = [];

      for (const dep of currentDeparted) {
        for (const emp of activeEmployees) {
          if (visited.has(emp.id)) continue;

          const empSkills = employeeSkills.filter(es => es.employeeId === emp.id);
          const empSkillIds = new Set(empSkills.map(es => es.skillId));

          const sharedSkillIds = [...dep.skillIds].filter(sid => empSkillIds.has(sid));
          if (sharedSkillIds.length === 0) continue;

          const affectedSkills: { skill: Skill; dependencyStrength: number }[] = [];
          let totalStrength = 0;

          for (const sid of sharedSkillIds) {
            const skill = skills.find(s => s.id === sid);
            if (!skill) continue;
            const depSkill = dep.skills.find(es => es.skillId === sid);
            if (!depSkill) continue;

            const strength = calculateDependencyStrength(
              empSkills,
              sid,
              depSkill.isPrimaryOwner,
              depSkill.proficiency
            );

            if (strength > 20) {
              affectedSkills.push({ skill, dependencyStrength: strength });
              totalStrength += strength;
            }
          }

          if (affectedSkills.length === 0) continue;

          const avgStrength = totalStrength / affectedSkills.length;
          const impactScore = Math.min(Math.round(avgStrength * (1 - (level - 1) * 0.3)), 100);
          const canCover = empSkills.some(es => sharedSkillIds.includes(es.skillId) && es.proficiency >= 4);

          if (impactScore > 10) {
            nextLevel.push({
              employee: emp,
              impactLevel: level,
              impactScore,
              affectedSkills,
              canCover,
            });
            visited.add(emp.id);
          }
        }
      }

      nextLevel.sort((a, b) => b.impactScore - a.impactScore);
      chain.push(...nextLevel);

      currentDeparted = nextLevel.map(node => ({
        id: node.employee.id,
        skillIds: new Set(node.affectedSkills.map(as => as.skill.id)),
        skills: employeeSkills.filter(es => es.employeeId === node.employee.id),
      }));

      if (currentDeparted.length === 0) break;
    }

    const criticalSkillsLost = skills.filter(
      s => departedSkillIds.has(s.id) && s.criticality === 'critical'
    );

    const affectedDepts = [...new Set(chain.map(n => n.employee.department))];

    const totalRiskScore = Math.min(
      Math.round(
        (criticalSkillsLost.length * 20) +
        (chain.length * 5) +
        (departed.isKeyPerson ? 25 : 0) +
        (departedSkills.filter(es => es.isPrimaryOwner).length * 10)
      ),
      100
    );

    const businessStopRisk = Math.min(
      Math.round(
        (criticalSkillsLost.length * 25) +
        (chain.filter(n => n.impactScore >= 50).length * 15) +
        (departed.isKeyPerson ? 20 : 0)
      ),
      100
    );

    setSimulation({
      departedEmployee: departed,
      chain,
      totalRiskScore,
      businessStopRisk,
      criticalSkillsLost,
      affectedDepartments: affectedDepts,
    });
  }, [selectedEmployeeId, activeEmployees, employeeSkills, skills, maxChainDepth]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return { text: 'text-red-600', bg: 'bg-red-100 border-red-300', bar: 'bg-red-500' };
    if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-100 border-orange-300', bar: 'bg-orange-500' };
    return { text: 'text-green-600', bg: 'bg-green-100 border-green-300', bar: 'bg-green-500' };
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return '高リスク';
    if (score >= 40) return '中リスク';
    return '低リスク';
  };

  if (activeEmployees.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">従業員データがありません</h2>
          <p className="text-slate-500 text-sm">
            従業員、スキル、従業員スキルのデータを登録してください。シミュレーションには従業員間のスキル依存関係が必要です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">退職連鎖シミュレータ</h1>
          <p className="text-slate-600">
            任意の従業員の退職を仮定し、スキル依存による連鎖的な影響を分析します
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">退職を仮定する従業員</label>
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">選択してください</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}（{emp.department} / {emp.position}）{emp.isKeyPerson ? ' [KEY]' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                連鎖分析の深さ: <span className="font-bold">{maxChainDepth}段階</span>
              </label>
              <input
                type="range" min={1} max={5} value={maxChainDepth}
                onChange={e => setMaxChainDepth(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
            <div>
              <button
                onClick={runSimulation}
                disabled={!selectedEmployeeId}
                className="w-full px-6 py-2.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                シミュレーション実行
              </button>
            </div>
          </div>
        </div>

        {simulation && (
          <>
            {/* Risk Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className={`rounded-xl border p-5 text-center ${getRiskColor(simulation.totalRiskScore).bg}`}>
                <div className="text-xs font-medium text-slate-600 mb-1">総合リスクスコア</div>
                <div className={`text-3xl font-bold ${getRiskColor(simulation.totalRiskScore).text}`}>
                  {simulation.totalRiskScore}
                </div>
                <div className={`text-xs font-semibold mt-1 ${getRiskColor(simulation.totalRiskScore).text}`}>
                  {getRiskLabel(simulation.totalRiskScore)}
                </div>
              </div>
              <div className={`rounded-xl border p-5 text-center ${getRiskColor(simulation.businessStopRisk).bg}`}>
                <div className="text-xs font-medium text-slate-600 mb-1">業務停止リスク</div>
                <div className={`text-3xl font-bold ${getRiskColor(simulation.businessStopRisk).text}`}>
                  {simulation.businessStopRisk}
                </div>
                <div className={`text-xs font-semibold mt-1 ${getRiskColor(simulation.businessStopRisk).text}`}>
                  {getRiskLabel(simulation.businessStopRisk)}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
                <div className="text-xs text-slate-500 font-medium mb-1">影響を受ける従業員数</div>
                <div className="text-3xl font-bold text-slate-800">{simulation.chain.length}人</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
                <div className="text-xs text-slate-500 font-medium mb-1">影響部門数</div>
                <div className="text-3xl font-bold text-slate-800">{simulation.affectedDepartments.length}部門</div>
              </div>
            </div>

            {/* Departed Person Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">退職仮定: {simulation.departedEmployee.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">部門:</span>
                  <span className="ml-2 font-medium text-slate-800">{simulation.departedEmployee.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">役職:</span>
                  <span className="ml-2 font-medium text-slate-800">{simulation.departedEmployee.position}</span>
                </div>
                <div>
                  <span className="text-slate-500">キーパーソン:</span>
                  <span className={`ml-2 font-medium ${simulation.departedEmployee.isKeyPerson ? 'text-red-600' : 'text-slate-600'}`}>
                    {simulation.departedEmployee.isKeyPerson ? 'はい' : 'いいえ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">喪失クリティカルスキル:</span>
                  <span className="ml-2 font-bold text-red-600">{simulation.criticalSkillsLost.length}件</span>
                </div>
              </div>
              {simulation.criticalSkillsLost.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {simulation.criticalSkillsLost.map(s => (
                    <span key={s.id} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chain Visualization */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">退職連鎖の影響マップ</h2>

              {[...new Set(simulation.chain.map(n => n.impactLevel))].sort().map(level => {
                const nodesAtLevel = simulation.chain.filter(n => n.impactLevel === level);
                return (
                  <div key={level} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        level === 1 ? 'bg-red-500' : level === 2 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>
                        {level}次影響
                      </span>
                      <span className="text-sm text-slate-500">{nodesAtLevel.length}人に影響</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nodesAtLevel.map(node => {
                        const riskColors = getRiskColor(node.impactScore);
                        return (
                          <div key={node.employee.id} className={`border rounded-lg p-4 ${riskColors.bg}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium text-slate-800 text-sm">{node.employee.name}</div>
                                <div className="text-xs text-slate-500">{node.employee.department} / {node.employee.position}</div>
                              </div>
                              <div className={`text-xl font-bold ${riskColors.text}`}>{node.impactScore}</div>
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-2 mb-2">
                              <div
                                className={`h-full rounded-full ${riskColors.bar}`}
                                style={{ width: `${node.impactScore}%` }}
                              />
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {node.affectedSkills.slice(0, 4).map(as => (
                                <span key={as.skill.id} className="px-1.5 py-0.5 bg-white/80 text-slate-600 text-xs rounded">
                                  {as.skill.name}({as.dependencyStrength}%)
                                </span>
                              ))}
                              {node.affectedSkills.length > 4 && (
                                <span className="px-1.5 py-0.5 text-slate-500 text-xs">
                                  +{node.affectedSkills.length - 4}
                                </span>
                              )}
                            </div>
                            {node.canCover && (
                              <div className="mt-2 text-xs text-green-700 font-medium">
                                -- 代替カバー可能 --
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {simulation.chain.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  スキル依存関係が検出されませんでした。従業員スキルデータを確認してください。
                </div>
              )}
            </div>

            {/* Risk Score Visualization (SVG) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">リスクゲージ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: '総合リスクスコア', value: simulation.totalRiskScore },
                  { label: '業務停止リスク', value: simulation.businessStopRisk },
                ].map(gauge => {
                  const angle = (gauge.value / 100) * 180;
                  const rad = (angle - 180) * (Math.PI / 180);
                  const x = 100 + 70 * Math.cos(rad);
                  const y = 100 + 70 * Math.sin(rad);
                  const colors = getRiskColor(gauge.value);
                  return (
                    <div key={gauge.label} className="text-center">
                      <svg viewBox="0 0 200 120" className="w-48 h-auto mx-auto">
                        <path
                          d="M 30 100 A 70 70 0 0 1 170 100"
                          fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round"
                        />
                        <path
                          d="M 30 100 A 70 70 0 0 1 170 100"
                          fill="none"
                          stroke={gauge.value >= 70 ? '#ef4444' : gauge.value >= 40 ? '#f97316' : '#22c55e'}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${(gauge.value / 100) * 220} 220`}
                        />
                        <circle cx={x} cy={y} r="6" fill={gauge.value >= 70 ? '#ef4444' : gauge.value >= 40 ? '#f97316' : '#22c55e'} />
                        <text x="100" y="95" textAnchor="middle" className="fill-slate-800" fontSize="28" fontWeight="bold">
                          {gauge.value}
                        </text>
                      </svg>
                      <div className={`text-sm font-semibold ${colors.text}`}>{gauge.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
