import { collisionPlayerMapBorder, playerSpeed } from '../globals';
import { Game } from '../classes/game.class';
import { Injectable } from '@nestjs/common';
import { Player } from '../classes/player.class';
import { Server, Socket } from 'socket.io';

@Injectable()
export class PlayerService {
  private readonly players: Player[] = [];
  private readonly normalQueue: Player[] = [];
  private readonly customQueue: Player[] = [];

  getPlayers(): Player[] {
    return this.players;
  }

  getQueue(queueType: string): Player[] {
    if (queueType === 'normal') {
      return this.normalQueue;
    } else if (queueType === 'custom') {
      return this.customQueue;
    } else {
      return null;
    }
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
    this.eraseFromArray(this.customQueue, socket.id);
  }

  disconnectSecondPlayer(socket: Socket, game: Game): void {
    const socketID = this.findSecondPlayerSocketID(socket, game);
    this.eraseFromArray(this.players, socketID);
    this.eraseFromArray(this.normalQueue, socketID);
    this.eraseFromArray(this.customQueue, socketID);
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

  joinQueue(server: Server, login: string, queueType: string): number {
    const player = this.players.find((element) => element.getLogin() === login);
    if (player === undefined || this.normalQueue.includes(player)) {
      return -1;
    }
    if (queueType === 'normal') {
      this.normalQueue.push(player);
      return this.normalQueue.length;
    } else if (queueType === 'custom') {
      this.customQueue.push(player);
      return this.customQueue.length;
    } else {
      return -1;
    }
  }

  playerMovement(
    server: Server,
    socket: Socket,
    game: Game,
    keycode: string,
    keytype: string,
  ): void {
    let index;
    if (keycode === 'w') {
      index = 0;
    } else if (keycode === 's') {
      index = 1;
    } else {
      return;
    }
    const player = this.findPlayer(game, socket);
    if (player.getLastKeyType(index) !== 'keydown' && keytype === 'keydown') {
      player.setLastKeyType(index, keytype);
      const intervalID = setInterval(() => {
        if (player.getLastKeyType(0) === player.getLastKeyType(1)) {
          return;
        }
        this.updatePosition(player, keycode);
        server
          .in(game.getGameID())
          .emit('someoneMoved', player.getLogin(), player.getPosY());
      }, 15);
      player.setIntervalID(index, intervalID);
    } else if (keytype === 'keyup') {
      player.setLastKeyType(index, keytype);
      clearInterval(player.getIntervalID(index));
    }
  }

  private updatePosition(player: Player, keycode: string): void {
    if (keycode === 'w') {
      if (player.getPosY() + playerSpeed < collisionPlayerMapBorder) {
        player.setPosY(player.getPosY() + playerSpeed);
      } else {
        player.setPosY(collisionPlayerMapBorder);
      }
    } else if (keycode === 's') {
      if (player.getPosY() - playerSpeed > -collisionPlayerMapBorder) {
        player.setPosY(player.getPosY() - playerSpeed);
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
