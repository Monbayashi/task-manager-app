import { updTeamFormSchema } from './upd-team-form.schema';

describe('updTeamFormSchema', () => {
  it('成功', () => {
    const input = { teamName: 'チームA' };
    const result = updTeamFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const input = { teamName: '' };
    const result = updTeamFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['teamName']);
  });
});
