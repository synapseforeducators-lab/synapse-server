import {
  IsAlpha,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums/user.enum';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 20)
  first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 20)
  last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  dob?: string;

  @ApiProperty({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(3)
  postal_address?: string;
}
