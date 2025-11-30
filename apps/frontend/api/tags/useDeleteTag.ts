import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ResBodyTagsDeleteType } from '@repo/api-models/tags';

export const deleteTag = async (url: string): Promise<ResBodyTagsDeleteType> => {
  const response = await api.delete(url);
  return response.data;
};

/**
 * タグ更新API
 */
export const useDeleteTag = (teamId: string | null, tagId: string | null) => {
  const url = teamId && tagId ? `/api/teams/${teamId}/tags/${tagId}` : null;
  return useSWRMutation<ResBodyTagsDeleteType, undefined, string | null>(url, deleteTag);
};
