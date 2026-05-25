import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionsController } from './academic-sessions.controller';

import { AcademicSessionsService } from './academic-sessions.service';

import { AcademicSessionRepository } from './repositories/academic-session.repository';
import { AcademicSession } from './entities/academic-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicSession])],

  controllers: [AcademicSessionsController],

  providers: [AcademicSessionsService, AcademicSessionRepository],

  exports: [AcademicSessionsService],
})
export class AcademicSessionsModule {}
