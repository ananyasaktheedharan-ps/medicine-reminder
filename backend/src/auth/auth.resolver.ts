import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthPayload, LoginInput, RegisterInput } from './auth.dto';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService, private users: UsersService) {}

  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput) {
    return this.auth.register(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput) {
    return this.auth.login(input);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return this.users.findById(user.id);
  }
}
