import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,

} from 'typeorm';
import { BillingPlan } from '../enum/billing-plan.enum';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { SubscriptionStatus } from '../enum/subscription-status.enum';

@Entity('user_subscriptions')
export class UserSubscription extends AbstractEntity<UserSubscription> {
  @Column({ unique: true })
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: BillingPlan,
  })
  plan: BillingPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: true })
  currentPeriodStart?: Date;

  @Column({ nullable: true })
  currentPeriodEnd?: Date;

  @Column({ nullable: true })
  trialEndsAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  paystackCustomerCode?: string;

  @Column({ nullable: true })
  paystackSubscriptionCode?: string;

  @Column({ nullable: true })
  paystackEmailToken?: string;
}
