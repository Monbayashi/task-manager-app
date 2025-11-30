export type UserId = `${string}`;
export type TeamId = `${string}`;
export type TaskId = `${string}`;
export type TagId = `${string}`;

export type PK = `USER#${UserId}` | `TEAM#${TeamId}`;
export type SK = `USER#${UserId}` | `TEAM#${TeamId}` | `TASK#${TaskId}` | `TAG#${TagId}`;

export type TaskStatus = 'todo' | 'doing' | 'done';
export type UserRole = 'admin' | 'member';

export interface UserItem {
  PK: `USER#${UserId}`;
  SK: `USER#${UserId}`;
  type: 'user';
  user_email: string;
  user_name: string;
  user_image?: string;
  user_createdAt: string;
}

export interface UserTeamItem {
  PK: `USER#${UserId}`;
  SK: `TEAM#${TeamId}`;
  type: 'user_team';
  user_team_role: UserRole;
  user_team_joinedAt: string;
  team_name: string;
}

export interface TeamUserItem {
  PK: `TEAM#${TeamId}`;
  SK: `USER#${UserId}`;
  type: 'team_user';
  user_team_role: UserRole;
  user_team_joinedAt: string;
  user_name: string;
}

export interface TeamItem {
  PK: `TEAM#${TeamId}`;
  SK: `TEAM#${TeamId}`;
  type: 'team';
  team_name: string;
  team_discription?: string;
}

export interface TagItem {
  PK: `TEAM#${TeamId}`;
  SK: `TAG#${TagId}`;
  type: 'team_tag';
  team_tag_name: string;
  team_tag_color: { color: string; backgroundColor: string };
}

export interface TaskItem {
  PK: `TEAM#${TeamId}`;
  SK: `TASK#${TaskId}`;
  type: 'task';
  team_task_title: string;
  team_task_discription: string;
  team_task_status: TaskStatus;
  team_task_startTime: string; // YYYY-MM-DD
  team_task_endTime: string; // YYYY-MM-DD
  team_task_tagRef: string[]; // ["TAG#tag1"]
  status_group1: string;
  status_group2: string;
  status_group3: string;
  start_sort_sk: `START#${string}`;
  end_sort_sk: `END#${string}`;
}

export interface CounterItem {
  PK: `TEAM#${TeamId}`;
  SK: `COUNTER#${string}`;
  type: 'counter';
  todo?: number;
  doing?: number;
  done?: number;
  expiresAt: number;
}

/** 必要な物だけを取得する */
export type TaskItemList = Pick<
  TaskItem,
  'PK' | 'SK' | 'team_task_title' | 'team_task_status' | 'team_task_startTime' | 'team_task_endTime' | 'team_task_tagRef'
>[];

export type AnyItem = UserItem | UserTeamItem | TeamUserItem | TeamItem | TagItem | TaskItem;
