import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from './common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './common/sms/sms.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { EmailModule } from './common/email/email.module';
import { TemplateModule } from './template/template.module';
import { SupportModule } from './support/support.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { SubjectModule } from './subject/subject.module';
import { SchoolModule } from './schools/school.module';
import { BillingModule } from './billing/billing.module';
import { SchemesModule } from './schemes/schemes.module';
import { NotesModule } from './notes/notes.module';
import { UsageModule } from './usage/usage.module';
import { AcademicSessionsModule } from './academic-sessions/academic-sessions.module';
import { GradesModule } from './grades/grades.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        PORT: Joi.number().required(),
        DB_SYNCHRONIZE: Joi.boolean().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRE_IN: Joi.string().required(),
        REFRESH_JWT_SECRET: Joi.string().required(),
        REFRESH_JWT_EXPIRE_IN: Joi.string().required(),
      }),
    }),
    DatabaseModule,

    UserModule,
    AuthModule,
    SmsModule,
    CloudinaryModule,
    EmailModule,
    TemplateModule,
    SupportModule,
    CurriculumModule,
    SubjectModule,
    SchoolModule,
    BillingModule,
    SchemesModule,
    NotesModule,
    UsageModule,
    AcademicSessionsModule,
    GradesModule,
    DashboardModule,
    BackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
