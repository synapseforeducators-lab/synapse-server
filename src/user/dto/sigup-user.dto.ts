import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsStrongPassword,
  Length,
  ValidateIf,
} from 'class-validator';

export enum SignupChannelType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
}

export class SignupUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 30)
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 30)
  last_name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class NewPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
