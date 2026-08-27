import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { COMPLAINT_ENUM } from '../entities/support.entity';

export class CreateSupportDto {
  @ApiProperty({ enum: COMPLAINT_ENUM })
  @IsEnum(COMPLAINT_ENUM)
  complaint_type: COMPLAINT_ENUM;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: any;
}
