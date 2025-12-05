import { confirmSignupFormSchema, signupFormSchema } from './signup-form.schema';

describe('signupFormSchema', () => {
  it('成功', () => {
    const data = {
      email: 'test@example.com',
      password: 'Abcd1234!',
      confirmPassword: 'Abcd1234!',
    };
    const result = signupFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = {
      email: 'test@example.com',
      password: 'Abcd1234!',
      confirmPassword: 'Different123!',
    };
    const result = signupFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});

describe('confirmSignupFormSchema', () => {
  it('成功', () => {
    const data = { code: '123456' };
    const result = confirmSignupFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = { code: 'abc' };
    const result = confirmSignupFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['code']);
  });
});
