import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { School, SchoolRole } from '../entities/school.entity';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { User } from 'src/user/entities/user.entity';
import {
  SchoolMember,
  SchoolMemberStatus,
} from '../entities/school-member.entity';

@Injectable()
export class SchoolsRepository extends AbstractRepository<School> {
  protected readonly logger = new Logger(SchoolsRepository.name);

  constructor(
    @InjectRepository(School)
    schoolsRepository: Repository<School>,
    entityManager: EntityManager,
  ) {
    super(schoolsRepository, entityManager);
  }

  async createSchool(user: User, createSchoolDto: CreateSchoolDto) {
    let school: School;

    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const userRes = await transactionalEntityManager.findOne(User, {
          where: { id: user.id },
        });
        if (!userRes) {
          throw new NotFoundException('User not found');
        }

        school = await transactionalEntityManager.save(School, {
          ownerId: user.id,
          owner: user,
          ...createSchoolDto,
          is_school_verified: true,
        });

        await transactionalEntityManager.save(SchoolMember, {
          schoolId: school.id,
          userId: user.id,
          role: SchoolRole.OWNER,
          status: SchoolMemberStatus.ACTIVE,
          active: true,
        });
      },
    );

    delete school.owner;
    delete school.ownerId;

    return { school };
  }
}
