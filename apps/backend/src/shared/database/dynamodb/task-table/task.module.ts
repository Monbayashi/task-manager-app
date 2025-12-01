import { Module } from '@nestjs/common';
import { TaskQueryService } from './task.query.service';
import { TaskCommandService } from './task.command.service';
import { DynamoClientService } from '../dynamo-client.service';

@Module({
  providers: [TaskQueryService, TaskCommandService, DynamoClientService],
  exports: [TaskQueryService, TaskCommandService],
})
export class TaskTableModule {}
