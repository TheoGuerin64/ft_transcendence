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

  Players: { id: number; posX: number; posY: number }[] = [];
  @SubscribeMessage('connection')
  connection(
    @MessageBody() data: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    const newPlayer = { id: Number(data), posX: 0, posY: 0 };
    this.Players.push(newPlayer);
    socket.emit('loadPlayers', this.Players);
    socket.broadcast.emit('newPlayerJoined', newPlayer);
  }

  @SubscribeMessage('unconnection')
  unconnection(
    @MessageBody() id: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.Players = this.Players.filter((element) => element.id != Number(id));
    socket.broadcast.emit('playerDisconnected', Number(id));
  }

  @SubscribeMessage('movement')
  movement(
    @MessageBody() data: { id: number; updatedX: number; updatedY: number },
  ): void {
    const index = this.Players.findIndex((element) => element.id === data[0]);
    if (index == -1) return;
    this.Players[index].posX += data[1];
    this.Players[index].posY += data[2];
    this.server.emit('someoneMoved', this.Players[index]);
  }
}
