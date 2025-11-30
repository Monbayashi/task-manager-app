import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { TaskCommandService } from '../../shared/database/dynamodb/task-table/task.command.service';
import {
  ReqBodyTagsRegisterDTO,
  ReqBodyTagsUpdateDTO,
  ReqParamTagsDeleteDTO,
  ReqParamTagsDto,
  ReqParamTagsRegisterDTO,
  ReqParamTagsUpdateDTO,
} from './tags.dto';
import { ResBodyTagsDeleteType, ResBodyTagsRegisterType, ResBodyTagsType, ResBodyTagsUpdateType } from '@repo/api-models/tags';
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
export class TagsService {
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

  /** チームに所属するタグ一覧 */
  async getTags(userId: string, param: ReqParamTagsDto): Promise<ResBodyTagsType> {
    const { teamId }: { teamId: string } = param;
    // ↓ teamId の実際の推論型を VSCode が表示してくれる
    await this.commonGetTeamMember(userId, teamId);
    const tags = await this.taskQueryService.getTeamTags(teamId);
    return {
      tags: tags.map((tag) => ({
        teamId: tag.PK.replace('TEAM#', ''),
        tagId: tag.SK.replace('TAG#', ''),
        tagName: tag.team_tag_name,
        tagColor: tag.team_tag_color,
        createdAt: decodeUuidV7toDate(tag.SK).toISOString(),
      })),
    };
  }

  /** タグ作成 */
  async createTag(userId: string, param: ReqParamTagsRegisterDTO, body: ReqBodyTagsRegisterDTO): Promise<ResBodyTagsRegisterType> {
    const { teamId }: { teamId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.createTag({
      teamId: teamId,
      tagName: body.tagName,
      tagColor: body.tagColor,
    });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      tagId: result.SK.replace('TAG#', ''),
      tagName: result.team_tag_name,
      tagColor: result.team_tag_color,
      createdAt: decodeUuidV7toDate(result.SK).toISOString(),
    };
  }

  /** タグ更新 */
  async updateTag(userId: string, param: ReqParamTagsUpdateDTO, body: ReqBodyTagsUpdateDTO): Promise<ResBodyTagsUpdateType> {
    const { teamId, tagId }: { teamId: string; tagId: string } = param;
    const { tagName, tagColor } = body;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.updateTag({ teamId, tagId, tagName, tagColor });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      tagId: result.SK.replace('TAG#', ''),
      tagName: result.team_tag_name,
      tagColor: result.team_tag_color,
      createdAt: decodeUuidV7toDate(result.SK).toISOString(),
    };
  }

  /** タグ削除 */
  async deleteTag(userId: string, param: ReqParamTagsDeleteDTO): Promise<ResBodyTagsDeleteType> {
    const { teamId, tagId }: { teamId: string; tagId: string } = param;
    await this.commonGetTeamMember(userId, teamId);
    const result = await this.taskCommandService.deleteTag({ teamId, tagId });
    return {
      teamId: result.PK.replace('TEAM#', ''),
      tagId: result.SK.replace('TAG#', ''),
    };
  }
}
