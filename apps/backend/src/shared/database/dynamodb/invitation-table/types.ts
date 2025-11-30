export type InviteId = string;
export type UserRole = 'admin' | 'member';

export interface InvitationItem {
  PK: `TEAM#${string}`;
  SK: `INVITE#${InviteId}`;
  type: 'invitation';
  email: string;
  user_role: UserRole;
  createdAt: number; // Unix秒
  expiresAt: number; // TTL用
  invitedBy: `USER#${string}`;
  token: string;
  team_name: string;
}

export interface InvitationItemWithoutToken {
  PK: `TEAM#${string}`;
  SK: `INVITE#${InviteId}`;
  type: 'invitation';
  email: string;
  user_role: UserRole;
  createdAt: number; // Unix秒
  expiresAt: number; // TTL用
  invitedBy: `USER#${string}`;
  team_name: string;
}
