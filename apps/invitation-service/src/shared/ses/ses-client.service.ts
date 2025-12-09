import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { TypedConfigService } from '../../common/config/typed-config.service';

@Injectable()
export class SesClientService {
  private readonly client: SESClient;
  private readonly fromEmail: string;
  private readonly logger = new Logger(SesClientService.name);

  constructor(private config: TypedConfigService) {
    this.fromEmail = this.config.get('AWS_SES_FROM_EMAIL');
    this.client = new SESClient({
      region: this.config.get('AWS_REGION'),
      endpoint: this.config.get('AWS_SES_ENDPOINT') || undefined,
    });
  }

  /** SESメール送信 */
  async publish(subject: string, message: string, email: string) {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: message, Charset: 'UTF-8' },
        },
      },
    });

    return this.sendWithRetry(command);
  }

  /** リトライ付き送信 */
  private async sendWithRetry(command: SendEmailCommand) {
    const MAX_RETRY = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      try {
        const result = await this.client.send(command);
        this.logger.log(`SES送信成功: ${result.MessageId}`);
        return result;
      } catch (err) {
        lastError = err;

        if (!this.shouldRetry(err)) {
          this.logger.error({ msg: 'SES エラー:リトライ不可', error: err });
          throw err;
        }

        this.logger.warn({ msg: `SES エラー:リトライ ${attempt}/${MAX_RETRY}` });
        await new Promise((resolve) => setTimeout(resolve, this.config.get('INVITATION_RETRY_TIMEOUT')));
      }
    }

    this.logger.error({ msg: 'SES エラー:複数回のリトライに失敗', error: lastError });
    throw lastError;
  }

  private shouldRetry(err: unknown): boolean {
    if (err && typeof err === 'object') {
      const e = err as any;
      if (e.name === 'Throttling') return true;
      if (e.$metadata?.httpStatusCode >= 500) return true;
    }
    return false;
  }
}
