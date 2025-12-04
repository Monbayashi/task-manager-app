import { searchTasksFormSchema } from './search-tasks-form.schema';

describe('searchTasksFormSchema', () => {
  it('成功', () => {
    const data = {
      statusGroup: 'todo',
      indexType: 'start',
      fromDate: '2025-01-01',
      toDate: '2025-01-10',
      sort: 'asc',
    };
    const result = searchTasksFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = {
      statusGroup: 'todo',
      indexType: 'start',
      fromDate: '2024-01-10',
      toDate: '2024-01-01',
      sort: 'asc',
    };
    const result = searchTasksFormSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['fromDate']);
    expect(result.error?.issues[0]?.message).toBe('from は to 以下である必要があります。');
  });
});
