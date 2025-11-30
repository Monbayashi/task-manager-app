'use client';

import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResBodyTasksTaskType } from '@repo/api-models/tasks';

export const fetcherTask = async (url: string): Promise<ResBodyTasksTaskType> => {
  console.log('☆fetcherTask');
  const result = await api.get<ResBodyTasksTaskType>(url);
  return result.data;
};

/**
 * タスク詳細取得
 */
export const useTask = (teamId: string | null, taskId: string | null) => {
  const url = teamId && taskId ? `/api/teams/${teamId}/tasks/${taskId}` : null;
  return useSWR<ResBodyTasksTaskType>(url, fetcherTask);
};
