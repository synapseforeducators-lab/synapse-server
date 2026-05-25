import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SchemeOfWork } from '../entities/scheme.entity';
@Injectable()
export class SchemeRepository {
  constructor(
    @InjectRepository(SchemeOfWork)
    private readonly repo: Repository<SchemeOfWork>,
  ) {}

  create(data: Partial<SchemeOfWork>) {
    return this.repo.create(data);
  }

  save(data: SchemeOfWork) {
    return this.repo.save(data);
  }

  findOne(options: any) {
    return this.repo.findOne(options);
  }

  find(options: any) {
    return this.repo.find(options);
  }

  delete(criteria: any) {
    return this.repo.delete(criteria);
  }
}
