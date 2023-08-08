import { EventService } from './event.service';
import { Server, Socket } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class EventGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly EventService: EventService) {}
  @SubscribeMessage('connection')
  connection(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.EventService.connection(login, socket);
  }

  //refresh page => socket disconnect
  @SubscribeMessage('disconnecting')
  disconnectRefresh(@ConnectedSocket() socket: Socket): void {
    this.EventService.disconnectRefresh(socket);
  }

  //change page(ex : return home) => socket doesn't disconnect
  @SubscribeMessage('unconnection')
  disconnectReturnHome(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.EventService.disconnectReturnHome(login, socket);
  }

  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(
    @MessageBody() login: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.EventService.joinNormalQueue(login, socket, this.server);
  }

  @SubscribeMessage('movementPlayer')
  movementPlayer(
    @MessageBody() data: { login: string; keyCode: string; idGame: string },
  ): void {
    this.EventService.movementPlayer(data, this.server);
  }

  @SubscribeMessage('movementBall')
  async movementBall(
    @MessageBody() idGame: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    await this.EventService.movementBall(socket, this.server, idGame);
  }

  @SubscribeMessage('addToRoom')
  addToRoom(
    @MessageBody() idGame: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.EventService.addToRoom(socket, idGame);
  }
}
//reset
