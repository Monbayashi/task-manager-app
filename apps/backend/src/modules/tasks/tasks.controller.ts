import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from '../../common/guards/cognito-access.guard';
import { TasksService } from './tasks.service';
import {
  ResBodyTasksDeleteType,
  ResBodyTasksRegisterType,
  ResBodyTasksTaskType,
  ResBodyTasksType,
  ResBodyTasksUpdateType,
} from '@repo/api-models/tasks';
import {
  ReqBodyTasksRegisterDTO,
  ReqBodyTasksUpdateDTO,
  ReqParamTasksDeleteDTO,
  ReqParamTasksDto,
  ReqParamTasksRegisterDTO,
  ReqParamTasksTaskDTO,
  ReqParamTasksUpdateDTO,
  ReqQueryTasksDto,
} from './tasks.dto';
import { PrettyZodValidationPipe } from '../../common/pipe/pretty-zod-validation.pipe';

@Controller('api/teams/:teamId/tasks')
@UsePipes(PrettyZodValidationPipe)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /** タスク一覧取得 */
  @Get()
  @UseGuards(CognitoAccessGuard)
  async getTasks(@Req() req: Request, @Param() param: ReqParamTasksDto, @Query() query: ReqQueryTasksDto): Promise<ResBodyTasksType> {
    const userId = req.user!.sub;
    return await this.tasksService.getTasks(userId, param, query);
  }

  /** タスク詳細 */
  @Get(':taskId')
  @UseGuards(CognitoAccessGuard)
  async getTask(@Req() req: Request, @Param() param: ReqParamTasksTaskDTO): Promise<ResBodyTasksTaskType> {
    const userId = req.user!.sub;
    return await this.tasksService.getTask(userId, param);
  }

  /** 新規タスク作成 */
  @Post()
  @UseGuards(CognitoAccessGuard)
  async postRegister(
    @Req() req: Request,
    @Param() param: ReqParamTasksRegisterDTO,
    @Body() body: ReqBodyTasksRegisterDTO
  ): Promise<ResBodyTasksRegisterType> {
    const userId = req.user!.sub;
    return await this.tasksService.createTask(userId, param, body);
  }

  /** タスク更新 */
  @Put(':taskId')
  @UseGuards(CognitoAccessGuard)
  async postUpdate(
    @Req() req: Request,
    @Param() param: ReqParamTasksUpdateDTO,
    @Body() body: ReqBodyTasksUpdateDTO
  ): Promise<ResBodyTasksUpdateType> {
    const userId = req.user!.sub;
    return await this.tasksService.updateTask(userId, param, body);
  }

  /** タスク削除 */
  @Delete(':taskId')
  @UseGuards(CognitoAccessGuard)
  async deleteTag(@Req() req: Request, @Param() param: ReqParamTasksDeleteDTO): Promise<ResBodyTasksDeleteType> {
    const userId = req.user!.sub;
    return await this.tasksService.deleteTask(userId, param);
  }
}
