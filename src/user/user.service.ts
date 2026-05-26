import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  NewPasswordDto,
  ResetPasswordDto,
  SignupUserDto,
  VerifySignupDto,
} from './dto';
import { UsersRepository } from './repository/users.repository';
import * as bcrypt from 'bcryptjs';
import { GetUserByEmailDto } from './dto/get-user.dto';
import { User } from './entities/user.entity';
import { customResponse, otpGenerator } from 'src/common/util';
import { TokenPayload } from 'src/common/interfaces';
import { UserLoginDto } from 'src/auth/dto';
import { ConfigService } from '@nestjs/config';
import { VerificationCodeUserCase } from './enums/user.enum';
import { UpdateEmailDto } from './dto/update-email.dto';
import {
  UpdatePasswordDto,
  UpdateUserProfileDto,
} from './dto/update-user-details.dto';
import { EmailService } from 'src/common/email/email.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private cloudinaryService: CloudinaryService,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    // private readonly dojahService: DojahService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupUserDto: SignupUserDto) {
    const { email } = signupUserDto;

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
      console.log(code);

      return { user, code };
    }

    const { user, code } = await this.usersRepository.signup(signupUserDto);
    console.log(code);

    return { user, code };
  }

  async resendEmailCodeVerification(getUserByEmailDto: GetUserByEmailDto) {
    const user = await this.usersRepository.findOne({
      email: getUserByEmailDto.email,
    });

    if (!user) throw new ForbiddenException('user not found');

    if (user.email_verified)
      throw new ForbiddenException('User phone number already verified');

    if (
      user.verification_token?.use_case !==
      VerificationCodeUserCase.EMAIL_VERIFICATION
    )
      throw new ForbiddenException('Something went wrong, Try again!');

    const code = otpGenerator(6);

    const updatedUser = await this.usersRepository.findOneAndUpdate(
      {
        email: user.email,
      },
      {
        verification_token: {
          code: await bcrypt.hash(code, 10),
          expired_at: new Date(new Date().getTime() + 10 * 60000),
          use_case: VerificationCodeUserCase.EMAIL_VERIFICATION,
        },
      },
    );

    return { user: updatedUser, code };
  }

  async verifySignup(verifySignupDto: VerifySignupDto) {
    const { code, email } = verifySignupDto;

    const userResponse = await this.usersRepository.findOne({
      email: email,
    });

    if (!userResponse) {
      throw new BadRequestException('User not found, signup');
    }

    if (userResponse?.email_verified) {
      throw new BadRequestException('Email already verified, login');
    }

    if (
      userResponse.verification_token?.use_case !==
      VerificationCodeUserCase.EMAIL_VERIFICATION
    ) {
      throw new ForbiddenException('Unable to verify email, Try again!');
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

    const { user } = await this.usersRepository.verifySignup(userResponse.id);

    return { user };
  }

  async newPassword(newPasswordDto: NewPasswordDto) {
    const { code, email } = newPasswordDto;

    const userResponse = await this.usersRepository.findOne({
      email: email,
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
    const { email, password } = userLoginDto;

    /*
      Validate Phone number exist and password is valid
    */
    const user = await this.usersRepository.findOne({
      email: email.trim(),
    });

    console.log({ email, password });

    if (!user) throw new BadRequestException('Invalid login Credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new BadRequestException('Invalid login Credentials');

    /*
      If Phone number not verified, Kindly send verification again
    */
    if (!user.email_verified) {
      const code = otpGenerator(6);
      await this.usersRepository.findOneAndUpdate(
        { id: user.id },
        {
          verification_token: {
            code: await bcrypt.hash(code, 10),
            expired_at: new Date(new Date().getTime() + 10 * 60000),
            use_case: VerificationCodeUserCase.EMAIL_VERIFICATION,
          },
        },
      );

      const { data, error } = await this.emailService.send({
        to: user.email,
        subject: 'Signup Verfication Code',
        html: `Hi ${user.first_name}, <br/> <br/> Enter the confirmation code you to very your account:  <br/><br/> <h2> ${code} </h2> `,
      });

      console.log({ data, error });

      return customResponse('Email not verified, verify email', {
        SESSION: 'VERIFY_SIGNUP',
      });
    }

    return user;
  }

  async validateUserJwt(tokenPayload: TokenPayload) {
    return await this.usersRepository.findOne({
      email: tokenPayload.email,
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

  async updateUserProfile(
    user: User,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const cleanedDto = Object.fromEntries(
      Object.entries(updateUserProfileDto).filter(
        ([, value]) => value !== undefined,
      ),
    );
    const userResponse = await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      cleanedDto,
    );

    if (!userResponse)
      throw new BadRequestException('Something went wrong, try again later');

    delete userResponse.password;
    delete userResponse.created_at;
    delete userResponse.updated_at;
    delete userResponse.id;
    return userResponse;
  }

  async updateProfilePicture(user: User, file: Express.Multer.File) {
    console.log(user, file);
    const imgUrl = await this.cloudinaryService.uploadImageToCloudinary(file);
    if (!imgUrl) throw new BadRequestException('unable to upload image');

    const userResponse = await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      {
        profile_photo_url: imgUrl,
      },
    );
    delete userResponse.created_at;
    delete userResponse.updated_at;
    delete userResponse.id;

    return customResponse('Profile photo updated successfully', userResponse);
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
    const { email } = resetPasswordDto;
    const generatedCode = otpGenerator(6);

    const userResponse = await this.usersRepository.findOneAndUpdate(
      {
        email: email,
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
      email: user?.email,
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
