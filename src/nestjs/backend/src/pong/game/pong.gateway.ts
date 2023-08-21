import { GameService } from './services/game.service';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { PlayerService } from './services/player.service';
import { PongService } from './services/pong.service';
import { Req, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class PongGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly playerService: PlayerService,
    private readonly pongService: PongService,
    private readonly gameService: GameService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('connectGame')
  connect(@ConnectedSocket() socket: Socket, @Req() req: any) {
    this.playerService.connectGame(socket, req.user.login);
  }

  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(@ConnectedSocket() socket: Socket) {
    this.pongService.joinQueue(this.server, socket, 'normal');
  }

  @SubscribeMessage('joinCustomQueue')
  joinCustomQueue(@ConnectedSocket() socket: Socket) {
    this.pongService.joinQueue(this.server, socket, 'custom');
  }

  @SubscribeMessage('leftQueue')
  leftQueue(@ConnectedSocket() socket: Socket) {
    this.playerService.leftQueue(socket);
  }

  @SubscribeMessage('joinGameRoom')
  joinGameRoom(@ConnectedSocket() socket: Socket) {
    this.gameService.joinGameRoom(socket);
  }

  @SubscribeMessage('playerMovement')
  playerMovement(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dataKey: string,
  ) {
    this.pongService.playerMovement(
      this.server,
      socket,
      dataKey[0],
      dataKey[1],
    );
  }

  @SubscribeMessage('changePage')
  changePage(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(this.server, socket);
  }

  @SubscribeMessage('disconnecting')
  disconnecting(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(this.server, socket);
  }
}
