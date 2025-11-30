import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import pino from 'pino';

const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      messageFormat: '[DYNAMO] {msg}',
      destination: 1,
    },
  },
});

export const dynamoClient = new DynamoDBClient({
  region: 'ap-northeast-1',
  // ローカル開発時は自動でDynamoDB Localに接続
  endpoint: 'http://localhost:4566',
  maxAttempts: 10,
  retryMode: 'adaptive',
  logger: {
    debug: (message: string) => logger.silent(message),
    info: (message: string) => logger.info(message),
    warn: (message: string) => logger.warn(message),
    error: (message: string) => logger.error(message),
  },
});

export const db = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true, // undefinedを削除
  },
});

export const TASK_TABLE = 'task-table-v3';
export const INVITATION_TABLE = 'task-table-invitation-v3';
