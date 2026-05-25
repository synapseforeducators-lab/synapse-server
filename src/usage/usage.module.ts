import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UsageController } from './usage.controller';

import { UsageService } from './usage.service';

import { UsageRepository } from './repositories/usage.repository';

import { UsageLimitGuard } from './guards/usage-limit.guard';

import { UsageInterceptor } from './interceptors/usage.interceptor';
import { UsageTracking } from './entities/usage-tracking.entity';
import { BillingModule } from 'src/billing/billing.module';

@Module({
  imports: [TypeOrmModule.forFeature([UsageTracking]), BillingModule],

  controllers: [UsageController],

  providers: [UsageService, UsageRepository, UsageLimitGuard, UsageInterceptor],

  exports: [UsageService, UsageLimitGuard, UsageInterceptor],
})
export class UsageModule {}
