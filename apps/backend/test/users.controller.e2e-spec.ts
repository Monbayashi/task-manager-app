import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import { v7 as uuid } from 'uuid';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;
  let newUserId: string = '';
  let newTeamId: string = '';

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

  // HR: -------------------------------------------- [/api/users/me] (GET) --------------------------------------------
  it('/api/users/me (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(response.body?.user).toEqual({ email: DEFAULT_USER1.email, name: DEFAULT_USER1.userName, createdAt: DEFAULT_USER1.userCreatedAt });
    expect(response.body?.teams).toContainEqual({
      teamId: DEFAULT_USER1.teamId,
      name: DEFAULT_USER1.teamName,
      role: 'admin',
      joinedAt: DEFAULT_USER1.teamJoinedAt,
    });
  });

  it('/api/users/me (GET) failure:未登録ユーザ', async () => {
    // モック
    mockVerify.mockResolvedValueOnce({ sub: uuid() });
    // テスト
    const response = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(404);
    expect(response.body).toEqual({ message: 'データが存在しません', error: 'Not Found', statusCode: 404 });
  });

  // HR: -------------------------------------------- [/api/users/register] (POST) --------------------------------------------
  it('/api/users/register (POST) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: uuid() });
    // テスト
    const payload = { userName: 'TEST USER2', email: 'test2@example.com', teamName: 'TEAM TEST USER2' };
    const response = await request(app.getHttpServer())
      .post('/api/users/register')
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('teamId');

    // 登録データの存在確認
    newUserId = response.body?.userId;
    newTeamId = response.body?.teamId;
    const newResult = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(newResult.body?.user).toMatchObject({ email: 'test2@example.com', name: 'TEST USER2' });
    expect(newResult.body?.teams).toContainEqual({ teamId: newTeamId, name: 'TEAM TEST USER2', role: 'admin', joinedAt: expect.any(String) });
  });

  it('/api/users/register (POST) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValueOnce({ sub: newUserId });
    // テスト
    const payload = { userName: '', email: '', teamName: '' };
    const response = await request(app.getHttpServer())
      .post('/api/users/register')
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: { email: ['正しいメールアドレスを入力してください'], teamName: ['チーム名は2文字以上です'], userName: ['ユーザ名は2文字以上です'] },
    });
  });

  it('/api/users/register (POST) failure:既に登録ユーザ', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newUserId });
    // テスト
    const payload = { userName: 'TEST USER2', email: 'test2@example.com', teamName: 'TEAM TEST USER2' };
    const response = await request(app.getHttpServer())
      .post('/api/users/register')
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      error: 'Conflict',
      message: '条件付き書き込みに失敗しました',
    });
  });

  // HR: -------------------------------------------- [/api/users/update] (PUT) --------------------------------------------
  it('/api/users/update (PUT) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newUserId });
    // テスト
    const payload = { userName: 'TEST USER2 v2' };
    const response = await request(app.getHttpServer()).put('/api/users/update').set('Authorization', 'Bearer mock-token').send(payload).expect(200);
    expect(response.body).toEqual({ newUserName: 'TEST USER2 v2' });

    // 登録データの存在確認
    const newResult = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(newResult.body?.user).toMatchObject({ email: 'test2@example.com', name: 'TEST USER2 v2' });

    // チームメンバーの名称変更を確認
    const teamMembeRresponse = await request(app.getHttpServer())
      .get(`/api/teams/${newTeamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(teamMembeRresponse.body?.users).toContainEqual({
      teamId: newTeamId,
      userId: newUserId,
      userName: 'TEST USER2 v2',
      userTeamRole: 'admin',
      joinedAt: expect.any(String),
    });
  });

  it('/api/users/update (PUT) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newUserId });
    // テスト
    const payload = { userName: '01234567890123457' }; // 17文字
    const response = await request(app.getHttpServer()).put('/api/users/update').set('Authorization', 'Bearer mock-token').send(payload).expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: { userName: ['ユーザ名は16文字までです'] },
    });
  });
});
