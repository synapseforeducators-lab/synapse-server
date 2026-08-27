import { BeforeInsert, Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common';
import { Role } from '../enums/role.enum';
import { VerificationCodeUserCase } from '../enums/user.enum';
import { School } from 'src/schools/entities/school.entity';
import { Support } from 'src/support/entities/support.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column({ type: 'text', nullable: true })
  password: string;

  @Column({ type: 'text', nullable: true })
  profile_photo_url?: string;

  @Column({ type: 'text', nullable: true })
  postal_address?: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  first_name: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  last_name: string;

  @Index()
  @Column({ type: 'text', unique: true, nullable: true })
  email: string;

  @Index()
  @Column({ type: 'text', unique: true, nullable: true })
  phone_number: string;

  @Column({ type: 'jsonb', nullable: true })
  verification_token?: {
    code: string;
    expired_at: Date;
    use_case: VerificationCodeUserCase;
  };

  @Column({
    type: 'enum',
    nullable: false,
    default: Role.USER,
    enum: Role,
  })
  role: Role;

  @Column({ type: 'boolean', nullable: false, default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_complete_profile: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_individual_only: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_school_admin: boolean;

  @OneToMany(() => School, (school) => school.owner)
  schools: School[];

  @OneToMany(() => Support, (support) => support.user)
  supports: Support[];

  @BeforeInsert()
  async updateName() {
    this.first_name = this.first_name.toLowerCase().trim();
    this.last_name = this.last_name.toLowerCase().trim();
    this.email = this.email.toLowerCase().trim();
  }
}
