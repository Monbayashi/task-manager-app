'use client';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTag } from '@/api/tags/useTag';
import { useCreateTask } from '@/api/tasks/useCreateTask';
import { AppCardButton } from '@/components/ui/app-card/app-card-button';
import { InputDateField } from '@/components/ui/input/input-data-field';
import { InputField } from '@/components/ui/input/input-field';
import { Selectbox } from '@/components/ui/selectbox';
import { Tag } from '@/components/ui/tag';
import { NewTaskFormType, newTaskFormSchema } from '@/lib/schemas/new-task-form.schema';
import { useAlertStore } from '@/store/alert';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { add } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Controller, useForm } from 'react-hook-form';

// SSR を無効化して MDEditor を読み込む
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

/** 新規タスク登録ページ */
export default function TasksNewPage() {
  const router = useRouter();
  const pathParams = useSearchParams();
  const teamId = pathParams.get('teamId');
  const addAlert = useAlertStore((state) => state.addAlert);
  // タグ系
  const tagsDatas = useTag(teamId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NewTaskFormType>({
    resolver: zodResolver(newTaskFormSchema),
    defaultValues: {
      title: 'test',
      status: 'todo',
      startTime: formatInTimeZone(new Date(), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm"),
      endTime: formatInTimeZone(add(new Date(), { days: 7 }), 'Asia/Tokyo', "yyyy-MM-dd'T'HH:mm"),
      tagRefs: [],
    },
  });

  const { trigger, isMutating } = useCreateTask(teamId);
  const onSubmit = async (submitData: NewTaskFormType) => {
    try {
      const result = await trigger(submitData);
      addAlert('タスクを登録しました', 'success');
      router.push(`/tasks/edit/?teamId=${result.teamId}&taskId=${result.taskId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="p-6 sm:p-1">
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full rounded-md">
          <div className="flex flex-col flex-wrap gap-4 p-2 sm:p-6">
            <InputField<NewTaskFormType> label="タイトル" type="text" name="title" register={register} error={errors.title?.message} />
            <div className="max-w-48">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Selectbox
                    selectedValue={field.value}
                    onChange={field.onChange}
                    label="ステータス"
                    error={errors.status?.message}
                    itemList={[
                      { value: 'todo', text: '未着手', type: 'default' },
                      { value: 'doing', text: '進行中', type: 'default' },
                      { value: 'done', text: '完了', type: 'default' },
                    ]}
                  />
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="max-w-64">
                <InputDateField<NewTaskFormType>
                  label="開始日時"
                  type="datetime-local"
                  name="startTime"
                  register={register}
                  error={errors.startTime?.message}
                />
              </div>
              <div className="max-w-64">
                <InputDateField<NewTaskFormType>
                  label="終了日時"
                  type="datetime-local"
                  name="endTime"
                  register={register}
                  error={errors.endTime?.message}
                />
              </div>
            </div>
            <Controller
              control={control}
              name="tagRefs"
              render={({ field }) => {
                const selected = tagsDatas.data?.tags.filter((p) => field.value.includes(p.tagId)) ?? [];
                return (
                  <div>
                    <label className="block text-sm text-gray-800 sm:text-base">タグ</label>
                    {errors.tagRefs?.message && <p className="text-sm text-red-500">{errors.tagRefs.message}</p>}
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
            {/* Markdown Editor */}
            <Controller
              name="discription"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="inline-block text-sm text-gray-800 sm:text-base">説明</label>
                  {errors.discription?.message && <p className="text-sm text-red-500">{errors.discription.message}</p>}
                  <MDEditor value={field.value} height={500} onChange={(v) => field.onChange(v ?? '')} />
                </div>
              )}
            />
          </div>
          <div className="flex justify-end">
            <AppCardButton type="submit" disabled={isMutating} name="アカウントを作成">
              {isMutating ? '・・・登録中' : '登録'}
            </AppCardButton>
          </div>
        </form>
      </div>
    </>
  );
}
