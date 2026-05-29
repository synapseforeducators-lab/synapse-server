import { AbstractEntity } from 'src/common';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CurriculumItem } from './curriculum-items.entity';
import { School } from 'src/schools/entities/school.entity';
import { JoinColumn } from 'typeorm';
import { Subject } from 'src/subject/entities/subject.entity';
import { Grade } from 'src/grades/entities/grade.entity';

@Entity('curriculums')
export class Curriculum extends AbstractEntity<Curriculum> {
  @Column()
  name: string;

  @Column({ nullable: true })
  subjectId?: string | null;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  description: string;

  @Column()
  gradeId: string;

  @ManyToOne(() => Grade)
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @ManyToOne(() => School, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  school: School | null;

  @Column({ nullable: true })
  schoolId?: string | null;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => CurriculumItem, (item) => item.curriculum, {
    cascade: true,
  })
  items: CurriculumItem[];
}
