import { InjectRepository } from '@nestjs/typeorm';
import { AbstractRepository } from '../../common';
import { EntityManager, Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SchoolInvitation } from '../entities/school-invitation.entity';
import { InvitationStatus } from '../entities/school-invitation.entity';
import { SchoolMember } from '../entities/school-member.entity';

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

  async acceptInvitationTx(userId: string, token: string) {
    return this.entityManager.transaction(async (manager) => {
      const invitation = await manager.findOne(SchoolInvitation, {
        where: { token },
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
        where: { schoolId: invitation.schoolId, userId },
      });

      if (existingMember) {
        throw new NotFoundException('ALREADY_MEMBER');
      }

      const newMember = new SchoolMember({});
      newMember.schoolId = invitation.schoolId;
      newMember.userId = userId;
      newMember.role = invitation.role;
      newMember.active = true;

      await manager.save(SchoolMember, newMember);

      invitation.status = InvitationStatus.ACCEPTED;
      invitation.acceptedAt = new Date();

      await manager.save(SchoolInvitation, invitation);

      return { invitation };
    });
  }
}
