import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Term } from '../entities/school-term.entity';

@Injectable()
export class TermRepository extends AbstractRepository<Term> {
  protected readonly logger = new Logger(TermRepository.name);

  constructor(
    @InjectRepository(Term)
    termRepository: Repository<Term>,
    entityManager: EntityManager,
  ) {
    super(termRepository, entityManager);
  }
}
