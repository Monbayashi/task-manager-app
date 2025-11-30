import { z } from 'zod';
import { teamNameSchema } from './common.schema';

/** チーム更新Form Schema */
export const updTeamFormSchema = z.object({
  teamName: teamNameSchema,
});

/** チーム更新Form Type */
export type UpdTeamFormType = z.infer<typeof updTeamFormSchema>;
