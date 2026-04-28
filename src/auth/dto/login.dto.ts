import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UserLoginDto {
  @IsPhoneNumber()
  phone_number: string;

  @IsNotEmpty()
  password: string;
}
