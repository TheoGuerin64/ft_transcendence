import { Ball } from '../classes/ball.class';
import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameService {
  private games: Game[] = [];

  getGames(): Game[] {
    return this.games;
  }

  endGame(server: Server, socket: Socket, game: Game): void {
    if (game.getPlayerOne().getSocketID() === socket.id) {
      this.setScoreAndEmit(
        server,
        game.getPlayerOne(),
        game.getPlayerTwo(),
        game.getGameID(),
        'PlayerTwoWinGame',
      );
    } else {
      this.setScoreAndEmit(
        server,
        game.getPlayerTwo(),
        game.getPlayerOne(),
        game.getGameID(),
        'PlayerOneWinGame',
      );
    }
    game.setBall(null);
  }

  setScoreAndEmit(
    server: Server,
    playerDisconnected: Player,
    PlayerConnected: Player,
    gameID: string,
    message: string,
  ): void {
    playerDisconnected.setPoint(0);
    PlayerConnected.setPoint(5);
    server.in(gameID).emit(message);
  }

  eraseGame(game: Game): void {
    this.games = this.games.filter((element) => element !== game);
  }

  joinGameRoom(socket: Socket): void {
    const game = this.games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game !== undefined) {
      socket.join(game.getGameID());
    }
  }

  startGame(server: Server, playerOne: Player, playerTwo: Player): Game {
    const newGame = new Game('game', playerOne, playerTwo);
    this.games.push(newGame);
    server
      .in(playerOne.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    server
      .in(playerTwo.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    return newGame;
  }

  newPoint(server: Server, game: Game): boolean {
    const ball = game.getBall();
    const playerOne = game.getPlayerOne();
    const playerTwo = game.getPlayerTwo();
    if (ball.getPositionX() > 0) {
      playerOne.addOnePoint();
      server.to(game.getGameID()).emit('PlayerOneWinPoint');
    } else {
      playerTwo.addOnePoint();
      server.to(game.getGameID()).emit('PlayerTwoWinPoint');
    }

    playerOne.setPosY(0);
    playerTwo.setPosY(0);
    server
      .to(game.getGameID())
      .emit('someoneMoved', playerOne.getLogin(), playerOne.getPosY());
    server
      .to(game.getGameID())
      .emit('someoneMoved', playerTwo.getLogin(), playerTwo.getPosY());
    if (playerOne.getPoint() >= 5 || playerTwo.getPoint() >= 5) {
      game.setBall(null);
      return true;
    } else {
      game.setBall(new Ball());
      return false;
    }
  }
}
