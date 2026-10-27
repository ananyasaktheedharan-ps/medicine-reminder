import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { DoseStatus } from './dose-log.entity';

@InputType()
export class LogDoseInput {
  @Field(() => ID) @IsUUID() medicineId: string;
  /** epoch ms of the scheduled slot (use the scheduledAt from todaysDoses) */
  @Field() @IsNumber() scheduledAt: number;
  @Field(() => DoseStatus) @IsEnum(DoseStatus) status: DoseStatus;
  @Field({ nullable: true }) @IsOptional() note?: string;
}

@ObjectType()
export class ScheduledDose {
  @Field(() => ID) medicineId: string;
  @Field() medicineName: string;
  @Field() dosage: string;
  @Field() scheduledAt: number;
  @Field(() => DoseStatus) status: DoseStatus;
}

@ObjectType()
export class AdherenceSummary {
  @Field(() => Int) taken: number;
  @Field(() => Int) missed: number;
  @Field(() => Int) skipped: number;
  @Field(() => Int) total: number;
  @Field(() => Int) percentage: number;
}
