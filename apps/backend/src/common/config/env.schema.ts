import { z } from 'zod';

/** 環境変数 Schema */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  // BACKEND
  BACKEND_PREFIX: z.string().min(1),
  BACKEND_PORT: z.string().transform(Number),
  BACKEND_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'silent']),
  BACKEND_CORS_ORIGIN: z.string().min(1),
  // AWS
  AWS_REGION: z.string().min(1),
  AWS_DYNAMO_ENDPOINT: z.string().optional(),
  AWS_DYNAMO_TASK_TABLE: z.string().min(1),
  AWS_DYNAMO_INVITATION_TABLE: z.string().min(1),
  AWS_COGNITO_USER_POOL_ID: z.string().min(1),
  AWS_COGNITO_CLIENT_ID: z.string().min(1),
});

/** 環境変数 Type */
export type EnvType = z.infer<typeof envSchema>;
