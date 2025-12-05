import { userSettingsFormSchema } from './user-settings-form.schema';

describe('userSettingsFormSchema', () => {
  it('成功', () => {
    const input = { userName: '山田太郎' };
    const result = userSettingsFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const input = { userName: '' };
    const result = userSettingsFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['userName']);
  });
});
