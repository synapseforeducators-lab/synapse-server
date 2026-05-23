import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolsService } from './school.service';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/user/pipes/profile-image.pipe';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('School')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolsService) {}

  @Post('create-school-profile')
  async CreateSchoolProfile(
    @CurrentUser() user: User,
    @Body() createSchoolDto: CreateSchoolDto,
  ) {
    return await this.schoolService.createSchoolProfile(user, createSchoolDto);
  }

  @Post('update-school-profile')
  async UpdateSchoolProfile(
    @CurrentUser() user: User,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return await this.schoolService.updateSchoolProfile(user, updateSchoolDto);
  }

  @Post('update-school-logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async updateSchoolLogo(
    @CurrentUser() user: User,
    @UploadedFile(new FileSizeValidationPipe())
    file: Express.Multer.File,
  ) {
    return await this.schoolService.updateSchoolLogo(user, file);
  }
}
