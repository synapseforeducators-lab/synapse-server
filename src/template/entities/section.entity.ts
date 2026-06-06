import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Template } from './template.entity';
import { AbstractEntity } from 'src/common';

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

export interface TemplateField {
  type: SectionTypeEnum;
  label: string;
  required: boolean;
  order: number;
}

@Entity()
export class TemplateSection extends AbstractEntity<TemplateSection> {
  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'json', nullable: true })
  fields: TemplateField[];

  @ManyToOne(() => Template, (template) => template.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ nullable: true })
  templateId?: string;
}
