import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from 'src/common/guards/cognito-access.guard';
import { TeamsService } from './teams.service';
import { ZodValidationPipe } from 'nestjs-zod';
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

@Controller('teams')
@UsePipes(ZodValidationPipe)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /** チーム情報 */
  @Get(':teamId')
  @UseGuards(CognitoAccessGuard)
  async getTeam(@Req() req: Request, @Param() param: ReqParamTeamsTeamDto): Promise<ResBodyTeamsTeamType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.getTeamById(userId, param);
  }

  /** ユーザ更新 */
  @Put(':teamId')
  @UseGuards(CognitoAccessGuard)
  async putUpdate(@Req() req: Request, @Param() param: ReqParamTeamsUpdateDTO, @Body() body: ReqBodyTeamsUpdateDTO): Promise<ResBodyTeamsUpdateType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.updateTeam(userId, param, body);
  }

  /** チームに紐づくユーザ一覧 */
  @Get(':teamId/users')
  @UseGuards(CognitoAccessGuard)
  async getUsers(@Req() req: Request, @Param() param: ReqParamTeamsUsersDTO): Promise<ResBodyTeamsUsersType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.getTeamMember(userId, param);
  }

  /** 新規チーム作成 */
  @Post('register')
  @UseGuards(CognitoAccessGuard)
  async postRegister(@Req() req: Request, @Body() body: ReqBodyTeamsRegisterDTO): Promise<ResBodyTeamsRegisterType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.createTeam(userId, body);
  }

  @Put(':teamId/team-member/:userId')
  @UseGuards(CognitoAccessGuard)
  async updateTeamMember(
    @Req() req: Request,
    @Param() param: ReqParamTeamMemberUpdateDTO,
    @Body() body: ReqBodyTeamMemberUpdateDTO
  ): Promise<ResBodyTeamMemberUpdateType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.updateTeamMember(userId, param, body);
  }

  @Delete(':teamId/team-member/:userId')
  @UseGuards(CognitoAccessGuard)
  async deleteTeamMember(@Req() req: Request, @Param() param: ReqParamTeamMemberDeleteDTO): Promise<ResBodyTeamMemberDeleteType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.teamsService.deleteTeamMember(userId, param);
  }
}
