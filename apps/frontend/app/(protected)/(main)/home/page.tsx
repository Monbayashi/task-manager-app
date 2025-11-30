'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSummaryCounts } from '@/api/summary/useTasksCount';
import { useTasksInfinite } from '@/api/tasks/useTasksInfinite';
import { TaskStatusDonutChart } from '@/components/ui/task-chart';
import { getWeekRangeFromDate } from '@/lib/date-utils';
import { formatInTimeZone } from 'date-fns-tz';
import { HomeCard } from './_components/home-card';
import { HomeTable } from './_components/home-table';

/** 遅延タスク用URLを作成 */
const createDelayURL = (
  teamId: string,
  condition: { statusGroup: 'todo' | 'todo_doing'; indexType: 'start' | 'end'; sort: 'asc' | 'dasc'; toDate: string }
) => {
  const urlParams = new URLSearchParams();
  urlParams.append('teamId', String(teamId));
  urlParams.append('statusGroup', String(condition.statusGroup));
  urlParams.append('indexType', String(condition.indexType));
  urlParams.append('sort', String(condition.sort));
  urlParams.append('toDate', String(condition.toDate));
  return `/tasks?${urlParams.toString()}`;
};

/** ホーム画面 */
export default function HomePage() {
  const pathParams = useSearchParams();
  const teamId = pathParams.get('teamId');
  const now = new Date();
  const formatNow = formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM-dd');
  const formatNowWeek = formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-wo');
  const formatMonth = formatInTimeZone(now, 'Asia/Tokyo', 'yyyy-MM');
  // ステータス件数
  const { data: summaryData } = useSummaryCounts(teamId);
  const statusAll = summaryData?.all ?? { todo: 0, doing: 0, done: 0 };
  const statusToday = summaryData?.daily.find((data) => formatNow === data.date) ?? { todo: 0, doing: 0, done: 0 };
  const statusWeek = summaryData?.daily
    .filter((data) => formatNowWeek === formatInTimeZone(new Date(data.date), 'Asia/Tokyo', 'yyyy-wo'))
    .reduce((acc, val) => ({ todo: acc.todo + val.todo, doing: acc.doing + val.doing, done: acc.done + val.done }), {
      todo: 0,
      doing: 0,
      done: 0,
    }) ?? { todo: 0, doing: 0, done: 0 };
  const statusMonth = summaryData?.daily
    .filter((data) => data.date.startsWith(formatMonth))
    .reduce((acc, val) => ({ todo: acc.todo + val.todo, doing: acc.doing + val.doing, done: acc.done + val.done }), {
      todo: 0,
      doing: 0,
      done: 0,
    }) ?? { todo: 0, doing: 0, done: 0 };
  const todayFormat = formatInTimeZone(now, 'Asia/Tokyo', 'yyyy年MM月dd日');
  const weekInfo = getWeekRangeFromDate(now);
  const weekFormat = `${formatInTimeZone(weekInfo.end, 'Asia/Tokyo', 'yyyy年MM月dd日')} ~ ${formatInTimeZone(weekInfo.start, 'Asia/Tokyo', 'MM月dd日')}`;
  const monthFormat = formatInTimeZone(now, 'Asia/Tokyo', 'yyyy年MM月');
  // タスク一覧 (開始日遅延タスク, 終了日遅延タスク)
  const strCondition = { statusGroup: 'todo', indexType: 'start', sort: 'asc', toDate: formatNow } as const;
  const endCondition = { statusGroup: 'todo_doing', indexType: 'end', sort: 'asc', toDate: formatNow } as const;
  const { data: startDelayTasksData } = useTasksInfinite(teamId, strCondition);
  const { data: endDelayTasskData } = useTasksInfinite(teamId, endCondition);
  const startDelayTasks = startDelayTasksData?.flatMap((p) => p.tasks) ?? [];
  const endDelayTasks = endDelayTasskData?.flatMap((p) => p.tasks) ?? [];
  const startDelayLink = teamId ? createDelayURL(teamId, strCondition) : '';
  const endDelayLink = teamId ? createDelayURL(teamId, endCondition) : '';

  return (
    <div className="px-2 2xl:px-24">
      <div className="w-full p-2">
        <h2 className="py-4 pl-6 text-xl font-bold text-gray-600">ステータス件数</h2>
        <hr className="text-gray-400" />
        <div className="flex flex-wrap gap-4 p-4 xl:gap-8">
          <HomeCard title="ステータス 件数 - すべて">
            {statusAll && (
              <TaskStatusDonutChart
                statusList={[
                  { label: 'todo', value: Math.max(0, statusAll.todo) },
                  { label: 'doing', value: Math.max(0, statusAll.doing) },
                  { label: 'done', value: Math.max(0, statusAll.done) },
                ]}
              />
            )}
          </HomeCard>
          <HomeCard title="ステータス 件数 - 今日" description={todayFormat}>
            {statusToday && (
              <TaskStatusDonutChart
                statusList={[
                  { label: 'todo', value: Math.max(0, statusToday.todo) },
                  { label: 'doing', value: Math.max(0, statusToday.doing) },
                  { label: 'done', value: Math.max(0, statusToday.done) },
                ]}
              />
            )}
          </HomeCard>
          <HomeCard title="ステータス 件数 - 今週" description={weekFormat}>
            {statusWeek && (
              <TaskStatusDonutChart
                statusList={[
                  { label: 'todo', value: Math.max(0, statusWeek.todo) },
                  { label: 'doing', value: Math.max(0, statusWeek.doing) },
                  { label: 'done', value: Math.max(0, statusWeek.done) },
                ]}
              />
            )}
          </HomeCard>
          <HomeCard title="ステータス 件数 - 今月" description={monthFormat}>
            {statusMonth && (
              <TaskStatusDonutChart
                statusList={[
                  { label: 'todo', value: Math.max(0, statusMonth.todo) },
                  { label: 'doing', value: Math.max(0, statusMonth.doing) },
                  { label: 'done', value: Math.max(0, statusMonth.done) },
                ]}
              />
            )}
          </HomeCard>
        </div>
      </div>
      <div className="my-5 w-full p-2">
        <div className="flex items-end justify-between">
          <h2 className="py-4 pl-6 text-xl font-bold text-gray-600">開始日遅延タスク</h2>
          <Link
            href={startDelayLink}
            className="-px-2 flex items-center rounded-md text-blue-800 ring-orange-400 outline-none hover:underline focus:ring-2"
          >
            一覧画面に遷移
          </Link>
        </div>
        <hr className="text-gray-400" />
        <HomeTable tableData={startDelayTasks} />
      </div>
      <div className="my-5 w-full p-2">
        <div className="flex items-end justify-between">
          <h2 className="py-4 pl-6 text-xl font-bold text-gray-600">終了日遅延タスク</h2>
          <Link
            href={endDelayLink}
            className="-px-2 flex items-center rounded-md text-blue-800 ring-orange-400 outline-none hover:underline focus:ring-2"
          >
            一覧画面に遷移
          </Link>
        </div>
        <hr className="text-gray-400" />
        <HomeTable tableData={endDelayTasks} />
      </div>
    </div>
  );
}
