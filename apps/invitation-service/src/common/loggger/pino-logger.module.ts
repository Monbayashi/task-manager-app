import { Module } from '@nestjs/common';
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
          pinoHttp: {
            level: config.get('INVITATION_LOG_LEVEL'),
            // pid, hostname などの不要な base 情報を消す
            base: undefined,
            timestamp: () => {
              const now = new Date();
              const jstate = toZonedTime(now, 'Asia/Tokyo');
              return `,"time":"${formatISO(jstate, { representation: 'complete' })}"`;
            },
          },
        };
      },
    }),
  ],
})
export class PinoLoggerModule {}
