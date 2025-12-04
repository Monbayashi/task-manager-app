import { wellcomeFormSchema } from './wellcom-form.schema';

describe('wellcomeFormSchema', () => {
  it('成功', () => {
    const input = {
      email: 'test@example.com',
      userName: '山田太郎',
      teamName: 'チームA',
    };
    const result = wellcomeFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const input = {
      email: 'invalid-email',
      userName: '山田太郎',
      teamName: '開発チーム',
    };
    const result = wellcomeFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['email']);
  });
});
