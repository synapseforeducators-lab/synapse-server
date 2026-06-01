import { Injectable, Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { UsageTracking } from '../entities/usage-tracking.entity';
import { AbstractRepository } from 'src/common';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { School } from 'src/schools/entities/school.entity';

@Injectable()
export class UsageRepository extends AbstractRepository<UsageTracking> {
  protected readonly logger = new Logger(UsageRepository.name);

  constructor(
    @InjectRepository(UsageTracking)
    usageRepository: Repository<UsageTracking>,
    entityManager: EntityManager,
  ) {
    super(usageRepository, entityManager);
  }

  async resetCountsForUsers(userIds: string[], month: number, year: number) {
    if (!userIds || userIds.length === 0) return null;

    return this.entityManager
      .createQueryBuilder(UsageTracking, 'usage_tracking')
      .update()
      .set({ count: 0 })
      .where('userId IN (:...userIds) AND month = :month AND year = :year', {
        userIds,
        month,
        year,
      })
      .execute();
  }

  async resetUsage(userId, month, year) {
    // reset for the user
    await this.resetCountsForUsers([userId], month, year);

    // try to find the user's active school membership to locate the school owner
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      where: { userId, active: true },
    });

    if (schoolMember && schoolMember.schoolId) {
      const school = await this.entityManager.findOne(School, {
        where: { id: schoolMember.schoolId },
      });

      if (school && school.ownerId && school.ownerId !== userId) {
        await this.resetCountsForUsers([school.ownerId], month, year);
      }
    }

    return true;
  }
}
