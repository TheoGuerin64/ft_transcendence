import { AuthModule } from './auth/auth.module';
import { Chat } from './chat/chat.entity';
import { ChatModule } from './chat/chat.module';
import { ChatUser } from './chat/chatUser/chatUser.entity';
import { Message } from './chat/message/message.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USER,
      entities: [User, Chat, ChatUser, Message],
      synchronize: true,
    }),
    ChatModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
