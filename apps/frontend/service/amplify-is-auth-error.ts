'use client';

import type { AuthError } from '@aws-amplify/auth';

/**
 * Amplifyのエラーかチェックする処理
 * @param error
 * @returns
 */
export const isAmplifyAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'name' in error && 'message' in error;
};
