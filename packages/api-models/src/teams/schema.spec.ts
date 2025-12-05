import {
  ReqParamTeamsTeamSchema,
  ReqParamTeamsUsersSchema,
  ReqBodyTeamsRegisterSchema,
  ReqParamTeamsUpdateSchema,
  ReqBodyTeamsUpdateSchema,
  ReqParamTeamMemberUpdateSchema,
  ReqBodyTeamMemberUpdateSchema,
  ReqParamTeamMemberDeleteSchema,
} from './schema.ts';

describe('teams/schema', () => {
  describe('ReqParamTeamsTeamSchema', () => {
    it('成功', () => {
      const result = ReqParamTeamsTeamSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54067' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTeamsTeamSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqParamTeamsUsersSchema', () => {
    it('成功', () => {
      const result = ReqParamTeamsUsersSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54067' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTeamsUsersSchema.safeParse({ teamid: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyTeamsRegisterSchema', () => {
    it('成功', () => {
      const result = ReqBodyTeamsRegisterSchema.safeParse({ teamName: 'チームA' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTeamsRegisterSchema.safeParse({ teamName: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamName']);
    });
  });

  describe('ReqParamTeamsUpdateSchema', () => {
    it('成功', () => {
      const result = ReqParamTeamsUpdateSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54067' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTeamsUpdateSchema.safeParse({ teamId: 123 });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyTeamsUpdateSchema', () => {
    it('成功', () => {
      const result = ReqBodyTeamsUpdateSchema.safeParse({ teamName: 'チームB' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTeamsUpdateSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamName']);
    });
  });

  describe('ReqParamTeamMemberUpdateSchema', () => {
    it('成功', () => {
      const result = ReqParamTeamMemberUpdateSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54067',
        userId: '019a9c45-ac94-73a3-9aee-f61677d54068',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTeamMemberUpdateSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54067' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['userId']);
    });
  });

  describe('ReqBodyTeamMemberUpdateSchema', () => {
    it('成功', () => {
      const result = ReqBodyTeamMemberUpdateSchema.safeParse({ role: 'admin' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTeamMemberUpdateSchema.safeParse({ role: 'invalid_role' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['role']);
    });
  });

  describe('ReqParamTeamMemberDeleteSchema', () => {
    it('成功', () => {
      const result = ReqParamTeamMemberDeleteSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54067',
        userId: '019a9c45-ac94-73a3-9aee-f61677d54068',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTeamMemberDeleteSchema.safeParse({ userId: '019a9c45-ac94-73a3-9aee-f61677d54067' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });
});
