import { Module } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { DatabaseModule } from 'src/common';
import { Curriculum } from './entities/curriculum.entity';
import { CurriculumItem } from './entities/curriculum-items.entity';
import { CurriculumRepository } from './repository/curriculums.repository';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Curriculum, CurriculumItem]),
    UsageModule,
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService, CurriculumRepository],
})
export class CurriculumModule {}
