import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyTagsRegisterType, ResBodyTagsRegisterType } from '@repo/api-models/tags';

export const createTag = async (url: string, { arg }: { arg: ReqBodyTagsRegisterType }): Promise<ResBodyTagsRegisterType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * タグ登録API
 */
export const useCreateTag = (teamId: string | null) => {
  return useSWRMutation<ResBodyTagsRegisterType, undefined, string | null, ReqBodyTagsRegisterType>(
    teamId ? `/api/teams/${teamId}/tags` : null,
    createTag
  );
};
