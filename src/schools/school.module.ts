import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolsService } from './school.service';
import { DatabaseModule } from 'src/common';
import { School } from './entities/school.entity';
import { SchoolsRepository } from './repository/schools.repository';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { SchoolMember } from './entities/school-member.entity';
import { SchoolMembersRepository } from './repository/school-members.repository';
import { SchoolInvitation } from './entities/school-invitation.entity';
import { SchoolInvitationsService } from './school-invitations.service';
import { SchoolInvitationRepository } from './repository/school-invitation.repository';
import { EmailModule } from 'src/common/email/email.module';

@Module({
  imports: [
    DatabaseModule.forFeature([School, SchoolMember, SchoolInvitation]),
    CloudinaryModule,
    EmailModule,
  ],
  controllers: [SchoolController],
  providers: [
    SchoolsService,
    SchoolsRepository,
    SchoolMembersRepository,
    SchoolInvitationsService,
    SchoolInvitationRepository,
  ],
  exports: [SchoolsService, SchoolInvitationsService],
})
export class SchoolModule {}
