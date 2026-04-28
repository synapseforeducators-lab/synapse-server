import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { SectionType } from '../entities/section.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsEnum(SectionType)
  type: SectionType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSectionDto)
  sections: CreateTemplateSectionDto[];
}
