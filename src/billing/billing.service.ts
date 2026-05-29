import { SchoolsService } from './../schools/school.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import * as crypto from 'crypto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaystackService } from './paystack/paystack.service';
import { BILLING_PLANS } from './constants/plan';
import { BillingTransaction } from './entities/billing_transactions.entity';
import { UserSubscription } from './entities/user_subscriptions.entity';
import { BillingStatus } from './enum/billing-status.enum';
import { SubscriptionStatus } from './enum/subscription-status.enum';
import { User } from 'src/user/entities/user.entity';
import {
  BillingQueryParamsDto,
  CreateBillingDto,
} from './dto/create-billing.dto';
import { SchoolSubscription } from './entities/school_subscriptions.entity';
import { BillingPlan } from './enum/billing-plan.enum';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(BillingTransaction)
    private readonly transactionRepo: Repository<BillingTransaction>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepo: Repository<UserSubscription>,
    @InjectRepository(SchoolSubscription)
    private readonly schoolSubscriptionRepo: Repository<SchoolSubscription>,
    private readonly paystack: PaystackService,
    private readonly schoolsService: SchoolsService,
  ) {}

  async initializeCheckout(user: User, createBillingDto: CreateBillingDto) {
    const subscription = createBillingDto.plan.includes('SCHOOL')
      ? await this.getSchoolCurrentSubscription(user.id)
      : await this.getUserCurrentSubscription(user.id);

    if (
      subscription.plan !== BillingPlan.FREE &&
      subscription.plan === createBillingDto.plan
    ) {
      throw new BadRequestException('Existing active subscription');
    }

    const planConfig = BILLING_PLANS[createBillingDto.plan];

    if (!planConfig) {
      throw new BadRequestException('Invalid billing plan');
    }

    const planRes = await this.paystack.getSubscriptionList();

    if (!planRes) {
      throw new BadRequestException('Invalid billing plan');
    }

    const plan = planRes.find((plan) => {
      if (plan.name === createBillingDto.plan) {
        return plan;
      }
    });

    console.log('Plan response:', plan);

    const reference = `txn_${crypto.randomUUID()}`;

    const transaction = await this.transactionRepo.save({
      userId: user.id,
      reference,
      amount: planConfig.price,
      currency: 'NGN',
      email: user.email,
      plan: createBillingDto.plan,
      status: BillingStatus.PENDING,
      schoolId: createBillingDto.schoolId,
    });

    console.log('transaction initialized:', transaction);

    const payment = await this.paystack.initializeTransaction({
      email: user.email,
      amount: planConfig.price * 100,
      reference,
      plan: planRes.plan_code,
    });

    console.log('Payment initialized:', payment);

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
    let subscription;
    if (
      transaction.plan === 'SCHOOL_MONTHLY' ||
      transaction.plan === 'SCHOOL_YEARLY'
    ) {
      subscription = await this.schoolSubscriptionRepo.findOne({
        where: {
          schoolId: transaction.schoolId,
        },
      });

      if (!subscription) {
        subscription = this.schoolSubscriptionRepo.create({
          schoolId: transaction.schoolId,
          school: await this.schoolsService.findSchoolByUser(
            transaction.userId,
          ),
        });
      }
    }

    if (
      transaction.plan === 'STANDARD_MONTHLY' ||
      transaction.plan === 'STANDARD_YEARLY'
    ) {
      subscription = await this.userSubscriptionRepo.findOne({
        where: {
          userId: transaction.userId,
        },
      });

      if (!subscription) {
        subscription = this.userSubscriptionRepo.create({
          userId: transaction.userId,
        });
      }
    }

    const duration = transaction.plan.includes('YEARLY') ? 1 : 1;

    const unit = transaction.plan.includes('YEARLY') ? 'year' : 'month';

    subscription.plan = transaction.plan;

    subscription.status = SubscriptionStatus.ACTIVE;

    subscription.currentPeriodStart = new Date();

    const currentPeriodEnd = new Date();

    unit === 'month'
      ? currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + duration)
      : currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + duration);

    subscription.currentPeriodEnd = currentPeriodEnd;

    if (transaction.plan.includes('SCHOOL')) {
      return await this.schoolSubscriptionRepo.save(subscription);
    }

    return await this.userSubscriptionRepo.save(subscription);
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await this.userSubscriptionRepo.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.cancelAtPeriodEnd = true;

    return this.userSubscriptionRepo.save(subscription);
  }

  async getSubscriptionList() {
    return this.paystack.getSubscriptionList();
  }
  async getSubscriptionById(id: string) {
    return this.paystack.getSubscriptionById(id);
  }
  async getUserCurrentSubscription(userId: string) {
    const subscription = await this.userSubscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) {
      return { plan: BillingPlan.FREE };
    }

    const oneDay = 24 * 60 * 60 * 1000;

    const daysDifference =
      (new Date(subscription.currentPeriodEnd).getTime() -
        new Date(subscription.currentPeriodStart).getTime()) /
      oneDay;

    if (daysDifference < 1) {
      subscription.status = SubscriptionStatus.EXPIRED;
      return await this.userSubscriptionRepo.save(subscription);
    }

    return subscription;
  }
  async getSchoolCurrentSubscription(userId: string) {
    const school = await this.schoolsService.findSchoolByUser(userId);

    if (!school) {
      return { plan: BillingPlan.FREE };
    }

    const subscription = await this.schoolSubscriptionRepo.findOne({
      where: { schoolId: school.id, status: SubscriptionStatus.ACTIVE },
    });

    if (!subscription) {
      return { plan: BillingPlan.FREE };
    }

    const oneDay = 24 * 60 * 60 * 1000;

    const daysDifference =
      (new Date(subscription.currentPeriodEnd).getTime() -
        new Date(subscription.currentPeriodStart).getTime()) /
      oneDay;

    if (daysDifference < 1) {
      subscription.status = SubscriptionStatus.EXPIRED;
      return await this.schoolSubscriptionRepo.save(subscription);
    }

    return subscription;
  }

  async getSubscriptionDetails(id: string) {
    return this.paystack.getSubscriptionById(id);
  }

  async getInvoiceList(user: User, dto: BillingQueryParamsDto) {
    const { status, plan } = dto;
    return await this.transactionRepo.find({
      where: {
        userId: user.id,
        ...(status && { status }),
        ...(plan && { plan }),
      },
    });
  }
}
