import { GameHistory } from './gameHistory.entity';
import { GameHistoryService } from './gameHistory.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [GameHistoryService, GameHistory],
  imports: [TypeOrmModule.forFeature([GameHistory])],
  exports: [GameHistoryService],
})
export class GameHistoryModule {}
