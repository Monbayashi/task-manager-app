import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './common/config/typed-config.service';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  // ipを取得する為に設定
  app.set('trust proxy', 'loopback');
  // 環境取得
  const typedConfig = app.get(TypedConfigService);
  // ロガー
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  // CORS
  app.enableCors({
    origin: typedConfig
      .get('BACKEND_CORS_ORIGIN')
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  await app.listen(typedConfig.get('BACKEND_PORT'));
}
void bootstrap();
