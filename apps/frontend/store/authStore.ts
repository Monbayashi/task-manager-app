import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  email: string | null;
  init: () => Promise<void>;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // setupHubを一回しか実行させないようにする
  let hubCleanup: (() => void) | null = null;

  const setupHub = () => {
    const listener = Hub.listen('auth', async ({ payload: { event } }) => {
      console.log('Auth Event:', event);
      if (event === 'signedIn' || event === 'tokenRefresh') {
        // signIn, signUp, tokenRefreshの時、更新
        try {
          const session = await fetchAuthSession();
          // console.log(session);
          const accessToken = session.tokens?.accessToken?.toString() || null;
          const email = (session.tokens?.idToken?.payload.email as string) || null;
          const userId = session.userSub || null;
          set({ accessToken, email, userId });
        } catch {
          set({ accessToken: null, email: null, userId: null });
        }
      } else if (event === 'signedOut') {
        set({ accessToken: null, email: null, userId: null });
      }
    });
    return listener;
  };

  return {
    accessToken: null,
    email: null,
    userId: null,
    // 初期化（アプリ起動時）
    init: async () => {
      try {
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString() || null;
        const email = (session.tokens?.idToken?.payload.email as string) || null;
        const userId = session.userSub || null;
        set({ accessToken, email, userId });

        if (!hubCleanup) hubCleanup = setupHub();
      } catch {
        set({ accessToken: null, email: null, userId: null });
      }
    },

    // 同期トークン取得
    getToken: () => get().accessToken,
  };
});
