
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateProfileInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  relation?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  relation?: string;
}

@InputType()
export class ShareProfileInput {
  @Field(() => ID)
  @IsUUID()
  profileId: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  canEdit: boolean;
}

@ObjectType()
export class Caregiver {
  @Field(() => ID)
  userId: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  canEdit: boolean;
}
