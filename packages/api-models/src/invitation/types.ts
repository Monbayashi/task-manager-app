import { z } from 'zod';
import { ReqBodyInvitationsRegisterSchema, ReqBodyInvitationsToTeamUserSchema } from './schema.ts';

type ResInvitationItem = {
  teamId: string;
  inviteId: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string; // Unix秒
  expiresAt: string; // TTL用
  invitedBy: string;
  team_name: string;
};

/**
 * [Response-Body-Type] チーム招待一覧取得
 */
export type ResBodyInvitationsType = {
  invitations: ResInvitationItem[];
};

/**
 * [Request-Body-Type] チーム招待作成
 */
export type ReqBodyInvitationsRegisterType = z.infer<typeof ReqBodyInvitationsRegisterSchema>;

/**
 * [Response-Body-Type] チーム招待作成
 */
export type ResBodyInvitationsRegisterType = ResInvitationItem;

/**
 * [Response-Body-Type] チーム招待情報取得
 */
export type ResBodyInvitationsItemType = ResInvitationItem;

/**
 * [Response-Body-Type] チーム招待削除
 */
export type ResBodyInvitationsDeleteType = {
  teamId: string;
  inviteId: string;
};

/**
 * [Request-Body-Type] チーム招待からチームに紐づくユーザ作成
 */
export type ReqBodyInvitationsToTeamUserType = z.infer<typeof ReqBodyInvitationsToTeamUserSchema>;

/**
 * [Response-Body-Type] チーム招待からチームに紐づくユーザ作成
 */
export type ResBodyInvitationsToTeamUserType = {
  teamId: string;
  userId: string;
  inviteId: string;
};
