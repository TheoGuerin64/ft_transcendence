import { MatchHistoryController } from './matchHistory.controller';
import { MatchPlayedModule } from 'src/pong/database/matchPlayed.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MatchPlayedModule],
  controllers: [MatchHistoryController],
})
export class MatchHistoryModule {}
