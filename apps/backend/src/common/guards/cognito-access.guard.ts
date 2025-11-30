import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { JwtExpiredError } from 'aws-jwt-verify/error';

/**
 * AWS-Cognito JWT検証
 * @description https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
 */
const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: 'ap-northeast-1_MD7zqiZga', // TODO 後で環境変数に変更する。
  clientId: '7oa3l9iv02dr6vv6du8b0aqehm',
  tokenUse: 'access',
});

/**
 * Cognito ガード
 */
@Injectable()
export class CognitoAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('認証ヘッダーが存在しません');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = await accessTokenVerifier.verify(token);

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
