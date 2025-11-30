import { z } from 'zod';
import { ReqBodyTasksRegisterSchema, ReqBodyTasksUpdateSchema, ReqQueryTasksSchema } from './schema.ts';

type TaskStatus = 'todo' | 'doing' | 'done';

type ResTasksItem = {
  teamId: string;
  taskId: string;
  title: string;
  discription: string;
  status: TaskStatus;
  startTime: string;
  endTime: string;
  tagRefs: string[];
  createdAt: string;
};

type ResTasksList = Omit<ResTasksItem, 'discription'>[];

/**
 * [Request-Query-Type] タスク一覧取得
 */
export type ReqQueryTasksType = z.infer<typeof ReqQueryTasksSchema>;

/**
 * [Response-Body-Type] タスク一覧取得
 */
export type ResBodyTasksType = {
  tasks: ResTasksList;
  nextToken: string | null;
};

/**
 * [Request-Body-Type] タスク作成
 */
export type ReqBodyTasksRegisterType = z.infer<typeof ReqBodyTasksRegisterSchema>;

/**
 * [Response-Body-Type] タスク作成
 */
export type ResBodyTasksRegisterType = ResTasksItem;

/**
 * [Response-Body-Type] タスク情報取得
 */
export type ResBodyTasksTaskType = ResTasksItem;

/**
 * [Request-Body-Type] タスク更新
 */
export type ReqBodyTasksUpdateType = z.infer<typeof ReqBodyTasksUpdateSchema>;

/**
 * [Response-Body-Type] タスク更新
 */
export type ResBodyTasksUpdateType = ResTasksItem;

/**
 * [Response-Body-Type] タスク削除
 */
export type ResBodyTasksDeleteType = {
  teamId: string;
  taskId: string;
};
