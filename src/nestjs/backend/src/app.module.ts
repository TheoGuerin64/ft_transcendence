import { AuthModule } from './auth/auth.module';
import { Channel } from './chat/channel.entity';
import { ChannelModule } from './chat/channel.module';
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
      entities: [User, Channel, Message],
      synchronize: true,
    }),
    ChannelModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
