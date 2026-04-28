import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  postal_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  state: string;
}
