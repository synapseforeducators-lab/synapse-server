import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { DatabaseModule } from 'src/common';
import { TemplatesRepository } from './repository/templates.repository';
import { Template } from './entities/template.entity';
import { TemplateSection } from './entities/section.entity';

@Module({
  imports: [DatabaseModule.forFeature([Template, TemplateSection])],
  controllers: [TemplateController],
  providers: [TemplateService, TemplatesRepository],
})
export class TemplateModule {}
