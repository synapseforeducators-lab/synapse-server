import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectRepository } from './repository/subjects.repository';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}
  async create(createSubjectDto: CreateSubjectDto) {
    const newSubject = new Subject({ name: createSubjectDto.subject });

    const subjectRes = await this.subjectRepository.create(newSubject);

    if (!subjectRes) {
      throw new BadRequestException(
        'Unable to create subject at the moment, try again later',
      );
    }

    return subjectRes;
  }

  async getAllSubjects() {
    const subjectRes = await this.subjectRepository.findAndSelect({}, [
      'id',
      'name',
    ]);

    if (!subjectRes) {
      throw new BadRequestException(
        'Unable to get subject at the moment, try again later',
      );
    }

    return subjectRes;
  }

  async findOne(id: string) {
    const subjectRes = await this.subjectRepository.findAndSelect(
      { id: id, is_archived: false },
      ['id', 'name'],
    );

    if (!subjectRes) {
      throw new BadRequestException(
        'Unable to get subject at the moment, try again later',
      );
    }

    return subjectRes;
  }

  async update(updateSubjectDto: UpdateSubjectDto) {
    const subjectRes = await this.subjectRepository.findOneAndUpdate(
      { id: updateSubjectDto.id },
      updateSubjectDto,
    );

    if (!subjectRes) {
      throw new BadRequestException(
        'Unable to get subject at the moment, try again later',
      );
    }

    return subjectRes;
  }

  async remove(id: string) {
    const subjectRes = await this.subjectRepository.findOneAndUpdate(
      { id: id },
      { is_archived: true },
    );

    if (!subjectRes) {
      throw new BadRequestException(
        'Unable to get subject at the moment, try again later',
      );
    }

    return subjectRes;
  }
}
