import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { User } from 'src/user/entities/user.entity';
import { Note } from './entities/note.entity';
import { NotesRepository } from './repositories/notes.repository';
import { UpdateNoteDto } from './dto/update-note.dto';
import { customResponse } from 'src/common/util';

type NoteSummary = {
  id: string;
  schemeOfWorkWeek: string;
  topic: string;
  dateCreated: Date;
  subject: string;
  class: string;
};

type NoteDetail = {
  id: string;
  created_at: Date;
  schemeOfWorkSectionId: string;
  schemeId: string;
  curriculumId: string;
  templateId: string;
  schoolId: string | null;
  teacher: string;
  contents: any[];
  scheme: {
    id: string;
    subjectId: string | null;
    gradeId: string;
    termId: string;
    curriculumId: string;
    schoolId: string | null;
  };
  schemeOfWorkSection: {
    id: string;
    topic: string;
    objective: string;
    order: number;
    schemeId: string | null;
  };
  template: {
    id: string;
    name: string;
    school_name: string;
    schoolId: string | null;
  };
  curriculum: {
    id: string;
    name: string;
    subjectId: string;
    gradeId: string;
    schoolId: string | null;
  };
};

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async findAll(user: User): Promise<NoteSummary[]> {
    const notes = await this.notesRepository.getAllNotes(user);

    if (!notes) {
      throw new BadRequestException('unable to get notes');
    }

    return notes;
  }

  async create(
    user: User,
    createNoteDto: CreateNoteDto,
  ): Promise<{ id: string }> {
    const note = await this.notesRepository.createNote(user, createNoteDto);

    if (!note) {
      throw new BadRequestException('unable to create note');
    }

    return { id: note?.id };
  }

  async findOne(id: string, user: User): Promise<NoteDetail> {
    const note = await this.notesRepository.getNoteById(id, user);

    if (!note) {
      throw new BadRequestException('unable to get note');
    }

    const teacher = [note.createdBy?.first_name, note.createdBy?.last_name]
      .filter(Boolean)
      .join(' ');

    return {
      id: note.id,
      created_at: note.created_at,
      schemeOfWorkSectionId: note.schemeOfWorkSectionId,
      schemeId: note.schemeId,
      curriculumId: note.curriculumId,
      templateId: note.templateId,
      schoolId: note.schoolId ?? null,
      teacher,
      contents: note.contents ?? [],
      scheme: {
        id: note.scheme.id,
        subjectId: note.scheme.subjectId ?? null,
        gradeId: note.scheme.gradeId,
        termId: note.scheme.termId,
        curriculumId: note.scheme.curriculumId,
        schoolId: note.scheme.schoolId ?? null,
      },
      schemeOfWorkSection: {
        id: note.schemeOfWorkSection.id,
        topic: note.schemeOfWorkSection.topic,
        objective: note.schemeOfWorkSection.objective,
        order: note.schemeOfWorkSection.order,
        schemeId: note.schemeOfWorkSection.schemeId ?? null,
      },
      template: {
        id: note.template.id,
        name: note.template.name,
        school_name: note.template.school_name,
        schoolId: note.template.schoolId ?? null,
      },
      curriculum: {
        id: note.curriculum.id,
        name: note.curriculum.name,
        subjectId: note.curriculum.subjectId,
        gradeId: note.curriculum.gradeId,
        schoolId: note.curriculum.schoolId ?? null,
      },
    };
  }

  async update(id: string, user: User, updateNoteDto: UpdateNoteDto) {
    const note = await this.notesRepository.updateNote(id, user, updateNoteDto);

    if (!note) {
      throw new BadRequestException('unable to update note');
    }

    return customResponse('Note updated successfully', note);
  }

  async remove(id: string, user: User) {
    await this.notesRepository.deleteNote(id, user);

    return customResponse('Note deleted successfully');
  }
}
