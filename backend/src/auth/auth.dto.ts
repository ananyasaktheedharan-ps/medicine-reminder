import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../users/user.entity';

@InputType()
export class RegisterInput {
  @Field() @IsEmail() email: string;
  @Field() @IsNotEmpty() name: string;
  @Field() @MinLength(8) password: string;
}

@InputType()
export class LoginInput {
  @Field() @IsEmail() email: string;
  @Field() @IsNotEmpty() password: string;
}

@ObjectType()
export class AuthPayload {
  @Field() accessToken: string;
  @Field(() => User) user: User;
}
