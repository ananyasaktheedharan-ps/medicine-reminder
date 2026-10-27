"use client";

import { useState } from "react";
import MedicineForm from "@/components/MedicineForm";
import { formatTime } from "@/lib/dates";
import { useApp } from "@/lib/store";
import type { Medicine } from "@/lib/types";

export default function MedicinesPage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, activeProfile } = useApp();
  const [mode, setMode] = useState<"list" | "add" | { edit: Medicine }>("list");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Medicines</h1>
          <p className="text-sm text-slate-600">
            {activeProfile?.isSelf ? "Your" : `${activeProfile?.name}'s`} medicine list
          </p>
        </div>
        {mode === "list" && (
          <button className="btn-primary" onClick={() => setMode("add")}>
            + Add medicine
          </button>
        )}
      </div>

      {mode === "add" && (
        <MedicineForm
          onCancel={() => setMode("list")}
          onSubmit={(v) => {
            addMedicine(v);
            setMode("list");
          }}
        />
      )}

      {typeof mode === "object" && (
        <MedicineForm
          initial={mode.edit}
          onCancel={() => setMode("list")}
          onSubmit={(v) => {
            updateMedicine(mode.edit.id, v);
            setMode("list");
          }}
        />
      )}

      {medicines.length === 0 ? (
        <div className="card text-center text-sm text-slate-600">
          No medicines yet. Click <strong>Add medicine</strong> to get started.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {medicines.map((m) => (
            <li key={m.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-slate-600">
                    {m.dosage} · {m.form}
                  </p>
                </div>
                <span className="text-2xl">💊</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.times.map((t) => (
                  <span key={t} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                    {formatTime(t)}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {m.startDate}
                {m.endDate ? ` → ${m.endDate}` : " → ongoing"}
              </p>
              {m.notes && <p className="mt-1 text-xs text-slate-500">Note: {m.notes}</p>}
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary btn-sm" onClick={() => setMode({ edit: m })}>
                  Edit
                </button>
                {confirmId === m.id ? (
                  <>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => {
                        deleteMedicine(m.id);
                        setConfirmId(null);
                      }}
                    >
                      Confirm delete
                    </button>
                    <button className="btn-secondary btn-sm" onClick={() => setConfirmId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-secondary btn-sm" onClick={() => setConfirmId(m.id)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
