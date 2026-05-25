import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common';
import { User } from 'src/user/entities/user.entity';
import { School, SchoolRole } from './school.entity';

export enum SchoolMemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
  REJECTED = 'REJECTED',
}

@Entity('school_members')
export class SchoolMember extends AbstractEntity<SchoolMember> {
  @Column()
  schoolId: string;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: SchoolRole,
  })
  role: SchoolRole;

  @Column({
    type: 'enum',
    enum: SchoolMemberStatus,
    default: SchoolMemberStatus.PENDING,
  })
  status: SchoolMemberStatus;

  @Column({ nullable: true })
  active: boolean;
}
