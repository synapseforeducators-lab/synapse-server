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
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Curriculum')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  /**
   * POST /curriculum
   * Create a new curriculum. Scoped to the user's school automatically
   * if they belong to one.
   */
  @Post()
  create(
    @CurrentUser() user: User,
    @Body() createCurriculumDto: CreateCurriculumDto,
  ) {
    return this.curriculumService.create(user, createCurriculumDto);
  }

  /**
   * GET /curriculum
   * List all curricula visible to the current user:
   *  - School curricula (if the user belongs to a school)
   *  - Personal curricula with no school association
   */
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.curriculumService.findAll(user);
  }

  /**
   * GET /curriculum/:id
   * Retrieve a single curriculum if accessible to the current user.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.curriculumService.findOne(id, user);
  }

  /**
   * PATCH /curriculum/:id
   * Update a curriculum. Only the original creator can update it.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumService.update(id, user, updateCurriculumDto);
  }

  /**
   * DELETE /curriculum/:id
   * Delete a curriculum. Only the original creator can delete it.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.curriculumService.remove(id, user);
  }
}
