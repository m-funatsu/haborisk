"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const MAIN_NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", icon: "dashboard" },
  { href: "/employees", label: "従業員", icon: "employees" },
  { href: "/advisory", label: "総合分析", icon: "advisory" },
] as const;

const MORE_NAV_ITEMS = [
  { href: "/assessment", label: "リスク診断" },
  { href: "/analysis", label: "詳細分析" },
  { href: "/actions", label: "アクションプラン" },
  { href: "/scenario", label: "対策シミュレーション" },
  { href: "/attrition-cost", label: "離職コスト分析" },
  { href: "/skill-gap", label: "スキルギャップ" },
  { href: "/salary-benchmark", label: "給与ベンチマーク" },
  { href: "/market-data", label: "労働市場データ" },
  { href: "/settings", label: "設定" },
] as const;

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const color = active ? "text-blue-600" : "text-gray-400";

  switch (icon) {
    case "dashboard":
      return (
        <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "employees":
      return (
        <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "advisory":
      return (
        <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "more":
      return (
        <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Don't show nav on landing page
  if (pathname === "/") return null;

  const isMoreActive = MORE_NAV_ITEMS.some((item) => pathname.startsWith(item.href));

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMore]);

  // Close menu on route change
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  return (
    <>
      {/* More menu overlay */}
      {showMore ? (
        <div className="fixed inset-0 bg-black/20 z-40" aria-hidden="true" />
      ) : null}

      {/* More menu panel */}
      {showMore ? (
        <div
          ref={menuRef}
          className="fixed bottom-16 left-0 right-0 z-50 max-w-lg mx-auto"
        >
          <div className="mx-4 mb-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">メニュー</h3>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto">
              {MORE_NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setShowMore(false)}
                  >
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-3 flex-shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 mr-3 flex-shrink-0" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" data-testid="bottom-nav">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[64px] transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
                data-testid={`nav-${item.href.slice(1)}`}
              >
                <NavIcon icon={item.icon} active={isActive} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore((prev) => !prev)}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[64px] transition-colors ${
              isMoreActive || showMore ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
            data-testid="nav-more"
          >
            <NavIcon icon="more" active={isMoreActive || showMore} />
            <span className="text-[10px] font-medium leading-tight">その他</span>
          </button>
        </div>
      </nav>
    </>
  );
}
