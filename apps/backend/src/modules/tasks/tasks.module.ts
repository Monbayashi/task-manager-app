import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskTableModule } from '../../shared/database/dynamodb/task-table/task.module';

@Module({
  imports: [TaskTableModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
