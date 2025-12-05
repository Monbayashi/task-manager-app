import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

// HR: ------------------------------------------ ENUM系 ------------------------------------------

/** [共通] role */
export const commonRole = z.enum(['admin', 'member'], 'ロール値が不正です (admin / member)');

/** [共通] taskStatus */
export const commonTaskStatus = z.enum(['todo', 'doing', 'done'], 'ステータス値が不正です (todo / doing / done)');

/** [共通: Optional] Task Search statusGroup */
export const commonStatusGroup = z.enum(
  ['todo', 'doing', 'done', 'todo_doing', 'doing_done', 'todo_done', 'all'],
  'ステータスグループ値が不正です (todo / doing / done / todo_doing / doing_done / todo_done / all)'
);

/** [共通: Optional] Task Search indexType */
export const commonIndexType = z.enum(['start', 'end'], 'インデックスタイプ値が不正です (start / end)');

/** [共通: Optional] Task Search sort */
export const commonSort = z.enum(['asc', 'dasc'], 'ソート値が不正です (asc / dasc)');

// HR: ------------------------------------------ ID系 ------------------------------------------

/** [共通] userId */
export const commonUserId = z.string({
  error: (issue) => (issue.input === undefined ? 'ユーザIDは必須項目です' : 'ユーザIDは文字列で入力してください'),
});

/** [共通] teamId */
export const commonTeamId = z.uuidv7('チームIDは有効なID形式で入力してください');

/** [共通] taskId */
export const commonTaskId = z.uuidv7('タスクIDは有効なID形式で入力してください');

/** [共通] inviteId */
export const commonInviteId = z.uuidv7('招待IDは有効なID形式で入力してください');

/** [共通] tagId */
export const commonTagId = z.uuidv7('タグIDは有効なID形式で入力してください');

/** [共通] tagRefs */
export const commonTagRefs = z.array(commonTagId);

// HR: ------------------------------------------ 日付系 ------------------------------------------

/** [共通] startTime */
export const commonStartTime = z
  .string({ error: (issue) => (issue.input === undefined ? '開始日時は必須項目です' : '開始日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');

/** [共通] endTime */
export const commonEndTime = z
  .string({ error: (issue) => (issue.input === undefined ? '終了日時は必須項目です' : '終了日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');

/** [共通: Optional] from To */
export const commonFromTo = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください');

// HR: ------------------------------------------ 文字列系 ------------------------------------------

/** [共通] teamName */
export const commonTeamName = z
  .string({ error: (issue) => (issue.input === undefined ? 'チーム名は必須項目です' : 'チーム名は文字列で入力してください') })
  .min(2, 'チーム名は2文字以上です')
  .max(16, 'チーム名は16文字までです');

/** [共通] userName */
export const commonUserName = z
  .string({ error: (issue) => (issue.input === undefined ? 'ユーザ名は必須項目です' : 'ユーザ名は文字列で入力してください') })
  .min(2, 'ユーザ名は2文字以上です')
  .max(16, 'ユーザ名は16文字までです');

/** [共通] tagName */
export const commonTagName = z
  .string({ error: (issue) => (issue.input === undefined ? 'タグ名は必須項目です' : 'タグ名は文字列で入力してください') })
  .min(1, 'タグー名は1文字以上です')
  .max(8, 'タグ名は8文字までです');

/** [共通] taskTitle */
export const commonTaskTitle = z
  .string({ error: (issue) => (issue.input === undefined ? 'タイトルは必須項目です' : 'タイトルは文字列で入力してください') })
  .min(1, 'タイトルは1文字以上です')
  .max(50, 'タイトルは50文字までです');

/** [共通] discription */
export const commonTaskDiscription = z
  .string({ error: (issue) => (issue.input === undefined ? '説明は必須項目です' : '説明は文字列で入力してください') })
  .min(1, '説明は1文字以上です')
  .max(5000, '説明は5000文字までです');

/** [共通] tagColor */
export const commonTagColor = z
  .string({ error: (issue) => (issue.input === undefined ? 'タグカラーは必須項目です' : 'タグカラーは文字列で入力してください') })
  .min(1, 'タグカラーは1文字以上です');

/** [共通] tagBackendColor */
export const commonTagBackendColor = z
  .string({
    error: (issue) => (issue.input === undefined ? 'タグバックエンドカラーは必須項目です' : 'タグバックエンドカラーは文字列で入力してください'),
  })
  .min(1, 'タグバックエンドカラーは1文字以上です');

/** [共通] email */
export const commonEmail = z
  .string({ error: (issue) => (issue.input === undefined ? 'メールアドレスは必須項目です' : 'メールアドレスは文字列で入力してください') })
  .pipe(z.email('正しいメールアドレスを入力してください'));

/** [共通] token */
export const commonToken = z
  .string({ error: (issue) => (issue.input === undefined ? 'トークンは必須項目です' : 'トークンは文字列で入力してください') })
  .length(64, 'トークンは64文字で指定してください');
