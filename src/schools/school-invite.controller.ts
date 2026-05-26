import { Controller, Post, Body, Param, Patch } from '@nestjs/common';

import { SchoolInvitationsService } from './school-invitations.service';
import { AcceptInviteUserDto } from './dto/invite-school-member.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('School Team Invitations')
@Controller('school')
export class SchoolInviteController {
  constructor(private readonly invitationsService: SchoolInvitationsService) {}

  @Post('invitations/accept')
  async acceptInvitation(
    @Body()
    dto: AcceptInviteUserDto,
  ) {
    return await this.invitationsService.acceptInvitation(dto);
  }

  @Patch('invitations/:id/cancel')
  async cancelInvitation(@Param('id') id: string) {
    return await this.invitationsService.cancelInvitation(id);
  }
}
