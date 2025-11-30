'use client';

import { api } from '@/service/api-client';
import { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';
import { unstable_serialize } from 'swr/infinite';
import { ReqQueryTasksType, ResBodyTasksType } from '@repo/api-models/tasks';

const fetcherTasksPage = async (url: string) => {
  const result = await api.get<ResBodyTasksType>(url);
  return result.data;
};

/** タスク一覧取得 */
export const useTasksInfinite = (teamId: string | null, condition: ReqQueryTasksType | null) => {
  const getKey = (pageIndex: number, previousPage: ResBodyTasksType | null) => {
    if (!teamId || !condition) return null;
    if (pageIndex > 0 && !previousPage?.nextToken) return null;
    // 検索条件をクエリ化
    const query = new URLSearchParams();
    if (condition.statusGroup) query.append('statusGroup', condition.statusGroup);
    if (condition.indexType) query.append('indexType', condition.indexType);
    if (condition.fromDate) query.append('fromDate', condition.fromDate);
    if (condition.toDate) query.append('toDate', condition.toDate);
    if (condition.sort) query.append('sort', condition.sort);
    if (condition.tagRefs?.length) {
      condition.tagRefs.forEach((t) => query.append('tagRefs', t));
    }
    if (previousPage?.nextToken) {
      query.append('nextToken', previousPage.nextToken);
    }
    return `/api/teams/${teamId}/tasks?${query.toString()}`;
  };

  return useSWRInfinite<ResBodyTasksType>(getKey, fetcherTasksPage, {
    revalidateFirstPage: true,
  });
};

/** タスク一覧再取得 */
export const useTasksInfiniteReset = (teamId: string | null, condition: ReqQueryTasksType | null) => {
  const { mutate: globalMutate } = useSWRConfig();

  const resetTasks = async () => {
    if (!teamId || !condition) return;
    // getKey と同じ形でキャッシュキーを生成
    const key = unstable_serialize((pageIndex: number, previousPage: ResBodyTasksType | null) => {
      if (!teamId || !condition) return null;
      if (pageIndex > 0 && !previousPage?.nextToken) return null;

      const query = new URLSearchParams();
      if (condition.statusGroup) query.append('statusGroup', condition.statusGroup);
      if (condition.indexType) query.append('indexType', condition.indexType);
      if (condition.fromDate) query.append('fromDate', condition.fromDate);
      if (condition.toDate) query.append('toDate', condition.toDate);
      if (condition.sort) query.append('sort', condition.sort);
      if (condition.tagRefs?.length) {
        condition.tagRefs.forEach((t) => query.append('tagRefs', t));
      }
      return `/api/teams/${teamId}/tasks?${query.toString()}`;
    });

    // mutate で全ページをリフェッチ
    await globalMutate(key);
  };

  return { resetTasks };
};
