import {
  ReqParamTasksSchema,
  ReqQueryTasksSchema,
  ReqParamTasksRegisterSchema,
  ReqBodyTasksRegisterSchema,
  ReqParamTasksTaskSchema,
  ReqParamTasksUpdateSchema,
  ReqBodyTasksUpdateSchema,
  ReqParamTasksDeleteSchema,
} from './schema.ts';

describe('tasks/schema', () => {
  describe('成功', () => {
    it('teamId が正しい場合に成功する', () => {
      const result = ReqParamTasksSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTasksSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqQueryTasksSchema', () => {
    it('成功', () => {
      const result = ReqQueryTasksSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqQueryTasksSchema.safeParse({
        fromDate: '2025-01-10',
        toDate: '2025-01-05',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['fromDate']);
    });
  });

  describe('ReqParamTasksRegisterSchema', () => {
    it('成功', () => {
      const result = ReqParamTasksRegisterSchema.safeParse({ teamId: '019a9c45-ac94-73a3-9aee-f61677d54065' });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTasksRegisterSchema.safeParse({ teamId: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyTasksRegisterSchema', () => {
    it('成功', () => {
      const result = ReqBodyTasksRegisterSchema.safeParse({
        title: 'タイトル',
        discription: '説明文',
        status: 'todo',
        tagRefs: ['019a9c45-ac94-73a3-9aee-f61677d54067'],
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-02T10:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTasksRegisterSchema.safeParse({
        title: 'タイトル',
        discription: '説明',
        status: 'todo',
        tagRefs: ['019a9c45-ac94-73a3-9aee-f61677d54067'],
        startTime: '2025-01-03T10:00:00Z',
        endTime: '2025-01-02T10:00:00Z',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['startTime']);
    });
  });

  describe('ReqParamTasksTaskSchema', () => {
    it('成功', () => {
      const result = ReqParamTasksTaskSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        taskId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTasksTaskSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        taskId: '',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['taskId']);
    });
  });

  describe('ReqParamTasksUpdateSchema', () => {
    it('成功', () => {
      const result = ReqParamTasksUpdateSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        taskId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTasksUpdateSchema.safeParse({
        teamId: '',
        taskId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['teamId']);
    });
  });

  describe('ReqBodyTasksUpdateSchema', () => {
    it('成功', () => {
      const result = ReqBodyTasksUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqBodyTasksUpdateSchema.safeParse({
        startTime: '2025-01-03T10:00:00Z',
        endTime: '2025-01-02T10:00:00Z',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['startTime']);
    });
  });

  describe('ReqParamTasksDeleteSchema', () => {
    it('成功', () => {
      const result = ReqParamTasksDeleteSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        taskId: '019a9c45-ac94-73a3-9aee-f61677d54066',
      });
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = ReqParamTasksDeleteSchema.safeParse({
        teamId: '019a9c45-ac94-73a3-9aee-f61677d54065',
        taskId: '',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual(['taskId']);
    });
  });
});
