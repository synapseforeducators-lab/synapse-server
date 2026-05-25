import { IsString, IsDateString } from 'class-validator';

export class CreateAcademicSessionDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
