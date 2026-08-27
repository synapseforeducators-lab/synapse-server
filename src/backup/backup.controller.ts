import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { BackupService } from './backup.service';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @ApiQuery({
    name: 'type',
    required: true,
    isArray: true,
    enum: ['notes', 'schemes', 'curriculum', 'templates', 'team', 'billing'],
  })
  @Get('download')
  async downloadBackup(
    @CurrentUser() user: User,
    @Query('type') type: string | string[],
    @Res() res: Response,
  ) {
    const backup = await this.backupService.generateBackup(user, type);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${backup.filename}"`,
    );

    return res.send(backup.content);
  }
}
