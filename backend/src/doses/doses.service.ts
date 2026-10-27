import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { buildSlots, computeAdherence, localMidnight, statusForSlot } from '../common/adherence';
import { MedicinesService } from '../medicines/medicines.service';
import { ProfilesService } from '../profiles/profiles.service';
import { LogDoseInput } from './dose.dto';
import { DoseLog, DoseStatus } from './dose-log.entity';

const DAY = 86_400_000;

@Injectable()
export class DosesService {
  constructor(
    @InjectRepository(DoseLog) private logs: Repository<DoseLog>,
    private medicines: MedicinesService,
    private profiles: ProfilesService,
  ) {}

  async logDose(userId: string, input: LogDoseInput) {
    const med = await this.medicines.getForUser(userId, input.medicineId, true);
    const takenAt = input.status === DoseStatus.TAKEN ? Date.now() : null;
    const existing = await this.logs.findOne({
      where: { medicineId: med.id, scheduledAt: input.scheduledAt },
    });
    if (existing) {
      existing.status = input.status;
      existing.takenAt = takenAt;
      existing.note = input.note ?? existing.note;
      return this.logs.save(existing);
    }
    return this.logs.save(
      this.logs.create({
        medicineId: med.id,
        profileId: med.profileId,
        scheduledAt: input.scheduledAt,
        status: input.status,
        takenAt,
        note: input.note ?? null,
      }),
    );
  }

  async doseLogs(userId: string, profileId: string, from: number, to: number) {
    await this.profiles.assertAccess(userId, profileId);
    return this.logs.find({
      where: { profileId, scheduledAt: Between(from, to) },
      order: { scheduledAt: 'ASC' },
    });
  }

  async todaysDoses(userId: string, profileId: string, tzOffsetMinutes: number) {
    await this.profiles.assertAccess(userId, profileId);
    const now = Date.now();
    const start = localMidnight(now, tzOffsetMinutes);
    const meds = (await this.medicines.list(userId, profileId)).filter((m) => m.active);
    const logs = await this.logs.find({
      where: { profileId, scheduledAt: Between(start, start + DAY) },
    });
    const out = meds.flatMap((m) =>
      buildSlots(
        m.id, m.times.map((t) => t.time), start, 1, tzOffsetMinutes, m.startDate, m.endDate,
      ).map((slot) => ({
        medicineId: m.id,
        medicineName: m.name,
        dosage: m.dosage,
        scheduledAt: slot.scheduledAt,
        status: statusForSlot(slot, logs, now) as DoseStatus,
      })),
    );
    return out.sort((a, b) => a.scheduledAt - b.scheduledAt);
  }

  async adherence(userId: string, profileId: string, days: number, tzOffsetMinutes: number) {
    await this.profiles.assertAccess(userId, profileId);
    const now = Date.now();
    const start = localMidnight(now, tzOffsetMinutes) - (days - 1) * DAY;
    const meds = await this.medicines.list(userId, profileId);
    const logs = await this.logs.find({
      where: { profileId, scheduledAt: Between(start, now + DAY) },
    });
    const slots = meds
      .filter((m) => m.active)
      .flatMap((m) =>
        buildSlots(
          m.id, m.times.map((t) => t.time), start, days, tzOffsetMinutes, m.startDate, m.endDate,
        ),
      );
    return computeAdherence(slots, logs, now);
  }
}
