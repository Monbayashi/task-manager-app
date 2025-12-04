import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import { v7 as uuid } from 'uuid';

describe('SummaryController (e2e)', () => {
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

  const createTaskWithoutDiscription = async (
    teamId: string,
    payload: {
      title: string;
      discription: string;
      status: 'todo' | 'doing' | 'done';
      tagRefs: string[];
      startTime: string;
      endTime: string;
    }
  ) => {
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    delete response.body.discription;
    return response.body;
  };

  // HR: -------------------------------------------- [/api/summary/counts] (GET) --------------------------------------------
  it('/api/summary/counts (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テストデータ作成
    // チーム作成
    const teamResponse = await request(app.getHttpServer())
      .post('/api/teams/register')
      .set('Authorization', 'Bearer mock-token')
      .send({ teamName: 'TEAM NEW' })
      .expect(201);
    const newTeamId: string = teamResponse.body.teamId;
    // タスク作成
    const t1 = await createTaskWithoutDiscription(newTeamId, {
      title: 'T1',
      discription: 'D1',
      status: 'todo',
      tagRefs: [],
      startTime: '2025-12-01T01:00:00+09:00',
      endTime: '2025-12-02T01:00:00+09:00',
    });
    const t2 = await createTaskWithoutDiscription(newTeamId, {
      title: 'T2',
      discription: 'D2',
      status: 'doing',
      tagRefs: [],
      startTime: '2025-12-03T01:00:00+09:00',
      endTime: '2025-12-04T01:00:00+09:00',
    });
    const t3 = await createTaskWithoutDiscription(newTeamId, {
      title: 'T3',
      discription: 'D3',
      status: 'done',
      tagRefs: [],
      startTime: '2025-12-05T01:00:00+09:00',
      endTime: '2025-12-06T01:00:00+09:00',
    });
    // テスト
    const summary1Response = await request(app.getHttpServer())
      .get(`/api/summary/counts`)
      .set('Authorization', 'Bearer mock-token')
      .query({ teamId: newTeamId })
      .expect(200);
    const today = new Date().toISOString().split('T')[0];
    expect(summary1Response.body).toEqual({
      all: { todo: 1, doing: 1, done: 1 },
      daily: [
        {
          date: today,
          todo: 1,
          doing: 1,
          done: 1,
        },
      ],
    });
    // t1:todo -> doing & t2:doing -> done & t3:delete
    await request(app.getHttpServer())
      .put(`/api/teams/${t1.teamId}/tasks/${t1.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'doing' })
      .expect(200);
    await request(app.getHttpServer())
      .put(`/api/teams/${t2.teamId}/tasks/${t2.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'done' })
      .expect(200);
    await request(app.getHttpServer()).delete(`/api/teams/${t3.teamId}/tasks/${t3.taskId}`).set('Authorization', 'Bearer mock-token').expect(200);
    const summary2Response = await request(app.getHttpServer())
      .get(`/api/summary/counts`)
      .set('Authorization', 'Bearer mock-token')
      .query({ teamId: newTeamId })
      .expect(200);
    expect(summary2Response.body).toEqual({
      all: { todo: 0, doing: 1, done: 1 },
      daily: [
        {
          date: today,
          todo: 0,
          doing: 1,
          done: 1,
        },
      ],
    });
  });

  it('/api/summary/counts (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .get(`/api/summary/counts`)
      .set('Authorization', 'Bearer mock-token')
      .query({ teamId: missTeamId })
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/summary/counts (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/summary/counts`)
      .set('Authorization', 'Bearer mock-token')
      .query({ teamId: '123456789' })
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });
});
