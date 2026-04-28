import { ApiProperty } from '@nestjs/swagger';
import {
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
  @ApiProperty({ enum: SignupChannelType })
  @IsEnum(SignupChannelType)
  channel: SignupChannelType;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.channel === SignupChannelType.PHONE)
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.channel === SignupChannelType.EMAIL)
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ enum: SignupChannelType })
  @IsEnum(SignupChannelType)
  channel: SignupChannelType;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.channel === SignupChannelType.PHONE)
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.channel === SignupChannelType.EMAIL)
  @IsEmail()
  email: string;
}

export class NewPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  code: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
