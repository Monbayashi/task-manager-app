import { z } from 'zod';
import {
  commonEndTime,
  commonFromTo,
  commonIndexType,
  commonSort,
  commonStartTime,
  commonStatusGroup,
  commonTagRefs,
  commonTaskDiscription,
  commonTaskId,
  commonTaskStatus,
  commonTaskTitle,
  commonTeamId,
} from '../common/schema.ts';
import { isValid, parseISO } from 'date-fns';

/**
 * [Requset-Param-Schema] タスク一覧を取得
 */
export const ReqParamTasksSchema = z.object({ teamId: commonTeamId });

/**
 * [Request-Query-Schema] タスク一覧を取得
 */
export const ReqQueryTasksSchema = z
  .object({
    statusGroup: commonStatusGroup.optional(),
    indexType: commonIndexType.optional(),
    tagRefs: commonTagRefs.optional(),
    fromDate: commonFromTo.optional(),
    toDate: commonFromTo.optional(),
    sort: commonSort.optional(),
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
    title: commonTaskTitle,
    discription: commonTaskDiscription,
    status: commonTaskStatus,
    tagRefs: commonTagRefs,
    startTime: commonStartTime,
    endTime: commonEndTime,
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
    title: commonTaskTitle.optional(),
    discription: commonTaskDiscription.optional(),
    status: commonTaskStatus.optional(),
    tagRefs: commonTagRefs.optional(),
    startTime: commonStartTime.optional(),
    endTime: commonEndTime.optional(),
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
