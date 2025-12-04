import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';
import { TypedConfigService } from '../config/typed-config.service';

/**
 * Cognito ガード
 */
@Injectable()
export class CognitoAccessGuard implements CanActivate {
  private accessTokenVerifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(private typedConfig: TypedConfigService) {
    this.accessTokenVerifier = CognitoJwtVerifier.create({
      userPoolId: this.typedConfig.get('AWS_COGNITO_USER_POOL_ID'),
      clientId: this.typedConfig.get('AWS_COGNITO_CLIENT_ID'),
      tokenUse: 'access',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('認証ヘッダーが存在しません');
    }
    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = await this.accessTokenVerifier.verify(token);
      // Cognito Access Token の中身（sub, scope, client_id など）
      req.user = payload;
      return true;
    } catch (err) {
      if (err instanceof Error) {
        // トークン期間が切れたかどうかを判定
        if (err instanceof JwtExpiredError) {
          throw new UnauthorizedException('アクセストークンの有効期限が切れています');
        }
        throw new UnauthorizedException(`認証に失敗しました: ${err.message}`);
      }
      throw new UnauthorizedException('無効なトークンです');
    }
  }
}
