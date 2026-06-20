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
  async validateSchoolMemberProfile(userId: string) {
    const result = await this.entityManager.update(
      User,
      { id: userId },
      { is_individual_only: true },
    );

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    const user = await this.entityManager.findOne(User, {
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async createSchool(user: User, createSchoolDto: CreateSchoolDto) {
    let school: School;

    await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const userRes = await this.validateSchoolMemberProfile(user.id);

        school = await transactionalEntityManager.save(School, {
          ownerId: userRes.id,
          owner: userRes,
          ...createSchoolDto,
          is_school_verified: true,
        });

        await transactionalEntityManager.save(SchoolMember, {
          schoolId: school.id,
          userId: userRes.id,
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
