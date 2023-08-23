import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Channel } from './chat/channel.entity';
import { ChannelModule } from './chat/channel.module';
import { Friendship } from './user/friendship/friendship.entity';
import { LoggerMiddleware } from './logger.middleware';
import { MatchPlayed } from './pong/database/matchPlayed.entity';
import { MatchPlayedModule } from './pong/database/matchPlayed.module';
import { Membership } from './chat/membership.entity';
import { Message } from './chat/message.entity';
import { MessageModule } from './chat/message.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PongModule } from './pong/game/pong.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { UserStats } from './userStats/userStats.entity';
import { userStatsModule } from './userStats/userStats.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USER,
      entities: [
        User,
        MatchPlayed,
        UserStats,
        Friendship,
        Message,
        Channel,
        Membership,
      ],
      synchronize: true,
    }),
    ChannelModule,
    MessageModule,
    UserModule,
    AuthModule,
    PongModule,
    MatchPlayedModule,
    userStatsModule,
  ],
  controllers: [],
  providers: [AppService, AppGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
