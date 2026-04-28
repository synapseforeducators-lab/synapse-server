import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  NewPasswordDto,
  ResetPasswordDto,
  SignupUserDto,
  VerifySignupDto,
} from 'src/user/dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { RefreshJwtAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GetUserByEmailDto } from 'src/user/dto/get-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  userSignUp(@Body() signupUserDto: SignupUserDto) {
    return this.authService.userSignUp(signupUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('new-password')
  newPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.newPassword(newPasswordDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signup/verify')
  verifySignup(@Body() verifySignupDto: VerifySignupDto) {
    return this.authService.verifySignup(verifySignupDto);
  }
  @HttpCode(HttpStatus.OK)
  @Post('/signup/resend')
  resendEmailCodeVerification(@Body() getUserByEmailDto: GetUserByEmailDto) {
    return this.authService.resendEmailCodeVerification(getUserByEmailDto);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@CurrentUser() user: User) {
    return this.authService.userLogin(user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtAuthGuard)
  @ApiBearerAuth()
  @Post('/refresh')
  refreshToken(@CurrentUser() user: User) {
    return this.authService.refreshToken(user);
  }
}
