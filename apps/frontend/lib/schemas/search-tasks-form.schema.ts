import { isValid, parseISO } from 'date-fns';
import { z } from 'zod';

/** statusGroup */
export const statusGroup = z.enum(
  ['todo', 'doing', 'done', 'todo_doing', 'doing_done', 'todo_done', 'all'],
  'ステータスグループ値が不正です (todo / doing / done / todo_doing / doing_done / todo_done / all)'
);

/** indexType */
export const indexType = z.enum(['start', 'end'], 'インデックスタイプ値が不正です (start / end)');

/** sort */
export const sort = z.enum(['asc', 'dasc'], 'ソート値が不正です (asc / dasc)');

export const dateSchema = z
  .union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください')])
  .transform((val) => (val === '' ? undefined : val))
  .optional();

/** タスク一覧検索Form Schema */
export const searchTasksFormSchema = z
  .object({
    statusGroup,
    indexType,
    fromDate: dateSchema,
    toDate: dateSchema,
    sort: sort,
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
      error: 'from は to 以下である必要があります。',
      path: ['fromDate'],
    }
  );

/** タスク一覧検索Form Type */
export type SearchTasksFormType = z.infer<typeof searchTasksFormSchema>;
