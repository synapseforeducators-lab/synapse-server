import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common';
import { User } from 'src/user/entities/user.entity';

export enum SchoolRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  SUBJECT_TEACHER = 'SUBJECT_TEACHER',
  TEACHER = 'TEACHER',
  HEAD_TEACHER = 'HEAD_TEACHER',
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  DIRECTOR = 'DIRECTOR',
  HEAD_OF_DEPARTMENT = 'HEAD_OF_DEPARTMENT',
}

export enum SchoolTypeEnum {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum SchoolGradeEnum {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  BOTH = 'BOTH',
}

@Entity('schools')
export class School extends AbstractEntity<School> {
  @Column({ type: 'text', nullable: true })
  school_logo_url?: string;

  @Column({ unique: true })
  school_name: string;

  @Column({ nullable: true, enum: SchoolTypeEnum, type: 'enum' })
  type: SchoolTypeEnum;

  @Column({ nullable: true, enum: SchoolGradeEnum, type: 'enum' })
  grade: SchoolGradeEnum;

  @Column({ nullable: true })
  postal_address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true, default: false })
  is_school_verified: boolean;

  @Column({ nullable: true })
  country: string;

  @Column()
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @BeforeInsert()
  async updateRecord() {
    this.school_name = this.school_name.toLowerCase().trim();
  }
}
