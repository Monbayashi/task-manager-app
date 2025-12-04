import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { TaskTableModule } from '../../shared/database/dynamodb/task-table/task.module';
import { InvitationTableModule } from '../../shared/database/dynamodb/invitation-table/invitation.module';

@Module({
  imports: [TaskTableModule, InvitationTableModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
