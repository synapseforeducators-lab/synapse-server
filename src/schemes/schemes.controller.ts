import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
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

@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Post()
  @UsageLimit(UsageType.SCHEME)
  @UseGuards(UsageLimitGuard)
  @UseInterceptors(UsageInterceptor)
  async create(@Req() req, @Body() dto: CreateSchemeDto) {
    return this.schemesService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.schemesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.schemesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,

    @Req() req,

    @Body() dto: UpdateSchemeDto,
  ) {
    return this.schemesService.update(id, req.user, dto);
  }

  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,

    @Req() req,
  ) {
    return this.schemesService.publish(id, req.user);
  }

  @Patch(':id/archive')
  async archive(
    @Param('id') id: string,

    @Req() req,
  ) {
    return this.schemesService.archive(id, req.user);
  }

  @Post(':id/duplicate')
  async duplicate(
    @Param('id') id: string,

    @Req() req,
  ) {
    return this.schemesService.duplicate(id, req.user);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,

    @Req() req,
  ) {
    return this.schemesService.remove(id, req.user);
  }
}
