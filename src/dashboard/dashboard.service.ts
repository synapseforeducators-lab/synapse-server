import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Curriculum } from 'src/curriculum/entities/curriculum.entity';
import { Note } from 'src/notes/entities/note.entity';
import { SchemeOfWork } from 'src/schemes/entities/scheme.entity';
import { SchoolMember } from 'src/schools/entities/school-member.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly entityManager: EntityManager) {}

  async getOverview(user: User) {
    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      select: { schoolId: true },
      where: { userId: user.id },
    });

    const scope = schoolMember?.schoolId
      ? { schoolId: schoolMember.schoolId, is_deleted: false }
      : { createdById: user.id, is_deleted: false };

    const [totalSchemesOfWork, totalCurriculum, totalNotesCreated] =
      await Promise.all([
        this.entityManager.count(SchemeOfWork, { where: scope }),
        this.entityManager.count(Curriculum, { where: scope }),
        this.entityManager.count(Note, { where: scope }),
      ]);

    return {
      totalSchemesOfWork: totalSchemesOfWork ?? 0,
      totalCurriculum: totalCurriculum ?? 0,
      totalNotesCreated: totalNotesCreated ?? 0,
    };
  }
}
