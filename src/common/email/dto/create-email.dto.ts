import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmailDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;
}
