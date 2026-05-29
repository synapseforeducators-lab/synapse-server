import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsageLimit } from 'src/usage/decorators/usage-limit.decorator';
import { UsageType } from 'src/usage/enums/usage-type.enum';
import { UsageLimitGuard } from 'src/usage/guards/usage-limit.guard';
import { UsageInterceptor } from 'src/usage/interceptors/usage.interceptor';

@ApiTags('Curriculum')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  @UsageLimit(UsageType.CURRICULUM)
  @UseGuards(UsageLimitGuard)
  @UseInterceptors(UsageInterceptor)
  create(
    @CurrentUser() user: User,
    @Body() createCurriculumDto: CreateCurriculumDto,
  ) {
    return this.curriculumService.create(user, createCurriculumDto);
  }

  @Get()
  getAllCurriculum(@CurrentUser() user: User) {
    return this.curriculumService.getAllCurriculum(user);
  }

  @Get(':id')
  getCurriculumById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.curriculumService.getCurriculumById(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumService.updateCurriculumById(id, user, updateCurriculumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.curriculumService.remove(id, user);
  }
}
