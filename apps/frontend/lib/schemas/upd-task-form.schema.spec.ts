import {
  updTaskDateTimeFormSchema,
  updTaskDiscriptionFormSchema,
  updTaskStatusFormSchema,
  updTaskTagRefsFormSchema,
  updTaskTitleFormSchema,
} from './upd-task-form.schema';

describe('updTaskTitleFormSchema', () => {
  it('成功', () => {
    const data = { title: 'タイトル' };
    const result = updTaskTitleFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const data = { title: '' };
    const result = updTaskTitleFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['title']);
  });
});

describe('updTaskDiscriptionFormSchema', () => {
  it('成功', () => {
    const data = { discription: 'タスクの説明' };
    const result = updTaskDiscriptionFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const data = { discription: '' };
    const result = updTaskDiscriptionFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['discription']);
  });
});

describe('updTaskStatusFormSchema', () => {
  it('成功', () => {
    const data = { status: 'doing' };
    const result = updTaskStatusFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const data = { status: 'error' };
    const result = updTaskStatusFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['status']);
  });
});

describe('updTaskDateTimeFormSchema', () => {
  it('成功', () => {
    const data = {
      startTime: '2025-01-01T10:00:00.000Z',
      endTime: '2025-01-01T12:00:00.000Z',
    };
    const result = updTaskDateTimeFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const data = {
      startTime: '2025-01-01T15:00:00.000Z',
      endTime: '2025-01-01T12:00:00.000Z',
    };
    const result = updTaskDateTimeFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['startTime']);
  });
});

describe('updTaskTagRefsFormSchema', () => {
  it('成功', () => {
    const data = {
      tagRefs: ['019a9c45-ac94-73a3-9aee-f61677d54065'],
    };
    const result = updTaskTagRefsFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  it('失敗', () => {
    const data = {
      tagRefs: ['invalid-uuid'],
    };
    const result = updTaskTagRefsFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['tagRefs', 0]);
  });
});
