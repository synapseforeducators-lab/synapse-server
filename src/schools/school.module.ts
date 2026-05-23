import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolsService } from './school.service';
import { DatabaseModule } from 'src/common';
import { School } from './entities/school.entity';
import { SchoolsRepository } from './repository/schools.repository';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { SchoolMember } from './entities/school-member.entity';
import { SchoolMembersRepository } from './repository/school-members.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([School, SchoolMember]),
    CloudinaryModule,
  ],
  controllers: [SchoolController],
  providers: [SchoolsService, SchoolsRepository, SchoolMembersRepository],
  exports: [SchoolsService],
})
export class SchoolModule {}
