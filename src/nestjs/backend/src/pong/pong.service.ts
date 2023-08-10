import { Ball } from './ball.service';
import { Game } from './game.service';
import { Globals } from './globals.service';
import { Injectable } from '@nestjs/common';
import { Player } from './player.service';
import { Server, Socket } from 'socket.io';

@Injectable()
export class PongService {
  Players: Player[] = [];
  PlayersQueue: Player[] = [];
  Games: Game[] = [];

  connectGame(socket: Socket, login: string): void {
    const player = this.Players.find((element) => element.getLogin() === login);
    if (player !== undefined) {
      return;
    }
    const newPlayer = new Player(login, socket.id);
    this.Players.push(newPlayer);
  }

  disconnectPlayer(server: Server, socket: Socket): void {
    this.eraseFromArray(this.Players, socket);
    this.eraseFromArray(this.PlayersQueue, socket);
    this.endGame(server, socket);
  }

  eraseFromArray(playerArray: Player[], socket: Socket): void {
    const playerIndex: number = playerArray.findIndex(
      (element) => element.getSocketID() === socket.id,
    );
    if (playerIndex === -1) {
      return;
    }
    playerArray.splice(playerIndex, 1);
  }

  endGame(server: Server, socket: Socket): void {
    const gameIndex = this.Games.findIndex(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (gameIndex === -1) {
      return;
    }

    const game = this.Games[gameIndex];
    if (game.getPlayerOne().getSocketID() === socket.id) {
      this.emitWinner(
        server,
        game.getPlayerTwo(),
        game.getGameID(),
        'PlayerTwoWinGame',
      );
    } else {
      this.emitWinner(
        server,
        game.getPlayerOne(),
        game.getGameID(),
        'PlayerOneWinGame',
      );
    }
    game.setBall(null);
    this.Games.splice(gameIndex, 1);
  }

  emitWinner(
    server: Server,
    Player: Player,
    GameID: string,
    message: string,
  ): void {
    Player.setPoint(5);
    server.in(GameID).emit(message);
    //emit to the database the result
  }
  joinQueue(server: Server, login: string): void {
    const player = this.Players.find((element) => element.getLogin() === login);
    if (player === undefined || this.PlayersQueue.includes(player)) {
      return;
    }
    if (this.PlayersQueue.length < 1) {
      this.PlayersQueue.push(player);
    } else {
      this.startGame(server, player);
    }
  }

  startGame(server: Server, playerOne: Player): void {
    const playerTwo = this.PlayersQueue.pop();
    const newGame = new Game('game', playerOne, playerTwo);
    this.Games.push(newGame);
    server
      .in(playerOne.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    server
      .in(playerTwo.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    setInterval(() => Ball.ballMovement(server, newGame), 15);
  }

  joinGameRoom(socket: Socket): void {
    const game = this.Games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game !== undefined) {
      socket.join(game.getGameID());
    }
  }

  playerMovement(server: Server, socket: Socket, keycode: string): void {
    const game = this.Games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game === undefined) {
      return;
    }

    const player = this.findPlayer(game, socket);
    this.updatePosition(player, keycode);
    server
      .in(game.getGameID())
      .emit('someoneMoved', player.getLogin(), player.getPosY());
  }

  private updatePosition(player: Player, keycode: string): void {
    if (keycode === 'w') {
      if (
        player.getPosY() + Globals.playerStep <
        Globals.collisionPlayerMapBorder
      ) {
        player.setPosY(player.getPosY() + Globals.playerStep);
      } else {
        player.setPosY(Globals.collisionPlayerMapBorder);
      }
    } else if (keycode === 's') {
      if (
        player.getPosY() - Globals.playerStep >
        -Globals.collisionPlayerMapBorder
      ) {
        player.setPosY(player.getPosY() - Globals.playerStep);
      } else {
        player.setPosY(-Globals.collisionPlayerMapBorder);
      }
    }
  }

  private findPlayer(game: Game, socket: Socket): Player {
    let player: Player;
    if (game.getPlayerOne().getSocketID() === socket.id) {
      player = game.getPlayerOne();
    } else {
      player = game.getPlayerTwo();
    }
    return player;
  }
}
