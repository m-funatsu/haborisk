'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

// ── Types ──────────────────────────────────────────
interface TeamMember {
  id: string;
  name: string;
  skills: Record<string, number>; // skill name -> rating 1-5
}

interface SkillAnalysis {
  skill: string;
  holders: string[];
  avgRating: number;
  maxRating: number;
  busFactor: number;
  isSPOF: boolean;
}

interface CrossTrainPriority {
  skill: string;
  targetMember: string;
  urgency: number; // 0-100
  reason: string;
}

const STORAGE_KEY = 'haborisk-skill-matrix';

const DEFAULT_SKILLS = [
  'フロントエンド',
  'バックエンド',
  'インフラ',
  'データベース',
  'セキュリティ',
  'プロジェクト管理',
  'コミュニケーション',
  'ドメイン知識',
  'リーダーシップ',
  'テスト・QA',
];

const RATING_COLORS = ['#1f2937', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const RATING_LABELS = ['-', '初心者', '基礎', '中級', '上級', '専門家'];

// ── Analysis Logic ─────────────────────────────────
function analyzeSkills(members: TeamMember[], skills: string[]): SkillAnalysis[] {
  return skills.map((skill) => {
    const holders: string[] = [];
    let totalRating = 0;
    let maxRating = 0;
    let competentCount = 0; // rating >= 3

    for (let i = 0; i < members.length; i++) {
      const rating = members[i].skills[skill] || 0;
      if (rating > 0) {
        holders.push(members[i].name);
        totalRating += rating;
        if (rating > maxRating) maxRating = rating;
        if (rating >= 3) competentCount++;
      }
    }

    const avgRating = holders.length > 0 ? Math.round((totalRating / holders.length) * 10) / 10 : 0;

    // Bus factor: number of competent (>= 3) people who could take over
    const busFactor = competentCount;
    const isSPOF = competentCount <= 1 && holders.length > 0;

    return { skill, holders, avgRating, maxRating, busFactor, isSPOF };
  });
}

function calculateCrossTrainingPriorities(
  members: TeamMember[],
  skills: string[],
  analyses: SkillAnalysis[]
): CrossTrainPriority[] {
  const priorities: CrossTrainPriority[] = [];

  for (let a = 0; a < analyses.length; a++) {
    const analysis = analyses[a];
    if (analysis.busFactor > 2) continue; // well-covered

    // Find members who DON'T have this skill at adequate level
    for (let m = 0; m < members.length; m++) {
      const member = members[m];
      const currentRating = member.skills[analysis.skill] || 0;
      if (currentRating >= 3) continue; // already competent

      // Calculate urgency based on bus factor, SPOF status, and member's other skills
      let urgency = 0;

      // SPOF boost
      if (analysis.isSPOF) urgency += 40;

      // Low bus factor boost
      if (analysis.busFactor === 0) urgency += 30;
      else if (analysis.busFactor === 1) urgency += 20;
      else if (analysis.busFactor === 2) urgency += 10;

      // Member has related skills (learning potential)
      let relatedSkillCount = 0;
      for (let s = 0; s < skills.length; s++) {
        if (skills[s] !== analysis.skill && (member.skills[skills[s]] || 0) >= 3) {
          relatedSkillCount++;
        }
      }
      urgency += Math.min(20, relatedSkillCount * 5);

      // Skill importance (more holders = more important)
      urgency += Math.min(10, analysis.holders.length * 2);

      urgency = Math.min(100, urgency);

      let reason = '';
      if (analysis.isSPOF) {
        reason = analysis.skill + 'は単一障害点（SPOF）です';
      } else if (analysis.busFactor <= 1) {
        reason = 'バスファクターが' + analysis.busFactor + 'と危険な水準です';
      } else {
        reason = 'チームの冗長性を高めるため';
      }

      if (urgency > 20) {
        priorities.push({
          skill: analysis.skill,
          targetMember: member.name,
          urgency,
          reason,
        });
      }
    }
  }

  priorities.sort((a, b) => b.urgency - a.urgency);
  return priorities.slice(0, 15);
}

function calculateTeamBusFactor(analyses: SkillAnalysis[]): number {
  if (analyses.length === 0) return 0;
  let minBus = Infinity;
  for (let i = 0; i < analyses.length; i++) {
    if (analyses[i].holders.length > 0 && analyses[i].busFactor < minBus) {
      minBus = analyses[i].busFactor;
    }
  }
  return minBus === Infinity ? 0 : minBus;
}

// ── SVG Heatmap ────────────────────────────────────
function HeatmapSVG({
  members,
  skills,
}: {
  members: TeamMember[];
  skills: string[];
}) {
  if (members.length === 0 || skills.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-12">
        メンバーとスキルを追加してヒートマップを表示
      </div>
    );
  }

  const cellSize = 36;
  const labelW = 120;
  const topLabelH = 100;
  const svgW = labelW + skills.length * cellSize + 20;
  const svgH = topLabelH + members.length * cellSize + 20;

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={svgH} viewBox={'0 0 ' + svgW + ' ' + svgH}>
        {/* Skill labels (rotated) */}
        {skills.map((skill, si) => (
          <text
            key={'sl-' + si}
            x={labelW + si * cellSize + cellSize / 2}
            y={topLabelH - 8}
            textAnchor="end"
            fill="#9ca3af"
            fontSize="10"
            transform={'rotate(-45,' + (labelW + si * cellSize + cellSize / 2) + ',' + (topLabelH - 8) + ')'}
          >
            {skill}
          </text>
        ))}

        {/* Member rows */}
        {members.map((member, mi) => {
          const y = topLabelH + mi * cellSize;
          return (
            <g key={'mr-' + mi}>
              <text x={labelW - 8} y={y + cellSize / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize="11">
                {member.name.length > 10 ? member.name.slice(0, 10) + '..' : member.name}
              </text>
              {skills.map((skill, si) => {
                const rating = member.skills[skill] || 0;
                const x = labelW + si * cellSize;
                return (
                  <g key={'c-' + mi + '-' + si}>
                    <rect
                      x={x + 1}
                      y={y + 1}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      rx="4"
                      fill={RATING_COLORS[rating]}
                      opacity="0.85"
                    />
                    {rating > 0 && (
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + 4}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {rating}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Bus Factor Bar Chart ───────────────────────────
function BusFactorChart({ analyses }: { analyses: SkillAnalysis[] }) {
  const filtered = analyses.filter((a) => a.holders.length > 0);
  if (filtered.length === 0) return null;

  const barH = 24;
  const gap = 6;
  const labelW = 120;
  const chartW = 300;
  const maxBus = Math.max(1, Math.max.apply(null, filtered.map((a) => a.busFactor)));
  const svgH = filtered.length * (barH + gap) + 10;

  return (
    <svg width="100%" viewBox={'0 0 ' + (labelW + chartW + 60) + ' ' + svgH}>
      {filtered.map((a, i) => {
        const y = i * (barH + gap) + 5;
        const w = (a.busFactor / maxBus) * chartW;
        const color = a.isSPOF ? '#ef4444' : a.busFactor <= 2 ? '#eab308' : '#22c55e';
        return (
          <g key={i}>
            <text x={labelW - 8} y={y + barH / 2 + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
              {a.skill}
            </text>
            <rect x={labelW} y={y} width={chartW} height={barH} rx="4" fill="#1f2937" />
            <rect x={labelW} y={y} width={Math.max(4, w)} height={barH} rx="4" fill={color} opacity="0.8" />
            <text x={labelW + Math.max(4, w) + 6} y={y + barH / 2 + 4} fill="#d1d5db" fontSize="10">
              {a.busFactor}
              {a.isSPOF ? ' (SPOF)' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────
export default function SkillMatrixPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [skills, setSkills] = useState<string[]>(DEFAULT_SKILLS);
  const [newMemberName, setNewMemberName] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.members) setMembers(data.members);
        if (data.skills) setSkills(data.skills);
      }
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(
    (m: TeamMember[], s: string[]) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ members: m, skills: s }));
    },
    []
  );

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const member: TeamMember = {
      id: Date.now().toString(36),
      name: newMemberName.trim(),
      skills: {},
    };
    const updated = members.concat([member]);
    setMembers(updated);
    save(updated, skills);
    setNewMemberName('');
  };

  const removeMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    save(updated, skills);
    if (editingMember === id) setEditingMember(null);
  };

  const addSkill = () => {
    if (!newSkillName.trim() || skills.includes(newSkillName.trim())) return;
    const updated = skills.concat([newSkillName.trim()]);
    setSkills(updated);
    save(members, updated);
    setNewSkillName('');
  };

  const removeSkill = (skill: string) => {
    const updated = skills.filter((s) => s !== skill);
    setSkills(updated);
    // Also clean member skills
    const updatedMembers = members.map((m) => {
      const newSkills: Record<string, number> = {};
      const keys = Object.keys(m.skills);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== skill) {
          newSkills[keys[i]] = m.skills[keys[i]];
        }
      }
      return { ...m, skills: newSkills };
    });
    setMembers(updatedMembers);
    save(updatedMembers, updated);
  };

  const updateSkillRating = (memberId: string, skill: string, rating: number) => {
    const updated = members.map((m) => {
      if (m.id !== memberId) return m;
      const newSkills = Object.assign({}, m.skills);
      if (rating === 0) {
        delete newSkills[skill];
      } else {
        newSkills[skill] = rating;
      }
      return { ...m, skills: newSkills };
    });
    setMembers(updated);
    save(updated, skills);
  };

  const analyses = useMemo(() => analyzeSkills(members, skills), [members, skills]);
  const spofSkills = useMemo(() => analyses.filter((a) => a.isSPOF), [analyses]);
  const teamBusFactor = useMemo(() => calculateTeamBusFactor(analyses), [analyses]);
  const crossTraining = useMemo(
    () => calculateCrossTrainingPriorities(members, skills, analyses),
    [members, skills, analyses]
  );

  const inputClass =
    'bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">スキルマトリクス可視化</h1>
          <p className="text-gray-400">
            チームのスキル分布を可視化し、単一障害点（SPOF）の特定とクロストレーニング優先度を算出します。
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">チームメンバー</div>
            <div className="text-2xl font-bold text-blue-400">{members.length}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">スキル数</div>
            <div className="text-2xl font-bold text-purple-400">{skills.length}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">チームバスファクター</div>
            <div
              className="text-2xl font-bold"
              style={{ color: teamBusFactor <= 1 ? '#ef4444' : teamBusFactor <= 2 ? '#eab308' : '#22c55e' }}
            >
              {teamBusFactor}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">SPOF スキル</div>
            <div className="text-2xl font-bold" style={{ color: spofSkills.length > 0 ? '#ef4444' : '#22c55e' }}>
              {spofSkills.length}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-lg font-semibold mb-4">スキルヒートマップ</h2>
          <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
            {[1, 2, 3, 4, 5].map((r) => (
              <div key={r} className="flex items-center gap-1">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ backgroundColor: RATING_COLORS[r] }}
                />
                <span>{r} {RATING_LABELS[r]}</span>
              </div>
            ))}
          </div>
          <HeatmapSVG members={members} skills={skills} />
        </div>

        {/* Two-column: Bus Factor + SPOF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">スキル別バスファクター</h2>
            <BusFactorChart analyses={analyses} />
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">単一障害点（SPOF）</h2>
            {spofSkills.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                SPOFは検出されませんでした
              </p>
            ) : (
              <div className="space-y-3">
                {spofSkills.map((a) => (
                  <div key={a.skill} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="font-medium text-sm text-red-400">{a.skill}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      担当者: {a.holders.join(', ') || 'なし'} | 平均評価: {a.avgRating}
                    </div>
                    <div className="text-xs text-red-300 mt-1">
                      この人物が不在の場合、チームはこのスキルを喪失します
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cross-training Priorities */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h2 className="text-lg font-semibold mb-4">クロストレーニング優先度</h2>
          {crossTraining.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">
              優先度の高いクロストレーニングはありません
            </p>
          ) : (
            <div className="space-y-2">
              {crossTraining.map((ct, i) => {
                const color =
                  ct.urgency >= 70 ? '#ef4444' : ct.urgency >= 50 ? '#f97316' : ct.urgency >= 30 ? '#eab308' : '#22c55e';
                return (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                    <div
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {ct.urgency}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-blue-400">{ct.targetMember}</span>
                        <span className="text-gray-500 mx-2">に</span>
                        <span className="font-medium text-purple-400">{ct.skill}</span>
                        <span className="text-gray-500 ml-2">を教育</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{ct.reason}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: ct.urgency + '%', backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Member / Skill */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">メンバー管理</h2>
            <div className="flex gap-2 mb-4">
              <input
                className={inputClass + ' flex-1'}
                placeholder="メンバー名"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addMember(); }}
              />
              <button
                onClick={addMember}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                追加
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setEditingMember(editingMember === m.id ? null : m.id)}
                    className="text-sm text-left flex-1 hover:text-blue-400 transition-colors"
                  >
                    {m.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({Object.keys(m.skills).length}スキル)
                    </span>
                  </button>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-gray-500 hover:text-red-400 text-sm px-2 transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">スキル管理</h2>
            <div className="flex gap-2 mb-4">
              <input
                className={inputClass + ' flex-1'}
                placeholder="スキル名"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg text-xs"
                >
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Rating Editor */}
        {editingMember && (
          <div className="bg-gray-900 rounded-xl p-6 border border-blue-800 mb-8">
            <h2 className="text-lg font-semibold mb-4">
              スキル評価: {members.find((m) => m.id === editingMember)?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => {
                const member = members.find((m) => m.id === editingMember);
                const currentRating = member?.skills[skill] || 0;
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-28 truncate">{skill}</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateSkillRating(editingMember, skill, r)}
                          className="w-8 h-8 rounded text-xs font-medium transition-all"
                          style={{
                            backgroundColor: r === currentRating ? RATING_COLORS[r] : '#374151',
                            color: r === currentRating ? '#fff' : '#9ca3af',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
