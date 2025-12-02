import { Body, Controller, Get, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CognitoAccessGuard } from 'src/common/guards/cognito-access.guard';
import { UsersService } from './users.service';
import { ReqBodyUsersRegisterDTO, ReqBodyUsersUpdateDTO } from './users.dto';
import { ResBodyUsersMeType, ResBodyUsersRegisterType, ResBodyUsersUpdateType } from '@repo/api-models/users';
import { PrettyZodValidationPipe } from 'src/common/pipe/pretty-zod-validation.pipe';

@Controller('api/users')
@UsePipes(PrettyZodValidationPipe)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** ユーザ情報 */
  @Get('me')
  @UseGuards(CognitoAccessGuard)
  async getMe(@Req() req: Request): Promise<ResBodyUsersMeType | null> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    const user = await this.usersService.getUserById(userId);
    return user;
  }

  /** 新規ユーザ作成 */
  @Post('register')
  @UseGuards(CognitoAccessGuard)
  async postRegister(@Req() req: Request, @Body() body: ReqBodyUsersRegisterDTO): Promise<ResBodyUsersRegisterType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.usersService.createUser(userId, body);
  }

  /** ユーザ更新 */
  @Post('update')
  @UseGuards(CognitoAccessGuard)
  async postUpdate(@Req() req: Request, @Body() body: ReqBodyUsersUpdateDTO): Promise<ResBodyUsersUpdateType> {
    const userId = req.user ? (req.user['sub'] as string) : '';
    return await this.usersService.updateUser(userId, body);
  }
}
