import { Module } from '@nestjs/common';
import { TaskQueryService } from './task.query.service';
import { TaskCommandService } from './task.command.service';

@Module({
  providers: [TaskQueryService, TaskCommandService],
  exports: [TaskQueryService, TaskCommandService],
})
export class TaskTableModule {}
