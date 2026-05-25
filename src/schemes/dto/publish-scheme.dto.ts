import { IsBoolean } from 'class-validator';

export class PublishSchemeDto {
  @IsBoolean()
  published: boolean;
}