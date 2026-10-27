"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/lib/store";
import { validateEmail } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, ready } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) next.email = emailErr;
    if (!password) next.password = "Password is required";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;

    const err = login(email, password);
    if (err) setFormError(err);
    else router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center text-2xl font-bold text-brand-700">
          💊 MedicineReminder
        </Link>
        <form onSubmit={onSubmit} className="card space-y-4" noValidate>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          {formError && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <button type="submit" className="btn-primary w-full">Log in</button>
          <p className="text-center text-sm text-slate-600">
            New here?{" "}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
