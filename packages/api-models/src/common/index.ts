import { z } from 'zod';

/** [共通] teamName */
export const commonTeamName = z
  .string({ error: (issue) => (issue.input === undefined ? 'チーム名は必須項目です' : 'チーム名は文字列で入力してください') })
  .min(2, 'チームー名は2文字以上です')
  .max(16, 'チームー名は16文字までです');

/** [共通] userName */
export const commonUserName = z
  .string({ error: (issue) => (issue.input === undefined ? 'ユーザ名は必須項目です' : 'ユーザ名は文字列で入力してください') })
  .min(2, 'ユーザー名は2文字以上です')
  .max(16, 'ユーザー名は16文字までです');

/** [共通] email */
export const commonEmail = z
  .string({ error: (issue) => (issue.input === undefined ? 'メールアドレスは必須項目です' : 'メールアドレスは文字列で入力してください') })
  .pipe(z.email('正しいメールアドレスを入力してください'));

/** [共通] role */
export const commonRole = z.enum(['admin', 'member'], 'ロール値が不正です (admin / member)');

export const commonUserId = z.string({
  error: (issue) => (issue.input === undefined ? 'ユーザIDは必須項目です' : 'ユーザIDは文字列で入力してください'),
});

/** [共通] teamId */
export const commonTeamId = z.uuidv7('チームIDは有効なID形式で入力してください');

/** [共通] taskId */
export const commonTaskId = z.uuidv7('タスクIDは有効なID形式で入力してください');
