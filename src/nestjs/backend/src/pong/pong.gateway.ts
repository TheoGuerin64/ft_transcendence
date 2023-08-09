import { PongService } from './pong.service';
import { Server, Socket } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class PongGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly PongService: PongService) {}

  @SubscribeMessage('connectGame')
  connect(@ConnectedSocket() socket: Socket, @MessageBody() login: string) {
    this.PongService.connectGame(socket, login);
  }
  @SubscribeMessage('joinQueue')
  joinQueue(@MessageBody() login: string) {
    this.PongService.joinQueue(this.server, login);
  }
  @SubscribeMessage('joinGameRoom')
  joinGameRoom(@ConnectedSocket() socket: Socket) {
    this.PongService.joinGameRoom(socket);
  }

  @SubscribeMessage('playerMovement')
  playerMovement(
    @ConnectedSocket() socket: Socket,
    @MessageBody() keycode: string,
  ) {
    this.PongService.playerMovement(this.server, socket, keycode);
  }
}

//reset
