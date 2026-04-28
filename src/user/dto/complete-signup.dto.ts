import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

export class VerifySignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
