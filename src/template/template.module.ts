import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { DatabaseModule } from 'src/common';
import { TemplatesRepository } from './repository/templates.repository';
import { Template } from './entities/template.entity';
import { TemplateSection } from './entities/section.entity';
import { UsageModule } from 'src/usage/usage.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Template, TemplateSection]),
    UsageModule,
  ],
  controllers: [TemplateController],
  providers: [TemplateService, TemplatesRepository],
})
export class TemplateModule {}
