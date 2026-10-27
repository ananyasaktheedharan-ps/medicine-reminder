"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

const features = [
  { icon: "💊", title: "Manage medicines", text: "Add medicines with dosage, form, dates and notes." },
  { icon: "⏰", title: "Smart reminders", text: "Set multiple daily times and get browser alerts when a dose is due." },
  { icon: "✅", title: "Taken / Missed / Snoozed", text: "Log every dose in one tap and snooze when you are busy." },
  { icon: "📊", title: "Adherence tracking", text: "See your 7-day and 30-day adherence at a glance." },
  { icon: "👨‍👩‍👧", title: "Family & caregivers", text: "Manage a parent's or child's medicines from one account." },
  { icon: "🛡️", title: "Secure access", text: "Account registration and login protect your health data." },
];

export default function LandingPage() {
  const { user, ready } = useApp();

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-brand-700">💊 MedicineReminder</span>
        <nav className="flex items-center gap-3">
          {ready && user ? (
            <Link href="/dashboard" className="btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Never miss a dose again.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          MedicineReminder is a web-based medicine management system that helps you schedule, track
          and manage your medications, with reminders and optional family/caregiver support.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Create free account
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        MedicineReminder · Web Technologies project
      </footer>
    </main>
  );
}
