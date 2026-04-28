import { School } from 'src/user/entities/school.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TemplateSection } from './section.entity';
import { AbstractEntity } from 'src/common';

@Entity()
export class Template extends AbstractEntity<Template> {
  @Column({ type: 'text', nullable: true })
  name: string;

  @ManyToOne(() => School, { nullable: true, eager: false })
  school: School | null;

  @ManyToOne(() => User, { eager: false })
  createdBy: User;

  @OneToMany(() => TemplateSection, (section) => section.template, {
    cascade: true,
    eager: true,
  })
  sections: TemplateSection[];
}
