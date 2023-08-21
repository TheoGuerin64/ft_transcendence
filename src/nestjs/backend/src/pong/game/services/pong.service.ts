import { BallService } from './ball.service';
import { collisionBallMapBorder } from '../globals';
import { Game } from '../classes/game.class';
import { GameService } from './game.service';
import { Injectable } from '@nestjs/common';
import { MatchPlayedService } from 'src/pong/database/matchPlayed.service';
import { PlayerService } from './player.service';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { UserStatsService } from 'src/userStats/userStats.service';

@Injectable()
export class PongService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly userService: UserService,
    private readonly gameService: GameService,
    private readonly userStatsService: UserStatsService,
    private readonly matchPlayedService: MatchPlayedService,
  ) {}
  /**
   * add a player into a queue
   * and start a game by popping 2 of them
   * if there is at least 2 in this queue
   * @param server socket server
   * @param login login of the user joining the room
   * @param queueType normal or custom queue
   * @returns
   */
  joinQueue(server: Server, login: string, queueType: string): void {
    this.playerService.joinQueue(server, login, queueType);
    if (this.playerService.getNbPlayersInqueue(queueType) < 2) {
      return;
    }
    this.startGame(server, queueType);
  }

  /**
   * create a new game and start interval loop of the ball
   * @param server socket server
   * @param login login of the user joining the room
   * @param queueType normal or custom queue
   */
  startGame(server: Server, queueType: string) {
    const queue = this.playerService.getQueue(queueType);
    if (queue === null) {
      return;
    }
    const playerTwo = queue.pop();
    const playerOne = queue.pop();
    const newGame = this.gameService.startGame(
      server,
      playerOne,
      playerTwo,
      queueType,
    );
    const intervalID = setInterval(() => this.updateBall(server, newGame), 15);
    newGame.setIntervalID(intervalID);
  }

  /**
   * update the ball position and detect if a point has been win
   * @param server socket server
   * @param game game instance
   */
  private async updateBall(server: Server, game: Game): Promise<void> {
    BallService.ballMovement(server, game);
    if (
      (game.getBall().getPositionX() <= -collisionBallMapBorder ||
        game.getBall().getPositionX() >= collisionBallMapBorder) &&
      BallService.ballHitPaddle(game, {
        x: game.getBall().getPositionX(),
        y: game.getBall().getPositionY(),
      }) === false
    ) {
      const gameFinished = this.gameService.newPoint(server, game);
      if (gameFinished === true) {
        await this.someoneWon(server, game);
      }
    }
  }

  /**
   * if someone won the game, stop the interval of the ball,
   * erase the game
   * and emit informations of the winner
   * @param server socket server
   * @param game game instance
   */
  private async someoneWon(server: Server, game: Game): Promise<void> {
    clearInterval(game.getIntervalID());
    await this.saveGameInformations(game);
    this.gameService.eraseGame(game);
    if (game.getPlayerOne().getPoint() >= 5) {
      server
        .to(game.getGameID())
        .emit('PlayerOneWinGame', game.getPlayerOne().getLogin());
    } else if (game.getPlayerTwo().getPoint() >= 5) {
      server
        .to(game.getGameID())
        .emit('PlayerTwoWinGame', game.getPlayerTwo().getLogin());
    }
  }

  /**
   * adapt movement of the player
   * @param server socket server
   * @param socket socket which send the message
   * @param keycode key used
   * @param keytype key pressed or released
   */
  playerMovement(
    server: Server,
    socket: Socket,
    keycode: string,
    keytype: string,
  ): void {
    const games = this.gameService.getGames();
    const game = games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game !== undefined) {
      this.playerService.playerMovement(server, socket, game, keycode, keytype);
    }
  }

  /**
   * disconnect a player
   * and stop the game if he was playing one
   @param server socket server
   * @param socket socket which send the message
   */
  async disconnectPlayer(server: Server, socket: Socket) {
    const games = this.gameService.getGames();
    const game = games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );

    this.playerService.disconnectPlayer(socket);
    if (game !== undefined) {
      clearInterval(game.getIntervalID());
      this.gameService.endGame(server, socket, game);
      this.gameService.eraseGame(game);
      await this.saveGameInformations(game);
    }
  }

  /**
   * save game informations into the database
   * @param game game instance
   */
  private async saveGameInformations(game: Game) {
    const playerOneDatabase = await this.userService.findOne(
      game.getPlayerOne().getLogin(),
    );
    const playerTwoDatabase = await this.userService.findOne(
      game.getPlayerTwo().getLogin(),
    );
    this.matchPlayedService.create({
      users: [playerOneDatabase, playerTwoDatabase],
      result: [game.getPlayerOne().getPoint(), game.getPlayerTwo().getPoint()],
    });
    await this.userStatsService.updateStats(
      playerOneDatabase,
      playerTwoDatabase,
      game,
    );
  }
}
