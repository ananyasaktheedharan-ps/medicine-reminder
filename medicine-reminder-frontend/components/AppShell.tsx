"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { effectiveStatus, useApp } from "@/lib/store";
import { todayStr } from "@/lib/dates";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/medicines", label: "Medicines", icon: "💊" },
  { href: "/schedule", label: "Schedule", icon: "⏰" },
  { href: "/adherence", label: "Adherence", icon: "📊" },
  { href: "/family", label: "Family", icon: "👨‍👩‍👧" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user, logout, profiles, activeProfile, setActiveProfileId, dosesForDate, now } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">Loading…</div>
    );
  }

  const alertCount = dosesForDate(todayStr()).filter((d) => {
    const s = effectiveStatus(d, now);
    return s === "due" || s === "overdue";
  }).length;

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-bold text-brand-700">💊 MedicineReminder</span>
        <button className="btn-secondary btn-sm" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${menuOpen ? "block" : "hidden"} w-full shrink-0 border-r border-slate-200 bg-white p-4 lg:block lg:min-h-screen lg:w-64`}
      >
        <Link href="/dashboard" className="mb-6 hidden text-xl font-bold text-brand-700 lg:block">
          💊 MedicineReminder
        </Link>

        <div className="mb-5">
          <label className="label" htmlFor="profile-switch">Managing medicines for</label>
          <select
            id="profile-switch"
            className="input"
            value={activeProfile?.id ?? ""}
            onChange={(e) => setActiveProfileId(e.target.value)}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.isSelf ? `${p.name} (me)` : `${p.name} (${p.relation})`}
              </option>
            ))}
          </select>
        </div>

        <nav className="space-y-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-brand-50 text-brand-800" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>
                  <span className="mr-2">{l.icon}</span>
                  {l.label}
                </span>
                {l.href === "/alerts" && alertCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-slate-200 pt-4">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <button
            className="btn-secondary btn-sm mt-3 w-full"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
