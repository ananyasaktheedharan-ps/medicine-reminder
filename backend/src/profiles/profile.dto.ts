import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class CreateProfileInput {
  @Field() @IsNotEmpty() name: string;
  @Field({ nullable: true }) @IsOptional() relation?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field(() => ID) @IsUUID() id: string;
  @Field({ nullable: true }) @IsOptional() @IsNotEmpty() name?: string;
  @Field({ nullable: true }) @IsOptional() relation?: string;
}

@InputType()
export class ShareProfileInput {
  @Field(() => ID) @IsUUID() profileId: string;
  @Field() @IsEmail() email: string;
  @Field({ defaultValue: false }) @IsBoolean() canEdit: boolean;
}

@ObjectType()
export class Caregiver {
  @Field(() => ID) userId: string;
  @Field() email: string;
  @Field() name: string;
  @Field() canEdit: boolean;
}
