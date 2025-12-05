import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { DEFAULT_USER1 } from './data/default-data';
import request from 'supertest';
import { v7 as uuid } from 'uuid';

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;
  let mockVerify: jest.Mock;
  let tag1: { teamId: string; tagId: string; tagName: string };
  let newTask: {
    teamId: string;
    taskId: string;
    title: string;
    discription: string;
    status: 'todo' | 'doing' | 'done';
    startTime: string;
    endTime: string;
    tagRefs: string[];
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

  const createTag = async () => {
    // モックasync
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagName: 'TAG NAME', tagColor: { color: 'white', backgroundColor: 'black' } };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tags`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    tag1 = { ...response.body };
  };

  const createTaskWithoutDiscription = async (payload: {
    title: string;
    discription: string;
    status: 'todo' | 'doing' | 'done';
    tagRefs: string[];
    startTime: string;
    endTime: string;
  }) => {
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    delete response.body.discription;
    return response.body;
  };

  // HR: -------------------------------------------- [/api/teams/${teamId}/tasks] (POST) --------------------------------------------
  it('/api/teams/${teamId}/tasks (POST) success', async () => {
    await createTag();
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = {
      title: 'TASK TITLE 1',
      discription: 'TASK DISCRIPTION 1',
      status: 'todo',
      tagRefs: [tag1.tagId],
      startTime: '2025-12-04T13:53:00+09:00',
      endTime: '2025-12-11T13:53:00+09:00',
    };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(201);
    expect(response.body).toEqual({
      teamId: DEFAULT_USER1.teamId,
      taskId: expect.any(String),
      title: 'TASK TITLE 1',
      discription: 'TASK DISCRIPTION 1',
      status: 'todo',
      startTime: '2025-12-04T13:53:00+09:00',
      endTime: '2025-12-11T13:53:00+09:00',
      tagRefs: [tag1.tagId],
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = {
      title: 'TASK TITLE 1',
      discription: 'TASK DISCRIPTION 1',
      status: 'todo',
      tagRefs: [tag1.tagId],
      startTime: '2025-12-04T13:53:00+09:00',
      endTime: '2025-12-11T13:53:00+09:00',
    };
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${missTeamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tasks (POST) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = {
      title: '',
      discription: '',
      status: 'todo1',
      tagRefs: ['123456789'],
      startTime: '',
      endTime: '',
    };
    const response = await request(app.getHttpServer())
      .post(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        title: ['タイトルは1文字以上です'],
        discription: ['説明は1文字以上です'],
        status: ['ステータス値が不正です (todo / doing / done)'],
        tagRefs: ['タグIDは有効なID形式で入力してください'],
        endTime: ['有効な日付（ISO 8601形式）を入力してください'],
        startTime: ['有効な日付（ISO 8601形式）を入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tasks/${taskId}] (GET) --------------------------------------------
  it('/api/teams/${teamId}/tasks/${taskId} (GET) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      createdAt: expect.any(String),
    });
  });

  it('/api/teams/${teamId}/tasks/${taskId} (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .get(`/api/teams/${missTeamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tasks/${taskId} (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .get(`/api/teams/123456789/tasks/123456789`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
        taskId: ['タスクIDは有効なID形式で入力してください'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tasks/${taskId}] (PUT) --------------------------------------------
  it('/api/teams/${teamId}/tasks/${taskId} (PUT) success: title', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { title: 'TASK TITLE 1 V2' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      title: 'TASK TITLE 1 V2',
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) success: discription', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { discription: 'TASK DISCRIPTION 1 V2' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      discription: 'TASK DISCRIPTION 1 V2',
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) success: status', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { status: 'doing' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      status: 'doing',
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) success: tagRefs', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { tagRefs: [] };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      tagRefs: [],
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) success: startTime, endTime', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { startTime: '2025-12-07T13:53:00+09:00', endTime: '2025-12-13T13:53:00+09:00' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(200);
    expect(response.body).toEqual({
      ...newTask,
      startTime: '2025-12-07T13:53:00+09:00',
      endTime: '2025-12-13T13:53:00+09:00',
      createdAt: expect.any(String),
    });
    newTask = { ...response.body };
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const payload = { title: 'TASK TITLE 1 V2' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${missTeamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tasks/${taskId} (PUT) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const payload = { title: '' };
    const response = await request(app.getHttpServer())
      .put(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .send(payload)
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        title: ['タイトルは1文字以上です'],
      },
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tasks/${taskId}] (DELETE) --------------------------------------------
  it('/api/teams/${teamId}/tasks/${taskId} (DELETE) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${missTeamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tasks/${taskId} (DELETE) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/123456789/tasks/123456789`)
      .set('Authorization', 'Bearer mock-token')
      .expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
        taskId: ['タスクIDは有効なID形式で入力してください'],
      },
    });
  });

  it('/api/teams/${teamId}/tasks/${taskId} (DELETE) success', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer())
      .delete(`/api/teams/${newTask.teamId}/tasks/${newTask.taskId}`)
      .set('Authorization', 'Bearer mock-token')
      .expect(200);
    expect(response.body).toEqual({
      teamId: newTask.teamId,
      taskId: newTask.taskId,
    });
  });

  // HR: -------------------------------------------- [/api/teams/${teamId}/tasks] (GET) --------------------------------------------
  it('/api/teams/${teamId}/tasks (GET) success: status検索', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テストデータ
    const t1 = await createTaskWithoutDiscription({
      title: 'T1',
      discription: 'D1',
      status: 'todo',
      tagRefs: [],
      startTime: '2025-12-01T01:00:00+09:00',
      endTime: '2025-12-02T01:00:00+09:00',
    });
    const t2 = await createTaskWithoutDiscription({
      title: 'T2',
      discription: 'D2',
      status: 'doing',
      tagRefs: [],
      startTime: '2025-12-03T01:00:00+09:00',
      endTime: '2025-12-04T01:00:00+09:00',
    });
    const t3 = await createTaskWithoutDiscription({
      title: 'T3',
      discription: 'D3',
      status: 'done',
      tagRefs: [],
      startTime: '2025-12-05T01:00:00+09:00',
      endTime: '2025-12-06T01:00:00+09:00',
    });
    // テスト
    // statusGroup=all&indexType=start&sort=asc
    const allStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(allStartAscResponse.body.tasks).toHaveLength(3);
    expect(allStartAscResponse.body.tasks).toStrictEqual([t1, t2, t3]);
    expect(allStartAscResponse.body.nextToken).toEqual(null);
    // statusGroup=all&indexType=start&sort=dasc
    const allStartDascResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'dasc' })
      .expect(200);
    expect(allStartDascResponse.body.tasks).toHaveLength(3);
    expect(allStartDascResponse.body.tasks).toStrictEqual([t3, t2, t1]);
    // statusGroup=all&indexType=end&sort=asc
    const allEndAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'end', sort: 'asc' })
      .expect(200);
    expect(allEndAscResponse.body.tasks).toHaveLength(3);
    expect(allEndAscResponse.body.tasks).toStrictEqual([t1, t2, t3]);
    // statusGroup=todo&indexType=start&sort=asc
    const todoStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'todo', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(todoStartAscResponse.body.tasks).toHaveLength(1);
    expect(todoStartAscResponse.body.tasks).toStrictEqual([t1]);
    // statusGroup=doing&indexType=start&sort=asc
    const doingStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'doing', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(doingStartAscResponse.body.tasks).toHaveLength(1);
    expect(doingStartAscResponse.body.tasks).toStrictEqual([t2]);
    // statusGroup=done&indexType=start&sort=asc
    const doneStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'done', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(doneStartAscResponse.body.tasks).toHaveLength(1);
    expect(doneStartAscResponse.body.tasks).toStrictEqual([t3]);
    // statusGroup=todo_doing&indexType=start&sort=asc
    const todoDoingStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'todo_doing', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(todoDoingStartAscResponse.body.tasks).toHaveLength(2);
    expect(todoDoingStartAscResponse.body.tasks).toStrictEqual([t1, t2]);
    // statusGroup=doing_done&indexType=start&sort=asc
    const doingDoneStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'doing_done', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(doingDoneStartAscResponse.body.tasks).toHaveLength(2);
    expect(doingDoneStartAscResponse.body.tasks).toStrictEqual([t2, t3]);
    // statusGroup=todo_done&indexType=start&sort=asc
    const todoDoneStartAscResponse = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'todo_done', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(todoDoneStartAscResponse.body.tasks).toHaveLength(2);
    expect(todoDoneStartAscResponse.body.tasks).toStrictEqual([t1, t3]);
    // statusGroup=all&indexType=start&fromDate=2025-12-01&toDate=2025-12-01&sort=asc
    const allStartAscF1201T1201Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc', fromDate: '2025-12-01', toDate: '2025-12-02' })
      .expect(200);
    expect(allStartAscF1201T1201Response.body.tasks).toHaveLength(1);
    expect(allStartAscF1201T1201Response.body.tasks).toStrictEqual([t1]);
    // statusGroup=all&indexType=start&fromDate=2025-12-03&toDate=2025-12-06&sort=asc
    const allStartAscF1203T1206Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc', fromDate: '2025-12-03', toDate: '2025-12-06' })
      .expect(200);
    expect(allStartAscF1203T1206Response.body.tasks).toHaveLength(2);
    expect(allStartAscF1203T1206Response.body.tasks).toStrictEqual([t2, t3]);
    // statusGroup=all&indexType=end&fromDate=2025-12-02&toDate=2025-12-07&sort=asc
    const allEndAscF1202T1207Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'end', sort: 'asc', fromDate: '2025-12-02', toDate: '2025-12-07' })
      .expect(200);
    expect(allEndAscF1202T1207Response.body.tasks).toHaveLength(3);
    expect(allEndAscF1202T1207Response.body.tasks).toStrictEqual([t1, t2, t3]);
    // statusGroup=all&indexType=start&fromDate=2025-12-03&sort=asc
    const allStartAscF1203Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc', fromDate: '2025-12-03' })
      .expect(200);
    expect(allStartAscF1203Response.body.tasks).toHaveLength(2);
    expect(allStartAscF1203Response.body.tasks).toStrictEqual([t2, t3]);
    // statusGroup=all&indexType=end&ToDate=2025-12-05&sort=asc
    const allEndAscT1205Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'end', sort: 'asc', toDate: '2025-12-05' })
      .expect(200);
    expect(allEndAscT1205Response.body.tasks).toHaveLength(2);
    expect(allEndAscT1205Response.body.tasks).toStrictEqual([t1, t2]);

    // ページング確認用
    const list = ['04', '05', '06', '07', '08', '09', '10', '11'];
    for (const item of list) {
      await createTaskWithoutDiscription({
        title: 'T' + item,
        discription: 'D' + item,
        status: 'todo',
        tagRefs: [],
        startTime: `2025-12-29T${item}:00:00+09:00`,
        endTime: `2025-12-30T${item}:00:00+09:00`,
      });
    }
    // statusGroup=all&indexType=start&sort=asc
    const allStartAscPageing1Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc' })
      .expect(200);
    expect(allStartAscPageing1Response.body.tasks).toHaveLength(10);
    expect(allStartAscPageing1Response.body.nextToken).not.toBeNull();
    const nextToken = allStartAscPageing1Response.body.nextToken;
    // statusGroup=all&indexType=start&sort=asc&nextToken={...}
    const allStartAscPageing2Response = await request(app.getHttpServer())
      .get(`/api/teams/${DEFAULT_USER1.teamId}/tasks`)
      .set('Authorization', 'Bearer mock-token')
      .query({ statusGroup: 'all', indexType: 'start', sort: 'asc', nextToken })
      .expect(200);
    expect(allStartAscPageing2Response.body.tasks).toHaveLength(1);
    expect(allStartAscPageing2Response.body.nextToken).toBeNull();
  });

  it('/api/teams/${teamId}/tasks (GET) failure:参照権限のないチーム', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const missTeamId = uuid();
    const response = await request(app.getHttpServer()).get(`/api/teams/${missTeamId}/tasks`).set('Authorization', 'Bearer mock-token').expect(401);
    expect(response.body).toEqual({ message: 'チームに対する権限がありません', error: 'Unauthorized', statusCode: 401 });
  });

  it('/api/teams/${teamId}/tags/${tagId} (GET) failure:入力値不正', async () => {
    // モック
    mockVerify.mockResolvedValue({ sub: DEFAULT_USER1.userId });
    // テスト
    const response = await request(app.getHttpServer()).get(`/api/teams/123456789/tasks`).set('Authorization', 'Bearer mock-token').expect(400);
    expect(response.body).toEqual({
      statusCode: 400,
      message: '入力値が不正です',
      errors: {
        teamId: ['チームIDは有効なID形式で入力してください'],
      },
    });
  });
});
