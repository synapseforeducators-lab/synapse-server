import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
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

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
