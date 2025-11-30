import { Injectable } from '@nestjs/common';
import { db, INVITATION_TABLE } from '../client';
import { InvitationItem, InvitationItemWithoutToken, InviteId } from './types';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class InvitationQueryService {
  /**
   * 1. チームごとの招待一覧（新しい順）(tokenは取得しない)
   * @param teamId
   * @returns
   */
  async getInvitationsByTeam(teamId: string): Promise<InvitationItemWithoutToken[]> {
    const result = await db.send(
      new QueryCommand({
        TableName: INVITATION_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `TEAM#${teamId}`,
          ':prefix': 'INVITE#',
        },
        ScanIndexForward: false, // 新しい順（降順）
        ProjectionExpression: 'PK, SK, email, user_role, createdAt, expiresAt, team_name',
      })
    );
    return (result.Items ?? []) as InvitationItemWithoutToken[];
  }

  /**
   * 2. 単体招待取得 (tokenは取得しない)
   * @param teamId
   * @param inviteId
   * @returns
   */
  async getInvitation(teamId: string, inviteId: InviteId): Promise<InvitationItemWithoutToken | null> {
    const result = await db.send(
      new GetCommand({
        TableName: INVITATION_TABLE,
        Key: { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` },
        ProjectionExpression: 'PK, SK, email, user_role, createdAt, expiresAt, team_name',
      })
    );
    return (result.Item as InvitationItemWithoutToken) ?? null;
  }

  /**
   * 2. 単体招待取得 (tokenを含む)
   * @param teamId
   * @param inviteId
   * @returns
   */
  async getInvitationToken(teamId: string, inviteId: InviteId): Promise<InvitationItem | null> {
    const result = await db.send(
      new GetCommand({
        TableName: INVITATION_TABLE,
        Key: { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` },
      })
    );
    return (result.Item as InvitationItem) ?? null;
  }
}
