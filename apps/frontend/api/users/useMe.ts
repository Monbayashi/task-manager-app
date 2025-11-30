'use client';

import { api } from '@/service/api-client';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/user';
import { isAxiosError } from 'axios';
import useSWR from 'swr';
import { ResBodyUsersMeType } from '@repo/api-models/users';

export const fetcherMe = async (url: '/api/users/me'): Promise<ResBodyUsersMeType | null> => {
  try {
    const response = await api.get<ResBodyUsersMeType>(url);
    return response.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) {
      // ユーザ未登録
      return null;
    }
    throw err;
  }
};

/**
 * ユーザデータ取得 + データストア投入
 * @description
 * app/(protected)/layout.tsxのみで使う想定
 * ユーザ情報はStoreに保存 @/store/user
 * @param userId
 * @returns
 */
export const useSyncMe = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useUserStore((s) => s.setUser);

  return useSWR(accessToken && `/api/users/me`, fetcherMe, {
    // 10分間再取得しない
    dedupingInterval: 600_000,
    //
    revalidateOnFocus: true,
    //
    revalidateOnReconnect: true,
    //
    onSuccess: (data) => setUser(data),
  });
};
