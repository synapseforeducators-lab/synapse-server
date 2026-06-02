import { Curriculum } from './../../curriculum/entities/curriculum.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { User } from 'src/user/entities/user.entity';
import { School, SchoolRole } from 'src/schools/entities/school.entity';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { customResponse } from 'src/common/util';
import { SchemeOfWork } from '../entities/scheme.entity';
import { CreateSchemeDto } from '../dto/create-scheme.dto';
import { SchemeOfWorkSection } from '../entities/scheme-item.entity';
import { Term } from 'src/schools/entities/school-term.entity';
import { UpdateSchemeDto } from '../dto/update-scheme.dto';

@Injectable()
export class SchemeRepository extends AbstractRepository<SchemeOfWork> {
  protected readonly logger = new Logger(SchemeRepository.name);

  constructor(
    @InjectRepository(SchemeOfWork)
    schemeRepository: Repository<SchemeOfWork>,
    entityManager: EntityManager,
  ) {
    super(schemeRepository, entityManager);
  }

  /**
   * Create a new scheme of work.
   * Automatically associates with the user's school if they belong to one.
   */
  async createSchemeOfWork(
    user: User,
    createSchemeDto: CreateSchemeDto,
  ): Promise<SchemeOfWork> {
    let scheme: SchemeOfWork;
    let schoolExist: School;
    try {
      const { items = [], ...schemeOfWorkData } = createSchemeDto;

      const schemeOfWorkItems = items.map((itemDto, index) =>
        this.entityManager.create(SchemeOfWorkSection, {
          ...itemDto,
          order: itemDto.order ?? index,
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

          if (!schoolMemberExist) {
            schoolExist = null;
          }

          if (schoolMemberExist) {
            schoolExist = await transactionalEntityManager.findOne(School, {
              where: { id: schoolMemberExist.schoolId },
            });
          }

          const curriculum = await transactionalEntityManager.findOne(
            Curriculum,
            {
              where: { id: schemeOfWorkData.curriculumId },
            },
          );
          if (!curriculum) {
            throw new BadRequestException('Invalid curriculum specified');
          }
          const term = await transactionalEntityManager.findOne(Term, {
            where: { id: schemeOfWorkData.termId },
          });
          if (!term) {
            throw new BadRequestException('Invalid term specified');
          }

          const newScheme = new SchemeOfWork({
            school: schoolExist ?? null,
            schoolId: schoolExist?.id ?? null,
            createdBy: user,
            items: schemeOfWorkItems,
            subject: curriculum.subject,
            subjectId: curriculum.subjectId,
            curriculum: curriculum,
            curriculumId: curriculum.id,
            grade: curriculum.grade,
            gradeId: curriculum.gradeId,
            term: term,
            termId: term.id,
          });

          scheme = this.repository.create(newScheme);

          scheme = await this.repository.save(scheme);
        },
      );

      return scheme;
    } catch (error) {
      this.logger.error('Error creating scheme of work', error);
      throw new BadRequestException('Error creating scheme of work ');
    }
  }

  async getAllSchemes(user: User) {
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
        .createQueryBuilder(SchemeOfWork, 'schemes')
        .where('schemes.schoolId = :schoolId', {
          schoolId: schoolMember.schoolId,
        })
        .andWhere('schemes.is_deleted = :is_deleted', {
          is_deleted: false,
        })
        .leftJoinAndSelect('schemes.grade', 'grade')
        .leftJoinAndSelect('schemes.subject', 'subject')
        .leftJoinAndSelect('schemes.term', 'term')
        .select([
          'schemes.id',
          'grade.id',
          'grade.name',
          'subject.id',
          'subject.name',
          'term.id',
          'term.name',
        ])
        .getMany();
    }

    return await this.entityManager
      .createQueryBuilder(SchemeOfWork, 'schemes')
      .where('schemes.createdById = :createdById', {
        createdById: user.id,
      })
      .andWhere('schemes.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      .leftJoinAndSelect('schemes.grade', 'grade')
      .leftJoinAndSelect('schemes.subject', 'subject')
      .leftJoinAndSelect('schemes.term', 'term')
      .select([
        'schemes.id',
        'grade.id',
        'grade.name',
        'subject.id',
        'subject.name',
        'term.id',
        'term.name',
      ])
      .getMany();
  }
  async getSchemeById(id: string, user: User) {
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
        .createQueryBuilder(SchemeOfWork, 'schemes')
        .where('schemes.schoolId = :schoolId AND schemes.id = :id', {
          schoolId: schoolMember.schoolId,
          id,
        })
        .andWhere('schemes.is_deleted = :is_deleted', {
          is_deleted: false,
        })
        .leftJoinAndSelect('schemes.grade', 'grade')
        .leftJoinAndSelect('schemes.items', 'items')
        .leftJoinAndSelect('schemes.subject', 'subject')
        .leftJoinAndSelect('schemes.term', 'term')
        .select([
          'schemes.id',
          'schemes.name',
          'items',
          'grade.id',
          'grade.name',
          'subject.id',
          'subject.name',
          'term.id',
          'term.name',
        ])
        .getOne();
    }

    return await this.entityManager
      .createQueryBuilder(SchemeOfWork, 'schemes')
      .where('schemes.createdById = :createdById AND schemes.id = :id ', {
        createdById: user.id,
        id,
      })
      .andWhere('schemes.is_deleted = :is_deleted', {
        is_deleted: false,
      })
      .leftJoinAndSelect('schemes.grade', 'grade')
      .leftJoinAndSelect('schemes.items', 'items')
      .leftJoinAndSelect('schemes.subject', 'subject')
      .leftJoinAndSelect('schemes.term', 'term')

      .select([
        'schemes.id',
        'schemes.name',
        'items',
        'grade.id',
        'grade.name',
        'subject.id',
        'subject.name',
        'term.id',
        'term.name',
      ])
      .getOne();
  }

  async updateScheme(
    id: string,
    user: User,
    updateSchemeDto: UpdateSchemeDto,
  ): Promise<SchemeOfWork> {
    try {
      const scheme = await this.repository.findOne({
        where: { id, createdBy: { id: user.id } },
        relations: ['createdBy', 'school'],
      });

      if (!scheme) {
        throw new NotFoundException(
          `Scheme of work ${id} not found or you do not have permission to edit it`,
        );
      }

      const { items, ...schemeOfWorkData } = updateSchemeDto;

      if (items) {
        await this.entityManager.delete(SchemeOfWork, {
          id: scheme.id,
        });

        scheme.items = items.map((itemDto, index) =>
          this.entityManager.create(SchemeOfWorkSection, {
            ...itemDto,
            order: itemDto.order ?? index,
          }),
        );
      }

      Object.assign(scheme, schemeOfWorkData);

      return await this.repository.save(scheme);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating scheme', error);
      throw new BadRequestException('Error updating scheme');
    }
  }

  /**
   * Delete a scheme. Only the original creator may delete it.
   */
  async deleteScheme(id: string, user: User) {
    try {
      const scheme = await this.repository.update(
        { id, createdBy: { id: user.id } },
        {
          is_deleted: true,
        },
      );

      if (!scheme) {
        throw new NotFoundException(
          `Scheme of work ${id} not found or you do not have permission to delete it`,
        );
      }

      return customResponse('Scheme  deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting scheme', error);
      throw new BadRequestException('Error deleting scheme');
    }
  }
}
