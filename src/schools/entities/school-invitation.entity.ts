import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common';
import { User } from 'src/user/entities/user.entity';
import { School, SchoolRole } from './school.entity';
import { Team } from '../../teams/entities/team.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('school_invitations')
@Index(['schoolId', 'email'], { unique: true })
export class SchoolInvitation extends AbstractEntity<SchoolInvitation> {
  @Column()
  schoolId: string;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: SchoolRole,
  })
  role: SchoolRole;

  @Column({ nullable: true })
  teamId?: string;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: Team;

  @Column({ unique: true })
  token: string;

  @Column()
  invitedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ nullable: true })
  acceptedAt?: Date;
}
