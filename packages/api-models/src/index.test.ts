import { getHelloResScheme } from './index.ts';

describe('typesのテスト', () => {
  it('types success', () => {
    expect(getHelloResScheme.safeParse('hello')).toEqual({ data: 'hello', success: true });
  });

  it('types err', () => {
    const res = getHelloResScheme.safeParse(1, { reportInput: true });
    expect(res.success).toBeFalsy();
    if (res.success === false) {
      const issues = res.error.issues;
      expect(issues[0]?.message).toEqual('helloは文字です。');
    }
  });
});
