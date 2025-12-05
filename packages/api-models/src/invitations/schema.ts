import { z } from 'zod';
import { commonTeamId, commonEmail, commonRole, commonTeamName, commonToken, commonInviteId } from '../common/schema.ts';

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
export const ReqParamInvitationsItemSchema = z.object({ teamId: commonTeamId, inviteId: commonInviteId });

/**
 * [Requset-Param-Schema] チーム招待を削除
 */
export const ReqParamInvitationsDeleteSchema = z.object({ teamId: commonTeamId, inviteId: commonInviteId });

/**
 * [Requset-Param-Schema] チーム招待からチームに追加
 */
export const ReqParamInvitationsToTeamUserSchema = z.object({ teamId: commonTeamId, inviteId: commonInviteId });

/**
 * [Requset-Body-Schema] チーム招待からチームに追加
 */
export const ReqBodyInvitationsToTeamUserSchema = z.object({
  token: commonToken,
});
