import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class WeekDto {
  @ApiProperty()
  @IsNumber()
  week: number;

  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty()
  @IsString()
  objective: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number = 0;
}

export class CreateSchemeDto {
  @ApiProperty()
  @IsString()
  termId: string;

  @ApiProperty()
  @IsString()
  curriculumId: string;

  @ApiProperty({ type: () => WeekDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekDto)
  @IsOptional()
  items?: WeekDto[] = [];
}
