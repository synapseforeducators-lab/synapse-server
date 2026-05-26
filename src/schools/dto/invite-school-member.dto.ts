import { IsAlpha, IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Length } from 'class-validator';
import { SchoolRole } from '../entities/school.entity';
import { ApiProperty } from '@nestjs/swagger';

export class InviteSchoolMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty({ enum: SchoolRole })
  @IsEnum(SchoolRole)
  role: SchoolRole;
}


export class AcceptInviteUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 30)
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 30)
  last_name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  token: string;
}
