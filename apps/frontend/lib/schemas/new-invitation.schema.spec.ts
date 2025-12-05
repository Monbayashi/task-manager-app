import { newInvitationSchema } from './new-invitation.schema';

describe('newInvitationSchema', () => {
  it('成功', () => {
    const data = {
      email: 'test@example.com',
      role: 'admin',
    };

    const result = newInvitationSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = {
      email: 'test@example.com',
      role: 'invalid-role',
    };

    const result = newInvitationSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['role']);
  });
});
