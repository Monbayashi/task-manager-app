import { z } from 'zod';
import { emailSchema, teamRoleSchema } from './common.schema';

/** チーム招待登録Form Schema */
export const newInvitationSchema = z.object({
  email: emailSchema,
  role: teamRoleSchema,
});

/** チーム招待登録Form Type */
export type NewInvitationType = z.infer<typeof newInvitationSchema>;
