import { Field, ID, InputType } from '@nestjs/graphql';
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsUUID, Matches } from 'class-validator';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

@InputType()
export class CreateMedicineInput {
  @Field(() => ID) @IsUUID() profileId: string;
  @Field() @IsNotEmpty() name: string;
  @Field() @IsNotEmpty() dosage: string;
  @Field({ nullable: true }) @IsOptional() instructions?: string;
  @Field({ nullable: true }) @IsOptional() @Matches(DATE) startDate?: string;
  @Field({ nullable: true }) @IsOptional() @Matches(DATE) endDate?: string;
  @Field(() => [String]) @IsArray() @ArrayMinSize(1) @Matches(HHMM, { each: true }) times: string[];
}

@InputType()
export class UpdateMedicineInput {
  @Field(() => ID) @IsUUID() id: string;
  @Field({ nullable: true }) @IsOptional() @IsNotEmpty() name?: string;
  @Field({ nullable: true }) @IsOptional() @IsNotEmpty() dosage?: string;
  @Field({ nullable: true }) @IsOptional() instructions?: string;
  @Field({ nullable: true }) @IsOptional() @Matches(DATE) startDate?: string;
  @Field({ nullable: true }) @IsOptional() @Matches(DATE) endDate?: string;
  @Field({ nullable: true }) @IsOptional() @IsBoolean() active?: boolean;
  @Field(() => [String], { nullable: true })
  @IsOptional() @IsArray() @ArrayMinSize(1) @Matches(HHMM, { each: true })
  times?: string[];
}
