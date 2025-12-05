import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { InvitationService } from './invitation/invitation.service';
import { INestApplicationContext } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { EventUtilsService } from './shared/event/event-client.service';

let appContext: INestApplicationContext;
let logger: Logger;
let eventUtils: EventUtilsService;
let invitationService: InvitationService;

// ハンドラー生成
export const createHandler =
  (invitationService: InvitationService, eventUtils: EventUtilsService, logger: Logger) => async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
      try {
        const classify = eventUtils.classifyEventRecord(record);
        // 招待メール送信処理
        if (classify === 'invitation') {
          await invitationService.sendInvitationMain(record);
        }
      } catch (error) {
        logger.error({ msg: '永続エラーのためスキップ', error });
        continue;
      }
    }
    return { ok: true };
  };

export const handler = async (event: DynamoDBStreamEvent) => {
  if (!appContext) {
    appContext = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
    // logger
    logger = appContext.get(Logger);
    appContext.useLogger(logger);
    appContext.flushLogs();
    // サービス
    eventUtils = appContext.get(EventUtilsService);
    invitationService = appContext.get(InvitationService);
  }
  // タイプガード
  if (eventUtils == null) eventUtils = appContext.get(EventUtilsService);
  if (invitationService == null) invitationService = appContext.get(InvitationService);

  // 処理開始
  const lambdaHandler = createHandler(invitationService, eventUtils, logger);
  return lambdaHandler(event);
};
