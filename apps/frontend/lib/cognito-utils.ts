'use client';

/** redirectを保持するキー */
const STORAGE_KEY = 'cognito_oauth_redirect' as const;

/** Cognito OAuth時のリダイレクト先を保存 */
export const setCognitoOauthRedirect = (redirectURL: string): string => {
  sessionStorage.setItem(STORAGE_KEY, redirectURL);
  return redirectURL;
};

/** Cognito OAuth時のリダイレクト先を取得*/
export const getCognitoOauthRedirect = (): string | null => {
  const storageRedirect = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return storageRedirect;
};
