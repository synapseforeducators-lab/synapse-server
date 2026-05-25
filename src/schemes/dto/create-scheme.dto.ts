import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';

class WeekDto {
  @IsNumber()
  week: number;

  @IsString()
  topic: string;

  @IsArray()
  objectives: string[];

  @IsOptional()
  @IsArray()
  activities?: string[];

  @IsOptional()
  @IsArray()
  evaluation?: string[];

  @IsOptional()
  @IsArray()
  resources?: string[];
}

export class CreateSchemeDto {
  @IsString()
  subject: string;

  @IsString()
  className: string;

  @IsString()
  term: string;

  @IsUUID()
  curriculumId: string;

  @IsUUID()
  academicSessionId: string;

  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekDto)
  weeks: WeekDto[];
}
