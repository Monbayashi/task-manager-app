// src/modules/users/users.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { TaskCommandService } from '../../shared/database/dynamodb/task-table/task.command.service';
import {
  ResBodyTeamMemberDeleteType,
  ResBodyTeamMemberUpdateType,
  ResBodyTeamsRegisterType,
  ResBodyTeamsTeamType,
  ResBodyTeamsUsersType,
} from '@repo/api-models/teams';
import {
  ReqBodyTeamMemberUpdateDTO,
  ReqBodyTeamsRegisterDTO,
  ReqParamTeamMemberDeleteDTO,
  ReqParamTeamMemberUpdateDTO,
  ReqParamTeamsTeamDto,
  ReqParamTeamsUpdateDTO,
  ReqParamTeamsUsersDTO,
} from './teams.dto';
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
export class TeamsService {
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

  /** チーム情報 */
  async getTeamById(userId: string, param: ReqParamTeamsTeamDto): Promise<ResBodyTeamsTeamType> {
    await this.commonGetTeamMember(userId, param.teamId);
    const team = await this.taskQueryService.getTeam(param.teamId);
    if (!team) throw new NotFoundException('データが存在しません');
    return {
      teamId: team.PK.replace('TEAM#', ''),
      teamName: team.team_name,
      teamDiscription: team.team_discription,
      createdAt: decodeUuidV7toDate(team.PK).toISOString(),
    };
  }

  /** チームに所属するユーザ一覧 */
  async getTeamMember(userId: string, param: ReqParamTeamsUsersDTO): Promise<ResBodyTeamsUsersType> {
    const users = await this.commonGetTeamMember(userId, param.teamId);
    return {
      users: users.map((user) => ({
        teamId: user.PK.replace('TEAM#', ''),
        userId: user.SK.replace('USER#', ''),
        userName: user.user_name,
        userTeamRole: user.user_team_role,
        joinedAt: user.user_team_joinedAt,
      })),
    };
  }

  /** チーム作成 */
  async createTeam(userId: string, body: ReqBodyTeamsRegisterDTO): Promise<ResBodyTeamsRegisterType> {
    const user = await this.taskQueryService.getUser(userId);
    if (!user) throw new NotFoundException('未登録ユーザです');
    const result = await this.taskCommandService.registerTeams({
      userId,
      userName: user.user_name,
      teamName: body.teamName,
      role: 'admin', // ユーザ固有のチームなのでadmin
    });
    return {
      teamId: result.teamId.replace('TEAM#', ''),
      teamName: result.teamName,
      teamDiscription: undefined,
      createdAt: decodeUuidV7toDate(result.teamId).toISOString(),
    };
  }

  /** チーム名更新 */
  async updateTeam(userId: string, param: ReqParamTeamsUpdateDTO, body: { teamName: string }) {
    const { teamId }: { teamId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    // チームの全メンバーを取得
    const teamMembers = await this.taskQueryService.getTeamMembers(teamId);
    // チーム名更新
    await this.taskCommandService.updateTeam(teamId, body.teamName, teamMembers);
    return { newTeamName: body.teamName };
  }

  /** チームメンバー更新 */
  async updateTeamMember(userId: string, param: ReqParamTeamMemberUpdateDTO, body: ReqBodyTeamMemberUpdateDTO): Promise<ResBodyTeamMemberUpdateType> {
    await this.commonGetTeamMember(userId, param.teamId as string);
    // チームメンバーの更新
    const result = await this.taskCommandService.updateTeamMember({ teamId: param.teamId, userId: param.userId, role: body.role });
    return {
      teamId: result.teamId,
      userId: result.userId,
    };
  }

  /** チームメンバー削除 */
  async deleteTeamMember(userId: string, param: ReqParamTeamMemberDeleteDTO): Promise<ResBodyTeamMemberDeleteType> {
    await this.commonGetTeamMember(userId, param.teamId as string);
    // チームメンバーの更新
    const result = await this.taskCommandService.deleteTeamMember({ teamId: param.teamId, userId: param.userId });
    return {
      teamId: result.teamId,
      userId: result.userId,
    };
  }
}
