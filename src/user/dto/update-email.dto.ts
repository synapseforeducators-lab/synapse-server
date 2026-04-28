import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @MinLength(3)
  email: string;
}
