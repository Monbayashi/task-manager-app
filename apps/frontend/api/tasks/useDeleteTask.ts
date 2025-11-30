import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ResBodyTasksDeleteType } from '@repo/api-models/tasks';

export const deleteTask = async (url: string): Promise<ResBodyTasksDeleteType> => {
  const response = await api.delete(url);
  return response.data;
};

/**
 * タスク削除API
 */
export const useDeleteTask = (teamId: string | null, taskId: string | null) => {
  const url = teamId && taskId ? `/api/teams/${teamId}/tasks/${taskId}` : null;
  return useSWRMutation<ResBodyTasksDeleteType, undefined, string | null>(url, deleteTask, { revalidate: false });
};
