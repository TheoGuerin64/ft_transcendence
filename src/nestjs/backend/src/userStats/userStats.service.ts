import { Game } from '../pong/game/classes/game.class';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { UserStats } from './userStats.entity';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectRepository(UserStats)
    private readonly userStatsModel: Repository<UserStats>,
  ) {}

  /**
   * created and init value of a table when a user is created
   * @returns table created
   */
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

  /**
   * find a user based on his login
   * @param login login of the user
   * @returns player found
   */
  async findOne(login: string) {
    return await this.userStatsModel.findOne({
      where: [{ user: { login } }],
    });
  }

  /**
   * update player stat after a game and ladder
   * @param playerOne player instance
   * @param playerTwo player instance
   * @param game game intance
   */
  async updateStats(playerOne: User, playerTwo: User, game: Game) {
    await this.updatePlayer(playerOne, game);
    await this.updatePlayer(playerTwo, game);
    await this.updateLadder();
  }

  /**
   * update win/lose and elo of the player and save it into the database
   * @param user user table
   * @param game game instance
   */
  private async updatePlayer(user: User, game: Game) {
    const userStats = await this.userStatsModel.findOne({
      where: [{ user: { login: user.login } }],
    });
    this.updateWinLose(user.login, userStats, game);
    this.updateElo(user.login, userStats, game);
    await this.userStatsModel.save(userStats);
  }

  /**
   * add one to win or lose count of the user, and calculate his winrate
   * @param login login of the user
   * @param userStats userStat table
   * @param game game instance
   */
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

  /**
   * calculate winrate of the user
   * @param userStats userStat table
   */

  private updateWinrate(userStats: UserStats) {
    userStats.winRate = Math.round(
      (userStats.nbWin / (userStats.nbWin + userStats.nbLose)) * 100,
    );
  }

  /**
   * update elo of the player
   * the calcul is : winner point - loser point
   * @param login login of the user
   * @param userStats userStats table
   * @param game game instance
   */
  private updateElo(login: string, userStats: UserStats, game: Game) {
    if (game.getPlayerOne().getLogin() == login) {
      userStats.elo +=
        game.getPlayerOne().getPoint() - game.getPlayerTwo().getPoint();
    } else {
      userStats.elo +=
        game.getPlayerTwo().getPoint() - game.getPlayerOne().getPoint();
    }
  }

  /**
   * get all player stats,
   * sort them by elo,
   * give them a number which is their rank
   */
  private async updateLadder() {
    const stats = await this.userStatsModel.find({ order: { elo: 'DESC' } });
    for (let x = 0; x < stats.length; x++) {
      stats[x].ladder = x + 1;
    }
    await this.userStatsModel.save(stats);
  }
}
