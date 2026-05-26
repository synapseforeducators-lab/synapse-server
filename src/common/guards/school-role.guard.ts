import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SCHOOL_ROLES_KEY } from '../decorators/school-roles.decorator';
import { SchoolMember } from 'src/schools/entities/school-member.entity';

@Injectable()
export class SchoolRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @InjectRepository(SchoolMember)
    private readonly schoolMemberRepository: Repository<SchoolMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride(SCHOOL_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const schoolId =
      request.params.schoolId ||
      request.body.schoolId ||
      request.query.schoolId;

    if (!schoolId) {
      throw new ForbiddenException('School ID required');
    }

    if (!this.isUuid(schoolId)) {
      throw new BadRequestException('Invalid schoolId');
    }

    const membership = await this.schoolMemberRepository.findOne({
      where: {
        schoolId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this school');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient school permissions');
    }

    request.schoolMembership = membership;

    return true;
  }

  private isUuid(value?: string): boolean {
    return (
      typeof value === 'string' &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        value,
      )
    );
  }
}
