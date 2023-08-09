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

  joinQueue(server: Server, login: string): void {
    const player = this.Players.find((element) => element.getLogin() === login);
    if (player === undefined) {
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
    Ball.ballMovement(server, newGame);
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
