    import { AbstractEntity } from 'src/common';
import { BeforeInsert, Column, Entity } from 'typeorm';

@Entity('Grades')
export class Grade extends AbstractEntity<Grade> {
  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_archived: boolean;

  @BeforeInsert()
  async formatGradeName() {
    this.name = this.name.trim().toLowerCase();
  }
}
