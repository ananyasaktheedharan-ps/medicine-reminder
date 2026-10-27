"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "@/lib/store";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, ready } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (nameErr) next.name = nameErr;
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
    if (!passErr && confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) return;

    const err = register(name, email, password);
    if (err) setFormError(err);
    else router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 block text-center text-2xl font-bold text-brand-700">
          💊 MedicineReminder
        </Link>
        <form onSubmit={onSubmit} className="card space-y-4" noValidate>
          <h1 className="text-xl font-semibold">Create your account</h1>
          {formError && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="input" value={name}
              onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" className="input" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            {errors.confirm && <p className="error-text">{errors.confirm}</p>}
          </div>
          <button type="submit" className="btn-primary w-full">Create account</button>
          <p className="text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
