import { Logger } from '@nestjs/common';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractEntity } from './abstract.entity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    const entity = await this.repository.findOne({ where, relations });

    if (!entity) {
      this.logger.warn('Document not found with where', where);
    }

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    const updateResult = await this.repository.update(where, partialEntity);

    if (!updateResult.affected) {
      this.logger.warn('Entity not found with where', where);
    }

    return this.findOne(where);
  }

  async find(where: FindOptionsWhere<T>) {
    return this.repository.findBy(where);
  }
  async findWithRelation(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
    select?: (keyof T)[],
    order?: FindOptionsOrder<T>,
  ) {
    return this.repository.find({ where, relations, order, select });
  }
  async count(where: FindOptionsWhere<T>) {
    return this.repository.count({ where });
  }
  async increment(
    where: FindOptionsWhere<T>,
    propertyPath: string,
    value: number | string,
  ) {
    return this.repository.increment(where, propertyPath, value);
  }

  async findAndSelect(where: FindOptionsWhere<T>, select: (keyof T)[]) {
    return this.repository.find({ where, select });
  }

  async findAdvanced(options: {
    where?: Record<string, any>;
    select?: string[];
    relations?: string[];
  }) {
    const alias = this.repository.metadata.tableName; // or 'entity'

    const qb = this.repository.createQueryBuilder(alias);

    // ✅ SELECT
    if (options.select?.length) {
      qb.select(options.select.map((field) => `${alias}.${field}`));
    }

    // ✅ RELATIONS
    if (options.relations?.length) {
      options.relations.forEach((relation) => {
        qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
      });
    }

    // ✅ WHERE (simple version)
    if (options.where) {
      Object.entries(options.where).forEach(([key, value], index) => {
        const paramKey = `param${index}`;

        if (index === 0) {
          qb.where(`${alias}.${key} = :${paramKey}`, {
            [paramKey]: value,
          });
        } else {
          qb.andWhere(`${alias}.${key} = :${paramKey}`, {
            [paramKey]: value,
          });
        }
      });
    }

    return qb.getMany();
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    await this.repository.delete(where);
  }

  qb(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
