import { Injectable } from '@nestjs/common';
import { DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v7 as uuid } from 'uuid';
import { InvitationItem, UserRole } from './types';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { DynamoClientService } from '../dynamo-client.service';
import { handleDynamoError } from '../handle-dynamo-error';

@Injectable()
export class InvitationCommandService {
  constructor(private readonly dynamoClient: DynamoClientService) {}

  /**
   * 招待作成（UUID v7でソート可能）
   * @param teamId
   * @param email
   * @param role
   * @param invitedBy
   * @param ttlDays
   * @returns
   */
  async createInvitation(params: {
    teamId: string;
    email: string;
    role: UserRole;
    invitedBy: string;
    ttlDays: number;
    teamName: string;
  }): Promise<InvitationItem> {
    const { teamId, email, role, invitedBy, ttlDays, teamName } = params;
    const inviteId = uuid();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = Math.floor(addDays(new Date(), ttlDays).getTime() / 1000);
    const token = randomBytes(32).toString('hex');
    const item: InvitationItem = {
      PK: `TEAM#${teamId}`,
      SK: `INVITE#${inviteId}`,
      type: 'invitation',
      email,
      user_role: role,
      createdAt: now,
      expiresAt,
      invitedBy: `USER#${invitedBy}`,
      token: token,
      team_name: teamName,
    };
    const putCommand = new PutCommand({
      TableName: this.dynamoClient.invitationTable,
      Item: item,
    });

    try {
      await this.dynamoClient.db.send(putCommand);
      return item;
    } catch (err) {
      return handleDynamoError(err);
    }
  }

  /**
   * 招待削除（UUID v7でソート可能）
   * @param teamId
   * @param email
   * @param role
   * @param invitedBy
   * @param ttlDays
   * @returns
   */
  async deleteInvitation(params: { teamId: string; inviteId: string }) {
    const { teamId, inviteId } = params;
    const deleteCommand = new DeleteCommand({
      TableName: this.dynamoClient.invitationTable,
      Key: {
        PK: `TEAM#${teamId}`,
        SK: `INVITE#${inviteId}`,
      },
    });

    try {
      await this.dynamoClient.db.send(deleteCommand);
      return { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` };
    } catch (err) {
      return handleDynamoError(err);
    }
  }
}
