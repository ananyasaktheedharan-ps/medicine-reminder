export type SlotStatus = 'TAKEN' | 'SKIPPED' | 'MISSED' | 'PENDING';

export interface Slot {
  medicineId: string;
  scheduledAt: number; // epoch ms
}

export interface LogLike {
  medicineId: string;
  scheduledAt: number;
  status: string;
}

export interface AdherenceResult {
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  percentage: number;
}

const DAY = 86_400_000;

/** Epoch ms of local midnight. tzOffsetMinutes = minutes EAST of UTC (India = 330). */
export function localMidnight(now: number, tzOffsetMinutes: number): number {
  const shifted = now + tzOffsetMinutes * 60_000;
  return Math.floor(shifted / DAY) * DAY - tzOffsetMinutes * 60_000;
}

function localDate(ms: number, tzOffsetMinutes: number): string {
  return new Date(ms + tzOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

/** Expected dose slots for one medicine over `days` days starting at `fromMidnight`. */
export function buildSlots(
  medicineId: string,
  times: string[],
  fromMidnight: number,
  days: number,
  tzOffsetMinutes = 0,
  startDate?: string | null,
  endDate?: string | null,
): Slot[] {
  const slots: Slot[] = [];
  for (let i = 0; i < days; i++) {
    const dayStart = fromMidnight + i * DAY;
    const dateStr = localDate(dayStart, tzOffsetMinutes);
    if (startDate && dateStr < startDate) continue;
    if (endDate && dateStr > endDate) continue;
    for (const t of times) {
      const [h, m] = t.split(':').map(Number);
      slots.push({ medicineId, scheduledAt: dayStart + (h * 60 + m) * 60_000 });
    }
  }
  return slots;
}

export function statusForSlot(slot: Slot, logs: LogLike[], now: number): SlotStatus {
  const log = logs.find(
    (l) => l.medicineId === slot.medicineId && l.scheduledAt === slot.scheduledAt,
  );
  if (log && (log.status === 'TAKEN' || log.status === 'SKIPPED' || log.status === 'MISSED')) {
    return log.status;
  }
  return slot.scheduledAt <= now ? 'MISSED' : 'PENDING';
}

/** Only slots already due (<= now) count. No log for a due slot = missed. */
export function computeAdherence(slots: Slot[], logs: LogLike[], now: number): AdherenceResult {
  let taken = 0;
  let missed = 0;
  let skipped = 0;
  for (const s of slots) {
    if (s.scheduledAt > now) continue;
    const st = statusForSlot(s, logs, now);
    if (st === 'TAKEN') taken++;
    else if (st === 'SKIPPED') skipped++;
    else missed++;
  }
  const total = taken + missed + skipped;
  const percentage = total === 0 ? 100 : Math.round((taken / total) * 100);
  return { taken, missed, skipped, total, percentage };
}
