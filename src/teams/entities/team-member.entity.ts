import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { AbstractEntity } from 'src/common';
import { Team } from './team.entity';

export enum TeamRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
}

@Entity('team_members')
@Index(['teamId', 'userId'], { unique: true })
export class TeamMember extends AbstractEntity<TeamMember> {
  @Column()
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.MEMBER,
  })
  role: TeamRole;
}
