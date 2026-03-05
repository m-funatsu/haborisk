"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { Employee } from "@/types";

const EMPLOYMENT_TYPE_LABELS: Record<Employee["employmentType"], string> = {
  full_time: "正社員",
  part_time: "パート",
  contract: "契約社員",
  dispatch: "派遣社員",
};

const INITIAL_FORM: Omit<Employee, "id" | "createdAt"> = {
  employeeCode: "",
  name: "",
  department: "",
  position: "",
  employmentType: "full_time",
  birthYear: 1990,
  hireDate: new Date().toISOString().split("T")[0],
  isKeyPerson: false,
  resignationDate: null,
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(() => []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [filter, setFilter] = useState<"all" | "active" | "resigned">("all");
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean; onConfirm: () => void}>({isOpen: false, onConfirm: () => {}});

  const loadEmployees = useCallback(() => {
    seedDemoData();
    setEmployees(getEmployees());
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = employees.filter((e) => {
    if (filter === "active") return !e.resignationDate;
    if (filter === "resigned") return !!e.resignationDate;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = employees.find((emp) => emp.id === editingId);
      if (existing) {
        updateEmployee({ ...existing, ...form });
      }
    } else {
      const newEmployee: Employee = {
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      addEmployee(newEmployee);
    }
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
    loadEmployees();
  };

  const handleEdit = (employee: Employee) => {
    setForm({
      employeeCode: employee.employeeCode,
      name: employee.name,
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      birthYear: employee.birthYear,
      hireDate: employee.hireDate,
      isKeyPerson: employee.isKeyPerson,
      resignationDate: employee.resignationDate,
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: () => {
        deleteEmployee(id);
        loadEmployees();
        setConfirmDialog({ isOpen: false, onConfirm: () => {} });
      },
    });
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const activeCount = employees.filter((e) => !e.resignationDate).length;
  const resignedCount = employees.filter((e) => !!e.resignationDate).length;

  return (
    <div className="flex flex-col pb-4" data-testid="employees-page">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">従業員管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeCount}名在籍 / {resignedCount}名退職済
            </p>
          </div>
          <button
            onClick={() => {
              setForm(INITIAL_FORM);
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            data-testid="add-employee-btn"
          >
            追加
          </button>
        </div>
      </div>

      <div className="px-6 pb-3">
        <div className="flex gap-2">
          {(["all", "active", "resigned"] as const).map((f) => {
            const labels = { all: "全員", active: "在籍", resigned: "退職済" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                data-testid={`filter-${f}`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {showForm ? (
        <div className="px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
            data-testid="employee-form"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">
              {editingId ? "従業員を編集" : "新規従業員登録"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">氏名 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">社員番号</label>
                <input
                  type="text"
                  value={form.employeeCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, employeeCode: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">部署 *</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-department"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">役職</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">雇用形態</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm((prev) => ({ ...prev, employmentType: e.target.value as Employee["employmentType"] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">生年</label>
                <input
                  type="number"
                  value={form.birthYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, birthYear: Number(e.target.value) }))}
                  min={1940}
                  max={2010}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-birthyear"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">入社日</label>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, hireDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-hiredate"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">退職日</label>
                <input
                  type="date"
                  value={form.resignationDate ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, resignationDate: e.target.value || null }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isKeyPerson"
                  checked={form.isKeyPerson}
                  onChange={(e) => setForm((prev) => ({ ...prev, isKeyPerson: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="input-keyperson"
                />
                <label htmlFor="isKeyPerson" className="text-sm text-gray-700">キーパーソン（重要人材）</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                data-testid="submit-employee"
              >
                {editingId ? "更新" : "登録"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                data-testid="cancel-employee"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="px-6 py-2">
        <div className="flex flex-col gap-2">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              従業員データがありません
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className={`bg-white rounded-xl border p-4 ${
                  employee.resignationDate
                    ? "border-gray-200 opacity-60"
                    : "border-gray-100"
                }`}
                data-testid="employee-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{employee.name}</span>
                      {employee.isKeyPerson ? (
                        <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded font-medium">KEY</span>
                      ) : null}
                      {employee.resignationDate ? (
                        <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">退職済</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{employee.department}</span>
                      <span>-</span>
                      <span>{employee.position}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                      <span>{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</span>
                      <span>{employee.birthYear}年生</span>
                      <span>入社: {employee.hireDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      data-testid="edit-employee"
                      title="編集"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      data-testid="delete-employee"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="削除の確認"
        message="この従業員を削除してもよろしいですか？この操作は元に戻せません。"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, onConfirm: () => {} })}
      />
    </div>
  );
}
