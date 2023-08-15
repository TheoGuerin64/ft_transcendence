import { AuthModule } from './auth/auth.module';
import { MatchHistoryModule } from './matchHistory/matchHistory.module';
import { MatchPlayed } from './pong/database/matchPlayed.entity';
import { MatchPlayedModule } from './pong/database/matchPlayed.module';
import { Module } from '@nestjs/common';
import { PongModule } from './pong/game/pong.module';
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
      entities: [User, MatchPlayed],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    PongModule,
    MatchPlayedModule,
    MatchHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
