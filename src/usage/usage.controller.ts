import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { UsageService } from './usage.service';
import { CurrentUser } from 'src/common/decorators';
import { User } from 'src/user/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UsageType } from './enums/usage-type.enum';

@ApiTags('Usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get(':type')
  async getUsage(@CurrentUser() user: User, @Param('type') type: UsageType) {
    return this.usageService.canUse(user.id, type);
  }
}
