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

/** サインアップ検証Form Schema */ //認証コードを入力してください
export const confirmSignupFormSchema = z.object({
  code: z
    .string({ error: (issue) => (issue.input === undefined ? '認証コードは必須項目です' : '認証コードは文字列で入力してください') })
    .regex(/^\d{6}$/, '認証コードは6桁の数字で入力してください'),
});

/** サインアップ検証Form Type */
export type ConfirmSignupFormType = z.infer<typeof confirmSignupFormSchema>;
