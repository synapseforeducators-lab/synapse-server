import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ActivateBusinessDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  business_logo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category_id: string;
}