import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class EventGateway {
  @WebSocketServer()
  server: Server;

  Players: { login: string; socketID: string; posX: number; posY: number }[] =
    [];
  @SubscribeMessage('connection')
  connection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log('socket id on connect', socket.id);
    const newPlayer = {
      login: login,
      socketID: socket.id,
      posX: 0,
      posY: 0,
    };
    const index = this.Players.findIndex(
      (element) => element.login === newPlayer.login,
    );
    console.log(this.Players);
    if (index == -1) {
      this.Players.push(newPlayer);
      socket.emit('loadPlayers', this.Players);
      socket.broadcast.emit('newPlayerJoined', newPlayer);
    } else {
      socket.emit('alreadyConnect');
    }
  }

  @SubscribeMessage('disconnecting')
  disconnect(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log(this.Players);
    const index: number = this.Players.findIndex(
      (element) => element.socketID == socket.id,
    );
    const playerDisconnected = this.Players[index];
    this.Players = this.Players.filter(
      (element) => element.socketID != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', playerDisconnected.login);
  }

  @SubscribeMessage('disconnect')
  disconnect2(): void {
    console.log('disconnect2');
  }

  @SubscribeMessage('unconnection')
  unconnection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.Players = this.Players.filter(
      (element) => element.socketID != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', login);
  }

  @SubscribeMessage('movement')
  movement(
    @MessageBody() data: { login: string; updatedX: number; updatedY: number },
  ): void {
    const index = this.Players.findIndex(
      (element) => element.login === data[0],
    );
    if (index == -1) return;
    this.Players[index].posX += data[1];
    this.Players[index].posY += data[2];
    this.server.emit('someoneMoved', this.Players[index]);
  }
}

//reset13
