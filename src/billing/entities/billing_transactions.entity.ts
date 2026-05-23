import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { BillingPlan } from "../enum/billing-plan.enum";
import { BillingStatus } from "../enum/billing-status.enum";
import { AbstractEntity } from "src/common";

@Entity('billing_transactions')
export class BillingTransaction  extends AbstractEntity<BillingTransaction> {


  @Column()
  reference: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: BillingPlan,
  })
  plan: BillingPlan;

  @Column({
    type: 'enum',
    enum: BillingStatus,
  })
  status: BillingStatus;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  authorizationUrl?: string;

  @Column({ nullable: true })
  gatewayResponse?: string;

  @Column({ nullable: true })
  channel?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  schoolId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;


}