import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { Caregiver, CreateProfileInput, ShareProfileInput, UpdateProfileInput } from './profile.dto';
import { Profile } from './profile.entity';
import { ProfilesService } from './profiles.service';

@Resolver(() => Profile)
@UseGuards(GqlAuthGuard)
export class ProfilesResolver {
  constructor(private service: ProfilesService) {}

  @Query(() => [Profile])
  myProfiles(@CurrentUser() u: AuthUser) {
    return this.service.listForUser(u.id);
  }

  @Query(() => [Caregiver])
  profileCaregivers(@CurrentUser() u: AuthUser, @Args('profileId', { type: () => ID }) id: string) {
    return this.service.caregivers(u.id, id);
  }

  @Mutation(() => Profile)
  createProfile(@CurrentUser() u: AuthUser, @Args('input') input: CreateProfileInput) {
    return this.service.create(u.id, input);
  }

  @Mutation(() => Profile)
  updateProfile(@CurrentUser() u: AuthUser, @Args('input') input: UpdateProfileInput) {
    return this.service.update(u.id, input);
  }

  @Mutation(() => Boolean)
  deleteProfile(@CurrentUser() u: AuthUser, @Args('id', { type: () => ID }) id: string) {
    return this.service.remove(u.id, id);
  }

  @Mutation(() => Profile)
  shareProfile(@CurrentUser() u: AuthUser, @Args('input') input: ShareProfileInput) {
    return this.service.share(u.id, input);
  }

  @Mutation(() => Boolean)
  unshareProfile(
    @CurrentUser() u: AuthUser,
    @Args('profileId', { type: () => ID }) profileId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    return this.service.unshare(u.id, profileId, userId);
  }
}
