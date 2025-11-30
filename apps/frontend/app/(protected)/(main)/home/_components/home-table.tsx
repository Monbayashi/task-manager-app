'use client';

import Link from 'next/link';
import { useTasksInfinite } from '@/api/tasks/useTasksInfinite';
import { TagStatus } from '@/components/ui/tag';
import { format } from 'date-fns';

type TableTasksData = Exclude<ReturnType<typeof useTasksInfinite>['data'], undefined>[number]['tasks'];

export const HomeTable = ({ tableData }: { tableData: TableTasksData }) => {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="min-w-full table-fixed divide-y-2 divide-gray-200 overflow-auto">
        <thead className="ltr:text-left rtl:text-right">
          <tr className="*:font-medium *:text-gray-900">
            <th className="w-28 min-w-28 px-3 py-2 text-center whitespace-nowrap">状態</th>
            <th className="px-3 py-2 text-center whitespace-nowrap">タイトル</th>
            <th className="w-40 min-w-40 px-3 py-2 text-center whitespace-nowrap">開始日時</th>
            <th className="w-40 min-w-40 px-3 py-2 text-center whitespace-nowrap">終了日時</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tableData.map((data) => (
            <tr key={data.taskId} className="*:text-gray-900 *:first:font-medium">
              <td className="px-3 py-2 text-center whitespace-nowrap">
                <div className="flex justify-center">
                  <TagStatus type={data.status} />
                </div>
              </td>
              <td className="px-3 py-2 text-left whitespace-nowrap">
                <Link
                  href={`/tasks/edit?teamId=${data.teamId}&taskId=${data.taskId}`}
                  className="-px-2 flex items-center rounded-md text-blue-800 ring-orange-400 outline-none hover:underline focus:ring-2"
                >
                  {data.title}
                </Link>
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                {format(new Date(data.startTime || new Date().getTime()), 'yyyy/MM/dd hh:mm')}
              </td>
              <td className="px-3 py-2 text-center whitespace-nowrap">
                {format(new Date(data.endTime || new Date().getTime()), 'yyyy/MM/dd hh:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
