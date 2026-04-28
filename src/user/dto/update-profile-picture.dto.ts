import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfilePictureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  @MinLength(3)
  profile_photo_url: string;
}
