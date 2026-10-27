import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Medicine } from './medicine.entity';

@ObjectType()
@Entity('medicine_times')
export class MedicineTime {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** "HH:mm" in the person's local time */
  @Field()
  @Column({ length: 5 })
  time: string;

  @ManyToOne(() => Medicine, (m) => m.times, { onDelete: 'CASCADE' })
  medicine: Relation<Medicine>;
}
