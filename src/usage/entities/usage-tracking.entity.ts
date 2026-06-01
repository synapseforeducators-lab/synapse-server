import { Entity, Column, Index } from 'typeorm';
import { UsagePeriod, UsageType } from '../enums/usage-type.enum';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Entity('usage_tracking')
@Index(['userId', 'type', 'month', 'year'], { unique: true })
export class UsageTracking extends AbstractEntity<UsageTracking> {
  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: UsageType,
  })
  type: UsageType;

  @Column({
    type: 'enum',
    enum: UsagePeriod,
  })
  usage_period: UsagePeriod;

  @Column({ default: 0 })
  count: number;

  @Column()
  month: number;

  @Column()
  year: number;
}
