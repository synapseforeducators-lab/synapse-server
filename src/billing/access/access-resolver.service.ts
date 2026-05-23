import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { Repository } from 'typeorm';
import { SchoolSubscription } from '../entities/school_subscriptions.entity';
import { UserSubscription } from '../entities/user_subscriptions.entity';
import { BillingPlan } from '../enum/billing-plan.enum';
import { SubscriptionStatus } from '../enum/subscription-status.enum';



@Injectable()
export class AccessResolverService {
  constructor(
    @InjectRepository(SchoolMember)
    private readonly schoolMemberRepo: Repository<SchoolMember>,

    @InjectRepository(SchoolSubscription)
    private readonly schoolSubRepo: Repository<SchoolSubscription>,

    @InjectRepository(UserSubscription)
    private readonly userSubRepo: Repository<UserSubscription>,
  ) {}

  async resolve(userId: string) {
    const schoolMember =
      await this.schoolMemberRepo.findOne({
        where: {
          userId,
          active: true,
        },
      });

    if (schoolMember) {
      const schoolSubscription =
        await this.schoolSubRepo.findOne({
          where: {
            schoolId:
              schoolMember.schoolId,

            status:
              SubscriptionStatus.ACTIVE,
          },
        });

      if (schoolSubscription) {
        return {
          premium: true,
          source: 'SCHOOL',
          plan: schoolSubscription.plan,
        };
      }
    }

    const userSubscription =
      await this.userSubRepo.findOne({
        where: {
          userId,

          status:
            SubscriptionStatus.ACTIVE,
        },
      });

    if (userSubscription) {
      return {
        premium: true,
        source: 'USER',
        plan: userSubscription.plan,
      };
    }

    return {
      premium: false,
      source: 'FREE',
      plan: BillingPlan.FREE,
    };
  }
}