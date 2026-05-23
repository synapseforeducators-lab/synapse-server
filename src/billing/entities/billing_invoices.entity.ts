import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { BillingStatus } from "../enum/billing-status.enum";
import { AbstractEntity } from "src/common";

@Entity('billing_invoices')
export class BillingInvoice extends AbstractEntity<BillingInvoice> {

  @Column()
  subscriptionId: string;

  @Column()
  amount: number;

  @Column()
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: BillingStatus,
  })
  status: BillingStatus;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column()
  invoiceNumber: string;

}