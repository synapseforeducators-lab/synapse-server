import { AbstractEntity } from 'src/common';
import { School } from 'src/user/entities/school.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CurriculumItem } from './curriculum-entity.entity';

@Entity()
export class Curriculum extends AbstractEntity<Curriculum> {
  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  grade: string;

  @ManyToOne(() => School, { nullable: true, eager: false })
  school: School | null;

  @ManyToOne(() => User, { eager: false })
  createdBy: User;

  @OneToMany(() => CurriculumItem, (item) => item.curriculum, {
    cascade: true,
    eager: true,
  })
  items: CurriculumItem[];
}
