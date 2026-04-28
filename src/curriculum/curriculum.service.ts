import { Injectable } from '@nestjs/common';

import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { Curriculum } from './entities/curriculum.entity';
import { CurriculumRepository } from './repository/curriculums.repository';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CurriculumService {
  constructor(private readonly curriculumRepository: CurriculumRepository) {}

  async create(user: User, createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    return this.curriculumRepository.createCurriculum(user, createCurriculumDto);
  }

  async findAll(user: User): Promise<Curriculum[]> {
    return this.curriculumRepository.findAllForUser(user);
  }

  async findOne(id: string, user: User): Promise<Curriculum> {
    return this.curriculumRepository.findOneForUser(id, user);
  }

  async update(
    id: string,
    user: User,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    return this.curriculumRepository.updateCurriculum(id, user, updateCurriculumDto);
  }

  async remove(id: string, user: User): Promise<void> {
    return this.curriculumRepository.deleteCurriculum(id, user);
  }
}