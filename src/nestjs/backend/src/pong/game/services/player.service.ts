import { collisionPlayerMapBorder, playerStep } from '../globals';
import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server, Socket } from 'socket.io';

@Injectable()
export class PlayerService {
  private readonly players: Player[] = [];
  private readonly normalQueue: Player[] = [];

  getPlayers(): Player[] {
    return this.players;
  }

  getNormalQueue(): Player[] {
    return this.normalQueue;
  }

  connectGame(socket: Socket, login: string): void {
    const player = this.players.find((element) => element.getLogin() === login);
    if (player !== undefined) {
      return;
    }
    const newPlayer = new Player(login, socket.id);
    this.players.push(newPlayer);
  }

  disconnectPlayer(socket: Socket): void {
    this.eraseFromArray(this.players, socket.id);
    this.eraseFromArray(this.normalQueue, socket.id);
  }

  disconnectSecondPlayer(socket: Socket, game: Game): void {
    const socketID = this.findSecondPlayerSocketID(socket, game);
    this.eraseFromArray(this.players, socketID);
    this.eraseFromArray(this.normalQueue, socketID);
  }

  findSecondPlayerSocketID(socket: Socket, game: Game): string {
    let login;
    if (game.getPlayerOne().getSocketID() == socket.id) {
      login = game.getPlayerTwo().getLogin();
    } else {
      login = game.getPlayerOne().getLogin();
    }
    return login;
  }

  eraseFromArray(playerArray: Player[], socketID: string): void {
    const playerIndex: number = playerArray.findIndex(
      (element) => element.getSocketID() === socketID,
    );
    if (playerIndex === -1) {
      return;
    }
    playerArray.splice(playerIndex, 1);
  }

  joinQueue(server: Server, login: string): number {
    const player = this.players.find((element) => element.getLogin() === login);
    if (player === undefined || this.normalQueue.includes(player)) {
      return -1;
    }
    this.normalQueue.push(player);
    return this.normalQueue.length;
  }

  playerMovement(
    server: Server,
    socket: Socket,
    game: Game,
    keycode: string,
  ): void {
    const player = this.findPlayer(game, socket);
    this.updatePosition(player, keycode);
    server
      .in(game.getGameID())
      .emit('someoneMoved', player.getLogin(), player.getPosY());
  }

  private updatePosition(player: Player, keycode: string): void {
    if (keycode === 'w') {
      if (player.getPosY() + playerStep < collisionPlayerMapBorder) {
        player.setPosY(player.getPosY() + playerStep);
      } else {
        player.setPosY(collisionPlayerMapBorder);
      }
    } else if (keycode === 's') {
      if (player.getPosY() - playerStep > -collisionPlayerMapBorder) {
        player.setPosY(player.getPosY() - playerStep);
      } else {
        player.setPosY(-collisionPlayerMapBorder);
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
