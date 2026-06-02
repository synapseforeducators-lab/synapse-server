import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeRepository } from './repository/grades.repository';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(private readonly gradeRepository: GradeRepository) {}
  async create(createGradeDto: CreateGradeDto) {
    const newGrade = new Grade({ name: createGradeDto.grade });

    const gradeRes = await this.gradeRepository.create(newGrade);

    if (!gradeRes) {
      throw new BadRequestException(
        'Unable to create grade at the moment, try again later',
      );
    }

    return gradeRes;
  }

  async getAllGrades() {
    const gradeRes = await this.gradeRepository.findAndSelect({}, [
      'id',
      'name',
    ]);

    if (!gradeRes) {
      throw new BadRequestException(
        'Unable to get grade at the moment, try again later',
      );
    }

    return gradeRes;
  }

  async findOne(id: string) {
    const gradeRes = await this.gradeRepository.findAndSelect(
      { id: id, is_archived: false },
      ['id', 'name'],
    );

    if (!gradeRes) {
      throw new BadRequestException(
        'Unable to get grade at the moment, try again later',
      );
    }

    return gradeRes;
  }

  async update(updateGradeDto: UpdateGradeDto) {
    const gradeRes = await this.gradeRepository.findOneAndUpdate(
      { id: updateGradeDto.id },
      updateGradeDto,
    );

    if (!gradeRes) {
      throw new BadRequestException(
        'Unable to get grade at the moment, try again later',
      );
    }

    return gradeRes;
  }

  async remove(id: string) {
    const gradeRes = await this.gradeRepository.findOneAndUpdate(
      { id: id },
      { is_archived: true },
    );

    if (!gradeRes) {
      throw new BadRequestException(
        'Unable to get grade at the moment, try again later',
      );
    }

    return gradeRes;
  }
}
