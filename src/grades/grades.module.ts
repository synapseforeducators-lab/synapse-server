import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { DatabaseModule } from 'src/common';
import { Grade } from './entities/grade.entity';
import { GradeRepository } from './repository/grades.repository';

@Module({
  imports: [DatabaseModule.forFeature([Grade])],
  controllers: [GradesController],
  providers: [GradesService, GradeRepository],
  exports: [GradesService],
})
export class GradesModule {}
