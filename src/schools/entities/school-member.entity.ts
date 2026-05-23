import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from '../../common';
import { User } from 'src/user/entities/user.entity';
import { School, SchoolRole } from './school.entity';


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

  @Column({ default: true })
  active: boolean;
}
