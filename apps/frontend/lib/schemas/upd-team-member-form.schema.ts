import { z } from 'zod';
import { teamRoleSchema } from './common.schema';

/** チームメンバー更新Form Schema */
export const updTeamMemberFormSchema = z.object({
  role: teamRoleSchema,
});

/** チームメンバー更新Form Type */
export type UpdTeamMemberFormType = z.infer<typeof updTeamMemberFormSchema>;
