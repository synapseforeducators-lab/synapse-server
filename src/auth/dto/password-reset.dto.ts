import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class PasswordResetDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(5, 5)
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
