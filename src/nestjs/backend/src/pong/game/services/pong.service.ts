import { BallService } from './ball.service';
import { Game } from '../classes/game.class';
import { GameHistoryService } from 'src/pong/database/gameHistory.service';
import { GameService } from './game.service';
import { Injectable } from '@nestjs/common';
import { PlayerService } from './player.service';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PongService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly gameService: GameService,
    private readonly gameHistoryService: GameHistoryService,
    private readonly userService: UserService,
  ) {}

  joinQueue(
    server: Server,
    playerService: PlayerService,
    gameService: GameService,
    login: string,
  ): void {
    const nbPlayersInQueue = playerService.joinQueue(server, login);
    if (nbPlayersInQueue < 2) {
      return;
    }
    const normalQueue = playerService.getNormalQueue();
    const playerTwo = normalQueue.pop();
    const playerOne = normalQueue.pop();
    const newGame = gameService.startGame(server, playerOne, playerTwo);
    const intervalID = setInterval(
      () => this.updateBall(server, gameService, newGame),
      15,
    );
    newGame.setIntervalID(intervalID);
  }

  private async updateBall(
    server: Server,
    gameService: GameService,
    game: Game,
  ) {
    const result = BallService.ballMovement(server, game);
    if (result === true) {
      const gameFinished = gameService.newPoint(server, game);
      if (gameFinished === true) {
        clearInterval(game.getIntervalID());
        const playerOneDatabase = await this.userService.findOne(
          game.getPlayerOne().getLogin(),
        );
        const playerTwoDatabase = await this.userService.findOne(
          game.getPlayerTwo().getLogin(),
        );
        this.gameHistoryService.create({
          id: Number(game.getGameID()),
          users: [playerOneDatabase, playerTwoDatabase],
          result: [
            game.getPlayerOne().getPoint(),
            game.getPlayerTwo().getPoint(),
          ],
        });
      }
      if (game.getPlayerOne().getPoint() >= 5) {
        server.to(game.getGameID()).emit('PlayerOneWinGame');
      } else if (game.getPlayerTwo().getPoint() >= 5) {
        server.to(game.getGameID()).emit('PlayerTwoWinGame');
      }
    }
  }

  playerMovement(
    server: Server,
    socket: Socket,
    playerService: PlayerService,
    gameService: GameService,
    keycode,
  ): void {
    const games = gameService.getGames();
    const game = games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game !== undefined) {
      playerService.playerMovement(server, socket, game, keycode);
    }
  }
  disconnectPlayer(
    server: Server,
    socket: Socket,
    playerService: PlayerService,
    gameService: GameService,
  ) {
    const games = gameService.getGames();
    const game = games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );

    playerService.disconnectPlayer(socket);
    if (game !== undefined) {
      playerService.disconnectSecondPlayer(socket, game);
      gameService.endGame(server, socket, game);
      gameService.eraseGame(game);
      clearInterval(game.getIntervalID());
      //request to DB
    }
  }
}