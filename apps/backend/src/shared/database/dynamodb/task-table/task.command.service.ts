import { BadRequestException, Injectable } from '@nestjs/common';
import { db, INVITATION_TABLE, TASK_TABLE } from '../client';
import { DeleteCommand, GetCommand, PutCommand, TransactWriteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v7 as uuid } from 'uuid';
import { TagItem, TaskItem, TaskStatus, TeamUserItem, UserRole, UserTeamItem } from './types';
import { addDays } from 'date-fns';

@Injectable()
export class TaskCommandService {
  /**
   * ユーザ登録 (トランザクション)
   * @param params
   * @returns
   */
  async registerUser(params: { userId: string; email: string; userName: string; teamName: string; role: UserRole }) {
    const { userId, email, userName, teamName, role } = params;
    const now = new Date().toISOString();
    const teamId = uuid();
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1. ユーザー作成
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `USER#${userId}`,
                SK: `USER#${userId}`,
                type: 'user',
                user_email: email,
                user_name: userName,
                user_createdAt: now,
              },
              ConditionExpression: 'attribute_not_exists(PK)', // 重複防止
            },
          },
          // 2. チーム作成
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `TEAM#${teamId}`,
                SK: `TEAM#${teamId}`,
                type: 'team',
                team_name: teamName,
                team_discription: '',
              },
            },
          },
          // 3. ユーザーのチーム所属
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `USER#${userId}`,
                SK: `TEAM#${teamId}`,
                type: 'user_team',
                user_team_role: role,
                user_team_joinedAt: now,
                team_name: teamName,
              },
            },
          },
          // 3. チームのメンバー追加
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `TEAM#${teamId}`,
                SK: `USER#${userId}`,
                type: 'team_user',
                user_team_role: role,
                user_team_joinedAt: now,
                user_name: userName,
              },
            },
          },
        ],
      })
    );
    return { userId, teamId };
  }

  /**
   * チーム登録 (トランザクション)
   * @param params
   * @returns
   */
  async registerTeams(params: { userId: string; userName: string; teamName: string; role: UserRole }) {
    const { userId, userName, teamName, role } = params;
    const now = new Date().toISOString();
    const teamId = uuid();
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1. チーム作成
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `TEAM#${teamId}`,
                SK: `TEAM#${teamId}`,
                type: 'team',
                team_name: teamName,
                team_discription: '',
              },
            },
          },
          // 2. ユーザーのチーム所属
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `USER#${userId}`,
                SK: `TEAM#${teamId}`,
                type: 'user_team',
                user_team_role: role,
                user_team_joinedAt: now,
                team_name: teamName,
              },
            },
          },
          // 3. チームのメンバー追加
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `TEAM#${teamId}`,
                SK: `USER#${userId}`,
                type: 'team_user',
                user_team_role: role,
                user_team_joinedAt: now,
                user_name: userName,
              },
            },
          },
        ],
      })
    );
    return { teamId, teamName, role };
  }

  /**
   * チームユーザ登録 (トランザクション)
   * @param params
   * @returns
   */
  async registerTeamUserFromInvitation(params: {
    userId: string;
    teamId: string;
    inviteId: string;
    userName: string;
    teamName: string;
    role: UserRole;
  }) {
    const { userId, teamId, inviteId, userName, teamName, role } = params;
    const now = new Date().toISOString();
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1. チーム招待の削除
          {
            Delete: {
              TableName: INVITATION_TABLE,
              Key: {
                PK: `TEAM#${teamId}`,
                SK: `INVITE#${inviteId}`,
              },
            },
          },
          // 2. ユーザーのチーム所属
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `USER#${userId}`,
                SK: `TEAM#${teamId}`,
                type: 'user_team',
                user_team_role: role,
                user_team_joinedAt: now,
                team_name: teamName,
              },
            },
          },
          // 3. チームのメンバー追加
          {
            Put: {
              TableName: TASK_TABLE,
              Item: {
                PK: `TEAM#${teamId}`,
                SK: `USER#${userId}`,
                type: 'team_user',
                user_team_role: role,
                user_team_joinedAt: now,
                user_name: userName,
              },
            },
          },
        ],
      })
    );
    return { userId, teamId, inviteId };
  }

  /** チームメンバーの更新 */
  async updateTeamMember(params: { userId: string; teamId: string; role: UserRole }) {
    const { userId, teamId, role } = params;
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1. ユーザーのチーム所属 更新
          {
            Update: {
              TableName: TASK_TABLE,
              Key: {
                PK: `USER#${userId}`,
                SK: `TEAM#${teamId}`,
              },
              UpdateExpression: 'SET user_team_role = :role',
              ExpressionAttributeValues: { ':role': role },
            },
          },
          // 2. チームのメンバー追加 更新
          {
            Update: {
              TableName: TASK_TABLE,
              Key: {
                PK: `TEAM#${teamId}`,
                SK: `USER#${userId}`,
              },
              UpdateExpression: 'SET user_team_role = :role',
              ExpressionAttributeValues: { ':role': role },
            },
          },
        ],
      })
    );
    return { userId, teamId, role };
  }

  /** チームメンバーの削除 */
  async deleteTeamMember(params: { userId: string; teamId: string }) {
    const { userId, teamId } = params;
    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          // 1. ユーザーのチーム所属 削除
          {
            Delete: {
              TableName: TASK_TABLE,
              Key: {
                PK: `USER#${userId}`,
                SK: `TEAM#${teamId}`,
              },
            },
          },
          // 2. チームのメンバー追加 削除
          {
            Delete: {
              TableName: TASK_TABLE,
              Key: {
                PK: `TEAM#${teamId}`,
                SK: `USER#${userId}`,
              },
            },
          },
        ],
      })
    );
    return { userId, teamId };
  }

  /**
   * ユーザの更新 (トランザクション)
   * @param userId
   * @param newUserName
   */
  async updateUser(userId: string, newUserName: string, userTeams: UserTeamItem[]) {
    const transactItems: {
      Update: {
        TableName: string;
        Key: { PK: string; SK: string };
        UpdateExpression: string;
        ExpressionAttributeValues: Record<string, any>;
      };
    }[] = [];

    // 1. ユーザー本体を更新
    transactItems.push({
      Update: {
        TableName: TASK_TABLE,
        Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
        UpdateExpression: 'SET user_name = :name',
        ExpressionAttributeValues: { ':name': newUserName },
      },
    });

    // 2. すべての team_user アイテムを更新（チーム側に表示される名前）
    for (const team of userTeams) {
      const teamId = team.SK.replace('TEAM#', '');
      transactItems.push({
        Update: {
          TableName: TASK_TABLE,
          Key: { PK: `TEAM#${teamId}`, SK: `USER#${userId}` },
          UpdateExpression: 'SET user_name = :name',
          ExpressionAttributeValues: { ':name': newUserName },
        },
      });
    }

    // トランザクションで一括実行（最大25アイテムまでOK）
    if (transactItems.length > 25) {
      throw new Error('所属チームが多すぎます（25超）。バッチ処理が必要です');
    }

    await db.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return transactItems.length;
  }

  /**
   * チームの更新 (トランザクション)
   * @param teamId
   * @param newTeamName
   */
  async updateTeam(teamId: string, newTeamName: string, teamMembers: TeamUserItem[]) {
    const transactItems: {
      Update: {
        TableName: string;
        Key: { PK: string; SK: string };
        UpdateExpression: string;
        ExpressionAttributeValues: Record<string, any>;
      };
    }[] = [];

    // 1. チーム本体を更新
    transactItems.push({
      Update: {
        TableName: TASK_TABLE,
        Key: { PK: `TEAM#${teamId}`, SK: `TEAM#${teamId}` },
        UpdateExpression: 'SET team_name = :name',
        ExpressionAttributeValues: { ':name': newTeamName },
      },
    });

    // 2. すべての user_team アイテムを更新（ユーザー側のチーム一覧に表示される名前）
    for (const member of teamMembers) {
      const userId = member.SK.replace('USER#', '');
      transactItems.push({
        Update: {
          TableName: TASK_TABLE,
          Key: { PK: `USER#${userId}`, SK: `TEAM#${teamId}` },
          UpdateExpression: 'SET team_name = :name',
          ExpressionAttributeValues: { ':name': newTeamName },
        },
      });
    }

    if (transactItems.length > 25) {
      throw new Error('メンバーが多すぎます（25超）。バッチ処理が必要です');
    }

    await db.send(new TransactWriteCommand({ TransactItems: transactItems }));
    return transactItems.length;
  }

  /**
   * タグの登録
   * @param params
   * @returns
   */
  async createTag(params: { teamId: string; tagName: string; tagColor: { color: string; backgroundColor: string } }): Promise<TagItem> {
    const { teamId, tagName, tagColor } = params;
    const tagId = uuid();
    await db.send(
      new PutCommand({
        TableName: TASK_TABLE,
        Item: {
          PK: `TEAM#${teamId}`,
          SK: `TAG#${tagId}`,
          type: 'team_tag',
          team_tag_name: tagName,
          team_tag_color: tagColor,
        },
      })
    );
    return {
      PK: `TEAM#${teamId}`,
      SK: `TAG#${tagId}`,
      type: 'team_tag',
      team_tag_name: tagName,
      team_tag_color: tagColor,
    };
  }

  /**
   * タグの更新
   * @param params
   * @returns
   */
  async updateTag(params: {
    teamId: string;
    tagId: string;
    tagName: string;
    tagColor: { color: string; backgroundColor: string };
  }): Promise<TagItem> {
    const { teamId, tagId, tagName, tagColor } = params;
    await db.send(
      new UpdateCommand({
        TableName: TASK_TABLE,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `TAG#${tagId}`,
        },
        UpdateExpression: 'set team_tag_name = :tagName, team_tag_color = :tagColor',
        ExpressionAttributeValues: {
          ':tagName': tagName,
          ':tagColor': tagColor,
        },
      })
    );
    return {
      PK: `TEAM#${teamId}`,
      SK: `TAG#${tagId}`,
      type: 'team_tag',
      team_tag_name: tagName,
      team_tag_color: tagColor,
    };
  }

  /**
   * タグの削除
   * @param params
   * @returns
   */
  async deleteTag(params: { teamId: string; tagId: string }) {
    const { teamId, tagId } = params;
    await db.send(
      new DeleteCommand({
        TableName: TASK_TABLE,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `TAG#${tagId}`,
        },
      })
    );
    return { PK: `TEAM#${teamId}`, SK: `TAG#${tagId}` };
  }

  /**
   * タスクの登録 (トランザクション)
   * @param params
   * @returns
   */
  async createTask(params: {
    teamId: string;
    title: string;
    discription: string;
    status: TaskStatus;
    tagRefs: string[];
    startTime: string;
    endTime: string;
  }): Promise<TaskItem> {
    const { teamId, title, discription, status, tagRefs, startTime, endTime } = params;
    const taskId = uuid();
    let group1: string;
    let group2: string;
    let group3: string;
    if (status === 'todo') {
      group1 = `TEAM#${teamId}#STATUS#todo`;
      group2 = `TEAM#${teamId}#STATUS#todo_doing`;
      group3 = `TEAM#${teamId}#STATUS#todo_done`;
    } else if (status === 'doing') {
      group1 = `TEAM#${teamId}#STATUS#doing_done`;
      group2 = `TEAM#${teamId}#STATUS#todo_doing`;
      group3 = `TEAM#${teamId}#STATUS#doing`;
    } else {
      group1 = `TEAM#${teamId}#STATUS#doing_done`;
      group2 = `TEAM#${teamId}#STATUS#done`;
      group3 = `TEAM#${teamId}#STATUS#todo_done`;
    }
    const tagList = tagRefs.map((tagRef) => `TAG#${tagRef}`);
    const putCommand = new PutCommand({
      TableName: TASK_TABLE,
      Item: {
        PK: `TEAM#${teamId}`,
        SK: `TASK#${taskId}`,
        type: 'task',
        team_task_title: title,
        team_task_discription: discription,
        team_task_status: status,
        team_task_startTime: startTime,
        team_task_endTime: endTime,
        team_task_tagRef: tagList,
        status_group1: group1,
        status_group2: group2,
        status_group3: group3,
        start_sort_sk: `START#${startTime}`,
        end_sort_sk: `END#${endTime}`,
      },
    });

    // カウンター更新を追加 + 初回自動作成
    const counterUpdates = this.updateCounters(teamId, undefined, status);

    // トランザクション
    await db.send(
      new TransactWriteCommand({
        TransactItems: [{ Put: putCommand.input }, ...counterUpdates],
      })
    );
    return {
      PK: `TEAM#${teamId}`,
      SK: `TASK#${taskId}`,
      type: 'task',
      team_task_title: title,
      team_task_discription: discription,
      team_task_status: status,
      team_task_startTime: startTime,
      team_task_endTime: endTime,
      team_task_tagRef: tagList,
      status_group1: group1,
      status_group2: group2,
      status_group3: group3,
      start_sort_sk: `START#${startTime}`,
      end_sort_sk: `END#${endTime}`,
    };
  }

  /**
   * タスクの更新 (トランザクション)
   * @param params
   * @returns
   */
  async updateTask(params: {
    teamId: string;
    taskId: string;
    title?: string;
    discription?: string;
    status?: TaskStatus;
    tagRefs?: string[];
    startTime?: string;
    endTime?: string;
  }): Promise<TaskItem> {
    const { teamId, taskId, title, discription, status, tagRefs, startTime, endTime } = params;
    const tagList = tagRefs?.map((tagRef) => `TAG#${tagRef}`);
    const updateExpressionList: string[] = [];
    const expressionAttributeValues: {
      ':title'?: string;
      ':discription'?: string;
      ':status'?: TaskStatus;
      ':startTime'?: string;
      ':endTime'?: string;
      ':tagRef'?: string[];
      ':group1'?: string;
      ':group2'?: string;
      ':group3'?: string;
      ':startSort'?: string;
      ':endSort'?: string;
    } = {};
    if (title) {
      updateExpressionList.push('team_task_title = :title');
      expressionAttributeValues[':title'] = title;
    }
    if (discription) {
      updateExpressionList.push('team_task_discription = :discription');
      expressionAttributeValues[':discription'] = discription;
    }
    if (status) {
      updateExpressionList.push('team_task_status = :status');
      expressionAttributeValues[':status'] = status;
      // グループの更新
      let groups: { group1: string; group2: string; group3: string } | undefined;
      if (status === 'todo') {
        groups = {
          group1: `TEAM#${teamId}#STATUS#todo`,
          group2: `TEAM#${teamId}#STATUS#todo_doing`,
          group3: `TEAM#${teamId}#STATUS#todo_done`,
        };
      } else if (status === 'doing') {
        groups = {
          group1: `TEAM#${teamId}#STATUS#doing_done`,
          group2: `TEAM#${teamId}#STATUS#todo_doing`,
          group3: `TEAM#${teamId}#STATUS#doing`,
        };
      } else {
        groups = {
          group1: `TEAM#${teamId}#STATUS#doing_done`,
          group2: `TEAM#${teamId}#STATUS#done`,
          group3: `TEAM#${teamId}#STATUS#todo_done`,
        };
      }
      updateExpressionList.push('status_group1 = :group1');
      expressionAttributeValues[':group1'] = groups.group1;
      updateExpressionList.push('status_group2 = :group2');
      expressionAttributeValues[':group2'] = groups.group2;
      updateExpressionList.push('status_group3 = :group3');
      expressionAttributeValues[':group3'] = groups.group3;
    }
    if (startTime) {
      updateExpressionList.push('team_task_startTime = :startTime');
      expressionAttributeValues[':startTime'] = startTime;
      updateExpressionList.push('start_sort_sk = :startSort');
      expressionAttributeValues[':startSort'] = `START#${startTime}`;
    }
    if (endTime) {
      updateExpressionList.push('team_task_endTime = :endTime');
      expressionAttributeValues[':endTime'] = endTime;
      updateExpressionList.push('end_sort_sk = :endSort');
      expressionAttributeValues[':endSort'] = `END#${endTime}`;
    }
    if (tagList) {
      updateExpressionList.push('team_task_tagRef = :tagRef');
      expressionAttributeValues[':tagRef'] = tagList;
    }
    // 更新件数チェック
    if (updateExpressionList.length === 0) {
      throw new BadRequestException('更新する項目がありません');
    }
    const updateExpression = `set ${updateExpressionList.join(', ')}`;

    // カウンター更新 + 初回対策（ステータス変更時のみ）
    let counterUpdates: any[] = [];
    if (status) {
      // 現在のタスクを取得（旧ステータスを知るため）
      const current = await db.send(new GetCommand({ TableName: TASK_TABLE, Key: { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` } }));
      if (!current.Item) throw new BadRequestException('タスクが見つかりません');
      const oldStatus = current.Item.team_task_status as TaskStatus;
      if (status !== oldStatus) {
        counterUpdates = this.updateCounters(teamId, oldStatus, status);
      }
    }

    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: TASK_TABLE,
              Key: {
                PK: `TEAM#${teamId}`,
                SK: `TASK#${taskId}`,
              },
              UpdateExpression: updateExpression,
              ExpressionAttributeValues: expressionAttributeValues,
              // ReturnValues: 'ALL_NEW',
            },
          },
          ...counterUpdates,
        ],
      })
    );
    // 更新後の最新タスクを取得して返す処理
    const result = await db.send(
      new GetCommand({
        TableName: TASK_TABLE,
        Key: { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` },
      })
    );
    return result.Item as TaskItem;
  }

  /**
   * タスクの削除 (トランザクション)
   * @param params
   * @returns
   */
  async deleteTask(params: { teamId: string; taskId: string }) {
    const { teamId, taskId } = params;

    // 現在のタスクを取得（旧ステータスを知るため）
    const current = await db.send(new GetCommand({ TableName: TASK_TABLE, Key: { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` } }));
    const oldStatus = current.Item?.team_task_status as TaskStatus | undefined;
    // カウンター更新 + 初回対策
    const counterUpdates = this.updateCounters(teamId, oldStatus, undefined, true);

    await db.send(
      new TransactWriteCommand({
        TransactItems: [{ Delete: { TableName: TASK_TABLE, Key: { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` } } }, ...counterUpdates],
      })
    );
    return { PK: `TEAM#${teamId}`, SK: `TASK#${taskId}` };
  }

  /**
   * タスクの集計用データ
   * @description
   * 1. タスク作成時 \
   *    this.updateCounters(teamId, undefined, status); \
   * 2. タスク更新時（ステータス変更あり） \
   *    this.updateCounters(teamId, oldStatus, status); \
   * 3. タスク削除時 \
   *    this.updateCounters(teamId, oldStatus, undefined, true);
   * ※ADD は自動で0から始める
   * @param teamId
   * @param oldStatus
   * @param newStatus
   * @param isDelete
   * @returns
   */
  private updateCounters(
    teamId: string,
    oldStatus?: TaskStatus, // 変更前（更新・削除時）
    newStatus?: TaskStatus, // 変更後（作成・更新時）
    isDelete = false
  ): any[] {
    const today = new Date().toISOString().split('T')[0];
    const expiresAt32days = Math.floor(addDays(new Date(), 32).getTime() / 1000);
    const updates: any[] = [];

    const from = isDelete ? oldStatus : oldStatus;
    const to = isDelete ? undefined : newStatus;

    if (from || to) {
      // 1. COUNTER#ALL（リアルタイム全体）
      if (from || to) {
        const allAddParts: string[] = [];
        const allVals: Record<string, number> = {};
        const allNames: Record<string, string> = { '#type': 'type' };
        if (from) {
          allAddParts.push(`#${from} :minus`);
          allVals[':minus'] = -1;
          allNames[`#${from}`] = from;
        }
        if (to) {
          allAddParts.push(`#${to} :plus`);
          allVals[':plus'] = 1;
          allNames[`#${to}`] = to;
        }

        updates.push({
          Update: {
            TableName: TASK_TABLE,
            Key: { PK: `TEAM#${teamId}`, SK: 'COUNTER#ALL' },
            UpdateExpression: `
              SET #type = if_not_exists(#type, :counter)
              ADD ${allAddParts.join(', ')}
            `
              .replace(/\s+/g, ' ')
              .trim(),
            ExpressionAttributeNames: allNames, // 実際に使うものだけ！
            ExpressionAttributeValues: {
              ':counter': 'counter',
              ...allVals,
            },
          },
        });
      }

      // 2. COUNTER#今日の日付（日次）
      if (from || to) {
        const dailyAddParts: string[] = [];
        const dailyVals: Record<string, number> = {};
        const dailyNames: Record<string, string> = { '#type': 'type' };
        if (from) {
          dailyAddParts.push(`#${from} :minus`);
          dailyVals[':minus'] = -1;
          dailyNames[`#${from}`] = from;
        }
        if (to) {
          dailyAddParts.push(`#${to} :plus`);
          dailyVals[':plus'] = 1;
          dailyNames[`#${to}`] = to;
        }

        updates.push({
          Update: {
            TableName: TASK_TABLE,
            Key: { PK: `TEAM#${teamId}`, SK: `COUNTER#${today}` },
            UpdateExpression: `
              SET #type = if_not_exists(#type, :counter),
                  expiresAt = if_not_exists(expiresAt, :expiresAt)
              ADD ${dailyAddParts.join(', ')}
            `
              .replace(/\s+/g, ' ')
              .trim(),
            ExpressionAttributeNames: dailyNames,
            ExpressionAttributeValues: {
              ':counter': 'counter',
              ':expiresAt': expiresAt32days,
              ...dailyVals,
            },
          },
        });
      }
    }

    return updates;
  }
}
