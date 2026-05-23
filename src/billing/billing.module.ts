import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from './billing.controller';

import { BillingService } from './billing.service';

import { PaystackService } from './paystack/paystack.service';

import { PaystackWebhookService } from './paystack/paystack-webhook.service';

import { AccessResolverService } from './access/access-resolver.service';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { BillingTransaction } from './entities/billing_transactions.entity';
import { SchoolSubscription } from './entities/school_subscriptions.entity';
import { UserSubscription } from './entities/user_subscriptions.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      BillingTransaction,
      UserSubscription,
      SchoolSubscription,
      SchoolMember,
    ]),
  ],

  controllers: [BillingController],

  providers: [
    BillingService,
    PaystackService,
    PaystackWebhookService,
    AccessResolverService,
  ],

  exports: [
    BillingService,
    AccessResolverService,
  ],
})
export class BillingModule {}