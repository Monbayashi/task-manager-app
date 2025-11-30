import { Injectable } from '@nestjs/common';
import { db, INVITATION_TABLE } from '../client';
import { DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v7 as uuid } from 'uuid';
import { InvitationItem, UserRole } from './types';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

@Injectable()
export class InvitationCommandService {
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

    await db.send(
      new PutCommand({
        TableName: INVITATION_TABLE,
        Item: item,
      })
    );
    return item;
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
    await db.send(
      new DeleteCommand({
        TableName: INVITATION_TABLE,
        Key: {
          PK: `TEAM#${teamId}`,
          SK: `INVITE#${inviteId}`,
        },
      })
    );
    return { PK: `TEAM#${teamId}`, SK: `INVITE#${inviteId}` };
  }
}
