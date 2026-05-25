import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { AcademicSessionsService } from './academic-sessions.service';

import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';

import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(private readonly service: AcademicSessionsService) {}

  @Post()
  create(@Body() dto: CreateAcademicSessionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAcademicSessionDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/current')
  setCurrent(@Param('id') id: string) {
    return this.service.setCurrent(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.service.archive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
