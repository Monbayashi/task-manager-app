import { createZodDto } from 'nestjs-zod';
import {
  ReqBodyTagsRegisterSchema,
  ReqBodyTagsUpdateSchema,
  ReqParamTagsDeleteSchema,
  ReqParamTagsRegisterSchema,
  ReqParamTagsSchema,
  ReqParamTagsUpdateSchema,
} from '@repo/api-models/tags';

/** [Requset-Param-DTO] タグ一覧 */
export class ReqParamTagsDto extends createZodDto(ReqParamTagsSchema) {}

/** [Requset-Param-DTO] タグ作成 */
export class ReqParamTagsRegisterDTO extends createZodDto(ReqParamTagsRegisterSchema) {}

/** [Reaques-Body-DTO] タグ作成 */
export class ReqBodyTagsRegisterDTO extends createZodDto(ReqBodyTagsRegisterSchema) {}

/** [Requset-Param-DTO] タグ更新 */
export class ReqParamTagsUpdateDTO extends createZodDto(ReqParamTagsUpdateSchema) {}

/** [Request-Body-DTO] タグ更新 */
export class ReqBodyTagsUpdateDTO extends createZodDto(ReqBodyTagsUpdateSchema) {}

/** [Requset-Param-DTO] タグ削除 */
export class ReqParamTagsDeleteDTO extends createZodDto(ReqParamTagsDeleteSchema) {}
