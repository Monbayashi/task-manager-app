import {
  ReqBodyTasksRegisterSchema,
  ReqBodyTasksUpdateSchema,
  ReqParamTasksDeleteSchema,
  ReqParamTasksRegisterSchema,
  ReqParamTasksSchema,
  ReqParamTasksTaskSchema,
  ReqParamTasksUpdateSchema,
  ReqQueryTasksSchema,
} from '@repo/api-models/tasks';
import { createZodDto } from 'nestjs-zod';

/** [Requset-Param-DTO] タスク一覧 */
export class ReqParamTasksDto extends createZodDto(ReqParamTasksSchema) {}

/** [Requset-Query-DTO] タスク一覧 */
export class ReqQueryTasksDto extends createZodDto(ReqQueryTasksSchema) {}

/** [Requset-Param-DTO] タスク作成 */
export class ReqParamTasksRegisterDTO extends createZodDto(ReqParamTasksRegisterSchema) {}

/** [Reaques-Body-DTO] タスク作成 */
export class ReqBodyTasksRegisterDTO extends createZodDto(ReqBodyTasksRegisterSchema) {}

/** [Requset-Param-DTO] タスク情報 */
export class ReqParamTasksTaskDTO extends createZodDto(ReqParamTasksTaskSchema) {}

/** [Requset-Param-DTO] タスク更新 */
export class ReqParamTasksUpdateDTO extends createZodDto(ReqParamTasksUpdateSchema) {}

/** [Request-Body-DTO] タスク更新 */
export class ReqBodyTasksUpdateDTO extends createZodDto(ReqBodyTasksUpdateSchema) {}

/** [Requset-Param-DTO] タスク削除 */
export class ReqParamTasksDeleteDTO extends createZodDto(ReqParamTasksDeleteSchema) {}
