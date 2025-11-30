import { createZodDto } from 'nestjs-zod';
import { ReqBodyUsersRegisterSchema, ReqBodyUsersUpdateSchema } from '@repo/api-models/users';

/** [Request-Body-DTO] ユーザ作成 */
export class ReqBodyUsersRegisterDTO extends createZodDto(ReqBodyUsersRegisterSchema) {}

/** [Request-Body-DTO] ユーザ更新 */
export class ReqBodyUsersUpdateDTO extends createZodDto(ReqBodyUsersUpdateSchema) {}
