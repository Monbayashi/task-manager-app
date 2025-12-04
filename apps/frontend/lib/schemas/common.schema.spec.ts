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
  describe('成功', () => {
    it('valid email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('失敗', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow('有効なEmailを入力してください');
    });
  });

  describe('passwordSchema', () => {
    it('成功', () => {
      const pw = 'Abcdef1!';
      expect(passwordSchema.parse(pw)).toBe(pw);
    });

    it('失敗: min', () => {
      expect(() => passwordSchema.parse('A1!a')).toThrow('Passwordは8文字以上で入力してください');
    });

    it('失敗: 大文字', () => {
      expect(() => passwordSchema.parse('abcd123!')).toThrow('大文字 (A-Z) を最低 1 つ含めてください');
    });

    it('失敗: 小文字', () => {
      expect(() => passwordSchema.parse('ABC123!@')).toThrow('小文字 (a-z) を最低 1 つ含めてください');
    });

    it('失敗: 数値', () => {
      expect(() => passwordSchema.parse('Abcdef!!')).toThrow('数字 (0-9) を最低 1 つ含めてください');
    });

    it('失敗: 記号', () => {
      expect(() => passwordSchema.parse('Abcdef12')).toThrow('記号 (例: !@#$%) を最低 1 つ含めてください');
    });
  });

  describe('teamNameSchema', () => {
    it('成功', () => {
      expect(teamNameSchema.parse('チームA')).toBe('チームA');
    });

    it('失敗: min', () => {
      expect(() => teamNameSchema.parse('a')).toThrow('チーム名は2文字以上で入力してください');
    });

    it('失敗: max', () => {
      expect(() => teamNameSchema.parse('a'.repeat(17))).toThrow('チーム名は16文字以内で入力してください');
    });
  });

  describe('userNameSchema', () => {
    it('成功', () => {
      expect(userNameSchema.parse('田中')).toBe('田中');
    });

    it('失敗: min', () => {
      expect(() => userNameSchema.parse('a')).toThrow('ユーザ名は2文字以上で入力してください');
    });
  });

  describe('teamRoleSchema', () => {
    it('成功', () => {
      expect(teamRoleSchema.parse('admin')).toBe('admin');
    });

    it('失敗', () => {
      expect(() => teamRoleSchema.parse('owner')).toThrow('ロール値が不正です (admin / member)');
    });
  });

  describe('taskTitleSchema', () => {
    it('成功', () => {
      expect(taskTitleSchema.parse('タイトルABC')).toBe('タイトルABC');
    });

    it('失敗: min', () => {
      expect(() => taskTitleSchema.parse('')).toThrow('タイトルは1文字以上です');
    });

    it('失敗: max', () => {
      expect(() => taskTitleSchema.parse('a'.repeat(51))).toThrow('タイトルは50文字までです');
    });

    it('失敗: undefined', () => {
      expect(() => taskTitleSchema.parse(undefined)).toThrow('タイトルは必須項目です');
    });
  });

  describe('taskDiscriptionSchema', () => {
    it('成功', () => {
      expect(taskDiscriptionSchema.parse('説明テキスト')).toBe('説明テキスト');
    });

    it('失敗: min', () => {
      expect(() => taskDiscriptionSchema.parse('')).toThrow('説明は1文字以上です');
    });

    it('失敗: max', () => {
      expect(() => taskDiscriptionSchema.parse('a'.repeat(5001))).toThrow('説明は5000文字までです');
    });
  });

  describe('taskStatusSchema', () => {
    it('成功', () => {
      expect(taskStatusSchema.parse('doing')).toBe('doing');
    });

    it('失敗', () => {
      expect(() => taskStatusSchema.parse('unknown')).toThrow('ステータス値が不正です (todo / doing / done)');
    });
  });

  describe('tagRefsSchema', () => {
    it('成功', () => {
      const arr = ['019fa9c1-a111-7e00-8e77-f61677d54065'];
      expect(tagRefsSchema.parse(arr)).toEqual(arr);
    });

    it('失敗: uuid', () => {
      expect(() => tagRefsSchema.parse(['not-uuid'])).toThrow('タグIDは有効なID形式で入力してください');
    });
  });

  describe('startTimeSchema', () => {
    it('成功', () => {
      const date = '2025-01-10T10:00:00.000Z';
      expect(startTimeSchema.parse(date)).toBe(date);
    });

    it('失敗: iso', () => {
      expect(() => startTimeSchema.parse('2025-13-99')).toThrow('有効な日付（ISO 8601形式）を入力してください');
    });
  });

  describe('endTimeSchema', () => {
    it('成功', () => {
      const date = '2025-01-10T10:00:00.000Z';
      expect(endTimeSchema.parse(date)).toBe(date);
    });

    it('失敗: iso', () => {
      expect(() => endTimeSchema.parse('invalid-date')).toThrow('有効な日付（ISO 8601形式）を入力してください');
    });
  });
});
