import { EventService } from './event.service';
import { Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class EventGateway {
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
    this.EventService.joinNormalQueue(login, socket);
  }

  @SubscribeMessage('movementPlayer')
  movementPlayer(
    @MessageBody() data: { login: string; keyCode: string },
  ): void {
    this.EventService.movementPlayer(data);
  }

  @SubscribeMessage('movementBall')
  async movementBall(@ConnectedSocket() socket: Socket): Promise<void> {
    await this.EventService.movementBall(socket);
  }
}
//reset8
