import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService,
  ) {}
  @WebSocketServer()
  server: Server;

  //@UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (data.channelName === '') {
      return;
    }
    await this.channelService.checkConnection(data, client);
    this.channelService.addMessage(data);
    this.server
      .to(data.channelName)
      .emit('message', data.content, data.username, data.avatar);
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
    let alreadyJoined = { value: false };
    await this.channelService.addMembership(data, alreadyJoined);
    const messageHistory = await this.channelService.getMessageHistory(
      data.channelName,
    );
    if (alreadyJoined.value) {
      console.log('You already joined this channel:', data.login);
      client.emit('notification', 'You already joined this channel');
    } else {
      client.join(data.channelName);
      if (messageHistory) {
        for (let i = 0; i < messageHistory.length; i++) {
          client.emit(
            'message',
            messageHistory[i].text,
            messageHistory[i].user.name,
          );
        }
      }
      this.server
        .to(data.channelName)
        .emit('user-joined', data.username, data.avatar);
    }
  }

  @SubscribeMessage('leave-channel')
  async leaveChannel(
    @MessageBody()
    data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.leave(data.channelName);
    await this.channelService.removeMembership(data);
    this.server.to(data.channelName).emit('user-left', data.username);
  }
}
