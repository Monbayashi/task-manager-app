import { loginFormSchema } from './login-form.schema';

describe('loginFormSchema', () => {
  it('成功', () => {
    const data = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const result = loginFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = {
      email: 'not-email',
      password: 'Password123!',
    };

    const result = loginFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['email']);
  });
});
