import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { AcademicSessionRepository } from './repositories/academic-session.repository';

import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';

import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

import { AcademicSessionStatus } from './enums/academic-session-status.enum';
@Injectable()
export class AcademicSessionsService {
  constructor(private readonly sessionRepo: AcademicSessionRepository) {}

  async create(dto: CreateAcademicSessionDto) {
    const exists = await this.sessionRepo.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Academic session already exists');
    }

    const session = this.sessionRepo.create({
      ...dto,
      status: AcademicSessionStatus.INACTIVE,
      isCurrent: false,
    });

    return this.sessionRepo.save(session);
  }

  async findAll() {
    return this.sessionRepo.find({
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: string, dto: UpdateAcademicSessionDto) {
    const session = await this.findOne(id);

    Object.assign(session, dto);

    return this.sessionRepo.save(session);
  }

  async setCurrent(id: string) {
    const session = await this.findOne(id);

    // unset previous current session
    const all = await this.sessionRepo.find();

    for (const s of all) {
      s.isCurrent = false;
      s.status = AcademicSessionStatus.INACTIVE;
      await this.sessionRepo.save(s);
    }

    session.isCurrent = true;
    session.status = AcademicSessionStatus.ACTIVE;

    return this.sessionRepo.save(session);
  }

  async archive(id: string) {
    const session = await this.findOne(id);

    session.status = AcademicSessionStatus.ARCHIVED;
    session.isCurrent = false;

    return this.sessionRepo.save(session);
  }

  async remove(id: string) {
    const session = await this.findOne(id);

    if (session.isCurrent) {
      throw new BadRequestException('Cannot delete active session');
    }

    return this.sessionRepo.delete({ id });
  }
}
