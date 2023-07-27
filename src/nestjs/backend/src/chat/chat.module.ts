import { Chat } from './chat.entity';
import { ChatService } from './chat.service';
import { ChatUser } from './chatUser/chatUser.entity';
import { ChatUserModule } from './chatUser/chatUser.module';
import { Message } from './message/message.entity';
import { MessageModule } from './message/message.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Chat])],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
