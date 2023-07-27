import { ChatUser } from './chatUser.entity';
import { ChatUserService } from './chatUser.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ChatUser])],
  providers: [ChatUserService],
  exports: [ChatUserService],
})
export class ChatUserModule {}
