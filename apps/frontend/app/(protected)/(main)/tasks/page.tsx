'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { useTag } from '@/api/tags/useTag';
import { useTasksInfinite } from '@/api/tasks/useTasksInfinite';
import { AppButton } from '@/components/ui/button';
import { InputDateField } from '@/components/ui/input/input-data-field';
import { Selectbox } from '@/components/ui/selectbox';
import { Tag, TagStatus } from '@/components/ui/tag';
import { SearchTasksFormType, searchTasksFormSchema } from '@/lib/schemas/search-tasks-form.schema';
import { useTaskSearchStore } from '@/store/taskSearchStore';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { DeleteTasksDialog } from './_components/delete-tasks-dialog';

// pathParamからデータを取得して、パースする。
const safeParseTaskQuerySchema = (pathParams: ReadonlyURLSearchParams): SearchTasksFormType | null => {
  const paramStatusGroup = pathParams.get('statusGroup');
  const paramIndexType = pathParams.get('indexType');
  const paramSort = pathParams.get('sort');
  const paramFromDate = pathParams.get('fromDate');
  const paramToDate = pathParams.get('toDate');
  const parseParamData = searchTasksFormSchema.safeParse({
    statusGroup: paramStatusGroup,
    indexType: paramIndexType,
    sort: paramSort,
    fromDate: paramFromDate ?? undefined,
    toDate: paramToDate ?? undefined,
  });
  if (parseParamData.success) {
    return parseParamData.data;
  } else {
    return null;
  }
};

type ListType = Parameters<typeof Selectbox>['0']['itemList'];

const STATUS_GROUP_LIST: ListType = [
  { value: 'all', text: 'すべて', type: 'default' },
  { value: 'todo', text: '未着手', type: 'default' },
  { value: 'doing', text: '進行中', type: 'default' },
  { value: 'done', text: '完了', type: 'default' },
  { value: 'todo_doing', text: '未着手 or 進行中', type: 'default' },
  { value: 'doing_done', text: '進行中 or 完了', type: 'default' },
  { value: 'todo_done', text: '未着手 or 完了', type: 'default' },
];

const INDEX_TYPE_LIST: ListType = [
  { value: 'start', text: '開始日時', type: 'default' },
  { value: 'end', text: '終了日時', type: 'default' },
];

const SORT_LIST: ListType = [
  { value: 'asc', text: '昇順', type: 'default' },
  { value: 'dasc', text: '降順', type: 'default' },
];

/** タスク一覧ページ */
export default function TasksPage() {
  const router = useRouter();
  const pathParams = useSearchParams();
  const teamId = pathParams.get('teamId');
  const taskSearchParams = useTaskSearchStore((s) => s.params);
  const setparams = useTaskSearchStore((s) => s.setParams);
  // タグ
  const tagsDatas = useTag(teamId);
  // タスク一覧
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<SearchTasksFormType>({
    resolver: zodResolver(searchTasksFormSchema),
  });
  // 無限スクロール
  const { mutate, data, size, setSize, isValidating, isLoading } = useTasksInfinite(teamId, safeParseTaskQuerySchema(pathParams));
  const tasks = data?.flatMap((p) => p.tasks) ?? [];
  const hasNext = data?.[data.length - 1]?.nextToken != null;
  const onSubmit = async (submitData: SearchTasksFormType) => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('teamId', String(teamId));
      urlParams.append('statusGroup', String(submitData.statusGroup));
      urlParams.append('indexType', String(submitData.indexType));
      urlParams.append('sort', String(submitData.sort));
      if (submitData.fromDate) urlParams.append('fromDate', String(submitData.fromDate));
      if (submitData.toDate) urlParams.append('toDate', String(submitData.toDate));
      router.replace(`/tasks/?${urlParams.toString()}`);
    } catch (err) {
      console.error(err);
    }
  };

  // 削除処理
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionData, setActionData] = useState<{ teamId: string; taskId: string; title: string }>({ teamId: '', taskId: '', title: '' });
  const onDeleteOpen = (teamId: string, taskId: string, title: string) => {
    setActionData({ teamId, taskId, title });
    setIsDeleteOpen(true);
  };

  const onDeleteClose = () => {
    setActionData({ teamId: '', taskId: '', title: '' });
    setIsDeleteOpen(false);
  };

  const onClickNewPage = () => {
    router.push(`/tasks/new/?teamId=${teamId}`);
  };

  const onClickEditPage = (taskId: string) => {
    router.push(`/tasks/edit/?teamId=${teamId}&taskId=${taskId}`);
  };

  const onAfterDeleted = async () => {
    await mutate();
  };

  // 初期データ取得
  useEffect(() => {
    const initTriggerData = async () => {
      const parseParamData = safeParseTaskQuerySchema(pathParams);
      if (parseParamData) await mutate();
    };
    initTriggerData();
  }, [mutate, pathParams]);

  // 検索条件のデフォルトセット
  useEffect(() => {
    const parseParamData = safeParseTaskQuerySchema(pathParams);
    if (parseParamData) {
      reset({
        statusGroup: parseParamData.statusGroup,
        indexType: parseParamData.indexType,
        sort: parseParamData.sort,
        fromDate: parseParamData.fromDate,
        toDate: parseParamData.toDate,
      });
    }
  }, [pathParams, reset]);

  // URLリプレイス
  useEffect(() => {
    // pathParamsに検索条件が入ってなければ、ストアからのデータを設定する。
    const parseParamData = safeParseTaskQuerySchema(pathParams);
    if (!parseParamData) {
      const urlParams = new URLSearchParams();
      urlParams.append('teamId', String(teamId));
      urlParams.append('statusGroup', String(taskSearchParams.statusGroup));
      urlParams.append('indexType', String(taskSearchParams.indexType));
      urlParams.append('sort', String(taskSearchParams.sort));
      if (taskSearchParams.fromDate) urlParams.append('fromDate', String(taskSearchParams.fromDate));
      if (taskSearchParams.toDate) urlParams.append('toDate', String(taskSearchParams.toDate));
      router.replace(`/tasks/?${urlParams.toString()}`);
      return;
    }

    // Queryパラメータと検索条件ストアの差分チェック
    const deffrent: string[] = [];
    if (parseParamData.statusGroup !== taskSearchParams.statusGroup)
      deffrent.push(`statusGroup: ${parseParamData.statusGroup}:${taskSearchParams.statusGroup}`);
    if (parseParamData.indexType !== taskSearchParams.indexType)
      deffrent.push(`indexType: ${parseParamData.indexType}:${taskSearchParams.indexType}`);
    if (parseParamData.sort !== taskSearchParams.sort) deffrent.push(`sort: ${parseParamData.sort}:${taskSearchParams.sort}`);
    if (parseParamData.fromDate != taskSearchParams.fromDate) deffrent.push(`fromDate: ${parseParamData.fromDate}:${taskSearchParams.fromDate}`);
    if (parseParamData.toDate != taskSearchParams.toDate) deffrent.push(`toDate: ${parseParamData.toDate}:${taskSearchParams.toDate}`);
    // 差分がなければ早期リターン
    if (deffrent.length === 0) return;
    // 差分があればストアに設定
    setparams(parseParamData);
  }, [pathParams, router, setparams, taskSearchParams, teamId]);

  const searchedStatusGroup = STATUS_GROUP_LIST.find((val) => val.value === pathParams.get('statusGroup'));
  const searchedIndexType = INDEX_TYPE_LIST.find((val) => val.value === pathParams.get('indexType'));
  const searchedSort = SORT_LIST.find((val) => val.value === pathParams.get('sort'));
  const searchedFromTo = `${pathParams.get('fromDate') ?? ' '} ~ ${pathParams.get('toDate') ?? ' '}`;

  return (
    <>
      <div>
        <div className="p-4 md:p-6">
          <Disclosure as="div" className="rounded-md border border-gray-400 bg-gray-100 p-2 sm:p-4" defaultOpen={false}>
            <DisclosureButton className="group flex w-full items-center p-1 ring-orange-400 outline-none focus:ring-2">
              <span className="flex flex-wrap items-center justify-start gap-2 text-xs md:text-sm">
                <span className="flex items-center text-gray-800">
                  <MagnifyingGlassIcon className="size-4 md:size-5" />
                  <span className="text-sm md:text-base">検索条件:</span>
                </span>
                <span className="rounded-md bg-white p-1 ring ring-gray-400">ステータス: {searchedStatusGroup?.text}</span>
                <span className="rounded-md bg-white p-1 ring ring-gray-400">ソート対象: {searchedIndexType?.text}</span>
                <span className="rounded-md bg-white p-1 ring ring-gray-400">ソート: {searchedSort?.text}</span>
                <span className="rounded-md bg-white p-1 ring ring-gray-400">from～to: {searchedFromTo}</span>
              </span>
              <span className="grow" />
              <ChevronDownIcon className="size-8 fill-gray-800 group-data-open:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray-800">
              <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full rounded-md pr-6 sm:pr-12">
                <div className="flex flex-wrap gap-2 p-4 sm:gap-4 sm:p-6">
                  <Controller
                    control={control}
                    name="statusGroup"
                    render={({ field }) => (
                      <Selectbox
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label="ステータス"
                        description="タスクの絞り込みステータス"
                        error={errors.statusGroup?.message}
                        itemList={STATUS_GROUP_LIST}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="indexType"
                    render={({ field }) => (
                      <Selectbox
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label="ソート対象"
                        description="タスクのソート対象（開始日時 / 終了日時）"
                        error={errors.indexType?.message}
                        itemList={INDEX_TYPE_LIST}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="sort"
                    render={({ field }) => (
                      <Selectbox
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label="ソート"
                        description="タスクのソート対象（昇順 / 降順）"
                        error={errors.sort?.message}
                        itemList={SORT_LIST}
                      />
                    )}
                  />
                  <InputDateField<SearchTasksFormType>
                    label="from（開始日）"
                    description="タスクの絞り込み（から）"
                    type="date"
                    name="fromDate"
                    register={register}
                    error={errors.fromDate?.message}
                    placeholder="2025-01-01"
                  />
                  <InputDateField<SearchTasksFormType>
                    label="to（終了日）"
                    description="タスクの絞り込み（まで）"
                    type="date"
                    name="toDate"
                    register={register}
                    error={errors.toDate?.message}
                    placeholder="2025-12-31"
                  />
                </div>
                <div className="flex justify-end">
                  <AppButton type="submit" disabled={isSubmitting || isLoading} name="アカウントを作成">
                    <MagnifyingGlassIcon className="size-4 md:size-5" />
                    {isSubmitting || isLoading ? '・・・検索中' : '検索'}
                  </AppButton>
                </div>
              </form>
            </DisclosurePanel>
          </Disclosure>
        </div>
        <div className="px-4">
          <div className="flex items-center justify-between px-4 pb-1 md:px-9">
            <h2 className="text-gray-60 py-2 text-base font-bold md:text-lg">タスク一覧</h2>
            <AppButton type="button" disabled={false} name="新規登録" onClick={onClickNewPage}>
              <PlusIcon className="size-4 text-green-800 md:size-5" />
              新規登録
            </AppButton>
          </div>
          <hr className="border text-gray-200" />
          <div className="min-w-0 overflow-x-auto">
            <table className="min-w-full table-fixed divide-y-2 divide-gray-200 text-sm sm:text-base">
              <thead className="ltr:text-left rtl:text-right">
                <tr className="*:font-medium *:text-gray-900">
                  <th className="w-12 min-w-12 text-center sm:w-14 sm:min-w-14">操作</th>
                  <th className="w-28 min-w-28 px-3 py-2 text-center whitespace-nowrap">状態</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">タイトル</th>
                  <th className="w-40 min-w-40 px-3 py-2 text-center whitespace-nowrap">開始日時</th>
                  <th className="w-40 min-w-40 px-3 py-2 text-center whitespace-nowrap">終了日時</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">タグ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.taskId} className="*:text-gray-900 *:first:font-medium">
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <Menu>
                        <MenuButton
                          aria-label="操作メニューを開く"
                          className={clsx(
                            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-1 text-center text-sm font-semibold ring-orange-400 transition duration-100 outline-none sm:text-base',
                            'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 focus:border-orange-400 focus:ring-2 active:bg-gray-200 disabled:bg-gray-200'
                          )}
                        >
                          <EllipsisVerticalIcon className="size-5 fill-gray-600 sm:size-6" />
                        </MenuButton>
                        <MenuItems
                          transition
                          anchor="bottom start"
                          className="origin-top-right rounded-xl border border-gray-400 bg-white p-1 text-sm text-gray-800 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                        >
                          <MenuItem>
                            <button
                              type="button"
                              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                              onClick={() => onClickEditPage(task.taskId)}
                            >
                              <PencilIcon className="size-4 fill-green-900" />
                              <span>編集</span>
                            </button>
                          </MenuItem>
                          <div className="my-1 h-px bg-gray-400" />
                          <MenuItem>
                            <button
                              type="button"
                              className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                              onClick={() => onDeleteOpen(task.teamId, task.taskId, task.title)}
                            >
                              <TrashIcon className="size-4 fill-red-900" />
                              <span>削除</span>
                            </button>
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex justify-center">
                        <TagStatus type={task.status} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-left whitespace-nowrap">
                      <Link
                        href={`/tasks/edit/?teamId=${task.teamId}&taskId=${task.taskId}`}
                        className="-px-2 flex items-center rounded-md text-blue-800 ring-orange-400 outline-none hover:underline focus:ring-2"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {format(new Date(task.startTime || new Date().getTime()), 'yyyy/MM/dd hh:mm')}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {format(new Date(task.endTime || new Date().getTime()), 'yyyy/MM/dd hh:mm')}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex gap-1">
                        {tagsDatas.data?.tags
                          .filter((tag) => task.tagRefs.includes(tag.tagId))
                          .map((val) => (
                            <Tag key={val.tagId} tagName={val.tagName} tagColor={val.tagColor} />
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-8 px-8">
            {hasNext && (
              <button
                type="button"
                disabled={isLoading && isValidating}
                onClick={() => setSize(size + 1)}
                className={clsx(
                  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-8 py-3 text-center text-sm font-semibold ring-orange-400 transition duration-100 outline-none focus:border-orange-400 focus:ring-2 sm:text-base',
                  'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-200'
                )}
              >
                もっと見る
              </button>
            )}
          </div>
        </div>
      </div>
      {/* タスク系 ダイアログ */}
      {teamId && <DeleteTasksDialog actionData={actionData} isOpen={isDeleteOpen} onClose={onDeleteClose} onAfterDeleted={onAfterDeleted} />}
    </>
  );
}
