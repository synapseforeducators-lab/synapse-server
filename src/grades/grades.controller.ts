import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/user/enums/role.enum';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  getAllGrades() {
    return this.gradesService.getAllGrades();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch()
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  update(updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(updateGradeDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
