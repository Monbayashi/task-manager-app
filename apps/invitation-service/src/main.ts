import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { InvitationService } from './invitation/invitation.service';
import { INestApplicationContext } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

let appContext: INestApplicationContext | undefined;

export const handler = async (event: DynamoDBStreamEvent) => {
  if (!appContext) {
    appContext = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  }
  // logger
  const logger = appContext.get(Logger);
  appContext.useLogger(logger);
  appContext.flushLogs();
  // 処理開始
  logger.log('=== Lambda START 【v25】 ===');
  logger.log(event);
  const service = appContext.get(InvitationService);
  const data = service.parse(event);
  await service.sendEmail(data);
  logger.log('sendEmail executed');
  logger.log(`=== Lambda END 【v25】===`);
  return { ok: true };
};
