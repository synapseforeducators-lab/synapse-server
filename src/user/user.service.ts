import { SmsService } from './../common/sms/sms.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CompleteSignupDto,
  NewPasswordDto,
  ResetPasswordDto,
  SignupChannelType,
  SignupUserDto,
  UpdateProfileDto,
} from './dto';
import { UsersRepository } from './repository/users.repository';
import * as bcrypt from 'bcryptjs';
import { GetUserByEmailDto, GetUserByPhoneDto } from './dto/get-user.dto';
import { User } from './entities/user.entity';
import {
  customResponse,
  encryptPayload,
  otpGenerator,
  phoneNumberFormatter,
} from 'src/common/util';
import { TokenPayload } from 'src/common/interfaces';
import { PasswordUpdateDto } from './dto/password-update.dto';
import { PhoneVerificationDto, UserLoginDto } from 'src/auth/dto';
import { ConfigService } from '@nestjs/config';
import { SignupLoginEnum, VerificationCodeUserCase } from './enums/user.enum';
import { UpdateNameDto } from './dto/update-name.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-user-details.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly smsService: SmsService,
    // private readonly dojahService: DojahService,
    private readonly configService: ConfigService,
  ) {}

  async creatUser(signupUserDto: SignupUserDto) {
    const { email, phone_number, channel } = signupUserDto;

    if (channel === SignupChannelType.EMAIL) {
      const emailExist = await this.usersRepository.findOne({
        email: email,
      });

      if (emailExist) {
        if (emailExist?.email_verified)
          throw new ForbiddenException(
            'User with this email address exist, kindly login',
          );

        const { user, code } =
          await this.usersRepository.signupExist(signupUserDto);

        return { user, code };
      }
    }

    if (channel === SignupChannelType.PHONE) {
      const userResponse = await this.usersRepository.findOne({
        phone_number: phoneNumberFormatter(phone_number),
      });

      // if (userResponse) {
      //   if (userResponse?.phone_verified) {
      //     return customResponse(
      //       'User already exist',
      //       SignupLoginEnum.AUTH_LOGIN,
      //     );
      //   }
      //   const { user, code } =
      //     await this.usersRepository.signupExist(signupUserDto);

      //    customResponse(
      //     'Account created, complete signup',
      //     SignupLoginEnum.AUTH_SIGNUP,
      //   );
      // }

      if (!userResponse) {
        const { user, code } = await this.usersRepository.signUp(signupUserDto);

        return { user, code, session: SignupLoginEnum.AUTH_SIGNUP };
      }

      if (userResponse?.phone_verified) {
        return {
          user: userResponse,
          code: null,
          session: SignupLoginEnum.AUTH_LOGIN,
        };
      }

      const { user, code } =
        await this.usersRepository.signupExist(signupUserDto);

      return { user, code, session: SignupLoginEnum.AUTH_SIGNUP };
    }
  }

  // async resendPhoneNumberVerification(getUserByPhoneDto: GetUserByPhoneDto) {
  //   const user = await this.usersRepository.findOne({
  //     phone_number: getUserByPhoneDto.phone_number,
  //   });

  //   if (!user) throw new ForbiddenException('Something went wrong, Try again!');

  //   if (user.phone_verified)
  //     throw new ForbiddenException('User phone number already verified');

  //   if (
  //     user.verification_token?.use_case !==
  //     VerificationCodeUserCase.PHONE_VERIFICATION
  //   )
  //     throw new ForbiddenException('Something went wrong, Try again!');

  //   const code = otpGenerator(4);

  //   const updatedUser = await this.usersRepository.findOneAndUpdate(
  //     {
  //       phone_number: user.phone_number,
  //     },
  //     {
  //       verification_token: {
  //         code: await bcrypt.hash(code, 10),
  //         expired_at: new Date(new Date().getTime() + 10 * 60000),
  //         use_case: VerificationCodeUserCase.PHONE_VERIFICATION,
  //       },
  //     },
  //   );

  //   return { user: updatedUser, code };
  // }

  async completeSignup(completeSignupDto: CompleteSignupDto) {
    const { code, phone_number, email } = completeSignupDto;

    const userResponse = await this.usersRepository.findOne({
      phone_number: phoneNumberFormatter(phone_number),
    });
    if (!userResponse) {
      throw new BadRequestException('User not found');
    }
    // if (user.phone_verified) {
    //   throw new ForbiddenException('User phone number already verified');
    // }

    if (
      userResponse.verification_token?.use_case !==
      VerificationCodeUserCase.PHONE_VERIFICATION
    ) {
      throw new ForbiddenException('Unable to verify phone, Try again!');
    }

    const currentTime = new Date().getTime();
    const expiredTime = new Date(
      userResponse.verification_token.expired_at,
    ).getTime();

    if (currentTime > expiredTime)
      throw new BadRequestException(
        'The OTP code has expired. Please request a new one.',
      );
    const isOtpValid = await bcrypt.compare(
      code,
      userResponse.verification_token.code,
    );

    if (!isOtpValid) {
      throw new BadRequestException(
        'Invalid OTP. Please double-check the code and try again.',
      );
    }
    if (email) {
      const emailExists = await this.usersRepository.findOne({ email });
      if (emailExists && emailExists.id !== userResponse.id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const { user } = await this.usersRepository.createBuyerAccount(
      completeSignupDto,
      userResponse.id,
    );



    return { user };
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    const { code, phone_number } = newPasswordDto;

    const userResponse = await this.usersRepository.findOne({
      phone_number: phoneNumberFormatter(phone_number),
    });
    if (!userResponse) {
      throw new BadRequestException('User not found');
    }
    // if (user.phone_verified) {
    //   throw new ForbiddenException('User phone number already verified');
    // }

    if (
      userResponse.verification_token?.use_case !==
      VerificationCodeUserCase.PASSWORD_RESET
    ) {
      throw new ForbiddenException('New Password already set , Try again!');
    }

    const currentTime = new Date().getTime();
    const expiredTime = new Date(
      userResponse.verification_token.expired_at,
    ).getTime();

    if (currentTime > expiredTime)
      throw new BadRequestException(
        'The OTP code has expired. Please request a new one.',
      );
    const isOtpValid = await bcrypt.compare(
      code,
      userResponse.verification_token.code,
    );

    if (!isOtpValid) {
      throw new BadRequestException(
        'Invalid OTP. Please double-check the code and try again.',
      );
    }

    const { user } = await this.usersRepository.newPassword(
      newPasswordDto,
      userResponse.id,
    );

    console.log({ user });

    return { user };
  }

  async validateUser(userLoginDto: UserLoginDto) {
    const { phone_number, password } = userLoginDto;

    /*
      Validate Phone number exist and password is valid
    */
    const user = await this.usersRepository.findOne({
      phone_number: phoneNumberFormatter(phone_number),
    });

    console.log({ phone_number, password });

    if (!user) throw new BadRequestException('Invalid login Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new BadRequestException('Invalid login Credentials');

    /*
      If Phone number not verified, Kindly send verification again
    */
    if (!user.phone_verified) {
      const code = otpGenerator(4);
      await this.usersRepository.findOneAndUpdate(
        { id: user.id },
        {
          verification_token: {
            code: await bcrypt.hash(code, 10),
            expired_at: new Date(new Date().getTime() + 10 * 60000),
            use_case: VerificationCodeUserCase.PHONE_VERIFICATION,
          },
        },
      );

      this.smsService
        .phoneNumberVerification(user.phone_number, code)
        .then()
        .catch((error) => console.log({ error }));

      throw new ForbiddenException('phone number not verified, signup ');
    }

    return user;
  }

  async validateUserJwt(tokenPayload: TokenPayload) {
    return await this.usersRepository.findOne({
      phone_number: tokenPayload.phone_number,
      id: tokenPayload.id,
    });
  }



  async updateEmail(user: User, updateEmailDto: UpdateEmailDto) {
    return await this.usersRepository.findOneAndUpdate(
      {
        id: user.id,
      },
      updateEmailDto,
    );
  }

  // async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
  //   if (updateProfileDto?.dob) {
  //     const currentYear = new Date().getFullYear();
  //     const yearOfBirth = parseInt(updateProfileDto.dob.split('-')[0]);
  //     const age = currentYear - yearOfBirth;
  //     console.log({ age });

  //     if (age < 18) {
  //       throw new ForbiddenException(
  //         'user on the platform must be at least 18 years old',
  //       );
  //     }
  //   }
  //   if (updateProfileDto?.dob && user.dob) {
  //     throw new ForbiddenException(
  //       'Kindly contact customer service, can not update date of birth more than once',
  //     );
  //   }
  //   const updatedUser = await this.usersRepository.findOneAndUpdate(
  //     {
  //       id: user.id,
  //     },
  //     { ...updateProfileDto },
  //   );

  //   delete updatedUser.password;
  //   delete updatedUser.verification_token;
  //   // updatedUser.bvn = maskLastSixDigits(updatedUser.bvn);

  //   return customResponse('Profile Updated', updatedUser);
  // }

  // async updatePassword(passwordUpdateDto: PasswordUpdateDto, user: User) {
  //   const isPasswordValid = await bcrypt.compare(
  //     passwordUpdateDto.old_password,
  //     user.password,
  //   );

  //   if (!isPasswordValid) throw new BadRequestException('Invalid Old Password');

  //   await this.usersRepository.findOneAndUpdate(
  //     {
  //       id: user.id,
  //     },
  //     {
  //       password: await bcrypt.hash(passwordUpdateDto.new_password, 10),
  //     },
  //   );

  //   return customResponse('Your password was changed successfully');
  // }

  // async getUserByEmail(getUserByEmailDto: GetUserByEmailDto) {
  //   return this.usersRepository.findOne({ email: getUserByEmailDto.email });
  // }

  // async passwordResetReq(getUserByPhoneDto: GetUserByPhoneDto) {
  //   const { phone_number } = getUserByPhoneDto;
  //   const user = await this.usersRepository.findOne({
  //     phone_number,
  //     phone_verified: true,
  //   });
  //   if (!user) throw new BadRequestException('Something went wrong, Try again');

  //   const code = otpGenerator(4);

  //   const updatedUser = await this.usersRepository.findOneAndUpdate(
  //     {
  //       phone_number: user.phone_number,
  //     },
  //     {
  //       verification_token: {
  //         code: await bcrypt.hash(code, 10),
  //         expired_at: new Date(new Date().getTime() + 10 * 60000),
  //         use_case: VerificationCodeUserCase.PASSWORD_RESET,
  //       },
  //     },
  //   );

  //   return { user: updatedUser, code };
  // }

  // async passwordResetReqResend(getUserByPhoneDto: GetUserByPhoneDto) {
  //   const user = await this.usersRepository.findOne({
  //     phone_number: getUserByPhoneDto.phone_number,
  //     phone_verified: true,
  //   });

  //   if (!user) throw new ForbiddenException('Something went wrong, Try again!');

  //   if (
  //     user.verification_token?.use_case !==
  //     VerificationCodeUserCase.PASSWORD_RESET
  //   )
  //     throw new ForbiddenException('Something went wrong, Try again!');

  //   const code = otpGenerator(4);

  //   const updatedUser = await this.usersRepository.findOneAndUpdate(
  //     {
  //       phone_number: user.phone_number,
  //     },
  //     {
  //       verification_token: {
  //         code: await bcrypt.hash(code, 10),
  //         expired_at: new Date(new Date().getTime() + 10 * 60000),
  //         use_case: VerificationCodeUserCase.PASSWORD_RESET,
  //       },
  //     },
  //   );

  //   return { user: updatedUser, code };
  // }

  // async passwordReset(passwordResetDto: PasswordResetDto) {
  //   const { password, code, phone_number } = passwordResetDto;

  //   const user = await this.usersRepository.findOne({
  //     phone_number,
  //     phone_verified: true,
  //   });

  //   if (!user)
  //     throw new BadRequestException(
  //       'Invalid OTP. Please double-check the code and try again.',
  //     );

  //   if (
  //     user.verification_token?.use_case !==
  //     VerificationCodeUserCase.PASSWORD_RESET
  //   )
  //     throw new ForbiddenException('Something went wrong, Try again!');

  //   const currentTime = new Date().getTime();
  //   const expiredTime = new Date(user.verification_token.expired_at).getTime();

  //   if (currentTime > expiredTime)
  //     throw new BadRequestException(
  //       'The OTP code has expired. Please request a new one.',
  //     );
  //   const isOtpValid = await bcrypt.compare(code, user.verification_token.code);

  //   if (!isOtpValid)
  //     throw new BadRequestException(
  //       'Invalid OTP. Please double-check the code and try again.',
  //     );
  //   await this.usersRepository.findOneAndUpdate(
  //     {
  //       phone_number: user.phone_number,
  //     },
  //     {
  //       password: await bcrypt.hash(password, 10),
  //       verification_token: null,
  //     },
  //   );

  //   return customResponse('Password updated successfully, kindly login');
  // }

  // async verifyBvn(user: User, verifyBvnDto: VerifyBvnDto) {
  //   await this.payStackService.createCustomer(user.email, user.id);
  //   if (user?.bvn_verified && user?.wallet?.paystackCustomerId)
  //     throw new ForbiddenException('Your Bvn has previously been verified');
  //   const { bvn } = verifyBvnDto;

  //   //Enc BvN
  //   const encBvn = encryptPayload(
  //     bvn,
  //     this.configService.get('ENCRYPTION_KEY'),
  //     this.configService.get('ENCRYPTION_VECTOR'),
  //   );

  //   //Find Enc BVN
  //   const encBvnExist = await this.usersRepository.findOne({
  //     bvn: encBvn,
  //   });

  //   if (encBvnExist)
  //     throw new ForbiddenException('BVN associated with another account');

  //   //Verify Bvn From Verification system
  //   const bvnVerified = await this.dojahService.lookupBvn(verifyBvnDto.bvn);
  //   if (!bvnVerified)
  //     throw new ForbiddenException('Unable to verify BVN at the moment');
  //   console.log('dojan issues', { bvnVerified });

  //   //Save Enc Bvn and mark bvn verified as true
  //   await this.usersRepository.findOneAndUpdate(
  //     {
  //       id: user.id,
  //     },
  //     { bvn: encBvn, bvn_verified: true },
  //   );

  //   await this.payStackService.createCustomer(user.email, user.id);

  //   return customResponse('BVN has been verified');
  // }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { phone_number, channel } = resetPasswordDto;
    const generatedCode = otpGenerator(5);

    const userResponse = await this.usersRepository.findOneAndUpdate(
      {
        phone_number: phoneNumberFormatter(phone_number),
      },
      {
        verification_token: {
          code: await bcrypt.hash(generatedCode, 10),
          expired_at: new Date(new Date().getTime() + 10 * 2700000),
          use_case: VerificationCodeUserCase.PASSWORD_RESET,
        },
      },
    );

    if (!userResponse) {
      throw new ForbiddenException('User does not exist');
    }

    return { user: userResponse, code: generatedCode };
  }

  async updatePassword(user: User, updatePasswordDto: UpdatePasswordDto) {
    const { old_password, new_password } = updatePasswordDto;

    /*
      Validate Phone number exist and password is valid
    */
    const userResponse = await this.usersRepository.findOne({
      phone_number: phoneNumberFormatter(user?.phone_number),
    });

    if (!userResponse)
      throw new BadRequestException('Something went wrong, Try again');

    const isPasswordValid = await bcrypt.compare(
      old_password,
      userResponse.password,
    );

    if (!isPasswordValid)
      throw new BadRequestException('Invalid password, Try again');

    const updateUser = await this.usersRepository.findOneAndUpdate(
      { id: userResponse.id },
      {
        password: await bcrypt.hash(new_password, 10),
      },
    );

    if (!updateUser)
      throw new InternalServerErrorException(
        'Unable to update password, Try again',
      );

    return customResponse('Your password was changed successfully', updateUser);
  }
}
