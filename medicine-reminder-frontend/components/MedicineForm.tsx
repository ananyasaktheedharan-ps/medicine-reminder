"use client";

import { useState, type FormEvent } from "react";
import type { Medicine } from "@/lib/types";
import { todayStr } from "@/lib/dates";
import { validateMedicine } from "@/lib/validation";

type Values = Omit<Medicine, "id" | "profileId">;

const FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Drops", "Inhaler", "Ointment", "Other"];

export default function MedicineForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Medicine;
  onSubmit: (values: Values) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [dosage, setDosage] = useState(initial?.dosage ?? "");
  const [form, setForm] = useState(initial?.form ?? "Tablet");
  const [times, setTimes] = useState<string[]>(initial?.times ?? ["08:00"]);
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayStr());
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const cleanTimes = Array.from(new Set(times.filter(Boolean))).sort();
    const errs = validateMedicine({
      name,
      dosage,
      times: cleanTimes,
      startDate,
      endDate: endDate || undefined,
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      times: cleanTimes,
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="card space-y-4" noValidate>
      <h2 className="text-lg font-semibold">{initial ? "Edit medicine" : "Add medicine"}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="m-name">Medicine name</label>
          <input id="m-name" className="input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paracetamol" />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="m-dosage">Dosage</label>
          <input id="m-dosage" className="input" value={dosage} onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g. 500 mg" />
          {errors.dosage && <p className="error-text">{errors.dosage}</p>}
        </div>
        <div>
          <label className="label" htmlFor="m-form">Form</label>
          <select id="m-form" className="input" value={form} onChange={(e) => setForm(e.target.value)}>
            {FORMS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="m-notes">Notes (optional)</label>
          <input id="m-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. after food" />
        </div>
        <div>
          <label className="label" htmlFor="m-start">Start date</label>
          <input id="m-start" type="date" className="input" value={startDate}
            onChange={(e) => setStartDate(e.target.value)} />
          {errors.startDate && <p className="error-text">{errors.startDate}</p>}
        </div>
        <div>
          <label className="label" htmlFor="m-end">End date (optional)</label>
          <input id="m-end" type="date" className="input" value={endDate}
            onChange={(e) => setEndDate(e.target.value)} />
          {errors.endDate && <p className="error-text">{errors.endDate}</p>}
        </div>
      </div>

      <div>
        <span className="label">Reminder times</span>
        <div className="space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="time" className="input max-w-[160px]" value={t} aria-label={`Reminder time ${i + 1}`}
                onChange={(e) => setTimes((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} />
              {times.length > 1 && (
                <button type="button" className="btn-secondary btn-sm"
                  onClick={() => setTimes((arr) => arr.filter((_, j) => j !== i))}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary btn-sm mt-2"
          onClick={() => setTimes((arr) => [...arr, "20:00"])}>
          + Add another time
        </button>
        {errors.times && <p className="error-text">{errors.times}</p>}
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary">{initial ? "Save changes" : "Add medicine"}</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
