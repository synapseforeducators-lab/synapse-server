import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserLoginDto, PasswordResetDto, PhoneVerificationDto } from './dto';
import { ConfigService, ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/user.service';
import {
  CompleteSignupDto,
  NewPasswordDto,
  ResetPasswordDto,
  SignupChannelType,
  SignupUserDto,
} from 'src/user/dto';
import {
  customResponse,
  maskLastSixDigits,
  phoneNumberFormatter,
} from 'src/common/util';
import { GetUserByPhoneDto } from 'src/user/dto/get-user.dto';
import { User } from 'src/user/entities/user.entity';
import { TokenPayload } from 'src/common/interfaces';
import { SmsService } from 'src/common/sms/sms.service';
import refreshJwtConfig from './config/refresh-jwt.config';
import { SignupLoginEnum } from 'src/user/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    // private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,

    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}
  async userSignUp(createUserDto: SignupUserDto) {
    const { user, code, session } =
      await this.usersService.creatUser(createUserDto);

    console.log({ user, code, session });

    if (session === SignupLoginEnum.AUTH_LOGIN) {
      return customResponse('User already exist', SignupLoginEnum.AUTH_LOGIN);
    }

    if (!user) throw new InternalServerErrorException('Something went wrong');

    if (createUserDto.channel === SignupChannelType.PHONE) {
      this.smsService
        .phoneNumberVerification(user.phone_number, code)
        .then()
        .catch((error) => console.log({ error }));
    }

    return customResponse(
      'Account created, complete signup',
      SignupLoginEnum.AUTH_SIGNUP,
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { user, code } =
      await this.usersService.resetPassword(resetPasswordDto);

    if (!user) throw new InternalServerErrorException('Something went wrong');

    console.log({ code });
    this.smsService
      .phoneNumberVerification(user.phone_number, code)
      .then()
      .catch((error) => console.log({ error }));

    return customResponse(
      'Reset Pasword, code sent successfully',
      SignupLoginEnum.RESET_PASSWORD,
    );
  }
  async newPassword(newPasswordDto: NewPasswordDto) {
    const { user } = await this.usersService.newPassword(newPasswordDto);

    if (user.phone_verified) {
      const tokenPayload: TokenPayload = {
        id: user.id,
        phone_number: user.phone_number,
      };

      const access_token = this.jwtService.sign(tokenPayload);
      const refresh_token = this.jwtService.sign(
        tokenPayload,
        this.refreshTokenConfig,
      );

      delete user.currentOtp;
      delete user.created_at;
      delete user.updated_at;
      delete user.password;
      delete user.id;
      delete user.verification_token;

      return customResponse('Logged In Successful', {
        token: {
          access_token,
          refresh_token,
        },
        user,
      });
    }

    throw new BadRequestException('something weng wrong');
  }

  async validateUserSignup(completeSignupDto: CompleteSignupDto) {
    const { user } = await this.usersService.completeSignup(completeSignupDto);

    if (user.phone_verified) {
      const tokenPayload: TokenPayload = {
        id: user.id,
        phone_number: user.phone_number,
      };

      const access_token = this.jwtService.sign(tokenPayload);
      const refresh_token = this.jwtService.sign(
        tokenPayload,
        this.refreshTokenConfig,
      );

      delete user.currentOtp;
      delete user.created_at;
      delete user.updated_at;

      delete user.password;
      delete user.id;
      delete user.verification_token;

      return customResponse('Logged In Successful', {
        token: {
          access_token,
          refresh_token,
        },
        user,
      });
    }

    throw new BadRequestException('something weng wrong');
  }

  // async userResendPhoneNumberVerification(
  //   getUserByPhoneDto: GetUserByPhoneDto,
  // ) {
  //   const { code, user } =
  //     await this.usersService.resendPhoneNumberVerification(getUserByPhoneDto);

  //   console.log({ user, code });

  //   if (!user) throw new InternalServerErrorException('Something went wrong');

  //   // this.smsService
  //   //   .phoneNumberVerification(user.phone_number, code)
  //   //   .then()
  //   //   .catch((error) => console.log({ error }));

  //   return customResponse(
  //     'Please check your inbox for the OTP to complete the process.',
  //   );
  // }

  // async userPhoneNumberVerification(
  //   phoneVerificationDto: PhoneVerificationDto,
  // ) {
  //   return this.usersService.verifyPhoneNumber(phoneVerificationDto);
  // }

  async validateUser(userLoginDto: UserLoginDto) {
    return this.usersService.validateUser(userLoginDto);
  }

  async userLogin(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      phone_number: user.phone_number,
    };

    console.log(tokenPayload);

    const access_token = this.jwtService.sign(tokenPayload);
    const refresh_token = this.jwtService.sign(
      tokenPayload,
      this.refreshTokenConfig,
    );

    // const buyer = await this.buyerService.findBuyerByUser(user.id);
    // const seller = await this.sellerService.findSellerByUser(user.id);

    // user.bvn = maskLastSixDigits(user.bvn);

    return customResponse('Logged In Successful', {
      token: {
        access_token,
        refresh_token,
      },
      user,
    });
  }
  async refreshToken(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      phone_number: user.phone_number,
    };

    const access_token = this.jwtService.sign(tokenPayload);

    return customResponse('authenticated', {
      token: access_token,
      user,
    });
  }

  async validateUserJwt(tokenPayload: TokenPayload) {
    return this.usersService.validateUserJwt(tokenPayload);
  }

  // async userPasswordResetReq(getUserByPhoneDto: GetUserByPhoneDto) {
  //   const { code, user } =
  //     await this.usersService.passwordResetReq(getUserByPhoneDto);

  //   console.log({ code });

  //   this.smsService
  //     .phoneNumberVerification(user.phone_number, code)
  //     .then()
  //     .catch((error) => console.log({ error }));
  //   return customResponse(
  //     'Please check your inbox for the OTP to complete the process.',
  //   );
  // }
  // async resendUserPasswordResetReq(getUserByPhoneDto: GetUserByPhoneDto) {
  //   const { code, user } =
  //     await this.usersService.passwordResetReqResend(getUserByPhoneDto);

  //   console.log({ code });

  //   this.smsService
  //     .phoneNumberVerification(user.phone_number, code)
  //     .then()
  //     .catch((error) => console.log({ error }));
  //   return customResponse(
  //     'Please check your inbox for the OTP to complete the process.',
  //   );
  // }

  // async userPasswordReset(passwordResetDto: PasswordResetDto) {
  //   return this.usersService.passwordReset(passwordResetDto);
  // }
}
