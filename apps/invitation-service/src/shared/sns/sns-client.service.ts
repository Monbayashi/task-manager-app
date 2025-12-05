// sns.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand, SNSServiceException, ThrottledException, InternalErrorException } from '@aws-sdk/client-sns';
import { TypedConfigService } from '../../common/config/typed-config.service';

@Injectable()
export class SnsClientService {
  private readonly client: SNSClient;
  private readonly topicArn: string;
  private readonly logger = new Logger(SnsClientService.name);

  constructor(private config: TypedConfigService) {
    this.topicArn = this.config.get('AWS_SNS_TOPIC_ARN');
    this.client = new SNSClient({
      region: this.config.get('AWS_REGION'),
      endpoint: this.config.get('AWS_SNS_ENDPOINT') || undefined,
    });
  }

  /** SNS送信 */
  async publish(subject: string, message: string, email: string) {
    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Subject: subject,
      Message: message,
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: email,
        },
      },
    });
    return this.sendWithRetry(command);
  }

  /** Retryつき SNS 実行 */
  private async sendWithRetry(command: PublishCommand) {
    const MAX_RETRY = 3;
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        return await this.client.send(command);
      } catch (err) {
        lastError = err;
        // Retry 対象かをチェック
        if (!this.shouldRetry(err)) {
          this.logger.error({ msg: 'SNS エラー:リトライ不可', error: err });
          throw err;
        }
        // Retry ログ
        this.logger.warn({ msg: `SNS エラー:1秒後にリトライ処理 (${attempt}/${MAX_RETRY})` });
        // 1秒待機
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    // リトライ限界
    this.logger.error({ msg: 'SNS エラー: 複数回のリトライに失敗', error: lastError });
    throw lastError;
  }

  // NOTE: https://docs.aws.amazon.com/sns/latest/api/CommonErrors.html
  // NOTE: https://docs.aws.amazon.com/sns/latest/api/API_Publish.html?utm_source=chatgpt.com
  /** Retry すべき一時的エラーのみ true を返す */
  private shouldRetry(err: unknown): boolean {
    // SNS のレート制限
    if (err instanceof ThrottledException) {
      return true;
    }
    // SNS の内部エラー
    if (err instanceof InternalErrorException) {
      return true;
    }
    // AWS側のエラー: 一時的なサービス不可 or 内部障害
    if (err instanceof SNSServiceException) {
      const status = err.$metadata?.httpStatusCode;
      if (status === 500 || status === 503) {
        return true;
      }
    }
    return false;
  }
}
