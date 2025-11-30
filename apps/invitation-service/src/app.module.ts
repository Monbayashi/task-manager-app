import { Module } from '@nestjs/common';
import { InvitationService } from './invitation/invitation.service';

@Module({
  imports: [],
  providers: [InvitationService],
})
export class AppModule {}
