import { ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { TaskCommandService } from '../../shared/database/dynamodb/task-table/task.command.service';
import {
  ResBodyInvitationsDeleteType,
  ResBodyInvitationsItemType,
  ResBodyInvitationsRegisterType,
  ResBodyInvitationsToTeamUserType,
  ResBodyInvitationsType,
} from '@repo/api-models/invitations';
import {
  ReqBodyInvitationsRegisterDTO,
  ReqBodyInvitationsToTeamUserDTO,
  ReqParamInvitationsDeleteDTO,
  ReqParamInvitationsDto,
  ReqParamInvitationsItemDTO,
  ReqParamInvitationsRegisterDTO,
  ReqParamInvitationsToTeamUserDTO,
} from './invitations.dto';
import { InvitationQueryService } from '../../shared/database/dynamodb/invitation-table/invitation.query.service';
import { InvitationCommandService } from '../../shared/database/dynamodb/invitation-table/invitation.command.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly taskQueryService: TaskQueryService,
    private readonly taskCommandService: TaskCommandService,
    private readonly invitationQueryService: InvitationQueryService,
    private readonly invitationCommandService: InvitationCommandService
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

  /** チームに所属する招待一覧 */
  async getInvitations(userId: string, param: ReqParamInvitationsDto): Promise<ResBodyInvitationsType> {
    const { teamId }: { teamId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const invitations = await this.invitationQueryService.getInvitationsByTeam(teamId);
    return {
      invitations: invitations.map((invitation) => ({
        teamId: invitation.PK.replace('TEAM#', ''),
        inviteId: invitation.SK.replace('INVITE#', ''),
        email: invitation.email,
        role: invitation.user_role,
        invitedBy: invitation.invitedBy.replace('USER#', ''),
        createdAt: new Date(invitation.createdAt * 1000).toISOString(),
        expiresAt: new Date(invitation.expiresAt * 1000).toISOString(),
        team_name: invitation.team_name,
      })),
    };
  }

  /** チーム招待詳細取得 */
  async getInvitationsItem(param: ReqParamInvitationsItemDTO): Promise<ResBodyInvitationsItemType> {
    const { teamId, inviteId }: { teamId: string; inviteId: string } = param;
    const invitation = await this.invitationQueryService.getInvitation(teamId, inviteId);
    if (!invitation) throw new NotFoundException('チーム招待が存在しません');
    return {
      teamId: invitation.PK.replace('TEAM#', ''),
      inviteId: invitation.SK.replace('INVITE#', ''),
      email: invitation.email,
      role: invitation.user_role,
      invitedBy: invitation.invitedBy.replace('USER#', ''),
      createdAt: new Date(invitation.createdAt * 1000).toISOString(),
      expiresAt: new Date(invitation.expiresAt * 1000).toISOString(),
      team_name: invitation.team_name,
    };
  }

  /** チーム招待作成 */
  async createInvitationsItem(
    userId: string,
    param: ReqParamInvitationsRegisterDTO,
    body: ReqBodyInvitationsRegisterDTO
  ): Promise<ResBodyInvitationsRegisterType> {
    const { teamId }: { teamId: string } = param;
    const teamMember = await this.commonGetTeamMember(userId, param.teamId as string);
    const userRole = teamMember.find((val) => val.SK === `USER#${userId}`)?.user_team_role;
    if (userRole !== 'admin' && body.role === 'admin') {
      throw new UnauthorizedException('メンバー権限では、管理者を招待することはできません');
    }
    const invitation = await this.invitationCommandService.createInvitation({
      teamId: teamId,
      email: body.email,
      role: body.role,
      invitedBy: userId,
      teamName: body.teamName,
      ttlDays: 7,
    });
    return {
      teamId: invitation.PK.replace('TEAM#', ''),
      inviteId: invitation.SK.replace('INVITE#', ''),
      email: invitation.email,
      role: invitation.user_role,
      invitedBy: invitation.invitedBy.replace('USER#', ''),
      createdAt: new Date(invitation.createdAt * 1000).toISOString(),
      expiresAt: new Date(invitation.expiresAt * 1000).toISOString(),
      team_name: invitation.team_name,
    };
  }

  /** チーム招待削除 */
  async deleteInvitationsItem(userId: string, param: ReqParamInvitationsDeleteDTO): Promise<ResBodyInvitationsDeleteType> {
    const { teamId, inviteId }: { teamId: string; inviteId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.invitationCommandService.deleteInvitation({ teamId, inviteId });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      inviteId: result.SK.replace('INVITE#', ''),
    };
  }

  /** チーム招待からチームメンバーに追加 */
  async createTeamUserFromInvitations(
    userId: string,
    param: ReqParamInvitationsToTeamUserDTO,
    body: ReqBodyInvitationsToTeamUserDTO
  ): Promise<ResBodyInvitationsToTeamUserType> {
    const { teamId, inviteId }: { teamId: string; inviteId: string } = param;
    const { token } = body;
    const now = Math.floor(Date.now() / 1000);
    // 招待チェック
    const invitationsItem = await this.invitationQueryService.getInvitationToken(teamId, inviteId);
    if (!invitationsItem) throw new NotFoundException('この招待は無効です');
    if (invitationsItem.token !== token) throw new ForbiddenException('招待トークンが無効です');
    if (invitationsItem.expiresAt < now) throw new GoneException('この招待は期限切れです');
    // ユーザチェック
    const user = await this.taskQueryService.getUserWithTeams(userId);
    if (!user || !user.user) throw new NotFoundException('ユーザが存在しません');
    if (user.teams.find((team) => team.SK.replace('TEAM#', '') === teamId)) throw new ConflictException('すでにこのチームに参加しています');
    if (user.user.user_email !== invitationsItem.email) throw new ForbiddenException('招待されたユーザと一致しません');
    // チームチェック
    const team = await this.taskQueryService.getTeam(teamId);
    if (!team) throw new NotFoundException('チームが存在しません');

    const result = await this.taskCommandService.registerTeamUserFromInvitation({
      userId: userId,
      teamId: teamId,
      inviteId: inviteId,
      userName: user.user.user_name,
      teamName: team.team_name,
      role: invitationsItem.user_role,
    });
    return {
      teamId: result.teamId,
      userId: result.userId,
      inviteId: result.inviteId,
    };
  }
}
