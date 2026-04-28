import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { otpGenerator, phoneNumberFormatter } from 'src/common/util';
import {
  CompleteSignupDto,
  NewPasswordDto,
  SignupChannelType,
  SignupUserDto,
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

  async signUp(createUserDto: SignupUserDto) {
    let user: User;
    const code = otpGenerator(5);

    const useCase =
      createUserDto.channel === SignupChannelType.EMAIL
        ? VerificationCodeUserCase.EMAIL_VERIFICATION
        : VerificationCodeUserCase.PHONE_VERIFICATION;

    // Build the query dynamically
    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        user = await transactionalEntityManager.save(User, {
          phone_number: phoneNumberFormatter(createUserDto.phone_number),
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

    const useCase =
      createUserDto.channel === SignupChannelType.EMAIL
        ? VerificationCodeUserCase.EMAIL_VERIFICATION
        : VerificationCodeUserCase.PHONE_VERIFICATION;

    // Build the query dynamically
    const query = {
      phone_number: phoneNumberFormatter(createUserDto.phone_number),
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

  async createBuyerAccount(
    completeSignupDto: CompleteSignupDto,
    userId: string,
  ) {
    // const user = await this.repository.update(
    //   { phone_number: phoneNumberFormatter(completeSignupDto.phone_number) },
    //   {
    //     email: completeSignupDto.email,
    //     password: await bcrypt.hash(completeSignupDto.password, 10),
    //   },
    // );

    let user: User;
    // let buyer: Buyer;
    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        await transactionalEntityManager.update(
          User,
          { id: userId },
          {
            email: completeSignupDto.email,
            isBuyer: true,
            password: await bcrypt.hash(completeSignupDto.password, 10),
            phone_verified: true,
            verification_token: null,
          },
        );
        user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

        // buyer = await transactionalEntityManager.save(Buyer, {
        //   first_name: completeSignupDto.first_name,
        //   last_name: completeSignupDto.last_name,
        //   user: user,
        // });
        // await transactionalEntityManager.save(Seller, {
        //   user: user,
        // });
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
    return { user};
  }
}
