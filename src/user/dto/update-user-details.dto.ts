import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, ProfileSetupEnum } from '../enums/user.enum';

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
  @IsString()
  @MinLength(3)
  first_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  last_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  postal_address: string;

  @ApiProperty()
  @IsString()
  phone_number: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: ProfileSetupEnum })
  @IsEnum(ProfileSetupEnum)
  profile: ProfileSetupEnum;
}

export class UpdatePersonalProfileDto {
  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(3, { validateIf: (_, value) => value.length })
  first_name: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(3, { validateIf: (_, value) => value.length })
  last_name: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(3, { validateIf: (_, value) => value.length })
  postal_address: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
  })
  file: any;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  old_password: string;

  @ApiProperty()
  @IsStrongPassword()
  new_password: string;
}
