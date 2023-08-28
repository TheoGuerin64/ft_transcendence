import { Ball } from '../classes/ball.class';
import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server, Socket } from 'socket.io';

@Injectable()
export class GameService {
  private games: Game[] = [];

  /**
   * get all the games actually playing
   * @returns all the games actually playing
   */
  getGames(): Game[] {
    return this.games;
  }

  /**
   * if one player disconnect,
   * the game is ended and the other one win the game
   * @param server socket server
   * @param socket socket which send the message
   * @param game game instance
   */
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

  /**
   * set the score of the player who disconnect at 0 and the other one at 5,
   * and emit the message
   * @param server socket server
   * @param playerDisconnected player who disconnect from the game
   * @param PlayerConnected player who is still here
   * @param gameID game ID
   * @param message message to emit
   */
  setScoreAndEmit(
    server: Server,
    playerDisconnected: Player,
    PlayerConnected: Player,
    gameID: string,
    message: string,
  ): void {
    playerDisconnected.setPoint(0);
    PlayerConnected.setPoint(5);
    server.in(gameID).emit(message, 'surrender');
  }

  /**
   * erase the game from the games array
   * @param game game instance
   */
  eraseGame(game: Game): void {
    this.games = this.games.filter((element) => element !== game);
  }

  /**
   * join the socket room of the game
   * to emit only at this 2 players the informations
   * @param socket socket which send the message
   */
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

  /**
   * create a new instance of game class,
   * push it into array of games
   * and send to player the message that they find a game
   * @param server socket server
   * @param playerOne first player who join the queue
   * @param playerTwo second player who join the queue
   * @param gameType type of game which is started
   * @returns instance of game class
   */
  startGame(
    server: Server,
    playerOne: Player,
    playerTwo: Player,
    gameType: string,
  ): Game {
    const newGame = new Game(gameType, playerOne, playerTwo);
    this.resetPlayer(playerOne);
    this.resetPlayer(playerTwo);
    this.games.push(newGame);
    server
      .in(playerOne.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin(), gameType);
    server
      .in(playerTwo.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin(), gameType);
    return newGame;
  }

  /**
   * add a point to the user which win this one,
   * emit this information,
   * check if no one has 5 points (== they would have win)
   * emit this information
   * reset players positions and ball
   * @param server socket server
   * @param game game instance
   * @returns
   */
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

    this.resetPlayer(playerOne);
    this.resetPlayer(playerTwo);
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
      game.setBall(new Ball(game.getGameType()));
      return false;
    }
  }

  private resetPlayer(player: Player): void {
    player.setPosY(0);
    player.setLastKeyType(0, 'keyup');
    player.setLastKeyType(1, 'keyup');
    if (player.getIntervalID(0) !== null) {
      clearInterval(player.getIntervalID(0));
    }
    if (player.getIntervalID(1) !== null) {
      clearInterval(player.getIntervalID(1));
    }
  }
}
