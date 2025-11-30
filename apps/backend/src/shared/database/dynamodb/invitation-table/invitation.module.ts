import { Module } from '@nestjs/common';
import { InvitationQueryService } from './invitation.query.service';
import { InvitationCommandService } from './invitation.command.service';

@Module({
  providers: [InvitationQueryService, InvitationCommandService],
  exports: [InvitationQueryService, InvitationCommandService],
})
export class InvitationTableModule {}
