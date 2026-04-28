import { Injectable } from '@nestjs/common';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from './entities/template.entity';
import { TemplatesRepository } from './repository/templates.repository';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TemplateService {
  constructor(private readonly templatesRepository: TemplatesRepository) {}

  async create(user: User, createTemplateDto: CreateTemplateDto): Promise<Template> {
    return this.templatesRepository.createTemplate(user, createTemplateDto);
  }

  async findAll(user: User): Promise<Template[]> {
    return this.templatesRepository.findAllForUser(user);
  }

  async findOne(id: string, user: User): Promise<Template> {
    return this.templatesRepository.findOneForUser(id, user);
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