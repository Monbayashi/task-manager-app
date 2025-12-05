import {
  ReqParamTagsSchema,
  ReqParamTagsRegisterSchema,
  ReqParamTagsUpdateSchema,
  ReqParamTagsDeleteSchema,
  ReqBodyTagsRegisterSchema,
  ReqBodyTagsUpdateSchema,
} from './schema.ts';

describe('tags/schema', () => {
  describe('ReqParamTagsSchema', () => {
    it('成功', () => {
      const result = ReqParamTagsSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });
    it('失敗', () => {
      const result = ReqParamTagsSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqParamTagsRegisterSchema', () => {
    it('成功', () => {
      const result = ReqParamTagsRegisterSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });
    it('失敗', () => {
      const result = ReqParamTagsRegisterSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyTagsRegisterSchema', () => {
    it('成功', () => {
      const result = ReqBodyTagsRegisterSchema.safeParse({
        tagName: 'テストタグ',
        tagColor: { color: '#fff', backgroundColor: '#000' },
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTagsRegisterSchema.safeParse({
        tagName: '',
        tagColor: { color: '#fff', backgroundColor: '#000' },
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['tagName']);
    });
  });

  describe('ReqBodyTagsUpdateSchema', () => {
    it('成功', () => {
      const result = ReqBodyTagsUpdateSchema.safeParse({
        tagName: 'テストタグ',
        tagColor: { color: '#fff', backgroundColor: '#000' },
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTagsUpdateSchema.safeParse({
        tagName: '',
        tagColor: { color: '#fff', backgroundColor: '#000' },
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['tagName']);
    });
  });

  describe('ReqParamTagsDeleteSchema', () => {
    it('成功', () => {
      const result = ReqParamTagsDeleteSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        tagId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTagsDeleteSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065', tagId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['tagId']);
    });
  });

  describe('ReqParamTagsUpdateSchema', () => {
    it('成功', () => {
      const result = ReqParamTagsUpdateSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        tagId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTagsUpdateSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065', tagId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['tagId']);
    });
  });
});
