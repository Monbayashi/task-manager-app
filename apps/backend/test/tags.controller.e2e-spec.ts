import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import request from 'supertest';
import { v7 as uuid } from 'uuid';

describe('TagsController (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;
  let newTag: {
    teamId: string;
    tagId: string;
    tagName: string;
    tagColor: { color: string; backgroundColor: string };
  };

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

  // HR: -------------------------------------------- [/api/teams/${teamId}/tags] (POST) --------------------------------------------
  it('/api/teams/${teamId}/tags (POST) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: 'TAG NAME', tagColor: { color: 'white', backgroundColor: 'black' } };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(response.body).toEqual({
      teamId: DEFAULT_USER1.teamId,
      tagId: expect.any(String),
      tagName: 'TAG NAME',
      tagColor: { color: 'white', backgroundColor: 'black' },
      createdAt: expect.any(String),
    });
    newTag = { ...response.body };
  });

  it('/api/teams/${teamId}/tags (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: 'TAG ERROR', tagColor: { color: 'white', backgroundColor: 'black' } };
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${missTeamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tags (POST) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: '', tagColor: { color: '', backgroundColor: '' } };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        tagColor: ['タグカラーは1文字以上です', 'タグバックエンドカラーは1文字以上です'],
        tagName: ['チーム名は2文字以上です'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tags] (GET) --------------------------------------------
  it('/api/teams/${teamId}/tags (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body.tags).toContainEqual({
      ...newTag,
      createdAt: expect.any(String),
    });
  });

  it('/api/teams/${teamId}/tags (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer()).get(`/api/teams/${missTeamId}/tags`).set('Authorization', 'Bearer mock-token').expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tags (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer()).get(`/api/teams/123/tags`).set('Authorization', 'Bearer mock-token').expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tags/${tagId}] (PUT) --------------------------------------------
  it('/api/teams/${teamId}/tags/${tagId} (PUT) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: 'TAG NAME V2', tagColor: { color: 'gray', backgroundColor: 'gray' } };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTag.teamId}/tags/${newTag.tagId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      teamId: newTag.teamId,
      tagId: newTag.tagId,
      tagName: 'TAG NAME V2',
      tagColor: { color: 'gray', backgroundColor: 'gray' },
      createdAt: expect.any(String),
    });
    newTag = { ...response.body };
  });

  it('/api/teams/${teamId}/tags/${tagId} (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: 'TAG NAME V2', tagColor: { color: 'gray', backgroundColor: 'gray' } };
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${missTeamId}/tags/${newTag.tagId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tags/${tagId} (PUT) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: '', tagColor: { color: '', backgroundColor: '' } };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTag.teamId}/tags/${newTag.tagId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        tagColor: ['タグカラーは1文字以上です', 'タグバックエンドカラーは1文字以上です'],
        tagName: ['チーム名は2文字以上です'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tags/${tagId}] (DELETE) --------------------------------------------

  it('/api/teams/${teamId}/tags/${tagId} (DELETE) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${missTeamId}/tags/${newTag.tagId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tags/${tagId} (DELETE) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/123456789/tags/123456789`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
        tagId: ['タグIDは有効なID形式で入力してください'],
      },
    });
  });

  it('/api/teams/${teamId}/tags/${tagId} (DELETE) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${newTag.teamId}/tags/${newTag.tagId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body).toEqual({
      teamId: newTag.teamId,
      tagId: newTag.tagId,
    });
    // 件数
    const countResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    const tags = countResponse.body.tags.find((tag: { teamId: string; tagId: string }) => tag.teamId === newTag.teamId && tag.tagId === newTag.tagId);
    expect(tags).toBeUndefined();
  });
});
