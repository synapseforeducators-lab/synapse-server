import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from "class-validator";
import { CreateCurriculumItemDto } from "./create-curriculum.dto";


export class UpdateCurriculumDto  {
     @ApiPropertyOptional()
      @IsString()
      @IsOptional()
      @IsNotEmpty()
      name: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      subjectId: string;
    
      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      gradeId: string;
    
      @ApiProperty({ type: () => CreateCurriculumItemDto, isArray: true })
      @IsArray()
      @ValidateNested({ each: true })
      @Type(() => CreateCurriculumItemDto)
      @IsOptional()
      items?: CreateCurriculumItemDto[] = [];
}
