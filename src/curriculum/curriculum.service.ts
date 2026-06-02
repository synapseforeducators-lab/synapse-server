import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { Curriculum } from './entities/curriculum.entity';
import { CurriculumRepository } from './repository/curriculums.repository';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CurriculumService {
  constructor(private readonly curriculumRepository: CurriculumRepository) {}

  async create(
    user: User,
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<Curriculum> {
    return await this.curriculumRepository.createCurriculum(
      user,
      createCurriculumDto,
    );
  }

  async getAllCurriculum(user: User) {
    const currRes = await this.curriculumRepository.getAllCurriculum(user);

    if (!currRes) {
      throw new BadRequestException('unable to get curriculum');
    }

    return currRes;
  }

  async getCurriculumById(id: string, user: User): Promise<Curriculum> {
    const currRes = await this.curriculumRepository.getCurriculumById(id, user);

    if (!currRes) {
      throw new BadRequestException('unable to get curriculum');
    }

    return currRes;
  }

  async getCurriculumForSchemeById(
    id: string,
    user: User,
  ): Promise<Curriculum> {
    const currRes = await this.curriculumRepository.getCurriculumForSchemeById(
      id,
      user,
    );

    if (!currRes) {
      throw new BadRequestException('unable to get curriculum');
    }

    return currRes;
  }

  async updateCurriculumById(
    id: string,
    user: User,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    return this.curriculumRepository.updateCurriculum(
      id,
      user,
      updateCurriculumDto,
    );
  }

  async remove(id: string, user: User) {
    return this.curriculumRepository.deleteCurriculum(id, user);
  }
}
