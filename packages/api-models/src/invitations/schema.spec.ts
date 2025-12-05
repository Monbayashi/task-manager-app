import {
  ReqParamInvitationsSchema,
  ReqBodyInvitationsRegisterSchema,
  ReqParamInvitationsItemSchema,
  ReqBodyInvitationsToTeamUserSchema,
  ReqParamInvitationsDeleteSchema,
  ReqParamInvitationsRegisterSchema,
  ReqParamInvitationsToTeamUserSchema,
} from './schema.ts';

describe('invitations/schema', () => {
  describe('ReqParamInvitationsSchema', () => {
    it('成功', () => {
      const result = ReqParamInvitationsSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamInvitationsSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqParamInvitationsRegisterSchema', () => {
    it('成功', () => {
      const result = ReqParamInvitationsRegisterSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamInvitationsRegisterSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyInvitationsRegisterSchema', () => {
    it('成功', () => {
      const result = ReqBodyInvitationsRegisterSchema.safeParse({
        email: 'test@example.com',
        role: 'admin',
        teamName: 'チーム',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyInvitationsRegisterSchema.safeParse({
        email: 'not-email',
        role: 'admin',
        teamName: 'チーム',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['email']);
    });
  });

  describe('ReqParamInvitationsItemSchema', () => {
    it('成功', () => {
      const result = ReqParamInvitationsItemSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        inviteId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamInvitationsItemSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065', inviteId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['inviteId']);
    });
  });

  describe('ReqParamInvitationsDeleteSchema', () => {
    it('成功', () => {
      const result = ReqParamInvitationsDeleteSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        inviteId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamInvitationsDeleteSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065', inviteId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['inviteId']);
    });
  });

  describe('ReqParamInvitationsToTeamUserSchema', () => {
    it('成功', () => {
      const result = ReqParamInvitationsToTeamUserSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        inviteId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamInvitationsToTeamUserSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065', inviteId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['inviteId']);
    });
  });

  describe('ReqBodyInvitationsToTeamUserSchema', () => {
    it('成功', () => {
      const result = ReqBodyInvitationsToTeamUserSchema.safeParse({
        token: 'a'.repeat(64),
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyInvitationsToTeamUserSchema.safeParse({
        token: '',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['token']);
    });
  });
});
