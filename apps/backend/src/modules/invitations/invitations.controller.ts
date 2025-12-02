import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from 'src/common/guards/cognito-access.guard';
import { InvitationsService } from './invitations.service';
import {
  ReqParamInvitationsDto,
  ReqParamInvitationsRegisterDTO,
  ReqBodyInvitationsRegisterDTO,
  ReqParamInvitationsItemDTO,
  ReqParamInvitationsDeleteDTO,
  ReqParamInvitationsToTeamUserDTO,
  ReqBodyInvitationsToTeamUserDTO,
} from './invitations.dto';
import {
  ResBodyInvitationsDeleteType,
  ResBodyInvitationsItemType,
  ResBodyInvitationsRegisterType,
  ResBodyInvitationsToTeamUserType,
  ResBodyInvitationsType,
} from '@repo/api-models/invitations';
import { PrettyZodValidationPipe } from 'src/common/pipe/pretty-zod-validation.pipe';

@Controller('api/teams/:teamId/invitation')
@UsePipes(PrettyZodValidationPipe)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /** チーム招待一覧 */
  @Get()
  @UseGuards(CognitoAccessGuard)
  async getInvitations(@Req() req: Request, @Param() param: ReqParamInvitationsDto): Promise<ResBodyInvitationsType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.invitationsService.getInvitations(userId, param);
  }

  /** チーム招待詳細 */
  @Get(':inviteId')
  @UseGuards(CognitoAccessGuard)
  async getInvitationsItem(@Req() req: Request, @Param() param: ReqParamInvitationsItemDTO): Promise<ResBodyInvitationsItemType> {
    return await this.invitationsService.getInvitationsItem(param);
  }

  /** 新規チーム招待作成 */
  @Post()
  @UseGuards(CognitoAccessGuard)
  async postRegister(
    @Req() req: Request,
    @Param() param: ReqParamInvitationsRegisterDTO,
    @Body() body: ReqBodyInvitationsRegisterDTO
  ): Promise<ResBodyInvitationsRegisterType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.invitationsService.createInvitationsItem(userId, param, body);
  }

  /** チーム招待削除 */
  @Delete(':inviteId')
  @UseGuards(CognitoAccessGuard)
  async deleteDelete(@Req() req: Request, @Param() param: ReqParamInvitationsDeleteDTO): Promise<ResBodyInvitationsDeleteType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.invitationsService.deleteInvitationsItem(userId, param);
  }

  /** チーム招待からチームメンバーに追加 */
  @Post(':inviteId')
  @UseGuards(CognitoAccessGuard)
  async postInvitationsToTeamUser(
    @Req() req: Request,
    @Param() param: ReqParamInvitationsToTeamUserDTO,
    @Body() body: ReqBodyInvitationsToTeamUserDTO
  ): Promise<ResBodyInvitationsToTeamUserType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.invitationsService.createTeamUserFromInvitations(userId, param, body);
  }
}
