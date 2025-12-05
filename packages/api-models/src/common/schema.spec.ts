import {
  commonRole,
  commonTaskStatus,
  commonStatusGroup,
  commonIndexType,
  commonSort,
  commonUserId,
  commonTeamId,
  commonTaskId,
  commonInviteId,
  commonTagId,
  commonTagRefs,
  commonStartTime,
  commonEndTime,
  commonFromTo,
  commonTeamName,
  commonUserName,
  commonTagName,
  commonTaskTitle,
  commonTaskDiscription,
  commonTagColor,
  commonTagBackendColor,
  commonEmail,
  commonToken,
} from './schema.ts';

describe('common/schema', () => {
  // HR: ------------------------------------------ ENUM系 ------------------------------------------
  describe('commonRole', () => {
    it('成功', () => {
      const result = commonRole.safeParse('admin');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonRole.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ロール値が不正です (admin / member)');
    });
  });

  describe('commonTaskStatus', () => {
    it('成功', () => {
      const result = commonTaskStatus.safeParse('todo');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonTaskStatus.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ステータス値が不正です (todo / doing / done)');
    });
  });

  describe('commonStatusGroup', () => {
    it('成功', () => {
      const result = commonStatusGroup.safeParse('todo_doing');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonStatusGroup.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'ステータスグループ値が不正です (todo / doing / done / todo_doing / doing_done / todo_done / all)'
      );
    });
  });

  describe('commonIndexType', () => {
    it('成功', () => {
      const result = commonIndexType.safeParse('start');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonIndexType.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('インデックスタイプ値が不正です (start / end)');
    });
  });

  describe('commonSort', () => {
    it('成功', () => {
      const result = commonSort.safeParse('asc');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonSort.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ソート値が不正です (asc / dasc)');
    });
  });

  // HR: ------------------------------------------ ID系 ------------------------------------------

  describe('commonUserId', () => {
    it('成功', () => {
      const result = commonUserId.safeParse('user123');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonUserId.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザIDは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonUserId.safeParse(1);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザIDは文字列で入力してください');
    });
  });

  describe('commonTeamId', () => {
    it('成功', () => {
      const result = commonTeamId.safeParse('019a9c45-ac94-73a3-9aee-f61677d54065');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonTeamId.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チームIDは有効なID形式で入力してください');
    });
  });

  describe('commonTaskId', () => {
    it('成功', () => {
      const result = commonTaskId.safeParse('019a9c45-ac94-73a3-9aee-f61677d54065');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonTaskId.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タスクIDは有効なID形式で入力してください');
    });
  });

  describe('commonInviteId', () => {
    it('成功', () => {
      const result = commonInviteId.safeParse('019a9c45-ac94-73a3-9aee-f61677d54065');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonInviteId.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('招待IDは有効なID形式で入力してください');
    });
  });

  describe('commonTagId', () => {
    it('成功', () => {
      const result = commonTagId.safeParse('019a9c45-ac94-73a3-9aee-f61677d54065');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonTagId.safeParse('xxx');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグIDは有効なID形式で入力してください');
    });
  });

  describe('commonTagRefs', () => {
    it('成功 配列', () => {
      const result = commonTagRefs.safeParse(['019a9c45-ac94-73a3-9aee-f61677d54065']);
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonTagRefs.safeParse(['xxx']);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグIDは有効なID形式で入力してください');
    });
  });

  // HR: ------------------------------------------ 日付系 ------------------------------------------

  describe('commonStartTime', () => {
    it('成功', () => {
      const result = commonStartTime.safeParse('2024-01-01T00.000Z');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonStartTime.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('開始日時は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonStartTime.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('開始日時は文字列で入力してください');
    });

    it('失敗: iso', () => {
      const result = commonStartTime.safeParse('invalid-date');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('有効な日付（ISO 8601形式）を入力してください');
    });
  });

  describe('commonEndTime', () => {
    it('成功', () => {
      const result = commonEndTime.safeParse('2024-01-01T00.000Z');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonEndTime.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('終了日時は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonEndTime.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('終了日時は文字列で入力してください');
    });

    it('失敗', () => {
      const result = commonEndTime.safeParse('invalid');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('有効な日付（ISO 8601形式）を入力してください');
    });
  });

  describe('commonFromTo', () => {
    it('成功', () => {
      const result = commonFromTo.safeParse('2025-12-01');
      expect(result.success).toBe(true);
    });

    it('失敗', () => {
      const result = commonFromTo.safeParse('2025/12/01');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('日付は YYYY-MM-DD 形式で指定してください');
    });
  });

  // HR: ------------------------------------------ 文字列系 ------------------------------------------

  describe('commonTeamName', () => {
    it('成功', () => {
      const result = commonTeamName.safeParse('チーム');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTeamName.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チーム名は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTeamName.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チーム名は文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTeamName.safeParse('あ');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('チーム名は2文字以上です');
    });
  });

  describe('commonUserName', () => {
    it('成功', () => {
      const result = commonUserName.safeParse('山田');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonUserName.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザ名は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonUserName.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザ名は文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonUserName.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('ユーザ名は2文字以上です');
    });
  });

  describe('commonTagName', () => {
    it('成功', () => {
      const result = commonTagName.safeParse('UI');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTagName.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグ名は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTagName.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグ名は文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTagName.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグー名は1文字以上です');
    });
  });

  describe('commonTaskTitle', () => {
    it('成功', () => {
      const result = commonTaskTitle.safeParse('タスクタイトル');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTaskTitle.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTaskTitle.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTaskTitle.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タイトルは1文字以上です');
    });
  });

  describe('commonTaskDiscription', () => {
    it('成功', () => {
      const result = commonTaskDiscription.safeParse('説明文');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTaskDiscription.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTaskDiscription.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTaskDiscription.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('説明は1文字以上です');
    });
  });

  describe('commonTagColor', () => {
    it('成功', () => {
      const result = commonTagColor.safeParse('#FF00FF');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTagColor.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグカラーは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTagColor.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグカラーは文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTagColor.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグカラーは1文字以上です');
    });
  });

  describe('commonTagBackendColor', () => {
    it('成功', () => {
      const result = commonTagBackendColor.safeParse('red');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonTagBackendColor.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグバックエンドカラーは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonTagBackendColor.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグバックエンドカラーは文字列で入力してください');
    });

    it('失敗: min', () => {
      const result = commonTagBackendColor.safeParse('');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('タグバックエンドカラーは1文字以上です');
    });
  });

  describe('commonEmail', () => {
    it('成功', () => {
      const result = commonEmail.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonEmail.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('メールアドレスは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonEmail.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('メールアドレスは文字列で入力してください');
    });

    it('失敗: email', () => {
      const result = commonEmail.safeParse('invalid-email');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('正しいメールアドレスを入力してください');
    });
  });

  describe('commonToken', () => {
    it('成功', () => {
      const result = commonToken.safeParse('a'.repeat(64));
      expect(result.success).toBe(true);
    });

    it('失敗: 必須', () => {
      const result = commonToken.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('トークンは必須項目です');
    });

    it('失敗: 文字列', () => {
      const result = commonToken.safeParse(123);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('トークンは文字列で入力してください');
    });

    it('失敗', () => {
      const result = commonToken.safeParse('a'.repeat(10));
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('トークンは64文字で指定してください');
    });
  });
});
