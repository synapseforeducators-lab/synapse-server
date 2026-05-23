
import { SetMetadata } from '@nestjs/common';
import { SchoolRole } from 'src/schools/entities/school.entity';

export const SCHOOL_ROLES_KEY = 'school_roles';

export const SchoolRoles = (...roles: SchoolRole[]) =>
  SetMetadata(SCHOOL_ROLES_KEY, roles);