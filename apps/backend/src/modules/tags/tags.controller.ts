import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from 'src/common/guards/cognito-access.guard';
import { TagsService } from './tags.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { ResBodyTagsDeleteType, ResBodyTagsRegisterType, ResBodyTagsType, ResBodyTagsUpdateType } from '@repo/api-models/tags';
import {
  ReqBodyTagsRegisterDTO,
  ReqBodyTagsUpdateDTO,
  ReqParamTagsDeleteDTO,
  ReqParamTagsDto,
  ReqParamTagsRegisterDTO,
  ReqParamTagsUpdateDTO,
} from './tags.dto';

@Controller('teams/:teamId/tags')
@UsePipes(ZodValidationPipe)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /** タグ一覧取得 */
  @Get()
  @UseGuards(CognitoAccessGuard)
  async getTeam(@Req() req: Request, @Param() param: ReqParamTagsDto): Promise<ResBodyTagsType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.tagsService.getTags(userId, param);
  }

  /** 新規タグ作成 */
  @Post()
  @UseGuards(CognitoAccessGuard)
  async postRegister(
    @Req() req: Request,
    @Param() param: ReqParamTagsRegisterDTO,
    @Body() body: ReqBodyTagsRegisterDTO
  ): Promise<ResBodyTagsRegisterType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.tagsService.createTag(userId, param, body);
  }

  /** タグ更新 */
  @Post(':tagId')
  @UseGuards(CognitoAccessGuard)
  async postUpdate(@Req() req: Request, @Param() param: ReqParamTagsUpdateDTO, @Body() body: ReqBodyTagsUpdateDTO): Promise<ResBodyTagsUpdateType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.tagsService.updateTag(userId, param, body);
  }

  /** タグ削除 */
  @Delete(':tagId')
  @UseGuards(CognitoAccessGuard)
  async deleteTag(@Req() req: Request, @Param() param: ReqParamTagsDeleteDTO): Promise<ResBodyTagsDeleteType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.tagsService.deleteTag(userId, param);
  }
}
