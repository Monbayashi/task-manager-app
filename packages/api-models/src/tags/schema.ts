import { z } from 'zod';
import { commonTeamName, commonTeamId } from '../common/index.ts';

export const tagName = z
  .string({ error: (issue) => (issue.input === undefined ? 'タグ名は必須項目です' : 'タグ名は文字列で入力してください') })
  .min(1, 'タグー名は1文字以上です')
  .max(8, 'タグ名は8文字までです');
export const tagColor = z.object({
  color: z.string(),
  backgroundColor: z.string(),
});
const tagId = z.uuidv7('タグIDは有効なID形式で入力してください');

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
  tagColor: tagColor,
});

/**
 * [Requset-Param-Schema] タグ更新
 */
export const ReqParamTagsUpdateSchema = z.object({ teamId: commonTeamId, tagId: tagId });

/**
 * [Request-Body-Schema] タグ更新
 */
export const ReqBodyTagsUpdateSchema = z.object({
  tagName: commonTeamName,
  tagColor: tagColor,
});

/**
 * [Requset-Param-Schema] タグ削除
 */
export const ReqParamTagsDeleteSchema = z.object({ teamId: commonTeamId, tagId: tagId });
