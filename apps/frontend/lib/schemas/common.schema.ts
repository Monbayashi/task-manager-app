import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

/** コグニトのパスワードポリシー 特殊記号 */
const COGNITO_SYMBOL_REGEX = /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/;

/** [共通] メールアドレス */
export const emailSchema = z.email('有効なEmailを入力してください');

/**
 * [共通] パスワード
 * コグニトのパスワードポリシー
 * 最小値: 8
 * 許容する文字種:
 * 1. 半角小文字英字
 * 2. 半角大文字英字
 * 3. 半角数字
 * 4. 特殊記号 = + - ^ $ * . [ ] { } ( ) ? " ! @ # % & / \ , > < ' : ; | _ ~ `
 */
export const passwordSchema = z
  .string()
  .min(8, 'Passwordは8文字以上で入力してください')
  .max(99, 'Passwordは99文字以内で入力してください')
  .refine((val) => /[A-Z]/.test(val), {
    message: '大文字 (A-Z) を最低 1 つ含めてください',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: '小文字 (a-z) を最低 1 つ含めてください',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: '数字 (0-9) を最低 1 つ含めてください',
  })
  .refine((val) => COGNITO_SYMBOL_REGEX.test(val), {
    message: '記号 (例: !@#$%) を最低 1 つ含めてください',
  });

/** [共通] チーム名称 */
export const teamNameSchema = z.string().min(2, 'チーム名は2文字以上で入力してください').max(16, 'チーム名は8文字以内で入力してください');

/** [共通] ユーザ名称 */
export const userNameSchema = z.string().min(2, 'ユーザ名は2文字以上で入力してください').max(16, 'ユーザ名は8文字以内で入力してください');

/** [共通] チームロール */
export const teamRoleSchema = z.enum(['admin', 'member'], 'ロール値が不正です (admin / member)');

/** [共通] タスクタイトル */
export const taskTitleSchema = z
  .string({ error: (issue) => (issue.input === undefined ? 'タイトルは必須項目です' : 'タイトルは文字列で入力してください') })
  .min(1, 'タイトルは1文字以上です')
  .max(50, 'タイトルは50文字までです');

/** [共通] タスク説明 */
export const taskDiscriptionSchema = z
  .string({ error: (issue) => (issue.input === undefined ? '説明は必須項目です' : '説明は文字列で入力してください') })
  .min(1, '説明は1文字以上です')
  .max(5000, '説明は5000文字までです');

/** [共通] タスクステータス */
export const taskStatusSchema = z.enum(['todo', 'doing', 'done'], 'ステータス値が不正です (todo / doing / done)');

/** [共通] タグID参照 */
export const tagRefsSchema = z.array(z.uuid('タグIDは有効なID形式で入力してください'));

/** [共通] 開始日時 */
export const startTimeSchema = z
  .string({ error: (issue) => (issue.input === undefined ? '開始日時は必須項目です' : '開始日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');

/** [共通] 終了日時 */
export const endTimeSchema = z
  .string({ error: (issue) => (issue.input === undefined ? '終了日時は必須項目です' : '終了日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');
