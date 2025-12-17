'use client';

import { fetcherMe } from '@/api/users/useMe';
import { create } from 'zustand';
import { ResBodyUsersMeType } from '@repo/api-models/users';

type UserStore = {
  status: 'init' | 'done' | 'empty';
  user: ResBodyUsersMeType | null;
  setUser: (user: ResBodyUsersMeType | null) => void;
  logout: () => void;
  mutateUser: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  status: 'init',
  user: null,
  setUser: (user: ResBodyUsersMeType | null) => {
    if (user) {
      set({ status: 'done', user });
    } else {
      set({ status: 'empty', user: null });
    }
  },
  logout: () => set({ status: 'init', user: null }),
  mutateUser: async () => {
    try {
      const data = await fetcherMe('/api/users/me');
      if (data != null) set({ status: 'done', user: data });
    } catch (err) {
      console.error(err);
    }
  },
}));
