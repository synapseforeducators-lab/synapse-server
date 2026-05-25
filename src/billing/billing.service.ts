import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import dayjs from 'dayjs';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaystackService } from './paystack/paystack.service';
import { BILLING_PLANS } from './constants/plan';
import { BillingTransaction } from './entities/billing_transactions.entity';
import { UserSubscription } from './entities/user_subscriptions.entity';
import { BillingPlan } from './enum/billing-plan.enum';
import { BillingStatus } from './enum/billing-status.enum';
import { SubscriptionStatus } from './enum/subscription-status.enum';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(BillingTransaction)
    private readonly transactionRepo: Repository<BillingTransaction>,

    @InjectRepository(UserSubscription)
    private readonly subscriptionRepo: Repository<UserSubscription>,

    private readonly paystack: PaystackService,
  ) {}

  async initializeCheckout(user: any, plan: BillingPlan) {
    const planConfig = BILLING_PLANS[plan];

    if (!planConfig) {
      throw new BadRequestException('Invalid billing plan');
    }

    const reference = `txn_${crypto.randomUUID()}`;

    const transaction = await this.transactionRepo.save({
      userId: user.id,
      reference,
      amount: planConfig.price,
      currency: 'NGN',
      email: user.email,
      plan,
      status: BillingStatus.PENDING,
    });

    const payment = await this.paystack.initializeTransaction({
      email: user.email,
      amount: planConfig.price * 100,
      reference,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    transaction.authorizationUrl = payment.authorization_url;

    await this.transactionRepo.save(transaction);

    return payment;
  }

  async verifyTransaction(reference: string) {
    const verification = await this.paystack.verifyTransaction(reference);

    if (verification.status !== 'success') {
      throw new BadRequestException('Payment failed');
    }

    const transaction = await this.transactionRepo.findOne({
      where: { reference },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === BillingStatus.SUCCESS) {
      return transaction;
    }

    transaction.status = BillingStatus.SUCCESS;

    transaction.paidAt = new Date();

    transaction.gatewayResponse = verification.gateway_response;

    transaction.channel = verification.channel;

    await this.transactionRepo.save(transaction);

    await this.activateSubscription(transaction);

    return transaction;
  }

  async activateSubscription(transaction: BillingTransaction) {
    let subscription = await this.subscriptionRepo.findOne({
      where: {
        userId: transaction.userId,
      },
    });

    if (!subscription) {
      subscription = this.subscriptionRepo.create({
        userId: transaction.userId,
      });
    }

    const duration = transaction.plan.includes('YEARLY') ? 1 : 1;

    const unit = transaction.plan.includes('YEARLY') ? 'year' : 'month';

    subscription.plan = transaction.plan;

    subscription.status = SubscriptionStatus.ACTIVE;

    subscription.currentPeriodStart = new Date();

    subscription.currentPeriodEnd = dayjs()
      .add(duration, unit as any)
      .toDate();

    await this.subscriptionRepo.save(subscription);
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.cancelAtPeriodEnd = true;

    return this.subscriptionRepo.save(subscription);
  }
}
