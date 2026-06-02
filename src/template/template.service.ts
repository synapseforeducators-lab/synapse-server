import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { TemplatesRepository } from './repository/templates.repository';
import { User } from 'src/user/entities/user.entity';
import { customResponse } from 'src/common/util/response.util';

@Injectable()
export class TemplateService {
  constructor(private readonly templatesRepository: TemplatesRepository) {}

  async createTemplate(user: User, createTemplateDto: CreateTemplateDto) {
    const template = await this.templatesRepository.createTemplate(
      user,
      createTemplateDto,
    );

    if (!template) {
      throw new BadRequestException('unable to create template');
    }
    return customResponse('Template created successfully');
  }

  async getAllTemplate(user: User) {
    const templateRes = this.templatesRepository.getAllTemplate(user);

    if (!templateRes) {
      throw new BadRequestException('unable to get template');
    }

    return templateRes;
  }

  async findOne(id: string, user: User): Promise<Template> {
    return this.templatesRepository.getTemplateById(id, user);
  }

  async update(
    id: string,
    user: User,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    return this.templatesRepository.updateTemplate(id, user, updateTemplateDto);
  }

  async remove(id: string, user: User): Promise<void> {
    return this.templatesRepository.deleteTemplate(id, user);
  }
}
