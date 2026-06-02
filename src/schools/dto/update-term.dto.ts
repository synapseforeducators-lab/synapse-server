import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateTermDto } from './create-term.dto';

export class UpdateTermDto extends PartialType(CreateTermDto) {
  @ApiProperty()
  @IsString()
  id: string;
}
