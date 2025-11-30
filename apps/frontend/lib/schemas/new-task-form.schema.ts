import { parseISO } from 'date-fns';
import { z } from 'zod';
import { endTimeSchema, startTimeSchema, tagRefsSchema, taskDiscriptionSchema, taskStatusSchema, taskTitleSchema } from './common.schema';

/** 新規タスク登録Form Schema */
export const newTaskFormSchema = z
  .object({
    title: taskTitleSchema,
    discription: taskDiscriptionSchema,
    status: taskStatusSchema,
    tagRefs: tagRefsSchema,
    startTime: startTimeSchema,
    endTime: endTimeSchema,
  })
  .refine((data) => parseISO(data.startTime) <= parseISO(data.endTime), {
    error: '開始日時 は 終了日時 以下である必要があります',
    path: ['startTime'],
  });

/** 新規タスク登録Form Type */
export type NewTaskFormType = z.infer<typeof newTaskFormSchema>;
