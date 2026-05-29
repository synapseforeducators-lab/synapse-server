import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCurriculumItemDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  performanceObjectives?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}

export class CreateCurriculumDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeId: string;

  @ApiProperty({ type: () => CreateCurriculumItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCurriculumItemDto)
  @IsOptional()
  items?: CreateCurriculumItemDto[] = [];
}
