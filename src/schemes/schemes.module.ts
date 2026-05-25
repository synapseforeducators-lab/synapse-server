import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { SchemesController } from './schemes.controller';

import { SchemesService } from './schemes.service';

import { SchemeRepository } from './repositories/scheme.repository';

import { SchemeOfWork } from './entities/scheme.entity';

import { UsageModule } from 'src/usage/usage.module';
@Module({
  imports: [TypeOrmModule.forFeature([SchemeOfWork]), UsageModule],

  controllers: [SchemesController],

  providers: [SchemesService, SchemeRepository],

  exports: [SchemesService],
})
export class SchemesModule {}
