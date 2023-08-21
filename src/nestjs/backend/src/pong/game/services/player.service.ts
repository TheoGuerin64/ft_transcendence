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

  /**
   * get all the players actually playing
   * @returns all the players connected
   */
  getPlayers(): Player[] {
    return this.players;
  }

  /**
   * get all the players from a queue
   * @param queueType string telling which queue we need to get
   * @returns all the players in the queue
   */
  getQueue(queueType: string): Player[] {
    if (queueType === 'normal') {
      return this.normalQueue;
    } else if (queueType === 'custom') {
      return this.customQueue;
    } else {
      return null;
    }
  }

  /**
   * create a new instance of player based on login provided
   * and push it into the players array
   * if he is not already in the array
   * @param socket socket which send the message
   * @param login login of the player
   */
  connectGame(socket: Socket, login: string): void {
    const player = this.players.find((element) => element.getLogin() === login);
    if (player !== undefined) {
      return;
    }
    const newPlayer = new Player(login, socket.id);
    this.players.push(newPlayer);
  }

  /**
   * erase player from all array when he disconnect
   * @param socket socket which send the message
   */
  disconnectPlayer(socket: Socket): void {
    this.eraseFromArray(this.players, socket.id);
    this.eraseFromArray(this.normalQueue, socket.id);
    this.eraseFromArray(this.customQueue, socket.id);
  }

  /**
   * erase a player from an array of player
   * @param playerArray  array of player
   * @param socketID Id of socket which send the message
   */
  eraseFromArray(playerArray: Player[], socketID: string): void {
    const playerIndex: number = playerArray.findIndex(
      (element) => element.getSocketID() === socketID,
    );
    if (playerIndex === -1) {
      return;
    }
    playerArray.splice(playerIndex, 1);
  }

  /**
   * add a player to a queue
   * @param server socket server
   * @param login login of the player
   */
  joinQueue(login: string, queueType: string): void {
    const player = this.players.find((element) => element.getLogin() === login);
    if (player === undefined || this.normalQueue.includes(player)) {
      return;
    }
    if (queueType === 'normal') {
      this.normalQueue.push(player);
    } else if (queueType === 'custom') {
      this.customQueue.push(player);
    }
  }

  /**
   * return number of people in a queue
   * @param queueType normal or custom queue
   * @returns number of player inside the queue joined
   */
  getNbPlayersInqueue(queueType: string): number {
    if (queueType === 'normal') {
      return this.normalQueue.length;
    } else if (queueType === 'custom') {
      return this.customQueue.length;
    } else {
      return -1;
    }
  }
  /**
   * adapt movement of the player
   * if a keytype is down, a interval loop is started
   * if a keytype is up, a interval loop is ended
   * @param server socket server
   * @param socket socket which send the message
   * @param game game instance
   * @param keycode key used
   * @param keytype key pressed or released
   * @returns
   */
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
      this.startIntervalLoop(server, game, player, index, keycode, keytype);
    } else if (keytype === 'keyup') {
      this.endIntervalLoop(player, index, keytype);
    }
  }

  /**
   * start an interval loop,
   * sending every 15 ms the updated position of the player
   * @param server socket server
   * @param game game instance
   * @param player player instance
   * @param index index of the array of key in player
   * @param keycode key used
   * @param keytype key pressed or released
   */
  private startIntervalLoop(
    server: Server,
    game: Game,
    player: Player,
    index: number,
    keycode: string,
    keytype: string,
  ): void {
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
  }

  /**
   * end an interval loop
   * @param player player instance
   * @param index index of the array of key in player
   * @param keytype key pressed or released
   */
  private endIntervalLoop(
    player: Player,
    index: number,
    keytype: string,
  ): void {
    player.setLastKeyType(index, keytype);
    clearInterval(player.getIntervalID(index));
  }

  /**
   * adapt position of the player on the Y axe based on the keycode
   * @param player player instance
   * @param keycode key used
   */
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

  /**
   * find the player instance based on his socket id in game instance
   * @param game game instance
   * @param socket socket which send the message
   * @returns player instance
   */
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
