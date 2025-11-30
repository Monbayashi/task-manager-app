import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TaskTableModule } from '../../shared/database/dynamodb/task-table/task.module';

@Module({
  imports: [TaskTableModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
