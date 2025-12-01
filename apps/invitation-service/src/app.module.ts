import { Module } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';
import { TypedConfigModule } from './common/config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  providers: [InvitationService],
})
export class AppModule {}
