"use client";

import type { DoseItem } from "@/lib/types";
import { formatTime } from "@/lib/dates";
import { effectiveStatus, useApp } from "@/lib/store";
import StatusBadge from "./StatusBadge";

export default function DoseRow({ item, readOnly = false }: { item: DoseItem; readOnly?: boolean }) {
  const { now, setDoseStatus, snoozeDose, resetDose } = useApp();
  const status = effectiveStatus(item, now);
  const done = status === "taken" || status === "missed";

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="w-20 text-sm font-semibold text-slate-700">{formatTime(item.time)}</div>
        <div>
          <p className="font-semibold text-slate-900">{item.medicine.name}</p>
          <p className="text-xs text-slate-500">
            {item.medicine.dosage} · {item.medicine.form}
            {item.medicine.notes ? ` · ${item.medicine.notes}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={status} />
        {!readOnly &&
          (done ? (
            <button className="btn-secondary btn-sm" onClick={() => resetDose(item)}>
              Undo
            </button>
          ) : (
            <>
              <button className="btn-primary btn-sm" onClick={() => setDoseStatus(item, "taken")}>
                Taken
              </button>
              <button className="btn-secondary btn-sm" onClick={() => snoozeDose(item, 10)}>
                Snooze 10m
              </button>
              <button className="btn-secondary btn-sm" onClick={() => setDoseStatus(item, "missed")}>
                Missed
              </button>
            </>
          ))}
      </div>
    </li>
  );
}
