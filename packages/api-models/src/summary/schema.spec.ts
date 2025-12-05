import { ReqQuerySummaryCountschema } from './schema.ts';

describe('summary/schema', () => {
  describe('ReqQuerySummaryCountschema', () => {
    it('成功', () => {
      const result = ReqQuerySummaryCountschema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqQuerySummaryCountschema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });
});
