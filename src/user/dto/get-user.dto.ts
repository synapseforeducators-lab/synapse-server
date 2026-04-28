import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber } from 'class-validator';

export class GetUserByEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
export class GetUserByPhoneDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone_number: string;
}