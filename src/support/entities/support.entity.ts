import { AbstractEntity } from 'src/common';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum COMPLAINT_ENUM {
  FAILED_PAYMENT = 'failed_payment',
  BILLING_ISSUE = 'billing_issue',
  ACCOUNT_ACCESS = 'account_access',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  DATA_LOSS = 'data_loss',
  PERFORMANCE = 'performance',
  OTHER = 'other',
}

@Entity()
export class Support extends AbstractEntity<Support> {
  @Column({ enum: COMPLAINT_ENUM, nullable: false })
  complaint_type: COMPLAINT_ENUM;

  @Column({ type: 'text', nullable: false })
  subject: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_fixed: boolean;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  attachment_url?: string;

  @ManyToOne(() => User, (user) => user.supports)
  @JoinColumn()
  user: User;
}
