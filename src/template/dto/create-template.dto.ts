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

export class CreateTemplateSectionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(SectionType)
  type: SectionType;

  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSectionDto)
  sections: CreateTemplateSectionDto[];
}