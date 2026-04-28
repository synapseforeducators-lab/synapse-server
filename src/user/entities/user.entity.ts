import { Column, Entity, Generated, Index, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../common';
import { Role } from '../enums/role.enum';
import { VerificationCodeUserCase } from '../enums/user.enum';


@Entity()
export class User extends AbstractEntity<User> {
  @Column({ type: 'text', nullable: true })
  password?: string;

  @Index()
  @Column({ type: 'text', unique: true, nullable: true })
  phone_number?: string;

  @Index()
  @Column({ type: 'text', unique: true, nullable: true })
  email?: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  currentOtp?: string;

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
  phone_verified: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  isBuyer: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  isFarmer: boolean;


}
