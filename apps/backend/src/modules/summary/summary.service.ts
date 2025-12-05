import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { ResQuerySummaryCountsType } from '@repo/api-models/summary';
import { ReqQuerySummaryCountsDto } from './summary.dto';

@Injectable()
export class SummaryService {
  constructor(private readonly taskQueryService: TaskQueryService) {}

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
  async getCounts(userId: string, query: ReqQuerySummaryCountsDto): Promise<ResQuerySummaryCountsType> {
    const { teamId }: { teamId: string } = query;
    await this.commonGetTeamMember(userId, query.teamId);
    const counters = await this.taskQueryService.getTeamCounters(teamId);
    // データなし
    if (!counters) {
      return {
        all: { todo: 0, doing: 0, done: 0 },
        daily: [],
      };
    }
    const all = counters.find((cnt) => cnt.SK === 'COUNTER#ALL');
    const dailys = counters.filter((cnt) => cnt.SK !== 'COUNTER#ALL');
    return {
      all: { todo: all?.todo ?? 0, doing: all?.doing ?? 0, done: all?.done ?? 0 },
      daily: dailys.map((day) => ({
        date: day.SK.replace('COUNTER#', ''),
        todo: day.todo ?? 0,
        doing: day.doing ?? 0,
        done: day.done ?? 0,
      })),
    };
  }
}
