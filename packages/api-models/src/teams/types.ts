import { z } from 'zod';
import { ReqBodyTeamMemberUpdateSchema, ReqBodyTeamsRegisterSchema, ReqBodyTeamsUpdateSchema } from './schema.ts';

/**
 * [Response-Body-Type] チーム情報取得
 */
export type ResBodyTeamsTeamType = {
  teamId: string;
  teamName: string;
  teamDiscription?: string;
  createdAt: string;
};

/**
 * [Response-Body-Type] チームに紐づくユーザ一覧
 */
export type ResBodyTeamsUsersType = {
  users: {
    teamId: string;
    userId: string;
    userTeamRole: 'admin' | 'member';
    joinedAt: string;
    userName: string;
  }[];
};

/**
 * [Request-Body-Type] チーム作成
 */
export type ReqBodyTeamsRegisterType = z.infer<typeof ReqBodyTeamsRegisterSchema>;

/**
 * [Response-Body-Type] チーム作成
 */
export type ResBodyTeamsRegisterType = {
  teamId: string;
  teamName: string;
  teamDiscription?: string;
  createdAt: string;
};

/**
 * [Request-Body-Type] チーム更新
 */
export type ReqBodyTeamsUpdateType = z.infer<typeof ReqBodyTeamsUpdateSchema>;

/**
 * [Response-Body-Type] チーム更新
 */
export type ResBodyTeamsUpdateType = {
  newTeamName: string;
};

/**
 * [Request-Body-Type] チームメンバー更新
 */
export type ReqBodyTeamMemberUpdateType = z.infer<typeof ReqBodyTeamMemberUpdateSchema>;

/**
 * [Response-Body-Type] チームメンバー更新
 */
export type ResBodyTeamMemberUpdateType = {
  teamId: string;
  userId: string;
};

/**
 * [Response-Body-Type] チームメンバー削除
 */
export type ResBodyTeamMemberDeleteType = {
  teamId: string;
  userId: string;
};
