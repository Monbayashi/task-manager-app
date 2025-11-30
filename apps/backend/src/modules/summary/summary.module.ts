import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { TaskTableModule } from '../../shared/database/dynamodb/task-table/task.module';

@Module({
  imports: [TaskTableModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
