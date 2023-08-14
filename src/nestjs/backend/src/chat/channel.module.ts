import { Channel } from './channel.entity';
import { ChannelGateway } from './channel.gateway';
import { ChannelService } from './channel.service';
import { MembershipModule } from './membership.module';
import { MessageModule } from './message.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    MessageModule,
    UserModule,
    MembershipModule,
  ],
  providers: [ChannelService, ChannelGateway],
  exports: [ChannelService],
})
export class ChannelModule {}
