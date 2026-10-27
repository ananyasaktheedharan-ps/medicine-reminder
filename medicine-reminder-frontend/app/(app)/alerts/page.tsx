"use client";

import DoseRow from "@/components/DoseRow";
import { todayStr } from "@/lib/dates";
import { effectiveStatus, useApp } from "@/lib/store";

export default function AlertsPage() {
  const { dosesForDate, now, notificationsEnabled, enableNotifications } = useApp();
  const today = dosesForDate(todayStr());

  const active = today.filter((d) => {
    const s = effectiveStatus(d, now);
    return s === "due" || s === "overdue";
  });
  const snoozed = today.filter((d) => effectiveStatus(d, now) === "snoozed");
  const missed = today.filter((d) => effectiveStatus(d, now) === "missed");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-slate-600">Doses that need your attention right now.</p>
      </div>

      {!notificationsEnabled && typeof Notification !== "undefined" && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">Browser notifications are off.</p>
          <button className="btn-primary btn-sm" onClick={enableNotifications}>
            Enable notifications
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Due or overdue ({active.length})</h2>
        {active.length === 0 ? (
          <div className="card text-center text-sm text-slate-600">You&apos;re all caught up ✅</div>
        ) : (
          <ul className="space-y-3">
            {active.map((d) => (
              <DoseRow key={d.key} item={d} />
            ))}
          </ul>
        )}
      </section>

      {snoozed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Snoozed ({snoozed.length})</h2>
          <ul className="space-y-3">
            {snoozed.map((d) => (
              <DoseRow key={d.key} item={d} />
            ))}
          </ul>
        </section>
      )}

      {missed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Missed today ({missed.length})</h2>
          <ul className="space-y-3">
            {missed.map((d) => (
              <DoseRow key={d.key} item={d} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
