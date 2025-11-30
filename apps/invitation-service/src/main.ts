import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { InvitationService } from './invitation/invitation.service';
import { INestApplicationContext } from '@nestjs/common';

let appContext: INestApplicationContext | undefined;

export const handler = async (event: DynamoDBStreamEvent) => {
  try {
    console.log('☆=== Lambda START 【v25】 ===');
    console.log('Raw event:', JSON.stringify(event, null, 2));
    const start = Date.now();

    if (!appContext) {
      console.log('☆Creating NestJS app context...');
      appContext = await NestFactory.createApplicationContext(AppModule);
      console.log('NestJS context created');
    }
    const service = appContext.get(InvitationService);
    const data = service.parse(event);
    await service.sendEmail(data);
    console.log('☆sendEmail executed');
    const end = Date.now();
    console.log(`☆=== Lambda END 【v25】===: ${end - start}ms`);
    return { ok: true }; // Lambda が終了したことを明示
  } catch (err) {
    console.error('☆Lambda ERROR:', err);
  }
};
