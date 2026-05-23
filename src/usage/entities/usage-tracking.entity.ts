import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UsageType } from '../enums/usage-type.enum';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Entity('usage_tracking')
@Index(['userId', 'type', 'period'], { unique: true })
export class UsageTracking extends AbstractEntity<UsageTracking> {
  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: UsageType,
  })
  type: UsageType;

  @Column({ default: 0 })
  count: number;

  @Column()
  period: string;
}
