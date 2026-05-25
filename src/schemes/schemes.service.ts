import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { SchemeRepository } from './repositories/scheme.repository';

import { CreateSchemeDto } from './dto/create-scheme.dto';

import { UpdateSchemeDto } from './dto/update-scheme.dto';

import { SchemePolicy } from './policies/scheme-policy';
import { SchemeStatus } from './enums/scheme-status.enum';


@Injectable()
export class SchemesService {
  constructor(
    private readonly schemeRepo: SchemeRepository,
  ) {}

  async create(
    userId: string,
    dto: CreateSchemeDto,
  ) {
    const scheme =
      this.schemeRepo.create({
        ...dto,

        createdById: userId,

        version: 1,

        status: SchemeStatus.DRAFT,
      });

    return this.schemeRepo.save(
      scheme,
    );
  }

  async findAll(filters?: any) {
    return this.schemeRepo.find({
      where: filters,

      relations: [
        'curriculum',
        'school',
        'team',
        'academicSession',
      ],

      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const scheme =
      await this.schemeRepo.findOne({
        where: { id },

        relations: [
          'curriculum',
          'school',
          'team',
          'academicSession',
          'createdBy',
        ],
      });

    if (!scheme) {
      throw new NotFoundException(
        'Scheme not found',
      );
    }

    return scheme;
  }

  async update(
    id: string,
    currentUser: any,
    dto: UpdateSchemeDto,
  ) {
    const scheme =
      await this.findOne(id);

    const canEdit =
      SchemePolicy.canEdit({
        createdById:
          scheme.createdById,

        currentUserId:
          currentUser.id,
      });

    if (!canEdit) {
      throw new ForbiddenException(
        'You cannot edit this scheme',
      );
    }

    Object.assign(scheme, dto);

    scheme.updatedById =
      currentUser.id;

    scheme.version += 1;

    return this.schemeRepo.save(
      scheme,
    );
  }

  async publish(
    id: string,
    currentUser: any,
  ) {
    const scheme =
      await this.findOne(id);

    const canPublish =
      SchemePolicy.canPublish({});

    if (!canPublish) {
      throw new ForbiddenException(
        'You cannot publish this scheme',
      );
    }

    scheme.status =
      SchemeStatus.PUBLISHED;

    scheme.published = true;

    scheme.updatedById =
      currentUser.id;

    return this.schemeRepo.save(
      scheme,
    );
  }

  async archive(
    id: string,
    currentUser: any,
  ) {
    const scheme =
      await this.findOne(id);

    scheme.status =
      SchemeStatus.ARCHIVED;

    scheme.updatedById =
      currentUser.id;

    return this.schemeRepo.save(
      scheme,
    );
  }

  async duplicate(
    id: string,
    currentUser: any,
  ) {
    const scheme =
      await this.findOne(id);

    const duplicate =
      this.schemeRepo.create({
        subject: scheme.subject,

        className: scheme.className,

        term: scheme.term,

        curriculumId:
          scheme.curriculumId,

        schoolId: scheme.schoolId,


        academicSessionId:
          scheme.academicSessionId,

        weeks: scheme.weeks,

        copiedFromSchemeId:
          scheme.id,

        createdById:
          currentUser.id,

        version: 1,

        status: SchemeStatus.DRAFT,
      });

    return this.schemeRepo.save(
      duplicate,
    );
  }

  async remove(
    id: string,
    currentUser: any,
  ) {
    const scheme =
      await this.findOne(id);

    const canEdit =
      SchemePolicy.canEdit({
        createdById:
          scheme.createdById,

        currentUserId:
          currentUser.id,
      });

    if (!canEdit) {
      throw new ForbiddenException(
        'You cannot delete this scheme',
      );
    }

    return this.schemeRepo.delete({
      id,
    });
  }
}