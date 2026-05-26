import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SchoolInvitation } from '../entities/school-invitation.entity';
import { InvitationStatus } from '../entities/school-invitation.entity';
import {
  SchoolMember,
  SchoolMemberStatus,
} from '../entities/school-member.entity';
import { AcceptInviteUserDto } from '../dto/invite-school-member.dto';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SchoolInvitationRepository extends AbstractRepository<SchoolInvitation> {
  protected readonly logger = new Logger(SchoolInvitationRepository.name);

  constructor(
    @InjectRepository(SchoolInvitation)
    schoolInvitationRepository: Repository<SchoolInvitation>,
    entityManager: EntityManager,
  ) {
    super(schoolInvitationRepository, entityManager);
  }

  async createInvitation(data: Partial<SchoolInvitation>) {
    const invitation = this.repository.create(data);
    return await this.entityManager.save(invitation);
  }
  async save(data: Partial<SchoolInvitation>) {
    return await this.entityManager.save(data);
  }

  async acceptInvitationNewUser(dto: AcceptInviteUserDto) {
    let user: User;
    return this.entityManager.transaction(async (manager) => {
      user = await manager.findOne(User, {
        where: { email: dto.email },
      });

      if (!user) {
        user = await manager.save(User, {
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: dto.email,
          password: await bcrypt.hash(dto.password, 10),
          email_verified: true,
        });
      }
      const invitation = await manager.findOne(SchoolInvitation, {
        where: { token: dto.token },
      });

      if (!invitation) {
        throw new NotFoundException('INVITATION_NOT_FOUND');
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new NotFoundException('INVITATION_ALREADY_USED');
      }

      if (invitation.expiresAt && new Date() > invitation.expiresAt) {
        invitation.status = InvitationStatus.EXPIRED;
        await manager.save(SchoolInvitation, invitation);
        throw new NotFoundException('INVITATION_EXPIRED');
      }

      const existingMember = await manager.findOne(SchoolMember, {
        where: { schoolId: invitation.schoolId, userId: user.id, user: user },
      });

      if (existingMember) {
        throw new NotFoundException('ALREADY_MEMBER');
      }

      const newMember = new SchoolMember({});
      newMember.schoolId = invitation.schoolId;
      newMember.userId = user.id;
      newMember.user = user;
      newMember.role = invitation.role;
      newMember.active = true;
      newMember.status = SchoolMemberStatus.ACTIVE;

      await manager.save(SchoolMember, newMember);

      invitation.status = InvitationStatus.ACCEPTED;
      invitation.acceptedAt = new Date();

      await manager.save(SchoolInvitation, invitation);

      return { invitation };
    });
  }
}
