import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TypedConfigService } from '../../../common/config/typed-config.service';
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

@Injectable()
export class DynamoClientService {
  public readonly client: DynamoDBClient;
  public readonly db: DynamoDBDocumentClient;
  public readonly taskTable: string;
  public readonly invitationTable: string;

  constructor(private config: TypedConfigService) {
    const endpoint = this.config.get('AWS_DYNAMO_ENDPOINT');
    const region = this.config.get('AWS_REGION');
    const taskTable = this.config.get('AWS_DYNAMO_TASK_TABLE');
    const invitationTable = this.config.get('AWS_DYNAMO_INVITATION_TABLE');

    this.client = new DynamoDBClient({
      region,
      endpoint,
      maxAttempts: 10,
      retryMode: 'adaptive',
      logger: {
        debug: (msg) => logger.silent(msg),
        info: (msg) => logger.info(msg),
        warn: (msg) => logger.warn(msg),
        error: (msg) => logger.error(msg),
      },
    });

    this.db = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: { removeUndefinedValues: true },
    });

    // テーブル名
    this.taskTable = taskTable;
    this.invitationTable = invitationTable;
  }
}
