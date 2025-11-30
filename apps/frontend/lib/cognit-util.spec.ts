import { getCognitoOauthRedirect, setCognitoOauthRedirect } from './cognito-utils';

// セッションストレージのモック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => (store[key] = value),
    removeItem: (key: string) => delete store[key],
    clear: () => (store = {}),
  };
})();

describe('cognito-utilsのテスト', () => {
  beforeEach(() => {
    global.sessionStorage = sessionStorageMock as unknown as Storage;
    sessionStorage.clear();
  });
  it('setCognitoOauthRedirect で保存した値が getCognitoOauthRedirect で取得・削除できる', () => {
    const redirectURL =
      '%2Finvitation%3FteamId%3D019aa68a-0c71-772f-95e2-64f2eeaf2fab%26inviteId%3D019ac0b9-c7be-75bc-9d4e-1f3de736271e%26token%3D13687187775a5fa42139c74fa9b011188779dd86334b7177bad910a332c63321%26teamName%3D%25E3%2582%258F%25E3%2581%259F%25E3%2581%2597%25E3%2581%25AE%25E3%2583%2581%25E3%2583%25BC%25E3%2583%25A0';
    expect(setCognitoOauthRedirect(redirectURL)).toBe(redirectURL);
    expect(getCognitoOauthRedirect()).toBe(redirectURL);
    expect(getCognitoOauthRedirect()).toBeNull();
  });

  it('値が保存されてないときは getCognitoOauthRedirect は null を返す', () => {
    expect(getCognitoOauthRedirect()).toBeNull();
  });
});
