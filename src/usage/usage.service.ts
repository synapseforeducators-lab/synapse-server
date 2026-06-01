import { Injectable, ForbiddenException } from '@nestjs/common';

import { UsageRepository } from './repositories/usage.repository';
import { AccessResolverService } from 'src/billing/access/access-resolver.service';
import { UsagePeriod, UsageType } from './enums/usage-type.enum';
import { USAGE_LIMITS } from './ constants/usage-limits';
import { UsageTracking } from './entities/usage-tracking.entity';

@Injectable()
export class UsageService {
  constructor(
    private readonly usageRepo: UsageRepository,
    private readonly accessResolver: AccessResolverService,
  ) {}

  private currentPeriod() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const result = `${year}-${month}`;
    return { result, year, month };
  }

  async getUsage(userId: string, type: UsageType, usage_period: UsagePeriod) {
    const usage = await this.usageRepo.findOne({
      userId,
      type,
      ...(usage_period === UsagePeriod.MONTHLY && {
        month: +this.currentPeriod().month,
        year: +this.currentPeriod().year,
      }),
    });

    return usage || null;
  }

  async getUsageCount(
    userId: string,
    type: UsageType,
    usage_period: UsagePeriod,
  ) {
    const usage = await this.getUsage(userId, type, usage_period);

    return usage?.count || 0;
  }

  async canUse(userId: string, type: UsageType) {
    const access = await this.accessResolver.resolve(userId);

    const limits = USAGE_LIMITS[access.plan];

    const limit = limits[type];

    const usagePeriod = access.plan.includes('YEAR')
      ? UsagePeriod.YEARLY
      : UsagePeriod.MONTHLY;

    const current = await this.getUsageCount(userId, type, usagePeriod);

    console.log({
      access,
      usagePeriod,
      current,
      limit,
      limits,
      a: limits[UsageType[type]],
    });

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

    const usagePeriod = access.plan.includes('YEAR')
      ? UsagePeriod.YEARLY
      : UsagePeriod.MONTHLY;

    let usage = await this.usageRepo.findOne({
      userId,
      type,
      usage_period: usagePeriod,
      ...(usagePeriod === UsagePeriod.MONTHLY && {
        month: +this.currentPeriod().month,
        year: +this.currentPeriod().year,
      }),
      ...(usagePeriod === UsagePeriod.YEARLY && {
        year: +this.currentPeriod().year,
      }),
    });

    if (!usage) {
      const newUsage = new UsageTracking({
        userId,
        type,
        count: 0,
        usage_period: usagePeriod,
        month: +this.currentPeriod().month,
        year: +this.currentPeriod().year,
      });
      usage = await this.usageRepo.create(newUsage);
    }

    usage.count += 1;

    return this.usageRepo.create(usage);
  }

  async decrement(userId: string, type: UsageType) {
    const access = await this.canUse(userId, type);

    if (!access.allowed) {
      throw new ForbiddenException('Usage limit exceeded');
    }

    const usagePeriod = access.plan.includes('YEAR')
      ? UsagePeriod.YEARLY
      : UsagePeriod.MONTHLY;

    const usage = await this.usageRepo.findOne({
      userId,
      type,
      usage_period: usagePeriod,
      ...(usagePeriod === UsagePeriod.MONTHLY && {
        month: +this.currentPeriod().month,
        year: +this.currentPeriod().year,
      }),
      ...(usagePeriod === UsagePeriod.YEARLY && {
        year: +this.currentPeriod().year,
      }),
    });

    if (!usage) {
      return null;
    }

    usage.count = Math.max(usage.count - 1, 0);

    return this.usageRepo.create(usage);
  }

  async resetMonthlyUsage(userId: string) {
    const period = this.currentPeriod();

    return this.usageRepo.resetUsage(userId, +period.month, +period.year);
  }
}
