import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SchoolGradeEnum, SchoolTypeEnum } from '../entities/school.entity';

export class CreateSchoolDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  school_name: string;

  @IsOptional()
  @ApiProperty({ enum: SchoolTypeEnum })
  @IsEnum(SchoolTypeEnum)
  type: SchoolTypeEnum;

  @ApiPropertyOptional({ enum: SchoolGradeEnum })
  @IsOptional()
  @IsEnum(SchoolGradeEnum)
  grade?: SchoolGradeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postal_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}
