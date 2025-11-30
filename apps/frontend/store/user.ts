'use client';

import { fetcherMe } from '@/api/users/useMe';
import { create } from 'zustand';
import { ResBodyUsersMeType } from '@repo/api-models/users';

type UserStore = {
  status: 'init' | 'done';
  user: ResBodyUsersMeType | null;
  setUser: (user: ResBodyUsersMeType | null) => void;
  logout: () => void;
  mutateUser: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  status: 'init',
  user: null,
  setUser: (user: ResBodyUsersMeType | null) => set({ status: 'done', user }),
  // logout: () => mutate(() => true, undefined, { revalidate: true }),
  // mutateUser: async () => await mutate('api/users/me'),
  logout: () => set({ status: 'init', user: null }),
  mutateUser: async () => {
    try {
      const data = await fetcherMe('/api/users/me');
      if (data != null) set({ user: data });
    } catch (err) {
      console.error(err);
    }
  },
}));
