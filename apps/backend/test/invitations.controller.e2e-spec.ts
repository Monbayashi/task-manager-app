import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v7 as uuid } from 'uuid';

describe('InvitationsController (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;
  let user3: { userId: string; teamId: string; userName: string; email: string; teamName: string };
  let user4: { userId: string; teamId: string; userName: string; email: string; teamName: string };
  let newInvite: {
    teamId: string;
    inviteId: string;
    email: string;
    role: string;
    createdAt: number;
    expiresAt: number;
    invitedBy: string;
    team_name: string;
  };
  let newInviteToken: string;

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

  // HR: -------------------------------------------- [/api/teams/${teamId}/invitation] (POST) --------------------------------------------
  it('/api/teams/${teamId}/invitation (POST) success', async () => {
    // テストデータ作成
    // ユーザ4作成
    mockVerify.mockResolvedValueOnce({ sub: uuid() });
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
    // テスト user3のチーム(TEAM TEST USER3)にuser4を招待する
    const payload = {
      email: 'test4@example.com',
      role: 'member',
      teamName: 'TEAM TEST USER3',
    };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${user3ResBody.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(response.body).toMatchObject({
      teamId: user3ResBody.teamId,
      inviteId: expect.any(String),
      email: 'test4@example.com',
      role: 'member',
      createdAt: expect.any(String),
      expiresAt: expect.any(String),
      invitedBy: user3ResBody.userId,
      team_name: 'TEAM TEST USER3',
    });
    //
    user3 = { ...user3Payload, ...user3ResBody };
    user4 = { ...user4Payload, ...user4ResBody };
    newInvite = {
      teamId: response.body?.teamId,
      inviteId: response.body?.inviteId,
      email: response.body?.email,
      role: response.body?.role,
      createdAt: response.body?.createdAt,
      expiresAt: response.body?.expiresAt,
      invitedBy: response.body?.invitedBy,
      team_name: response.body?.team_name,
    };
    const client = new DynamoDBClient({ endpoint: 'http://localhost:4567', region: 'ap-northeast-1' });
    const tokenRes = await client.send(
      new GetCommand({
        TableName: 'task-table-invitation-v3',
        Key: { PK: `TEAM#${newInvite.teamId}`, SK: `INVITE#${newInvite.inviteId}` },
        ProjectionExpression: '#token',
        ExpressionAttributeNames: { '#token': 'token' },
      })
    );
    client.destroy();
    newInviteToken = tokenRes.Item!.token;
  });

  it('/api/teams/${teamId}/invitation (POST) failure:入力値不正', async () => {
    // テストデータ作成
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト user3のチーム(TEAM TEST USER3)にuser4を招待する
    const payload = {
      email: 'miss',
      role: 'miss',
      teamName: '',
    };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        email: ['正しいメールアドレスを入力してください'],
        role: ['ロール値が不正です (admin / member)'],
        teamName: ['チーム名は2文字以上です'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/invitation] (GET) --------------------------------------------
  it('/api/teams/${teamId}/invitation (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body?.invitations).toContainEqual(newInvite);
  });

  it('/api/teams/${teamId}/invitation (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト
    const missTeamId = '019ae4b1-6571-727a-9748-0539f7234dc2';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/invitation (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = '012345';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/invitation`)
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

  // HR: -------------------------------------------- [/api/teams/${teamId}/invitation/${inviteId}] (GET) --------------------------------------------
  it('/api/teams/${teamId}/invitation/${inviteId} (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newInvite.invitedBy });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body).toEqual(newInvite);
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newInvite.invitedBy });
    // テスト
    const missTeamId = '019ae4b1-6571-727a-9748-0539f7234dc2';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(404);
    expect(response.body).toEqual({ message: 'チーム招待が存在しません', error: 'Not Found', statusCode: 404 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newInvite.invitedBy });
    // テスト
    const missTeamId = '012345';
    const missInviteId = '67890';
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/invitation/${missInviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
        inviteId: ['招待IDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/invitation/${inviteId}] (DELETE) --------------------------------------------
  it('/api/teams/${teamId}/invitation/${inviteId} (DELETE) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト user3のチーム(TEAM TEST USER3)にuser4を招待する -> 2回目
    const payload = {
      email: 'test4@example.com',
      role: 'admin',
      teamName: 'TEAM TEST USER3',
    };
    const newResponse = await request(app.getHttpServer())
      .post(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(newResponse.body).toMatchObject({
      teamId: user3.teamId,
      inviteId: expect.any(String),
      email: 'test4@example.com',
      role: 'admin',
      createdAt: expect.any(String),
      expiresAt: expect.any(String),
      invitedBy: user3.userId,
      team_name: 'TEAM TEST USER3',
    });

    // 件数チェック1: 2件
    const count1Response = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(count1Response.body?.invitations).toHaveLength(2);

    // 削除
    const delResponse = await request(app.getHttpServer())
      .delete(`/api/teams/${newResponse.body.teamId}/invitation/${newResponse.body.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(delResponse.body).toEqual({ teamId: newResponse.body?.teamId, inviteId: newResponse.body?.inviteId });

    // 件数チェック2: 1件
    const count2Response = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(count2Response.body?.invitations).toHaveLength(1);
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (DELETE) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newInvite.invitedBy });
    // テスト
    const missTeamId = '019ae4b1-6571-727a-9748-0539f7234dc2';
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${missTeamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (DELETE) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: newInvite.invitedBy });
    // テスト
    const missTeamId = '012345';
    const missInviteId = '67890';
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${missTeamId}/invitation/${missInviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
        inviteId: ['招待IDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/invitation/${inviteId}] (POST) --------------------------------------------

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:招待が存在しません', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user4.userId });
    // チームメンバーに参加
    const payload = { token: '0000000000000000000000000000000000000000000000000000000000000000' };
    const notFoundInviteId = '019ae6e7-df78-7012-abe4-dd2b86d1933d';
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${notFoundInviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(404);
    expect(response.body).toEqual({ message: 'この招待は無効です', error: 'Not Found', statusCode: 404 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:トークン不一致', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user4.userId });
    // チームメンバーに参加
    const payload = { token: '0000000000000000000000000000000000000000000000000000000000000000' };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(403);
    expect(response.body).toEqual({ message: '招待トークンが無効です', error: 'Forbidden', statusCode: 403 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:期限切れの招待です', async () => {
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // テスト user3のチーム(TEAM TEST USER3)にuser4を招待する -> 2回目
    const invitePayload = {
      email: 'test4@example.com',
      role: 'admin',
      teamName: 'TEAM TEST USER3',
    };
    const inviteResponse = await request(app.getHttpServer())
      .post(`/api/teams/${user3.teamId}/invitation`)
      .set('Authorization', 'Bearer mock-token')
      .send(invitePayload)
      .expect(201);
    // トークン有効期限を0に変更 -> DBからtoken取得
    const client = new DynamoDBClient({ endpoint: 'http://localhost:4567', region: 'ap-northeast-1' });
    await client.send(
      new UpdateCommand({
        TableName: 'task-table-invitation-v3',
        Key: { PK: `TEAM#${inviteResponse.body?.teamId}`, SK: `INVITE#${inviteResponse.body?.inviteId}` },
        UpdateExpression: 'set expiresAt = :at',
        ExpressionAttributeValues: { ':at': 0 },
      })
    );
    const tokenRes = await client.send(
      new GetCommand({
        TableName: 'task-table-invitation-v3',
        Key: { PK: `TEAM#${inviteResponse.body?.teamId}`, SK: `INVITE#${inviteResponse.body?.inviteId}` },
        ProjectionExpression: '#token, PK, SK',
        ExpressionAttributeNames: { '#token': 'token' },
      })
    );
    client.destroy();
    // モック
    mockVerify.mockResolvedValue({ sub: user4.userId });
    // チームメンバーに参加
    const payload = { token: (tokenRes.Item as { token: string }).token };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${inviteResponse.body?.teamId}/invitation/${inviteResponse.body?.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(410);
    expect(response.body).toEqual({ message: 'この招待は期限切れです', error: 'Gone', statusCode: 410 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:ユーザが存在しません', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: 'c7048a58-0091-7073-9687-f89cd0cec01e' });
    // テスト
    const payload = { token: newInviteToken };
    const addResponse = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(404);
    expect(addResponse.body).toEqual({ message: 'ユーザが存在しません', error: 'Not Found', statusCode: 404 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:チームメンバー重複', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user3.userId });
    // チームメンバーに参加
    const payload = { token: newInviteToken };
    const addResponse = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(409);
    expect(addResponse.body).toEqual({ message: 'すでにこのチームに参加しています', error: 'Conflict', statusCode: 409 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:メールアドレス不一致', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // チームメンバーに参加
    const payload = { token: newInviteToken };
    const addResponse = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(403);
    expect(addResponse.body).toEqual({ message: '招待されたユーザと一致しません', error: 'Forbidden', statusCode: 403 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) failure:チームが存在しません', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // 招待を新規作成
    const missTeamId = uuid();
    const missInviteId = uuid();
    const missToken = '0000000000000000000000000000000000000000000000000000000000000000';
    const client = new DynamoDBClient({ endpoint: 'http://localhost:4567', region: 'ap-northeast-1' });
    await client.send(
      new PutCommand({
        TableName: 'task-table-invitation-v3',
        Item: {
          PK: `TEAM#${missTeamId}`,
          SK: `INVITE#${missInviteId}`,
          type: 'invitation',
          email: 'test1@example.com',
          user_role: 'admin',
          createdAt: 9999999999,
          expiresAt: 9999999999,
          invitedBy: `USER#${user3.userId}`,
          token: missToken,
          team_name: '存在しないチーム',
        },
      })
    );
    client.destroy();
    // チームメンバーに参加
    const payload = { token: missToken };
    const addResponse = await request(app.getHttpServer())
      .post(`/api/teams/${missTeamId}/invitation/${missInviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(404);
    expect(addResponse.body).toEqual({ message: 'チームが存在しません', error: 'Not Found', statusCode: 404 });
  });

  it('/api/teams/${teamId}/invitation/${inviteId} (POST) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: user4.userId });
    // user4のチーム数1: 1
    const teamCount1Response = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(teamCount1Response.body?.teams).toHaveLength(1);
    // チームメンバーに参加
    const payload = { token: newInviteToken };
    const addResponse = await request(app.getHttpServer())
      .post(`/api/teams/${newInvite.teamId}/invitation/${newInvite.inviteId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(addResponse.body).toEqual({
      teamId: newInvite.teamId,
      userId: user4.userId,
      inviteId: newInvite.inviteId,
    });
    // user4のチーム数2: 2
    const teamCount2Response = await request(app.getHttpServer()).get('/api/users/me').set('Authorization', 'Bearer mock-token').expect(200);
    expect(teamCount2Response.body?.teams).toHaveLength(2);
    // user3のチームにuser4がメンバーとして追加されている。
    const teamMemberResponse = await request(app.getHttpServer())
      .get(`/api/teams/${user3.teamId}/team-member`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(teamMemberResponse.body?.users).toContainEqual({
      teamId: user3.teamId,
      userId: user4.userId,
      userName: user4.userName,
      userTeamRole: 'member',
      joinedAt: expect.any(String),
    });
  });
});
