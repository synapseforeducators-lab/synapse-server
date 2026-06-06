import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
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
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { School, SchoolRole } from 'src/schools/entities/school.entity';

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

      let schoolExist: School | null = null;
      let template: Template;
      const templateSections = sections.map((sectionDto, index) =>
        this.entityManager.create(TemplateSection, {
          ...sectionDto,
          order: sectionDto.order ?? index,
        }),
      );

      await this.entityManager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          const schoolMemberExist = await transactionalEntityManager.findOne(
            SchoolMember,
            {
              where: { userId: user.id },
            },
          );

          if (schoolMemberExist) {
            schoolExist = await transactionalEntityManager.findOne(School, {
              where: { id: schoolMemberExist.schoolId },
            });
          }

          const newTemplate = new Template({
            ...templateData,
            school: schoolExist,
            schoolId: schoolExist?.id ?? null,
            createdBy: user,
            sections: templateSections,
            school_name: schoolExist
              ? schoolExist.school_name
              : templateData.school_name,
          });

          template = await transactionalEntityManager.save(newTemplate);
        },
      );

      return template;
    } catch (error) {
      this.logger.error('Error creating template', error);
      throw new BadRequestException('Error creating template');
    }
  }

  async getAllTemplate(user: User) {
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      select: { schoolId: true },
      where: {
        userId: user.id,
        role:
          SchoolRole.ADMIN ||
          SchoolRole.OWNER ||
          SchoolRole.HEAD_TEACHER ||
          SchoolRole.PRINCIPAL ||
          SchoolRole.VICE_PRINCIPAL ||
          SchoolRole.DIRECTOR ||
          SchoolRole.HEAD_OF_DEPARTMENT,
      },
    });

    if (schoolMember) {
      return await this.entityManager
        .createQueryBuilder(Template, 'templates')
        .where('templates.createdById = :createdById', { createdById: user.id })
        .where('curriculums.schoolId = :schoolId', {
          schoolId: schoolMember.schoolId,
        })
        .andWhere('templates.is_deleted = :is_deleted', {
          is_deleted: false,
        })
        .loadRelationCountAndMap(
          'templates.sectionsCount',
          'templates.sections',
        )
        .select(['templates.id', 'templates.name', 'templates.school_name'])
        .getMany();
    }

    return await this.entityManager
      .createQueryBuilder(Template, 'templates')
      .where('templates.createdById = :createdById', { createdById: user.id })
      .andWhere('templates.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      // .leftJoinAndSelect('templates.sections', 'sections')
      .loadRelationCountAndMap('templates.sectionsCount', 'templates.sections')
      .select([
        'templates.id',
        'templates.name',
        'templates.school_name',
        // 'sections.title',
        // 'sections.fields',
        // 'sections.order',
      ])
      .getMany();
  }
  async getTemplateById(id: string, user: User) {
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      select: { schoolId: true },
      where: {
        userId: user.id,
        role:
          SchoolRole.ADMIN ||
          SchoolRole.OWNER ||
          SchoolRole.HEAD_TEACHER ||
          SchoolRole.PRINCIPAL ||
          SchoolRole.VICE_PRINCIPAL ||
          SchoolRole.DIRECTOR ||
          SchoolRole.HEAD_OF_DEPARTMENT,
      },
    });

    if (schoolMember) {
      return await this.entityManager
        .createQueryBuilder(Template, 'templates')
        .where('templates.schoolId = :schoolId AND templates.id = :id', {
          schoolId: schoolMember.schoolId,
          id,
        })
        .andWhere('templates.is_deleted = :is_deleted', {
          is_deleted: false,
        })
        .leftJoinAndSelect('templates.sections', 'sections')
        .loadRelationCountAndMap(
          'templates.sectionsCount',
          'templates.sections',
        )
        .select([
          'templates.id',
          'templates.name',
          'templates.school_name',
          'sections.title',
          'sections.fields',
          'sections.order',
          'sections.order',
        ])
        .getOne();
    }

    return await this.entityManager
      .createQueryBuilder(Template, 'templates')
      .where('templates.createdById = :createdById AND templates.id = :id ', {
        createdById: user.id,
        id,
      })
      .andWhere('templates.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      .leftJoinAndSelect('templates.sections', 'sections')
      .loadRelationCountAndMap('templates.sectionsCount', 'templates.sections')
      .select([
        'templates.id',
        'templates.name',
        'templates.school_name',
        'sections.title',
        'sections.fields',
        'sections.order',
        'sections.order',
      ])
      .getOne();
  }
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
      const template = await this.repository.update(
        { id, createdBy: { id: user.id } },
        {
          is_deleted: true,
        },
      );

      if (!template) {
        throw new NotFoundException(
          `Template ${id} not found or you do not have permission to delete it`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting template', error);
      throw new BadRequestException('Error deleting template');
    }
  }
}
