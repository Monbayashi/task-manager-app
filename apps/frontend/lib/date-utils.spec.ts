import { format } from 'date-fns';
import { getWeekRangeFromDate } from './date-utils';

describe('date-utilsのテスト', () => {
  it('渡した日付の週の範囲を取得できる (2025年1月1日)', () => {
    const date = new Date('2025-01-01');
    const weekInfo = getWeekRangeFromDate(date);
    expect(weekInfo.week).toBe(1);
    expect(format(weekInfo.start, 'yyyy-MM-dd')).toBe('2024-12-29');
    expect(format(weekInfo.end, 'yyyy-MM-dd')).toBe('2025-01-04');
  });

  it('渡した日付の週の範囲を取得できる (2025年11月30日)', () => {
    const date = new Date('2025-11-30');
    const weekInfo = getWeekRangeFromDate(date);
    expect(weekInfo.week).toBe(49);
    expect(format(weekInfo.start, 'yyyy-MM-dd')).toBe('2025-11-30');
    expect(format(weekInfo.end, 'yyyy-MM-dd')).toBe('2025-12-06');
  });
});
