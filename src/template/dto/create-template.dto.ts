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
import { SectionTypeEnum } from '../entities/section.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsEnum(SectionTypeEnum)
  type: SectionTypeEnum;

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

  @ApiProperty({ type: () => CreateTemplateSectionDto, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSectionDto)
  sections: CreateTemplateSectionDto[];
}
