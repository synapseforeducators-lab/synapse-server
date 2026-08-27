import { SchemeOfWorkSection } from './../../schemes/entities/scheme-item.entity';
import { AbstractEntity } from 'src/common';
import { Curriculum } from 'src/curriculum/entities/curriculum.entity';
import { SchemeOfWork } from 'src/schemes/entities/scheme.entity';
import { School } from 'src/schools/entities/school.entity';
import { Template } from 'src/template/entities/template.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('notes')
export class Note extends AbstractEntity<Note> {
  @Column()
  schemeOfWorkSectionId: string;

  @ManyToOne(() => SchemeOfWorkSection)
  @JoinColumn({ name: 'schemeOfWorkSectionId' })
  schemeOfWorkSection: SchemeOfWorkSection;

  @Column()
  schemeId: string;

  @ManyToOne(() => SchemeOfWork)
  @JoinColumn({ name: 'schemeId' })
  scheme: SchemeOfWork;

  @Column()
  curriculumId: string;

  @ManyToOne(() => Curriculum)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @Column()
  templateId: string;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @ManyToOne(() => School, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  school: School | null;

  @Column({ nullable: true })
  schoolId?: string | null;

  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'json', nullable: true })
  contents: any[];
}
