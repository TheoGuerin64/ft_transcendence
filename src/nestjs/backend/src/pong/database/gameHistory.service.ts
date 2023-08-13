import { DeepPartial, Repository } from 'typeorm';
import { GameHistory } from './gameHistory.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(GameHistory)
    private readonly gamePlayedModel: Repository<GameHistory>,
  ) {}

  create(gamePlayedData: DeepPartial<GameHistory>): GameHistory {
    const gamePlayed = this.gamePlayedModel.create(gamePlayedData);
    this.gamePlayedModel.save(gamePlayed);
    return gamePlayed;
  }
}
