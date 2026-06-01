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
} from 'class-validator';
import { SectionTypeEnum } from '../entities/section.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: SectionTypeEnum, enumName: 'type' })
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  school_name: string;

  @ApiProperty({ type: () => CreateTemplateSectionDto, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSectionDto)
  sections: CreateTemplateSectionDto[];
}
