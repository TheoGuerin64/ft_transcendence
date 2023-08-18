import { MatchPlayedModule } from 'src/pong/database/matchPlayed.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { UserStats } from './userStats.entity';
import { UserStatsController } from './userStats.controller';
import { UserStatsService } from './userStats.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserStats])],
  controllers: [UserStatsController],
  providers: [UserStatsService, UserStats],
  exports: [UserStatsService],
})
export class userStatsModule {}
