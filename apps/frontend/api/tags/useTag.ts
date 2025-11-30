import { api } from '@/service/api-client';
import useSWR from 'swr';
import { ResBodyTagsType } from '@repo/api-models/tags';

export const fetcherTag = async (url: string): Promise<ResBodyTagsType> => {
  const result = await api.get<ResBodyTagsType>(url);
  return result.data;
};

/**
 * タグ一覧取得
 */
export const useTag = (teamId: string | null) => {
  return useSWR<ResBodyTagsType>(teamId ? `/api/teams/${teamId}/tags` : null, fetcherTag);
};
