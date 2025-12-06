import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from '../../common/guards/cognito-access.guard';
import { TeamsService } from './teams.service';
import {
  ReqBodyTeamMemberUpdateDTO,
  ReqBodyTeamsRegisterDTO,
  ReqBodyTeamsUpdateDTO,
  ReqParamTeamMemberDeleteDTO,
  ReqParamTeamMemberUpdateDTO,
  ReqParamTeamsTeamDto,
  ReqParamTeamsUpdateDTO,
  ReqParamTeamsUsersDTO,
} from './teams.dto';
import {
  ResBodyTeamsTeamType,
  ResBodyTeamsUsersType,
  ResBodyTeamsRegisterType,
  ResBodyTeamsUpdateType,
  ResBodyTeamMemberUpdateType,
  ResBodyTeamMemberDeleteType,
} from '@repo/api-models/teams';
import { PrettyZodValidationPipe } from '../../common/pipe/pretty-zod-validation.pipe';

@Controller('api/teams')
@UsePipes(PrettyZodValidationPipe)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /** チーム情報 */
  @Get(':teamId')
  @UseGuards(CognitoAccessGuard)
  async getTeam(@Req() req: Request, @Param() param: ReqParamTeamsTeamDto): Promise<ResBodyTeamsTeamType> {
    const userId = req.user!.sub;
    return await this.teamsService.getTeamById(userId, param);
  }

  /** ユーザ更新 */
  @Put(':teamId')
  @UseGuards(CognitoAccessGuard)
  async putUpdate(@Req() req: Request, @Param() param: ReqParamTeamsUpdateDTO, @Body() body: ReqBodyTeamsUpdateDTO): Promise<ResBodyTeamsUpdateType> {
    const userId = req.user!.sub;
    return await this.teamsService.updateTeam(userId, param, body);
  }

  /** 新規チーム作成 */
  @Post('register')
  @UseGuards(CognitoAccessGuard)
  async postRegister(@Req() req: Request, @Body() body: ReqBodyTeamsRegisterDTO): Promise<ResBodyTeamsRegisterType> {
    const userId = req.user!.sub;
    return await this.teamsService.createTeam(userId, body);
  }

  /** チームメンバー一覧 */
  @Get(':teamId/team-member')
  @UseGuards(CognitoAccessGuard)
  async getTeamMember(@Req() req: Request, @Param() param: ReqParamTeamsUsersDTO): Promise<ResBodyTeamsUsersType> {
    const userId = req.user!.sub;
    return await this.teamsService.getTeamMember(userId, param);
  }

  /** チームメンバーの更新 */
  @Put(':teamId/team-member/:userId')
  @UseGuards(CognitoAccessGuard)
  async updateTeamMember(
    @Req() req: Request,
    @Param() param: ReqParamTeamMemberUpdateDTO,
    @Body() body: ReqBodyTeamMemberUpdateDTO
  ): Promise<ResBodyTeamMemberUpdateType> {
    const userId = req.user!.sub;
    return await this.teamsService.updateTeamMember(userId, param, body);
  }

  /** チームメンバーの削除 */
  @Delete(':teamId/team-member/:userId')
  @UseGuards(CognitoAccessGuard)
  async deleteTeamMember(@Req() req: Request, @Param() param: ReqParamTeamMemberDeleteDTO): Promise<ResBodyTeamMemberDeleteType> {
    const userId = req.user!.sub;
    return await this.teamsService.deleteTeamMember(userId, param);
  }
}
