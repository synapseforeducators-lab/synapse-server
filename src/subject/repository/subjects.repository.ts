import { Subject } from './../entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SubjectRepository extends AbstractRepository<Subject> {
  protected readonly logger = new Logger(SubjectRepository.name);

  constructor(
    @InjectRepository(Subject)
    subjectRepository: Repository<Subject>,
    entityManager: EntityManager,
  ) {
    super(subjectRepository, entityManager);
  }
}
