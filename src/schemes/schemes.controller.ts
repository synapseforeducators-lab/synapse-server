import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SchemesService } from './schemes.service';

import { CreateSchemeDto } from './dto/create-scheme.dto';

import { UpdateSchemeDto } from './dto/update-scheme.dto';
import { UsageLimit } from 'src/usage/decorators/usage-limit.decorator';
import { UsageType } from 'src/usage/enums/usage-type.enum';
import { UsageLimitGuard } from 'src/usage/guards/usage-limit.guard';
import { UsageInterceptor } from 'src/usage/interceptors/usage.interceptor';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Post()
  @UsageLimit(UsageType.SCHEME)
  @UseGuards(UsageLimitGuard)
  @UseInterceptors(UsageInterceptor)
  create(
    @CurrentUser() user: User,
    @Body() createCurriculumDto: CreateSchemeDto,
  ) {
    return this.schemesService.create(user, createCurriculumDto);
  }

  @Get()
  getAllSchemes(@CurrentUser() user: User) {
    return this.schemesService.getAllSchemes(user);
  }

  @Get(':id')
  getSchemeById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.schemesService.getSchemeById(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateSchemeDto: UpdateSchemeDto,
  ) {
    return this.schemesService.updateSchemeById(id, user, updateSchemeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.schemesService.remove(id, user);
  }
}
