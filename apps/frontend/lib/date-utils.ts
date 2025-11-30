import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/** 渡した日付の週の範囲を取得 */
export const getWeekRangeFromDate = (date: Date): { week: number; start: Date; end: Date } => {
  const year = date.getFullYear();
  // 週番号 (日曜始まり)
  // NOTE: ISO週番号（国際標準）は format(date, "I")で月曜始まりらしい。タスク管理APPでどちらにするか不明
  const week = Number(format(date, 'w'));
  // 1月1日（UTC）
  const base = new Date(Date.UTC(year, 0, 1));
  // 第1週開始（日曜）
  const firstSunday = new Date(base);
  firstSunday.setUTCDate(base.getUTCDate() - base.getUTCDay());
  // 指定週の開始
  const start = new Date(firstSunday);
  start.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7);
  // 指定週の終了
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { week, start, end };
};
