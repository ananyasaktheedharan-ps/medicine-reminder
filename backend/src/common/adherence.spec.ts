import { buildSlots, computeAdherence, localMidnight } from './adherence';

describe('adherence', () => {
  const IST = 330;
  const now = Date.UTC(2026, 9, 25, 12, 0); // 25 Oct 2026 12:00 UTC = 17:30 IST
  const mid = localMidnight(now, IST);

  it('computes local midnight for IST', () => {
    expect(new Date(mid + IST * 60_000).toISOString()).toBe('2026-10-25T00:00:00.000Z');
  });

  it('builds slots per day and per time', () => {
    const slots = buildSlots('m1', ['08:00', '20:00'], mid, 2, IST);
    expect(slots).toHaveLength(4);
  });

  it('respects start and end dates', () => {
    const slots = buildSlots('m1', ['08:00'], mid, 3, IST, '2026-10-26', '2026-10-26');
    expect(slots).toHaveLength(1);
  });

  it('counts taken, skipped, missed and ignores future slots', () => {
    const slots = buildSlots('m1', ['08:00', '13:00', '23:00'], mid, 1, IST);
    const logs = [{ medicineId: 'm1', scheduledAt: slots[0].scheduledAt, status: 'TAKEN' }];
    const r = computeAdherence(slots, logs, now); // 17:30 IST: 08:00 and 13:00 due
    expect(r).toEqual({ taken: 1, missed: 1, skipped: 0, total: 2, percentage: 50 });
  });

  it('returns 100% when nothing is due', () => {
    expect(computeAdherence([], [], now).percentage).toBe(100);
  });
});
