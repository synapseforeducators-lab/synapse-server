import { Grade } from '../entities/grade.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GradeRepository extends AbstractRepository<Grade> {
  protected readonly logger = new Logger(GradeRepository.name);

  constructor(
    @InjectRepository(Grade)
    gradeRepository: Repository<Grade>,
    entityManager: EntityManager,
  ) {
    super(gradeRepository, entityManager);
  }
}
