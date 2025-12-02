import { Module } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';
import { TypedConfigModule } from './common/config/typed-config.module';
import { PinoLoggerModule } from './common/loggger/pino-logger.module';

@Module({
  imports: [TypedConfigModule, PinoLoggerModule],
  providers: [InvitationService],
})
export class AppModule {}
