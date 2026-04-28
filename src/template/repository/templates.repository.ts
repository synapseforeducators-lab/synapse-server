import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, In, IsNull, Or, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Template } from '../entities/template.entity';

import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { TemplateSection } from '../entities/section.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TemplatesRepository extends AbstractRepository<Template> {
  protected readonly logger = new Logger(TemplatesRepository.name);

  constructor(
    @InjectRepository(Template)
    templatesRepository: Repository<Template>,
    entityManager: EntityManager,
  ) {
    super(templatesRepository, entityManager);
  }

  /**
   * Create a new template.
   * If the user belongs to a school the template is automatically associated
   * with that school, so all school members can access it.
   */
  async createTemplate(
    user: User,
    createTemplateDto: CreateTemplateDto,
  ): Promise<Template> {
    try {
      const { sections, ...templateData } = createTemplateDto;

      const templateSections = sections.map((sectionDto, index) =>
        this.entityManager.create(TemplateSection, {
          ...sectionDto,
          order: sectionDto.order ?? index,
        }),
      );

      const template = this.repository.create({
        ...templateData,
        school: user.school ?? null,
        createdBy: user,
        sections: templateSections,
      });

      return await this.repository.save(template);
    } catch (error) {
      this.logger.error('Error creating template', error);
      throw new BadRequestException('Error creating template');
    }
  }

  /**
   * Find all templates visible to the user.
   *
   * Rules:
   *  - If the user belongs to a school  → return templates created by anyone
   *    in the same school  + templates created personally by this user that
   *    have no school association (personal drafts).
   *  - If the user has no school        → return only their own templates.
   */
  async findAllForUser(user: User): Promise<Template[]> {
    try {
      if (user.school) {
        return await this.repository.find({
          where: [
            { school: { id: user.school.id } },
            { createdBy: { id: user.id }, school: IsNull() },
          ],
          relations: ['createdBy', 'school'],
          order: { created_at: 'DESC' },
        });
      }

      return await this.repository.find({
        where: { createdBy: { id: user.id } },
        relations: ['createdBy', 'school'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Error fetching templates', error);
      throw new BadRequestException('Error fetching templates');
    }
  }

  /**
   * Find a single template by id, provided it is visible to the user.
   */
  async findOneForUser(id: string, user: User): Promise<Template> {
    try {
      let template: Template | null = null;

      if (user.school) {
        template = await this.repository.findOne({
          where: [
            { id, school: { id: user.school.id } },
            { id, createdBy: { id: user.id }, school: IsNull() },
          ],
          relations: ['createdBy', 'school'],
        });
      } else {
        template = await this.repository.findOne({
          where: { id, createdBy: { id: user.id } },
          relations: ['createdBy', 'school'],
        });
      }

      if (!template) {
        throw new NotFoundException(`Template ${id} not found`);
      }

      return template;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching template', error);
      throw new BadRequestException('Error fetching template');
    }
  }

  /**
   * Update a template.  Only the original creator may update it.
   */
  async updateTemplate(
    id: string,
    user: User,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    try {
      const template = await this.repository.findOne({
        where: { id, createdBy: { id: user.id } },
        relations: ['createdBy', 'school'],
      });

      if (!template) {
        throw new NotFoundException(
          `Template ${id} not found or you do not have permission to edit it`,
        );
      }

      const { sections, ...templateData } = updateTemplateDto;

      if (sections) {
        // Remove old sections and replace entirely
        await this.entityManager.delete(TemplateSection, {
          template: { id },
        });

        template.sections = sections.map((sectionDto, index) =>
          this.entityManager.create(TemplateSection, {
            ...sectionDto,
            order: sectionDto.order ?? index,
          }),
        );
      }

      Object.assign(template, templateData);

      return await this.repository.save(template);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating template', error);
      throw new BadRequestException('Error updating template');
    }
  }

  /**
   * Delete a template.  Only the original creator may delete it.
   */
  async deleteTemplate(id: string, user: User): Promise<void> {
    try {
      const template = await this.repository.findOne({
        where: { id, createdBy: { id: user.id } },
      });

      if (!template) {
        throw new NotFoundException(
          `Template ${id} not found or you do not have permission to delete it`,
        );
      }

      await this.repository.remove(template);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting template', error);
      throw new BadRequestException('Error deleting template');
    }
  }
}