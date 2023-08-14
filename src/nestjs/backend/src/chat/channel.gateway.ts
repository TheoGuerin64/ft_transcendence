import { ChannelService } from './channel.service';
import { MembershipService } from './membership.service';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(private readonly channelService: ChannelService) {}
  @WebSocketServer()
  server: Server;

  //@UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: any): Promise<void> {
    if (data.channelName === '') {
      return;
    }
    this.channelService.addMessage(data);
    this.server
      .to(data.channelName)
      .emit('message', data.message, data.userName);
  }
  //@UseGuards(JwtAuthGuard)
  @SubscribeMessage('join-channel')
  async joinChannel(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (data.channelName === '') {
      return;
    }
    this.channelService.addMembership(data);
    client.join(data.channelName);
    this.server
      .to(data.channelName)
      .emit('user-joined', data.userName, data.channelName);
  }

  @SubscribeMessage('leave-channel')
  async leaveChannel(
    @MessageBody()
    data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.leave(data.channelName);
    this.server
      .to(data.channelName)
      .emit('user-left', data.userName, data.channelName);
  }
}
