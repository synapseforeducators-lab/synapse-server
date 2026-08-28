import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsString()
  schemeId: string;

  @ApiProperty()
  @IsString()
  schemeOfWorkSectionId: string;

  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiPropertyOptional({
    type: [Object],
    default: [],
  })
  @IsArray()
  @IsOptional()
  contents?: any[] = [];
}
