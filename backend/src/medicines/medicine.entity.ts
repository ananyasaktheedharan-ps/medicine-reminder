import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { MedicineTime } from './medicine-time.entity';

@ObjectType()
@Entity('medicines')
export class Medicine {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  profileId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  dosage: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  instructions?: string | null;

/** YYYY-MM-DD */
  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  startDate?: string | null;

/** YYYY-MM-DD */
  @Field(() => String, { nullable: true })
  @Column({ type: 'date', nullable: true })
  endDate?: string | null;
  
  @Field()
  @Column({ default: true })
  active: boolean;

  @Field(() => [MedicineTime])
  @OneToMany(() => MedicineTime, (t) => t.medicine, { eager: true, cascade: true })
  times: MedicineTime[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
