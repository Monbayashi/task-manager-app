'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTag } from '@/api/tags/useTag';
import { useTask } from '@/api/tasks/useTask';
import { useUpdateTask } from '@/api/tasks/useUpdateTask';
import { InputDateField } from '@/components/ui/input/input-data-field';
import { InputField } from '@/components/ui/input/input-field';
import { Selectbox } from '@/components/ui/selectbox';
import { Tag, TagStatus } from '@/components/ui/tag';
import {
  UpdTaskDateTimeFormType,
  UpdTaskDiscriptionFormType,
  UpdTaskStatusFormType,
  UpdTaskTagRefsFormType,
  UpdTaskTitleFormType,
  updTaskDateTimeFormSchema,
  updTaskDiscriptionFormSchema,
  updTaskStatusFormSchema,
  updTaskTagRefsFormSchema,
  updTaskTitleFormSchema,
} from '@/lib/schemas/upd-task-form.schema';
import { useAlertStore } from '@/store/alert';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CheckIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Controller, useForm } from 'react-hook-form';
import { DeleteTasksDialog } from '../_components/delete-tasks-dialog';

// SSR を無効化して MDEditor を読み込む
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

/** タスク更新ページ */
export default function TasksEditPage() {
  const router = useRouter();
  const pathParams = useSearchParams();
  const teamId = pathParams.get('teamId');
  const taskId = pathParams.get('taskId');
  const addAlert = useAlertStore((state) => state.addAlert);
  // タスク系
  const taskData = useTask(teamId, taskId);
  const { trigger, isMutating } = useUpdateTask(teamId, taskId);
  // タグ系
  const tagsDatas = useTag(teamId);
  // 個別更新 - (タイトル)
  const {
    register: titleRegister,
    handleSubmit: titleHandleSubmit,
    formState: { errors: titleErrors },
    reset: titleReset,
  } = useForm<UpdTaskTitleFormType>({
    resolver: zodResolver(updTaskTitleFormSchema),
  });
  const [isTitleEdit, setIsTitleEdit] = useState(false);
  const onSubmitTitle = async (submitData: UpdTaskTitleFormType) => {
    await trigger(submitData);
    setIsTitleEdit(false);
    addAlert('タスクタイトルの更新に成功', 'success', 5000);
  };
  // 個別更新 - (ステータス)
  const {
    handleSubmit: statusHandleSubmit,
    formState: { errors: statusErrors },
    reset: statusReset,
    control: statusControl,
  } = useForm<UpdTaskStatusFormType>({
    resolver: zodResolver(updTaskStatusFormSchema),
  });
  const [isStatusEdit, setIsStatusEdit] = useState(false);
  const onSubmitStatus = async (submitData: UpdTaskStatusFormType) => {
    await trigger(submitData);
    setIsStatusEdit(false);
    addAlert('タスクステータスの更新に成功', 'success', 5000);
  };
  // 個別登録 - (開始日時 ~ 終了日時)
  const {
    register: timeRegister,
    handleSubmit: timeHandleSubmit,
    formState: { errors: timeErrors },
    reset: timeReset,
  } = useForm<UpdTaskDateTimeFormType>({
    resolver: zodResolver(updTaskDateTimeFormSchema),
  });
  const [isTimeEdit, setIsTimeEdit] = useState(false);
  const onSubmitTime = async (submitData: UpdTaskDateTimeFormType) => {
    await trigger(submitData);
    setIsTimeEdit(false);
    addAlert('タスク開始、終了日時の更新に成功', 'success', 5000);
  };
  // 個別登録 - (説明)
  const {
    handleSubmit: discriptionHandleSubmit,
    formState: { errors: discriptionErrors },
    reset: discriptionReset,
    control: discriptionControl,
  } = useForm<UpdTaskDiscriptionFormType>({
    resolver: zodResolver(updTaskDiscriptionFormSchema),
  });
  const [isDiscriptionEdit, setIsDiscriptionEdit] = useState(false);
  const onSubmitDiscription = async (submitData: UpdTaskDiscriptionFormType) => {
    await trigger(submitData);
    setIsDiscriptionEdit(false);
    addAlert('タスク説明の更新に成功', 'success', 5000);
  };
  // 個別登録 - (タグ)
  const {
    handleSubmit: tagsHandleSubmit,
    formState: { errors: tagsErrors },
    reset: tagsReset,
    control: tagsControl,
  } = useForm<UpdTaskTagRefsFormType>({
    resolver: zodResolver(updTaskTagRefsFormSchema),
    defaultValues: { tagRefs: [] },
  });
  const [isTagsEdit, setIsTagsEdit] = useState(false);
  const onSubmitTags = async (submitData: UpdTaskTagRefsFormType) => {
    await trigger(submitData);
    setIsTagsEdit(false);
    addAlert('タスクタグの更新に成功', 'success', 5000);
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
  const onAfterDeleted = () => {
    router.push(`/tasks?teamId=${teamId}`);
  };

  // 初期値設定
  useEffect(() => {
    const task = taskData.data;
    if (task) {
      titleReset({ title: task.title });
      discriptionReset({ discription: task.discription });
      statusReset({ status: task.status });
      timeReset({
        startTime: formatInTimeZone(new Date(task.startTime), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm"),
        endTime: formatInTimeZone(new Date(task.endTime), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm"),
      });
      tagsReset({ tagRefs: task.tagRefs });
    }
  }, [taskData.data, discriptionReset, statusReset, tagsReset, timeReset, titleReset]);

  return (
    <>
      <div className="p-2 sm:p-6">
        {isTitleEdit ? (
          <form onSubmit={titleHandleSubmit(onSubmitTitle)} className="flex w-full gap-1 rounded-md">
            <div className="grow">
              <InputField<UpdTaskTitleFormType> type="text" name="title" register={titleRegister} error={titleErrors.title?.message} />
            </div>
            <CancelEditButton disabled={isMutating} onClose={() => setIsTitleEdit(false)} />
          </form>
        ) : (
          <div className="flex gap-1">
            <h2 className="grow text-xl sm:text-2xl">{taskData.data?.title}</h2>
            <div className="">
              <div className="text-right">
                {teamId && taskId && !isTitleEdit && !isStatusEdit && !isTimeEdit && !isDiscriptionEdit && !isTagsEdit && (
                  <Menu>
                    <MenuButton
                      className={clsx(
                        'flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-1.5 text-center text-sm font-semibold ring-orange-400 transition duration-100 outline-none focus:ring focus-visible:ring sm:text-base',
                        'border-gray-400 bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-200'
                      )}
                    >
                      <EllipsisVerticalIcon className="size-6 fill-gray-600" />
                    </MenuButton>
                    <MenuItems
                      transition
                      anchor="bottom end"
                      className="w-42 origin-top-right rounded-xl border border-gray-400 bg-white p-1 text-base text-gray-800 transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                    >
                      <div className="w-full items-center px-2 py-1 text-gray-500">更新</div>
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => setIsTitleEdit(true)}
                        >
                          <PencilIcon className="size-4 fill-green-800" />
                          <span>タイトル</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => setIsStatusEdit(true)}
                        >
                          <PencilIcon className="size-4 fill-green-800" />
                          <span>ステータス</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => setIsTimeEdit(true)}
                        >
                          <PencilIcon className="size-4 fill-green-800" />
                          <span>時刻</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => setIsTagsEdit(true)}
                        >
                          <PencilIcon className="size-4 fill-green-800" />
                          <span>タグ</span>
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => setIsDiscriptionEdit(true)}
                        >
                          <PencilIcon className="size-4 fill-green-800" />
                          <span>説明</span>
                        </button>
                      </MenuItem>
                      <div className="my-1 h-px bg-gray-400" />
                      <MenuItem>
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-gray-800 ring-orange-400 hover:bg-gray-200 data-focus:bg-gray-200 data-focus:ring-2"
                          onClick={() => onDeleteOpen(teamId, taskId, taskData.data?.title ?? '不明')}
                        >
                          <TrashIcon className="size-4 fill-red-700" />
                          <span>削除</span>
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="my-2 flex flex-wrap items-end justify-between gap-2">
          {/* ステータス更新 */}
          {isStatusEdit && (
            <form onSubmit={statusHandleSubmit(onSubmitStatus)} className="flex items-end gap-2 rounded-md">
              <div className="w-28">
                <Controller
                  control={statusControl}
                  name="status"
                  render={({ field }) => (
                    <Selectbox
                      label=""
                      selectedValue={field.value}
                      onChange={field.onChange}
                      error={statusErrors.status?.message}
                      itemList={[
                        { value: 'todo', text: '未着手', type: 'default' },
                        { value: 'doing', text: '進行中', type: 'default' },
                        { value: 'done', text: '完了', type: 'default' },
                      ]}
                    />
                  )}
                />
              </div>
              <CancelEditButton disabled={isMutating} onClose={() => setIsStatusEdit(false)} />
            </form>
          )}
          {!isStatusEdit && taskData.data?.status && <TagStatus type={taskData.data?.status} />}
          {/* 開始時刻、終了時刻の更新 */}
          {isTimeEdit ? (
            <form onSubmit={timeHandleSubmit(onSubmitTime)} className="flex flex-wrap gap-1">
              <div className="w-60">
                <InputDateField<UpdTaskDateTimeFormType>
                  type="datetime-local"
                  name="startTime"
                  register={timeRegister}
                  error={timeErrors.startTime?.message}
                />
              </div>
              <span className="px-1 py-2"> ~ </span>
              <div className="w-60">
                <InputDateField<UpdTaskDateTimeFormType>
                  type="datetime-local"
                  name="endTime"
                  register={timeRegister}
                  error={timeErrors.endTime?.message}
                />
              </div>
              <CancelEditButton disabled={isMutating} onClose={() => setIsTimeEdit(false)} />
            </form>
          ) : (
            <div className="flex justify-end lg:mr-12">
              <span className="rounded-md bg-gray-50 px-1 py-1.5 text-sm ring ring-gray-400">
                {format(new Date(taskData.data?.startTime || new Date().getTime()), 'yyyy年MM月dd日 hh:mm')}
              </span>
              <span className="px-1 py-1"> ~ </span>
              <span className="rounded-md bg-gray-50 px-1 py-1.5 text-sm ring ring-gray-400">
                {format(new Date(taskData.data?.endTime || new Date().getTime()), 'yyyy年MM月dd日 hh:mm')}
              </span>
            </div>
          )}
        </div>
        <hr className="my-2 text-gray-300" />
        {/* タグ */}
        <div className="flex justify-end gap-2 lg:mr-12">
          {isTagsEdit ? (
            <form onSubmit={tagsHandleSubmit(onSubmitTags)} className="flex gap-2">
              <Controller
                control={tagsControl}
                name="tagRefs"
                render={({ field }) => {
                  const selected = tagsDatas.data?.tags.filter((p) => field.value?.includes(p.tagId)) ?? [];
                  return (
                    <div>
                      {tagsErrors.tagRefs?.message && <p className="text-sm text-red-500">{tagsErrors.tagRefs.message}</p>}
                      <Listbox value={selected} onChange={(newSelected) => field.onChange(newSelected.map((p) => p.tagId))} multiple>
                        <ListboxButton className="flex h-12 items-center gap-2 rounded border px-3 py-2">
                          {selected == null || selected.length === 0 ? (
                            <span className="px-2 text-sm text-gray-600">未選択</span>
                          ) : (
                            selected.map((p) => <Tag key={`button_${p.tagId}`} tagColor={p.tagColor} tagName={p.tagName} />)
                          )}
                        </ListboxButton>
                        <ListboxOptions
                          anchor="bottom start"
                          transition
                          className={clsx(
                            'z-popover min-w-60 rounded-xl border bg-white p-1 [--anchor-gap:--spacing(1)] focus:outline-none',
                            'transition duration-100 ease-in data-leave:data-closed:opacity-0'
                          )}
                        >
                          {tagsDatas.data?.tags.map((tag) => (
                            <ListboxOption
                              key={tag.tagId}
                              value={tag}
                              className="group flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 select-none hover:bg-gray-200 data-focus:bg-gray-200"
                            >
                              <CheckIcon className="invisible size-4 fill-gray-800 group-data-selected:visible" />
                              <Tag tagColor={tag.tagColor} tagName={tag.tagName} />
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </Listbox>
                    </div>
                  );
                }}
              />
              <CancelEditButton disabled={isMutating} onClose={() => setIsTagsEdit(false)} />
            </form>
          ) : (
            <>
              {tagsDatas.data?.tags
                .filter((tag) => taskData.data?.tagRefs.includes(tag.tagId))
                .map((val) => (
                  <Tag key={val.tagId} tagName={val.tagName} tagColor={val.tagColor} />
                ))}
            </>
          )}
        </div>
        {/* 説明 */}
        {isDiscriptionEdit ? (
          <form onSubmit={discriptionHandleSubmit(onSubmitDiscription)} className="max-w-none p-4 sm:p-8">
            <Controller
              name="discription"
              control={discriptionControl}
              render={({ field }) => (
                <div>
                  {discriptionErrors.discription?.message && <p className="text-sm text-red-500">{discriptionErrors.discription.message}</p>}
                  <MDEditor preview="edit" value={field.value} onChange={(v) => field.onChange(v ?? '')} height={500} />
                </div>
              )}
            />
            <div className="mt-2 flex justify-end">
              <CancelEditButton disabled={isMutating} onClose={() => setIsDiscriptionEdit(false)} />
            </div>
          </form>
        ) : (
          <div className="prose max-w-none p-4 sm:p-8">
            <MarkdownPreview source={taskData.data?.discription || ''} />
          </div>
        )}
      </div>
      {/* タスク系 ダイアログ */}
      {teamId && <DeleteTasksDialog actionData={actionData} isOpen={isDeleteOpen} onClose={onDeleteClose} onAfterDeleted={onAfterDeleted} />}
    </>
  );
}

export const CancelEditButton = ({ disabled, onClose }: { disabled: boolean; onClose: () => void }) => {
  return (
    <div className="inline-flex divide-x rounded-lg border border-gray-400 bg-gray-50 text-sm text-gray-900 select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={onClose}
        className={clsx(
          'rounded-l-lg bg-white px-3 py-1.5 text-base ring-orange-400 transition duration-100 outline-none',
          'disabled:bg-gray-100g hover:bg-gray-100 focus:ring-2 active:bg-gray-200'
        )}
      >
        取消
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={clsx(
          'rounded-r-lg bg-green-100 px-3 py-1.5 text-base ring-orange-400 transition duration-100 outline-none',
          'disabled:bg-gray-100g hover:bg-green-200 focus:ring-2 active:bg-gray-200'
        )}
      >
        更新
      </button>
    </div>
  );
};
