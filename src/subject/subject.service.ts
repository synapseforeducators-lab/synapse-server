import { Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  create(createSubjectDto: CreateSubjectDto) {
    return createSubjectDto;
  }

  findAll() {
    return `This action returns all subject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subject`;
  }

  update(id: number, updateSubjectDto: UpdateSubjectDto) {
    return { updateSubjectDto, id };
  }

  remove(id: number) {
    return `This action removes a #${id} subject`;
  }
}
