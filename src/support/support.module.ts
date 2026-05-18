import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportsRepository } from './repository/supports.repository';
import { DatabaseModule } from 'src/common';
import { Support } from './entities/support.entity';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [DatabaseModule.forFeature([Support]), CloudinaryModule],
  controllers: [SupportController],
  providers: [SupportService, SupportsRepository],
})
export class SupportModule {}
