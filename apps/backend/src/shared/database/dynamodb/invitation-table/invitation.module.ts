import { Module } from '@nestjs/common';
import { InvitationQueryService } from './invitation.query.service';
import { InvitationCommandService } from './invitation.command.service';
import { DynamoClientService } from '../dynamo-client.service';

@Module({
  providers: [InvitationQueryService, InvitationCommandService, DynamoClientService],
  exports: [InvitationQueryService, InvitationCommandService],
})
export class InvitationTableModule {}
