import { z } from 'zod';
import { ReqBodyUsersRegisterSchema, ReqBodyUsersUpdateSchema } from './schema.ts';

/**
 * [Response-Body-Type] ユーザ情報取得
 */
export type ResBodyUsersMeType = {
  user: {
    email: string;
    name: string;
    image?: string;
    createdAt: string;
  };
  teams: {
    teamId: string;
    name: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }[];
};

/**
 * [Request-Body-Type] ユーザ作成
 */
export type ReqBodyUsersRegisterType = z.infer<typeof ReqBodyUsersRegisterSchema>;

/**
 * [Response-Body-Type] ユーザ作成
 */
export type ResBodyUsersRegisterType = {
  userId: string;
  teamId: string;
};

/**
 * [Request-Body-Type] ユーザ更新
 */
export type ReqBodyUsersUpdateType = z.infer<typeof ReqBodyUsersUpdateSchema>;

/**
 * [Response-Body-Type] ユーザ更新
 */
export type ResBodyUsersUpdateType = {
  newUserName: string;
};
