import { z } from 'zod';
import { ReqQuerySummaryCountschema } from './schema.ts';

/** [Request-Query-Type] タスク件数を取得 */
export type ReqQuerySummaryCountsType = z.infer<typeof ReqQuerySummaryCountschema>;

/** [Response-Query-Type] タスク件数を取得 */
export type ResQuerySummaryCountsType = {
  all: { todo: number; doing: number; done: number };
  daily: { date: string; todo: number; doing: number; done: number }[];
};
