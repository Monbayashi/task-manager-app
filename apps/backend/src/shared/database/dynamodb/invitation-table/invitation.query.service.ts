import { Injectable } from '@nestjs/common';
import { InvitationItem, InvitationItemWithoutToken, InviteId } from './types';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoClientService } from '../dynamo-client.service';
import { handleDynamoError } from '../handle-dynamo-error';

@Injectable()
export class InvitationQueryService {
  constructor(private readonly dynamoClient: DynamoClientService) {}

  /**
   * 1. チームごとの招待一覧（新しい順）(tokenは取得しない)
   * @param teamId
   * @returns
   */
  async getInvitationsByTeam(teamId: string): Promise<InvitationItemWithoutToken[]> {
    const queryCommand = new QueryCommand({
      TableName: this.dynamoClient.invitationTable,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `TEAM#${teamId}`,
        ':prefix': 'INVITE#',
      },
      ScanIndexForward: false, // 新しい順（降順）
      ProjectionExpression: 'PK, SK, email, user_role, createdAt, expiresAt, team_name, invitedBy',
    });

    try {
      const result = await this.dynamoClient.db.send(queryCommand);
      return (result.Items ?? []) as InvitationItemWithoutToken[];
    } catch (err) {
      return handleDynamoError(err);
    }
  }

  /**
   * 2. 単体招待取得 (tokenは取得しない)
   * @param teamId
   * @param inviteId
   * @returns
   */
  async getInvitation(teamId: string, inviteId: InviteId): Promise<InvitationItemWithoutToken | null> {
    const getCommand = new GetCommand({
      TableName: this.dynamoClient.invitationTable,
      Key: { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` },
      ProjectionExpression: 'PK, SK, email, user_role, createdAt, expiresAt, team_name, invitedBy',
    });

    try {
      const result = await this.dynamoClient.db.send(getCommand);
      return (result.Item as InvitationItemWithoutToken) ?? null;
    } catch (err) {
      return handleDynamoError(err);
    }
  }

  /**
   * 2. 単体招待取得 (tokenを含む)
   * @param teamId
   * @param inviteId
   * @returns
   */
  async getInvitationToken(teamId: string, inviteId: InviteId): Promise<InvitationItem | null> {
    const getCommand = new GetCommand({
      TableName: this.dynamoClient.invitationTable,
      Key: { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` },
    });

    try {
      const result = await this.dynamoClient.db.send(getCommand);
      return (result.Item as InvitationItem) ?? null;
    } catch (err) {
      return handleDynamoError(err);
    }
  }
}
