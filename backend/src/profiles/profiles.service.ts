import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CaregiverAccess } from './caregiver-access.entity';
import { CreateProfileInput, ShareProfileInput, UpdateProfileInput } from './profile.dto';
import { Profile } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profiles: Repository<Profile>,
    @InjectRepository(CaregiverAccess) private access: Repository<CaregiverAccess>,
    private users: UsersService,
  ) {}

  create(userId: string, input: CreateProfileInput) {
    return this.profiles.save(
      this.profiles.create({ name: input.name, relation: input.relation ?? null, ownerId: userId }),
    );
  }

  async listForUser(userId: string) {
    const owned = await this.profiles.find({ where: { ownerId: userId } });
    const shared = await this.access.find({ where: { userId }, relations: { profile: true } });
    return [...owned, ...shared.map((a) => a.profile)].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  /** Owner always passes. Caregivers pass for read, and for write only if canEdit. */
  async assertAccess(userId: string, profileId: string, write = false): Promise<Profile> {
    const profile = await this.profiles.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.ownerId === userId) return profile;
    const grant = await this.access.findOne({ where: { profileId, userId } });
    if (!grant) throw new ForbiddenException('No access to this profile');
    if (write && !grant.canEdit) throw new ForbiddenException('Read-only access');
    return profile;
  }

  private async assertOwner(userId: string, profileId: string) {
    const profile = await this.profiles.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.ownerId !== userId) throw new ForbiddenException('Only the owner can do this');
    return profile;
  }

  async update(userId: string, input: UpdateProfileInput) {
    const profile = await this.assertOwner(userId, input.id);
    if (input.name !== undefined) profile.name = input.name;
    if (input.relation !== undefined) profile.relation = input.relation;
    return this.profiles.save(profile);
  }

  async remove(userId: string, profileId: string) {
    const profile = await this.assertOwner(userId, profileId);
    await this.profiles.remove(profile);
    return true;
  }

  async share(ownerId: string, input: ShareProfileInput) {
    const profile = await this.assertOwner(ownerId, input.profileId);
    const target = await this.users.findByEmail(input.email);
    if (!target) throw new NotFoundException('No user with that email');
    if (target.id === ownerId) throw new ForbiddenException('You already own this profile');
    const existing = await this.access.findOne({
      where: { profileId: profile.id, userId: target.id },
    });
    if (existing) {
      existing.canEdit = input.canEdit;
      await this.access.save(existing);
    } else {
      await this.access.save(
        this.access.create({ profileId: profile.id, userId: target.id, canEdit: input.canEdit }),
      );
    }
    return profile;
  }

  async unshare(ownerId: string, profileId: string, userId: string) {
    await this.assertOwner(ownerId, profileId);
    await this.access.delete({ profileId, userId });
    return true;
  }

  async caregivers(ownerId: string, profileId: string) {
    await this.assertOwner(ownerId, profileId);
    const rows = await this.access.find({ where: { profileId } });
    return rows.map((r) => ({
      userId: r.userId,
      email: r.user.email,
      name: r.user.name,
      canEdit: r.canEdit,
    }));
  }
}
