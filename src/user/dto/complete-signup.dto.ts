import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class CompleteSignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  code: string;

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

  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;
}
