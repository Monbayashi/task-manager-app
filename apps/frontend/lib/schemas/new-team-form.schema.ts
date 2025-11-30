import { z } from 'zod';
import { teamNameSchema } from './common.schema';

/** 新規チーム登録Form Schema */
export const newTeamFormSchema = z.object({
  teamName: teamNameSchema,
});

/** 新規チーム登録Form Type */
export type NewTeamFormType = z.infer<typeof newTeamFormSchema>;
