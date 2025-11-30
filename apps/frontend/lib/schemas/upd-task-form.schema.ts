import { parseISO } from 'date-fns';
import { z } from 'zod';
import { endTimeSchema, startTimeSchema, tagRefsSchema, taskDiscriptionSchema, taskStatusSchema, taskTitleSchema } from './common.schema';

/** タスク更新(タイトル)Form Schema */
export const updTaskTitleFormSchema = z.object({
  title: taskTitleSchema,
});
/** タスク更新(タイトル)Form Type */
export type UpdTaskTitleFormType = z.infer<typeof updTaskTitleFormSchema>;

/** タスク更新(説明)Form Schema */
export const updTaskDiscriptionFormSchema = z.object({
  discription: taskDiscriptionSchema,
});
/** タスク更新(説明)Form Type */
export type UpdTaskDiscriptionFormType = z.infer<typeof updTaskDiscriptionFormSchema>;

/** タスク更新(ステータス)Form Schema */
export const updTaskStatusFormSchema = z.object({
  status: taskStatusSchema,
});
/** タスク更新(ステータス)Form Type */
export type UpdTaskStatusFormType = z.infer<typeof updTaskStatusFormSchema>;

/** タスク更新(開始/終了日時)Form Schema */
export const updTaskDateTimeFormSchema = z
  .object({
    startTime: startTimeSchema,
    endTime: endTimeSchema,
  })
  .refine((data) => parseISO(data.startTime) <= parseISO(data.endTime), {
    error: '開始日時 は 終了日時 以下である必要があります',
    path: ['startTime'],
  });
/** タスク更新(開始/終了日時)Form Type */
export type UpdTaskDateTimeFormType = z.infer<typeof updTaskDateTimeFormSchema>;

/** タスク更新(タグ参照)Form Schema */
export const updTaskTagRefsFormSchema = z.object({
  tagRefs: tagRefsSchema,
});
/** タスク更新(タグ参照)Form Type */
export type UpdTaskTagRefsFormType = z.infer<typeof updTaskTagRefsFormSchema>;
