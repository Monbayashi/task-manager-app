import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { TypedConfigService } from '../common/config/typed-config.service';

@Injectable()
export class InvitationService {
  private snsClient: SNSClient;
  private topicArn: string;
  private readonly logger = new Logger(InvitationService.name);

  constructor(private typedConfig: TypedConfigService) {
    this.topicArn = this.typedConfig.get('AWS_SNS_TOPIC_ARN');
    this.snsClient = new SNSClient({
      region: this.typedConfig.get('AWS_REGION'),
      endpoint: this.typedConfig.get('AWS_SNS_ENDPOINT') || undefined,
    });
  }

  /**
   * データ検証
   */
  parse(event: DynamoDBStreamEvent): { email: string; message: string } {
    this.logger.log('Stream event:', JSON.stringify(event, null, 2));
    return { email: 'test@example.com', message: '招待されました！' };
  }

  /**
   * 招待メール送信
   */
  async sendEmail(data: { email: string; message: string }) {
    this.logger.log('チーム招待メール送信');
    try {
      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify({
          email: data.email,
          subject: '【招待】チームへの招待が届いています',
          body: data.message,
        }),
        MessageAttributes: {
          email: {
            DataType: 'String',
            StringValue: data.email,
          },
        },
      });
      await this.snsClient.send(command);
    } catch (error) {
      this.logger.error('SNS Publish 失敗:', error);
      throw error;
    }
  }
}
