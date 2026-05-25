import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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
