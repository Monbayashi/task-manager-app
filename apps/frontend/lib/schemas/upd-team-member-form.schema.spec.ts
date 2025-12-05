import { updTeamMemberFormSchema } from './upd-team-member-form.schema';

describe('updTeamMemberFormSchema', () => {
  it('成功', () => {
    const input = { role: 'admin' };
    const result = updTeamMemberFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const input = { role: 'invalid-role' };
    const result = updTeamMemberFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['role']);
  });
});
