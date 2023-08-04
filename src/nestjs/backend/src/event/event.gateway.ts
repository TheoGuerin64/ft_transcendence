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

  constructor(login: string, socketID: string) {
    this.login = login;
    this.socketID = socketID;
    this.posX = 0;
    this.posY = 0;
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
  setPosX(newPosX: number): void {
    this.posX = newPosX;
  }
  setPosY(newPosY: number): void {
    this.posY = newPosY;
  }
}

@WebSocketGateway({ cors: true })
export class EventGateway {
  @WebSocketServer()
  server: Server;

  Players: Player[] = [];
  PLayersInQueue: Player[] = [];
  Games: { gameID: string; playerOne: Player; playerTwo: Player }[] = [];

  @SubscribeMessage('connection')
  connection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const newPlayer = new Player(login, socket.id);
    const index = this.Players.findIndex(
      (element) => element.getLogin() === newPlayer.getLogin(),
    );
    if (index == -1) {
      this.Players.push(newPlayer);
      socket.emit('loadPlayers', this.Players);
      socket.broadcast.emit('newPlayerJoined', newPlayer);
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

  @SubscribeMessage('movement')
  movement(
    @MessageBody() data: { login: string; updatedX: number; updatedY: number },
  ): void {
    const index = this.Players.findIndex(
      (element) => element.getLogin() === data[0],
    );
    if (index == -1) return;
    this.Players[index].setPosX(this.Players[index].getPosX + data[1]);
    this.Players[index].setPosY(this.Players[index].getPosY + data[2]);
    this.server.emit('someoneMoved', this.Players[index]);
  }
}

//reset13
