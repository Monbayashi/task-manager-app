import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import { v7 as uuid } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

describe('TeamsController (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;
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

  // HR: -------------------------------------------- [/api/teams/${teamId}] (GET) --------------------------------------------
  it('/api/teams/${teamId} (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const newResult = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(newResult.body).toMatchObject({
      teamId: DEFAULT_USER1.teamId,
      teamName: DEFAULT_USER1.teamName,
      teamDiscription: '',
      createdAt: expect.any(String),
    });
  });

  it('/api/teams/${teamId} (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer()).get(`/api/teams/${missTeamId}`).set('Authorization', 'Bearer mock-token').expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId} (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = '012345';
    const response = await request(app.getHttpServer()).get(`/api/teams/${missTeamId}`).set('Authorization', 'Bearer mock-token').expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/register] (POST) --------------------------------------------
  it('/api/teams/register (POST) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: 'TEAM NEW' };
    const response = await request(app.getHttpServer())
      .post('/api/teams/register')
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(response.body).toHaveProperty('teamId');
    expect(response.body).toHaveProperty('createdAt');

    // 作成したチームの確認
    newTeamId = response.body?.teamId;
    const newResult = await request(app.getHttpServer()).get(`/api/teams/${newTeamId}`).set('Authorization', 'Bearer mock-token').expect(200);
    expect(newResult.body).toMatchObject({
      teamId: expect.any(String),
      teamName: 'TEAM NEW',
      teamDiscription: '',
      createdAt: expect.any(String),
    });

    // ユーザデータの存在確認
    const newUserResult = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(newUserResult.body?.teams).toContainEqual({ teamId: newTeamId, name: 'TEAM NEW', role: 'admin', joinedAt: expect.any(String) });
  });

  it('/api/teams/register (POST) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: '01234567890123457' }; // 17文字
    const response = await request(app.getHttpServer())
      .post('/api/teams/register')
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamName: ['チーム名は16文字までです'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}] (PUT) --------------------------------------------
  it('/api/teams/${teamId} (PUT) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: 'TEAM UPD' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTeamId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body?.newTeamName).toBe('TEAM UPD');

    // 作成したチームの確認
    const newResult = await request(app.getHttpServer()).get(`/api/teams/${newTeamId}`).set('Authorization', 'Bearer mock-token').expect(200);
    expect(newResult.body).toMatchObject({
      teamId: expect.any(String),
      teamName: 'TEAM UPD',
      teamDiscription: '',
      createdAt: expect.any(String),
    });

    // ユーザデータの存在確認
    const newUserResult = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(newUserResult.body?.teams).toContainEqual({ teamId: newTeamId, name: 'TEAM UPD', role: 'admin', joinedAt: expect.any(String) });
  });

  it('/api/teams/${teamId} (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: 'TEAM UPD' };
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${missTeamId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId} (PUT) failure:入力値不正 (BODY)', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: '01234567890123457' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTeamId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamName: ['チーム名は16文字までです'],
      },
    });
  });

  it('/api/teams/${teamId} (PUT) failure:入力値不正 (PARAM)', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { teamName: 'TEAM UPD' };
    const missTeamId = '012345';
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${missTeamId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/team-member] (GET) --------------------------------------------
  it('/api/teams/${teamId}/team-member (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body?.users).toContainEqual({
      teamId: DEFAULT_USER1.teamId,
      userId: DEFAULT_USER1.userId,
      userName: DEFAULT_USER1.userName,
      userTeamRole: 'admin',
      joinedAt: expect.any(String),
    });
  });

  it('/api/teams/${teamId}/team-member (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = '019ae366-ef92-7330-a2fb-d075451e86ce';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/team-member (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = '012345';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/team-member/${userId}] (PUT) --------------------------------------------
  let user3: { userId: string; teamId: string; userName: string; email: string; teamName: string };
  let user4: { userId: string; teamId: string; userName: string; email: string; teamName: string };
  const createTeamMember = async () => {
    // ユーザ4作成
    mockVerify.mockResolvedValue({ sub: uuid() });
    const user4Payload = { userName: 'TEST USER4', email: 'test4@example.com', teamName: 'TEAM TEST USER4' };
    const { body: user4ResBody }: { body: { userId: string; teamId: string } } = await request(app.getHttpServer())
      .post('/api/users/register')
      .set('Authorization', 'Bearer mock-token')
      .send(user4Payload)
      .expect(201);
    // ユーザ3作成
    mockVerify.mockResolvedValue({ sub: uuid() });
    const user3Payload = { userName: 'TEST USER3', email: 'test3@example.com', teamName: 'TEAM TEST USER3' };
    const { body: user3ResBody }: { body: { userId: string; teamId: string } } = await request(app.getHttpServer())
      .post('/api/users/register')
      .set('Authorization', 'Bearer mock-token')
      .send(user3Payload)
      .expect(201);
    user3 = { ...user3Payload, ...user3ResBody };
    user4 = { ...user4Payload, ...user4ResBody };
    // テスト user3のチーム(TEAM TEST USER3)にuser4を招待する (MEMBER)
    const inviteResponse = await request(app.getHttpServer())
      .post(`/api/teams/${user3ResBody.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .send({ email: 'test4@example.com', role: 'member', teamName: 'TEAM TEST USER3' })
      .expect(201);
    // 招待トークン取得
    const client = new DynamoDBClient({ endpoint: 'http://localhost:4567', region: 'ap-northeast-1' });
    const tokenRes = await client.send(
      new GetCommand({
        TableName: 'task-table-invitation-v3',
        Key: { PK: `TEAM#${inviteResponse.body?.teamId}`, SK: `INVITE#${inviteResponse.body?.inviteId}` },
        ProjectionExpression: '#token',
        ExpressionAttributeNames: { '#token': 'token' },
      })
    );
    client.destroy();
    const newInviteToken = tokenRes.Item!.token;
    // user4がuser3のチームに参加
    mockVerify.mockResolvedValue({ sub: user4.userId });
    // チームメンバーに参加
    await request(app.getHttpServer())
      .post(`/api/teams/${inviteResponse.body?.teamId}/invitation/${inviteResponse.body?.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ token: newInviteToken })
      .expect(201);
  };

  it('/api/teams/${teamId}/team-member/${userId} (PUT) success', async () => {
    // テストデータ作成
    await createTeamMember();
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト前確認
    const preResponse = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(preResponse.body?.users).toContainEqual({
      teamId: user3.teamId,
      userId: user4.userId,
      userName: user4.userName,
      userTeamRole: 'member',
      joinedAt: expect.any(String),
    });
    // テスト user4 member -> user4 admin
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${user3.teamId}/team-member/${user4.userId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ role: 'admin' })
      .expect(200);
    expect(response.body).toEqual({ teamId: user3.teamId, userId: user4.userId });
    // テスト後確認
    const aftResponse = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(aftResponse.body?.users).toContainEqual({
      teamId: user3.teamId,
      userId: user4.userId,
      userName: user4.userName,
      userTeamRole: 'admin',
      joinedAt: expect.any(String),
    });
  });

  it('/api/teams/${teamId}/team-member/${userId} (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${user3.teamId}/team-member/${user4.userId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ role: 'member' })
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/team-member/${userId} (PUT) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${user3.teamId}/team-member/${user4.userId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ role: 'err' })
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        role: ['ロール値が不正です (admin / member)'],
      },
    });
  });
  // HR: -------------------------------------------- [/api/teams/${teamId}/team-member/${userId}] (DELETE) --------------------------------------------
  it('/api/teams/${teamId}/team-member/${userId} (DELETE) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${user3.teamId}/team-member/${user4.userId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/team-member/${userId} (DELETE) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/123/team-member/456`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });

  it('/api/teams/${teamId}/team-member/${userId} (DELETE) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト前確認
    const preResponse = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(preResponse.body?.users).toContainEqual({
      teamId: user3.teamId,
      userId: user4.userId,
      userName: user4.userName,
      userTeamRole: expect.any(String),
      joinedAt: expect.any(String),
    });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${user3.teamId}/team-member/${user4.userId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body).toEqual({ teamId: user3.teamId, userId: user4.userId });
    // テスト後確認
    const aftResponse = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(aftResponse.body?.users).not.toContainEqual({
      teamId: user3.teamId,
      userId: user4.userId,
      userName: user4.userName,
      userTeamRole: expect.any(String),
      joinedAt: expect.any(String),
    });
  });
});
