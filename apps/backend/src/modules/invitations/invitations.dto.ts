import {
  ReqParamInvitationsSchema,
  ReqParamInvitationsRegisterSchema,
  ReqBodyInvitationsRegisterSchema,
  ReqParamInvitationsItemSchema,
  ReqParamInvitationsDeleteSchema,
  ReqParamInvitationsToTeamUserSchema,
  ReqBodyInvitationsToTeamUserSchema,
} from '@repo/api-models/invitations';
import { createZodDto } from 'nestjs-zod';

/** [Requset-Param-DTO] チーム招待一覧を取得 */
export class ReqParamInvitationsDto extends createZodDto(ReqParamInvitationsSchema) {}

/** [Requset-Param-DTO] チーム招待作成 */
export class ReqParamInvitationsRegisterDTO extends createZodDto(ReqParamInvitationsRegisterSchema) {}

/** [Reaques-Body-DTO] チーム招待作成 */
export class ReqBodyInvitationsRegisterDTO extends createZodDto(ReqBodyInvitationsRegisterSchema) {}

/** [Requset-Param-DTO] チーム招待情報 */
export class ReqParamInvitationsItemDTO extends createZodDto(ReqParamInvitationsItemSchema) {}

/** [Requset-Param-DTO] タスク削除 */
export class ReqParamInvitationsDeleteDTO extends createZodDto(ReqParamInvitationsDeleteSchema) {}

/** [Requset-Param-DTO] チーム招待からチームユーザに追加 */
export class ReqParamInvitationsToTeamUserDTO extends createZodDto(ReqParamInvitationsToTeamUserSchema) {}

/** [Requset-Body-DTO] チーム招待からチームユーザに追加 */
export class ReqBodyInvitationsToTeamUserDTO extends createZodDto(ReqBodyInvitationsToTeamUserSchema) {}
