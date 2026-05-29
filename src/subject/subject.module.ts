import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';
import { DatabaseModule } from 'src/common';
import { Subject } from './entities/subject.entity';
import { SubjectRepository } from './repository/subjects.repository';

@Module({
  imports: [DatabaseModule.forFeature([Subject])],
  controllers: [SubjectController],
  providers: [SubjectService, SubjectRepository],
  exports: [SubjectService],
})
export class SubjectModule {}
