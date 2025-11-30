import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { TaskCommandService } from '../../shared/database/dynamodb/task-table/task.command.service';
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
import { addHours } from 'date-fns';

/** UUIDv7からjstDateを作成 */
const decodeUuidV7toDate = (uuid: string): Date => {
  const pureUuid = uuid.includes('#') ? (uuid.split('#')[1] ?? '') : uuid;
  const hex = pureUuid.replace(/-/g, '');
  const timestampHex = hex.substring(0, 12);
  const millis = BigInt('0x' + timestampHex);
  const utcDate = new Date(Number(millis));
  const jstDate = addHours(utcDate, 9);
  return jstDate;
};

@Injectable()
export class TasksService {
  constructor(
    private readonly taskQueryService: TaskQueryService,
    private readonly taskCommandService: TaskCommandService
  ) {}

  /**
   * チームに所属するチームメンバー取得とチームにアクセス権限があるかチェック
   */
  private async commonGetTeamMember(userId: string, teamId: string) {
    const users = await this.taskQueryService.getTeamMembers(teamId);
    if (users.findIndex((user) => user.SK === `USER#${userId}`) === -1) {
      throw new UnauthorizedException('チームに対する権限がありません');
    }
    return users;
  }

  /** チームに所属するタスク一覧 */
  async getTasks(userId: string, param: ReqParamTasksDto, query: ReqQueryTasksDto): Promise<ResBodyTasksType> {
    const { teamId }: { teamId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const { nextToken, tasks } = await this.taskQueryService.getTasks(teamId, query);
    return {
      tasks: tasks.map((task) => ({
        teamId: task.PK.replace('TEAM#', ''),
        taskId: task.SK.replace('TASK#', ''),
        title: task.team_task_title,
        status: task.team_task_status,
        tagRefs: task.team_task_tagRef.map((val) => val.replace('TAG#', '')) || [],
        startTime: task.team_task_startTime,
        endTime: task.team_task_endTime,
        createdAt: decodeUuidV7toDate(task.SK).toISOString(),
      })),
      nextToken,
    };
  }

  /** タスク詳細取得 */
  async getTask(userId: string, param: ReqParamTasksTaskDTO): Promise<ResBodyTasksTaskType> {
    const { teamId, taskId }: { teamId: string; taskId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const task = await this.taskQueryService.getTask(teamId, taskId);
    if (!task) throw new NotFoundException('タスクが存在しません');
    return {
      teamId: task.PK.replace('TEAM#', ''),
      taskId: task.SK.replace('TASK#', ''),
      title: task.team_task_title,
      discription: task.team_task_discription,
      status: task.team_task_status,
      tagRefs: task.team_task_tagRef.map((val) => val.replace('TAG#', '')) || [],
      startTime: task.team_task_startTime,
      endTime: task.team_task_endTime,
      createdAt: decodeUuidV7toDate(task.SK).toISOString(),
    };
  }

  /** タグ作成 */
  async createTask(userId: string, param: ReqParamTasksRegisterDTO, body: ReqBodyTasksRegisterDTO): Promise<ResBodyTasksRegisterType> {
    const { teamId }: { teamId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.createTask({
      teamId: teamId,
      ...body,
    });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      taskId: result.SK.replace('TASK#', ''),
      title: result.team_task_title,
      discription: result.team_task_discription,
      status: result.team_task_status,
      startTime: result.team_task_startTime,
      endTime: result.team_task_endTime,
      tagRefs: result.team_task_tagRef.map((val) => val.replace('TAG#', '')),
      createdAt: decodeUuidV7toDate(result.SK).toISOString(),
    };
  }

  /** タグ更新 */
  async updateTask(userId: string, param: ReqParamTasksUpdateDTO, body: ReqBodyTasksUpdateDTO): Promise<ResBodyTasksUpdateType> {
    const { teamId, taskId }: { teamId: string; taskId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.updateTask({ teamId, taskId, ...body });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      taskId: result.SK.replace('TASK#', ''),
      title: result.team_task_title,
      discription: result.team_task_discription,
      status: result.team_task_status,
      startTime: result.team_task_startTime,
      endTime: result.team_task_endTime,
      tagRefs: result.team_task_tagRef.map((val) => val.replace('TAG#', '')),
      createdAt: decodeUuidV7toDate(result.SK).toISOString(),
    };
  }

  /** タグ削除 */
  async deleteTask(userId: string, param: ReqParamTasksDeleteDTO): Promise<ResBodyTasksDeleteType> {
    const { teamId, taskId }: { teamId: string; taskId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.deleteTask({ teamId, taskId });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      taskId: result.SK.replace('TASK#', ''),
    };
  }
}
