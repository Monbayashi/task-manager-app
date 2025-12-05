import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';

describe('全Controller共通テスト (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;

  beforeAll(async () => {
    // モック
    mockVerify = jest.fn();
    jest.spyOn(CognitoJwtVerifier, 'create').mockImplementation(() => ({ verify: mockVerify }) as any);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({ bufferLogs: true });
    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 認証ヘッダー未設定エラー
  it('共通 (GET) failure:認証ヘッダーが未設定', async () => {
    const res = await request(app.getHttpServer()).get('/api/users/me').expect(401);
    expect(res.body).toEqual({ message: '認証ヘッダーが存在しません', error: 'Unauthorized', statusCode: 401 });
  });

  // トークンの有効期限が切れ
  it('共通 (GET) failure:トークンの有効期限が切れ', async () => {
    // モック
    mockVerify.mockRejectedValueOnce(new JwtExpiredError('Token expired', undefined));
    // テスト
    const res = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(401);
    expect(res.body).toEqual({ message: 'アクセストークンの有効期限が切れています', error: 'Unauthorized', statusCode: 401 });
  });

  // 認証に失敗しました
  it('共通 (GET) failure:認証に失敗しました', async () => {
    // モック
    mockVerify.mockRejectedValueOnce(new Error('モックエラー'));
    // テスト
    const res = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(401);
    expect(res.body).toEqual({ message: '認証に失敗しました: モックエラー', error: 'Unauthorized', statusCode: 401 });
  });

  // 不明なエラー
  it('共通 (GET) failure:不明なエラー', async () => {
    // モック
    mockVerify.mockRejectedValueOnce({});
    // テスト
    const res = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(401);
    expect(res.body).toEqual({ message: '無効なトークンです', error: 'Unauthorized', statusCode: 401 });
  });
});
