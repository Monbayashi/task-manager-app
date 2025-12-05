import { newTaskFormSchema } from './new-task-form.schema';

describe('newTaskFormSchema', () => {
  it('成功', () => {
    const data = {
      title: 'タスクA',
      discription: '説明A',
      status: 'todo',
      tagRefs: ['019a9c45-ac94-73a3-9aee-f61677d54065'],
      startTime: '2025-01-01T10:00:00.000Z',
      endTime: '2025-01-01T11:00:00.000Z',
    };

    const result = newTaskFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('失敗', () => {
    const data = {
      title: 'タスクA',
      discription: '説明A',
      status: 'todo',
      tagRefs: ['019a9c45-ac94-73a3-9aee-f61677d54065'],
      startTime: '2025-01-01T12:00:00.000Z', // 終了より後
      endTime: '2025-01-01T11:00:00.000Z',
    };

    const result = newTaskFormSchema.safeParse(data);
    expect(result.success).toBe(false);

    // refine で指定したエラーが返ってくるか確認
    expect(result.error?.issues[0]?.path).toEqual(['startTime']);
  });
});
