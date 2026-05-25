import { AbstractEntity } from 'src/common';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
 
} from 'typeorm';
import { CurriculumItem } from './curriculum-entity.entity';
import { School } from 'src/schools/entities/school.entity';

@Entity('curriculums')
export class Curriculum extends AbstractEntity<Curriculum> {
  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  grade: string;

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
