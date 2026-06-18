import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolsService } from './school.service';
import { CurrentUser, SchoolRoles } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/user/pipes/profile-image.pipe';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { SchoolInvitationsService } from './school-invitations.service';
import { InviteSchoolMemberDto } from './dto/invite-school-member.dto';
import { SchoolRoleGuard } from 'src/common/guards/school-role.guard';
import { SchoolRole } from './entities/school.entity';
import { SchoolMemberStatus } from './entities/school-member.entity';

@ApiTags('School')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('school')
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolsService,
    private readonly invitationsService: SchoolInvitationsService,
  ) {}

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

  @Get(':schoolId/school-members')
  @SchoolRoles(SchoolRole.ADMIN, SchoolRole.OWNER)
  @UseGuards(SchoolRoleGuard)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @CurrentUser() user: User,
    @Param('schoolId', new ParseUUIDPipe()) schoolId: string,
    @Query('search') search?: string,
    @Query('status') status?: SchoolMemberStatus,
  ) {
    return this.schoolService.getAllSchoolMembers(
      schoolId,
      user,
      search,
      status,
    );
  }

  @Post('update-school-profile')
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
            @Body() updateSchoolDto?: UpdateSchoolDto,

  ) {
    return await this.schoolService.updateSchoolLogo(user, updateSchoolDto, file);
  }

  @Post(':schoolId/invitations')
  @SchoolRoles(SchoolRole.ADMIN, SchoolRole.OWNER)
  @UseGuards(SchoolRoleGuard)
  async inviteMember(
    @Param('schoolId', new ParseUUIDPipe())
    schoolId: string,
    @CurrentUser() user: User,
    @Body()
    dto: InviteSchoolMemberDto,
  ) {
    return await this.invitationsService.invite(schoolId, user.id, dto);
  }

  @Get(':schoolId/invitations')
  async getInvitations(
    @Param('schoolId', new ParseUUIDPipe())
    schoolId: string,
  ) {
    return await this.invitationsService.getSchoolInvitations(schoolId);
  }
}
