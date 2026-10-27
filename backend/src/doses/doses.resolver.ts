import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { AdherenceSummary, LogDoseInput, ScheduledDose } from './dose.dto';
import { DoseLog } from './dose-log.entity';
import { DosesService } from './doses.service';

@Resolver(() => DoseLog)
@UseGuards(GqlAuthGuard)
export class DosesResolver {
  constructor(private service: DosesService) {}

  /** tzOffsetMinutes = minutes EAST of UTC (India = 330, i.e. -new Date().getTimezoneOffset()) */
  @Query(() => [ScheduledDose])
  todaysDoses(
    @CurrentUser() u: AuthUser,
    @Args('profileId', { type: () => ID }) profileId: string,
    @Args('tzOffsetMinutes', { type: () => Int, defaultValue: 0 }) tz: number,
  ) {
    return this.service.todaysDoses(u.id, profileId, tz);
  }

  @Query(() => [DoseLog])
  doseLogs(
    @CurrentUser() u: AuthUser,
    @Args('profileId', { type: () => ID }) profileId: string,
    @Args('from') from: number,
    @Args('to') to: number,
  ) {
    return this.service.doseLogs(u.id, profileId, from, to);
  }

  @Query(() => AdherenceSummary)
  adherence(
    @CurrentUser() u: AuthUser,
    @Args('profileId', { type: () => ID }) profileId: string,
    @Args('days', { type: () => Int, defaultValue: 7 }) days: number,
    @Args('tzOffsetMinutes', { type: () => Int, defaultValue: 0 }) tz: number,
  ) {
    return this.service.adherence(u.id, profileId, days, tz);
  }

  @Mutation(() => DoseLog)
  logDose(@CurrentUser() u: AuthUser, @Args('input') input: LogDoseInput) {
    return this.service.logDose(u.id, input);
  }
}
