import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TaskTableModule } from '../../shared/database/dynamodb/task-table/task.module';

@Module({
  imports: [TaskTableModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
