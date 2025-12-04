import { newTeamFormSchema } from './new-team-form.schema';

describe('newTeamFormSchema', () => {
  it('成功', () => {
    const data = { teamName: 'テストチーム' };
    const result = newTeamFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = { teamName: 'あ' };
    const result = newTeamFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['teamName']);
  });
});
