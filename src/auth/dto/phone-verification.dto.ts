import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';

export class PhoneVerificationDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(5, 5)
  code: string;
}