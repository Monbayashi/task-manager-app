import { Module } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';
import { TypedConfigModule } from './common/config/typed-config.module';
import { PinoLoggerModule } from './common/loggger/pino-logger.module';
import { SnsClientService } from './shared/sns/sns-client.service';
import { EventUtilsService } from './shared/event/event-client.service';

@Module({
  imports: [TypedConfigModule, PinoLoggerModule],
  providers: [EventUtilsService, InvitationService, SnsClientService],
})
export class AppModule {}
