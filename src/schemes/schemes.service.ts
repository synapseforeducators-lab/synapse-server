import { Injectable, BadRequestException } from '@nestjs/common';

import { SchemeRepository } from './repositories/scheme.repository';

import { CreateSchemeDto } from './dto/create-scheme.dto';

import { UpdateSchemeDto } from './dto/update-scheme.dto';
import { User } from 'src/user/entities/user.entity';
import { SchemeOfWork } from './entities/scheme.entity';

@Injectable()
export class SchemesService {
  constructor(private readonly schemeRepo: SchemeRepository) {}

  async create(
    user: User,
    createCurriculumDto: CreateSchemeDto,
  ): Promise<SchemeOfWork> {
    return await this.schemeRepo.createSchemeOfWork(user, createCurriculumDto);
  }

  async getAllSchemes(user: User) {
    const currRes = await this.schemeRepo.getAllSchemes(user);

    if (!currRes) {
      throw new BadRequestException('unable to get schemes');
    }

    return currRes;
  }

  async getSchemeById(id: string, user: User): Promise<SchemeOfWork> {
    const currRes = await this.schemeRepo.getSchemeById(id, user);

    if (!currRes) {
      throw new BadRequestException('unable to get scheme');
    }

    return currRes;
  }

  async updateSchemeById(
    id: string,
    user: User,
    updateSchemeDto: UpdateSchemeDto,
  ): Promise<SchemeOfWork> {
    return this.schemeRepo.updateScheme(id, user, updateSchemeDto);
  }

  async remove(id: string, user: User) {
    return this.schemeRepo.deleteScheme(id, user);
  }
}
