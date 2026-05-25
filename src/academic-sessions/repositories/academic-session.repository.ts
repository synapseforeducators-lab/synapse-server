import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AcademicSession } from '../entities/academic-session.entity';
@Injectable()
export class AcademicSessionRepository {
  constructor(
    @InjectRepository(AcademicSession)
    private readonly repo: Repository<AcademicSession>,
  ) {}

  create(data: Partial<AcademicSession>) {
    return this.repo.create(data);
  }

  save(data: AcademicSession) {
    return this.repo.save(data);
  }

  findOne(options: any) {
    return this.repo.findOne(options);
  }

  find(options?: any) {
    return this.repo.find(options);
  }

  delete(criteria: any) {
    return this.repo.delete(criteria);
  }
}
