import { School } from 'src/schools/entities/school.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingPlan } from '../enum/billing-plan.enum';
import { SubscriptionStatus } from '../enum/subscription-status.enum';
import { AbstractEntity } from 'src/common';

@Entity('school_subscriptions')
export class SchoolSubscription extends AbstractEntity<SchoolSubscription> {
  @Column({ unique: true })
  schoolId: string;

  @ManyToOne(() => School)
  school: School;

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

  @Column()
  seats: number;

  @Column()
  usedSeats: number;

  @Column({ nullable: true })
  currentPeriodStart?: Date;

  @Column({ nullable: true })
  currentPeriodEnd?: Date;

  @Column({ nullable: true })
  paystackCustomerCode?: string;

  @Column({ nullable: true })
  paystackSubscriptionCode?: string;

  @Column({ nullable: true })
  paystackEmailToken?: string;
}
