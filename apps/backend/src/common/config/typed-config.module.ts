import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? [] : [`.env.${process.env.NODE_ENV}`],
      validate: (config) => {
        const parsed = envSchema.safeParse(config);
        if (!parsed.success) {
          console.error('環境変数のバリデーションエラー:');
          console.error(parsed.error.issues.map((issue) => `- ${issue.path.join('.')} : ${issue.message}`));
          throw new Error('環境変数が不正');
        }
        return { ...config, ...parsed.data };
      },
    }),
  ],
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
