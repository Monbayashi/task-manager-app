import { api } from '@/service/api-client';
import useSWRMutation from 'swr/mutation';
import { ReqBodyUsersRegisterType, ResBodyUsersRegisterType } from '@repo/api-models/users';

export const createUser = async (url: '/api/users/register', { arg }: { arg: ReqBodyUsersRegisterType }): Promise<ResBodyUsersRegisterType> => {
  const response = await api.post(url, arg);
  return response.data;
};

/**
 * ユーザ登録API
 */
export const useCreateUser = () => {
  return useSWRMutation<ResBodyUsersRegisterType, undefined, '/api/users/register', ReqBodyUsersRegisterType>('/api/users/register', createUser);
};
