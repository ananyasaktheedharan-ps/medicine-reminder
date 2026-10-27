import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesModule } from '../profiles/profiles.module';
import { MedicineTime } from './medicine-time.entity';
import { Medicine } from './medicine.entity';
import { MedicinesResolver } from './medicines.resolver';
import { MedicinesService } from './medicines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, MedicineTime]), ProfilesModule],
  providers: [MedicinesService, MedicinesResolver],
  exports: [MedicinesService],
})
export class MedicinesModule {}
