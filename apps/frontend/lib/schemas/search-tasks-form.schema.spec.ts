import { indexType, searchTasksFormSchema, sort, statusGroup } from './search-tasks-form.schema';

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

  describe('statusGroup', () => {
    it('成功', () => {
      const result = statusGroup.safeParse('todo_doing');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = statusGroup.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'ステータスグループ値が不正です (todo / doing / done / todo_doing / doing_done / todo_done / all)'
      );
    });
  });

  describe('indexType', () => {
    it('成功', () => {
      const result = indexType.safeParse('start');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = indexType.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('インデックスタイプ値が不正です (start / end)');
    });
  });

  describe('sort', () => {
    it('成功', () => {
      const result = sort.safeParse('asc');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = sort.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ソート値が不正です (asc / dasc)');
    });
  });
});
