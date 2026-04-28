import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNinDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(3)
  nin: string;
}
