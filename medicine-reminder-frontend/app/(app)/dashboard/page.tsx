"use client";

import Link from "next/link";
import DoseRow from "@/components/DoseRow";
import { addDays, todayStr } from "@/lib/dates";
import { effectiveStatus, useApp } from "@/lib/store";

export default function DashboardPage() {
  const { user, activeProfile, medicines, dosesForDate, now, notificationsEnabled, enableNotifications } =
    useApp();

  const today = todayStr();
  const doses = dosesForDate(today);
  const statuses = doses.map((d) => effectiveStatus(d, now));
  const taken = statuses.filter((s) => s === "taken").length;
  const pending = statuses.filter((s) => s === "due" || s === "overdue" || s === "snoozed" || s === "upcoming").length;
  const missed = statuses.filter((s) => s === "missed").length;
  const next = doses.find((d) => {
    const s = effectiveStatus(d, now);
    return s === "upcoming" || s === "due" || s === "snoozed";
  });

  // 7-day adherence
  let total = 0;
  let takenWeek = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, -i);
    for (const d of dosesForDate(date)) {
      const s = effectiveStatus(d, now);
      if (s === "upcoming") continue;
      total += 1;
      if (s === "taken") takenWeek += 1;
    }
  }
  const adherence = total === 0 ? null : Math.round((takenWeek / total) * 100);

  const stats = [
    { label: "Medicines", value: medicines.length, cls: "text-slate-900" },
    { label: "Taken today", value: taken, cls: "text-green-700" },
    { label: "Pending today", value: pending, cls: "text-blue-700" },
    { label: "Missed today", value: missed, cls: "text-red-700" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hello, {user?.name.split(" ")[0]} 👋</h1>
        <p className="text-sm text-slate-600">
          Showing {activeProfile?.isSelf ? "your" : `${activeProfile?.name}'s`} medicines for today.
        </p>
      </div>

      {!notificationsEnabled && typeof Notification !== "undefined" && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            Turn on browser notifications so you are alerted when a dose is due.
          </p>
          <button className="btn-primary btn-sm" onClick={enableNotifications}>
            Enable notifications
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <p className="text-sm text-slate-500">Next dose</p>
          {next ? (
            <p className="mt-1 text-lg font-semibold">
              {next.medicine.name} <span className="text-slate-500">({next.medicine.dosage})</span> at{" "}
              {new Date(next.scheduledAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold">No more doses scheduled today 🎉</p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">7-day adherence</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">{adherence === null ? "—" : `${adherence}%`}</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today&apos;s doses</h2>
          <Link href="/schedule" className="text-sm font-semibold text-brand-700 hover:underline">
            Full schedule →
          </Link>
        </div>
        {doses.length === 0 ? (
          <div className="card text-center text-sm text-slate-600">
            No doses scheduled today.{" "}
            <Link href="/medicines" className="font-semibold text-brand-700 hover:underline">
              Add a medicine
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {doses.map((d) => (
              <DoseRow key={d.key} item={d} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
