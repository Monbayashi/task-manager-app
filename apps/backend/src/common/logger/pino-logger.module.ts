import { Module, RequestMethod } from '@nestjs/common';
import { formatISO } from 'date-fns';
import { LoggerModule } from 'nestjs-pino';
import { TypedConfigModule } from '../config/typed-config.module';
import { TypedConfigService } from '../config/typed-config.service';
import { toZonedTime } from 'date-fns-tz';

@Module({
  imports: [
    // ロガー
    LoggerModule.forRootAsync({
      imports: [TypedConfigModule],
      inject: [TypedConfigService],
      useFactory: async (config: TypedConfigService) => {
        return {
          // ロガー除外設定
          exclude: [
            { path: 'api/health', method: RequestMethod.GET },
            { path: 'api/healthz', method: RequestMethod.GET },
          ],
          // pinoHttp設定
          pinoHttp: {
            level: config.get('BACKEND_LOG_LEVEL'),
            // pid, hostname などの不要な base 情報を消す
            base: undefined,
            timestamp: () => {
              const now = new Date();
              const jstate = toZonedTime(now, 'Asia/Tokyo');
              return `,"time":"${formatISO(jstate, { representation: 'complete' })}"`;
            },
            serializers: {
              req: (req) => {
                return {
                  id: req.id,
                  method: req.method,
                  url: req.url,
                  ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown',
                };
              },
              res: (res) => ({ statusCode: res.statusCode }),
              err: (err) => {
                if (!err) return {};
                const response = typeof err.getResponse === 'function' ? err.getResponse() : err.response;
                return {
                  message: err.message,
                  status: err.status || err.statusCode || 500,
                  errors: response?.errors || response || null,
                };
              },
            },
            // ログレベル設定
            customLogLevel: (req, res) => {
              if (res.statusCode === 304) return 'silent'; // 304はログらない
              if (res.statusCode >= 500) return 'error';
              if (res.statusCode >= 400) return 'warn';
              if (res.statusCode >= 300) return 'debug';
              return 'info';
            },
            transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
          },
        };
      },
    }),
  ],
})
export class PinoLoggerModule {}
