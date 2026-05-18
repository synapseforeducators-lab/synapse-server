import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { Support } from '../entities/support.entity';

@Injectable()
export class SupportsRepository extends AbstractRepository<Support> {
  protected readonly logger = new Logger(SupportsRepository.name);

  constructor(
    @InjectRepository(Support)
    supportsRepository: Repository<Support>,
    entityManager: EntityManager,
  ) {
    super(supportsRepository, entityManager);
  }

  async getAllSupport() {
    return await this.repository
      .createQueryBuilder('support')
      .leftJoinAndSelect('support.user', 'user')
      .select([
        'support',
        'user.email',
        'user.first_name',
        'user.last_name',
        'support.complaint_type',
      ])
      .getMany();
  }
}
