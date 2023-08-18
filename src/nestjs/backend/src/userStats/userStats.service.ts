import { DeepPartial, Repository } from 'typeorm';
import { Game } from '../pong/game/classes/game.class';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';
import { MatchPlayedService } from 'src/pong/database/matchPlayed.service';
import { User } from 'src/user/user.entity';
import { UserStats } from './userStats.entity';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsModel: Repository<UserStats>,
  ) {}

  async init(): Promise<UserStats> {
    const userStats = await this.userStatsModel.create({
      nbWin: 0,
      nbLose: 0,
      elo: 0,
      ladder: -1,
      winRate: 0,
    });
    await this.userStatsModel.save(userStats);
    return userStats;
  }

  async findOne(login: string) {
    return await this.userStatsModel.findOne({
      where: [{ user: { login } }],
    });
  }

  async updateStats(playerOne: User, playerTwo: User, game: Game) {
    await this.updatePlayer(playerOne, game);
    await this.updatePlayer(playerTwo, game);
    await this.updateLadder();
  }

  private async updatePlayer(user: User, game: Game) {
    const userStats = await this.userStatsModel.findOne({
      where: [{ user: { login: user.login } }],
    });
    this.updateWinLose(user.login, userStats, game);
    this.updateElo(user.login, userStats, game);
    await this.userStatsModel.save(userStats);
  }

  private updateWinLose(login: string, userStats: UserStats, game: Game) {
    if (
      (game.getPlayerOne().getLogin() == login &&
        game.getPlayerOne().getPoint() === 5) ||
      (game.getPlayerTwo().getLogin() == login &&
        game.getPlayerTwo().getPoint() === 5)
    ) {
      userStats.nbWin++;
    } else {
      userStats.nbLose++;
    }
    this.updateWinrate(userStats);
  }

  private updateWinrate(userStats: UserStats) {
    userStats.winRate = Math.round(
      (userStats.nbWin / (userStats.nbWin + userStats.nbLose)) * 100,
    );
  }

  private updateElo(login: string, userStats: UserStats, game: Game) {
    if (game.getPlayerOne().getLogin() == login) {
      userStats.elo +=
        game.getPlayerOne().getPoint() - game.getPlayerTwo().getPoint();
    } else {
      userStats.elo +=
        game.getPlayerTwo().getPoint() - game.getPlayerOne().getPoint();
    }
  }

  private async updateLadder() {
    const stats = await this.userStatsModel.find({ order: { elo: 'DESC' } });
    for (let x = 0; x < stats.length; x++) {
      stats[x].ladder = x + 1;
    }
  }
}
