import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class EmailVerificationDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(5, 5)
  code: string;
}