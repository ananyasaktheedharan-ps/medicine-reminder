import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { bigintTransformer } from '../common/bigint.transformer';

export enum DoseStatus {
  PENDING = 'PENDING',
  TAKEN = 'TAKEN',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
}
registerEnumType(DoseStatus, { name: 'DoseStatus' });

@ObjectType()
@Entity('dose_logs')
@Unique(['medicineId', 'scheduledAt'])
export class DoseLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  medicineId: string;

  @Field(() => ID)
  @Index()
  @Column()
  profileId: string;

  /** epoch ms of the scheduled slot */
  @Field()
  @Column({ type: 'bigint', transformer: bigintTransformer })
  scheduledAt: number;

  @Field(() => DoseStatus)
  @Column({ type: 'varchar' })
  status: DoseStatus;

  @Field(() => Number, { nullable: true })
@Column({ type: 'bigint', nullable: true, transformer: bigintTransformer })
takenAt?: number | null;

@Field(() => String, { nullable: true })
@Column({ type: 'varchar', nullable: true })
note?: string | null;
}
