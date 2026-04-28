import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums/user.enum';

export class UpdateDobDto {
  @ApiProperty()
  @IsOptional()
  @IsDate()
  dob: string;
}
export class UpdateGenderDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;
}

export class UpdateUserProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  first_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  last_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phone_number: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  old_password: string;

  @ApiProperty()
  @IsStrongPassword()
  new_password: string;
}
