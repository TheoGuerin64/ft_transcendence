import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
