import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, IsNull, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Curriculum } from '../entities/curriculum.entity';

import { CreateCurriculumDto } from '../dto/create-curriculum.dto';
import { UpdateCurriculumDto } from '../dto/update-curriculum.dto';
import { User } from 'src/user/entities/user.entity';
import { CurriculumItem } from '../entities/curriculum-entity.entity';

@Injectable()
export class CurriculumRepository extends AbstractRepository<Curriculum> {
  protected readonly logger = new Logger(CurriculumRepository.name);

  constructor(
    @InjectRepository(Curriculum)
    curriculumRepository: Repository<Curriculum>,
    entityManager: EntityManager,
  ) {
    super(curriculumRepository, entityManager);
  }

  /**
   * Create a new curriculum.
   * Automatically associates with the user's school if they belong to one.
   */
  async createCurriculum(
    user: User,
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<Curriculum> {
    try {
      const { items = [], ...curriculumData } = createCurriculumDto;

      const curriculumItems = items.map((itemDto, index) =>
        this.entityManager.create(CurriculumItem, {
          ...itemDto,
          order: itemDto.order ?? index,
        }),
      );

      const curriculum = this.repository.create({
        ...curriculumData,
        school: user.school ?? null,
        createdBy: user,
        items: curriculumItems,
      });

      return await this.repository.save(curriculum);
    } catch (error) {
      this.logger.error('Error creating curriculum', error);
      throw new BadRequestException('Error creating curriculum');
    }
  }

  /**
   * Find all curricula visible to the user.
   *
   * Rules:
   *  - School member → school curricula + own personal curricula (no school)
   *  - No school     → own curricula only
   */
  async findAllForUser(user: User): Promise<Curriculum[]> {
    try {
      if (user.school) {
        return await this.repository.find({
          where: [
            { school: { id: user.school.id } },
            { createdBy: { id: user.id }, school: IsNull() },
          ],
          relations: ['createdBy', 'school'],
          order: { created_at: 'DESC' },
        });
      }

      return await this.repository.find({
        where: { createdBy: { id: user.id } },
        relations: ['createdBy', 'school'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Error fetching curricula', error);
      throw new BadRequestException('Error fetching curricula');
    }
  }

  /**
   * Find a single curriculum by id if it is accessible to the user.
   */
  async findOneForUser(id: string, user: User): Promise<Curriculum> {
    try {
      let curriculum: Curriculum | null = null;

      if (user.school) {
        curriculum = await this.repository.findOne({
          where: [
            { id, school: { id: user.school.id } },
            { id, createdBy: { id: user.id }, school: IsNull() },
          ],
          relations: ['createdBy', 'school'],
        });
      } else {
        curriculum = await this.repository.findOne({
          where: { id, createdBy: { id: user.id } },
          relations: ['createdBy', 'school'],
        });
      }

      if (!curriculum) {
        throw new NotFoundException(`Curriculum ${id} not found`);
      }

      return curriculum;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching curriculum', error);
      throw new BadRequestException('Error fetching curriculum');
    }
  }

  /**
   * Update a curriculum. Only the original creator may update it.
   */
  async updateCurriculum(
    id: string,
    user: User,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    try {
      const curriculum = await this.repository.findOne({
        where: { id, createdBy: { id: user.id } },
        relations: ['createdBy', 'school'],
      });

      if (!curriculum) {
        throw new NotFoundException(
          `Curriculum ${id} not found or you do not have permission to edit it`,
        );
      }

      const { items, ...curriculumData } = updateCurriculumDto;

      if (items) {
        await this.entityManager.delete(CurriculumItem, {
          curriculum: { id },
        });

        curriculum.items = items.map((itemDto, index) =>
          this.entityManager.create(CurriculumItem, {
            ...itemDto,
            order: itemDto.order ?? index,
          }),
        );
      }

      Object.assign(curriculum, curriculumData);

      return await this.repository.save(curriculum);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating curriculum', error);
      throw new BadRequestException('Error updating curriculum');
    }
  }

  /**
   * Delete a curriculum. Only the original creator may delete it.
   */
  async deleteCurriculum(id: string, user: User): Promise<void> {
    try {
      const curriculum = await this.repository.findOne({
        where: { id, createdBy: { id: user.id } },
      });

      if (!curriculum) {
        throw new NotFoundException(
          `Curriculum ${id} not found or you do not have permission to delete it`,
        );
      }

      await this.repository.remove(curriculum);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting curriculum', error);
      throw new BadRequestException('Error deleting curriculum');
    }
  }
}