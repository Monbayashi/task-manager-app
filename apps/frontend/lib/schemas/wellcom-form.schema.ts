import { z } from 'zod';
import { emailSchema, teamNameSchema, userNameSchema } from './common.schema';

/** ようこそForm Schema */
export const wellcomeFormSchema = z.object({
  email: emailSchema,
  userName: userNameSchema,
  teamName: teamNameSchema,
});

/** ようこそForm Type */
export type WellcomeFormType = z.infer<typeof wellcomeFormSchema>;
