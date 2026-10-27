"use client";

import { useState } from "react";
import DoseRow from "@/components/DoseRow";
import { addDays, formatDateLong, todayStr } from "@/lib/dates";
import { useApp } from "@/lib/store";

export default function SchedulePage() {
  const { dosesForDate } = useApp();
  const today = todayStr();
  const [date, setDate] = useState(today);

  const doses = dosesForDate(date);
  // Logging is allowed for today and past days; future days are read-only.
  const readOnly = date > today;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-sm text-slate-600">Browse and log doses by day.</p>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm" onClick={() => setDate((d) => addDays(d, -1))}>
            ← Prev
          </button>
          <button className="btn-secondary btn-sm" onClick={() => setDate(today)} disabled={date === today}>
            Today
          </button>
          <button className="btn-secondary btn-sm" onClick={() => setDate((d) => addDays(d, 1))}>
            Next →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{formatDateLong(date)}</span>
          <input type="date" className="input w-auto" value={date} aria-label="Pick a date"
            onChange={(e) => e.target.value && setDate(e.target.value)} />
        </div>
      </div>

      {doses.length === 0 ? (
        <div className="card text-center text-sm text-slate-600">No doses scheduled for this day.</div>
      ) : (
        <ul className="space-y-3">
          {doses.map((d) => (
            <DoseRow key={d.key} item={d} readOnly={readOnly} />
          ))}
        </ul>
      )}
    </div>
  );
}
