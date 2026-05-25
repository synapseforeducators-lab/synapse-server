import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { AcademicSessionStatus } from '../enums/academic-session-status.enum';
@Entity('academic_sessions')
@Index(['name'], { unique: true })
export class AcademicSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "2025/2026"

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: AcademicSessionStatus,
    default: AcademicSessionStatus.INACTIVE,
  })
  status: AcademicSessionStatus;

  @Column({ default: false })
  isCurrent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
