import { AppModule } from '../src/app.module';
import { createHandler } from '../src/main';
import { InvitationService } from '../src/invitation/invitation.service';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { EventUtilsService } from './shared/event/event-client.service';

// sesモック
jest.mock('@aws-sdk/client-ses', () => ({
  ...jest.requireActual('@aws-sdk/client-ses'),
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

describe('handler', () => {
  let lambdaHandler: ReturnType<typeof createHandler>;
  beforeAll(async () => {
    const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
    // logger
    const logger = app.get(Logger);
    app.useLogger(logger);
    app.flushLogs();
    // ハンドラ作成
    const eventUtils = app.get(EventUtilsService);
    const invitationService = app.get(InvitationService);
    lambdaHandler = createHandler(invitationService, eventUtils, logger);
  });

  it('成功: 正常', async () => {
    const res = await lambdaHandler({
      Records: [
        {
          eventID: '5d66d034',
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              PK: { S: 'TEAM#019ae856-d721-736a-bf4c-ea93833ee099' },
              SK: { S: 'INVITE#019aed22-e0dc-731c-aec0-9abb9c39a13d' },
              type: { S: 'invitation' },
              email: { S: 'monba843@gmail.com' },
              user_role: { S: 'member' },
              createdAt: { N: '1764915077' },
              expiresAt: { N: '1765519877' },
              invitedBy: { S: 'USER#d7048a58-0091-7073-9687-f89cd0cec01e' },
              token: {
                S: '2659cd8f0e2c12d3f140d9580a62b043c1eb5e4e78a534cb556cf97b2bc400db',
              },
              team_name: { S: 'わたしのチーム' },
            },
          },
        },
      ],
    });
    expect(res).toEqual({ ok: true });
  });

  it('成功: エラーが発生するデータを渡しても ok:true', async () => {
    const res = await lambdaHandler({
      Records: [
        {
          eventID: '5d66d034',
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              PK: { S: 'TEAM#019ae856-d721-736a-bf4c-ea93833ee099' },
              SK: { S: 'INVITE#019aed22-e0dc-731c-aec0-9abb9c39a13d' },
            },
          },
        },
      ],
    });
    expect(res).toEqual({ ok: true });
  });
});
