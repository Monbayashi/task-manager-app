// schema.test.ts
import {
  emailSchema,
  endTimeSchema,
  passwordSchema,
  startTimeSchema,
  tagRefsSchema,
  taskDiscriptionSchema,
  taskStatusSchema,
  taskTitleSchema,
  teamNameSchema,
  teamRoleSchema,
  userNameSchema,
} from './common.schema';

describe('common.schema.spec.ts', () => {
  describe('email', () => {
    it('成功', () => {
      const result = emailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow('有効なEmailを入力してください');
      const result = emailSchema.safeParse('invalid-email');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('有効なEmailを入力してください');
    });
  });

  describe('passwordSchema', () => {
    it('成功', () => {
      const result = passwordSchema.safeParse('Abcdef1!');
      expect(result.success).toBe(true);
    });

    it('失敗: min', () => {
      const result = passwordSchema.safeParse('A1!a');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Passwordは8文字以上で入力してください');
    });

    it('失敗: 大文字', () => {
      const result = passwordSchema.safeParse('abcd123!');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('大文字 (A-Z) を最低 1 つ含めてください');
    });

    it('失敗: 小文字', () => {
      const result = passwordSchema.safeParse('ABC123!@');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('小文字 (a-z) を最低 1 つ含めてください');
    });

    it('失敗: 数値', () => {
      const result = passwordSchema.safeParse('Abcdef!!');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('数字 (0-9) を最低 1 つ含めてください');
    });

    it('失敗: 記号', () => {
      const result = passwordSchema.safeParse('Abcdef12');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('記号 (例: !@#$%) を最低 1 つ含めてください');
    });
  });

  describe('teamNameSchema', () => {
    it('成功', () => {
      const result = teamNameSchema.safeParse('チームA');
      expect(result.success).toBe(true);
    });

    it('失敗: min', () => {
      const result = teamNameSchema.safeParse('a');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チーム名は2文字以上で入力してください');
    });

    it('失敗: max', () => {
      const result = teamNameSchema.safeParse('a'.repeat(17));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チーム名は16文字以内で入力してください');
    });
  });

  describe('userNameSchema', () => {
    it('成功', () => {
      const result = userNameSchema.safeParse('田中');
      expect(result.success).toBe(true);
    });

    it('失敗: min', () => {
      const result = userNameSchema.safeParse('a');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザ名は2文字以上で入力してください');
    });
  });

  describe('teamRoleSchema', () => {
    it('成功', () => {
      const result = teamRoleSchema.safeParse('admin');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = teamRoleSchema.safeParse('err');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ロール値が不正です (admin / member)');
    });
  });

  describe('taskTitleSchema', () => {
    it('成功', () => {
      const result = taskTitleSchema.safeParse('タイトルABC');
      expect(result.success).toBe(true);
    });

    it('失敗: min', () => {
      const result = taskTitleSchema.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは1文字以上です');
    });

    it('失敗: max', () => {
      const result = taskTitleSchema.safeParse('a'.repeat(51));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは50文字までです');
    });

    it('失敗: 必須', () => {
      const result = taskTitleSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = taskTitleSchema.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは文字列で入力してください');
    });
  });

  describe('taskDiscriptionSchema', () => {
    it('成功', () => {
      const result = taskDiscriptionSchema.safeParse('説明テキスト');
      expect(result.success).toBe(true);
    });

    it('失敗: min', () => {
      const result = taskDiscriptionSchema.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は1文字以上です');
    });

    it('失敗: max', () => {
      const result = taskDiscriptionSchema.safeParse('a'.repeat(5001));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は5000文字までです');
    });

    it('失敗: 必須', () => {
      const result = taskDiscriptionSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = taskDiscriptionSchema.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は文字列で入力してください');
    });
  });

  describe('taskStatusSchema', () => {
    it('成功', () => {
      const result = taskStatusSchema.safeParse('doing');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = taskStatusSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ステータス値が不正です (todo / doing / done)');
    });
  });

  describe('tagRefsSchema', () => {
    it('成功', () => {
      const result = tagRefsSchema.safeParse(['019fa9c1-a111-7e00-8e77-f61677d54065']);
      expect(result.success).toBe(true);
    });

    it('失敗: uuid', () => {
      const result = tagRefsSchema.safeParse(['not-uuid']);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグIDは有効なID形式で入力してください');
    });
  });

  describe('startTimeSchema', () => {
    it('成功', () => {
      const result = startTimeSchema.safeParse('2025-01-10T10:00:00.000Z');
      expect(result.success).toBe(true);
    });

    it('失敗: iso', () => {
      const result = startTimeSchema.safeParse('2025-13-99');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('有効な日付（ISO 8601形式）を入力してください');
    });

    it('失敗: 必須', () => {
      const result = startTimeSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('開始日時は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = startTimeSchema.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('開始日時は文字列で入力してください');
    });
  });

  describe('endTimeSchema', () => {
    it('成功', () => {
      const result = endTimeSchema.safeParse('2025-01-10T10:00:00.000Z');
      expect(result.success).toBe(true);
    });

    it('失敗: iso', () => {
      const result = endTimeSchema.safeParse('invalid-date');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('有効な日付（ISO 8601形式）を入力してください');
    });

    it('失敗: 必須', () => {
      const result = endTimeSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('終了日時は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = endTimeSchema.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('終了日時は文字列で入力してください');
    });
  });
});
