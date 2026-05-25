import { SchoolRole } from 'src/schools/entities/school.entity';

export class SchemePolicy {
  static canEdit(params: {
    createdById: string;

    currentUserId: string;

    schoolRole?: SchoolRole;
  }) {
    return (
      params.createdById === params.currentUserId ||
      params.schoolRole === SchoolRole.OWNER ||
      params.schoolRole === SchoolRole.ADMIN ||
      params.schoolRole === SchoolRole.TEACHER
    );
  }

  static canPublish(params: { schoolRole?: SchoolRole }) {
    return (
      params.schoolRole === SchoolRole.OWNER ||
      params.schoolRole === SchoolRole.ADMIN ||
      params.schoolRole === SchoolRole.TEACHER
    );
  }
}
