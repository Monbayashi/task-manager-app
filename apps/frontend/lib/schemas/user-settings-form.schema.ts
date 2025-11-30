import { z } from 'zod';
import { userNameSchema } from './common.schema';

/** 新規チーム登録Form Schema */
export const userSettingsFormSchema = z.object({
  userName: userNameSchema,
});

/** 新規チーム登録Form Type */
export type UserSettingsFormType = z.infer<typeof userSettingsFormSchema>;
