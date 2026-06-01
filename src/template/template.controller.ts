import {
  BadRequestException,
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
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { TemplateService } from './template.service';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/common/decorators';
import { UsageLimit } from 'src/usage/decorators/usage-limit.decorator';
import { UsageType } from 'src/usage/enums/usage-type.enum';
import { UsageLimitGuard } from 'src/usage/guards/usage-limit.guard';
import { UsageInterceptor } from 'src/usage/interceptors/usage.interceptor';
import { customResponse } from 'src/common/util';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @UsageLimit(UsageType.TEMPLATE)
  @UseGuards(UsageLimitGuard)
  @UseInterceptors(UsageInterceptor)
  async create(
    @CurrentUser() user: User,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    const template = await this.templateService.createTemplate(
      user,
      createTemplateDto,
    );

    if (!template) {
      throw new BadRequestException('unable to create template');
    }

    return customResponse('Template created successfully');
  }


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
    return this.templateService.findOne(id, user);
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

  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.templateService.remove(id, user);
  }
}
