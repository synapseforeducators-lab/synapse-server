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
  NewPasswordDto,
  ResetPasswordDto,
  SignupUserDto,
  VerifySignupDto,
} from 'src/user/dto';
import { customResponse } from 'src/common/util';
import {
  GetUserByEmailDto,
  GetUserByPhoneDto,
} from 'src/user/dto/get-user.dto';
import { User } from 'src/user/entities/user.entity';
import { TokenPayload } from 'src/common/interfaces';
import refreshJwtConfig from './config/refresh-jwt.config';
import { SignupLoginEnum } from 'src/user/enums/user.enum';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,

    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}
  async userSignUp(createUserDto: SignupUserDto) {
    const { user, code } = await this.usersService.signup(createUserDto);

    if (!user) throw new InternalServerErrorException('Something went wrong');

    console.log(code, user);

    const { data, error } = await this.emailService.send({
      to: user.email,
      subject: 'Signup Verfication Code',
      html: `Hi ${user.first_name}, <br/> <br/> Enter the confirmation code you to very your account:  <br/><br/> <h2> ${code} </h2> `,
    });

    console.log({ data, error });

    return customResponse('Account created, complete signup');
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { user, code } =
      await this.usersService.resetPassword(resetPasswordDto);

    if (!user) throw new InternalServerErrorException('Something went wrong');

    console.log({ code });

    return customResponse(
      'Reset Pasword, code sent successfully',
      SignupLoginEnum.RESET_PASSWORD,
    );
  }
  async newPassword(newPasswordDto: NewPasswordDto) {
    const { user } = await this.usersService.newPassword(newPasswordDto);

    if (user.email_verified) {
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(tokenPayload);
      const refresh_token = this.jwtService.sign(
        tokenPayload,
        this.refreshTokenConfig,
      );

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

  async verifySignup(verifySignupDto: VerifySignupDto) {
    const { user } = await this.usersService.verifySignup(verifySignupDto);

    if (user.email_verified) {
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(tokenPayload);
      const refresh_token = this.jwtService.sign(
        tokenPayload,
        this.refreshTokenConfig,
      );

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

  async resendEmailCodeVerification(getUserByEmailDto: GetUserByEmailDto) {
    const { code, user } =
      await this.usersService.resendEmailCodeVerification(getUserByEmailDto);

    console.log({ user, code });

    if (!user) throw new InternalServerErrorException('Something went wrong');

    const { data, error } = await this.emailService.send({
      to: user.email,
      subject: 'Signup Verfication Code',
      html: `Hi ${user.first_name}, <br/> <br/> Enter the confirmation code you to very your account:  <br/><br/> <h2> ${code} </h2> `,
    });

    console.log({ data, error });
    return customResponse(
      'Please check your inbox for the OTP to complete the process.',
    );
  }

  async validateUser(userLoginDto: UserLoginDto) {
    return this.usersService.validateUser(userLoginDto);
  }

  async userLogin(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
    };

    console.log(tokenPayload);

    const access_token = this.jwtService.sign(tokenPayload);
    const refresh_token = this.jwtService.sign(
      tokenPayload,
      this.refreshTokenConfig,
    );

    delete user.password;
    delete user.created_at;
    delete user.updated_at;
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
  async refreshToken(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
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
