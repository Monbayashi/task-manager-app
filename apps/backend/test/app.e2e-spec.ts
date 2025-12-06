import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';

/** 認証が必要なエンドポイント一覧 */
const AUTH_API_PATHS: { method: 'get' | 'delete' | 'post' | 'put'; path: `/api/${string}` }[] = [
  // users
  { method: 'get', path: '/api/users/me' },
  { method: 'post', path: '/api/users/register' },
  { method: 'put', path: '/api/users/update' },
  // teams
  { method: 'get', path: '/api/teams/teamId' },
  { method: 'put', path: '/api/teams/teamId' },
  { method: 'post', path: '/api/teams/register' },
  { method: 'get', path: '/api/teams/teamId/team-member' },
  { method: 'put', path: '/api/teams/teamId/team-member/userId' },
  { method: 'delete', path: '/api/teams/teamId/team-member/userId' },
  // tasks
  { method: 'get', path: '/api/teams/teamId/tasks' },
  { method: 'post', path: '/api/teams/teamId/tasks' },
  { method: 'get', path: '/api/teams/teamId/tasks/taskId' },
  { method: 'put', path: '/api/teams/teamId/tasks/taskId' },
  { method: 'delete', path: '/api/teams/teamId/tasks/taskId' },
  // tags
  { method: 'get', path: '/api/teams/teamId/tags' },
  { method: 'post', path: '/api/teams/teamId/tags' },
  { method: 'put', path: '/api/teams/teamId/tags/tagId' },
  { method: 'delete', path: '/api/teams/teamId/tags/tagId' },
  // invitations
  { method: 'get', path: '/api/teams/teamId/invitation' },
  { method: 'post', path: '/api/teams/teamId/invitation' },
  { method: 'get', path: '/api/teams/teamId/invitation/inviteId' },
  { method: 'post', path: '/api/teams/teamId/invitation/inviteId' },
  { method: 'delete', path: '/api/teams/teamId/invitation/inviteId' },
  // summary
  { method: 'get', path: '/api/summary/counts' },
] as const;

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
  describe('共通テスト failure:認証ヘッダーが未設定', () => {
    it.each(AUTH_API_PATHS.map((p) => [p.method, p.path]))('%s %s の認証なし → 401', async (method, path) => {
      const res = await request(app.getHttpServer())[method](path).expect(401);
      expect(res.body).toEqual({ message: '認証ヘッダーが存在しません', error: 'Unauthorized', statusCode: 401 });
    });
  });

  // トークンの有効期限が切れ
  describe('共通テスト failure:トークンの有効期限が切れ', () => {
    it.each(AUTH_API_PATHS.map((p) => [p.method, p.path]))('%s %s の認証なし → 401', async (method, path) => {
      mockVerify.mockRejectedValueOnce(new JwtExpiredError('Token expired', undefined));
      const res = await request(app.getHttpServer())[method](path).set('Authorization', 'Bearer mock-token').expect(401);
      expect(res.body).toEqual({ message: 'アクセストークンの有効期限が切れています', error: 'Unauthorized', statusCode: 401 });
    });
  });

  // 認証に失敗しました
  describe('共通テスト failure::認証に失敗しました', () => {
    it.each(AUTH_API_PATHS.map((p) => [p.method, p.path]))('%s %s の認証なし → 401', async (method, path) => {
      mockVerify.mockRejectedValueOnce(new Error('モックエラー'));
      const res = await request(app.getHttpServer())[method](path).set('Authorization', 'Bearer mock-token').expect(401);
      expect(res.body).toEqual({ message: '認証に失敗しました: モックエラー', error: 'Unauthorized', statusCode: 401 });
    });
  });

  // 不明なエラー
  describe('共通テスト failure::認証に失敗しました', () => {
    it.each(AUTH_API_PATHS.map((p) => [p.method, p.path]))('%s %s の認証なし → 401', async (method, path) => {
      mockVerify.mockRejectedValueOnce({});
      const res = await request(app.getHttpServer())[method](path).set('Authorization', 'Bearer mock-token').expect(401);
      expect(res.body).toEqual({ message: '無効なトークンです', error: 'Unauthorized', statusCode: 401 });
    });
  });
});
