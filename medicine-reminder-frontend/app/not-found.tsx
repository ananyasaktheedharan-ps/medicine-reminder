import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-600">We couldn&apos;t find that page.</p>
      <Link href="/" className="btn-primary">
        Go home
      </Link>
    </main>
  );
}
