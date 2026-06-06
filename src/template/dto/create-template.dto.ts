import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SectionTypeEnum } from '../entities/section.entity';

export class CreateTemplateFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: SectionTypeEnum, enumName: 'SectionType' })
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

export class CreateTemplateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ type: () => CreateTemplateFieldDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateFieldDto)
  @IsOptional()
  fields?: CreateTemplateFieldDto[];

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  school_name: string;

  @ApiProperty({ type: () => CreateTemplateSectionDto, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSectionDto)
  sections: CreateTemplateSectionDto[];
}
