import { z } from 'zod';
import { commonTeamName, commonTeamId, commonTagId, commonTagBackendColor, commonTagColor } from '../common/schema.ts';

/**
 * [Requset-Param-Schema] タグ一覧を取得
 */
export const ReqParamTagsSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Param-Schema] タグ作成
 */
export const ReqParamTagsRegisterSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Body-Schema] タグ作成
 */
export const ReqBodyTagsRegisterSchema = z.object({
  tagName: commonTeamName,
  tagColor: z.object({
    color: commonTagColor,
    backgroundColor: commonTagBackendColor,
  }),
});

/**
 * [Requset-Param-Schema] タグ更新
 */
export const ReqParamTagsUpdateSchema = z.object({ teamId: commonTeamId, tagId: commonTagId });

/**
 * [Request-Body-Schema] タグ更新
 */
export const ReqBodyTagsUpdateSchema = z.object({
  tagName: commonTeamName,
  tagColor: z.object({
    color: commonTagColor,
    backgroundColor: commonTagBackendColor,
  }),
});

/**
 * [Requset-Param-Schema] タグ削除
 */
export const ReqParamTagsDeleteSchema = z.object({ teamId: commonTeamId, tagId: commonTagId });
