import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from 'src/common';
import { EntityManager, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Note } from '../entities/note.entity';
import { CreateNoteDto } from '../dto/create-note.dto';
import { User } from 'src/user/entities/user.entity';
import { School } from 'src/schools/entities/school.entity';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { SchemeOfWork } from 'src/schemes/entities/scheme.entity';
import { SchemeOfWorkSection } from 'src/schemes/entities/scheme-item.entity';
import { Template } from 'src/template/entities/template.entity';
import { UpdateNoteDto } from '../dto/update-note.dto';

type NoteSummary = {
  id: string;
  schemeOfWorkWeek: string;
  topic: string;
  dateCreated: Date;
  subject: string;
  class: string;
};

@Injectable()
export class NotesRepository extends AbstractRepository<Note> {
  protected readonly logger = new Logger(NotesRepository.name);

  constructor(
    @InjectRepository(Note)
    notesRepository: Repository<Note>,
    entityManager: EntityManager,
  ) {
    super(notesRepository, entityManager);
  }

  async getAllNotes(user: User): Promise<NoteSummary[]> {
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      select: { schoolId: true },
      where: { userId: user.id },
    });

    const query = this.entityManager
      .createQueryBuilder(Note, 'notes')
      .leftJoin('notes.scheme', 'scheme')
      .leftJoin('notes.schemeOfWorkSection', 'schemeOfWorkSection')
      .leftJoin('scheme.subject', 'subject')
      .leftJoin('scheme.grade', 'grade')
      .where('notes.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('notes.created_at', 'DESC')
      .select([
        'notes.id AS id',
        'notes.created_at AS "dateCreated"',
        'schemeOfWorkSection.topic AS topic',
        'schemeOfWorkSection.order AS "weekOrder"',
        'subject.name AS subject',
        'grade.name AS class',
      ]);

    if (schoolMember?.schoolId) {
      query.andWhere('notes.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query
        .andWhere('notes.createdById = :createdById', { createdById: user.id })
        .andWhere('notes.schoolId IS NULL');
    }

    const notes = await query.getRawMany<{
      id: string;
      dateCreated: Date;
      topic: string;
      weekOrder: number | null;
      subject: string;
      class: string;
    }>();

    return notes.map((note) => ({
      id: note.id,
      schemeOfWorkWeek: `Wk ${(note.weekOrder ?? 0) + 1}`,
      topic: note.topic,
      dateCreated: note.dateCreated,
      subject: note.subject,
      class: note.class,
    }));
  }

  async createNote(user: User, createNoteDto: CreateNoteDto): Promise<Note> {
    try {
      let note: Note;
      let schoolExist: School | null = null;

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

          const scheme = await transactionalEntityManager.findOne(
            SchemeOfWork,
            {
              where: {
                id: createNoteDto.schemeId,
                is_deleted: false,
              },
              relations: ['createdBy', 'school'],
            },
          );

          if (!scheme) {
            throw new BadRequestException('Invalid scheme of work specified');
          }

          if (schoolExist?.id) {
            if (scheme.schoolId !== schoolExist.id) {
              throw new BadRequestException(
                'You can only create notes for schemes in your school',
              );
            }
          } else if (scheme.createdById !== user.id || scheme.schoolId) {
            throw new BadRequestException(
              'You can only create notes for your own scheme of work',
            );
          }

          const schemeSection = await transactionalEntityManager.findOne(
            SchemeOfWorkSection,
            {
              where: {
                id: createNoteDto.schemeOfWorkSectionId,
                schemeId: scheme.id,
              },
            },
          );

          if (!schemeSection) {
            throw new BadRequestException(
              'Invalid scheme of work section specified',
            );
          }

          const template = await transactionalEntityManager.findOne(Template, {
            where: {
              id: createNoteDto.templateId,
              is_deleted: false,
            },
          });

          if (!template) {
            throw new BadRequestException('Invalid template specified');
          }

          if (schoolExist?.id) {
            if (template.schoolId && template.schoolId !== schoolExist.id) {
              throw new BadRequestException(
                'You can only use templates from your school',
              );
            }
          } else if (template.createdById !== user.id || template.schoolId) {
            throw new BadRequestException(
              'You can only use your own template when creating notes',
            );
          }

          const newNote = new Note({
            scheme,
            schemeId: scheme.id,
            schemeOfWorkSection: schemeSection,
            schemeOfWorkSectionId: schemeSection.id,
            curriculum: scheme.curriculum,
            curriculumId: scheme.curriculumId,
            template,
            templateId: template.id,
            createdBy: user,
            createdById: user.id,
            school: schoolExist,
            schoolId: schoolExist?.id ?? null,
            contents: createNoteDto.contents ?? [],
          });

          note = await transactionalEntityManager.save(newNote);
        },
      );

      return note;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error creating note', error);
      throw new BadRequestException('Error creating note');
    }
  }

  async getNoteById(id: string, user: User): Promise<Note> {
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      select: { schoolId: true },
      where: { userId: user.id },
    });

    const query = this.entityManager
      .createQueryBuilder(Note, 'notes')
      .leftJoinAndSelect('notes.scheme', 'scheme')
      .leftJoinAndSelect('notes.schemeOfWorkSection', 'schemeOfWorkSection')
      .leftJoinAndSelect('notes.template', 'template')
      .leftJoinAndSelect('notes.curriculum', 'curriculum')
      .leftJoinAndSelect('notes.createdBy', 'createdBy')
      .where('notes.id = :id', { id })
      .andWhere('notes.is_deleted = :isDeleted', { isDeleted: false });

    if (schoolMember?.schoolId) {
      query.andWhere('notes.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query
        .andWhere('notes.createdById = :createdById', { createdById: user.id })
        .andWhere('notes.schoolId IS NULL');
    }

    return query.getOne();
  }

  async updateNote(
    id: string,
    user: User,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    try {
      const note = await this.repository.findOne({
        where: { id, createdBy: { id: user.id }, is_deleted: false },
        relations: ['createdBy', 'school', 'scheme'],
      });

      if (!note) {
        throw new NotFoundException(
          `Note ${id} not found or you do not have permission to edit it`,
        );
      }

      if (updateNoteDto.templateId) {
        const template = await this.entityManager.findOne(Template, {
          where: { id: updateNoteDto.templateId, is_deleted: false },
        });

        if (!template) {
          throw new BadRequestException('Invalid template specified');
        }

        if (note.schoolId) {
          if (template.schoolId && template.schoolId !== note.schoolId) {
            throw new BadRequestException(
              'You can only use templates from your school',
            );
          }
        } else if (template.createdById !== user.id || template.schoolId) {
          throw new BadRequestException(
            'You can only use your own template when updating notes',
          );
        }

        note.template = template;
        note.templateId = template.id;
      }

      if (updateNoteDto.schemeOfWorkSectionId) {
        const schemeSection = await this.entityManager.findOne(
          SchemeOfWorkSection,
          {
            where: {
              id: updateNoteDto.schemeOfWorkSectionId,
              schemeId: note.schemeId,
            },
          },
        );

        if (!schemeSection) {
          throw new BadRequestException(
            'Invalid scheme of work section specified',
          );
        }

        note.schemeOfWorkSection = schemeSection;
        note.schemeOfWorkSectionId = schemeSection.id;
      }

      if (updateNoteDto.contents !== undefined) {
        note.contents = updateNoteDto.contents;
      }

      return await this.repository.save(note);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error('Error updating note', error);
      throw new BadRequestException('Error updating note');
    }
  }

  async deleteNote(id: string, user: User) {
    try {
      const note = await this.repository.update(
        { id, createdBy: { id: user.id } },
        {
          is_deleted: true,
        },
      );

      if (!note.affected) {
        throw new NotFoundException(
          `Note ${id} not found or you do not have permission to delete it`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error('Error deleting note', error);
      throw new BadRequestException('Error deleting note');
    }
  }
}
