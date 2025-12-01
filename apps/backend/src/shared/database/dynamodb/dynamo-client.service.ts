import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TypedConfigService } from '../../../common/config/typed-config.service';

@Injectable()
export class DynamoClientService {
  private readonly logger = new Logger(DynamoClientService.name);
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
        debug: (msg) => this.logger.debug(msg, 'DynamoDB'),
        info: (msg) => this.logger.debug(msg, 'DynamoDB'),
        warn: (msg) => this.logger.warn(msg, 'DynamoDB'),
        error: (msg) => this.logger.error(msg, 'DynamoDB'),
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
