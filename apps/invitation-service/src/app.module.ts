import { Module } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';
import { TypedConfigModule } from './common/config/typed-config.module';
import { PinoLoggerModule } from './common/loggger/pino-logger.module';
import { EventUtilsService } from './shared/event/event-client.service';
import { SesClientService } from './shared/ses/ses-client.service';

@Module({
  imports: [TypedConfigModule, PinoLoggerModule],
  providers: [EventUtilsService, InvitationService, SesClientService],
})
export class AppModule {}
