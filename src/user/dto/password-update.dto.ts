import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class PasswordUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  old_password: string;

  @ApiProperty()
  @IsStrongPassword()
  new_password: string;
}
