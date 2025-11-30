import { z } from 'zod';
import { commonTaskId, commonTeamId } from '../common/index.ts';
import { isValid, parseISO } from 'date-fns';

const taskTitle = z
  .string({ error: (issue) => (issue.input === undefined ? 'タイトルは必須項目です' : 'タイトルは文字列で入力してください') })
  .min(1, 'タイトルは1文字以上です')
  .max(50, 'タイトルは50文字までです');
const taskDiscription = z
  .string({ error: (issue) => (issue.input === undefined ? '説明は必須項目です' : '説明は文字列で入力してください') })
  .min(1, '説明は1文字以上です')
  .max(5000, '説明は5000文字までです');
const taskStatus = z.enum(['todo', 'doing', 'done'], 'ステータス値が不正です (todo / doing / done)');
const tagRefs = z.array(z.uuid('タグIDは有効なID形式で入力してください'));
const startTime = z
  .string({ error: (issue) => (issue.input === undefined ? '開始日時は必須項目です' : '開始日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');
const endTime = z
  .string({ error: (issue) => (issue.input === undefined ? '終了日時は必須項目です' : '終了日時は文字列で入力してください') })
  .refine((val) => isValid(parseISO(val)), '有効な日付（ISO 8601形式）を入力してください');

// query
const statusGroup = z
  .enum(
    ['todo', 'doing', 'done', 'todo_doing', 'doing_done', 'todo_done', 'all'],
    'ステータスグループ値が不正です (todo / doing / done / todo_doing / doing_done / todo_done / all)'
  )
  .optional();
const indexType = z.enum(['start', 'end'], 'インデックスタイプ値が不正です (start / end)').optional();
// fromDateとtoDateで使用
const fromToSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください')
  .optional();
const sort = z.enum(['asc', 'dasc'], 'ソート値が不正です (asc / dasc)').optional();

/** [共通] teamId */
export const tagId = z.uuidv7('タグIDは有効なID形式で入力してください');

/**
 * [Requset-Param-Schema] タスク一覧を取得
 */
export const ReqParamTasksSchema = z.object({ teamId: commonTeamId });

/**
 * [Request-Query-Schema] タスク一覧を取得
 */
export const ReqQueryTasksSchema = z
  .object({
    statusGroup: statusGroup,
    indexType: indexType,
    tagRefs: tagRefs.optional(),
    fromDate: fromToSchema,
    toDate: fromToSchema,
    sort: sort,
    nextToken: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        const from = parseISO(data.fromDate);
        const to = parseISO(data.toDate);
        return isValid(from) && isValid(to) && from <= to;
      }
      return true;
    },
    {
      error: 'fromDate は toDate 以下である必要があります。',
      path: ['fromDate'],
    }
  );

/**
 * [Requset-Param-Schema] タスク作成
 */
export const ReqParamTasksRegisterSchema = z.object({ teamId: commonTeamId });

/**
 * [Requset-Body-Schema] タグ作成
 */
export const ReqBodyTasksRegisterSchema = z
  .object({
    title: taskTitle,
    discription: taskDiscription,
    status: taskStatus,
    tagRefs: tagRefs,
    startTime: startTime,
    endTime: endTime,
  })
  .refine((data) => parseISO(data.startTime) <= parseISO(data.endTime), {
    error: '開始日時 は 終了日時 以下である必要があります',
    path: ['startTime'],
  });

/**
 * [Requset-Param-Schema] タスク詳細を取得
 */
export const ReqParamTasksTaskSchema = z.object({ teamId: commonTeamId, taskId: commonTaskId });

/**
 * [Requset-Param-Schema] タグ更新
 */
export const ReqParamTasksUpdateSchema = z.object({ teamId: commonTeamId, taskId: commonTaskId });

/**
 * [Request-Body-Schema] タグ更新
 */
export const ReqBodyTasksUpdateSchema = z
  .object({
    title: taskTitle.optional(),
    discription: taskDiscription.optional(),
    status: taskStatus.optional(),
    tagRefs: tagRefs.optional(),
    startTime: startTime.optional(),
    endTime: endTime.optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = parseISO(data.startTime);
        const end = parseISO(data.endTime);
        return isValid(start) && isValid(end) && start <= end;
      }
      return true;
    },
    {
      error: '開始日時 は 終了日時 以下である必要があります',
      path: ['startTime'],
    }
  );

/**
 * [Requset-Param-Schema] タグ削除
 */
export const ReqParamTasksDeleteSchema = z.object({ teamId: commonTeamId, taskId: commonTaskId });
