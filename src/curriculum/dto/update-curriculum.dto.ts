import { PartialType } from '@nestjs/mapped-types';
import { CreateCurriculumDto } from './create-curriculum.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCurriculumDto extends CreateCurriculumDto {}
