import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TagsModule } from './modules/tags/tags.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { SummaryModule } from './modules/summary/summary.module';

@Module({
  imports: [UsersModule, TeamsModule, TagsModule, TasksModule, InvitationsModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
