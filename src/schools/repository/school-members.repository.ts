import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { SchoolMember } from '../entities/school-member.entity';

@Injectable()
export class SchoolMembersRepository extends AbstractRepository<SchoolMember> {
  protected readonly logger = new Logger(SchoolMembersRepository.name);

  constructor(
    @InjectRepository(SchoolMember)
    schoolMembersRepository: Repository<SchoolMember>,
    entityManager: EntityManager,
  ) {
    super(schoolMembersRepository, entityManager);
  }
}
