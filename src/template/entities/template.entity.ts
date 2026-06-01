import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TemplateSection } from './section.entity';
import { AbstractEntity } from 'src/common';
import { School } from 'src/schools/entities/school.entity';

@Entity('templates')
export class Template extends AbstractEntity<Template> {
  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  school_name: string;

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

  @OneToMany(() => TemplateSection, (section) => section.template, {
    cascade: true,
    eager: true,
  })
  sections: TemplateSection[];

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;
}
