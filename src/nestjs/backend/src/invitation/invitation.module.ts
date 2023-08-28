import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { ChannelModule } from 'src/chat/channel.module';
import { MembershipModule } from 'src/chat/membership.module';
import { PongModule } from 'src/pong/game/pong.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    ChannelModule,
    MembershipModule,
    PongModule,
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [],
})
export class InvitationModule {}
