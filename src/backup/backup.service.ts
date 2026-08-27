import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BillingTransaction } from 'src/billing/entities/billing_transactions.entity';
import { SchoolSubscription } from 'src/billing/entities/school_subscriptions.entity';
import { UserSubscription } from 'src/billing/entities/user_subscriptions.entity';
import { Curriculum } from 'src/curriculum/entities/curriculum.entity';
import { Note } from 'src/notes/entities/note.entity';
import { SchemeOfWork } from 'src/schemes/entities/scheme.entity';
import {
  SchoolMember,
  SchoolMemberStatus,
} from 'src/schools/entities/school-member.entity';
import { Template } from 'src/template/entities/template.entity';
import { User } from 'src/user/entities/user.entity';
import { BackupType } from './enums/backup-type.enum';

type BackupSheet = {
  name: string;
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
};

@Injectable()
export class BackupService {
  constructor(private readonly entityManager: EntityManager) {}

  async generateBackup(user: User, type: string | string[]) {
    const normalizedTypes = this.normalizeTypes(type);

    if (!normalizedTypes.length) {
      throw new BadRequestException(
        'Invalid backup type. Use one of: notes, schemes, curriculum, templates, team, billing',
      );
    }

    const schoolMember = await this.entityManager.findOne(SchoolMember, {
      where: { userId: user.id },
    });

    const sheets = (
      await Promise.all(
        normalizedTypes.map((backupType) =>
          this.getSheets(backupType, user, schoolMember),
        ),
      )
    ).flat();
    const content = this.buildWorkbookXml(sheets);
    const filenamePrefix =
      normalizedTypes.length === 1 ? normalizedTypes[0] : 'multi';
    const filename = `${filenamePrefix}-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    return {
      filename,
      content,
    };
  }

  private normalizeTypes(type: string | string[]): BackupType[] {
    const rawTypes = Array.isArray(type) ? type : [type];
    const normalizedTypes = rawTypes
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter((value): value is BackupType =>
        Object.values(BackupType).includes(value as BackupType),
      );

    return Array.from(new Set(normalizedTypes));
  }

  private async getSheets(
    type: BackupType,
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet[]> {
    switch (type) {
      case BackupType.NOTES:
        return [await this.getNotesSheet(user, schoolMember)];
      case BackupType.SCHEMES:
        return [await this.getSchemesSheet(user, schoolMember)];
      case BackupType.CURRICULUM:
        return [await this.getCurriculumSheet(user, schoolMember)];
      case BackupType.TEMPLATES:
        return [await this.getTemplatesSheet(user, schoolMember)];
      case BackupType.TEAM:
        return [await this.getTeamSheet(user, schoolMember)];
      case BackupType.BILLING:
        return await this.getBillingSheets(user, schoolMember);
      default:
        throw new BadRequestException('Unsupported backup type');
    }
  }

  private async getNotesSheet(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet> {
    const query = this.entityManager
      .createQueryBuilder(Note, 'notes')
      .select([
        'notes.id AS id',
        'notes.schemeId AS "schemeId"',
        'notes.schemeOfWorkSectionId AS "schemeOfWorkSectionId"',
        'notes.curriculumId AS "curriculumId"',
        'notes.templateId AS "templateId"',
        'notes.createdById AS "createdById"',
        'notes.schoolId AS "schoolId"',
        'notes.contents AS contents',
        'notes.created_at AS "createdAt"',
      ])
      .where('notes.is_deleted = :isDeleted', { isDeleted: false });

    if (schoolMember?.schoolId) {
      query.andWhere('notes.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query.andWhere('notes.createdById = :userId', { userId: user.id });
    }

    const notes = await query.orderBy('notes.created_at', 'DESC').getRawMany();

    return {
      name: 'Notes',
      columns: [
        'ID',
        'Scheme ID',
        'Scheme Section ID',
        'Curriculum ID',
        'Template ID',
        'Created By ID',
        'School ID',
        'Contents',
        'Created At',
      ],
      rows: notes.map((note) => [
        note.id,
        note.schemeId,
        note.schemeOfWorkSectionId,
        note.curriculumId,
        note.templateId,
        note.createdById,
        note.schoolId,
        this.stringifyValue(note.contents),
        this.formatDate(note.createdAt),
      ]),
    };
  }

  private async getSchemesSheet(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet> {
    const query = this.entityManager
      .createQueryBuilder(SchemeOfWork, 'schemes')
      .leftJoin('schemes.subject', 'subject')
      .leftJoin('schemes.grade', 'grade')
      .leftJoin('schemes.term', 'term')
      .leftJoin('schemes.curriculum', 'curriculum')
      .leftJoin('schemes.items', 'items')
      .select([
        'schemes.id AS id',
        'subject.name AS subject',
        'grade.name AS grade',
        'term.name AS term',
        'curriculum.name AS curriculum',
        'schemes.createdById AS "createdById"',
        'schemes.schoolId AS "schoolId"',
        'COUNT(items.id) AS "itemsCount"',
        'schemes.created_at AS "createdAt"',
      ])
      .where('schemes.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('schemes.id')
      .addGroupBy('subject.name')
      .addGroupBy('grade.name')
      .addGroupBy('term.name')
      .addGroupBy('curriculum.name');

    if (schoolMember?.schoolId) {
      query.andWhere('schemes.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query.andWhere('schemes.createdById = :userId', { userId: user.id });
    }

    const schemes = await query.orderBy('schemes.created_at', 'DESC').getRawMany();

    return {
      name: 'Schemes',
      columns: [
        'ID',
        'Subject',
        'Grade',
        'Term',
        'Curriculum',
        'Items Count',
        'Created By ID',
        'School ID',
        'Created At',
      ],
      rows: schemes.map((scheme) => [
        scheme.id,
        scheme.subject,
        scheme.grade,
        scheme.term,
        scheme.curriculum,
        Number(scheme.itemsCount ?? 0),
        scheme.createdById,
        scheme.schoolId,
        this.formatDate(scheme.createdAt),
      ]),
    };
  }

  private async getCurriculumSheet(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet> {
    const query = this.entityManager
      .createQueryBuilder(Curriculum, 'curriculum')
      .leftJoin('curriculum.subject', 'subject')
      .leftJoin('curriculum.grade', 'grade')
      .leftJoin('curriculum.items', 'items')
      .select([
        'curriculum.id AS id',
        'curriculum.name AS name',
        'subject.name AS subject',
        'grade.name AS grade',
        'curriculum.createdById AS "createdById"',
        'curriculum.schoolId AS "schoolId"',
        'COUNT(items.id) AS "itemsCount"',
        'curriculum.created_at AS "createdAt"',
      ])
      .where('curriculum.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('curriculum.id')
      .addGroupBy('subject.name')
      .addGroupBy('grade.name');

    if (schoolMember?.schoolId) {
      query.andWhere('curriculum.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query.andWhere('curriculum.createdById = :userId', { userId: user.id });
    }

    const curriculums = await query
      .orderBy('curriculum.created_at', 'DESC')
      .getRawMany();

    return {
      name: 'Curriculum',
      columns: [
        'ID',
        'Name',
        'Subject',
        'Grade',
        'Items Count',
        'Created By ID',
        'School ID',
        'Created At',
      ],
      rows: curriculums.map((curriculum) => [
        curriculum.id,
        curriculum.name,
        curriculum.subject,
        curriculum.grade,
        Number(curriculum.itemsCount ?? 0),
        curriculum.createdById,
        curriculum.schoolId,
        this.formatDate(curriculum.createdAt),
      ]),
    };
  }

  private async getTemplatesSheet(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet> {
    const query = this.entityManager
      .createQueryBuilder(Template, 'templates')
      .leftJoin('templates.sections', 'sections')
      .select([
        'templates.id AS id',
        'templates.name AS name',
        'templates.school_name AS "schoolName"',
        'templates.createdById AS "createdById"',
        'templates.schoolId AS "schoolId"',
        'COUNT(sections.id) AS "sectionsCount"',
        'templates.created_at AS "createdAt"',
      ])
      .where('templates.is_deleted = :isDeleted', { isDeleted: false })
      .groupBy('templates.id')
      .addGroupBy('templates.name')
      .addGroupBy('templates.school_name')
      .addGroupBy('templates.createdById')
      .addGroupBy('templates.schoolId')
      .addGroupBy('templates.created_at');

    if (schoolMember?.schoolId) {
      query.andWhere('templates.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      query.andWhere('templates.createdById = :userId', { userId: user.id });
    }

    const templates = await query
      .orderBy('templates.created_at', 'DESC')
      .getRawMany();

    return {
      name: 'Templates',
      columns: [
        'ID',
        'Name',
        'School Name',
        'Sections Count',
        'Created By ID',
        'School ID',
        'Created At',
      ],
      rows: templates.map((template) => [
        template.id,
        template.name,
        template.schoolName,
        Number(template.sectionsCount ?? 0),
        template.createdById,
        template.schoolId,
        this.formatDate(template.createdAt),
      ]),
    };
  }

  private async getTeamSheet(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet> {
    if (!schoolMember?.schoolId) {
      return {
        name: 'Team',
        columns: [
          'Member ID',
          'User ID',
          'First Name',
          'Last Name',
          'Email',
          'Phone Number',
          'Role',
          'Status',
          'Joined At',
        ],
        rows: [],
      };
    }

    const members = await this.entityManager
      .createQueryBuilder(SchoolMember, 'member')
      .leftJoin('member.user', 'user')
      .select([
        'member.id AS id',
        'member.userId AS "userId"',
        'user.first_name AS "firstName"',
        'user.last_name AS "lastName"',
        'user.email AS email',
        'user.phone_number AS "phoneNumber"',
        'member.role AS role',
        'member.status AS status',
        'member.created_at AS "createdAt"',
      ])
      .where('member.schoolId = :schoolId', { schoolId: schoolMember.schoolId })
      .andWhere('member.status != :deletedStatus', {
        deletedStatus: SchoolMemberStatus.DELETED,
      })
      .orderBy('member.created_at', 'DESC')
      .getRawMany();

    return {
      name: 'Team',
      columns: [
        'Member ID',
        'User ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone Number',
        'Role',
        'Status',
        'Joined At',
      ],
      rows: members.map((member) => [
        member.id,
        member.userId,
        member.firstName,
        member.lastName,
        member.email,
        member.phoneNumber,
        member.role,
        member.status,
        this.formatDate(member.createdAt),
      ]),
    };
  }

  private async getBillingSheets(
    user: User,
    schoolMember: SchoolMember | null,
  ): Promise<BackupSheet[]> {
    const transactionsQuery = this.entityManager
      .createQueryBuilder(BillingTransaction, 'transactions')
      .select([
        'transactions.id AS id',
        'transactions.reference AS reference',
        'transactions.amount AS amount',
        'transactions.currency AS currency',
        'transactions.email AS email',
        'transactions.plan AS plan',
        'transactions.status AS status',
        'transactions.channel AS channel',
        'transactions.paidAt AS "paidAt"',
        'transactions.gatewayResponse AS "gatewayResponse"',
        'transactions.userId AS "userId"',
        'transactions.schoolId AS "schoolId"',
        'transactions.created_at AS "createdAt"',
      ]);

    if (schoolMember?.schoolId) {
      transactionsQuery.where('transactions.schoolId = :schoolId', {
        schoolId: schoolMember.schoolId,
      });
    } else {
      transactionsQuery.where('transactions.userId = :userId', {
        userId: user.id,
      });
    }

    const transactions = await transactionsQuery
      .orderBy('transactions.created_at', 'DESC')
      .getRawMany();

    const transactionSheet: BackupSheet = {
      name: 'Billing Transactions',
      columns: [
        'ID',
        'Reference',
        'Amount',
        'Currency',
        'Email',
        'Plan',
        'Status',
        'Channel',
        'Paid At',
        'Gateway Response',
        'User ID',
        'School ID',
        'Created At',
      ],
      rows: transactions.map((transaction) => [
        transaction.id,
        transaction.reference,
        transaction.amount,
        transaction.currency,
        transaction.email,
        transaction.plan,
        transaction.status,
        transaction.channel,
        this.formatDate(transaction.paidAt),
        transaction.gatewayResponse,
        transaction.userId,
        transaction.schoolId,
        this.formatDate(transaction.createdAt),
      ]),
    };

    if (schoolMember?.schoolId) {
      const schoolSubscriptions = await this.entityManager.find(
        SchoolSubscription,
        {
          where: { schoolId: schoolMember.schoolId },
          order: { created_at: 'DESC' },
        },
      );

      return [
        transactionSheet,
        {
          name: 'School Subscriptions',
          columns: [
            'ID',
            'School ID',
            'Plan',
            'Status',
            'Seats',
            'Used Seats',
            'Current Period Start',
            'Current Period End',
            'Created At',
          ],
          rows: schoolSubscriptions.map((subscription) => [
            subscription.id,
            subscription.schoolId,
            subscription.plan,
            subscription.status,
            subscription.seats,
            subscription.usedSeats,
            this.formatDate(subscription.currentPeriodStart),
            this.formatDate(subscription.currentPeriodEnd),
            this.formatDate(subscription.created_at),
          ]),
        },
      ];
    }

    const userSubscriptions = await this.entityManager.find(UserSubscription, {
      where: { userId: user.id },
      order: { created_at: 'DESC' },
    });

    return [
      transactionSheet,
      {
        name: 'User Subscriptions',
        columns: [
          'ID',
          'User ID',
          'Plan',
          'Status',
          'Cancel At Period End',
          'Current Period Start',
          'Current Period End',
          'Trial Ends At',
          'Cancelled At',
          'Created At',
        ],
        rows: userSubscriptions.map((subscription) => [
          subscription.id,
          subscription.userId,
          subscription.plan,
          subscription.status,
          subscription.cancelAtPeriodEnd,
          this.formatDate(subscription.currentPeriodStart),
          this.formatDate(subscription.currentPeriodEnd),
          this.formatDate(subscription.trialEndsAt),
          this.formatDate(subscription.cancelledAt),
          this.formatDate(subscription.created_at),
        ]),
      },
    ];
  }

  private buildWorkbookXml(sheets: BackupSheet[]) {
    const worksheetXml = sheets
      .map((sheet) => this.buildWorksheetXml(sheet))
      .join('');

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
    </Style>
  </Styles>
  ${worksheetXml}
</Workbook>`;
  }

  private buildWorksheetXml(sheet: BackupSheet) {
    const headerRow = `<Row>${sheet.columns
      .map(
        (column) =>
          `<Cell ss:StyleID="Header"><Data ss:Type="String">${this.escapeXml(
            column,
          )}</Data></Cell>`,
      )
      .join('')}</Row>`;

    const dataRows = sheet.rows
      .map(
        (row) =>
          `<Row>${row
            .map((value) => this.buildCellXml(value))
            .join('')}</Row>`,
      )
      .join('');

    return `<Worksheet ss:Name="${this.escapeXml(
      sheet.name.slice(0, 31),
    )}"><Table>${headerRow}${dataRows}</Table></Worksheet>`;
  }

  private buildCellXml(value: string | number | boolean | null) {
    if (value === null || value === undefined) {
      return '<Cell><Data ss:Type="String"></Data></Cell>';
    }

    if (typeof value === 'number') {
      return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
    }

    if (typeof value === 'boolean') {
      return `<Cell><Data ss:Type="String">${value}</Data></Cell>`;
    }

    return `<Cell><Data ss:Type="String">${this.escapeXml(
      String(value),
    )}</Data></Cell>`;
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatDate(value?: Date | string | null) {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString();
  }

  private stringifyValue(value: unknown) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  }
}
