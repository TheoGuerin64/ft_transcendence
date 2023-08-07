import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

class Player {
  private readonly login: string;
  private readonly socketID: string;
  private posX: number;
  private posY: number;
  private point: number;

  constructor(login: string, socketID: string) {
    this.login = login;
    this.socketID = socketID;
    this.posX = 0;
    this.posY = 0;
    this.point = 0;
  }

  getLogin(): string {
    return this.login;
  }
  getSocketID(): string {
    return this.socketID;
  }
  getPosX(): number {
    return this.posX;
  }
  getPosY(): number {
    return this.posY;
  }
  getpoint(): number {
    return this.point;
  }
  setPosX(newPosX: number): void {
    this.posX = newPosX;
  }
  setPosY(newPosY: number): void {
    this.posY = newPosY;
  }
  setPoint(point: number): void {
    this.point = point;
  }
}

class Game {
  private readonly gameID: string;
  private readonly gameType: string;
  private readonly playerOne: Player;
  private readonly playerTwo: Player;

  constructor(gameType: string, playerOne: Player, playerTwo: Player) {
    this.gameID = playerTwo.getSocketID();
    this.gameType = gameType;
    this.playerOne = playerOne;
    this.playerOne.setPoint(0);
    this.playerTwo = playerTwo;
    this.playerTwo.setPoint(0);
  }

  getGameID(): string {
    return this.gameID;
  }
  getGameType(): string {
    return this.gameType;
  }
  getPlayerOne(): Player {
    return this.playerOne;
  }
  getPlayerTwo(): Player {
    return this.playerTwo;
  }
}

@WebSocketGateway({ cors: true })
export class EventGateway {
  @WebSocketServer()
  server: Server;

  Players: Player[] = [];
  PlayersNormalQueue: Player[] = [];
  PlayersCustomQueue: Player[] = [];
  Games: Game[] = [];

  offSet = 0.1;

  @SubscribeMessage('connection')
  connection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const newPlayer = new Player(login, socket.id);
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === newPlayer.getLogin(),
    );
    if (indexPlayer == -1) {
      this.Players.push(newPlayer);
      console.log('connect', this.Players);
      /*
      socket.emit('loadPlayers', this.Players);
      socket.broadcast.emit('newPlayerJoined', newPlayer);
      */
    } else {
      socket.emit('alreadyConnect');
    }
  }

  //refresh page => socket disconnect
  @SubscribeMessage('disconnecting')
  disconnect(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const index: number = this.Players.findIndex(
      (element) => element.getSocketID() == socket.id,
    );
    if (index == -1) {
      return;
    }
    const playerDisconnected = this.Players[index];
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', playerDisconnected.getLogin());
  }

  //change page(ex : return home) => socket doesn't disconnect
  @SubscribeMessage('unconnection')
  unconnection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', login);
  }

  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayer == -1) {
      return;
    }
    const indexPlayerQueue = this.PlayersNormalQueue.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayerQueue != -1) {
      socket.emit('alreadyInQueue');
      return;
    }
    const firstPlayer = this.Players[indexPlayer];
    if (this.PlayersNormalQueue.length >= 1) {
      const secondPlayer = this.PlayersNormalQueue.pop();
      const newGame = new Game('NormalGame', firstPlayer, secondPlayer);
      this.Games.push(newGame);
      socket
        .to(secondPlayer.getSocketID())
        .emit('gameStarted', JSON.stringify(newGame));
      socket.emit('gameStarted', JSON.stringify(newGame));
    } else {
      this.PlayersNormalQueue.push(firstPlayer);
    }
  }

  @SubscribeMessage('movement')
  movement(@MessageBody() data: { login: string; keyCode: string }): void {
    const index = this.Players.findIndex(
      (element) => element.getLogin() === data[0],
    );
    if (index == -1) {
      return;
    }
    const Player = this.Players[index];
    if (data[1] == 'w') {
      Player.setPosY(Player.getPosY() + this.offSet);
    } else if (data[1] == 'a') {
      Player.setPosX(Player.getPosX() - this.offSet);
    } else if (data[1] == 's') {
      Player.setPosY(Player.getPosY() - this.offSet);
    } else if (data[1] == 'd') {
      Player.setPosX(Player.getPosX() + this.offSet);
    }
    this.server.emit('someoneMoved', data[1], Player);
  }
  @SubscribeMessage('playerCollide')
  playerCollide(@MessageBody() data: { login: string; keyCode: string }): void {
    const index = this.Players.findIndex(
      (element) => element.getLogin() === data[0],
    );
    if (index == -1) {
      return;
    }
    const Player = this.Players[index];
    if (data[1] == 'w') {
      Player.setPosY(Player.getPosY() - 2 * this.offSet);
    } else if (data[1] == 'a') {
      Player.setPosX(Player.getPosX() + 2 * this.offSet);
    } else if (data[1] == 's') {
      Player.setPosY(Player.getPosY() + 2 * this.offSet);
    } else if (data[1] == 'd') {
      Player.setPosX(Player.getPosX() - 2 * this.offSet);
    }
    //this.server.emit('someoneMoved', data[1], Player);
  }
}

//reset5
