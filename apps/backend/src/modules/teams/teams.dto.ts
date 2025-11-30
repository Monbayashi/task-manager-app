import { createZodDto } from 'nestjs-zod';
import {
  ReqBodyTeamMemberUpdateSchema,
  ReqBodyTeamsRegisterSchema,
  ReqBodyTeamsUpdateSchema,
  ReqParamTeamMemberDeleteSchema,
  ReqParamTeamMemberUpdateSchema,
  ReqParamTeamsTeamSchema,
  ReqParamTeamsUpdateSchema,
  ReqParamTeamsUsersSchema,
} from '@repo/api-models/teams';

/** [Requset-Param-DTO] チーム情報 */
export class ReqParamTeamsTeamDto extends createZodDto(ReqParamTeamsTeamSchema) {}

/** [Requset-Param-DTO] チームに紐づくユーザ一覧 */
export class ReqParamTeamsUsersDTO extends createZodDto(ReqParamTeamsUsersSchema) {}

/** [Reaques-Body-DTO] チーム作成 */
export class ReqBodyTeamsRegisterDTO extends createZodDto(ReqBodyTeamsRegisterSchema) {}

/** [Requset-Param-DTO] チーム更新 */
export class ReqParamTeamsUpdateDTO extends createZodDto(ReqParamTeamsUpdateSchema) {}

/** [Request-Body-DTO] チーム更新 */
export class ReqBodyTeamsUpdateDTO extends createZodDto(ReqBodyTeamsUpdateSchema) {}

/** [Requset-Param-DTO] チームメンバー更新 */
export class ReqParamTeamMemberUpdateDTO extends createZodDto(ReqParamTeamMemberUpdateSchema) {}

/** [Request-Body-DTO] チームメンバー更新 */
export class ReqBodyTeamMemberUpdateDTO extends createZodDto(ReqBodyTeamMemberUpdateSchema) {}

/** [Requset-Param-DTO] チームメンバー削除 */
export class ReqParamTeamMemberDeleteDTO extends createZodDto(ReqParamTeamMemberDeleteSchema) {}
