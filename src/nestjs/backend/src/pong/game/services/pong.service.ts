import { BallService } from './ball.service';
import { collisionBallMapBorder } from '../globals';
import { Game } from '../classes/game.class';
import { GameService } from './game.service';
import { Injectable } from '@nestjs/common';
import { MatchPlayedService } from 'src/pong/database/matchPlayed.service';
import { Player } from '../classes/player.class';
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
   * create a game based on a invitation
   * @param server socket server
   * @param userOne login and socket of a user
   * @param userTwo login and socket of a user
   * @param gameType normal or custom game
   */
  invitationGame(
    server: Server,
    userOne: { login: string; username: string; socket: Socket },
    userTwo: { login: string; username: string; socket: Socket },
    gameType: string,
  ) {
    const playerOne = new Player(
      userOne.login,
      userOne.username,
      userOne.socket.id,
    );
    const playerTwo = new Player(
      userTwo.login,
      userTwo.username,
      userTwo.socket.id,
    );
    this.startGame(server, playerOne, playerTwo, gameType);
  }

  /**
   * add a player into a queue
   * and start a game by popping 2 of them
   * if there is at least 2 in this queue
   * @param server socket server
   * @param queueType normal or custom queue
   * @returns
   */
  joinQueue(server: Server, socket: Socket, queueType: string): void {
    this.playerService.joinQueue(socket, queueType);
    if (this.playerService.getNbPlayersInqueue(queueType) < 2) {
      return;
    }
    this.setGame(server, queueType);
  }

  /**
   * take off two player of the queue and start a game
   * @param server socket server
   * @param queueType normal or custom queue
   */
  setGame(server: Server, queueType: string) {
    const queue = this.playerService.getQueue(queueType);
    if (queue === null) {
      return;
    }
    const playerTwo = queue.pop();
    const playerOne = queue.pop();
    this.startGame(server, playerOne, playerTwo, queueType);
  }

  /**
   * create a new game and start interval loop of the ball
   * @param server socket server
   * @param playerOne player instance
   * @param playerTwo player instance
   * @param queueType normal or custom queue
   */
  startGame(
    server: Server,
    playerOne: Player,
    playerTwo: Player,
    queueType: string,
  ) {
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
        .emit('PlayerOneWinGame', game.getPlayerOne().getUsername());
    } else if (game.getPlayerTwo().getPoint() >= 5) {
      server
        .to(game.getGameID())
        .emit('PlayerTwoWinGame', game.getPlayerTwo().getUsername());
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
   * @param server socket server
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

    if (playerOneDatabase === null || playerTwoDatabase === null) {
      return;
    }

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
