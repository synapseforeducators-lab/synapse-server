import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTermDto {
  @ApiProperty()
  @IsString()
  term: string;
}
