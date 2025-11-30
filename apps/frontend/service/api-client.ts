import { useAlertStore } from '@/store/alert';
import { useAuthStore } from '@/store/authStore';
import { fetchAuthSession } from 'aws-amplify/auth';
import axios, { AxiosRequestConfig } from 'axios';

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

interface ErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストの前処理 (トークン設定)
api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンス後処理
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const addAlert = useAlertStore.getState().addAlert;

    if (!axios.isAxiosError(error)) {
      addAlert('予期せぬエラーが発生しました。', 'error');
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // headers が undefined の場合は作る
    if (!originalRequest.headers) {
      originalRequest.headers = {};
    }

    // 401 + TokenExpired の場合だけリトライ
    const data = error.response?.data as ErrorResponse;
    // TODO: ERROR_CODEを作成時にメッセージでなくエラーコードで判断する。
    const isTokenExpired = error.response?.status === 401 && data?.message?.includes('有効期限が切れています');

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await fetchAuthSession();
        const newToken = session.tokens?.accessToken?.toString();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }

        // 再リクエスト
        return api(originalRequest);
      } catch {
        addAlert('再認証に失敗しました。', 'error');
        return Promise.reject(error);
      }
    }

    // 通常のエラーハンドリング
    if (error.response) {
      const msg = data?.message ?? `エラーが発生しました (${error.response.status})`;
      addAlert(msg, 'error');
    } else if (error.request) {
      addAlert('サーバーに接続できませんでした。', 'error');
    } else {
      addAlert('予期せぬエラーが発生しました。', 'error');
    }

    return Promise.reject(error);
  }
);
