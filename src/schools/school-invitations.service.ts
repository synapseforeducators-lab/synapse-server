import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  AcceptInviteUserDto,
  InviteSchoolMemberDto,
} from './dto/invite-school-member.dto';
import { InvitationStatus } from './entities/school-invitation.entity';
import { SchoolInvitationRepository } from './repository/school-invitation.repository';
import { SchoolMembersRepository } from './repository/school-members.repository';
import { EmailService } from 'src/common/email/email.service';
import { SchoolsRepository } from './repository/schools.repository';
import { customResponse } from 'src/common/util';
import { ConfigService } from '@nestjs/config';
import dayjs = require('dayjs');

@Injectable()
export class SchoolInvitationsService {
  constructor(
    private readonly invitationRepo: SchoolInvitationRepository,
    private readonly memberRepo: SchoolMembersRepository,
    private readonly schoolsRepository: SchoolsRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async invite(
    schoolId: string,
    invitedById: string,
    dto: InviteSchoolMemberDto,
  ) {
    const school = await this.schoolsRepository.findOne({
      id: schoolId,
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const existing = await this.invitationRepo.findOne({
      schoolId,
      email: dto.email,
      status: InvitationStatus.PENDING,
    });

    if (existing) {
      throw new BadRequestException('Invitation already exists');
    }

    const token = crypto.randomUUID();

    const invitation = await this.invitationRepo.createInvitation({
      schoolId,
      email: dto.email,
      role: dto.role,
      token,
      invitedById,
      school: school,
      status: InvitationStatus.PENDING,
      expiresAt: dayjs().add(7, 'days').toDate(),
    });

    if (!invitation) {
      throw new BadRequestException('Unable to send invitation');
    }

    const { data, error } = await this.emailService.send({
      // to: dto.email,
      to: 'synapseforeducators@gmail.com',
      subject: `${school.school_name} - Invitation to Join`,
      html: `Hi ${dto.first_name}, <br/> <br/> You have been invited to join ${school.school_name}:  <br/><br/> <a href="${this.configService.get('FRONTEND_URL')}/accept-invitation?token=${invitation.token}&email=${dto.email}&first_name=${dto.first_name}&last_name=${dto.last_name}">Accept Invitation</a> <a href="${this.configService.get('FRONTEND_URL')}/cancel-invitation?invitationId=${invitation.id}">Cancel Invitation</a>`,
    });

    console.log({ data, error, invitation });

    return customResponse('Invitation sent successfully');
  }

  async acceptInvitation(dto: AcceptInviteUserDto) {
    const { invitation } =
      await this.invitationRepo.acceptInvitationNewUser(dto);

    if (!invitation) {
      throw new BadRequestException('Unable to accept invitation');
    }

    return customResponse('Invitation accepted successfully');
  }

  async cancelInvitation(id: string) {
    const invitation = await this.invitationRepo.findOne({
      id,
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = InvitationStatus.CANCELLED;

    return this.invitationRepo.save(invitation);
  }

  async getSchoolInvitations(schoolId: string) {
    return this.invitationRepo.findWithRelation({ schoolId });
  }
}
