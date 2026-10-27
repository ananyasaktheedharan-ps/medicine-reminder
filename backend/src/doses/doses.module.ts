import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicinesModule } from '../medicines/medicines.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { DoseLog } from './dose-log.entity';
import { DosesResolver } from './doses.resolver';
import { DosesService } from './doses.service';

@Module({
  imports: [TypeOrmModule.forFeature([DoseLog]), MedicinesModule, ProfilesModule],
  providers: [DosesService, DosesResolver],
})
export class DosesModule {}
