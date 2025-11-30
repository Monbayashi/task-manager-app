import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyUsersUpdateType, ResBodyUsersUpdateType } from '@repo/api-models/users';

export const updateUser = async (url: '/api/users/update', { arg }: { arg: ReqBodyUsersUpdateType }): Promise<ResBodyUsersUpdateType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * ユーザ更新API
 */
export const useUpdateUser = () => {
  return useSWRMutation<ResBodyUsersUpdateType, undefined, '/api/users/update', ReqBodyUsersUpdateType>('/api/users/update', updateUser);
};
