import { z } from 'zod';

/** 環境変数 Schema */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  // INVITATION
  INVITATION_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'silent']),
  // AWS
  AWS_REGION: z.string().min(1),
  AWS_SNS_ENDPOINT: z.string().optional(),
  AWS_SNS_TOPIC_ARN: z.string().min(1),
});

/** 環境変数 Type */
export type EnvType = z.infer<typeof envSchema>;
