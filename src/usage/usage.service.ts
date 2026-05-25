import { Injectable, ForbiddenException } from '@nestjs/common';

import dayjs from 'dayjs';

import { UsageRepository } from './repositories/usage.repository';
import { AccessResolverService } from 'src/billing/access/access-resolver.service';
import { UsageType } from './enums/usage-type.enum';
import { USAGE_LIMITS } from './ constants/usage-limits';

@Injectable()
export class UsageService {
  constructor(
    private readonly usageRepo: UsageRepository,

    private readonly accessResolver: AccessResolverService,
  ) {}

  private currentPeriod() {
    return dayjs().format('YYYY-MM');
  }

  async getUsage(userId: string, type: UsageType) {
    const usage = await this.usageRepo.findOne({
      where: {
        userId,
        type,
        period: this.currentPeriod(),
      },
    });

    return usage || null;
  }

  async getUsageCount(userId: string, type: UsageType) {
    const usage = await this.getUsage(userId, type);

    return usage?.count || 0;
  }

  async canUse(userId: string, type: UsageType) {
    const access = await this.accessResolver.resolve(userId);

    const limits = USAGE_LIMITS[access.plan];

    const limit = limits[type];

    const current = await this.getUsageCount(userId, type);

    if (limit === Infinity) {
      return {
        allowed: true,
        current,
        limit,
        remaining: Infinity,
        plan: access.plan,
      };
    }

    return {
      allowed: current < limit,
      current,
      limit,
      remaining: Math.max(limit - current, 0),
      plan: access.plan,
    };
  }

  async increment(userId: string, type: UsageType) {
    const access = await this.canUse(userId, type);

    if (!access.allowed) {
      throw new ForbiddenException('Usage limit exceeded');
    }

    let usage = await this.usageRepo.findOne({
      where: {
        userId,
        type,
        period: this.currentPeriod(),
      },
    });

    if (!usage) {
      usage = this.usageRepo.create({
        userId,
        type,
        count: 0,
        period: this.currentPeriod(),
      });
    }

    usage.count += 1;

    return this.usageRepo.save(usage);
  }

  async decrement(userId: string, type: UsageType) {
    const usage = await this.usageRepo.findOne({
      where: {
        userId,
        type,
        period: this.currentPeriod(),
      },
    });

    if (!usage) {
      return null;
    }

    usage.count = Math.max(usage.count - 1, 0);

    return this.usageRepo.save(usage);
  }

  async resetMonthlyUsage() {
    return true;
  }
}
