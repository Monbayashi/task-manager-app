import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './common/config/typed-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // 環境取得
  const typedConfig = app.get(TypedConfigService);
  // ロガー

  app.setGlobalPrefix(typedConfig.get('BACKEND_PREFIX'));
  await app.listen(typedConfig.get('BACKEND_PORT'));
}
void bootstrap();
