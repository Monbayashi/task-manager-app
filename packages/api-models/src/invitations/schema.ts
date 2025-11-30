import { z } from 'zod';
import { commonTeamId, commonEmail, commonRole, commonTeamName } from '../common/index.ts';

const inviteId = z.uuidv7('招待IDは有効なID形式で入力してください');

/**
 * [Requset-Param-Schema] チーム招待一覧を取得
 */
export const ReqParamInvitationsSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Param-Schema] チーム招待作成
 */
export const ReqParamInvitationsRegisterSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Body-Schema] チーム招待作成
 */
export const ReqBodyInvitationsRegisterSchema = z.object({
  email: commonEmail,
  role: commonRole,
  teamName: commonTeamName,
});

/**
 * [Requset-Param-Schema] チーム招待詳細を取得
 */
export const ReqParamInvitationsItemSchema = z.object({ teamId: commonTeamId, inviteId: inviteId });

/**
 * [Requset-Param-Schema] チーム招待を削除
 */
export const ReqParamInvitationsDeleteSchema = z.object({ teamId: commonTeamId, inviteId: inviteId });

/**
 * [Requset-Param-Schema] チーム招待からチームに追加
 */
export const ReqParamInvitationsToTeamUserSchema = z.object({ teamId: commonTeamId, inviteId: inviteId });

/**
 * [Requset-Body-Schema] チーム招待からチームに追加
 */
export const ReqBodyInvitationsToTeamUserSchema = z.object({
  token: z
    .string({ error: (issue) => (issue.input === undefined ? 'トークンは必須項目です' : 'トークンは文字列で入力してください') })
    .length(64, 'トークンは64文字で指定してください。'),
});
