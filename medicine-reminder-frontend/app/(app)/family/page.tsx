"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "@/lib/store";
import { validateEmail, validateName } from "@/lib/validation";

const RELATIONS = ["Mother", "Father", "Spouse", "Child", "Sibling", "Grandparent", "Friend", "Other"];

export default function FamilyPage() {
  const { profiles, activeProfile, setActiveProfileId, addProfile, removeProfile } = useApp();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const n = validateName(name);
    if (n) next.name = n;
    if (email.trim()) {
      const em = validateEmail(email);
      if (em) next.email = em;
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    addProfile(name, relation, email.trim() || undefined);
    setName("");
    setEmail("");
    setRelation(RELATIONS[0]);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Family &amp; caregivers</h1>
        <p className="text-sm text-slate-600">
          Add family members whose medicines you help manage. Switch between profiles from the sidebar.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4" noValidate>
        <h2 className="text-lg font-semibold">Add a family member</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="f-name">Name</label>
            <input id="f-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="f-rel">Relation</label>
            <select id="f-rel" className="input" value={relation} onChange={(e) => setRelation(e.target.value)}>
              {RELATIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-email">Email (optional)</label>
            <input id="f-email" type="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
        </div>
        <button type="submit" className="btn-primary">Add member</button>
      </form>

      <ul className="grid gap-4 sm:grid-cols-2">
        {profiles.map((p) => {
          const active = p.id === activeProfile?.id;
          return (
            <li key={p.id} className={`card ${active ? "ring-2 ring-brand-500" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{p.isSelf ? `${p.name} (me)` : p.name}</h3>
                  <p className="text-sm text-slate-600">{p.relation}</p>
                  {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
                </div>
                {active && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                    Active
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!active && (
                  <button className="btn-primary btn-sm" onClick={() => setActiveProfileId(p.id)}>
                    Manage medicines
                  </button>
                )}
                {!p.isSelf &&
                  (confirmId === p.id ? (
                    <>
                      <button className="btn-danger btn-sm"
                        onClick={() => { removeProfile(p.id); setConfirmId(null); }}>
                        Confirm remove
                      </button>
                      <button className="btn-secondary btn-sm" onClick={() => setConfirmId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn-secondary btn-sm" onClick={() => setConfirmId(p.id)}>
                      Remove
                    </button>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
