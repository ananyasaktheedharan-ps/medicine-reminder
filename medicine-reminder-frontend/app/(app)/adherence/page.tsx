"use client";

import { useState } from "react";
import { addDays, formatDateLong, todayStr } from "@/lib/dates";
import { effectiveStatus, useApp } from "@/lib/store";

interface DayStat {
  date: string;
  taken: number;
  missed: number;
  total: number;
}

export default function AdherencePage() {
  const { dosesForDate, now, activeProfile } = useApp();
  const [range, setRange] = useState<7 | 30>(7);
  const today = todayStr();

  const days: DayStat[] = [];
  for (let i = range - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    let taken = 0;
    let missed = 0;
    let total = 0;
    for (const d of dosesForDate(date)) {
      const s = effectiveStatus(d, now);
      if (s === "upcoming" || s === "due" || s === "snoozed") continue; // not yet decided
      total += 1;
      if (s === "taken") taken += 1;
      else missed += 1; // missed or overdue
    }
    days.push({ date, taken, missed, total });
  }

  const totals = days.reduce(
    (acc, d) => ({ taken: acc.taken + d.taken, missed: acc.missed + d.missed, total: acc.total + d.total }),
    { taken: 0, missed: 0, total: 0 },
  );
  const pct = totals.total === 0 ? null : Math.round((totals.taken / totals.total) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Adherence</h1>
          <p className="text-sm text-slate-600">
            How consistently {activeProfile?.isSelf ? "you take" : `${activeProfile?.name} takes`} medicines.
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={range === r ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Adherence</p>
          <p className="mt-1 text-3xl font-bold text-brand-700">{pct === null ? "—" : `${pct}%`}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Taken</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{totals.taken}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Missed</p>
          <p className="mt-1 text-3xl font-bold text-red-700">{totals.missed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total doses</p>
          <p className="mt-1 text-3xl font-bold">{totals.total}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Daily breakdown</h2>
        {totals.total === 0 ? (
          <p className="text-sm text-slate-600">No dose history yet for this period.</p>
        ) : (
          <ul className="space-y-2">
            {[...days].reverse().map((d) => {
              const p = d.total === 0 ? 0 : Math.round((d.taken / d.total) * 100);
              return (
                <li key={d.date} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-slate-600">{formatDateLong(d.date)}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
                    <div className={`h-full ${p >= 80 ? "bg-green-500" : p >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${d.total === 0 ? 0 : p}%` }} />
                  </div>
                  <span className="w-24 shrink-0 text-right text-slate-700">
                    {d.total === 0 ? "—" : `${d.taken}/${d.total} (${p}%)`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
