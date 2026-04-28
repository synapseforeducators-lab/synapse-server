import { IsAlpha, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 20)
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
  @Length(3, 20)
  last_name: string;
}
