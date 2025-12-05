import { z } from 'zod';
import { commonEmail, commonTeamName, commonUserName } from '../common/schema.ts';

/**
 * [Request-Body-Schema] ユーザ作成
 */
export const ReqBodyUsersRegisterSchema = z.object({
  userName: commonUserName,
  email: commonEmail,
  teamName: commonTeamName,
});

/**
 * [Request-Body-Schema] ユーザ更新
 */
export const ReqBodyUsersUpdateSchema = z.object({
  userName: commonUserName,
});
