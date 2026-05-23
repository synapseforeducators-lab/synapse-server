import {
  Controller,
  Get,
  Param,
  Req,
} from '@nestjs/common';

import { UsageService } from './usage.service';

@Controller('usage')
export class UsageController {
  constructor(
    private readonly usageService: UsageService,
  ) {}

  @Get(':type')
  async getUsage(
    @Req() req,
    @Param('type') type: any,
  ) {
    return this.usageService.canUse(
      req.user.id,
      type,
    );
  }
}