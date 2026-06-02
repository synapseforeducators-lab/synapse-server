import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSchemeDto } from './create-scheme.dto';
import { IsString } from 'class-validator';

export class UpdateSchemeDto extends PartialType(CreateSchemeDto) {}
