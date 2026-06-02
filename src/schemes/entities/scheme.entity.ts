import { Curriculum } from 'src/curriculum/entities/curriculum.entity';
import { School } from 'src/schools/entities/school.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { SchemeStatus } from '../enums/scheme-status.enum';
import { AbstractEntity } from 'src/common/database/abstract.entity';
import { SchemeOfWorkSection } from './scheme-item.entity';
import { Subject } from 'src/subject/entities/subject.entity';
import { Grade } from 'src/grades/entities/grade.entity';
import { Term } from 'src/schools/entities/school-term.entity';

@Entity('schemes')
@Index(['schoolId', 'subjectId', 'gradeId', 'term', 'curriculumId'], {
  unique: true,
})
export class SchemeOfWork extends AbstractEntity<SchemeOfWork> {
  @Column({ nullable: true })
  subjectId?: string | null;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  gradeId: string;

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @Column()
  termId: string;

  @ManyToOne(() => Term)
  @JoinColumn({ name: 'termId' })
  term: Term;

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
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @OneToMany(() => SchemeOfWorkSection, (section) => section.scheme, {
    cascade: true,
    eager: true,
  })
  items: SchemeOfWorkSection[];
}
