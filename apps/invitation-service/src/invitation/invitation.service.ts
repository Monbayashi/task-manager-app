import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBRecord } from 'aws-lambda';
import { TypedConfigService } from 'src/common/config/typed-config.service';
import { SnsClientService } from 'src/shared/sns/sns-client.service';
import { z, flattenError } from 'zod';

const SUBJECT = '【招待】チームへの招待が届いています' as const;

const invitationNewImageSchema = z.object({
  PK: z.object({ S: z.string().min(1) }),
  SK: z.object({ S: z.string().min(1) }),
  type: z.object({ S: z.enum(['invitation']) }),
  email: z.object({ S: z.email() }),
  token: z.object({ S: z.string().min(1) }),
  team_name: z.object({ S: z.string().min(1) }),
});

type InvitationNewImageType = {
  teamId: string;
  inviteId: string;
  email: string;
  token: string;
  teamName: string;
};

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    private readonly snsClient: SnsClientService,
    private readonly config: TypedConfigService
  ) {}

  /** 招待メール送信処理 Main */
  async sendInvitationMain(record: DynamoDBRecord) {
    this.logger.log({ msg: 'Invitation Service 起動' });
    const parseData = this.parse(record);
    const snsMessge = this.createMessage(parseData);
    await this.snsClient.publish(SUBJECT, snsMessge, parseData.email);
    this.logger.log({ msg: 'チーム招待メール送信完了', target: parseData });
    this.logger.log('Invitation Service 終了');
    return;
  }

  /** データ検証 */
  private parse(record: DynamoDBRecord): InvitationNewImageType {
    const parseData = invitationNewImageSchema.safeParse(record.dynamodb?.NewImage);
    if (parseData.success === false) {
      this.logger.error({ msg: 'データフォーマット不正', error: flattenError(parseData.error) });
      throw new Error('データフォーマット不正');
    }
    return {
      teamId: parseData.data.PK.S,
      inviteId: parseData.data.SK.S,
      email: parseData.data.email.S,
      teamName: parseData.data.team_name.S,
      token: parseData.data.token.S,
    };
  }

  /** SNSメッセージ作成 */
  private createMessage(parsedData: InvitationNewImageType): string {
    const url = new URL('/invitation', this.config.get('INVITATION_LINK_ORIGIN'));
    url.searchParams.set('teamId', parsedData.teamId);
    url.searchParams.set('inviteId', parsedData.inviteId);
    url.searchParams.set('token', parsedData.token);
    url.searchParams.set('teamName', parsedData.teamName);
    return `チームに参加するには以下のURLを開いてください
チーム名:【${parsedData.teamName}】
URL: ${url}`;
  }
}
