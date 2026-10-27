import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfilesService } from '../profiles/profiles.service';
import { CreateMedicineInput, UpdateMedicineInput } from './medicine.dto';
import { MedicineTime } from './medicine-time.entity';
import { Medicine } from './medicine.entity';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine) private meds: Repository<Medicine>,
    @InjectRepository(MedicineTime) private times: Repository<MedicineTime>,
    private profiles: ProfilesService,
  ) {}

  async list(userId: string, profileId: string) {
    await this.profiles.assertAccess(userId, profileId);
    return this.meds.find({ where: { profileId }, order: { createdAt: 'ASC' } });
  }

  async getForUser(userId: string, id: string, write = false) {
    const med = await this.meds.findOne({ where: { id } });
    if (!med) throw new NotFoundException('Medicine not found');
    await this.profiles.assertAccess(userId, med.profileId, write);
    return med;
  }

  async create(userId: string, input: CreateMedicineInput) {
    await this.profiles.assertAccess(userId, input.profileId, true);
    const med = this.meds.create({
      profileId: input.profileId,
      name: input.name,
      dosage: input.dosage,
      instructions: input.instructions ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      times: [...new Set(input.times)].sort().map((t) => this.times.create({ time: t })),
    });
    return this.meds.save(med);
  }

  async update(userId: string, input: UpdateMedicineInput) {
    const med = await this.getForUser(userId, input.id, true);
    if (input.name !== undefined) med.name = input.name;
    if (input.dosage !== undefined) med.dosage = input.dosage;
    if (input.instructions !== undefined) med.instructions = input.instructions;
    if (input.startDate !== undefined) med.startDate = input.startDate;
    if (input.endDate !== undefined) med.endDate = input.endDate;
    if (input.active !== undefined) med.active = input.active;
    if (input.times) {
      await this.times.delete({ medicine: { id: med.id } });
      med.times = [...new Set(input.times)].sort().map((t) => this.times.create({ time: t }));
    }
    return this.meds.save(med);
  }

  async remove(userId: string, id: string) {
    const med = await this.getForUser(userId, id, true);
    await this.meds.remove(med);
    return true;
  }
}
