import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { School } from '../entities/school.entity';
import { CreateSchoolDto } from '../dto/create-school.dto';

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

  async createSchoolProfile(
    user: User,
    createSchoolDto: CreateSchoolDto,
  ): Promise<School> {
    try {
      if (user.school) {
        throw new Error('User already belongs to a school');
      }

      const school = this.repository.create({
        ...createSchoolDto,
        createdBy: user,
      });

      const savedSchool = await this.repository.save(school);

      // attach school to user
      user.school = savedSchool;
      await this.entityManager.save(User, user);

      return savedSchool;
    } catch (error) {
      throw new BadRequestException('Error creating school profile');
    }
  }
}
