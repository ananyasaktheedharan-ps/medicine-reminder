import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { CreateMedicineInput, UpdateMedicineInput } from './medicine.dto';
import { Medicine } from './medicine.entity';
import { MedicinesService } from './medicines.service';

@Resolver(() => Medicine)
@UseGuards(GqlAuthGuard)
export class MedicinesResolver {
  constructor(private service: MedicinesService) {}

  @Query(() => [Medicine])
  medicines(@CurrentUser() u: AuthUser, @Args('profileId', { type: () => ID }) profileId: string) {
    return this.service.list(u.id, profileId);
  }

  @Query(() => Medicine)
  medicine(@CurrentUser() u: AuthUser, @Args('id', { type: () => ID }) id: string) {
    return this.service.getForUser(u.id, id);
  }

  @Mutation(() => Medicine)
  createMedicine(@CurrentUser() u: AuthUser, @Args('input') input: CreateMedicineInput) {
    return this.service.create(u.id, input);
  }

  @Mutation(() => Medicine)
  updateMedicine(@CurrentUser() u: AuthUser, @Args('input') input: UpdateMedicineInput) {
    return this.service.update(u.id, input);
  }

  @Mutation(() => Boolean)
  deleteMedicine(@CurrentUser() u: AuthUser, @Args('id', { type: () => ID }) id: string) {
    return this.service.remove(u.id, id);
  }
}
