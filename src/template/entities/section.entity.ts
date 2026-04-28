import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Template } from './template.entity';
import { AbstractEntity } from 'src/common';

export enum SectionType {
  TEXT = 'text',
  RICH_TEXT = 'rich_text',
  LIST = 'list',
  IMAGE = 'image',
}

@Entity()
export class TemplateSection extends AbstractEntity<TemplateSection> {
  @Column({ type: 'text', nullable: true })
  label: string;

  @Column({
    type: 'enum',
    enum: SectionType,
    default: SectionType.TEXT,
  })
  type: SectionType;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Template, (template) => template.sections, {
    onDelete: 'CASCADE',
  })
  template: Template;
}
