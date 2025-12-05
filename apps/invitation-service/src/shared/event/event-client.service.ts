import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBRecord } from 'aws-lambda';

const EVENT_RECORD_INVITATION = 'invitation' as const;
const EVENT_RECORD_UNKOWN = 'unkown' as const;

type EVENT_RECORD_TYPE = typeof EVENT_RECORD_INVITATION | typeof EVENT_RECORD_UNKOWN;

@Injectable()
export class EventUtilsService {
  private readonly logger = new Logger(EventUtilsService.name);

  /** event recordを分類 */
  classifyEventRecord(record: DynamoDBRecord): EVENT_RECORD_TYPE {
    const { eventID, eventName, dynamodb } = record;
    // typeGarud
    if (eventID == null || eventName == null || dynamodb == null) return EVENT_RECORD_UNKOWN;
    this.logger.log(`EventRecord 受信: ${eventID} - ${eventName}`);
    // DyanamoDBの新規type
    const type = dynamodb.NewImage?.type?.S;
    if (type == null) return EVENT_RECORD_UNKOWN;
    // Invitationチェック
    if (type === 'invitation' && eventName === 'INSERT') {
      return EVENT_RECORD_INVITATION;
    }
    // 不明なイベント
    return EVENT_RECORD_UNKOWN;
  }
}
