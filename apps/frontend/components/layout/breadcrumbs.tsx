'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/user';
import {
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  HomeIcon,
  PencilSquareIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const REPLACE_TEAMID = ':teamId';
const REPLACE_TASKID = ':taskId';
const TEAM_HOME_PAGE = { Icon: HomeIcon, title: 'ホーム', href: `/home/?teamId=${REPLACE_TEAMID}` } as const;
const TEAM_TASK_PAGE = { Icon: ClipboardDocumentIcon, title: 'タスク管理', href: `/tasks/?teamId=${REPLACE_TEAMID}` } as const;
const TEAM_TASK_NEW_PAGE = { Icon: PlusCircleIcon, title: 'タスク登録', href: `/tasks/new/?teamId=${REPLACE_TEAMID}` } as const;
const TEAM_TASK_EDIT_PAGE = {
  Icon: PencilSquareIcon,
  title: 'タスク詳細',
  href: `/tasks/edit/?teamId=${REPLACE_TEAMID}&taskId=${REPLACE_TASKID}`,
} as const;
const TEAM_SETTING_PAGE = { Icon: Cog6ToothIcon, title: 'チーム設定', href: `/settings/?teamId=${REPLACE_TEAMID}` } as const;

const BREADCRUMBS_LIST = {
  '/home/': [TEAM_HOME_PAGE],
  '/tasks/': [TEAM_TASK_PAGE],
  '/tasks/new/': [TEAM_TASK_PAGE, TEAM_TASK_NEW_PAGE],
  '/tasks/edit/': [TEAM_TASK_PAGE, TEAM_TASK_EDIT_PAGE],
  '/settings/': [TEAM_SETTING_PAGE],
} as const;

const isBreadcrumbKey = (path: string): path is keyof typeof BREADCRUMBS_LIST => {
  return path in BREADCRUMBS_LIST;
};

const getBreadcrumbsList = (pathName: string) => {
  if (isBreadcrumbKey(pathName)) {
    return BREADCRUMBS_LIST[pathName];
  }
  return [];
};

/** パンくずリスト */
export const Breadcrumbs = () => {
  const pathName = usePathname();
  const pathParams = useSearchParams();
  const userData = useUserStore((s) => s.user);

  // チームID
  const teamId = pathParams.get('teamId');
  // タスクID
  const taskId = pathParams.get('taskId');
  // 選択チーム
  const teams = userData?.teams || [];
  const selectedTeam = teams.find((team) => team.teamId === teamId);
  // パンくずリスト
  const breadcrumbsList = getBreadcrumbsList(pathName);

  return (
    <div className="mt-16 h-14 bg-gray-100 lg:mt-0 lg:h-16">
      <div className="flex h-full items-center overflow-x-auto overflow-y-hidden px-3 py-4 whitespace-nowrap md:px-6">
        <span className="-px-2 flex items-center text-gray-800">
          <ClipboardDocumentCheckIcon className="size-5 md:size-6" />
          <span className="mx-2 text-base md:text-lg">{selectedTeam?.name}</span>
        </span>
        {breadcrumbsList.map((item, index) => {
          const href = item.href.replace(REPLACE_TEAMID, teamId || '').replace(REPLACE_TASKID, taskId || '');
          const isLast = index === breadcrumbsList.length - 1;
          return (
            <React.Fragment key={item.href}>
              <span className="mx-3 text-gray-800 md:mx-5">
                <ChevronRightIcon className="size-3" />
              </span>
              {isLast ? (
                <span className={clsx('-px-2 flex items-center rounded-md text-gray-800 ring-orange-400 outline-none')}>
                  <item.Icon className="size-5 md:size-6" />
                  <span className="mx-2 text-base md:text-lg">{item.title}</span>
                </span>
              ) : (
                <Link
                  href={href}
                  className={clsx('-px-2 flex items-center rounded-md text-blue-800 ring-orange-400 outline-none hover:underline focus:ring-2')}
                >
                  <item.Icon className="size-5 md:size-6" />
                  <span className="mx-2 text-base md:text-lg">{item.title}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
