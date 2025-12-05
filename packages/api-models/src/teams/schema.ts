import { z } from 'zod';
import { commonRole, commonTeamId, commonTeamName, commonUserId } from '../common/schema.ts';

/**
 * [Requset-Param-Schema] チーム情報を取得
 */
export const ReqParamTeamsTeamSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Param-Schema] チームに紐づくユーザ一覧
 */
export const ReqParamTeamsUsersSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Body-Schema] チーム作成
 */
export const ReqBodyTeamsRegisterSchema = z.object({
  teamName: commonTeamName,
});

/**
 * [Requset-Param-Schema] チーム更新
 */
export const ReqParamTeamsUpdateSchema = z.object({ teamId: commonTeamId });

/**
 * [Request-Body-Schema] チーム更新
 */
export const ReqBodyTeamsUpdateSchema = z.object({
  teamName: commonTeamName,
});

/**
 * [Request-Param-Schema] チームメンバー更新
 */
export const ReqParamTeamMemberUpdateSchema = z.object({ teamId: commonTeamId, userId: commonUserId });

/**
 * [Request-Body-Schema] チームメンバー更新
 */
export const ReqBodyTeamMemberUpdateSchema = z.object({
  role: commonRole,
});

/**
 * [Request-Param-Schema] チームメンバー削除
 */
export const ReqParamTeamMemberDeleteSchema = z.object({ teamId: commonTeamId, userId: commonUserId });
