import { MatchHistoryController } from './matchHistory.controller';
import { MatchHistoryService } from './matchHistory.service';
import { MatchPlayedModule } from 'src/pong/database/matchPlayed.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [MatchPlayedModule],
  controllers: [MatchHistoryController],
  providers: [MatchHistoryService],
})
export class MatchHistoryModule {}
