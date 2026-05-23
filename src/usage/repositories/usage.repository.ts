import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UsageTracking } from '../entities/usage-tracking.entity';

@Injectable()
export class UsageRepository {
  constructor(
    @InjectRepository(UsageTracking)
    private readonly repo: Repository<UsageTracking>,
  ) {}

  create(data: Partial<UsageTracking>) {
    return this.repo.create(data);
  }

  save(data: UsageTracking) {
    return this.repo.save(data);
  }

  findOne(options: any) {
    return this.repo.findOne(options);
  }
}
