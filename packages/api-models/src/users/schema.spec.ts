import { ReqBodyUsersRegisterSchema, ReqBodyUsersUpdateSchema } from './schema.ts';

describe('users/schema', () => {
  describe('ReqBodyUsersRegisterSchema', () => {
    it('成功', () => {
      const result = ReqBodyUsersRegisterSchema.safeParse({
        userName: '山田太郎',
        email: 'taro@example.com',
        teamName: 'テストチーム',
      });
      expect(result.success).toBe(true);
    });
    it('失敗', () => {
      const result = ReqBodyUsersRegisterSchema.safeParse({
        userName: '山田太郎',
        email: 'taro@example.com',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamName']);
    });
  });

  describe('ReqBodyUsersUpdateSchema', () => {
    it('成功', () => {
      const result = ReqBodyUsersUpdateSchema.safeParse({ userName: '新しい名前' });
      expect(result.success).toBe(true);
    });
    it('失敗', () => {
      const result = ReqBodyUsersUpdateSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['userName']);
    });
  });
});
