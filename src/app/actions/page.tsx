"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrganization,
  getEmployees,
  getEmployeeSkills,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import { assessRisk } from "@/lib/risk";
import type { ActionItem } from "@/types";

const CATEGORY_LABELS: Record<ActionItem["category"], string> = {
  hiring: "採用",
  dx: "DX・自動化",
  training: "研修・育成",
  outsourcing: "外注",
  succession: "事業承継",
};

const CATEGORY_COLORS: Record<ActionItem["category"], string> = {
  hiring: "bg-blue-100 text-blue-700",
  dx: "bg-purple-100 text-purple-700",
  training: "bg-green-100 text-green-700",
  outsourcing: "bg-orange-100 text-orange-700",
  succession: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<ActionItem["priority"], string> = {
  urgent: "緊急",
  high: "高",
  medium: "中",
  low: "低",
};

const PRIORITY_COLORS: Record<ActionItem["priority"], string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-gray-400 text-white",
};

const STATUS_LABELS: Record<ActionItem["status"], string> = {
  proposed: "提案中",
  in_progress: "実施中",
  completed: "完了",
  dismissed: "見送り",
};

type FilterCategory = "all" | ActionItem["category"];

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>(() => []);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");

  const loadActions = useCallback(() => {
    seedDemoData();
    const org = getOrganization();
    const employees = getEmployees();
    const employeeSkills = getEmployeeSkills();
    const assessment = assessRisk(org, employees, employeeSkills);
    setActions(assessment.recommendations);
  }, []);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  const updateStatus = (id: string, newStatus: ActionItem["status"]) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filteredActions =
    filterCategory === "all"
      ? actions
      : actions.filter((a) => a.category === filterCategory);

  const urgentCount = actions.filter((a) => a.priority === "urgent").length;
  const inProgressCount = actions.filter(
    (a) => a.status === "in_progress"
  ).length;

  return (
    <div className="flex flex-col pb-4" data-testid="actions-page">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-gray-900">アクションプラン</h1>
        <p className="text-sm text-gray-500 mt-1">
          リスク診断に基づく改善施策
        </p>
      </div>

      {/* Summary */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-xl font-bold text-gray-900">
              {actions.length}
            </div>
            <div className="text-[10px] text-gray-500">総提案数</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
            <div className="text-xl font-bold text-red-600">{urgentCount}</div>
            <div className="text-[10px] text-red-500">緊急対応</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
            <div className="text-xl font-bold text-blue-600">
              {inProgressCount}
            </div>
            <div className="text-[10px] text-blue-500">実施中</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-6 pb-4">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            すべて
          </button>
          {(Object.keys(CATEGORY_LABELS) as ActionItem["category"][]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                data-testid={`filter-${cat}`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Action List */}
      <div className="px-6">
        <div className="flex flex-col gap-3">
          {filteredActions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              アクションプランがありません
            </div>
          ) : (
            filteredActions.map((action) => (
              <div
                key={action.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                data-testid="action-card"
              >
                {/* Header */}
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      PRIORITY_COLORS[action.priority]
                    }`}
                  >
                    {PRIORITY_LABELS[action.priority]}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      CATEGORY_COLORS[action.category]
                    }`}
                  >
                    {CATEGORY_LABELS[action.category]}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-gray-900">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {action.description}
                </p>

                {/* Cost & Timeline */}
                <div className="flex gap-4 mt-3 text-[11px] text-gray-400">
                  <div>
                    <span className="text-gray-500">費用: </span>
                    {action.estimatedCost}
                  </div>
                  <div>
                    <span className="text-gray-500">期間: </span>
                    {action.estimatedTimeline}
                  </div>
                </div>

                {/* Status Controls */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 mr-1">
                    ステータス:
                  </span>
                  {(
                    ["proposed", "in_progress", "completed", "dismissed"] as const
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(action.id, status)}
                      className={`text-[10px] px-2 py-1 rounded transition-colors ${
                        action.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                      data-testid={`status-${status}`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
