'use client';

import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTasksUpdateType, ResBodyTasksUpdateType } from '@repo/api-models/tasks';

export const updateTask = async (url: string, { arg }: { arg: ReqBodyTasksUpdateType }): Promise<ResBodyTasksUpdateType> => {
  const response = await api.put(url, arg);
  return response.data;
};

/**
 * タスク更新API
 */
export const useUpdateTask = (teamId: string | null, taskId: string | null) => {
  const url = teamId && taskId ? `/api/teams/${teamId}/tasks/${taskId}` : null;
  return useSWRMutation<ResBodyTasksUpdateType, undefined, string | null, ReqBodyTasksUpdateType>(url, updateTask);
};
