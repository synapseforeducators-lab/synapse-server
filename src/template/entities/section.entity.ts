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

@Entity()
export class TemplateSection extends AbstractEntity<TemplateSection> {
  @Column({ type: 'text', nullable: true })
  label: string;

  @Column({
    type: 'enum',
    enum: SectionTypeEnum,
    default: SectionTypeEnum.TEXT,
  })
  type: SectionTypeEnum;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => Template, (template) => template.sections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ nullable: true })
  templateId?: string;
}
