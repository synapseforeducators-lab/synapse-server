import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGradeDto } from './create-grade.dto';
import { IsString } from 'class-validator';

export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  @ApiProperty()
  @IsString()
  id: string;
}
