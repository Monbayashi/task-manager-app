import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

/** ログインForm Schema */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/** ログインForm Type */
export type LoginFormType = z.infer<typeof loginFormSchema>;
