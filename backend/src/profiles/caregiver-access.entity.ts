import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Profile } from './profile.entity';

@ObjectType()
@Entity('caregiver_access')
@Unique(['profileId', 'userId'])
export class CaregiverAccess {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  profileId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Relation<Profile>;

  @Field(() => ID)
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Field()
  @Column({ default: false })
  canEdit: boolean;
}
