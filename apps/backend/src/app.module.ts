import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TagsModule } from './modules/tags/tags.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { SummaryModule } from './modules/summary/summary.module';
import { TypedConfigModule } from './common/config/typed-config.module';
import { PinoLoggerModule } from './common/logger/pino-logger.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 環境変数処理
    TypedConfigModule,
    // ロガー
    PinoLoggerModule,
    /// modules
    HealthModule,
    UsersModule,
    TeamsModule,
    TagsModule,
    TasksModule,
    InvitationsModule,
    SummaryModule,
  ],
})
export class AppModule {}
