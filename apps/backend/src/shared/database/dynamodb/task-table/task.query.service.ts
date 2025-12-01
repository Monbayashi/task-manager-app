import { Injectable } from '@nestjs/common';
import {
  UserId,
  TeamId,
  TaskId,
  UserItem,
  UserTeamItem,
  TeamUserItem,
  TeamItem,
  TagItem,
  TaskItem,
  AnyItem,
  TaskItemList,
  CounterItem,
} from './types';
import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoClientService } from '../dynamo-client.service';

@Injectable()
export class TaskQueryService {
  constructor(private readonly dynamoClient: DynamoClientService) {}

  /**
   * 1. ユーザー取得 with 所属チーム
   * @param userId
   * @returns
   */
  async getUserWithTeams(userId: UserId): Promise<{
    user: UserItem | null;
    teams: UserTeamItem[];
  }> {
    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': `USER#${userId}` },
      })
    );

    const items = (result.Items ?? []) as AnyItem[];
    return {
      user: items.find((i): i is UserItem => i.type === 'user') ?? null,
      teams: items.filter((i): i is UserTeamItem => i.type === 'user_team'),
    };
  }

  /**
   * 1. ユーザー取得
   * @param userId
   * @returns
   */
  async getUser(userId: UserId): Promise<UserItem | null> {
    const result = await this.dynamoClient.db.send(
      new GetCommand({
        TableName: this.dynamoClient.taskTable,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
      })
    );
    return (result.Item as UserItem) ?? null;
  }

  /**
   * 2. チームの全メンバー
   * @param teamId
   * @returns
   */
  async getTeamMembers(teamId: TeamId): Promise<TeamUserItem[]> {
    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `TEAM#${teamId}`,
          ':prefix': 'USER#',
        },
      })
    );
    return (result.Items ?? []) as TeamUserItem[];
  }

  /**
   * 3. チーム情報
   * @param teamId
   * @returns
   */
  async getTeam(teamId: TeamId): Promise<TeamItem | null> {
    const result = await this.dynamoClient.db.send(
      new GetCommand({
        TableName: this.dynamoClient.taskTable,
        Key: { PK: `TEAM#${teamId}`, SK: `TEAM#${teamId}` },
      })
    );
    return (result.Item as TeamItem) ?? null;
  }

  /**
   * 4. ユーザーの全チーム（user_team）
   * @param userId
   * @returns
   */
  async getUserTeams(userId: UserId): Promise<UserTeamItem[]> {
    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':prefix': 'TEAM#',
        },
      })
    );
    return (result.Items ?? []) as UserTeamItem[];
  }

  /**
   * 5. チームの全タグ
   * @param teamId
   * @returns
   */
  async getTeamTags(teamId: TeamId): Promise<TagItem[]> {
    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `TEAM#${teamId}`,
          ':prefix': 'TAG#',
        },
      })
    );
    return (result.Items ?? []) as TagItem[];
  }

  /**
   * 6. タスク詳細
   * @param teamId
   * @param taskId
   * @returns
   */
  async getTask(teamId: TeamId, taskId: TaskId): Promise<TaskItem | null> {
    const result = await this.dynamoClient.db.send(
      new GetCommand({
        TableName: this.dynamoClient.taskTable,
        Key: { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` },
      })
    );
    return (result.Item as TaskItem) ?? null;
  }

  //--------------------------------------------------------------------------------------------------
  /**
   * タスクデータ取得
   * @param teamId
   * @param options
   * @returns
   */
  async getTasks(
    teamId: TeamId,
    options: {
      statusGroup?: 'todo' | 'doing' | 'done' | 'todo_doing' | 'doing_done' | 'todo_done' | 'all';
      indexType?: 'start' | 'end';
      tagRefs?: string[];
      fromDate?: string;
      toDate?: string;
      sort?: 'asc' | 'dasc';
      nextToken?: string;
    }
  ) {
    const { statusGroup = 'todo_doing', indexType = 'start', sort = 'asc', tagRefs, fromDate, toDate, nextToken } = options;
    // indexNameとpkとskの名称を取得
    const getCommandInfo = (
      statusGroup: Parameters<typeof this.getTasks>['1']['statusGroup'],
      indexType: Parameters<typeof this.getTasks>['1']['indexType']
    ): { indexName: string; pkName: string; skName: string } => {
      let indexName: string;
      let pkName: string;
      if (statusGroup === 'todo' || statusGroup === 'doing_done') {
        indexName = indexType === 'start' ? 'GSI_Status_Start_Sort_Group1' : 'GSI_Status_End_Sort_Group1';
        pkName = 'status_group1';
      } else if (statusGroup === 'done' || statusGroup === 'todo_doing') {
        indexName = indexType === 'start' ? 'GSI_Status_Start_Sort_Group2' : 'GSI_Status_End_Sort_Group2';
        pkName = 'status_group2';
      } else if (statusGroup === 'doing' || statusGroup === 'todo_done') {
        indexName = indexType === 'start' ? 'GSI_Status_Start_Sort_Group3' : 'GSI_Status_End_Sort_Group3';
        pkName = 'status_group3';
      } else {
        indexName = indexType === 'start' ? 'GSI_Status_Start_Sort_All' : 'GSI_Status_End_Sort_All';
        pkName = 'PK';
      }
      const skName = indexType === 'start' ? 'start_sort_sk' : 'end_sort_sk';
      return { indexName, pkName, skName };
    };

    const { indexName, pkName, skName } = getCommandInfo(statusGroup, indexType);
    // keyConditionExpression & expressionAttributeValues & FilterExpression
    const expressionAttributeValues: Record<string, string> = {};
    expressionAttributeValues[':pk'] = statusGroup === 'all' ? `TEAM#${teamId}` : `TEAM#${teamId}#STATUS#${statusGroup}`;
    let keyConditionExpression: string;
    let filterExpression: string | undefined;
    if (fromDate && toDate) {
      // 期間範囲検索で使用
      keyConditionExpression = `${pkName} = :pk AND ${skName} BETWEEN :from AND :to`;
      expressionAttributeValues[':from'] = indexType === 'start' ? `START#${fromDate}` : `END#${fromDate}`;
      expressionAttributeValues[':to'] = indexType === 'start' ? `START#${toDate}` : `END#${toDate}`;
    } else if (fromDate) {
      // 指定日より未来のデータ取得
      keyConditionExpression = `${pkName} = :pk AND ${skName} >= :from`;
      expressionAttributeValues[':from'] = indexType === 'start' ? `START#${fromDate}` : `END#${fromDate}`;
    } else if (toDate) {
      // 指定日より過去のデータ取得 (Ex:開始遅延タスク or 終了遅延タスク)
      keyConditionExpression = `${pkName} = :pk AND ${skName} <= :to`;
      expressionAttributeValues[':to'] = indexType === 'start' ? `START#${toDate}` : `END#${toDate}`;
    } else {
      keyConditionExpression = `${pkName} = :pk AND begins_with(${skName}, :prefix)`;
      expressionAttributeValues[':prefix'] = indexType === 'start' ? 'START#' : 'END#';
    }
    // タグフィルター
    if (tagRefs) {
      filterExpression = tagRefs.map((_, i) => `contains(team_task_tagRef, :tag${i})`).join(' OR ');
      tagRefs.forEach((id, i) => (expressionAttributeValues[`:tag${i}`] = `TAG#${id}`));
    }

    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        IndexName: indexName,
        KeyConditionExpression: keyConditionExpression,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ProjectionExpression: 'PK, SK, team_task_title, team_task_status, team_task_startTime, team_task_endTime, team_task_tagRef',
        ScanIndexForward: sort === 'asc',
        // ページング
        Limit: 10,
        ExclusiveStartKey: nextToken && JSON.parse(nextToken),
      })
    );
    return {
      tasks: (result.Items ?? []) as TaskItemList,
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
    };
  }

  /**
   * チームの集計データ
   * @param teamId
   * @returns
   */
  async getTeamCounters(teamId: TeamId): Promise<CounterItem[]> {
    const result = await this.dynamoClient.db.send(
      new QueryCommand({
        TableName: this.dynamoClient.taskTable,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `TEAM#${teamId}`,
          ':prefix': 'COUNTER#',
        },
      })
    );
    return (result.Items ?? []) as CounterItem[];
  }
}
