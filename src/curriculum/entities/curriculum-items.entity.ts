import { Column, Entity, ManyToOne } from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { AbstractEntity } from 'src/common';

@Entity('curriculum_items')
export class CurriculumItem extends AbstractEntity<CurriculumItem> {
  @Column({ nullable: true })
  theme?: string;

  @Column({ nullable: true })
  topic?: string;

  @Column({ type: 'text', nullable: true })
  performanceObjectives?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.items, {
    onDelete: 'CASCADE',
  })
  curriculum: Curriculum;

  @Column()
  curriculumId: string;
}
