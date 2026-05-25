import { Curriculum } from 'src/curriculum/entities/curriculum.entity';
import { School } from 'src/schools/entities/school.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SchemeStatus } from '../enums/scheme-status.enum';
import { AcademicSession } from 'src/academic-sessions/entities/academic-session.entity';
import { AbstractEntity } from 'src/common/database/abstract.entity';

@Entity('scheme_of_work')
@Index(
  ['schoolId', 'subject', 'className', 'term', 'academicSessionId', 'version'],
  { unique: true },
)
export class SchemeOfWork extends AbstractEntity<SchemeOfWork> {
  @Column()
  subject: string;

  @Column()
  className: string;

  @Column()
  term: string;

  @Column()
  curriculumId: string;

  @ManyToOne(() => Curriculum)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @Column({ nullable: true })
  schoolId?: string;

  @ManyToOne(() => School, {
    nullable: true,
  })
  @JoinColumn({ name: 'schoolId' })
  school?: School;


  @Column()
  academicSessionId: string;

  @ManyToOne(() => AcademicSession)
  @JoinColumn({
    name: 'academicSessionId',
  })
  academicSession: AcademicSession;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  updatedById?: string;

  @ManyToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({ name: 'updatedById' })
  updatedBy?: User;

  @Column({ default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: SchemeStatus,
    default: SchemeStatus.DRAFT,
  })
  status: SchemeStatus;

  @Column({ default: false })
  published: boolean;

  @Column({ nullable: true })
  copiedFromSchemeId?: string;

  @Column({ type: 'jsonb' })
  weeks: {
    week: number;
    topic: string;
    objectives: string[];
    activities?: string[];
    evaluation?: string[];
    resources?: string[];
  }[];
}
