import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/common';
import { SchemeOfWork } from './scheme.entity';

export enum SectionTypeEnum {
  TEXT = 'text',
  RICH_TEXT = 'rich_text',
  LIST = 'list',
  IMAGE = 'image',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  TEXTAREA = 'textarea',
}

@Entity()
export class SchemeOfWorkSection extends AbstractEntity<SchemeOfWorkSection> {
  @Column({ type: 'text', nullable: true })
  topic: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => SchemeOfWork, (scheme) => scheme.items, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'schemeId' })
  scheme: SchemeOfWork;

  @Column({ nullable: true })
  schemeId?: string;
}
