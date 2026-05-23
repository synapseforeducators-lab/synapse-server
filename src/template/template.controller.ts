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
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { TemplateService } from './template.service';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  /**
   * POST /templates
   * Create a new template.  The template is scoped to the user's school
   * automatically if they belong to one.
   */
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return  await this.templateService.createTemplate(user, createTemplateDto);
  }

  /**
   * GET /templates
   * List all templates visible to the current user:
   *  - School templates (if the user belongs to a school)
   *  - Personal templates created by this user without a school
   */
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.templateService.getAllTemplate(user);
  }

  /**
   * GET /templates/:id
   * Retrieve a single template if it is accessible to the current user.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    // return this.templateService.findOne(id, user);
  }

  /**
   * PATCH /templates/:id
   * Update a template.  Only the original creator can update it.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, user, updateTemplateDto);
  }

  /**
   * DELETE /templates/:id
   * Delete a template.  Only the original creator can delete it.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templateService.remove(id, user);
  }
}
