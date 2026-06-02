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
import { SchoolInviteController } from './school-invite.controller';
import { Term } from './entities/school-term.entity';
import { TermRepository } from './repository/school-terms.repository';
import { TermsService } from './school-term.service';
import { TermsController } from './school-term.controller';

@Module({
  imports: [
    DatabaseModule.forFeature([School, SchoolMember, SchoolInvitation, Term]),
    CloudinaryModule,
    EmailModule,
  ],
  controllers: [SchoolController, SchoolInviteController, TermsController],
  providers: [
    SchoolsService,
    TermsService,
    SchoolsRepository,
    SchoolMembersRepository,
    SchoolInvitationsService,
    SchoolInvitationRepository,
    TermRepository,
  ],
  exports: [SchoolsService, SchoolInvitationsService, TermsService],
})
export class SchoolModule {}
