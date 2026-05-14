import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { otpGenerator, phoneNumberFormatter } from 'src/common/util';
import {
  NewPasswordDto,
  SignupChannelType,
  SignupUserDto,
  VerifySignupDto,
} from '../dto';
import { VerificationCodeUserCase } from '../enums/user.enum';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectRepository(User)
    usersRepository: Repository<User>,
    entityManager: EntityManager,
  ) {
    super(usersRepository, entityManager);
  }

  async signup(createUserDto: SignupUserDto) {
    const { first_name, last_name, email, password } = createUserDto;
    let user: User;
    const code = otpGenerator(6);

    const useCase = VerificationCodeUserCase.EMAIL_VERIFICATION;

    // Build the query dynamically
    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        user = await transactionalEntityManager.save(User, {
          first_name,
          last_name,
          email,
          password: await bcrypt.hash(password, 10),
          verification_token: {
            code: await bcrypt.hash(code, 10),
            expired_at: new Date(new Date().getTime() + 10 * 60000),
            use_case: useCase,
          },
        });
      },
    );

    return { code, user };
  }

  async signupExist(createUserDto: SignupUserDto) {
    const code = otpGenerator(5);

    // const field =
    //   createUserDto.channel === SignupChannelType.EMAIL
    //     ? 'email'
    //     : 'phone_number';

    const useCase = VerificationCodeUserCase.EMAIL_VERIFICATION;

    // Build the query dynamically
    const query = {
      email: createUserDto.email,
    };

    // Update the verification token and get the updated user
    const user = await this.findOneAndUpdate(query, {
      verification_token: {
        code: await bcrypt.hash(code, 10),
        expired_at: new Date(Date.now() + 10 * 60000),
        use_case: useCase,
      },
    });
    return { code, user };
  }

  async verifySignup(userId: string) {
    let user: User;
    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.update(
          User,
          { id: userId },
          {
            email_verified: true,
            verification_token: null,
          },
        );
        user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });
      },
    );
    return { user };
  }

  async newPassword(newPasswordDto: NewPasswordDto, userId: string) {
    let user: User;
    // let buyer: Buyer;
    // let seller: Seller;
    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.update(
          User,
          { id: userId },
          {
            password: await bcrypt.hash(newPasswordDto.password, 10),
            verification_token: null,
          },
        );
        user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });
        // buyer = await transactionalEntityManager.findOne(Buyer, {
        //   where: { user: { id: userId } },
        // });
        // seller = await transactionalEntityManager.findOne(Seller, {
        //   where: { user: { id: userId } },
        // });
      },
    );
    return { user };
  }
}
