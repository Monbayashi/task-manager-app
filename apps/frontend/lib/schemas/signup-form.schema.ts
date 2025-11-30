import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

/** サインアップForm Schema */
export const signupFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwordが一致しません',
  });

/** サインアップForm Type */
export type SignupFormType = z.infer<typeof signupFormSchema>;

/** サインアップ検証Form Schema */
export const confirmSignupFormSchema = z.object({
  code: z.string(),
});

/** サインアップ検証Form Type */
export type ConfirmSignupFormType = z.infer<typeof confirmSignupFormSchema>;
