import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common';
import { User } from './user.entity';

@Entity()
export class School extends AbstractEntity<School> {
  @Column({ type: 'text', nullable: true })
  school_logo_url?: string;

  @Column({ unique: true })
  school_name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  postal_address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => User, (user) => user.school)
  users: User[];

  @BeforeInsert()
  async updateRecord() {
    this.school_name = this.school_name.toLowerCase().trim();
  }
}
