'use client';

import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTagsUpdateType, ResBodyTagsUpdateType } from '@repo/api-models/tags';

export const updateTag = async (url: string, { arg }: { arg: ReqBodyTagsUpdateType }): Promise<ResBodyTagsUpdateType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * タグ更新API
 */
export const useUpdateTag = (teamId: string | null, tagId: string | null) => {
  const url = teamId && tagId ? `/api/teams/${teamId}/tags/${tagId}` : null;
  return useSWRMutation<ResBodyTagsUpdateType, undefined, string | null, ReqBodyTagsUpdateType>(url, updateTag);
};
