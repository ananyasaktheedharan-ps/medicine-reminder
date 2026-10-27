import type { EffectiveStatus } from "@/lib/store";

const styles: Record<EffectiveStatus, { label: string; cls: string }> = {
  taken: { label: "Taken", cls: "bg-green-100 text-green-800" },
  missed: { label: "Missed", cls: "bg-red-100 text-red-800" },
  snoozed: { label: "Snoozed", cls: "bg-amber-100 text-amber-800" },
  due: { label: "Due now", cls: "bg-blue-100 text-blue-800" },
  overdue: { label: "Overdue", cls: "bg-orange-100 text-orange-800" },
  upcoming: { label: "Upcoming", cls: "bg-slate-100 text-slate-700" },
};

export default function StatusBadge({ status }: { status: EffectiveStatus }) {
  const s = styles[status];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
