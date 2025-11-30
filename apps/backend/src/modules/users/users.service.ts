import { Injectable, NotFoundException } from '@nestjs/common';
import { ResBodyUsersMeType, ResBodyUsersRegisterType } from '@repo/api-models/users';
import { TaskQueryService } from '../../shared/database/dynamodb/task-table/task.query.service';
import { TaskCommandService } from '../../shared/database/dynamodb/task-table/task.command.service';
import { ReqBodyUsersRegisterDTO } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly taskQueryService: TaskQueryService,
    private readonly taskCommandService: TaskCommandService
  ) {}

  /** ユーザデータ取得 */
  async getUserById(userId: string): Promise<ResBodyUsersMeType | null> {
    const { user, teams } = await this.taskQueryService.getUserWithTeams(userId);
    if (!user) throw new NotFoundException('未登録ユーザです');
    return {
      user: {
        email: user.user_email,
        name: user.user_name,
        image: user.user_image,
        createdAt: user.user_createdAt,
      },
      teams: teams.map((t) => ({
        teamId: t.SK.replace('TEAM#', ''),
        name: t.team_name,
        role: t.user_team_role,
        joinedAt: t.user_team_joinedAt,
      })),
    };
  }

  /** ユーザー作成（新規登録時） */
  async createUser(userId: string, body: ReqBodyUsersRegisterDTO): Promise<ResBodyUsersRegisterType> {
    const result = await this.taskCommandService.registerUser({
      userId,
      userName: body.userName,
      email: body.email,
      teamName: body.teamName,
      role: 'admin',
    });
    return result;
  }

  /** ユーザー名更新 */
  async updateUser(userId: string, body: { userName: string }) {
    // ユーザーが所属する全チームを取得
    const userTeams = await this.taskQueryService.getUserTeams(userId);
    // ユーザ名更新
    await this.taskCommandService.updateUser(userId, body.userName, userTeams);
    return { newUserName: body.userName };
  }
}
