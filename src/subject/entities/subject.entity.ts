import { AbstractEntity } from 'src/common';
import { Column } from 'typeorm';

export class Subject extends AbstractEntity<Subject> {
  @Column({ type: 'text', unique: true })
  name: string;
}
